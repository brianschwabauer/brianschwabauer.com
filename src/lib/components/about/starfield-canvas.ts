// Canvas painter for the hero starfield.
//
// WHY A CANVAS AT ALL. As DOM, every tile is its own composited layer: an
// image with a border-radius mask, a glow shadow and a 3D transform under
// perspective. The scroll-driven zoom changes every tile's on-screen scale at
// once, and the browser answers by re-rasterising up to 24 masked, shadowed
// layers mid-scroll — which is exactly the frame budget a low-end GPU does
// not have, and why the jank only shows when the scroll "zooms" the field.
// Painted into one canvas, a frame is 24 pre-baked sprites blitted with a
// transform and an alpha: no layers, no style recalc, no raster invalidation,
// no preserve-3d sorting. The DOM field stays in the markup for SSR first
// paint, reduced motion, the boom blast, and as the fallback this module's
// failure path returns to.
//
// WHAT IS BAKED VS. WHAT IS LIVE. Rounded corners, the teal glow and the drop
// shadow are baked into each sprite ONCE (they are the expensive-at-raster
// parts); position, scale, rotation and opacity are applied per frame (they
// are the free-at-composite parts). The bake uses a nominal tile width, so a
// tile's corner radius and glow thickness are within ±25% of the DOM's
// per-tile values — invisible on a moving 130px tile. The brightness ramp is
// live as a black overlay scaled by depth (universal, cheap); the saturation
// ramp is dropped — it only ever ran inside the fade-in window, under an
// opacity climbing out of 0, where it had nothing to show itself on.
// (ctx.filter would reproduce both exactly, but it is not supported in
// WebKit and is a per-draw cost everywhere else.)
//
// ANIMATED AVIFS. createImageBitmap only ever yields an animated image's
// first frame, so as first shipped the canvas froze every animated thumb the
// DOM field used to play. Where WebCodecs ImageDecoder exists (Chromium
// today; probed once by animatedAvifSupported), an animated sprite keeps its
// decoder and re-composes its own canvas in place at the file's frame
// timing. The shadows never change frame to frame, so they are baked once
// per tile shape as a PLATE shared by every sprite of that shape — a step is
// one plate blit plus one clipped cover-draw, and only sprites actually
// blitted this frame step at all: parked tiles freeze and decode nothing.
// Steps are also confined to frames the scroll is NOT sweeping (the caller's
// `step` flag): a frozen frame is invisible inside a zoom, so the scroll
// keeps its whole budget — which is why animation plays even under low-fx,
// where it costs only idle frames that carried 24 animating <img> layers in
// the DOM era anyway. Everywhere else — no ImageDecoder, any decode hiccup —
// the sprite is (or quietly becomes) the static first frame the canvas
// always had. Animation can never latch `failed`: losing motion must not
// cost the canvas.

/** the sprite cache key — a recycled image can return with a different tile
 *  ratio, so the ratio is part of the identity */
export function spriteKey(src: string, ar: number): string {
	return `${src}|${ar}`;
}

/** what the Hero's warp loop hands over, one per visible tile per frame */
export type TileFrame = {
	/** the tile's image and box ratio — together they name the sprite */
	src: string;
	ar: number;
	/** warp depth — only used by the caller to depth-sort before draw() */
	u: number;
	/** screen-space centre, CSS px */
	sx: number;
	sy: number;
	/** on-screen tile width, CSS px (perspective factor already applied) */
	w: number;
	/** in-plane rotation, radians */
	rot: number;
	/** 0–1, the tile's fade (× any intro ramp) */
	alpha: number;
	/** 0–0.3, the depth dimming (1 − brightness, floored at 0) */
	dim: number;
};

type SpriteAnim = {
	decoder: ImageDecoder;
	frame_count: number;
	/** index of the most recently requested frame — the one `next` holds */
	index: number;
	/** decoded and waiting to be shown, with its display time in ms */
	next: { frame: VideoFrame; dur: number } | null;
	/** when the frame currently composed into the sprite is up */
	next_at: number;
	decoding: boolean;
	/** a decode failed — freeze on the composed frame, forever and silently */
	failed: boolean;
};

