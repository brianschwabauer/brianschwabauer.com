/**
 * Per-post OpenGraph card rendering.
 *
 * Lives in the image worker rather than the main site for the same reason the
 * container does: it drags ~2.6MB of WASM (resvg + yoga) behind it, and the
 * main worker's bundle shouldn't carry that to serve a blog page.
 *
 * Pipeline: satori lays the card out as flexbox and emits SVG, resvg
 * rasterizes it to PNG. Both are WASM, and Workers forbid compiling WASM at
 * runtime from raw bytes — so the modules are IMPORTED (wrangler turns those
 * into CompiledWasm) and handed to satori's `init` / resvg's `initWasm`.
 * Importing `satori` rather than `satori/standalone` pulls in a copy of yoga
 * that self-instantiates and dies with "Wasm code generation disallowed by
 * embedder"; the standalone entry point exists precisely so the host can
 * supply it.
 *
 * Fonts are .ttf, not the .woff2 the site serves: satori reads ttf/otf/woff,
 * and woff2 needs a brotli decoder it doesn't ship.
 */
import satori, { init as initYoga } from 'satori/standalone';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';
import yogaWasm from 'satori/yoga.wasm';
import nunitoBlack from '../../assets/fonts/nunito-sans-900.ttf';
import firaMedium from '../../assets/fonts/fira-code-500.ttf';
import brandmarkPng from '../../assets/brandmark-white.png';
import type { ImageEnv } from './routes';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/**
 * Where a rendered card lives in R2. Versioned so a post edit misses the cache.
 *
 * `.jpg` regardless of what the encode produced — the key names the slot, and
 * the object's own contentType is the authority on what is actually in it.
 */
export function ogCacheKey(slug: string, version: string): string {
	return `og/blog/${slug}-${version}.jpg`;
}

// Both WASM modules are process-wide and idempotent, but `init` is async and
// several requests can land before the first finishes — so cache the promise,
// not a boolean, or the second request races in on a half-initialized module.
let wasm_ready: Promise<unknown> | null = null;
function ensureWasm(): Promise<unknown> {
	if (!wasm_ready) {
		wasm_ready = Promise.all([
			initYoga(yogaWasm as WebAssembly.Module),
			initWasm(resvgWasm as WebAssembly.Module),
		]);
	}
	return wasm_ready;
}

// The brandmark ships as a pre-rasterized white PNG rather than inline SVG:
// satori would pass an SVG straight through for resvg to resolve as a nested
// image, which is the shakiest path through both libraries. A 1.5KB raster is
// not worth the risk. Encoded once per isolate, not per render.
let brandmark_uri: string | null = null;
function brandmarkDataUri(): string {
	if (!brandmark_uri) {
		brandmark_uri = `data:image/png;base64,${toBase64(new Uint8Array(brandmarkPng as ArrayBuffer))}`;
	}
	return brandmark_uri;
}

/** Base64 in chunks — spreading a whole image into String.fromCharCode blows the stack. */
function toBase64(bytes: Uint8Array): string {
	let binary = '';
	const CHUNK = 0x8000;
	for (let i = 0; i < bytes.length; i += CHUNK) {
		binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
	}
	return btoa(binary);
}

/**
 * Fetch a post's cover from R2 and re-encode it as JPEG.
 *
 * Covers are stored as AVIF, which neither satori nor resvg can decode (and
 * which no major scraper can render either — the reason this whole route
 * exists). The container already has vips, so it does the transcode; the
 * result is only ever held in memory, since the rendered card is what gets
 * cached.
 */
async function coverAsJpegDataUri(
	env: ImageEnv,
	cover_key: string,
): Promise<string | null> {
	const obj = await env.R2.get(cover_key);
	if (!obj) return null;
	const source = await obj.arrayBuffer();

	// Called on the DO directly rather than through processImage(), matching
	// uploadImage() — processImage forwards the R2 binding over RPC for
	// watermark fetching and R2 bindings aren't RPC-serializable.
	const stub = env.IMAGE_PROCESSOR.getByName('image-processor');
	const result = await stub.process(source, {
		variants: [
			{
				name: 'ogsource',
				// The card crops this to a 1200x630 window, so the long edge only
				// needs to cover the card's width.
				max_dimension: 1200,
				format: 'jpeg',
				quality: 82,
				fit: 'cover',
			},
		],
		compress_original: false,
	});

	const variant = result.variants.find((v: { name: string }) => v.name === 'ogsource');
	if (!variant) return null;
	return `data:image/jpeg;base64,${toBase64(new Uint8Array(variant.data))}`;
}

