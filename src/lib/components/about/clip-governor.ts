/**
 * Caps how many animated AVIF clips play at once.
 *
 * Animated AVIF has no hardware decode path — every playing clip is a dav1d
 * software decode per frame — and this page can put half a dozen clips in one
 * phone viewport (galleries, film reels). Chrome already pauses clips that are
 * off screen; what it will not do is triage the ones that are ON screen, and
 * on a mid-range phone two or three of them saturate the decode budget and
 * the whole viewport's framerate drops.
 *
 * So, on coarse-pointer devices, clips are ranked by distance to the viewport
 * center and only the nearest few play, per pipeline:
 *
 * - `<img>` clips (animated AVIF) beyond IMG_CAP are FROZEN — their current
 *   frame drawn onto an overlay canvas and the <img> flipped to
 *   `visibility: hidden`, which stops Chromium advancing (and decoding) the
 *   animation.
 * - `<video data-clip>` clips (the AV1 mp4 twins, hardware-decoded) and the
 *   Gallery's `.thumbnail-video` tiles (the same mp4s as looping grid
 *   thumbnails) beyond VIDEO_CAP are simply paused — a paused video keeps its
 *   frame on screen for free — and off-screen ones are paused too, since a
 *   playing video holds a scarce Android decoder session even when unseen.
 *   Off-screen long enough (RELEASE_MS) and the pipeline is torn down entirely
 *   — src removed, buffer and decoder freed — and re-armed on return. The
 *   governor also owns clip *startup* on governed devices: LazyMedia flags a
 *   near clip with `data-clip-near` instead of playing it, and only ranking
 *   winners are promoted to fetch/play, so a clip-dense gallery scrolling in
 *   opens a handful of media pipelines instead of one per clip.
 *
 * Scrolling re-ranks, so clips take turns playing as they pass the middle of
 * the screen rather than all grinding together.
 *
 * Under `prefers-reduced-motion` the cap is zero on every device — these are
 * infinite loops with no pause control, which is exactly what that setting
 * asks us not to autoplay.
 *
 * The overlay draw is allowed on a tainted canvas (cross-origin CDN images
 * taint it, but only readback is blocked, not display), so no crossorigin
 * attribute — and no cache double-fetch — is needed.
 *
 * The hero is excluded: its warp tiles are starfield thumbs whose visibility
 * the warp loop owns, and the canvas painter already does its own frame
 * stepping and triage.
 */
import { ANIMATED_CLIPS } from './animated-clips';

/**
 * Playing caps, per decode pipeline. `<img>` clips (animated AVIF — gallery
 * grid tiles, and every clip on browsers without AV1 video) are per-frame
 * SOFTWARE decodes, so their budget is small. `<video data-clip>` clips ride
 * the AV1 hardware decoder, but Android caps concurrent MediaCodec sessions
 * (typically ~6–8) — past that, decoders fail or silently fall back to
 * software, so the video cap stays under it.
 */
const IMG_CAP = 3;
const VIDEO_CAP = 5;
/** how far past the viewport a clip still counts as "on screen" — matches the
 *  margin Chrome itself keeps animating within, so freezes happen just out of
 *  sight and a clip scrolling in is already resolved one way or the other */
const NEAR = 0.25;
/** ranking cadence. Scrolls schedule an immediate pass (rAF-throttled); the
 *  interval only exists for movement without scroll events — the film-reel
 *  marquees carry clips across the screen on their own. */
const TICK_MS = 600;
/** frozen-frame overlay resolution — these are background clips, and every
 *  overlay is retained memory while frozen */
const FROZEN_DPR_CAP = 1.5;
/**
 * How long a clip video stays off screen before its media resources are torn
 * down. Pausing stops the *decode*, but a paused video keeps its buffered data
 * and (on Android) often its MediaCodec session — so a fling down the page
 * accumulates a dozen live media pipelines even with every one of them paused,
 * and the GPU pressure that builds is what breaks raster elsewhere on screen
 * (year-mark fills, images). Long enough that ordinary back-and-forth
 * scrolling never churns a release/refetch cycle.
 */
const RELEASE_MS = 2000;

type Clip = {
	img: HTMLImageElement;
	frozen: HTMLCanvasElement | null;
};

type VideoState = {
	/** performance.now() when the video left the screen; 0 while on screen */
	offscreen_since: number;
};

/**
 * Set while a governor is attached. LazyMedia consults this: on governed
 * devices it does not start clips itself — it flags them near
 * (`data-clip-near`) and the governor's next ranking pass promotes the winners,
 * so a 13-clip gallery scrolling in doesn't open 13 media pipelines at once.
 */
let schedule_pass: (() => void) | null = null;

export function governorActive(): boolean {
	return schedule_pass !== null;
}

/** Ask the attached governor (if any) for a ranking pass on the next frame. */
export function scheduleGovernorPass(): void {
	schedule_pass?.();
}