type Sprite = {
	canvas: HTMLCanvasElement;
	/** the sprite's own 2d context — animation re-composes through it */
	ctx: CanvasRenderingContext2D;
	/** the baked shadow/glow under the image, shared per tile shape */
	plate: HTMLCanvasElement | null;
	/** tile box size in sprite px (excludes the shadow margin) */
	bw: number;
	bh: number;
	/** shadow margin in sprite px on every side */
	m: number;
	/** corner radius in sprite px */
	radius: number;
	/** LRU stamp — draw() refreshes it, evict() reads it */
	used: number;
	/** present only while an animated AVIF plays through this sprite */
	anim?: SpriteAnim;
};

/** tile box width every sprite is baked at */
const SPRITE_W = 512;
/** the star.w the baked shadows are nominal for (w ranges 1.1–1.9) */
const NOMINAL_W = 1.5;
/** sprite cache cap — 24 on screen + parked/recycled stragglers */
const MAX_SPRITES = 48;
// bake geometry — constant, because every sprite is baked at SPRITE_W:
// everything the DOM sized off --star-unit is sized off the nominal unit
// here: unit = tileWidth / star.w
const UNIT = SPRITE_W / NOMINAL_W;
const GLOW_BLUR = UNIT * 0.258;
const DROP_BLUR = UNIT * 0.242;
const DROP_Y = UNIT * 0.076;
const RADIUS = UNIT * 0.053;
const MARGIN = Math.ceil(Math.max(GLOW_BLUR, DROP_BLUR + DROP_Y) * 1.5);
/** floor for a frame's display time — a 0/absent duration in the file must
 *  not spin the decoder flat out */
const MIN_FRAME_MS = 20;

/** a VideoFrame's display time in ms (duration is µs, sometimes absent) */
function frameMs(f: VideoFrame): number {
	return Math.max(MIN_FRAME_MS, (f.duration ?? 0) / 1000 || 100);
}

// can this browser decode animated AVIF frames? Probed once per page —
// ImageDecoder is Chromium-only today, and everyone else takes the static
// first-frame path they were already on.
let anim_support: Promise<boolean> | undefined;
function animatedAvifSupported(): Promise<boolean> {
	anim_support ??=
		typeof ImageDecoder === 'undefined'
			? Promise.resolve(false)
			: ImageDecoder.isTypeSupported('image/avif').catch(() => false);
	return anim_support;
}

export class StarfieldPainter {
	private ctx: CanvasRenderingContext2D | null;
	private sprites = new Map<string, Sprite>();
	private pending = new Set<string>();
	/** shadow/glow plates by tile shape — 3 ratios × at most 2 glow states */
	private plates = new Map<string, HTMLCanvasElement | null>();
	private dpr = 1;
	private stamp = 0;
	/** bake glow into new sprites — Hero clears it under low-fx */
	glow = true;
	/** parked = the hero is off screen and every graphics resource is released.
	 *  Bumped generation lets in-flight bakes know their work is stale. */
	private parked = false;
	/** any fetch/decode failure latches this; Hero checks it before trusting us */
	failed = false;
	/** called on a failure AFTER activation, so Hero can fall back mid-flight */
	onFailure: (() => void) | undefined;

	constructor(
		private canvas: HTMLCanvasElement,
		private mediaBase: string,
	) {
		this.ctx = canvas.getContext('2d');
		if (!this.ctx) this.failed = true;
	}

	resize(cssW: number, cssH: number, dpr: number) {
		if (this.parked) return; // a resize while parked must not reallocate
		this.dpr = Math.min(dpr, 2); // >2× is invisible and quadruples fill cost
		const w = Math.max(1, Math.round(cssW * this.dpr));
		const h = Math.max(1, Math.round(cssH * this.dpr));
		if (this.canvas.width !== w) this.canvas.width = w;
		if (this.canvas.height !== h) this.canvas.height = h;
	}

	/** is this tile drawable right now? */
	has(src: string, ar: number): boolean {
		return this.sprites.has(spriteKey(src, ar));
	}