// ── Scrim ───────────────────────────────────────────────────────────────────
// The bottom-up wash that keeps the type legible over an arbitrary photo.
//
// A two- or three-stop ramp interpolates alpha linearly, which the eye reads
// as a grey band laid across the picture — the transition has a visible top
// edge. Easing the alpha in instead (alpha ∝ t^EXPONENT) keeps the upper half
// genuinely untouched, stays subtle through the middle, and does most of its
// darkening in the last third where the title actually sits.
//
// CSS interpolates linearly BETWEEN stops, so the curve has to be sampled:
// these stops are the curve, and dropping the count reintroduces the banding
// the exponent is there to avoid.
const SCRIM_START = 0.05; // fraction of height left completely clear
const SCRIM_MAX_ALPHA = 1;
const SCRIM_EXPONENT = 1.35; // >1 = slow start, hard finish
const SCRIM_STOPS = 14;

function scrimGradient(): string {
	const stops = ['rgba(6,6,10,0) 0%'];
	for (let i = 0; i <= SCRIM_STOPS; i++) {
		const t = i / SCRIM_STOPS;
		const position = SCRIM_START + (1 - SCRIM_START) * t;
		const alpha = SCRIM_MAX_ALPHA * Math.pow(t, SCRIM_EXPONENT);
		stops.push(`rgba(6,6,10,${alpha.toFixed(3)}) ${(position * 100).toFixed(1)}%`);
	}
	return `linear-gradient(180deg, ${stops.join(', ')})`;
}

// ── Grain ───────────────────────────────────────────────────────────────────
// A 240px tile of monochrome noise, tiled over the text-only card.
//
// Two jobs: it dithers the radial gradient, which otherwise bands across a
// large flat area at 8 bits per channel, and it gives the plain card some
// texture. feTurbulence emits RGB noise — three independent channels, which
// reads as colored speckle — so feColorMatrix desaturates it to luminance
// only, which is what film grain actually is.
//
// `stitchTiles="stitch"` makes the noise field wrap at the tile edge, so
// repeating it leaves no seam.
const NOISE_TILE_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
	'<filter id="n" x="0" y="0" width="100%" height="100%">' +
	'<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>' +
	'<feColorMatrix type="saturate" values="0"/>' +
	'</filter>' +
	'<rect width="240" height="240" filter="url(#n)"/>' +
	'</svg>';
const NOISE_OPACITY = 0.14;

let noise_uri: string | null = null;
function noiseDataUri(): string {
	if (!noise_uri) {
		const bytes = new TextEncoder().encode(NOISE_TILE_SVG);
		noise_uri = `data:image/svg+xml;base64,${toBase64(bytes)}`;
	}
	return noise_uri;
}

// ── Type ────────────────────────────────────────────────────────────────────

/** Widest the title is allowed to run before wrapping. */
const TITLE_MAX_WIDTH = 1020;

const FONTS = [
	{
		name: 'Nunito Sans',
		data: nunitoBlack as ArrayBuffer,
		weight: 900 as const,
		style: 'normal' as const,
	},
	{
		name: 'Fira Code',
		data: firaMedium as ArrayBuffer,
		weight: 500 as const,
		style: 'normal' as const,
	},
];

/**
 * Lay the title out at a given wrap width and report how many lines it took.
 *
 * satori has no measurement API, so this lays out for real and reads the
 * answer back out of the SVG. With `embedFont: false` it emits one <text> per
 * word carrying x/y/width from the actual font metrics; words on the same line
 * share a `y`, so the number of distinct `y` values IS the line count. (With
 * the default `embedFont: true` the text is already outlined into <path> and
 * this is no longer recoverable.)
 */
