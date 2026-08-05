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
 * So, on coarse-pointer devices: every governed <img> whose src is in the
 * generated ANIMATED_CLIPS manifest is ranked by distance to the viewport
 * center, the nearest CAP keep playing, and the rest are FROZEN — their
 * current frame drawn onto an overlay canvas and the <img> flipped to
 * `visibility: hidden`, which stops Chromium advancing (and decoding) the
 * animation. Scrolling re-ranks, so clips take turns playing as they pass the
 * middle of the screen rather than all grinding together.
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

/** clips allowed to play simultaneously on a governed device */
const CAP = 10;
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

type Clip = {
	img: HTMLImageElement;
	frozen: HTMLCanvasElement | null;
};

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
	const cap = reduce ? 0 : CAP;

	const clips = new Map<HTMLImageElement, Clip>();

	function collect(node: Node) {
		if (!(node instanceof Element)) return;
		const imgs = node instanceof HTMLImageElement ? [node] : node.querySelectorAll('img');
		for (const img of imgs) {
			if (!clips.has(img) && isGovernable(img)) {
				clips.set(img, { img, frozen: null });
			}
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
		const near: { clip: Clip; dist: number }[] = [];
		for (const clip of clips.values()) {
			const img = clip.img;
			if (!img.isConnected) {
				clips.delete(img);
				continue;
			}
			const rect = img.getBoundingClientRect(); // hidden imgs keep their box
			if (
				rect.width < 1 ||
				rect.bottom < -margin ||
				rect.top > vh + margin ||
				rect.right < 0 ||
				rect.left > vw
			) {
				// Off screen: Chrome pauses it by itself — drop our overlay so the
				// frozen-frame canvases don't accumulate down the page.
				thaw(clip);
				continue;
			}
			near.push({ clip, dist: Math.abs((rect.top + rect.bottom) / 2 - center) });
		}
		near.sort((a, b) => a.dist - b.dist);
		for (let i = 0; i < near.length; i++) {
			if (i < cap) thaw(near[i].clip);
			else freeze(near[i].clip);
		}
	}

	let raf = 0;
	function schedule() {
		if (!raf) raf = requestAnimationFrame(pass);
	}
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	const interval = setInterval(schedule, TICK_MS);
	schedule();

	return {
		destroy() {
			mo.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			clearInterval(interval);
			if (raf) cancelAnimationFrame(raf);
			for (const clip of clips.values()) thaw(clip);
			clips.clear();
		},
	};
}