	/**
	 * Fetch + decode + bake, idempotent per src. The fetch is `cors` because a
	 * canvas fed a non-CORS image is tainted and unusable; the CDN allows the
	 * site origin. Any failure latches `failed` — the Hero never activates on
	 * a partial field, and deactivates if already live.
	 *
	 * THE RETRY IS THE LOAD-BEARING PART. The DOM field's plain <img> tiles
	 * usually reach the HTTP cache first, and a no-Origin request stores the
	 * response WITHOUT its CORS headers — so this fetch, hitting that entry,
	 * fails even though the CDN allows us, and one such failure used to
	 * disable the canvas for the whole session. `reload` bypasses the
	 * poisoned entry, goes to the network with an Origin, and overwrites the
	 * entry with a CORS-clean copy — healing the cache for next time too.
	 */
	request(src: string, ar: number) {
		const key = spriteKey(src, ar);
		if (this.failed || this.parked || this.sprites.has(key) || this.pending.has(key))
			return;
		this.pending.add(key);
		const load = (cache: RequestCache) =>
			fetch(this.mediaBase + src, { mode: 'cors', cache }).then((res) => {
				if (!res.ok) throw new Error(`${res.status}`);
				return res.blob();
			});
		load('default')
			.catch(() => load('reload'))
			.then((blob) => this.bakeBlob(src, ar, blob))
			.then(() => {
				this.pending.delete(key);
			})
			.catch(() => {
				this.pending.delete(key);
				this.failed = true;
				this.onFailure?.();
			});
	}

	/** decode + bake — animated where the browser and the file allow it, the
	 *  static single-frame bake everywhere else (and as the rescue path) */
	private async bakeBlob(src: string, ar: number, blob: Blob) {
		const key = spriteKey(src, ar);
		const is_avif = blob.type === 'image/avif' || /\.avif$/i.test(src);
		if (is_avif && (await animatedAvifSupported())) {
			try {
				await this.bakeAnimated(key, ar, blob);
				return;
			} catch {
				// any WebCodecs hiccup falls through to the static bake below —
				// losing animation must never latch `failed` and cost the canvas
			}
		}
		const bmp = await createImageBitmap(blob);
		if (!this.failed) this.bake(key, ar, bmp, bmp.width, bmp.height);
		bmp.close();
	}

	private async bakeAnimated(key: string, ar: number, blob: Blob) {
		const data = await blob.arrayBuffer();
		const decoder = new ImageDecoder({ data, type: blob.type || 'image/avif' });
		try {
			await decoder.tracks.ready;
			const track = decoder.tracks.selectedTrack;
			const frame_count = track?.animated ? track.frameCount : 1;
			const { image } = await decoder.decode({ frameIndex: 0 });
			const s = this.failed ? null : this.makeSprite(key, ar);
			if (!s) {
				image.close();
				decoder.close();
				return;
			}
			this.compose(s, image, image.displayWidth, image.displayHeight);
			const dur = frameMs(image);
			image.close();
			if (frame_count > 1) {
				// the decoder stays with the sprite; repetitionCount is ignored
				// on purpose — the thumbs are endless loops by design
				s.anim = {
					decoder,
					frame_count,
					index: 0,
					next: null,
					next_at: performance.now() + dur,
					decoding: false,
					failed: false,
				};
				this.decodeAhead(s.anim);
			} else {
				decoder.close();
			}
		} catch (e) {
			decoder.close();
			throw e;
		}
	}

	/** register an empty sprite canvas of this shape in the cache */
	private makeSprite(key: string, ar: number): Sprite | null {
		// A fetch that resolved after park() must not repopulate the cache the
		// park just emptied — bakeAnimated closes its decoder on a null sprite.
		if (this.parked) return null;
		// A re-request racing a stale in-flight bake can land the same key twice;
		// overwriting would leak the first sprite's decoder.
		const prev = this.sprites.get(key);
		if (prev) this.killAnim(prev);
		const bh = Math.round(SPRITE_W / ar);
		const c = document.createElement('canvas');
		c.width = SPRITE_W + 2 * MARGIN;
		c.height = bh + 2 * MARGIN;
		const ctx = c.getContext('2d');
		if (!ctx) return null;
		const s: Sprite = {
			canvas: c,
			ctx,
			plate: this.plate(bh),
			bw: SPRITE_W,
			bh,
			m: MARGIN,
			radius: RADIUS,
			used: this.stamp,
		};
		this.sprites.set(key, s);
		if (this.sprites.size > MAX_SPRITES) this.evict();
		return s;
	}