async function titleLineCount(title: string, font_size: number, wrap_width: number) {
	const svg = await satori(
		{
			type: 'div',
			props: {
				style: { display: 'flex', width: `${OG_WIDTH}px`, height: `${OG_HEIGHT}px` },
				children: [
					{
						type: 'div',
						props: { style: titleStyle(font_size, wrap_width), children: title },
					},
				],
			},
		},
		{ width: OG_WIDTH, height: OG_HEIGHT, fonts: FONTS, embedFont: false },
	);
	const rows = new Set<string>();
	for (const match of svg.matchAll(/<text\b[^>]*\by="([\d.]+)"/g)) rows.add(match[1]);
	return rows.size;
}

/**
 * The equivalent of `text-wrap: balance`, which neither satori nor yoga
 * implements.
 *
 * Greedy wrapping fills each line to the brim, so the last one is whatever is
 * left over — "A Post With No Cover Image At All" lands as 986px + 202px, a
 * five-word line above a one-word orphan. Balancing means finding the NARROWEST
 * wrap width that still produces the same number of lines: squeeze until one
 * more squeeze would cost an extra line, and the words redistribute evenly
 * (that example settles at 547px + 642px).
 *
 * Line count rises monotonically as the width shrinks, so the smallest width
 * holding the original count is a clean binary search. It costs one layout
 * pass per probe — cheap next to the container round-trip, and the result is
 * cached in R2 either way. Stops at an 8px band; tighter buys nothing visible.
 */
async function balancedWrapWidth(title: string, font_size: number): Promise<number> {
	try {
		const natural = await titleLineCount(title, font_size, TITLE_MAX_WIDTH);
		if (natural <= 1) return TITLE_MAX_WIDTH;

		let low = Math.ceil(TITLE_MAX_WIDTH / natural);
		let high = TITLE_MAX_WIDTH;
		while (high - low > 8) {
			const mid = Math.floor((low + high) / 2);
			if ((await titleLineCount(title, font_size, mid)) <= natural) high = mid;
			else low = mid + 1;
		}
		return high;
	} catch (err) {
		// Balancing is a nicety; a card with a ragged last line still shares
		// fine, so never let this fail the render.
		console.error('Title balancing failed, falling back to full width:', err);
		return TITLE_MAX_WIDTH;
	}
}

/** Shared by the measurement passes and the real render so line breaks match. */
function titleStyle(font_size: number, wrap_width: number) {
	return {
		fontFamily: 'Nunito Sans',
		fontSize: font_size,
		lineHeight: 1.1,
		letterSpacing: -1.5,
		color: '#ffffff',
		maxWidth: `${wrap_width}px`,
	};
}

/** Long titles get smaller type so the card never overflows its three lines. */
function titleFontSize(title: string): number {
	if (title.length > 68) return 52;
	if (title.length > 44) return 62;
	if (title.length > 26) return 72;
	return 82;
}

/** Hard character budget — satori has no reliable line-clamp, so clamp the input. */
function clampTitle(title: string): string {
	const LIMIT = 96;
	if (title.length <= LIMIT) return title;
	return `${title.slice(0, LIMIT - 1).trimEnd()}…`;
}

/** JPEG quality for the finished card. 92 keeps the grain without ringing. */
const OG_JPEG_QUALITY = 92;

export interface RenderedCard {
	data: Uint8Array;
	/** Whatever the encode actually produced — JPEG normally, PNG if it failed. */
	content_type: string;
}

export interface OgCardParams {
	title: string;
	/** Pre-formatted label, e.g. "NOVEMBER 2025". Empty string to omit. */
	date_label: string;
	/** R2 key of the cover's `default` variant, or null for a text-only card. */
	cover_key: string | null;
}