/** pause/play IS the freeze for the video pipeline — a paused <video> holds
 *  its frame on screen at zero decode cost */
function pauseVideo(el: HTMLVideoElement) {
	if (!el.paused) el.pause();
}
function playVideo(el: HTMLVideoElement) {
	// Re-arm a released clip: the src comes back and the fetch restarts. These
	// are decorative loops, so the playback position is not restored.
	if (el.dataset.clipSrc && !el.getAttribute('src')) {
		el.src = el.dataset.clipSrc;
		delete el.dataset.clipSrc;
	}
	if (el.preload === 'none') {
		// Never force a fetch on a clip that hasn't come near the viewport:
		// `data-clip-near` is LazyMedia's signal that it has. Without it, the
		// clip keeps costing nothing.
		if (el.dataset.clipNear === undefined) return;
		el.preload = 'auto';
	}
	el.muted = true;
	if (el.paused) el.play().catch(() => {});
}
/**
 * Tear down an off-screen clip's media pipeline entirely. `removeAttribute`
 * rather than `src = ''` — an empty src is a load *error* (which would trip
 * LazyMedia's fallback-to-<img> path), an absent one is merely "no resource".
 */
function releaseVideo(el: HTMLVideoElement) {
	const src = el.getAttribute('src');
	if (!src) return;
	pauseVideo(el);
	el.dataset.clipSrc = src;
	el.removeAttribute('src');
	el.load();
}

function clipName(src: string): string {
	return decodeURIComponent(src.split('/').pop() ?? '').split('?')[0];
}

function isGovernable(img: HTMLImageElement): boolean {
	return ANIMATED_CLIPS.has(clipName(img.src)) && !img.closest('#hero');
}

function freeze(clip: Clip) {
	const img = clip.img;
	if (clip.frozen) return;
	// Not decodable yet — the next pass gets it once pixels exist.
	if (!img.complete || img.naturalWidth === 0) return;
	const parent = img.parentElement;
	if (!parent) return;
	const rect = img.getBoundingClientRect();
	if (rect.width < 1 || rect.height < 1) return;

	const dpr = Math.min(window.devicePixelRatio || 1, FROZEN_DPR_CAP);
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(rect.width * dpr));
	canvas.height = Math.max(1, Math.round(rect.height * dpr));
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	// Replicate the img's own object-fit so the frozen frame lands on exactly
	// the pixels the live clip showed. (object-position other than the default
	// center is not used on this page.)
	const style = getComputedStyle(img);
	const iw = img.naturalWidth;
	const ih = img.naturalHeight;
	const fit = style.objectFit;
	if (fit === 'cover') {
		// crop the source to the box's shape, centered
		const scale = Math.max(rect.width / iw, rect.height / ih);
		const sw = rect.width / scale;
		const sh = rect.height / scale;
		ctx.drawImage(
			img,
			(iw - sw) / 2,
			(ih - sh) / 2,
			sw,
			sh,
			0,
			0,
			canvas.width,
			canvas.height,
		);
	} else if (fit === 'contain') {
		// letterboxed: draw the whole image centered, leave the rest clear
		const scale = Math.min(rect.width / iw, rect.height / ih);
		const dw = iw * scale * dpr;
		const dh = ih * scale * dpr;
		ctx.drawImage(img, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
	} else {
		// fill (the default) — stretch to the box
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	}

	// Overlay the frame where the img sits. The canvas positions against the
	// nearest positioned ancestor, so make the direct parent that ancestor —
	// a bare `position: relative` on an unpositioned wrapper is inert.
	if (getComputedStyle(parent).position === 'static') {
		parent.style.position = 'relative';
	}
	const parentRect = parent.getBoundingClientRect();
	canvas.style.position = 'absolute';
	canvas.style.left = `${rect.left - parentRect.left}px`;
	canvas.style.top = `${rect.top - parentRect.top}px`;
	canvas.style.width = `${rect.width}px`;
	canvas.style.height = `${rect.height}px`;
	canvas.style.pointerEvents = 'none';
	canvas.style.borderRadius = style.borderRadius;
	canvas.setAttribute('aria-hidden', 'true');
	img.after(canvas);
	// Hidden means unpainted, and Chromium only advances (and decodes) animated
	// images that paint — this is the actual pause.
	img.style.visibility = 'hidden';
	clip.frozen = canvas;
}

function thaw(clip: Clip) {
	if (!clip.frozen) return;
	clip.frozen.remove();
	clip.frozen = null;
	clip.img.style.visibility = '';
}

/**
 * Svelte action for the page root. No-op on fine-pointer devices unless the
 * visitor prefers reduced motion.
 */
