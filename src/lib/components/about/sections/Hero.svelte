<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { ripple } from '@delightstack/utilities';
	import { Button } from '@delightstack/components/actions';
	import { Form, Input } from '@delightstack/components/form';
	import { Expand } from '@delightstack/components/display';
	import { Callout } from '@delightstack/components/feedback';
	import { createStarField, STAR_COUNT, type Star } from '../starfield-core';
	import type { SeededField } from '../starfield-build';
	import type { StarfieldPainter, TileFrame } from '../starfield-canvas';
	// The mascot and the explosion are the two heaviest artifacts on the page
	// (HeroMascot alone is ~120KB of CSS + a 170-node SVG rig) and neither is
	// visible until the button is pushed — so neither ships in the initial
	// chunk. They are dynamically imported: warmed during idle time / on first
	// hover, and awaited by startDestruction() before the show begins.
	import type HeroMascotType from './HeroMascot.svelte';
	import type HeroExplosionType from './HeroExplosion.svelte';

	// Both of these come from the server, and for the same reason: the seeded
	// starfield has to be built from identical inputs on the server and on the
	// client or the field rebuilds itself somewhere else at hydration. `isMobile`
	// (User-Agent) picks the anchor exclusion zone for click-conjured tiles, and
	// `field` IS the seeded opening field — built in +page.server.ts (see
	// starfield-build.ts) and shipped in the load data, so the client hydrates
	// from the finished stars without ever downloading the 503-name pool.
	let {
		isMobile = false,
		field,
		// overridable so the standalone dev harness can proxy the images through
		// its own origin (the CDN's CORS allowlist covers only the production
		// origin, and the canvas painter needs CORS-clean pixels)
		mediaBase = 'https://cdn.brianschwabauer.com/media/',
	}: { isMobile?: boolean; field: SeededField; mediaBase?: string } = $props();

	// ---- starfield ---------------------------------------------------------
	// A 3D "warp" field of past-work thumbnails. A fixed seed renders the whole
	// field into the SSR HTML, so it is present the instant the page paints.
	// From then on one rAF loop drives every tile — and only runs while the
	// hero is on screen.
	//
	// Each tile rides a warp position u: 0 = deep space (small, faded in), 1 =
	// swept past the camera (faded out). Idle, every tile drifts u forward at
	// its own gentle pace and recycles with fresh work. Scrolling advances
	// *every* tile's u in lockstep — a real zoom-through: scrolling down sweeps
	// tiles out and leaves them gone, so the field empties across the pin;
	// scrolling up flows tiles on and also draws drained tiles back in from
	// deep space, so fresh work zooms toward you. (STAR_COUNT lives in
	// starfield-core.ts now, alongside the rest of the star-making machinery.)

	// ---- the easter egg -----------------------------------------------------
	// Clicking anywhere in the field strikes another tile at that spot. The cap
	// is what keeps a bored visitor from compositing three hundred images.
	const MAX_STARS = STAR_COUNT + 36;
	/** seconds a clicked tile takes to cross the tunnel — roughly a quarter of a
	 *  seeded one's 15–28s, so the click reads as cause and the tile as effect */
	const SPAWN_DRIFT = 4.5;
	/** how long the tile takes to swell out of the clicked pixel */
	const INTRO_MS = 300;
	/** ease-out-back: overshoots 1 and settles, so the tile arrives with weight
	 *  instead of easing politely into existence */
	function easeOutBack(t: number) {
		const c = 1.9;
		const p = t - 1;
		return 1 + (c + 1) * p * p * p + c * p * p;
	}

	// How long the down-scroll keeps the field stocked — extra tiles cycled
	// through on top of STAR_COUNT. It stretches the drain: the field thins
	// from full to empty over (1 + SCROLL_EXTRA / STAR_COUNT) pin-lengths of
	// scroll. 0 = empties exactly at the end of the pin; higher = it keeps
	// streaming well past the pin (it never fully empties before you scroll
	// the hero off screen). Tune to taste.
	const SCROLL_EXTRA = 50;
	const DRAIN_REACH = 1 + SCROLL_EXTRA / STAR_COUNT;

	// Hero content (badge, headline, copy, CTA) departure. The column travels up at
	// exactly the scroll's own rate — 1px scrolled, 1px up — so the pin never reads
	// as the page having seized up while the starfield plays. It leaves as one rigid
	// block: any per-item rate is a different claim about how fast you are
	// scrolling, and two of those on screen at once is what makes a pin feel stuck.
	// The stagger lives entirely in the fade, which costs nothing in believability.
	const FADE_STAGGER = 0.12; // scroll-progress offset between items
	const FADE_SPAN = 0.5; // scroll-progress each item takes to fade out

	// the warp tunnel in px of translateZ. Z_NEAR stays well inside the
	// `perspective` distance so a tile never reaches the projection
	// singularity (where scale blows up to infinity).
	const Z_FAR = -260;
	const Z_NEAR = 320;

	/**
	 * THE ONE DEPTH THAT IS HONEST ABOUT WHERE IT IS.
	 *
	 * A tile's anchor is a percentage of the field, but what you SEE is that
	 * anchor run through the perspective projection: the screen offset from the
	 * vanishing point is the layout offset times p/(p − z). Deep in the tunnel
	 * (z = −260, p = 448) that factor is 0.63, so a tile anchored under the
	 * cursor paints a third of the way back toward the middle of the screen —
	 * which is why a clicked tile used to appear to land somewhere other than
	 * where it was clicked, and why the error grew toward the edges.
	 *
	 * At z = 0 the factor is exactly 1. Spawning there is the only depth at
	 * which the anchor and the pixel are the same point, so a clicked tile is
	 * struck exactly under the cursor and everything after that — swelling,
	 * sweeping outward past the camera — radiates from that pixel.
	 */
	const U_SPAWN = -Z_FAR / (Z_NEAR - Z_FAR); // z(U_SPAWN) === 0

	// Centre exclusion half-extents (% from centre) for CLICK-CONJURED tiles —
	// the seeded field's own buffers live in starfield-build.ts and MUST match
	// these. Off the server `isMobile` flag for the same server/client-identity
	// reason as ever.
	let anchorBufX = 23;
	let anchorBufY = 34;
	// a one-time read by design — isMobile is fixed for the page's lifetime
	// svelte-ignore state_referenced_locally
	if (isMobile) {
		anchorBufX = 38;
		anchorBufY = 36;
	}

	// The client's star factory: conjures clicked tiles and re-deals recycled
	// ones. It starts with only the names the server dealt (a tile recycled in
	// the first seconds re-shows one of those — invisible in practice, the
	// recycle window is at opacity ~0) and swaps in the full 503-name pool once
	// its lazy chunk arrives; see the idle load in onMount below.
	// svelte-ignore state_referenced_locally
	const starFieldFactory = createStarField(
		field.stars.map((s) => s.src),
		anchorBufX,
		anchorBufY,
		field.stars.length,
	);
	const makeStar = starFieldFactory.makeStar;

	// The look of a tile at warp position u — a pure function, so the server,
	// the hydrated first paint and the rAF loop all agree exactly. u rides
	// from 0 (deep space, small + faded) to 1 (swept past the camera, faded
	// out again); outside that range the tile is invisible.
	//
	// Opacity and filter are QUANTIZED (opacity to 0.02, filter to fstep) so a
	// slow drift produces the same string for many frames in a row — the paint
	// loop compares before writing, and an unchanged string is a write (and any
	// repaint it drags along) that never happens. A 2% opacity step and a 5%
	// saturation step are both below what a moving tile can show. Transform is
	// exempt: it genuinely changes every frame, and it is the one property the
	// compositor handles without repainting.
	function starVisual(u: number, rot: number, fstep = 0.05) {
		const z = Z_FAR + u * (Z_NEAR - Z_FAR);
		const fadeIn = Math.min(1, Math.max(0, u / 0.12));
		const fadeOut = Math.min(1, Math.max(0, (1 - u) / 0.28));
		const vis = u <= 0 || u >= 1 ? 0 : Math.min(fadeIn, fadeOut);
		const sat = 0.45 + 0.65 * fadeIn;
		const bright = 0.7 + 0.55 * u;
		const q = (v: number) => (Math.round(v / fstep) * fstep).toFixed(2);
		return {
			transform: `translate(-50%, -50%) translateZ(${z.toFixed(1)}px) rotate(${rot}deg)`,
			opacity: (Math.round(0.9 * vis * 50) / 50).toFixed(3),
			filter: `saturate(${q(sat)}) brightness(${q(bright)})`,
		};
	}

	// The seeded opening field, built server-side and carried over in the load
	// data — an identical field on server and client by construction. Cloned
	// before use: the warp loop mutates stars in place (swapContent), and load
	// data is not ours to mutate.
	// a one-time read by design — the field is fixed for the page's lifetime
	// svelte-ignore state_referenced_locally
	const seededStars: Star[] = field.stars.map((s) => ({ ...s }));
	// svelte-ignore state_referenced_locally
	const seededU: number[] = field.u.slice();
	let stars = $state<Star[]>(seededStars);
	// static fallback styles — shown as-is under reduced motion (no animation),
	// and harmlessly overridden by the CSS idle drift / JS warp loop otherwise.
	const seedStyles = seededStars.map((s, i) => starVisual(seededU[i], s.rot));

	// ---- adaptive quality ---------------------------------------------------
	// The warp loop watches its own frame times, and a device that keeps
	// missing frames gets `low-fx`: the starfield zoom is untouched, but the
	// per-frame luxuries around it are traded for static stand-ins — the
	// backdrop blurs (re-blurred every frame while the field moves beneath
	// them), the teal glow on every tile, the fine-grained filter ramp, and the
	// last third of the field's density. Remembered for the session so a
	// return visit skips the janky first seconds.
	const LONG_FRAME_MS = 40; // a frame this late has visibly hitched
	const FX_WINDOW = 120; // frames per verdict (~1–2s)
	const FX_TRIP = 10; // long frames in a window that flip the mode
	const LOWFX_CAP = 16; // live tiles under low-fx (desktop; mobile shows 12)
	let lowFx = $state(false);

	// ---- the canvas takeover ------------------------------------------------
	// The DOM field is 24 composited layers, each an image with a corner mask
	// and shadows under a 3D transform — and the scroll zoom changes every
	// layer's scale at once, which makes the browser re-rasterise all of them
	// mid-scroll. That re-raster storm IS the scroll jank. So once the lazy
	// painter chunk and every tile's CORS-clean pixels have arrived, the first
	// scroll frame hands the whole field to a single <canvas>: same simulation,
	// same projection math, one blit per tile per frame, nothing to re-raster.
	// The DOM tiles stay in the markup — they are the SSR first paint, the
	// reduced-motion field, the boom blast, and the fallback if the painter
	// ever fails (no 2D context, a fetch/decode error, a CORS misconfig).
	let canvasRef = $state<HTMLCanvasElement>();
	let canvasActive = $state(false); // drives the CSS swap (warp hidden ↔ canvas shown)

	// set by the warp loop once it owns the field; the click handler below goes
	// through it so a spawned tile lands in the loop's arrays and not beside them
	let addStar: ((x: number, y: number) => void) | undefined;

	let pinRef: HTMLDivElement | undefined;
	let warpRef: HTMLDivElement | undefined;
	// the BEFORE content is conditionally rendered, so this ref is reassigned
	let beforeRef = $state<HTMLDivElement>();
	let cueRef = $state<HTMLButtonElement>();

	// ---- the warp loop ------------------------------------------------------
	// One rAF loop owns the field. It advances every tile's warp position,
	// recycles tiles that reach the end, and writes transform/opacity/filter
	// straight to the DOM. It runs only while the hero is on screen.
	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// a device that already proved itself slow this session starts degraded
		// instead of re-earning it through another janky first second
		try {
			if (sessionStorage.getItem('hero_low_fx') === '1') lowFx = true;
		} catch {
			// storage denied — the frame-time watcher will re-detect
		}

		// per-tile warp position, and whether it has been swept out and parked.
		// These grow with `stars` — a clicked tile pushes one entry onto each.
		const u = seededU.slice();
		const parked: boolean[] = Array.from({ length: STAR_COUNT }, () => false);
		/** whether the loop paints this tile yet, or the CSS drift still does */
		const owned: boolean[] = Array.from({ length: STAR_COUNT }, () => false);
		/** when this tile's swell-in began, 0 once it is over */
		const introAt: number[] = Array.from({ length: STAR_COUNT }, () => 0);
		/** last opacity/filter strings written, so an unchanged one is skipped */
		const lastOp: string[] = Array.from({ length: STAR_COUNT }, () => '');
		const lastFil: string[] = Array.from({ length: STAR_COUNT }, () => '');

		let synced = false;
		let heroVisible = true;
		let raf = 0;
		let lastT = 0;
		let lastY = window.scrollY;
		let pendingScroll = 0; // signed px scrolled since the last frame
		let refillBudget = 0; // fractional count of parked tiles owed re-entry
		let lastProgress = -1; // last pin progress the content departure saw
		let pinTop = 0;
		let pinDist = 1; // scroll distance the hero stays pinned for
		let scrollGain = 0; // px scrolled → u advanced (a whole pin drains the field)
		let refillGain = 0; // px scrolled up → parked tiles drawn back in
		let activeCount = STAR_COUNT; // tiles currently in the field (not parked)
		let narrow = false; // the ≤767px viewport, where CSS hides tiles 13+
		// the canvas painter, loaded during idle time. `canvasMode` is the
		// loop's own switch (canvasActive is its CSS shadow) — flipped on by
		// tryActivateCanvas, off by fallbackToDom or the boom restore.
		let painter: StarfieldPainter | null = null;
		let canvasMode = false;
		let fieldW = 1; // the warp box, CSS px
		let fieldH = 1;
		let unitPx = 100; // --star-unit resolved to px
		let perspectivePx = 448; // .star-warp's perspective resolved to px
		// frame-time bookkeeping for the low-fx trip — the first window is a
		// warm-up (hydration and image decode land there) and never convicts
		let fxFrames = 0;
		let fxLong = 0;
		let fxWarmup = true;

		// pin geometry only shifts on resize — measure it then, not per frame
		function measure() {
			const hero = document.getElementById('hero');
			narrow = window.matchMedia('(max-width: 767px)').matches;
			if (!pinRef || !hero) return;
			pinTop = pinRef.getBoundingClientRect().top + window.scrollY;
			pinDist = Math.max(1, pinRef.offsetHeight - hero.offsetHeight);
			scrollGain = 1.15 / pinDist;
			refillGain = (STAR_COUNT + 4) / pinDist;
			// the canvas projection's constants — resolved here, not per frame.
			// unitPx mirrors the CSS `--star-unit: clamp(62px, 9vw, max(132px,
			// 6.875vw))` exactly (clientWidth IS 1vw×100: no scrollbar), so a
			// tile is the same size on canvas as it was in layout.
			if (warpRef) {
				fieldW = warpRef.clientWidth || 1;
				fieldH = warpRef.clientHeight || 1;
				const vw = document.documentElement.clientWidth;
				unitPx = Math.min(Math.max(62, vw * 0.09), Math.max(132, vw * 0.06875));
				perspectivePx = parseFloat(getComputedStyle(warpRef).perspective) || 448;
			}
			// keep the backing store pre-allocated so the activation frame —
			// which is a scroll frame — only flips classes
			painter?.resize(fieldW, fieldH, window.devicePixelRatio || 1);
		}

		// give tile i fresh work (image, place, tilt) in place — its id stays,
		// so the DOM element is reused. Only ever called while it is invisible.
		function swapContent(i: number) {
			const fresh = makeStar(
				Math.random,
				stars.filter((_, j) => j !== i),
			);
			const s = stars[i];
			s.src = fresh.src;
			s.x = fresh.x;
			s.y = fresh.y;
			s.w = fresh.w;
			s.ar = fresh.ar;
			s.rot = fresh.rot;
			s.drift = fresh.drift;
			// start baking the new sprite now, while the tile is invisible —
			// the same head start the DOM path gets from the <img> src swap
			painter?.request(s.src, s.ar);
		}

		/**
		 * THE HANDOVER, in one frame. Requires every live tile to be drawable
		 * (a partial swap deletes tiles from the field), reads the CSS drift's
		 * exact position for anything the loop had not yet claimed, and stops
		 * the drift animations under the now-hidden DOM field. Called on a
		 * scroll frame whenever possible: the field is sweeping, which masks
		 * the sub-pixel truth that the document timeline runs a frame behind
		 * the compositor.
		 */
		function tryActivateCanvas() {
			if (!painter || painter.failed || !warpRef) return;
			for (let i = 0; i < stars.length; i++) {
				if (parked[i]) continue;
				if (narrow && i >= 12 && !stars[i].spawned) continue;
				if (!painter.has(stars[i].src, stars[i].ar)) return;
			}
			const tiles = warpRef.children;
			for (let i = 0; i < stars.length; i++) {
				const el = tiles[i] as HTMLElement | undefined;
				if (!el) continue;
				if (!owned[i]) {
					const prog = el.getAnimations()[0]?.effect?.getComputedTiming()?.progress;
					if (typeof prog === 'number') u[i] = prog;
					owned[i] = true;
				}
				el.style.animation = 'none';
				// the DOM paint loop may have run before the sprites were ready
				// (a cold cache plus an early scroll), and the inline
				// `visibility: visible` it wrote on each live tile beats the
				// .ghost wrapper's INHERITED hidden — clear it, or those tiles
				// stay on screen frozen under the canvas field
				el.style.visibility = '';
			}
			canvasMode = true;
			canvasActive = true;
		}

		/** canvas → DOM, after a painter failure. Every tile is owned by now,
		 *  so the DOM painter repaints the whole field on the next frame. */
		function fallbackToDom() {
			canvasMode = false;
			canvasActive = false;
			painter?.clear();
			lastOp.fill('');
			lastFil.fill('');
		}

		/** the canvas frame — the same projection starVisual() encodes, in
		 *  numbers instead of style strings */
		function paintCanvas(now: number) {
			if (!painter) return;
			const frames: TileFrame[] = [];
			const cx = fieldW / 2;
			const cy = fieldH / 2;
			for (let i = 0; i < stars.length; i++) {
				if (parked[i]) continue;
				if (narrow && i >= 12 && !stars[i].spawned) continue;
				const uu = u[i];
				if (uu <= 0 || uu >= 1) continue;
				const s = stars[i];
				const z = Z_FAR + uu * (Z_NEAR - Z_FAR);
				const f = perspectivePx / (perspectivePx - z);
				const fadeIn = Math.min(1, uu / 0.12);
				const fadeOut = Math.min(1, (1 - uu) / 0.28);
				let alpha = 0.9 * Math.min(fadeIn, fadeOut);
				let w = s.w * unitPx * f;
				if (introAt[i]) {
					const t = Math.min(1, (now - introAt[i]) / INTRO_MS);
					w *= 0.3 + 0.7 * easeOutBack(t);
					alpha *= Math.min(1, t / 0.28);
					if (t >= 1) introAt[i] = 0;
				}
				frames.push({
					src: s.src,
					ar: s.ar,
					u: uu,
					sx: cx + ((s.x / 100) * fieldW - cx) * f,
					sy: cy + ((s.y / 100) * fieldH - cy) * f,
					w,
					rot: s.rot * (Math.PI / 180),
					alpha,
					dim: Math.max(0, 1 - (0.7 + 0.55 * uu)),
				});
			}
			// far→near, the paint order preserve-3d gave the DOM for free
			frames.sort((a, b) => a.u - b.u);
			painter.draw(frames);
		}

		// the hero's badge, headline, copy and CTA ride up out of the pin at the
		// scroll's own rate and fade off in reading order. The lift goes on the
		// column itself — one transform, and it is the same number for every item
		// by definition, so there is nowhere for the rates to drift apart.
		function applyContentDeparture(p: number) {
			if (beforeRef) {
				beforeRef.style.transform = `translate3d(0, ${(-p * pinDist).toFixed(1)}px, 0)`;
			}
			const items = beforeRef?.children;
			if (!items) return;
			for (let k = 0; k < items.length; k++) {
				const el = items[k] as HTMLElement | undefined;
				if (!el) continue;
				const local = Math.min(1, Math.max(0, (p - k * FADE_STAGGER) / FADE_SPAN));
				el.style.opacity = (1 - local * local * (3 - 2 * local)).toFixed(3); // smoothstep
			}
			// The cue is anchored to the bottom of the sticky frame, so it is the one
			// thing that cannot travel with the column — fade it instead, or it sits
			// there conspicuously nailed in place while everything else leaves.
			if (cueRef) {
				const fade = Math.max(0, 1 - p * 3);
				cueRef.style.setProperty('--cue-fade', fade.toFixed(3));
				cueRef.style.setProperty('--cue-hit', fade < 0.05 ? 'none' : 'auto');
			}
		}

		function tick(now: number) {
			// once the button is pushed, release the tiles to the CSS blast
			// animation (clear the inline `animation: none`) and stop the loop
			if (phase === 'boom' || phase === 'aftermath') {
				// the blast is a DOM show — if the canvas owns the field, write
				// the field's current state back onto the (hidden, stale) tiles
				// first, so the blast starts from what was actually on screen
				if (canvasMode) {
					const tiles = warpRef?.children;
					for (let i = 0; tiles && i < stars.length; i++) {
						const el = tiles[i] as HTMLElement | undefined;
						if (!el) continue;
						const v = starVisual(u[i], stars[i].rot);
						el.style.transform = v.transform;
						el.style.opacity = v.opacity;
						el.style.filter = v.filter;
						el.style.visibility = parked[i] ? 'hidden' : 'visible';
					}
					canvasMode = false;
					canvasActive = false;
					painter?.clear();
				}
				const blasting = warpRef?.children;
				if (blasting) {
					for (let i = 0; i < blasting.length; i++) {
						const el = blasting[i] as HTMLElement | undefined;
						if (el) el.style.animation = '';
					}
				}
				raf = 0;
				return;
			}

			// SYNC TO THE PRE-HYDRATION CSS DRIFT — read only. This does not take
			// the tiles over; it just tells the loop where the browser currently
			// has them, so `owned` below can pick its moment.
			if (!synced) {
				synced = true;
				const tiles = warpRef?.children;
				for (let i = 0; tiles && i < stars.length; i++) {
					const el = tiles[i] as HTMLElement | undefined;
					if (!el) continue;
					const prog = el.getAnimations()[0]?.effect?.getComputedTiming()?.progress;
					if (typeof prog === 'number') u[i] = prog;
				}
				lastT = now;
			}

			const rawDt = now - lastT;
			const dt = Math.min(rawDt, 50);
			lastT = now;

			const d = pendingScroll;
			pendingScroll = 0;
			const advance = Math.abs(d) * scrollGain;
			const up = d < 0;
			const down = d > 0;

			// how far past the top of the pin we are, in pin-lengths —
			// uncapped, so the drain is free to run on well past the pin. The
			// field thins linearly from full to empty across DRAIN_REACH of
			// these, so a bigger SCROLL_EXTRA literally stretches the drain.
			const progress = Math.max(0, (window.scrollY - pinTop) / pinDist);
			const target = Math.max(0, stars.length * (1 - progress / DRAIN_REACH));

			// advance every live tile in lockstep: gentle idle drift + scroll
			for (let i = 0; i < stars.length; i++) {
				if (parked[i]) continue;
				u[i] += dt / (stars[i].drift * 1000) + advance;

				// TAKE THE TILE OVER FROM CSS WHERE THE SWAP CANNOT BE SEEN.
				//
				// Reading the CSS drift's position and repainting from it can
				// never be exact: the value comes off the document timeline,
				// which is pinned to the last rendering update, while the tile
				// on screen is being drawn by the compositor a frame or more
				// ahead of that. There is no DOM API that closes the gap — so
				// stop trying to make the swap accurate and make it INVISIBLE
				// instead.
				//
				// A tile at the far end of the tunnel is at opacity 0.03 on its
				// way to 0, and a tile that has just wrapped is climbing out of
				// 0. Claim it in that window and an error of a frame — half a
				// pixel of depth — has nothing to show itself on. Every tile is
				// claimed silently, one at a time, within a single drift cycle.
				//
				// Scrolling claims whatever is left at once: the field is
				// sweeping at that point, which masks far more than this ever
				// needed.
				if (!owned[i]) {
					// Coming up on the window, stop trusting our own integration
					// and ask the browser where the tile really is. `dt` is capped
					// at 50ms, so a run of janky frames leaves our count quietly
					// behind the CSS drift's, and a claim made on a stale count is
					// a claim made outside the window — the exact jump this is all
					// for. Only the tiles near the end pay for the re-read.
					if (u[i] >= 0.9) {
						const el = warpRef?.children[i] as HTMLElement | undefined;
						const prog = el?.getAnimations()[0]?.effect?.getComputedTiming()?.progress;
						if (typeof prog === 'number') u[i] = prog;
					}
					if (u[i] >= 0.99 || advance > 0) owned[i] = true;
				}

				if (u[i] >= 1) {
					if (down && activeCount > target) {
						// the field is fuller than this point in the pin calls
						// for — sweep this tile away for good, and preload its
						// next image for when scrolling draws it back
						parked[i] = true;
						activeCount--;
						swapContent(i);
					} else if (down) {
						// an extra tile keeping the down-scroll zoom stocked —
						// recycle the very same image and element: the zoom is
						// fast enough to hide the repeat, and it spares a load
						u[i] -= 1;
					} else if (lowFx && !narrow && activeCount > LOWFX_CAP) {
						// low-fx thins the field the same way the drain does —
						// each surplus tile leaves through the far end of its
						// own pass, so nothing on screen ever pops out. Not on
						// narrow viewports: CSS already halves the field there.
						parked[i] = true;
						activeCount--;
						swapContent(i);
					} else {
						// idle drift / up-scroll flow → a fresh, unseen image
						u[i] -= 1;
						swapContent(i);
					}
				}
			}

			// scrolling up also draws parked tiles back in from deep space,
			// metered by distance so they zoom in one after another. Each kept
			// the image it loaded while parked, so re-entry never flickers.
			if (up) {
				refillBudget += -d * refillGain;
				while (refillBudget >= 1) {
					// low-fx: full for this mode IS the cap — stop refilling there
					if (lowFx && !narrow && activeCount >= LOWFX_CAP) {
						refillBudget = 0;
						break;
					}
					const p = parked.indexOf(true);
					if (p === -1) {
						refillBudget = 0;
						break;
					}
					parked[p] = false;
					activeCount++;
					u[p] = -Math.random() * 0.04;
					refillBudget -= 1;
				}
			}

			// at rest at the very top the field is simply full — top up any
			// stragglers, spread through the tunnel rather than bunched deep
			// (under low-fx, "full" means the cap)
			if (window.scrollY <= pinTop + 4) {
				for (let i = 0; i < stars.length; i++) {
					if (!parked[i]) continue;
					if (lowFx && !narrow && activeCount >= LOWFX_CAP) break;
					parked[i] = false;
					u[i] = Math.random();
					activeCount++;
				}
			}

			// hand the field to the canvas the moment it can take it — on a
			// scroll frame for choice (the sweep masks the swap), or once every
			// tile is loop-owned anyway and there is no CSS position to miss
			if (
				!canvasMode &&
				painter &&
				!painter.failed &&
				(advance > 0 || owned.every(Boolean))
			) {
				tryActivateCanvas();
			}
			if (canvasMode) {
				if (painter?.failed) fallbackToDom();
				else paintCanvas(now);
			}

			const tiles = canvasMode ? undefined : warpRef?.children;
			if (tiles) {
				for (let i = 0; i < stars.length; i++) {
					const el = tiles[i] as HTMLElement | undefined;
					if (!el) continue;
					// still the browser's to paint — leave it entirely alone, an
					// inline style it half-owns is worse than one it does not
					if (!owned[i]) continue;
					// display:none'd by the mobile nth-child rule — a style write
					// on a tile that cannot paint is pure main-thread cost
					if (narrow && i >= 12 && !stars[i].spawned) continue;
					// an animation beats an inline style, so the CSS drift has to
					// go the first time the loop paints a tile, or it fights the
					// loop for the rest of that tile's life
					if (el.style.animation !== 'none') el.style.animation = 'none';
					if (parked[i]) {
						if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
						continue;
					}
					if (el.style.visibility !== 'visible') el.style.visibility = 'visible';
					// low-fx coarsens the filter ramp 4× — same look, a quarter
					// of the filter invalidations
					const v = starVisual(u[i], stars[i].rot, lowFx ? 0.2 : 0.05);

					// a clicked tile swells out of the pixel it was struck at.
					// z is 0 at that moment, so this scale is honest screen-space
					// scale about the cursor rather than something the projection
					// will drag off somewhere else.
					if (introAt[i]) {
						const t = Math.min(1, (now - introAt[i]) / INTRO_MS);
						const s = 0.3 + 0.7 * easeOutBack(t);
						el.style.transform = `${v.transform} scale(${s.toFixed(3)})`;
						el.style.opacity = (+v.opacity * Math.min(1, t / 0.28)).toFixed(3);
						lastOp[i] = ''; // the intro owns opacity — force the next write
						if (t >= 1) introAt[i] = 0;
					} else {
						el.style.transform = v.transform;
						if (lastOp[i] !== v.opacity) {
							el.style.opacity = v.opacity;
							lastOp[i] = v.opacity;
						}
					}
					if (lastFil[i] !== v.filter) {
						el.style.filter = v.filter;
						lastFil[i] = v.filter;
					}
				}
			}

			// the headline, badge, copy and button ride up with the scroll —
			// idle frames (no scroll) leave it exactly where it already is
			if (progress !== lastProgress) {
				applyContentDeparture(progress);
				lastProgress = progress;
			}

			// THE LOW-FX TRIP. Judged in whole windows rather than per frame so
			// one stray hitch (a GC, a tab switch) convicts nobody; a device
			// that misses 10 frames in ~2s is judged on a pattern. One-way for
			// the session — flapping between the two looks is worse than either.
			if (!lowFx) {
				fxFrames++;
				if (rawDt > LONG_FRAME_MS) fxLong++;
				if (fxFrames >= FX_WINDOW) {
					if (!fxWarmup && fxLong >= FX_TRIP) {
						lowFx = true;
						// sprites baked from here on skip the glow; the ones
						// already on screen keep theirs until recycled
						if (painter) painter.glow = false;
						try {
							sessionStorage.setItem('hero_low_fx', '1');
						} catch {
							// storage denied — this visit still degrades live
						}
					}
					fxWarmup = false;
					fxFrames = 0;
					fxLong = 0;
				}
			}

			raf = heroVisible ? requestAnimationFrame(tick) : 0;
		}

		function pump() {
			if (raf || phase === 'boom' || phase === 'aftermath') return;
			lastT = performance.now();
			raf = requestAnimationFrame(tick);
		}

		function onScroll() {
			const y = window.scrollY;
			if (heroVisible) pendingScroll += y - lastY;
			lastY = y;
		}

		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', measure);

		// Load the painter off the critical path, the same way the image pool
		// and the destruction assets are warmed. Its sprite fetches normally
		// come straight out of the <img> tiles' cache entries; an entry cached
		// without CORS headers costs one re-download instead (see the retry in
		// StarfieldPainter.request) — small avif thumbs, and the DOM field
		// carries the show until every one of them has arrived.
		let cancelPainterIdle = () => {};
		{
			const warmPainter = () => {
				if (!canvasRef) return;
				import('../starfield-canvas')
					.then((m) => {
						painter = new m.StarfieldPainter(canvasRef!, mediaBase);
						painter.glow = !lowFx;
						for (const s of stars) painter.request(s.src, s.ar);
						measure(); // size the backing store before activation
					})
					.catch(() => {
						// chunk failed to load — the DOM field simply keeps the job
					});
			};
			if ('requestIdleCallback' in window) {
				const id = requestIdleCallback(warmPainter, { timeout: 3000 });
				cancelPainterIdle = () => cancelIdleCallback(id);
			} else {
				const id = setTimeout(warmPainter, 2000);
				cancelPainterIdle = () => clearTimeout(id);
			}
		}

		// pause the whole loop whenever the hero is off screen — no warp work,
		// no graphics resources spent while the field can't be seen
		const hero = document.getElementById('hero');
		const io = hero
			? new IntersectionObserver(([entry]) => {
					heroVisible = entry.isIntersecting;
					if (heroVisible) {
						// re-entering: drop any scroll banked while away, resume
						measure();
						lastY = window.scrollY;
						pendingScroll = 0;
						pump();
					} else if (raf) {
						cancelAnimationFrame(raf);
						raf = 0;
					}
				})
			: undefined;
		io?.observe(hero!);

		// The easter egg's hook into the loop. A clicked tile is not a special
		// case anywhere downstream: it pushes one entry onto each of the loop's
		// parallel arrays and is thereafter indistinguishable from a seeded one.
		// It is given a much shorter drift, though — a tile that takes 20s to
		// cross the tunnel reads as nothing having happened.
		addStar = (x, y) => {
			if (stars.length >= MAX_STARS) return;
			const s = makeStar(Math.random, stars);
			s.x = x;
			s.y = y;
			s.drift = SPAWN_DRIFT + Math.random() * 2.5;
			s.spawned = true;
			// keep every parallel array the same length as `stars`. It is born
			// owned — the loop conjured it, so there is nothing to hand over —
			// and it is born at the one depth whose anchor is its pixel.
			seededU.push(U_SPAWN);
			seedStyles.push({ ...starVisual(U_SPAWN, s.rot), opacity: '0' });
			u.push(U_SPAWN);
			parked.push(false);
			owned.push(true);
			lastOp.push('');
			lastFil.push('');
			introAt.push(performance.now());
			activeCount++;
			stars.push(s);
			painter?.request(s.src, s.ar);
			pump(); // in case the field had been let go idle
		};

		return () => {
			addStar = undefined;
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', measure);
			io?.disconnect();
			if (raf) cancelAnimationFrame(raf);
			cancelPainterIdle();
			painter?.dispose();
			painter = null;
		};
	});

	// ---- click to conjure ---------------------------------------------------
	/**
	 * THE EASTER EGG. Click anywhere in the hero that is not a control and a new
	 * tile is struck at that exact pixel, swells out of it and flies at you. It
	 * spawns at z = 0 — see U_SPAWN — because that is the only depth where the
	 * anchor the tile is laid out at and the pixel the cursor is over are the
	 * same point. There is no separate click ripple: at that depth the tile IS
	 * the acknowledgement, arriving under the cursor on the frame you clicked.
	 *
	 * Bound imperatively rather than as an `onclick` on the section: the hero is
	 * not a control and must not be described as one, and a bare handler on a
	 * <section> is exactly the thing a11y lint is right to complain about. This
	 * takes clicks that have already bubbled up from wherever they landed, so it
	 * covers the whole hero — including the parts the centre column sits over —
	 * without any element pretending to be interactive.
	 */
	onMount(() => {
		const hero = document.getElementById('hero');
		if (!hero) return;

		function onClick(e: MouseEvent) {
			// the demolition owns the stage once it starts — no conjuring over it
			if (phase !== 'idle') return;
			const t = e.target as HTMLElement | null;
			if (t?.closest('a, button, input, textarea, select, label, [role="button"]'))
				return;
			// selecting the lede ends in a click, and double-clicking a word ends
			// in two — neither is someone asking for a star
			if (!window.getSelection()?.isCollapsed) return;
			if (e.detail > 1) return;
			if (!warpRef) return;

			const r = warpRef.getBoundingClientRect();
			const x = ((e.clientX - r.left) / r.width) * 100;
			const y = ((e.clientY - r.top) / r.height) * 100;
			if (x < 0 || x > 100 || y < 0 || y > 100) return;

			if (addStar) {
				addStar(x, y);
				return;
			}
			// reduced motion: no warp loop to hand it to. Drop the tile in at the
			// same depth and leave it there, the way the seeded field sits.
			if (stars.length >= MAX_STARS) return;
			const s = makeStar(Math.random, stars);
			s.x = x;
			s.y = y;
			s.spawned = true;
			seededU.push(U_SPAWN);
			seedStyles.push(starVisual(U_SPAWN, s.rot));
			stars.push(s);
		}

		hero.addEventListener('click', onClick);
		return () => hero.removeEventListener('click', onClick);
	});

	const currentYear = new Date().getFullYear();

	// ---- destruction sequence ----------------------------------------------
	type Phase = 'idle' | 'awake' | 'pumping' | 'boom' | 'aftermath';

	let phase = $state<Phase>('idle');
	let pumpCount = $state(0);
	// which stroke is in flight (1–4); 0 between beats. The mascot re-keys its
	// rig whenever this changes, so each stroke replays a hand-timed curve
	// rather than lerping between two toggle states.
	let pumpStroke = $state(0);
	let strokeMs = $state(780);
	let strokeKind = $state<'light' | 'fail' | 'reset' | 'heavy'>('light');
	let explosionTick = $state(0);
	let warned = $state(false); // user hovered/peeked
	let prePress = $state(false); // momentary squish on click
	// the button pivots on its centre until the press has fully settled, then
	// on `0% 100%` for the rest of the shot — see ORIGIN_SWITCH_AT
	let from_corner = $state(false);
	// the demolition readout: a number that ticks, not a phrase that flips
	let percent = $state(0);
	let percent_live = $state(false);
	// flipped on every tick so the digits can re-run their flicker without the
	// element being re-created (a `{#key}` here would make the number FLIP,
	// which is exactly what it must not do)
	let tick_parity = $state(false);

	// Button scale is purely derived from pump count (no transition during scale —
	// we apply a per-pump spring via .pulse class instead)
	const buttonScale = $derived(1 + pumpCount * 0.55);

	/**
	 * THE BUTTON IS INSTRUMENTATION, NOT A CHARACTER — and there are only THREE
	 * phrases on it.
	 *
	 * Round 8 cut the status ladder ("evacuate", "over pressure warning",
	 * "pressure holding" and the rest). Six changing phrases in seven seconds
	 * put a second thing to READ next to the thing to WATCH, and the reader
	 * lost the mascot. What is left is two warnings and one statement of
	 * intent, after which the button stops using words at all and becomes a
	 * progress readout — see PERCENT / `.boom-btn-count` below.
	 *
	 *   idle              "Don't push this button"
	 *   idle, peeked      "Seriously, don't"
	 *   awake             "Demolition started"
	 *   pumping → boom    the counter: "42% Complete"
	 *
	 * Longest string is the idle one (21 chars); `.boom-btn` has a fixed
	 * footprint, so a swap can never reflow the layout.
	 */
	const buttonLabel = $derived(
		phase === 'idle' && !warned
			? "Don't push this button"
			: phase === 'idle' && warned
				? "Seriously, don't"
				: phase === 'awake'
					? 'Demolition started'
					: '',
	);

	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	// ---- the lazy heavyweights ----------------------------------------------
	// The mascot rig and the explosion canvas are only needed once the button
	// is pushed, so they live in their own chunks. `preloadDestruction()` is
	// idempotent — first call starts the downloads, every call returns the same
	// promise — and it is fired from three places: idle time after hydration
	// (so a mobile visitor who never hovers still has it warm), the button's
	// hover/focus (the classic intent signal), and startDestruction itself
	// (the guarantee — the 180ms press squish absorbs most of a cold fetch).
	let MascotComp = $state<typeof HeroMascotType | null>(null);
	let ExplosionComp = $state<typeof HeroExplosionType | null>(null);
	let destructionAssets: Promise<unknown> | undefined;

	function preloadDestruction() {
		destructionAssets ??= Promise.all([
			import('./HeroMascot.svelte').then((m) => (MascotComp = m.default)),
			import('./HeroExplosion.svelte').then((m) => (ExplosionComp = m.default)),
		]).catch((err) => {
			// a failed fetch (flaky network) must not poison the cache — clear it
			// so the next intent signal retries the download
			destructionAssets = undefined;
			throw err;
		});
		return destructionAssets;
	}

	// Warm the deferred pieces once the browser is idle: first the full image
	// pool (tiny — recycling needs it), then the destruction assets. Neither
	// touches the critical path; both are ready long before they can be needed.
	onMount(() => {
		const warm = () => {
			import('../starfield-pool')
				.then((m) => starFieldFactory.setPool(m.STARFIELD_POOL))
				.catch(() => {})
				.finally(() => {
					preloadDestruction();
				});
		};
		if ('requestIdleCallback' in window) {
			const id = requestIdleCallback(warm, { timeout: 4000 });
			return () => cancelIdleCallback(id);
		}
		const id = setTimeout(warm, 2500);
		return () => clearTimeout(id);
	});

	/**
	 * The pump beat sheet. This is a STORY, not four identical reps: he is
	 * cocky for two, the third fails outright, the fourth beat is the puzzled
	 * hold where he works out that it is harder than he thought, and only then
	 * does he commit to the two heavy ones. (Whitaker & Halas's barbell lift is
	 * the canonical version of this structure.)
	 *
	 * `pump: false` beats still play — they just do not inflate the button, so
	 * `pumpCount` still reaches 4 and everything downstream is unchanged.
	 *
	 * ---- THE COUNTER'S PACING — how each beat's percentage is spent ----
	 *
	 * `pct_ease` maps a tick's INDEX (0→1 through the run) onto WHEN it lands
	 * (0→1 through `pct_ms`). It is not an interpolation curve on the value:
	 * the value always steps by exactly `pct_step`, and the easing decides how
	 * bunched or spread the steps are in time. That is the difference between a
	 * number sliding and a needle jumping.
	 *
	 *   surge  ticks pile up at the front, then the last few creep in
	 *   lurch  a beat of nothing, then it runs
	 *   even   metronomic — used only where the readout is barely moving
	 *
	 * Uneven by design: a tyre does not take psi linearly. Two eager light
	 * strokes (11, then 12 in steps of two), a FAIL beat that advances ONE
	 * point in 380 ms — the gag: he puts everything in and the gauge shrugs — a
	 * puzzled reset that only bleeds up 3 at 120 ms a point, then the two heavy
	 * strokes, which do 73 of the 100 between them.
	 *
	 * EVERY BEAT'S RUN FINISHES INSIDE ITS OWN BEAT. `pct_ms` is checked
	 * against `ms − round(ms × IMPACT_AT)`, the time left after the impact, and
	 * the margins are 29 / 62 / 34 / 17 / 29 / 70 ms. That matters most at the
	 * FAIL beat: a previous tuning let the second stroke's last two ticks spill
	 * 30 ms into it, which softened the stall the joke depends on.
	 *
	 * The last beat lands on exactly 100. It cannot overshoot (the final tick
	 * is `pct_to` itself, not `from + n × step`), it cannot land early (it is
	 * scheduled at `pct_ms`), and it cannot still be running at the boom:
	 * 670 ms impact + 500 ms of ticks = 1170 ms of a 1240 ms beat, leaving that
	 * 70 ms tail plus the whole 900 ms alarm — measured live at 951 ms of 100 %
	 * on screen before the shell goes.
	 */
	/** no two ticks may share a paint — see `rampPercent` */
	const MIN_TICK_MS = 28;
	const EASE_SURGE = (t: number) => t * t;
	const EASE_LURCH = (t: number) => t * (2 - t);
	const EASE_EVEN = (t: number) => t;

	const PUMP_BEATS = [
		{
			ms: 780,
			kind: 'light',
			pump: true,
			pct_to: 11,
			pct_ms: 330,
			pct_step: 1,
			pct_ease: EASE_SURGE,
		},
		// steps of TWO and a slower tick — the same climb read at a different
		// resolution, so two "identical" light strokes do not count identically
		{
			ms: 700,
			kind: 'light',
			pump: true,
			pct_to: 23,
			pct_ms: 260,
			pct_step: 2,
			pct_ease: EASE_LURCH,
		},
		// FAIL — the handle does not move, so neither does the gauge. ONE point,
		// arriving 380 ms late, is the joke.
		{
			ms: 900,
			kind: 'fail',
			pump: false,
			pct_to: 24,
			pct_ms: 380,
			pct_step: 1,
			pct_ease: EASE_EVEN,
		},
		// RESET — the puzzled hold. Three points, 120 ms apart, evenly spaced:
		// pressure settling on its own rather than work being done.
		{
			ms: 820,
			kind: 'reset',
			pump: false,
			pct_to: 27,
			pct_ms: 360,
			pct_step: 1,
			pct_ease: EASE_EVEN,
		},
		// HEAVY — he commits, and the readout stops resolving single points.
		// Steps of FOUR: the digits visibly skip, which is what a gauge does
		// when the needle is moving faster than it can be read.
		{
			ms: 1020,
			kind: 'heavy',
			pump: true,
			pct_to: 86,
			pct_ms: 440,
			pct_step: 4,
			pct_ease: EASE_SURGE,
		},
		// The last one. Back to single points, surging and then CREEPING —
		// the final gaps run 54 / 58 / 64 / 69 ms, so 97 · 98 · 99 · 100 arrive
		// one at a time and 100 is a landing rather than a blur.
		{
			ms: 1240,
			kind: 'heavy',
			pump: true,
			pct_to: 100,
			pct_ms: 500,
			pct_step: 1,
			pct_ease: EASE_SURGE,
		},
	] as const;

	/**
	 * Ramp the readout to `to` in `step`-sized ticks over `ms`.
	 *
	 * Every tick gets its own scheduled time, and the LAST one is always `to`
	 * itself rather than `from + n * step` — so the counter can never overshoot
	 * 100, never land a frame early, and never be caught mid-count by the boom.
	 * The schedule is then WALKED on rAF, one value per frame, so a janky frame
	 * cannot make a value disappear. See the two comments below.
	 */
	function rampPercent(
		to: number,
		ms: number,
		step: number,
		ease: (t: number) => number,
	) {
		const from = percent;
		if (to <= from) return;
		const values: number[] = [];
		for (let v = from + step; v < to; v += step) values.push(v);
		values.push(to);

		// The schedule, in ms from the impact. A hard floor on the gap, because
		// `surge` would otherwise place its first few ticks 2–7 ms apart and a
		// browser only paints every 16.7 — three values inside one frame means
		// the reader never sees two of them. The floor only ever pushes a tick
		// LATER, so the run still cannot land early, and every beat has room
		// for all of its ticks at this spacing inside its own beat.
		const at: number[] = [];
		let prev = -MIN_TICK_MS;
		for (let i = 0; i < values.length; i++) {
			const t = Math.max(
				Math.round(ease((i + 1) / values.length) * ms),
				prev + MIN_TICK_MS,
			);
			prev = t;
			at.push(t);
		}

		// AT MOST ONE VALUE PER FRAME, walked on rAF rather than fired off six
		// timers. The schedule already guarantees ≥ MIN_TICK_MS between ticks,
		// but a janky frame lets two delayed timers fire between one pair of
		// paints and the reader simply never sees one of the numbers — measured
		// live, exactly one value in a 51-value run went missing that way. This
		// turns a dropped frame into a frame of lateness instead of a missing
		// digit, and the ladder has 2–3 frames of slack per tick to absorb it.
		const start = performance.now();
		let i = 0;
		const walk = (now: number) => {
			if (now - start >= at[i]) {
				percent = values[i];
				tick_parity = !tick_parity;
				i += 1;
			}
			if (i < values.length) requestAnimationFrame(walk);
		};
		requestAnimationFrame(walk);
	}
	/**
	 * The button's shell, pre-cut into wedges.
	 *
	 * A triangle fan struck off the button's own box: each shard is a full-size
	 * copy of the skin clipped to one wedge, so together they tile the button
	 * exactly and the first frame of the burst is pixel-identical to the last
	 * frame of the intact button. They then fly along the wedge's own outward
	 * normal, which is why the rupture reads as pressure escaping rather than as
	 * particles being emitted near a thing.
	 *
	 * The seam is jittered per shard so the break line is not a clean starburst.
	 */
	const SHARD_COUNT = 9;
	/** walks the unit square's perimeter; t = 0 is the top-left corner */
	function perimeter(t: number): [number, number] {
		const u = ((t % 1) + 1) % 1;
		if (u < 0.25) return [u * 4, 0];
		if (u < 0.5) return [1, (u - 0.25) * 4];
		if (u < 0.75) return [1 - (u - 0.5) * 4, 1];
		return [0, 1 - (u - 0.75) * 4];
	}
	const SHELL_SHARDS = Array.from({ length: SHARD_COUNT }, (_, i) => {
		// deterministic jitter — a fixed irregular break, not a random one that
		// changes every hot reload
		const jitter = (n: number) => (Math.sin(n * 12.9898) * 43758.5453) % 1;
		const t0 = (i + jitter(i) * 0.42) / SHARD_COUNT;
		const t1 = (i + 1 + jitter(i + 1) * 0.42) / SHARD_COUNT;
		const a = perimeter(t0);
		const b = perimeter(t1);
		const mid = perimeter((t0 + t1) / 2);
		const pct = (p: [number, number]) =>
			`${(p[0] * 100).toFixed(2)}% ${(p[1] * 100).toFixed(2)}%`;
		// a wedge with a slightly ragged outer edge
		const clip = `polygon(50% 50%, ${pct(a)}, ${pct(mid)}, ${pct(b)})`;
		// fly along the wedge's own normal, biased up — debris arcs, it does not
		// spray evenly in a circle
		const nx = mid[0] - 0.5;
		const ny = mid[1] - 0.5;
		const len = Math.hypot(nx, ny) || 1;
		const speed = 260 + jitter(i + 7) * 240;
		return {
			clip,
			dx: Math.round((nx / len) * speed),
			dy: Math.round((ny / len) * speed * 0.62 - 90),
			rot: Math.round((jitter(i + 3) - 0.5) * 320),
			delay: Math.round(jitter(i + 11) * 42),
		};
	});

	// where in a beat the hands bottom out, as a fraction — must match the 54%
	// contact frame in HeroMascot's stroke keyframes, so the button swells on
	// the exact frame the hit lands.
	const IMPACT_AT = 0.54;

	/**
	 * How long into `awake` the hose is allowed to exist.
	 *
	 * He carries the pump in with him from two frame-heights up, so for the
	 * whole descent the tube end is in the SKY. `.hose-bridge`'s `d` is solved
	 * from both live rects every frame, so an ungated bridge draws a 738 px
	 * straight grey pipe from the sky down to the button — a scaffold pole
	 * through the headline for the first ~410 ms of the shot. The nozzle already
	 * had this delay; the bridge needs the same one, and it needs it as a MOUNT
	 * gate rather than an opacity ramp, because a half-transparent scaffold pole
	 * is still a scaffold pole.
	 *
	 * 620 ms = the 420 ms fall plus the knee compression and the push back up.
	 * MUST stay equal to the `.nozzle` transition-delay in the CSS below, or the
	 * fitting and the run of hose that plugs into it appear on different frames.
	 */
	const HOSE_READY_AT = 620;
	let hose_ready = $state(false);

	/**
	 * When the button's transform-origin moves from its centre to `0% 100%`,
	 * measured from the end of the press squish.
	 *
	 * The press must be OVER — all the way back to resting scale — before the
	 * origin moves, because moving the origin under a live scale teleports the
	 * element. The press has two parts and both have to finish:
	 *   `:active`  `scale: 0.97`, 140 ms — released the instant `phase` leaves
	 *              `idle` (at +0 ms here) because the button becomes `disabled`,
	 *              so it is home by +140 ms even if the pointer is still down.
	 *   `pre-press` `scale(--scale * 0.88)`, returning on the base transition,
	 *              380 ms with the spring — home by +380 ms.
	 * 520 ms gives 140 ms of headroom on the slower of the two. It also lands
	 * comfortably before ANY inflation: `--scale` does not leave 1 until the
	 * first impact frame, 2100 + 421 = 2521 ms after this point.
	 *
	 * MUST stay < HOSE_READY_AT so it is spent inside the first `awake` sleep
	 * and the 2100 ms total is untouched.
	 */
	const ORIGIN_SWITCH_AT = 520;

	// `phase` is not enough of a guard on its own: it stays `'idle'` across the
	// 180ms pre-press squish below, so two clicks inside that window both get
	// past the check and run the whole sequence twice over each other. This
	// latches synchronously, before the first `await`.
	let started = false;

	async function startDestruction() {
		if (phase !== 'idle' || started) return;
		started = true;
		// the show needs the mascot and the explosion — start (or join) their
		// downloads now; the press squish below absorbs most of a cold fetch
		const assets = preloadDestruction();

		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			// the explosion must be MOUNTED before the tick, or the trigger
			// increments against a component that isn't there to see it (its
			// own reduced-motion guard then skips the burst, but the aftermath
			// copy still needs the phase flip)
			await assets.catch(() => {});
			await tick();
			phase = 'aftermath';
			explosionTick++;
			return;
		}

		// little anticipation squish on press
		prePress = true;
		await sleep(180);
		prePress = false;

		// the mascot has to exist in the DOM before `awake`, or the fall — the
		// first 2100ms beat — plays to an empty stage. On a warm cache this
		// resolves instantly; cold, the squish already covered ~180ms of it.
		await assets.catch(() => {});
		await tick();

		phase = 'awake';
		// The mascot's whole `prep` beat — the FALL, the contact, the knees
		// absorbing it, the settle, the cocky size-up, the reach and the grip.
		// It is authored at 2100ms (was 1900) and the TOTAL of the three sleeps
		// below MUST equal that or the last part of the beat is silently
		// discarded; round 2 had it at 1500 and threw away the frames where the
		// pump reacts to being picked up. Play the beat you animated.
		await sleep(ORIGIN_SWITCH_AT);
		// the press is fully home and `--scale` is still 1, so the pivot can be
		// moved to the nozzle's corner without a single frame of jump
		from_corner = true;
		await sleep(HOSE_READY_AT - ORIGIN_SWITCH_AT);
		hose_ready = true;
		await sleep(2100 - HOSE_READY_AT);

		phase = 'pumping';
		// the readout takes the button here, at 0 %, and holds while he winds up
		percent_live = true;
		for (const b of PUMP_BEATS) {
			pumpStroke += 1;
			strokeMs = b.ms;
			strokeKind = b.kind;
			// the mascot's hands bottom out at IMPACT_AT of the beat's curve —
			// the button has to swell on that exact frame or the hit is a lie,
			// and the counter has to start climbing on that frame too rather
			// than predicting the stroke a beat early
			const hit = Math.round(b.ms * IMPACT_AT);
			await sleep(hit);
			rampPercent(b.pct_to, b.pct_ms, b.pct_step, b.pct_ease);
			if (b.pump) pumpCount += 1;
			await sleep(b.ms - hit);
		}

		// Pre-boom held breath. pumpStroke drops to 0, which puts the mascot
		// into its alarm beat — the anticipation for the flee. The readout is
		// already sitting on 100 % and stays there for the whole beat.
		pumpStroke = 0;
		await sleep(900);

		phase = 'boom';
		explosionTick++;
		await sleep(1500);

		phase = 'aftermath';
	}

	/**
	 * REPLAY A PRE-HYDRATION CLICK.
	 *
	 * The button is server-rendered, so it paints (and takes clicks) well before
	 * this component has a handler on it. The classic script at the bottom of
	 * `src/app.html` catches a click in that window and parks it on
	 * `window.__earlyClick`; this picks it up on the first frame we own the
	 * button and runs the sequence the visitor already asked for.
	 *
	 * The flag is CLEARED as it is read. It has to be: a client-side navigation
	 * away and back remounts this component in the same document, and a stale
	 * flag would detonate the button with no click — every time, forever.
	 */
	onMount(() => {
		const w = window as unknown as {
			__earlyClick?: string;
			__earlyClickOff?: () => void;
		};
		const early = w.__earlyClick;
		w.__earlyClick = undefined;
		w.__earlyClickOff?.();
		if (early === 'boom') {
			// he was already warned by whatever made him click
			warned = true;
			startDestruction();
		}
	});

	// ---- the hose → nozzle joint -------------------------------------------
	/**
	 * THE ONE JOINT THAT CANNOT BE AUTHORED BY HAND.
	 *
	 * The far end of the hose is drawn inside the mascot's SVG, which is placed
	 * in percentages of a `clamp()`ed box and letterboxed by `preserveAspectRatio`
	 * — so where a viewBox unit lands in stage pixels changes with the viewport.
	 * The nozzle end is a DOM box pinned to the balloon's left edge. Two
	 * different coordinate systems, one of them animated (`st-hose-a/b` swings
	 * the tube end every stroke) and the other one scaling to 3.2×: no pair of
	 * hand-authored offsets can hold them together, which is why every previous
	 * round measured a few px of daylight here.
	 *
	 * So the run of hose between them is not authored, it is SOLVED, every
	 * frame: measure both ends and fit a cubic that leaves the SVG tube on its
	 * own tangent and arrives at the fitting horizontally. `.hose-end` is a
	 * marker circle inside `.hose-b`, so it carries the hose's animation — and
	 * its own round cap covers the seam — for free.
	 */
	let nozzle_el = $state<HTMLElement | null>(null);
	let stage_el = $state<HTMLElement | null>(null);
	let bridge_d = $state('');
	/** how far in from the nozzle's left edge the hose actually plugs in */
	const LINK_INSET = 12;
	/**
	 * Belt and braces on top of the `hose_ready` mount gate: a hose runs roughly
	 * level from him to the fitting (the two ends stay inside ~40 px of each
	 * other vertically while he pumps), so any solve with the tube hundreds of
	 * pixels above the button is the airborne case and is not a hose. Hold the
	 * last good `d` rather than drawing it.
	 */
	const MAX_BRIDGE_RISE = 260;

	$effect(() => {
		if (phase !== 'awake' && phase !== 'pumping') return;
		const nozzle = nozzle_el;
		const stage = stage_el;
		if (!nozzle || !stage) return;
		let frame = 0;
		const tick = () => {
			const end = stage.querySelector('.hose-end');
			if (end) {
				const n = nozzle.getBoundingClientRect();
				const e = end.getBoundingClientRect();
				const st = stage.getBoundingClientRect();
				// both ends expressed in the stage's own box, so the <svg> can be a
				// plain `inset: 0` overlay with no transform of its own
				const px = n.left + LINK_INSET - st.left;
				const py = n.top + n.height / 2 - st.top;
				const ex = e.left + e.width / 2 - st.left;
				const ey = e.top + e.height / 2 - st.top;
				if (Math.abs(py - ey) <= MAX_BRIDGE_RISE) {
					// handle length: 45 % of the run, but never more than 42 % of the
					// horizontal span, or the two handles cross and the hose draws an S
					const k = Math.min(
						Math.hypot(px - ex, py - ey) * 0.45,
						Math.abs(px - ex) * 0.42,
					);
					const d =
						`M${ex.toFixed(1)} ${ey.toFixed(1)}` +
						`C${(ex + k).toFixed(1)} ${(ey + k * 0.22).toFixed(1)},` +
						`${(px - k).toFixed(1)} ${py.toFixed(1)},` +
						`${px.toFixed(1)} ${py.toFixed(1)}`;
					if (d !== bridge_d) bridge_d = d;
				}
			}
			frame = requestAnimationFrame(tick);
		};
		tick();
		return () => cancelAnimationFrame(frame);
	});

	// ---- contact form ------------------------------------------------------
	// One record so <Form> has a single data object to validate and submit over.
	let contact = $state({ name: '', email: '', message: '' });
	let sent = $state(false);
	// Network/server failures only — per-field problems render under their own
	// field via each Input's `parse`.
	let formError = $state('');

	/** Field validators run by <Form> on blur and again for every field on submit. */
	function requireText(what: string) {
		return (value: unknown) => {
			const text = typeof value === 'string' ? value.trim() : '';
			if (!text) throw new Error(`${what} isn't optional.`);
			return text;
		};
	}

	function parseEmail(value: unknown) {
		const text = typeof value === 'string' ? value.trim() : '';
		if (!text) throw new Error(`An email isn't optional — it's how I get back to you.`);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
			throw new Error('That address is missing something. Check the @ and the domain.');
		}
		return text;
	}

	/** SvelteKit's `error()` responds with `{ message }` — unwrap it so the
	 *  Callout shows the sentence and not the raw JSON. */
	async function readError(res: Response) {
		const txt = await res.text().catch(() => '');
		try {
			const parsed = JSON.parse(txt);
			if (parsed && typeof parsed.message === 'string') return parsed.message;
		} catch {
			// not JSON — fall through to the raw body
		}
		return txt || `Send failed (${res.status})`;
	}

	/**
	 * <Form> awaits this promise, which drives the submit <Button>'s spinner.
	 * Failures are caught rather than rethrown — an escaping rejection would
	 * surface as an unhandled one, and the message already lands in the Callout.
	 */
	async function submitContact() {
		formError = '';
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: contact.name.trim(),
					email: contact.email.trim(),
					message: contact.message.trim(),
				}),
			});
			if (!res.ok) throw new Error(await readError(res));
			sent = true;
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Send failed';
		}
	}

	function scrollNext() {
		const hero = document.getElementById('hero');
		// the hero is pinned inside .hero-pin — skip past the whole pin zone
		const pin = hero?.closest('.hero-pin') ?? hero;
		const next = pin?.nextElementSibling as HTMLElement | null;
		const target = next ?? pin;
		if (!target) return;
		const top = target.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top });
	}