export async function renderOgCard(
	env: ImageEnv,
	params: OgCardParams,
): Promise<RenderedCard> {
	await ensureWasm();

	// A cover failure degrades to the text-only card rather than failing the
	// request — a plain card still shares correctly, and a 500 here would mean
	// no card at all. Logged because the degradation is otherwise invisible:
	// the card renders "fine", just without the image.
	const cover = params.cover_key
		? await coverAsJpegDataUri(env, params.cover_key).catch((err) => {
				console.error(`OG cover failed for ${params.cover_key}:`, err);
				return null;
			})
		: null;

	const title = clampTitle(params.title);

	// Layout: the cover fills the card, a bottom-up scrim keeps the type
	// legible over whatever it happens to be, and the text block sits in the
	// lower left. Without a cover the same block sits on the brand's near-black
	// with a teal wash, so both variants read as the same family.
	const children: unknown[] = [];

	if (cover) {
		children.push({
			type: 'img',
			props: {
				src: cover,
				style: {
					position: 'absolute',
					top: 0,
					left: 0,
					width: `${OG_WIDTH}px`,
					height: `${OG_HEIGHT}px`,
					objectFit: 'cover',
				},
			},
		});
	}

	// Scrim. Heavier without a cover would crush the teal wash, so it's tuned
	// per case rather than shared.
	children.push({
		type: 'div',
		props: {
			style: {
				position: 'absolute',
				top: 0,
				left: 0,
				width: `${OG_WIDTH}px`,
				height: `${OG_HEIGHT}px`,
				backgroundImage: cover
					? scrimGradient()
					: 'radial-gradient(circle at 78% 18%, rgba(0,180,160,0.28) 0%, rgba(6,6,10,.4) 82%)',
			},
		},
	});

	// Grain over the bare gradient only. A cover brings its own texture and its
	// own dithering, so it needs neither.
	if (!cover) {
		children.push({
			type: 'div',
			props: {
				style: {
					position: 'absolute',
					top: 0,
					left: 0,
					width: `${OG_WIDTH}px`,
					height: `${OG_HEIGHT}px`,
					backgroundImage: `url("${noiseDataUri()}")`,
					backgroundRepeat: 'repeat',
					opacity: NOISE_OPACITY,
				},
			},
		});
	}

	// The date lives in the footer row, not here — see below.
	const text_block: unknown[] = [];

	const font_size = titleFontSize(title);
	const wrap_width = await balancedWrapWidth(title, font_size);

	text_block.push({
		type: 'div',
		props: {
			style: {
				...titleStyle(font_size, wrap_width),
				// Carries the legibility the eased scrim deliberately gives up.
				// The curve keeps the photo bright through the middle, which is
				// exactly where the type starts — a tight shadow buys back the
				// contrast locally instead of darkening the whole picture to
				// protect a few hundred pixels of text.
				textShadow: cover ? '0 2px 14px rgba(6,6,10,0.7)' : 'none',
			},
			children: title,
		},
	});

	children.push({
		type: 'div',
		props: {
			style: {
				position: 'absolute',
				bottom: 0,
				left: 0,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'flex-end',
				// Bottom padding clears the footer rule below, which is
				// absolutely positioned and so contributes no layout height.
				padding: '0 48px 100px 48px',
				width: `${OG_WIDTH}px`,
			},
			children: text_block,
		},
	});

	// Footer: brandmark + wordmark on the left, date on the right, sharing one
	// baseline. Width is stated as OG_WIDTH minus the two 48px insets rather
	// than as full width with padding — yoga's box model makes the latter
	// ambiguous, and this way `space-between` pins the date exactly 48px from
	// the right edge.
	const FOOTER_INSET = 48;
	const footer: unknown[] = [
		{
			type: 'div',
			props: {
				style: { display: 'flex', alignItems: 'center' },
				children: [
					{
						type: 'img',
						props: {
							src: brandmarkDataUri(),
							width: 32,
							height: 30,
							style: { marginRight: 16, opacity: 0.62 },
						},
					},
					{
						type: 'div',
						props: {
							style: {
								fontFamily: 'Fira Code',
								fontSize: 21,
								letterSpacing: 1,
								color: 'rgba(255,255,255,0.62)',
							},
							children: 'brianschwabauer.com',
						},
					},
				],
			},
		},
	];

	if (params.date_label) {
		footer.push({
			type: 'div',
			props: {
				// Matches the wordmark exactly — same family, size and opacity —
				// so the two read as one line of chrome rather than two labels.
				// No letter-spacing: the tracked-out treatment belonged to the
				// old teal eyebrow, and it reads as emphasis this no longer wants.
				style: {
					fontFamily: 'Fira Code',
					fontSize: 21,
					color: 'rgba(255,255,255,0.62)',
				},
				children: params.date_label,
			},
		});
	}

	children.push({
		type: 'div',
		props: {
			style: {
				position: 'absolute',
				bottom: FOOTER_INSET,
				left: FOOTER_INSET,
				width: `${OG_WIDTH - FOOTER_INSET * 2}px`,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			},
			children: footer,
		},
	});

	const svg = await satori(
		{
			type: 'div',
			props: {
				style: {
					display: 'flex',
					position: 'relative',
					width: `${OG_WIDTH}px`,
					height: `${OG_HEIGHT}px`,
					// The cover variant sits on near-black because the photo
					// covers it anyway and the scrim resolves to that value. The
					// text-only card IS its background, so near-black reads as
					// flat and unlit — it gets a lifted slate that gives the teal
					// wash something to sit against.
					background: cover ? '#06060a' : '#151b23',
				},
				children,
			},
		},
		{
			width: OG_WIDTH,
			height: OG_HEIGHT,
			fonts: FONTS,
		},
	);

	const png = new Resvg(svg).render().asPng();

	// resvg only emits PNG, and PNG cannot compress the grain — random noise is
	// incompressible by construction, so the text-only card lands near 1MB.
	// Re-encoding to JPEG takes that to ~150KB with the grain intact. The
	// container is already in the request path for cover cards; text-only cards
	// pay one extra round-trip for a ~7x saving on every scraper fetch.
	const jpeg = await pngToJpeg(env, png).catch((err) => {
		console.error('OG card JPEG encode failed, serving PNG:', err);
		return null;
	});

	return jpeg
		? { data: jpeg, content_type: 'image/jpeg' }
		: { data: png, content_type: 'image/png' };
}