export function governClips(root: HTMLElement) {
	if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return;
	const coarse = matchMedia('(pointer: coarse), (max-width: 767px)').matches;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!coarse && !reduce) return;
	const img_cap = reduce ? 0 : IMG_CAP;
	const video_cap = reduce ? 0 : VIDEO_CAP;

	const clips = new Map<HTMLImageElement, Clip>();
	const videos = new Map<HTMLVideoElement, VideoState>();

	function collect(node: Node) {
		if (!(node instanceof Element)) return;
		const imgs = node instanceof HTMLImageElement ? [node] : node.querySelectorAll('img');
		for (const img of imgs) {
			if (!clips.has(img) && isGovernable(img)) {
				clips.set(img, { img, frozen: null });
			}
		}
		// `.thumbnail-video` is the delightstack Gallery's looping tile video —
		// this page only feeds those tiles clip mp4s, so they're governed too.
		const isClipVideo = (el: HTMLVideoElement) =>
			el.hasAttribute('data-clip') || el.classList.contains('thumbnail-video');
		const vids =
			node instanceof HTMLVideoElement
				? isClipVideo(node)
					? [node]
					: []
				: node.querySelectorAll<HTMLVideoElement>(
						'video[data-clip], video.thumbnail-video',
					);
		for (const vid of vids) {
			if (!videos.has(vid)) videos.set(vid, { offscreen_since: 0 });
		}
	}
	collect(root);
	const mo = new MutationObserver((records) => {
		for (const r of records) r.addedNodes.forEach(collect);
		schedule();
	});
	mo.observe(root, { childList: true, subtree: true });

	function pass() {
		raf = 0;
		const vh = window.innerHeight;
		const vw = window.innerWidth;
		const margin = vh * NEAR;
		const center = vh / 2;
		const offscreen = (rect: DOMRect) =>
			rect.width < 1 ||
			rect.bottom < -margin ||
			rect.top > vh + margin ||
			rect.right < 0 ||
			rect.left > vw;

		const near_imgs: { clip: Clip; dist: number }[] = [];
		for (const clip of clips.values()) {
			const img = clip.img;
			if (!img.isConnected) {
				clips.delete(img);
				continue;
			}
			const rect = img.getBoundingClientRect(); // hidden imgs keep their box
			if (offscreen(rect)) {
				// Off screen: Chrome pauses it by itself — drop our overlay so the
				// frozen-frame canvases don't accumulate down the page.
				thaw(clip);
				continue;
			}
			near_imgs.push({ clip, dist: Math.abs((rect.top + rect.bottom) / 2 - center) });
		}
		near_imgs.sort((a, b) => a.dist - b.dist);
		for (let i = 0; i < near_imgs.length; i++) {
			if (i < img_cap) thaw(near_imgs[i].clip);
			else freeze(near_imgs[i].clip);
		}

		const now = performance.now();
		const near_vids: { el: HTMLVideoElement; dist: number }[] = [];
		for (const [el, state] of videos) {
			if (!el.isConnected) {
				videos.delete(el);
				continue;
			}
			const rect = el.getBoundingClientRect();
			if (offscreen(rect)) {
				// An off-screen playing video still holds a decoder session — and a
				// paused one still holds its buffer. Pause now, release once it has
				// been gone long enough that this isn't scroll jitter.
				pauseVideo(el);
				if (!state.offscreen_since) state.offscreen_since = now;
				else if (now - state.offscreen_since > RELEASE_MS) releaseVideo(el);
				continue;
			}
			state.offscreen_since = 0;
			near_vids.push({ el, dist: Math.abs((rect.top + rect.bottom) / 2 - center) });
		}
		near_vids.sort((a, b) => a.dist - b.dist);
		for (let i = 0; i < near_vids.length; i++) {
			const el = near_vids[i].el;
			if (i < video_cap) {
				playVideo(el);
			} else {
				// Over the cap but on screen: paused, yet it must still show a
				// frame. A clip that was released while off screen has no src and
				// so no frame — give the src back (still paused) so the first frame
				// returns; and a flagged-near clip that never won a slot still gets
				// to fetch so its box isn't empty, it just doesn't get to loop.
				if (el.dataset.clipSrc && !el.getAttribute('src')) {
					el.src = el.dataset.clipSrc;
					delete el.dataset.clipSrc;
				}
				if (el.preload === 'none' && el.dataset.clipNear !== undefined) {
					el.preload = 'auto';
				}
				pauseVideo(el);
			}
		}
	}

	let raf = 0;
	function schedule() {
		if (!raf) raf = requestAnimationFrame(pass);
	}
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	const interval = setInterval(schedule, TICK_MS);
	schedule_pass = schedule;
	schedule();

	return {
		destroy() {
			schedule_pass = null;
			mo.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			clearInterval(interval);
			if (raf) cancelAnimationFrame(raf);
			for (const clip of clips.values()) thaw(clip);
			clips.clear();
			// Hand every released video its src back — nothing else knows it's gone.
			for (const el of videos.keys()) {
				if (el.dataset.clipSrc && !el.getAttribute('src')) {
					el.src = el.dataset.clipSrc;
					delete el.dataset.clipSrc;
				}
			}
			videos.clear();
		},
	};
}
