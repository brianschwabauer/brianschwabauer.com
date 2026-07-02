<script lang="ts">
	import { untrack } from 'svelte';
	import SectionShell from '../primitives/SectionShell.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import { confetti } from '@delightstack/components/feedback';

	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	const reducedMotion = () =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// ---- "Details matter" fix-it sequence ------------------------------------
	// The heading starts slightly crooked. When the tenet scrolls into view, a
	// cursor glides in, clicks the heading, the selection frame pops on, the
	// heading snaps back to perfectly horizontal, and the frame pops off — just
	// like a design tool only shows the frame while something is selected. The
	// cursor then keeps coming back on random timeouts to make ever less helpful
	// little adjustments, forever. The user can play too: clicking the heading
	// shows the frame, corner handles scale it, the ring above rotates it — and
	// while they're at it, the automation politely waits.
	let fixStage = $state<HTMLElement>();
	let fixTargetEl = $state<HTMLElement>();
	let fixTransform = $state('rotate(-3.5deg)');
	let fixNoTransition = $state(false); // during user drags
	let boxShown = $state(false);
	let cursorShown = $state(false);
	let cursorClicking = $state(false);
	let cursorGlide = $state(true); // false = reposition instantly (while invisible)
	let cursorPos = $state({ x: 'min(240px, 34vw)', y: '150px' });
	let ringKey = $state(0);

	$effect(() => {
		const stage = fixStage;
		const target = fixTargetEl;
		if (!stage || !target) return;
		if (reducedMotion()) {
			fixTransform = 'none';
			return;
		}
		let alive = true;

		// ---- shared user/automation state ----
		const IDLE_MS = 4500;
		let lastUserAt = -1e9; // plain (non-reactive): only the loops read it
		let userHolding = false; // frame opened by the user
		let dragMode: 'rotate' | 'scale' | null = null;

		const adj = { r: -3.5, s: 1, k: 0 };
		const applyAdj = () => {
			fixTransform = `rotate(${adj.r}deg) scale(${adj.s}) skewX(${adj.k}deg)`;
		};

		// ---- user interaction: select, drag-scale, drag-rotate ----
		const centerOf = () => {
			const r = target.getBoundingClientRect();
			return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
		};

		const onTargetClick = () => {
			userHolding = true;
			lastUserAt = performance.now();
			boxShown = true;
		};
		const onDocPointerDown = (e: PointerEvent) => {
			if (!userHolding || dragMode) return;
			if (e.target instanceof Node && stage.contains(e.target)) return;
			userHolding = false;
			boxShown = false;
		};
		const onHandleDown = (e: PointerEvent) => {
			const handle = e.target instanceof Element ? e.target.closest('.handle') : null;
			if (!handle) return;
			e.preventDefault();
			e.stopPropagation();
			userHolding = true;
			lastUserAt = performance.now();
			fixNoTransition = true;
			dragMode = handle.classList.contains('rotate-h') ? 'rotate' : 'scale';
			const c = centerOf();
			const a0 = Math.atan2(e.clientY - c.y, e.clientX - c.x);
			const d0 = Math.hypot(e.clientX - c.x, e.clientY - c.y) || 1;
			const startR = adj.r;
			const startS = adj.s;
			const onMove = (ev: PointerEvent) => {
				lastUserAt = performance.now();
				if (dragMode === 'rotate') {
					const a = Math.atan2(ev.clientY - c.y, ev.clientX - c.x);
					let r = startR + ((a - a0) * 180) / Math.PI;
					while (r > 180) r -= 360;
					while (r < -180) r += 360;
					adj.r = +r.toFixed(1);
				} else {
					const d = Math.hypot(ev.clientX - c.x, ev.clientY - c.y);
					adj.s = +Math.min(1.6, Math.max(0.4, startS * (d / d0))).toFixed(3);
				}
				applyAdj();
			};
			const onUp = () => {
				dragMode = null;
				fixNoTransition = false;
				lastUserAt = performance.now();
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerup', onUp);
			};
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
		};
		target.addEventListener('click', onTargetClick);
		document.addEventListener('pointerdown', onDocPointerDown);
		const selectBox = stage.querySelector('.select-box');
		selectBox?.addEventListener('pointerdown', onHandleDown as EventListener);

		// automation yields to the user: wait until they've been idle a while,
		// then tidy their frame away and take back the controls
		const waitForIdle = async () => {
			while (alive) {
				const idle = performance.now() - lastUserAt;
				if (!dragMode && idle > IDLE_MS) {
					if (userHolding) {
						userHolding = false;
						boxShown = false;
						await sleep(400);
					}
					return;
				}
				await sleep(500);
			}
		};

		// ---- the automated cursor ----
		// a corner of the heading's current visual bounds, as a cursor offset
		// from the stage centre (where the cursor svg is anchored)
		const randomCorner = () => {
			const s = stage.getBoundingClientRect();
			const t = target.getBoundingClientRect();
			const cx = s.left + s.width / 2;
			const cy = s.top + s.height / 2;
			const corners = [
				[t.left, t.top],
				[t.right, t.top],
				[t.left, t.bottom],
				[t.right, t.bottom],
			];
			const [x, y] = corners[Math.floor(Math.random() * corners.length)];
			return { x: `${Math.round(x - cx)}px`, y: `${Math.round(y - cy)}px` };
		};

		const glideAndClick = async (pos: { x: string; y: string }) => {
			cursorPos = pos;
			cursorShown = true;
			await sleep(1100); // glide
			if (!alive) return;
			cursorClicking = true;
			ringKey++;
			await sleep(160);
			cursorClicking = false;
			await sleep(280);
		};

		const cursorAway = async () => {
			cursorShown = false;
			await sleep(400); // finish fading before the silent reposition
			cursorGlide = false;
			cursorPos = { x: 'min(240px, 34vw)', y: '150px' };
			await sleep(30);
			cursorGlide = true;
		};

		const run = async () => {
			await sleep(600);
			if (!alive) return;
			await waitForIdle();
			await glideAndClick({ x: 'min(90px, 14vw)', y: '-10px' });
			if (!alive) return;
			boxShown = true; // frame pops on for the edit
			await sleep(750);
			adj.r = 0; // the one adjustment that actually helps
			applyAdj();
			await sleep(1000);
			boxShown = false; // deselect — edit finished
			await sleep(250);
			await cursorAway();

			let first = true;
			while (alive) {
				await sleep(2500 + Math.random() * 4500);
				if (!alive) return;
				await waitForIdle();
				if (!alive) return;
				await glideAndClick(randomCorner());
				if (!alive) return;
				boxShown = true;
				await sleep(500);
				if (first) {
					adj.s = 0.94; // definitely needed to be a touch smaller
					first = false;
				} else {
					const pick = Math.floor(Math.random() * 3);
					if (pick === 0) adj.r = +(Math.random() * 6 - 3).toFixed(1);
					else if (pick === 1) adj.s = +(0.88 + Math.random() * 0.18).toFixed(3);
					else adj.k = +(Math.random() * 10 - 5).toFixed(1);
				}
				applyAdj();
				await sleep(1000);
				boxShown = false;
				await sleep(250);
				await cursorAway();
			}
		};

		const obs = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				obs.disconnect();
				run();
			},
			{ threshold: 0.55 },
		);
		obs.observe(stage);
		return () => {
			alive = false;
			obs.disconnect();
			target.removeEventListener('click', onTargetClick);
			document.removeEventListener('pointerdown', onDocPointerDown);
			selectBox?.removeEventListener('pointerdown', onHandleDown as EventListener);
		};
	});

	// ---- "Make it beautiful" scroll-driven aurora ------------------------------
	// --aurora-p rides 0→1 as the tenet crosses the viewport; CSS maps it to the
	// ribbons' brightness and drift. Written straight to the element so scrolling
	// never churns Svelte state.
	let auroraEl = $state<HTMLElement>();

	$effect(() => {
		if (!auroraEl) return;
		const el = auroraEl;
		if (reducedMotion()) {
			el.style.setProperty('--aurora-p', '0.6'); // static glow
			return;
		}
		let raf = 0;
		let visible = false;
		const update = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const vh = window.innerHeight;
			const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
			el.style.setProperty('--aurora-p', p.toFixed(4));
		};
		const schedule = () => {
			if (visible && !raf) raf = requestAnimationFrame(update);
		};
		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			schedule();
		});
		io.observe(el);
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		update();
		return () => {
			io.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		};
	});

	// ---- "Do things that don't matter" paper-airplane flock -------------------
	// Planes wander the full viewport width on gentle S-curves, always
	// nose-first. They spawn and expire on their own, clicking anywhere in the
	// section pops a new one into existence, and while the mouse is moving they
	// bank toward it — pursuing the cursor's path without ever piling up on it.
	const PLANE_MAX = 25;
	const PLANE_AMBIENT = 15; // the auto-spawner keeps roughly this many aloft
	type PlaneSim = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		born: number;
		ttl: number;
		fadeMs: number; // fade-in duration (click-spawned planes pop instead)
		wobble: number;
		pull: number; // per-plane mouse affinity, so the flock never clumps
	};
	let t3El = $state<HTMLElement>();
	let planeFieldEl = $state<HTMLElement>();
	let planes = $state<Array<{ id: number; pop: boolean }>>([]);
	let planeId = 0;
	const planeSim = new Map<number, PlaneSim>();
	const planeEls = new Map<number, HTMLElement>();

	function planeEl(node: HTMLElement, id: number) {
		planeEls.set(id, node);
		return {
			destroy() {
				planeEls.delete(id);
			},
		};
	}

	function spawnPlane(bounds: HTMLElement, at?: { x: number; y: number }, pop = false) {
		if (planes.length >= PLANE_MAX) return;
		const w = bounds.clientWidth;
		const h = bounds.clientHeight;
		const id = planeId++;
		const ang = Math.random() * Math.PI * 2;
		const sp = 60 + Math.random() * 80;
		planeSim.set(id, {
			x: at?.x ?? Math.random() * w,
			y: at?.y ?? Math.random() * h,
			vx: Math.cos(ang) * sp,
			vy: Math.sin(ang) * sp,
			born: performance.now(),
			ttl: 10000 + Math.random() * 9000,
			fadeMs: pop ? 1 : 700,
			wobble: Math.random() * Math.PI * 2,
			pull: 0.55 + Math.random() * 0.75,
		});
		planes = [...planes, { id, pop }];
	}

	$effect(() => {
		const field = t3El;
		const bounds = planeFieldEl;
		if (!field || !bounds) return;
		if (reducedMotion()) return;
		let alive = true;
		let visible = false;
		let raf = 0;
		let last = performance.now();
		let spawnTimeout: ReturnType<typeof setTimeout>;
		const mouse = { x: 0, y: 0, t: -1e9 };
		const section = field.closest('section') ?? field;

		// document-level so the full-bleed field hears the mouse even outside
		// the centred text column
		const localPoint = (e: MouseEvent) => {
			const r = bounds.getBoundingClientRect();
			if (
				e.clientX < r.left ||
				e.clientX > r.right ||
				e.clientY < r.top ||
				e.clientY > r.bottom
			) {
				return null;
			}
			return { x: e.clientX - r.left, y: e.clientY - r.top };
		};
		const onMove = (e: PointerEvent) => {
			const p = localPoint(e);
			if (!p) return;
			mouse.x = p.x;
			mouse.y = p.y;
			mouse.t = performance.now();
		};
		const onClick = (e: MouseEvent) => {
			// only clicks that land in this section (not on fixed overlays like
			// the nav or the year scrubber)
			if (!(e.target instanceof Node) || !section.contains(e.target)) return;
			const p = localPoint(e);
			if (p) spawnPlane(bounds, p, true);
		};
		document.addEventListener('pointermove', onMove);
		document.addEventListener('click', onClick);

		// untracked: spawnPlane reads & writes `planes`, which must not become a
		// dependency of this effect (it would loop forever)
		untrack(() => {
			for (let i = 0; i < 10; i++) spawnPlane(bounds);
		});
		const scheduleSpawn = () => {
			spawnTimeout = setTimeout(
				() => {
					if (!alive) return;
					if (visible && planes.length < PLANE_AMBIENT) spawnPlane(bounds);
					scheduleSpawn();
				},
				1300 + Math.random() * 2600,
			);
		};
		scheduleSpawn();

		// the svg's nose points 42° above horizontal; rotate flight heading to it
		const NOSE_OFFSET = 42;

		const tick = (now: number) => {
			raf = 0;
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			const w = bounds.clientWidth;
			const h = bounds.clientHeight;
			const chasing = now - mouse.t < 350; // mouse counts as "moving" briefly
			const dead: number[] = [];
			for (const { id } of planes) {
				const s = planeSim.get(id);
				const el = planeEls.get(id);
				if (!s) continue;
				const age = now - s.born;
				if (age > s.ttl) {
					dead.push(id);
					continue;
				}
				// gentle wander: the heading sways on a per-plane sine
				s.wobble += dt * (0.8 + s.pull);
				const sway = Math.sin(s.wobble * 1.7) * 0.9 * dt;
				const cs = Math.cos(sway);
				const sn = Math.sin(sway);
				let vx = s.vx * cs - s.vy * sn;
				let vy = s.vx * sn + s.vy * cs;
				if (chasing) {
					const dx = mouse.x - s.x;
					const dy = mouse.y - s.y;
					const d = Math.hypot(dx, dy) || 1;
					// attraction fades to nothing inside 70px so they orbit the
					// path instead of stacking on the pointer
					const near = Math.min(1, Math.max(0, (d - 70) / 200));
					const accel = 260 * s.pull * near;
					vx += (dx / d) * accel * dt;
					vy += (dy / d) * accel * dt;
				}
				const sp = Math.hypot(vx, vy) || 1;
				const clamped = Math.min(200, Math.max(50, sp));
				vx = (vx / sp) * clamped;
				vy = (vy / sp) * clamped;
				s.vx = vx;
				s.vy = vy;
				s.x += vx * dt;
				s.y += vy * dt;
				// wrap just past the edges so exits become entrances
				const m = 70;
				if (s.x < -m) s.x = w + m;
				else if (s.x > w + m) s.x = -m;
				if (s.y < -m) s.y = h + m;
				else if (s.y > h + m) s.y = -m;
				if (el) {
					const fadeIn = Math.min(1, age / s.fadeMs);
					const fadeOut = Math.min(1, (s.ttl - age) / 700);
					const rot = (Math.atan2(vy, vx) * 180) / Math.PI + NOSE_OFFSET;
					el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;
					el.style.opacity = (0.8 * Math.min(fadeIn, fadeOut)).toFixed(3);
				}
			}
			if (dead.length) {
				planes = planes.filter((p) => !dead.includes(p.id));
				for (const id of dead) planeSim.delete(id);
			}
			if (visible && alive) raf = requestAnimationFrame(tick);
		};

		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible && !raf) {
				last = performance.now();
				raf = requestAnimationFrame(tick);
			}
		});
		io.observe(field);
		return () => {
			alive = false;
			clearTimeout(spawnTimeout);
			io.disconnect();
			if (raf) cancelAnimationFrame(raf);
			document.removeEventListener('pointermove', onMove);
			document.removeEventListener('click', onClick);
			planes = [];
			planeSim.clear();
		};
	});

	// ---- bottom-of-page confetti cannons --------------------------------------
	// Reaching the very bottom of the page earns a continuous celebration:
	// cannons at the top corners of the footer fire 45° inward — aimed right at
	// the sign-off — until you scroll back up.
	$effect(() => {
		if (reducedMotion()) return;
		let stops: Array<() => void> | null = null;
		const COLORS = ['#00f2c3', '#a78bfa', '#ffd66e', '#ff8b8b', '#00d6ff'];
		const start = () => {
			if (stops) return;
			// anchor the emitters to the top edge of the footer, not the
			// viewport bottom
			const footer = document.querySelector('footer');
			const y = footer
				? Math.min(
						1,
						Math.max(0, footer.getBoundingClientRect().top / window.innerHeight),
					)
				: 1;
			const base = {
				colors: COLORS,
				particle_count: 80,
				start_velocity: 75,
				duration: 1000,
				z_index: 200,
			};
			stops = [
				confetti.cannon({ ...base, origin: { x: 0, y }, angle: 45 }),
				confetti.cannon({ ...base, origin: { x: 1, y }, angle: 135 }),
			];
		};
		const stop = () => {
			stops?.forEach((s) => s());
			stops = null;
		};
		const onScroll = () => {
			const doc = document.documentElement;
			const remaining = doc.scrollHeight - (window.scrollY + window.innerHeight);
			if (remaining < 60) start();
			else if (remaining > 240) stop(); // hysteresis so it doesn't stutter
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => {
			window.removeEventListener('scroll', onScroll);
			stop();
		};
	});
</script>

<SectionShell id="creed" year="Always" label="The Creed" theme="creed">
	<div class="container">
		<header class="opening">
			<Reveal>
				<div class="eyebrow">THE CREED</div>
				<h2 class="title">
					Everything on this page
					<br />
					<span class="title-accent">comes down to three things.</span>
				</h2>
				<p class="intro">
					I started this page in 2006 with a stuffed-animal puppet show on a miniDV tape.
					I'm wrapping it up with a platform that pays my bills. Strip away the twenty
					years in between — the Flash games, the fake newscasts, the music videos, the
					startups — and this is what's left. The three things I actually believe.
				</p>
			</Reveal>
		</header>

		<ol class="tenets">
			<li class="tenet t1">
				<Reveal variant="up">
					<div class="numeral" aria-hidden="true">I</div>
					<div class="fix-stage" bind:this={fixStage}>
						<div
							class="fix-target"
							bind:this={fixTargetEl}
							class:boxed={boxShown}
							class:no-transition={fixNoTransition}
							style:transform={fixTransform}>
							<h3 class="statement">Details matter.</h3>
							<div class="select-box" aria-hidden="true">
								<span class="handle rotate-h"></span>
								<span class="handle h-tl"></span>
								<span class="handle h-tc"></span>
								<span class="handle h-tr"></span>
								<span class="handle h-ml"></span>
								<span class="handle h-mr"></span>
								<span class="handle h-bl"></span>
								<span class="handle h-bc"></span>
								<span class="handle h-br"></span>
							</div>
						</div>
						{#key ringKey}
							{#if ringKey > 0}
								<span
									class="click-ring"
									aria-hidden="true"
									style:--cx={cursorPos.x}
									style:--cy={cursorPos.y}>
								</span>
							{/if}
						{/key}
						<svg
							class="fix-cursor"
							class:shown={cursorShown}
							class:clicking={cursorClicking}
							class:no-glide={!cursorGlide}
							style:--cx={cursorPos.x}
							style:--cy={cursorPos.y}
							viewBox="0 0 24 24"
							aria-hidden="true">
							<path
								d="M5 2 L5 19 L9.5 15.2 L12.4 21.6 L15.2 20.3 L12.3 14 L18 13.6 Z"
								fill="#fff"
								stroke="#06060a"
								stroke-width="1.4"
								stroke-linejoin="round" />
						</svg>
					</div>
					<p class="body">
						If I want someone to care about what I make, I have to care first — all the
						way down to the details nobody will ever notice. Everything I do, I do with
						intention.
					</p>
					<p class="fine">You read this tiny line. See? The details get noticed.</p>
				</Reveal>
			</li>

			<li class="tenet t2" bind:this={auroraEl}>
				<div class="aurora" aria-hidden="true">
					<div class="stars"></div>
					<div class="ribbons">
						<div class="ribbon r1"></div>
						<div class="ribbon r2"></div>
						<div class="ribbon r3"></div>
					</div>
				</div>
				<Reveal variant="up">
					<div class="numeral" aria-hidden="true">II</div>
					<h3 class="statement"><span class="grad">Make it beautiful.</span></h3>
					<p class="body">
						For all of human history we've cared how things look. The paintings and the
						cathedrals we refuse to let go of are the beautiful ones. Beauty isn't
						decoration on top of the work — it's part of why the work lasts.
					</p>
				</Reveal>
			</li>

			<li class="tenet t3" bind:this={t3El}>
				<div class="plane-field" bind:this={planeFieldEl} aria-hidden="true">
					{#each planes as p (p.id)}
						<div class="plane" use:planeEl={p.id}>
							<svg class:pop={p.pop} viewBox="0 0 24 24">
								<path
									d="M21.7 2.3 L2.6 10.4 a0.6 0.6 0 0 0 0.05 1.12 L9 13.6 L11.5 20.9 a0.6 0.6 0 0 0 1.1 0.08 L21.7 2.3 Z M9 13.6 L21.7 2.3 L11.5 20.9"
									fill="rgba(255, 255, 255, 0.14)"
									stroke="rgba(255, 255, 255, 0.6)"
									stroke-width="1.1"
									stroke-linejoin="round" />
							</svg>
						</div>
					{/each}
				</div>
				<Reveal variant="up">
					<div class="t3-copy">
						<div class="numeral" aria-hidden="true">III</div>
						<h3 class="statement">
							Do things that <s>don't</s>
							matter.
						</h3>
						<p class="body">
							The lego stop-motion. The Pacman PowerPoint trick. The treehouse in the
							backyard. None of it "mattered" — and every bit of it became a tool I used
							later on something that did. The loop hasn't changed: pick a thing I've
							never done. Try it. Fail in public. Add it to the toolbag. Use it on the
							next thing that matters more.
						</p>
						<p class="fine">psst — try clicking. it won't accomplish anything.</p>
					</div>
				</Reveal>
			</li>
		</ol>

		<div class="coda">
			<Reveal>
				<div class="coda-line" aria-hidden="true"></div>
				<p class="coda-text">
					That's the whole page. That's the whole plan. I live to create. I work to
					delight.
				</p>
				<p class="coda-sign">— Brian</p>
			</Reveal>
		</div>
	</div>
</SectionShell>

<style>
	:global([data-theme='creed']) {
		background:
			radial-gradient(
				ellipse 80% 40% at 50% 0%,
				rgba(108, 99, 255, 0.07),
				transparent 60%
			),
			linear-gradient(180deg, #060410, #06060a 30%, #06060a);
		color: #fff;
		/* the full-bleed scenes span 100vw, which overshoots by the scrollbar width */
		overflow-x: clip;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		text-align: center;
	}

	.opening {
		min-height: 70svh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: rgba(255, 255, 255, 0.55);
		margin-bottom: 1.2rem;
	}
	.title {
		font-size: clamp(2.2rem, 6vw, 4.5rem);
		font-weight: 900;
		line-height: 1.02;
		letter-spacing: -0.03em;
		margin: 0 0 1.6rem;
	}
	.title-accent {
		color: rgba(255, 255, 255, 0.55);
	}
	.intro {
		max-width: 42rem;
		margin: 0 auto;
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.72);
	}

	.tenets {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.tenet {
		position: relative;
		min-height: 90svh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tenet :global(.reveal) {
		position: relative;
		z-index: 1;
	}
	.numeral {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		letter-spacing: 0.5em;
		/* optically recenter: letter-spacing trails the last glyph */
		text-indent: 0.5em;
		color: var(--tenet-accent, #fff);
		margin-bottom: 1.6rem;
	}
	.numeral::after {
		content: '';
		display: block;
		width: 2.4rem;
		height: 1px;
		margin: 1rem auto 0;
		background: var(--tenet-accent, #fff);
		opacity: 0.5;
	}
	.statement {
		font-family: 'Nunito Sans', var(--font-sans), sans-serif;
		font-size: clamp(2.8rem, 9vw, 7rem);
		font-weight: 900;
		line-height: 0.98;
		letter-spacing: -0.035em;
		margin: 0 0 2rem;
		text-wrap: balance;
	}
	.statement s {
		text-decoration-thickness: 0.06em;
		text-decoration-color: var(--tenet-accent, currentColor);
		opacity: 0.75;
	}
	.body {
		max-width: 38rem;
		margin: 0 auto;
		font-size: clamp(1.1rem, 1.7vw, 1.35rem);
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.75);
	}
	.fine {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		letter-spacing: 0.08em;
		color: rgba(255, 255, 255, 0.35);
		margin-top: 2.2rem;
	}

	.t1 {
		--tenet-accent: #00f2c3;
	}
	.t2 {
		--tenet-accent: #a78bfa;
	}
	.t3 {
		--tenet-accent: #ff8b8b;
	}

	.grad {
		background: linear-gradient(95deg, #a78bfa, #ff8b8b 55%, #ffd66e);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		padding-bottom: 0.12em;
	}

	/* ---- "Details matter" fix-it sequence ---- */
	.fix-stage {
		position: relative;
		display: inline-block;
		/* design-tool object, not prose — dragging handles must never
		   drag-select the heading text */
		user-select: none;
		-webkit-user-select: none;
	}
	.fix-target {
		position: relative;
		display: inline-block;
		/* crooked until the cursor comes along and fixes it */
		transition: transform 900ms cubic-bezier(0.34, 1.56, 0.64, 1);
		cursor: default;
	}
	.fix-target.no-transition {
		transition: none;
	}
	.fix-target .statement {
		margin-bottom: 0;
	}
	.fix-stage + .body {
		margin-top: 2rem;
	}

	.select-box {
		position: absolute;
		inset: -0.35em -0.45em;
		border: 1.5px solid #4c9ffe;
		opacity: 0;
		transform: scale(0.94);
		transition:
			opacity 160ms ease,
			transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
		pointer-events: none;
	}
	/* the rotate handle's stem */
	.select-box::before {
		content: '';
		position: absolute;
		top: -20px;
		left: 50%;
		width: 1.5px;
		height: 15px;
		background: #4c9ffe;
	}
	.fix-target.boxed .select-box {
		opacity: 1;
		transform: scale(1);
	}
	.fix-target.boxed .handle {
		pointer-events: auto;
	}
	.handle {
		position: absolute;
		width: 11px;
		height: 11px;
		background: #fff;
		border: 1.5px solid #4c9ffe;
		border-radius: 2px;
		pointer-events: none;
		touch-action: none;
	}
	/* generous invisible hit area — the visible knob is a tiny target */
	.handle::after {
		content: '';
		position: absolute;
		inset: -10px;
	}
	.rotate-h {
		top: -31px;
		left: calc(50% - 5.5px);
		border-radius: 50%;
		cursor: grab;
	}
	.rotate-h:active {
		cursor: grabbing;
	}
	.h-tl {
		top: -6px;
		left: -6px;
		cursor: nwse-resize;
	}
	.h-tc {
		top: -6px;
		left: calc(50% - 5.5px);
		cursor: ns-resize;
	}
	.h-tr {
		top: -6px;
		right: -6px;
		cursor: nesw-resize;
	}
	.h-ml {
		top: calc(50% - 5.5px);
		left: -6px;
		cursor: ew-resize;
	}
	.h-mr {
		top: calc(50% - 5.5px);
		right: -6px;
		cursor: ew-resize;
	}
	.h-bl {
		bottom: -6px;
		left: -6px;
		cursor: nesw-resize;
	}
	.h-bc {
		bottom: -6px;
		left: calc(50% - 5.5px);
		cursor: ns-resize;
	}
	.h-br {
		bottom: -6px;
		right: -6px;
		cursor: nwse-resize;
	}

	.fix-cursor {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 38px;
		height: 38px;
		opacity: 0;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
		transform: translate(var(--cx), var(--cy));
		transition:
			transform 1050ms cubic-bezier(0.22, 1, 0.36, 1),
			opacity 300ms ease;
		pointer-events: none;
		z-index: 2;
	}
	.fix-cursor.shown {
		opacity: 1;
	}
	.fix-cursor.clicking {
		transform: translate(var(--cx), var(--cy)) scale(0.82);
		transition:
			transform 130ms ease,
			opacity 300ms ease;
	}
	.fix-cursor.no-glide {
		transition: opacity 300ms ease;
	}

	.click-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 44px;
		height: 44px;
		margin: -22px 0 0 -22px;
		border: 2px solid rgba(76, 159, 254, 0.9);
		border-radius: 50%;
		pointer-events: none;
		animation: click-ripple 500ms ease-out forwards;
	}
	@keyframes click-ripple {
		0% {
			opacity: 0.9;
			transform: translate(var(--cx), var(--cy)) scale(0.2);
		}
		100% {
			opacity: 0;
			transform: translate(var(--cx), var(--cy)) scale(1);
		}
	}

	/* ---- "Make it beautiful" aurora ----
	   Full-bleed northern lights: three blurred gradient ribbons swaying on
	   long offset cycles over a sparse starfield. --aurora-p (0→1, scroll-
	   driven) brightens the ribbons and drifts them upward as you pass. */
	.aurora {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(50% - 50vw);
		width: 100vw;
		overflow: hidden;
		pointer-events: none;
	}
	.stars {
		position: absolute;
		inset: 0;
		background-image:
			radial-gradient(1.5px 1.5px at 22% 24%, rgba(255, 255, 255, 0.9), transparent),
			radial-gradient(1px 1px at 68% 12%, rgba(255, 255, 255, 0.7), transparent),
			radial-gradient(1.5px 1.5px at 85% 40%, rgba(255, 255, 255, 0.8), transparent),
			radial-gradient(1px 1px at 42% 55%, rgba(255, 255, 255, 0.6), transparent),
			radial-gradient(1px 1px at 8% 70%, rgba(255, 255, 255, 0.7), transparent),
			radial-gradient(1.5px 1.5px at 55% 82%, rgba(255, 255, 255, 0.5), transparent);
		background-size: 340px 300px;
		opacity: calc(0.25 + var(--aurora-p, 0) * 0.5);
	}
	.ribbons {
		position: absolute;
		inset: -8% 0;
		transform: translateY(calc((0.5 - var(--aurora-p, 0)) * 8vh));
		opacity: clamp(0.2, calc((var(--aurora-p, 0) - 0.05) * 1.5), 1);
	}
	.ribbon {
		position: absolute;
		left: -20vw;
		width: 140vw;
		height: 26vh;
		border-radius: 50%;
		filter: blur(46px);
	}
	.r1 {
		top: 8%;
		background: linear-gradient(
			90deg,
			transparent 5%,
			rgba(0, 242, 195, 0.5) 30%,
			rgba(108, 99, 255, 0.42) 65%,
			transparent 95%
		);
		transform: rotate(-7deg);
		animation: aurora-sway 21s ease-in-out infinite alternate;
	}
	.r2 {
		top: 24%;
		background: linear-gradient(
			90deg,
			transparent 8%,
			rgba(167, 139, 250, 0.42) 40%,
			rgba(0, 214, 255, 0.34) 70%,
			transparent 92%
		);
		transform: rotate(4deg);
		animation: aurora-sway 29s ease-in-out -8s infinite alternate-reverse;
	}
	.r3 {
		top: 42%;
		height: 20vh;
		background: linear-gradient(
			90deg,
			transparent 10%,
			rgba(0, 242, 195, 0.24) 45%,
			rgba(167, 139, 250, 0.3) 75%,
			transparent 90%
		);
		transform: rotate(-3deg);
		animation: aurora-sway 36s ease-in-out -15s infinite alternate;
	}
	/* `translate` animates independently of the rotate in `transform` */
	@keyframes aurora-sway {
		from {
			translate: -5vw 0;
		}
		to {
			translate: 5vw -2.5vh;
		}
	}
	.t2 .body {
		text-shadow: 0 1px 14px rgba(6, 4, 16, 0.8);
	}
	.t2 .grad {
		filter: drop-shadow(0 3px 22px rgba(6, 4, 16, 0.85));
	}

	/* ---- "Do things that don't matter" paper airplanes ---- */
	.plane-field {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(50% - 50vw);
		width: 100vw;
		overflow: hidden;
		pointer-events: none;
	}
	.plane {
		position: absolute;
		top: 0;
		left: 0;
		width: 46px;
		height: 46px;
		margin: -23px 0 0 -23px;
		opacity: 0;
		filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5));
		will-change: transform, opacity;
	}
	.plane svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	/* click-spawned planes pop into existence instead of fading in */
	.plane svg.pop {
		animation: plane-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	@keyframes plane-pop {
		0% {
			transform: scale(0);
		}
		65% {
			transform: scale(1.35);
		}
		100% {
			transform: scale(1);
		}
	}
	/* a dark cloud behind the copy so planes passing under it stay legible */
	.t3-copy {
		padding: 3rem 4rem;
		background: radial-gradient(
			ellipse closest-side,
			rgba(6, 6, 10, 0.92) 45%,
			rgba(6, 6, 10, 0.6) 72%,
			transparent 100%
		);
	}
	.t3 {
		cursor: crosshair;
	}

	@media (prefers-reduced-motion: reduce) {
		.fix-target {
			transition: none;
		}
		.fix-cursor,
		.click-ring,
		.select-box {
			display: none;
		}
		.plane-field {
			display: none;
		}
		.ribbon {
			animation: none;
		}
	}

	.coda {
		max-width: 56rem;
		margin: 0 auto;
		padding: clamp(3rem, 10vh, 8rem) 0 2rem;
	}
	.coda-line {
		width: 80px;
		height: 2px;
		background: linear-gradient(90deg, transparent, #00f2c3, transparent);
		margin: 0 auto 2rem;
	}
	.coda-text {
		font-size: clamp(1.15rem, 1.8vw, 1.45rem);
		line-height: 1.6;
		margin: 0 0 1rem;
		opacity: 0.92;
	}
	.coda-sign {
		font-family: 'Caveat', cursive, var(--font-sans);
		font-size: 2rem;
		color: #00f2c3;
		margin-top: 1.6rem;
		opacity: 0.85;
	}
</style>