</script>

<div
	class="hero-pin"
	class:unpinned={phase === 'boom' || phase === 'aftermath'}
	bind:this={pinRef}>
	<section
		class="hero"
		id="hero"
		data-section
		data-section-label="Delivering Delight"
		data-section-year={currentYear}
		class:shake={phase === 'boom'}
		class:low-fx={lowFx}
		data-phase={phase}>
		<div
			class="starfield"
			class:scattering={phase === 'boom' || phase === 'aftermath'}
			aria-hidden="true">
			<div class="star-warp" class:ghost={canvasActive} bind:this={warpRef}>
				{#each stars as star, i (star.id)}
					<img
						class="star"
						class:spawned={star.spawned}
						src="{mediaBase}{star.src}"
						alt=""
						loading={i < 8 ? 'eager' : 'lazy'}
						fetchpriority={i < 4 ? 'high' : 'auto'}
						decoding="async"
						style:--x="{star.x}%"
						style:--y="{star.y}%"
						style:--w={star.w}
						style:--ar={star.ar}
						style:--rot="{star.rot}deg"
						style:--u0={seededU[i]}
						style:--drift={star.drift}
						style:transform={seedStyles[i].transform}
						style:opacity={seedStyles[i].opacity}
						style:filter={seedStyles[i].filter}
						style:--blast-spin="{star.rot * 8}deg"
						style:--blast-delay="{(i % 9) * 22}ms" />
				{/each}
			</div>
			<!-- the canvas the warp loop paints once its sprites are ready; the
			     DOM field above goes `ghost` (visibility, not display — the
			     boom blast needs its layout intact) the same frame -->
			<canvas class="warp-canvas" class:on={canvasActive} bind:this={canvasRef}></canvas>
			<div class="vignette"></div>
		</div>

		<!-- BEFORE: the original content (badge, headline, lede, button) -->
		{#if phase !== 'aftermath'}
			<div
				class="hero-inner before"
				class:staged={phase === 'awake' || phase === 'pumping'}
				class:exploding={phase === 'boom'}
				bind:this={beforeRef}>
				<div class="badge" data-frag>
					<span class="avatar" aria-hidden="true">
						<!-- the -thumb is a 96px avif cut for this ~40px circle; the
						     original 93KB file stays for anything that needs it full-size -->
						<img
							src="/profile_picture2-thumb.avif"
							alt="Selfie of Brian Schwabauer"
							width="96"
							height="96"
							loading="eager"
							decoding="async" />
					</span>
					<span>Hi, I'm Brian Schwabauer</span>
				</div>

				<h1 data-frag>
					<span class="grad">Delivering</span>
					<span class="grad accent">Delight</span>
				</h1>

				<p class="lede" data-frag>
					For as long as I can remember, I've loved to make things — short films, Flash
					games, websites, products. I live to create. I work to delight.
				</p>

				<div class="button-stage" data-frag bind:this={stage_el}>
					<!-- THE BALLOON RIG. The button carries the INFLATION (scale only,
					     about its bottom-left corner, which is the corner the nozzle is
					     welded to). Every translation — the per-stroke wobble, the
					     over-pressure shudder, the press — lives on this wrapper instead,
					     so the nozzle is a sibling that receives exactly the same motion.
					     It used to sit outside all of it: a `translateY(-4px)` written
					     INSIDE `transform: scale(3.2)` moved the button 12.8 px while the
					     nozzle held still, which is most of the daylight the client kept
					     seeing at the hose end. -->
					<div
						class="balloon"
						class:pre-press={prePress}
						class:wobble-a={phase === 'pumping' && pumpCount % 2 === 1}
						class:wobble-b={phase === 'pumping' && pumpCount > 0 && pumpCount % 2 === 0}
						class:shudder={phase === 'pumping' && pumpCount >= 4}>
						<button
							class="boom-btn"
							class:warn={warned}
							class:from-corner={from_corner}
							class:popped={phase === 'boom'}
							type="button"
							data-early-click="boom"
							onmouseenter={() => {
								warned = true;
								preloadDestruction();
							}}
							onmouseleave={() => (warned = phase !== 'idle')}
							onfocus={() => {
								warned = true;
								preloadDestruction();
							}}
							onpointerdown={() => preloadDestruction()}
							onclick={startDestruction}
							disabled={phase !== 'idle'}
							aria-label={phase === 'idle'
								? buttonLabel
								: 'Button pushed — demonstration playing'}
							style:--scale={buttonScale}
							{@attach ripple({ enabled: phase === 'idle', zIndex: 1, opacity: 0.14 })}>
							<span class="boom-btn-skin"></span>
							<!-- NOT a live region. Once the sequence is running the readout
							     changes ten times in ten seconds; announcing every one of
							     them turns a decorative gag into ten interruptions. The
							     button's own `aria-label` carries the state that matters —
							     the invitation while it is idle, then one static statement
							     that the demonstration is playing. -->
							<span class="boom-btn-label">
								{#if percent_live}
									<!-- THE READOUT. Not inside a `{#key}`: keying it on the
									     value would destroy and recreate the node on every
									     tick, which is precisely the label FLIP the phrases
									     use and the one thing the number must not do. The
									     element mounts once and its text node is patched in
									     place, so the digits change where they stand. The
									     flicker is restarted by alternating two identical
									     animations on `tick_parity` — the same trick the
									     wobble uses, for the same reason. -->
									<span class="boom-btn-count">
										<span
											class="count-num"
											class:tick-a={tick_parity}
											class:tick-b={!tick_parity}>
											{percent}
										</span>
										<span class="count-unit">% Complete</span>
									</span>
								{:else}
									{#key buttonLabel}
										<span class="boom-btn-text">{buttonLabel}</span>
									{/key}
								{/if}
							</span>
						</button>

						<!-- The valve the mascot's hose plugs into. Inside the balloon so it
						     rides every wobble and shudder the button does, but OUTSIDE the
						     button so it never rides the inflation scale. The run of hose
						     that reaches it is `.hose-bridge` below, solved per frame. -->
						<span class="nozzle" aria-hidden="true" bind:this={nozzle_el}>
							<svg viewBox="0 0 32 26">
								<rect x="20" y="7" width="12" height="12" rx="2" />
								<rect x="11" y="3" width="10" height="20" rx="3" />
								<rect x="4" y="8" width="8" height="10" rx="2" />
								<rect class="nozzle-hi" x="13.5" y="6" width="3" height="14" rx="1.5" />
							</svg>
						</span>
					</div>

					<!-- THE BRIDGE. The run of hose between the mascot's tube and the
					     fitting, drawn in the stage's own coordinate box so it can span two
					     different coordinate systems. It is a CURVE, solved to both
					     endpoints every frame: it leaves the SVG tube on that tube's own
					     tangent and arrives at the fitting dead horizontal, so nothing
					     kinks at either joint, and it sags a little under its own weight
					     the way a hose does. A straight capsule was tried first and read as
					     a scaffold pole — at this staging the run is ~245 px, far too long
					     to be a butt joint.

					     GATED ON `hose_ready`, NOT JUST ON THE PHASE. He arrives carrying
					     the pump, so from frame 0 of `awake` the solved run is 738 px long
					     and 733 px tall — a grey scaffold pole through the headline for the
					     whole descent. It does not exist until he is standing on his mark.
					     `.nozzle`'s opacity delay is the same 620 ms; keep them equal. -->
					{#if hose_ready && (phase === 'awake' || phase === 'pumping')}
						<svg class="hose-bridge" aria-hidden="true">
							<path class="bridge-line" d={bridge_d} />
							<path class="bridge-core" d={bridge_d} />
						</svg>
					{/if}

					<!-- THE RUPTURE. Not a burst drawn near the button — the button's
					     own shell, cut into wedges by clip-path and thrown outward. Each
					     shard is a real copy of the skin at the size the balloon actually
					     reached, so the debris IS the thing that broke. -->
					{#if phase === 'pumping' || phase === 'boom'}
						<!-- mounted a beat EARLY and held paused on frame 0 (which is the
						     intact button), so the burst frame costs no DOM insertion,
						     style recalc or first paint — it only flips two classes -->
						<div
							class="shards"
							class:live={phase === 'boom'}
							aria-hidden="true"
							style:--scale={buttonScale}>
							{#each SHELL_SHARDS as shard, i (i)}
								<span
									class="shard"
									style:clip-path={shard.clip}
									style:--dx="{shard.dx}px"
									style:--dy="{shard.dy}px"
									style:--rot="{shard.rot}deg"
									style:animation-delay="{shard.delay}ms">
								</span>
							{/each}
						</div>
					{/if}

					{#if MascotComp}
						<MascotComp
							{phase}
							{pumpCount}
							{pumpStroke}
							{strokeMs}
							{strokeKind}
							{buttonScale} />
					{/if}
				</div>
			</div>
		{/if}

		{#if ExplosionComp}
			<ExplosionComp trigger={explosionTick} origin={{ x: 0.5, y: 0.62 }} />
		{/if}

		<!-- AFTERMATH: shown after the dust settles -->
		{#if phase === 'aftermath'}
			<div class="hero-inner aftermath">
				<h1 class="aftermath-h1">
					<span class="line line-1">You destroyed</span>
					<span class="line line-2">my site.</span>
				</h1>
				<p class="aftermath-lede">
					Well&hellip; I told you not to press the button 🤣. Anyway, now that you've
					destroyed my website, let's build something new together. Let me know your
					name/email and I'll get back to you.
				</p>

				<div class="contact-form">
					{#if sent}
						<div class="form-success">
							<svg viewBox="0 0 24 24" aria-hidden="true" class="success-check">
								<path
									d="M4 12 L10 18 L20 6"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
									stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
							<h3>Message received.</h3>
							<p>Thanks, {contact.name.trim() || 'friend'}. I'll be in touch soon.</p>
						</div>
					{:else}
						<Form data={contact} onsubmit={submitContact}>
							<Input
								name="name"
								label="Your name"
								label_display="pinned"
								bind:value={contact.name}
								maxlength={100}
								filled
								placeholder="Johnny Appleseed"
								parse={requireText('A name')} />
							<Input
								name="email"
								type="email"
								label="Email"
								label_display="pinned"
								bind:value={contact.email}
								maxlength={200}
								filled
								placeholder="johnny@example.com"
								parse={parseEmail} />
							<Input
								name="message"
								type="textarea"
								label="Message"
								label_display="pinned"
								rows={4}
								bind:value={contact.message}
								maxlength={5000}
								show_counter
								filled
								placeholder="Tell me about your idea, the dream, or just say hi."
								parse={requireText('A message')} />

							<Expand show={!!formError}>
								<Callout error dense>{formError}</Callout>
							</Expand>

							<Button accent full_width size="2" type="submit">
								{#snippet children({ isLoading, isLoadingSuccess })}
									{isLoading ? 'Sending…' : isLoadingSuccess ? 'Sent' : 'Send it'}
									{#if !isLoading && !isLoadingSuccess}
										<svg class="send-arrow" viewBox="0 0 24 24" aria-hidden="true">
											<path
												d="M5 12h14M13 6l6 6-6 6"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									{/if}
								{/snippet}
							</Button>
						</Form>
					{/if}
				</div>
			</div>
		{/if}

		<button
			bind:this={cueRef}
			class="scroll-cue"
			class:hidden={phase === 'boom'}
			type="button"
			onclick={scrollNext}
			aria-label="Scroll to next section">
			<span class="cue-label">More below</span>
			<span class="cue-arrow" aria-hidden="true">
				<svg viewBox="0 0 24 24">
					<path
						d="M6 9l6 6 6-6"
						fill="none"
						stroke="currentColor"
						stroke-width="2.4"
						stroke-linecap="round"
						stroke-linejoin="round" />
				</svg>
			</span>
		</button>
	</section>
</div>

<style>
	/* The hero pins in place while the page scrolls under it for an extra
	   --pin-scroll of distance, so the scroll-driven starfield surge has room
	   to be felt before the page moves on to the next section. */
	.hero-pin {
		min-height: calc(100svh + var(--pin-scroll, 650px));
	}
	/* Once the button is pushed, release the pin so the (taller) aftermath
	   content scrolls freely instead of being trapped behind the fold. */
	.hero-pin.unpinned {
		min-height: 0;
	}
	.hero {
		position: sticky;
		top: 0;
		min-height: 100svh;
		display: flex;
		align-items: center;
		justify-content: center;
		/* tight side gutters so the headline can run near the screen edges */
		padding: 5rem 1rem 6rem;
		overflow: hidden;
		isolation: isolate;
		color: #fff;
	}
	/* camera shake on boom */
	.hero.shake {
		animation: cam-shake 720ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
	@keyframes cam-shake {
		0% {
			transform: translate(0, 0);
		}
		10% {
			transform: translate(-6px, 3px) rotate(-0.4deg);
		}
		20% {
			transform: translate(8px, -4px) rotate(0.5deg);
		}
		30% {
			transform: translate(-9px, 6px) rotate(-0.6deg);
		}
		40% {
			transform: translate(7px, 5px) rotate(0.4deg);
		}
		50% {
			transform: translate(-5px, -3px) rotate(-0.3deg);
		}
		60% {
			transform: translate(4px, 4px) rotate(0.3deg);
		}
		70% {
			transform: translate(-3px, -2px);
		}
		80% {
			transform: translate(2px, 2px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	.starfield {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;

		/* THE TILE UNIT — every dimension in the field is struck off this, so
		   the field keeps one set of proportions at every viewport width.

		   The upper bound is `max(132px, 6.875vw)` rather than a flat 132px
		   because 132px IS 6.875vw at 1920, which is the width the field was
		   composed at. A flat cap froze the tiles at 132 device-independent px,
		   so a 3840-wide viewport got the same tiles in twice the frame and the
		   field read as gravel. Above 1920 the `vw` term takes over and the
		   field scales with the screen; below it, `max()` holds the 132px cap
		   and nothing about the existing look changes.

		   The tunnel itself needs no such treatment: the perspective scale
		   factor p/(p−z) is dimensionless, and every anchor is a percentage, so
		   scaling this one length scales the whole field uniformly. */
		--star-unit: clamp(62px, 9vw, max(132px, 6.875vw));
	}
	/* the 3D stage. perspective + a single centred vanishing point make every
	   tile stream straight out from behind the headline; preserve-3d depth-
	   sorts the tiles so a nearer (larger) one always paints over a farther
	   one. overflow MUST stay off this element — any clip flattens the 3D. */
	.star-warp {
		position: absolute;
		inset: 0;
		perspective: 28rem;
		perspective-origin: 50% 50%;
		transform-style: preserve-3d;
	}
	.star {
		position: absolute;
		left: var(--x);
		top: var(--y);
		display: block;
		width: calc(var(--w, 1) * var(--star-unit));
		/* a global `img { max-width: 100% }` would otherwise fight the
		   explicit width as perspective scales the tile up */
		max-width: none;
		/* THE TILE DECLARES ITS OWN BOX — see TILE_RATIOS. `height: auto` would
		   ask the image, and an image that has not arrived answers zero, so on a
		   cold load every tile lays out flat and snaps open as its header lands.
		   This way the box in the SSR HTML is the final box, and no image can
		   ever move a tile by turning up. */
		aspect-ratio: var(--ar, 1.5);
		height: auto;
		object-fit: cover;
		/* radius and shadow are struck off the same unit as the width — a
		   fixed 7px radius on a tile scaled 2× is a corner half as round */
		border-radius: calc(var(--star-unit) * 0.053);
		box-shadow:
			0 0 calc(var(--star-unit) * 0.258) rgba(0, 244, 195, 0.22),
			0 calc(var(--star-unit) * 0.076) calc(var(--star-unit) * 0.242) rgba(0, 0, 0, 0.5);
		transform: translate(-50%, -50%);
		transform-origin: center;
		will-change: transform, opacity;
		opacity: 0;
		/* Before hydration this CSS animation runs the idle drift, so the field
		   is alive the instant the page paints — no waiting for JS. --u0 (the
		   seeded warp position) offsets each tile via a negative delay. Once
		   the JS warp loop mounts it reads each tile's progress, sets
		   `animation: none`, and drives transform/opacity/filter itself. */
		animation: star-warp-idle calc(var(--drift, 20) * 1s) linear infinite;
		animation-delay: calc(var(--u0, 0) * var(--drift, 20) * -1s);
	}
	/* A clicked tile is the loop's from birth — it never rode the CSS drift, and
	   letting the drift have it for the one frame between Svelte inserting the
	   element and the next rAF would paint it full-size before it has swelled. */
	.star.spawned {
		animation: none;
	}
	/* the idle drift, kept in exact step with starVisual() in the script (same
	   breakpoints, linear between) so the JS loop can take over mid-stream */
	@keyframes star-warp-idle {
		0% {
			transform: translate(-50%, -50%) translateZ(-260px) rotate(var(--rot, 0deg));
			opacity: 0;
			filter: saturate(0.45) brightness(0.7);
		}
		12% {
			transform: translate(-50%, -50%) translateZ(-190.4px) rotate(var(--rot, 0deg));
			opacity: 0.9;
			filter: saturate(1.1) brightness(0.766);
		}
		72% {
			transform: translate(-50%, -50%) translateZ(157.6px) rotate(var(--rot, 0deg));
			opacity: 0.9;
			filter: saturate(1.1) brightness(1.096);
		}
		100% {
			transform: translate(-50%, -50%) translateZ(320px) rotate(var(--rot, 0deg));
			opacity: 0;
			filter: saturate(1.1) brightness(1.25);
		}
	}
	/* The canvas half of the handover: both live in the DOM the whole time,
	   and one class flip swaps which is visible. */
	.warp-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		visibility: hidden;
	}
	.warp-canvas.on {
		visibility: visible;
	}
	.star-warp.ghost {
		visibility: hidden;
	}

	/* ---- ADAPTIVE LOW-FX MODE ----
	   Flipped on by the warp loop when the device keeps missing frames (and
	   remembered for the session). The starfield zoom itself is untouched;
	   what goes is the per-frame GPU spend around it, each swapped for a
	   static stand-in a viewer at 30fps was never going to tell apart. */

	/* Both backdrop blurs sit directly over the animating field, so the
	   browser re-blurs their backdrops EVERY frame, full-time. A slightly
	   stronger plain fill reads the same at a glance and costs nothing. */
	.hero.low-fx .badge {
		backdrop-filter: none;
		background: rgba(255, 255, 255, 0.1);
	}
	.hero.low-fx .boom-btn-skin {
		backdrop-filter: none;
		background-color: rgb(255 255 255 / 0.92);
	}
	/* The teal glow is a large-blur shadow rasterised around every tile —
	   the single most expensive pixel in each tile's layer. The dark drop
	   shadow stays: it is what seats a tile IN the tunnel. */
	.hero.low-fx .star {
		box-shadow: 0 calc(var(--star-unit) * 0.076) calc(var(--star-unit) * 0.242)
			rgba(0, 0, 0, 0.5);
	}

	/* Mobile keeps the GPU happy by skipping the back half of the field —
	   display:none drops them out of compositing entirely. Anchors are
	   still placed against all 24 so the visible 12 stay well-spread. */
	@media (max-width: 767px) {
		/* `.spawned` is exempt: a tile the visitor asked for by tapping has to
		   appear, and it is one at a time rather than a standing dozen. */
		.star:nth-child(n + 13):not(.spawned) {
			display: none;
		}
	}
	/* when boom triggers, kill the warp loop and blast each star outward */
	.starfield.scattering .star {
		animation: star-blast 1150ms cubic-bezier(0.34, 1.15, 0.5, 1) forwards;
		animation-delay: var(--blast-delay, 0ms);
		/* The blast blow-out is a STATIC filter, not an animated one. Animating
		   brightness/saturate/blur across 24 image elements re-rasterises all of
		   them every frame, and `boom` was the only phase in the shot dropping
		   frames — one interval at 93ms on the money frame. Interpolating only
		   transform and opacity keeps the burst on the compositor. */
		filter: brightness(2.2) saturate(1.4);
		will-change: transform, opacity;
	}
	@keyframes star-blast {
		0% {
			opacity: 0.9;
			transform: translate(-50%, -50%) translateZ(0) rotate(var(--rot, 0deg));
		}
		30% {
			opacity: 1;
			transform: translate(-50%, -50%) translateZ(150px) rotate(var(--rot, 0deg));
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) translateZ(540px)
				rotate(calc(var(--rot, 0deg) + var(--blast-spin, 0deg)));
		}
	}
	.vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				ellipse at center,
				transparent 0%,
				rgba(8, 8, 14, 0.78) 65%,
				#06060a 100%
			),
			radial-gradient(circle at 20% 30%, rgba(108, 99, 255, 0.18), transparent 55%),
			radial-gradient(circle at 80% 70%, rgba(0, 244, 195, 0.16), transparent 55%);
		pointer-events: none;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		max-width: 64rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
	}

	/* ----- BEFORE content ----- */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.95rem 0.5rem 0.35rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: var(--font-mono);
		font-size: 0.9rem;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
		span:not(.avatar) {
			text-box: trim-both cap alphabetic;
		}
	}
	.avatar {
		position: relative;
		display: inline-block;
		border-bottom-left-radius: 20px;
		overflow: hidden;
		flex-shrink: 0;
		isolation: isolate;
		width: 60px;
		height: 60px;
		margin: -30px 0 -10px -4px;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	h1 {
		font-family: 'Nunito Sans', sans-serif;
		font-size: clamp(3rem, 19vw, 5.5rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		margin: 0.4rem 0 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	@media (min-width: 768px) {
		h1 {
			font-size: clamp(6rem, 11vw, 9rem);
		}
	}
	.grad {
		padding-bottom: 0.18em;
		background: linear-gradient(95deg, #ffffff 20%, #00f2c3 70%, #6c63ff 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.grad + .grad {
		margin-top: -0.18em;
	}
	.grad.accent {
		background: linear-gradient(95deg, #00f2c3, #6c63ff 80%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		max-width: 44rem;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.75);
		margin: 0;
		transition: filter 420ms ease;
	}
	/* Staging: the mascot stands in front of this paragraph for his whole
	   performance, so the two most detailed things on the screen were stacked on
	   each other and neither read. He is the subject once he is on stage — the
	   copy steps back and comes straight back when he leaves. Dimmed through
	   `filter`, not `opacity`, because the scroll reveal owns `.lede`'s inline
	   opacity and an inline declaration beats any rule we could write here. */
	.before.staged .lede,
	.before.exploding .lede {
		filter: blur(1.6px) opacity(0.24);
	}

	/* ---- The big red button ---- */
	.button-stage {
		position: relative;
		display: inline-flex;
		justify-content: center;
		align-items: flex-end;
		margin-top: 0.8rem;
		min-height: 80px;
		min-width: 280px;
		/* anchor the absolutely-positioned mascot inside this stage so the
		   mascot rises from behind the button rather than from the bottom
		   of the entire hero section. */
		isolation: isolate;
		/* gives the button's :active z-translate something to recede into —
		   same trick delightstack's <Button> wrapper uses. */
		perspective: 100px;
	}
	/* The rig the button and its nozzle share. Its box is exactly the button's
	   untransformed box, so the button's `scale()` about `0% 100%` leaves this
	   wrapper's bottom-left corner — and therefore the nozzle — exactly where it
	   was, at every inflation. Everything that TRANSLATES the balloon lives here;
	   only the scale lives on the button. */
	.balloon {
		position: relative;
		display: inline-flex;
		align-items: flex-end;
	}
	.boom-btn {
		--scale: 1;
		/* Same corner treatment as a delightstack <Button>: a modest radius,
		   doubled and drawn as a superellipse where corner-shape is supported
		   (unsupported browsers keep the plain radius). */
		--_radius: var(--action-radius, var(--radius-lg));
		position: relative;
		z-index: 5;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		appearance: none;
		border: none;
		background: transparent;
		color: #052028;
		font: inherit;
		font-weight: 800;
		font-size: 1rem;
		letter-spacing: 0.02em;
		/* fixed footprint so the label can swap without resizing; wide enough
		   for the longest label ("Don't push this button"), and capped to the
		   viewport so it never overflows a narrow phone */
		width: min(280px, 80vw);
		height: 56px;
		padding: 0 1.4rem;
		border-radius: var(--_radius);
		@supports (corner-shape: squircle) {
			corner-shape: squircle;
			border-radius: calc(var(--_radius) * var(--squircle-ratio, 2));
		}
		cursor: pointer;
		/* other feedback (squish, label swap) covers the press — no tap flash */
		-webkit-tap-highlight-color: transparent;
		/* TWO ORIGINS, ONE AT A TIME. The press has to squish from the MIDDLE —
		   a button that shrinks toward its bottom-left corner under your cursor
		   reads as sliding away, not as being pushed. The inflation has to grow
		   from `0% 100%`, because that is the one corner the nozzle is welded to
		   (and the corner `.shards`' fan tiles from). So the button starts
		   centred, and `.from-corner` moves the origin later — see
		   `ORIGIN_SWITCH_AT`. The handover is invisible because it happens while
		   the computed transform is `scale(1)`, i.e. the identity: with no scale
		   to pivot, the origin has nothing to move. */
		transform-origin: 50% 50%;
		transform: scale(var(--scale));
		transition:
			transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
			color 220ms ease,
			translate 140ms ease-out,
			scale 140ms ease-out;
		will-change: transform;
	}
	/* The press: a small squash plus a drop and a recede along z (against the
	   stage's perspective), so the button sinks under the cursor. `translate`
	   and `scale` are their own properties, so they compose with the
	   scale/wobble transforms above instead of fighting them — and unlike the
	   hover colour, the press is *animated* both ways (140ms down, 140ms back)
	   so it reads as physical rather than as a jump. */
	.boom-btn:active:not(:disabled) {
		translate: 0px 1px clamp(-10px, calc(0.2em - 12px), -2px);
		scale: 0.97;
	}
	/* The inflation origin. Applied ONLY once the press has fully returned to
	   resting scale (see `ORIGIN_SWITCH_AT`), and never removed afterwards —
	   from here on every scale in the shot (wobble, shudder, burst, the fan)
	   pivots on the corner the nozzle holds. */
	.boom-btn.from-corner {
		transform-origin: 0% 100%;
	}
	.boom-btn:disabled {
		cursor: default;
	}
	.boom-btn-skin {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		@supports (corner-shape: squircle) {
			corner-shape: inherit;
		}
		background-color: rgb(255 255 255 / 0.8);
		backdrop-filter: blur(10px);
		transition: background-color 300ms ease;
	}
	/* The fitting. Bolted to the balloon's bottom-left corner — the one corner
	   the inflation cannot move, because the button scales about `0% 100%`. */
	.nozzle {
		position: absolute;
		left: -30px;
		bottom: 18px;
		width: 32px;
		height: 26px;
		z-index: 6;
		pointer-events: none;
		opacity: 0;
		transition: opacity 300ms ease;
	}
	/* IN THE HOSE'S OWN GREY FAMILY, not the page's. The fitting used to be
	   #2f3648 filled and #10141f stroked on a rgb(13,15,28) stage — three values
	   darker than the `oklch(0.38 …)` hose it joins, so the last inch of the run
	   dropped into the background and the line read as dying just before it
	   arrived, even though the geometry was solved. It is machined metal at the
	   end of a rubber hose, so it sits one step LIGHTER than the tube, with the
	   same hue and chroma, and carries the tube's own highlight value. */
	.nozzle svg {
		position: relative;
		width: 100%;
		height: 100%;
		display: block;
		fill: oklch(0.46 0.007 250);
		stroke: oklch(0.27 0.008 250);
		stroke-width: 1.6;
	}
	.nozzle .nozzle-hi {
		fill: oklch(0.72 0.008 250 / 0.55);
		stroke: none;
	}
	/* The bridge run of hose. Same two-pass construction as the tube inside the
	   mascot's SVG — a wide dark stroke with a thin light core — and the same
	   `--steel-2` / `--steel-hi` values, so the two halves read as one object
	   rather than as two objects that meet. Under the mascot (z 6) and under the
	   button (z 5), because the hose comes out from behind him and plugs in
	   under the fitting. */
	.hose-bridge {
		position: absolute;
		inset: 0;
		z-index: 4;
		overflow: visible;
		pointer-events: none;
		fill: none;
		stroke-linecap: round;
	}
	.bridge-line {
		stroke: oklch(0.38 0.006 250);
		stroke-width: 15;
	}
	.bridge-core {
		stroke: oklch(0.68 0.008 250 / 0.5);
		stroke-width: 4;
	}
	/* He brings the pump in with him, so during the fall the hose is up in the
	   sky with him and the link would have to stretch 700 px to reach it. The
	   fitting therefore does not appear until he is standing on his mark —
	   620 ms is the 420 ms fall plus the compression and the push back up. It
	   leaves instantly on the way out, which is why the delay is on this rule
	   and not on the base `transition`. */
	.hero[data-phase='awake'] .nozzle,
	.hero[data-phase='pumping'] .nozzle {
		opacity: 1;
		transition: opacity 260ms ease 620ms;
	}

	.boom-btn-label {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.boom-btn-text {
		grid-area: 1 / 1;
		display: inline-block;
		white-space: nowrap;
		animation: label-swap 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes label-swap {
		0% {
			opacity: 0;
			transform: translateY(110%);
			filter: blur(4px);
		}
		60% {
			opacity: 1;
			transform: translateY(-6%);
			filter: blur(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	/* THE READOUT — a number that TICKS, deliberately not a label that flips.
	   It arrives on `label-swap` (one mount, one run) so the handover from
	   "Demolition started" matches the phrase before it, and from then on the
	   digits change in place. The `label-swap` keyframes and `.boom-btn-text`
	   above are untouched and byte-identical to HEAD — the client has chosen
	   that transition twice. */
	.boom-btn-count {
		grid-area: 1 / 1;
		display: inline-flex;
		align-items: baseline;
		white-space: nowrap;
		/* every digit the same advance, so 9 → 10 → 100 cannot shuffle the
		   glyphs to its right */
		font-variant-numeric: tabular-nums;
		animation: label-swap 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	/* A FIXED SLOT, right-aligned — the instrument idiom, and the reason the
	   string's width is constant from 0 % to 100 %. `.boom-btn` is a fixed
	   280 px box, so nothing here could reflow the layout; what this prevents
	   is the label sliding sideways under itself as a digit is gained. */
	.count-num {
		display: inline-block;
		min-width: 3ch;
		text-align: right;
		font-variant-numeric: tabular-nums;
		transform-origin: 50% 58%;
	}
	/* the unit is the quiet half of a readout — the value leads */
	.count-unit {
		opacity: 0.58;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	/* Two identical animations under different names, alternated by
	   `tick_parity`, so each tick RESTARTS the flicker without the node being
	   replaced. On a fast run the restarts overlap and the digits simply stay
	   hot and slightly proud; on the last tick of a beat it settles — so the
	   readout visibly cools as each stroke's pressure runs out. */
	.count-num.tick-a {
		animation: count-tick-a 190ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	.count-num.tick-b {
		animation: count-tick-b 190ms cubic-bezier(0.22, 1, 0.36, 1);
	}
	@keyframes count-tick-a {
		0% {
			transform: scale(1.2);
			color: oklch(0.58 0.19 38);
		}
		100% {
			transform: scale(1);
			color: inherit;
		}
	}
	@keyframes count-tick-b {
		0% {
			transform: scale(1.2);
			color: oklch(0.58 0.19 38);
		}
		100% {
			transform: scale(1);
			color: inherit;
		}
	}

	/* idle invitation pulse */
	.boom-btn:not(:disabled) {
		animation: invite 2.6s ease-in-out infinite;
	}
	@keyframes invite {
		0%,
		100% {
			transform: scale(var(--scale)) translateY(0);
		}
		50% {
			transform: scale(calc(var(--scale) * 1.03)) translateY(-2px);
		}
	}

	/* Instant on hover-in, fades back out over the skin's own 300ms — no glow,
	   just the colour change, the way a delightstack <Button> behaves. */
	.boom-btn:hover:not(:disabled) .boom-btn-skin {
		transition-duration: 0s;
		background-color: white;
	}
	.boom-btn.warn {
		color: #052028;
	}
	.balloon.pre-press .boom-btn {
		animation: none;
		transform: scale(calc(var(--scale) * 0.88));
		transition:
			transform 120ms ease-out,
			translate 140ms ease-out,
			scale 140ms ease-out;
	}
	.balloon.pre-press {
		transform: translateY(2px);
		transition: transform 120ms ease-out;
	}

	/* Wobble on every landed stroke — overlap/follow-through. Two identical
	   animations under different names, alternated by pump parity, because a
	   single latching class would only ever fire once.

	   SPLIT IN TWO. The bounce (a translate) runs on the balloon so the nozzle
	   comes with it; the squash (a scale) runs on the button so the nozzle does
	   not. Both halves share the beat and the easing, so they still read as one
	   wobble. Written as one translate curve because the wrapper is shared. */
	.balloon.wobble-a,
	.balloon.wobble-b {
		animation: bal-bounce 480ms cubic-bezier(0.36, 1.4, 0.4, 1) 1;
	}
	.balloon.wobble-b {
		animation-name: bal-bounce-b;
	}
	.balloon.wobble-a .boom-btn {
		animation: btn-wobble-a 480ms cubic-bezier(0.36, 1.4, 0.4, 1) 1;
	}
	.balloon.wobble-b .boom-btn {
		animation: btn-wobble-b 480ms cubic-bezier(0.36, 1.4, 0.4, 1) 1;
	}
	@keyframes bal-bounce {
		0% {
			transform: translateY(4px);
		}
		40% {
			transform: translateY(-4px);
		}
		70% {
			transform: translateY(2px);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes bal-bounce-b {
		0% {
			transform: translateY(4px);
		}
		40% {
			transform: translateY(-4px);
		}
		70% {
			transform: translateY(2px);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes btn-wobble-a {
		0% {
			transform: scale(calc(var(--scale) * 0.85));
		}
		40% {
			transform: scale(calc(var(--scale) * 1.12));
		}
		70% {
			transform: scale(calc(var(--scale) * 0.96));
		}
		100% {
			transform: scale(var(--scale));
		}
	}
	@keyframes btn-wobble-b {
		0% {
			transform: scale(calc(var(--scale) * 0.85));
		}
		40% {
			transform: scale(calc(var(--scale) * 1.12));
		}
		70% {
			transform: scale(calc(var(--scale) * 0.96));
		}
		100% {
			transform: scale(var(--scale));
		}
	}
	/* The shudder moves the whole balloon rig — button AND nozzle — so an
	   over-pressure shake can never open the joint. It lives on the wrapper
	   rather than inside the button's `transform: scale(3.2)`, where a 2 px
	   shake was multiplied into a 6.4 px one. */
	.balloon.shudder {
		animation: btn-shudder 220ms ease infinite;
	}
	@keyframes btn-shudder {
		0%,
		100% {
			translate: 0 0;
		}
		25% {
			translate: -1px -1px;
		}
		50% {
			translate: 1px 1px;
		}
		75% {
			translate: -1px 2px;
		}
	}

	/* THE RUPTURE, not a vanish. The button over-inflates for two frames — the
	   last thing an over-pressured shell does before it goes — and then hard
	   cuts on ONE frame as the shards take over. The old 12× collapse between
	   two consecutive frames read as the object being deleted. */
	.boom-btn.popped {
		animation: btn-burst 120ms cubic-bezier(0.5, 0, 0.9, 0.4) forwards;
		pointer-events: none;
	}
	@keyframes btn-burst {
		0% {
			transform: scale(var(--scale));
			opacity: 1;
		}
		70% {
			transform: scale(calc(var(--scale) * 1.075));
			opacity: 1;
		}
		/* one frame of hard cut — the shards are already in place underneath */
		71%,
		100% {
			transform: scale(calc(var(--scale) * 1.075));
			opacity: 0;
		}
	}

	/* The shell. Same box, same corner treatment, same skin colour and the same
	   transform-origin as the button, so the fan tiles the balloon exactly at
	   t = 0 and there is no jump between the intact object and its pieces. */
	.shards {
		--scale: 1;
		position: absolute;
		z-index: 5;
		left: 50%;
		bottom: 0;
		width: min(280px, 80vw);
		height: 56px;
		pointer-events: none;
		opacity: 0;
		/* `translate` composes BEFORE `transform`, so the box is centred exactly
		   where the button's untransformed box is, and then scales from the same
		   0% 100% origin the button inflates from */
		translate: -50% 0;
		transform-origin: 0% 100%;
		transform: scale(var(--scale));
	}
	.shard {
		--dx: 0px;
		--dy: 0px;
		--rot: 0deg;
		position: absolute;
		inset: 0;
		border-radius: var(--action-radius, var(--radius-lg));
		/* The button's own skin, hot at the break. The heat is baked into the
		   gradient rather than animated with `filter: brightness()`: `boom` is the
		   only phase in the shot that drops frames, and a filter on nine full-size
		   clipped boxes re-rasterises all of them every frame. Only transform and
		   opacity animate here. */
		background: linear-gradient(
			100deg,
			rgb(255 255 255 / 0.96) 0%,
			rgb(255 250 236 / 0.84) 46%,
			rgb(214 225 236 / 0.82) 100%
		);
		animation: shard-fly 880ms cubic-bezier(0.12, 0.62, 0.32, 1) both;
		animation-play-state: paused;
		will-change: transform, opacity;
	}
	.shards.live {
		opacity: 1;
	}
	.shards.live .shard {
		animation-play-state: running;
	}
	@keyframes shard-fly {
		0% {
			transform: translate(0, 0) rotate(0deg);
			opacity: 1;
		}
		/* the shell separates before it tumbles — pressure first, gravity after */
		9% {
			transform: translate(calc(var(--dx) * 0.16), calc(var(--dy) * 0.16))
				rotate(calc(var(--rot) * 0.07));
			opacity: 1;
			animation-timing-function: cubic-bezier(0.2, 0.5, 0.4, 1);
		}
		54% {
			transform: translate(calc(var(--dx) * 0.76), calc(var(--dy) * 0.86))
				rotate(calc(var(--rot) * 0.6));
			opacity: 0.95;
			animation-timing-function: cubic-bezier(0.5, 0, 0.8, 0.7);
		}
		100% {
			transform: translate(var(--dx), calc(var(--dy) + 340px)) rotate(var(--rot));
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.shard {
			animation: none;
			opacity: 0;
		}
	}

	/* fragments fly outward on boom */
	.before {
		transition: filter 300ms ease;
	}
	.before.exploding [data-frag] {
		animation: frag-fly 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
		pointer-events: none;
	}
	.before.exploding [data-frag]:nth-child(1) {
		--fx: -260px;
		--fy: -180px;
		--fr: -18deg;
	}
	.before.exploding [data-frag]:nth-child(2) {
		--fx: 80px;
		--fy: -360px;
		--fr: 12deg;
		animation-delay: 40ms;
	}
	.before.exploding [data-frag]:nth-child(3) {
		--fx: -180px;
		--fy: 240px;
		--fr: -22deg;
		animation-delay: 80ms;
	}
	.before.exploding [data-frag]:nth-child(4) {
		--fx: 280px;
		--fy: 200px;
		--fr: 26deg;
		animation-delay: 120ms;
	}
	@keyframes frag-fly {
		0% {
			transform: translate(0, 0) rotate(0) scale(1);
			opacity: 1;
			filter: blur(0);
		}
		20% {
			transform: translate(0, -8px) rotate(0) scale(1.05);
			opacity: 1;
		}
		100% {
			transform: translate(var(--fx, 0), var(--fy, 0)) rotate(var(--fr, 0)) scale(0.6);
			opacity: 0;
			filter: blur(4px);
		}
	}

	/* ---- AFTERMATH ---- */
	.aftermath {
		max-width: 44rem;
		animation: aftermath-in 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes aftermath-in {
		from {
			opacity: 0;
			transform: translateY(20px);
			filter: blur(8px);
		}
		to {
			opacity: 1;
			transform: none;
			filter: blur(0);
		}
	}
	.aftermath-h1 {
		font-family: 'Nunito Sans', sans-serif;
		font-size: clamp(2.6rem, 10vw, 5.5rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.035em;
		margin: 0.6rem 0 0.6rem;
		display: flex;
		flex-direction: column;
	}
	.aftermath-h1 .line {
		padding-bottom: 0.12em;
	}
	.aftermath-h1 .line-2 {
		margin-top: -0.12em;
	}
	.aftermath-lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.78);
		margin: 0 0 1.6rem;
	}

	.contact-form {
		width: 100%;
		text-align: left;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 18px;
		padding: 1.4rem;
		backdrop-filter: blur(10px);
		box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);

		/* The delightstack form controls read the global design tokens, and this
		   card is a dark glass panel sitting on the hero regardless of the page
		   theme — so re-point the tokens here rather than restyling the
		   components. The teal is the same brand accent the hero already uses. */
		--color-surface: rgba(255, 255, 255, 0.06);
		--color-bg-active: rgba(255, 255, 255, 0.1);
		--color-border: rgba(255, 255, 255, 0.14);
		--color-border-active: rgba(255, 255, 255, 0.3);
		--color-text: #fff;
		--color-text-muted: rgba(255, 255, 255, 0.55);
		--color-action: #00f2c3;
		--color-action-active: #00d6ff;
		--color-action-text: #052028;
		--color-action-text-active: #052028;
		--color-accent: #00f2c3;
		--color-accent-active: #00d6ff;
		--color-accent-text: #052028;
		--color-accent-text-active: #052028;
		--color-error: #ff7a5f;
	}
	/* The hero's body copy is the serif face; the send button wants the brand
	   sans at the same weight the rest of the hero's UI uses. <Button> sets
	   neither family nor weight, so both inherit from here. */
	.contact-form :global(.button) {
		font-family: var(--font-sans);
		font-weight: 800;
		margin-top: 0.5rem;
	}
	.contact-form :global(.form) {
		gap: 0rem;
	}
	.contact-form :global(.callout) {
		margin: 1rem 0;
	}
	.contact-form :global(.input:not(:first-child)) {
		margin-top: 1.5rem;
	}
	.send-arrow {
		width: 16px;
		height: 16px;
	}

	.form-success {
		text-align: center;
		padding: 1rem 0.4rem;
		animation: pop-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.85);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.form-success h3 {
		font-size: 1.4rem;
		margin: 0.6rem 0 0.2rem;
		color: #00f2c3;
	}
	.form-success p {
		margin: 0;
		color: rgba(255, 255, 255, 0.75);
	}
	.success-check {
		width: 56px;
		height: 56px;
		color: #00f2c3;
		filter: drop-shadow(0 0 12px rgba(0, 242, 195, 0.55));
	}

	/* ---- scroll cue ---- */
	.scroll-cue {
		position: absolute;
		left: 50%;
		bottom: 1.4rem;
		transform: translateX(-50%);
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		font: inherit;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		z-index: 2;
		padding: 0.4rem 0.6rem;
		/* Both driven by the scroll loop. They go through custom properties rather
		   than being set inline so `.hidden` still wins on the boom — an inline
		   opacity would outrank it and leave the cue sitting through the explosion.
		   Opacity is deliberately not transitioned here: it tracks the scroll frame
		   by frame, and easing it would just reintroduce the lag this whole
		   departure is meant to remove. */
		opacity: var(--cue-fade, 1);
		pointer-events: var(--cue-hit, auto);
		transition:
			color 200ms ease,
			transform 380ms ease;
	}
	.scroll-cue:hover {
		transition-duration: 0s;
		color: #00f2c3;
	}
	.scroll-cue.hidden {
		opacity: 0;
		transform: translate(-50%, 30px);
		pointer-events: none;
		transition:
			color 200ms ease,
			opacity 380ms ease,
			transform 380ms ease;
	}
	.cue-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.04);
		animation: cue-bob 2s ease-in-out infinite;
	}
	.cue-arrow svg {
		width: 16px;
		height: 16px;
	}
	@keyframes cue-bob {
		0%,
		100% {
			transform: translateY(0);
			border-color: rgba(255, 255, 255, 0.25);
		}
		50% {
			transform: translateY(6px);
			border-color: rgba(0, 242, 195, 0.65);
		}
	}
	.scroll-cue:focus-visible {
		outline: 2px solid #00f2c3;
		outline-offset: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		/* nothing animates to linger for — let the page scroll normally. The
		   warp loop never starts and the idle drift is off, so the field is a
		   calm, static starfield at its seeded positions. */
		.hero-pin {
			min-height: 0;
		}
		.star {
			animation: none;
		}
		.boom-btn {
			animation: none;
		}
		/* belt and braces — `startDestruction` jumps straight to `aftermath`
		   under reduce, so the readout never mounts on that path anyway */
		.boom-btn-count,
		.count-num {
			animation: none;
		}
		.cue-arrow {
			animation: none;
		}
		.hero.shake {
			animation: none;
		}
		.aftermath {
			animation: none;
		}
	}
</style>