/** Re-encode the rendered card. Returns null if the container can't oblige. */
async function pngToJpeg(env: ImageEnv, png: Uint8Array): Promise<Uint8Array | null> {
	// Hand over a standalone ArrayBuffer: the view may be a window onto a larger
	// buffer, and the DO would otherwise receive the whole thing.
	const source = png.buffer.slice(
		png.byteOffset,
		png.byteOffset + png.byteLength,
	) as ArrayBuffer;

	const stub = env.IMAGE_PROCESSOR.getByName('image-processor');
	const result = await stub.process(source, {
		variants: [
			{
				name: 'ogcard',
				// The card is already exactly 1200x630 and 1200 is its long edge,
				// so `inside` re-encodes without resampling.
				max_dimension: OG_WIDTH,
				format: 'jpeg',
				quality: OG_JPEG_QUALITY,
				fit: 'inside',
			},
		],
		compress_original: false,
	});

	const variant = result.variants.find((v: { name: string }) => v.name === 'ogcard');
	return variant ? new Uint8Array(variant.data) : null;
}

/**
 * Cache-through entry point used by the worker route.
 *
 * A render costs a container round-trip plus two WASM passes, so the result is
 * written to R2 under a key that includes the post's version stamp. Editing a
 * post changes the stamp, which misses the cache and renders once more; the
 * old object is simply orphaned rather than deleted, since a scraper may still
 * be holding the previous URL.
 */
export async function serveOgCard(
	env: ImageEnv,
	params: OgCardParams & { slug: string; version: string },
): Promise<Response> {
	const key = ogCacheKey(params.slug, params.version);
	// Immutable is safe because the key is version-stamped.
	const CACHE_CONTROL = 'public, max-age=31536000, immutable';

	const cached = await env.R2.get(key);
	if (cached) {
		// Read the type back off the object rather than assuming: a card whose
		// JPEG encode failed was stored as PNG under this same key.
		return new Response(cached.body as unknown as BodyInit, {
			headers: {
				'Content-Type': cached.httpMetadata?.contentType ?? 'image/jpeg',
				'Cache-Control': CACHE_CONTROL,
			},
		});
	}

	const card = await renderOgCard(env, params);
	await env.R2.put(key, card.data, {
		httpMetadata: { contentType: card.content_type, cacheControl: CACHE_CONTROL },
	});
	return new Response(card.data as unknown as BodyInit, {
		headers: { 'Content-Type': card.content_type, 'Cache-Control': CACHE_CONTROL },
	});
}
