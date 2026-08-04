<script lang="ts">
	// A projector gate. Everything a worn print does to a frame — the registration
	// weave, the exposure flicker, the dust and scratches — is driven from a single
	// 24 fps tick, because on a real machine it *is* one machine: the frame that
	// jumps is the same frame that flashes and the same frame that carries the
	// speck. Anything that moved on its own clock would give the trick away.
	//
	// The motion is deliberately un-tweened: values are written once per film frame
	// and held, so the wiggle steps at 24 fps instead of gliding.
	import type { Snippet } from 'svelte';

	let { children, class: klass = '' }: { children: Snippet; class?: string } = $props();

	const FPS = 24;
	const FRAME_MS = 1000 / FPS;

	let root: HTMLElement | null = $state(null);
	let canvas: HTMLCanvasElement | null = $state(null);
	let reduced = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	type Speck = {
		x: number;
		y: number;
		rx: number;
		ry: number;
		rot: number;
		a: number;
		dark: boolean;
		life: number;
	};
	type Scratch = {
		x: number;
		drift: number;
		w: number;
		a: number;
		life: number;
		top: number;
		bottom: number;
		dark: boolean;
	};
	type Hair = {
		x: number;
		a: number;
		life: number;
		len: number;
		bow: number;
		flip: number;
	};

	$effect(() => {
		const host = root;
		const cvs = canvas;
		if (!host || !cvs || reduced) return;
		const ctx = cvs.getContext('2d');
		if (!ctx) return;

		// Every dimension below is expressed in `unit` — a hundredth of the frame's
		// short side — so the weave and the dirt scale with the picture instead of
		// with the device.
		let w = 1;
		let h = 1;
		let unit = 1;
		const resize = () => {
			const rect = host.getBoundingClientRect();
			w = Math.max(1, Math.round(rect.width));
			h = Math.max(1, Math.round(rect.height));
			unit = Math.min(w, h) / 100;
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			cvs.width = Math.round(w * dpr);
			cvs.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(host);

		const rand = (a: number, b: number) => a + Math.random() * (b - a);
		const chance = (p: number) => Math.random() < p;
		const sign = () => (Math.random() < 0.5 ? -1 : 1);

		// Gate registration: a mean-reverting walk (the film keeps trying to settle
		// back into the gate) plus impulse "bumps" for a splice or a chewed perf.
		let dx = 0;
		let dy = 0;
		let dr = 0;
		let bump_y = 0;
		let bump_x = 0;
		const specks: Speck[] = [];
		const scratches: Scratch[] = [];
		let hair: Hair | null = null;

		const drawFrame = () => {
			ctx.clearRect(0, 0, w, h);

			for (const s of specks) {
				ctx.globalAlpha = s.a;
				ctx.fillStyle = s.dark ? '#000' : '#fff';
				ctx.beginPath();
				ctx.ellipse(s.x, s.y, s.rx, s.ry, s.rot, 0, Math.PI * 2);
				ctx.fill();
			}

			// Scratches wander a little down their length rather than ruling a
			// perfect line — a hair caught in the gate never draws straight.
			for (const s of scratches) {
				ctx.globalAlpha = s.a;
				ctx.strokeStyle = s.dark ? '#000' : '#fff';
				ctx.lineWidth = s.w;
				ctx.beginPath();
				const top = s.top * h;
				const bottom = s.bottom * h;
				const segs = 6;
				ctx.moveTo(s.x, top);
				for (let i = 1; i <= segs; i++) {
					const y = top + ((bottom - top) * i) / segs;
					ctx.lineTo(s.x + Math.sin(i * 1.7 + s.drift * 40) * unit * 0.12, y);
				}
				ctx.stroke();
			}

			if (hair) {
				ctx.globalAlpha = hair.a;
				ctx.strokeStyle = '#0a0a0a';
				ctx.lineWidth = Math.max(1, unit * 0.14);
				ctx.beginPath();
				const x0 = hair.x;
				const y0 = h;
				ctx.moveTo(x0, y0);
				ctx.quadraticCurveTo(
					x0 + hair.bow * hair.flip,
					y0 - hair.len * 0.55,
					x0 + hair.bow * 0.35 * hair.flip,
					y0 - hair.len,
				);
				ctx.stroke();
			}

			ctx.globalAlpha = 1;
		};

		const step = () => {
			// ── weave ───────────────────────────────────────────────────────────
			dx = dx * 0.86 + rand(-0.09, 0.09);
			dy = dy * 0.82 + rand(-0.15, 0.15);
			dr = dr * 0.88 + rand(-0.025, 0.025);
			// Roughly one jolt a second, and one in five of those is a real lurch.
			if (chance(0.04)) bump_y += sign() * rand(0.35, chance(0.2) ? 1.5 : 0.75);
			if (chance(0.02)) bump_x += sign() * rand(0.2, 0.6);
			bump_y *= 0.52;
			bump_x *= 0.5;

			host.style.setProperty('--wx', `${((dx + bump_x) * unit).toFixed(2)}px`);
			host.style.setProperty('--wy', `${((dy + bump_y) * unit).toFixed(2)}px`);
			host.style.setProperty('--wr', `${(dr + bump_y * 0.06).toFixed(3)}deg`);

			// ── exposure ────────────────────────────────────────────────────────
			// Baseline shimmer, with the odd hot or thin frame on top of it. Big
			// bumps ride with a brightness kick: the same jolt in the same machine.
			let hot = rand(0.015, 0.05) + Math.min(0.1, Math.abs(bump_y) * 0.08);
			let thin = 0;
			if (chance(0.025)) hot += rand(0.09, 0.2);
			if (chance(0.02)) thin = rand(0.06, 0.16);
			host.style.setProperty('--hot', hot.toFixed(3));
			host.style.setProperty('--thin', thin.toFixed(3));

			// ── dirt ────────────────────────────────────────────────────────────
			for (let i = specks.length - 1; i >= 0; i--) {
				if (--specks[i].life <= 0) specks.splice(i, 1);
			}
			// Most frames carry a speck or two; now and then one goes through
			// filthy. A few pieces stick in the gate and ride several frames.
			const n = chance(0.012) ? rand(7, 15) | 0 : chance(0.3) ? 0 : rand(1, 4) | 0;
			for (let i = 0; i < n; i++) {
				const r = rand(0.18, 0.7) * unit;
				specks.push({
					x: rand(0, w),
					y: rand(0, h),
					rx: r,
					ry: r * rand(0.45, 1),
					rot: rand(0, Math.PI),
					a: rand(0.35, 0.9),
					dark: chance(0.35),
					life: chance(0.12) ? rand(2, 6) | 0 : 1,
				});
			}

			for (let i = scratches.length - 1; i >= 0; i--) {
				const s = scratches[i];
				if (--s.life <= 0) {
					scratches.splice(i, 1);
					continue;
				}
				// A scratch is cut into the emulsion, so it rides the weave with the
				// picture — and drifts sideways as the film breathes in the gate.
				s.drift += rand(-0.02, 0.02);
				s.x += s.drift * unit;
			}
			if (scratches.length < 3 && chance(0.045)) {
				const full = chance(0.4);
				const top = full ? 0 : rand(0, 0.6);
				scratches.push({
					x: rand(w * 0.05, w * 0.95),
					drift: rand(-0.05, 0.05),
					w: Math.max(0.6, rand(0.1, 0.22) * unit),
					a: rand(0.06, 0.22),
					life: full ? rand(20, 90) | 0 : rand(2, 14) | 0,
					top,
					bottom: full ? 1 : Math.min(1, top + rand(0.15, 0.4)),
					dark: chance(0.3),
				});
			}

			if (hair && --hair.life <= 0) hair = null;
			if (!hair && chance(0.004)) {
				hair = {
					x: rand(w * 0.1, w * 0.9),
					a: rand(0.25, 0.5),
					life: rand(8, 40) | 0,
					len: rand(6, 16) * unit,
					bow: rand(2, 7) * unit,
					flip: sign(),
				};
			}

			drawFrame();
		};

		let raf = 0;
		let last = performance.now();
		let acc = 0;
		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			const dt = now - last;
			last = now;
			// Never try to catch up more than a couple of frames after a stall —
			// a burst of simulated frames would read as a glitch, not as film.
			acc = Math.min(acc + dt, FRAME_MS * 3);
			if (acc < FRAME_MS) return;
			acc -= FRAME_MS;
			step();
		};
		const start = () => {
			if (raf) return;
			// Reset the clock so the first resumed frame doesn't swallow the whole
			// off-screen stretch as one giant dt.
			last = performance.now();
			raf = requestAnimationFrame(tick);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};
		// Nothing to simulate while the gate is off screen — the loop stops
		// outright rather than idling. Fail open without IO.
		let io: IntersectionObserver | null = null;
		if (typeof IntersectionObserver === 'undefined') {
			start();
		} else {
			io = new IntersectionObserver(
				(entries) => (entries.some((e) => e.isIntersecting) ? start() : stop()),
				{ rootMargin: '20%' },
			);
			io.observe(host);
		}

		return () => {
			stop();
			ro.disconnect();
			io?.disconnect();
		};
	});
</script>

<div bind:this={root} class="gate {klass}">
	<div class="weave">{@render children()}</div>
	<canvas bind:this={canvas} class="dirt" aria-hidden="true"></canvas>
	<div class="hot" aria-hidden="true"></div>
	<div class="thin" aria-hidden="true"></div>
</div>

<style>
	.gate {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.weave {
		width: 100%;
		height: 100%;
		/* Held for a whole film frame, then jumped — never interpolated. */
		translate: var(--wx, 0) var(--wy, 0);
		rotate: var(--wr, 0deg);
		will-change: translate;
	}
	.dirt,
	.hot,
	.thin {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.dirt {
		width: 100%;
		height: 100%;
	}
	.hot {
		background: #fff;
		opacity: var(--hot, 0.03);
	}
	.thin {
		background: #000;
		opacity: var(--thin, 0);
	}
	@media (prefers-reduced-motion: reduce) {
		.weave {
			translate: none;
			rotate: none;
		}
		.hot,
		.thin {
			opacity: 0;
		}
	}
</style>
