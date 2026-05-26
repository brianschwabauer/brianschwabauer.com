<script lang="ts">
	import { onMount } from 'svelte';
	import SectionShell from '../primitives/SectionShell.svelte';
	import Reveal from '../primitives/Reveal.svelte';

	const currentYear = new Date().getFullYear();
	const START_YEAR = 2006;

	let displayYear = $state(currentYear);
	let animating = $state(false);
	let sectionEl = $state<HTMLElement | null>(null);

	onMount(() => {
		if (!sectionEl) return;
		if (typeof IntersectionObserver === 'undefined') {
			displayYear = START_YEAR;
			return;
		}
		let started = false;
		const obs = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting || started) continue;
					started = true;
					obs.disconnect();
					runRewind();
				}
			},
			{ threshold: 0.4 },
		);
		obs.observe(sectionEl);
		return () => obs.disconnect();
	});

	function runRewind() {
		animating = true;
		const start = performance.now();
		const dur = 3800;
		let raf = 0;
		const tick = (t: number) => {
			const p = Math.min(1, (t - start) / dur);
			const eased = 1 - Math.pow(1 - p, 3);
			displayYear = Math.round(currentYear - (currentYear - START_YEAR) * eased);
			if (p < 1) {
				raf = requestAnimationFrame(tick);
			} else {
				animating = false;
			}
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}

	function scrollToOrigin() {
		const el = document.getElementById('humble-beginnings');
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top });
	}

	const percent = $derived(
		((currentYear - displayYear) / (currentYear - START_YEAR)) * 100,
	);
</script>

<SectionShell id="rewind" year={String(currentYear)} label="Rewind" theme="rewind">
	<div class="bg" aria-hidden="true">
		<div class="grid-overlay"></div>
		<div class="vignette"></div>
	</div>

	<div class="container" bind:this={sectionEl}>
		<Reveal variant="up" delay={120}>
			<h2 class="title">Where it all started.</h2>
		</Reveal>

		<Reveal variant="up" delay={220}>
			<p class="lede">
				Before the startup, the apps, the company &mdash; there was a miniDV camera, a
				bedroom wall painted green, and a friend named Kevin.
			</p>
		</Reveal>

		<Reveal variant="up" delay={300}>
			<div class="counter" class:animating>
				<div class="counter-label">
					<span class="rew" aria-hidden="true">◄◄</span>
					Rewinding…
				</div>
				<div class="counter-number" aria-live="off">{displayYear}</div>
				<div class="counter-rail">
					<div class="counter-fill" style:width="{percent}%"></div>
				</div>
				<div class="counter-meta">
					<span>{currentYear}</span>
					<span>{START_YEAR}</span>
				</div>
			</div>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='rewind']) {
		background:
			radial-gradient(circle at 50% 0%, rgba(108, 99, 255, 0.18), transparent 55%),
			radial-gradient(circle at 50% 100%, rgba(255, 156, 74, 0.1), transparent 60%),
			linear-gradient(180deg, #050a10, #0a0a12 50%, #100a06);
		color: #fff;
	}
	.bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.grid-overlay {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0 2px,
			transparent 2px 80px
		);
		mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
		opacity: 0.6;
	}
	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			rgba(5, 5, 10, 0.65) 75%,
			#050a10 100%
		);
	}
	.container {
		position: relative;
		z-index: 1;
		max-width: 64rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.4rem;
	}
	@keyframes rewind-spin {
		0%,
		100% {
			transform: translateX(0);
		}
		50% {
			transform: translateX(-3px);
		}
	}

	.title {
		font-size: clamp(2rem, 5vw, 3.4rem);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.025em;
		margin: 0;
		max-width: 52rem;
	}
	.grad {
		background: linear-gradient(95deg, #c8c2ff, #00f2c3);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.grad.accent {
		background: linear-gradient(95deg, #ff9c4a, #ffd54a);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.6vw, 1.2rem);
		line-height: 1.55;
		max-width: 44rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.counter {
		width: min(28rem, 92%);
		padding: 1.4rem 1.5rem;
		background: rgba(0, 0, 0, 0.45);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		backdrop-filter: blur(10px);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		text-align: left;
	}
	.counter-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
	}
	.rew {
		display: inline-block;
		color: #ff9c4a;
		opacity: 0.6;
	}
	.counter.animating .rew {
		opacity: 1;
		animation: rew-pulse 700ms ease-in-out infinite;
	}
	@keyframes rew-pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}
	.counter-number {
		font-family: var(--font-mono);
		font-size: clamp(2.8rem, 7vw, 4rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
		color: #fff;
		line-height: 1;
	}
	.counter-rail {
		height: 3px;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		overflow: hidden;
		margin-top: 0.4rem;
	}
	.counter-fill {
		height: 100%;
		background: linear-gradient(90deg, #ff9c4a, #6c63ff);
		transition: width 80ms linear;
	}
	.counter-meta {
		display: flex;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.55);
		letter-spacing: 0.08em;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.85rem 1.5rem;
		border-radius: 999px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 200ms ease,
			transform 200ms ease,
			border-color 200ms ease;
	}
	.cta:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 156, 74, 0.55);
		transform: translateY(-2px);
	}
	.cta:focus-visible {
		outline: 2px solid #ff9c4a;
		outline-offset: 3px;
	}
	.cta svg {
		width: 18px;
		height: 18px;
		animation: bob 2.4s ease-in-out infinite;
	}
	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(4px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.eyebrow svg,
		.cta svg,
		.rew {
			animation: none;
		}
	}
</style>