	private bake(key: string, ar: number, img: CanvasImageSource, iw: number, ih: number) {
		const s = this.makeSprite(key, ar);
		if (s) this.compose(s, img, iw, ih);
	}

	/**
	 * The baked shadow + glow that sits under every sprite of this shape. The
	 * image is drawn OVER the whole box region, so one plate serves every
	 * image — and every frame of an animated one, which is what makes a
	 * per-frame compose cheap: the blurs are painted once per shape, ever.
	 */
	private plate(bh: number): HTMLCanvasElement | null {
		const pkey = `${bh}|${this.glow ? 1 : 0}`;
		const hit = this.plates.get(pkey);
		if (hit !== undefined) return hit;
		const p = document.createElement('canvas');
		p.width = SPRITE_W + 2 * MARGIN;
		p.height = bh + 2 * MARGIN;
		const ctx = p.getContext('2d');
		if (!ctx) {
			this.plates.set(pkey, null);
			return null;
		}
		const box = (x: number, y: number) => {
			ctx.beginPath();
			if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, SPRITE_W, bh, RADIUS);
			else ctx.rect(x, y, SPRITE_W, bh);
		};
		// shadows via the offset trick — the shape is drawn far off-canvas and
		// only its shadow lands in frame, so no fill fringes the image edge
		const OFF = 10000;
		const shadow = (color: string, blur: number, dy: number) => {
			ctx.save();
			ctx.shadowColor = color;
			ctx.shadowBlur = blur;
			ctx.shadowOffsetX = OFF;
			ctx.shadowOffsetY = dy;
			box(MARGIN - OFF, MARGIN);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.restore();
		};
		shadow('rgba(0, 0, 0, 0.5)', DROP_BLUR, DROP_Y);
		if (this.glow) shadow('rgba(0, 244, 195, 0.22)', GLOW_BLUR, 0);
		this.plates.set(pkey, p);
		return p;
	}

	/** (re)paint a sprite: its plate, then the image cover-fit into the
	 *  rounded box. One blit + one clipped draw — cheap enough per animation
	 *  frame, and the static bake is simply this called once. */
	private compose(s: Sprite, img: CanvasImageSource, iw: number, ih: number) {
		const ctx = s.ctx;
		ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
		if (s.plate) ctx.drawImage(s.plate, 0, 0);
		ctx.save();
		ctx.beginPath();
		if (typeof ctx.roundRect === 'function')
			ctx.roundRect(MARGIN, MARGIN, s.bw, s.bh, RADIUS);
		else ctx.rect(MARGIN, MARGIN, s.bw, s.bh);
		ctx.clip();
		const scale = Math.max(s.bw / iw, s.bh / ih);
		const sw = s.bw / scale;
		const sh = s.bh / scale;
		ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, MARGIN, MARGIN, s.bw, s.bh);
		ctx.restore();
	}

	/** keep the NEXT frame decoded and waiting while the current one shows */
	private decodeAhead(a: SpriteAnim) {
		if (a.decoding || a.next || a.failed) return;
		a.decoding = true;
		a.index = (a.index + 1) % a.frame_count;
		a.decoder
			.decode({ frameIndex: a.index })
			.then(({ image }) => {
				a.decoding = false;
				if (a.failed) {
					// killAnim won the race — the decoder is gone, drop the frame
					image.close();
					return;
				}
				a.next = { frame: image, dur: frameMs(image) };
			})
			.catch(() => {
				a.decoding = false;
				a.failed = true;
			});
	}

	/** step a sprite's animation once its composed frame's time is up */
	private advance(s: Sprite, now: number) {
		const a = s.anim;
		if (!a || a.failed) return;
		if (!a.next) {
			this.decodeAhead(a); // belt and braces — normally already in flight
			return;
		}
		if (now < a.next_at) return;
		this.compose(s, a.next.frame, a.next.frame.displayWidth, a.next.frame.displayHeight);
		const dur = a.next.dur;
		a.next.frame.close();
		a.next = null;
		// from now, not next_at: after a stall (off screen, a slow decode) the
		// loop plays on at its natural rate instead of racing to catch up
		a.next_at = now + dur;
		this.decodeAhead(a);
	}

	/** stop and release a sprite's animation machinery */
	private killAnim(s: Sprite) {
		const a = s.anim;
		if (!a) return;
		a.failed = true; // a decode resolving after this must drop its frame
		a.next?.frame.close();
		a.next = null;
		try {
			a.decoder.close();
		} catch {
			// already closed
		}
		s.anim = undefined;
	}

	private evict() {
		let oldest: string | null = null;
		let oldestUsed = Infinity;
		for (const [key, s] of this.sprites) {
			if (s.used < oldestUsed) {
				oldestUsed = s.used;
				oldest = key;
			}
		}
		if (oldest) {
			const s = this.sprites.get(oldest);
			if (s) this.killAnim(s);
			this.sprites.delete(oldest);
		}
	}

	/** one frame — `frames` already depth-sorted far→near by the caller, `now`
	 *  is the caller's rAF timestamp (drives the animated sprites), and
	 *  `step` is false on frames the scroll is sweeping, so animation cedes
	 *  its compose cost to the zoom (where a held frame cannot be seen) */
	draw(frames: TileFrame[], now: number, step = true) {
		const ctx = this.ctx;
		if (!ctx) return;
		this.stamp++;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const f of frames) {
			const s = this.sprites.get(spriteKey(f.src, f.ar));
			if (!s || f.alpha <= 0) continue;
			s.used = this.stamp;
			const k = f.w / s.bw; // sprite px → CSS px at this tile's screen size
			ctx.setTransform(this.dpr, 0, 0, this.dpr, f.sx * this.dpr, f.sy * this.dpr);
			ctx.rotate(f.rot);
			ctx.globalAlpha = f.alpha;
			ctx.drawImage(
				s.canvas,
				-(s.bw / 2 + s.m) * k,
				-(s.bh / 2 + s.m) * k,
				(s.bw + 2 * s.m) * k,
				(s.bh + 2 * s.m) * k,
			);
			if (f.dim > 0.02) {
				// the depth dimming: a black wash over the tile box only (the
				// glow margin stays undimmed — at these depths it is faint
				// anyway), weighted by the tile's own alpha so a fading tile
				// cannot cast a dark rectangle onto whatever is behind it
				ctx.globalAlpha = f.alpha * f.dim;
				ctx.fillStyle = '#000';
				ctx.beginPath();
				if (typeof ctx.roundRect === 'function') {
					ctx.roundRect(
						(-s.bw / 2) * k,
						(-s.bh / 2) * k,
						s.bw * k,
						s.bh * k,
						s.radius * k,
					);
				} else {
					ctx.rect((-s.bw / 2) * k, (-s.bh / 2) * k, s.bw * k, s.bh * k);
				}
				ctx.fill();
			}
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = 1;
		// step the animated sprites that were actually on screen this frame —
		// parked and occluded ones sit frozen and cost no decodes at all
		if (step) {
			for (const s of this.sprites.values()) {
				if (s.anim && s.used === this.stamp) this.advance(s, now);
			}
		}
	}

	clear() {
		const ctx = this.ctx;
		if (!ctx) return;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * Release every graphics resource while the hero is off screen: the sprite
	 * cache (up to 48 × ~2 MB canvases), the shadow plates, every open
	 * ImageDecoder + pre-decoded VideoFrame, and the backing store itself. On a
	 * phone this is on the order of 100 MB of GPU memory that was previously
	 * held for the rest of the page — enough to push Chrome's renderer into
	 * dropping tiles for the sections actually on screen.
	 *
	 * unpark() + re-request() rebuilds everything; the fetches come out of the
	 * HTTP cache, and the DOM field carries the hero until the bakes land —
	 * the same handover the initial load already performs.
	 */
	park() {
		if (this.parked) return;
		this.parked = true;
		for (const s of this.sprites.values()) this.killAnim(s);
		this.sprites.clear();
		this.plates.clear();
		this.pending.clear();
		this.canvas.width = 0;
		this.canvas.height = 0;
	}

	/** ready to bake again — the caller re-requests srcs and re-resizes */
	unpark() {
		this.parked = false;
	}

	dispose() {
		for (const s of this.sprites.values()) this.killAnim(s);
		this.sprites.clear();
		this.pending.clear();
		this.plates.clear();
		this.onFailure = undefined;
	}
}
