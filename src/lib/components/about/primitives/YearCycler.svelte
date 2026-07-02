<script lang="ts">
	let {
		years,
		color = '#ffffff',
		caption = '',
		pinHeight = '100vh',
	}: {
		years: number[];
		color?: string;
		caption?: string;
		pinHeight?: string;
	} = $props();

	let el = $state<HTMLElement | null>(null);
	let stickyEl = $state<HTMLElement | null>(null);
	let progress = $state(0);

	$effect(() => {
		if (!el) return;
		const onScroll = () => {
			const rect = el!.getBoundingClientRect();
			// Measure the sticky window itself (100svh) instead of
			// window.innerHeight, which changes when the mobile URL bar collapses
			// and would make the progress mapping jump mid-scrub.
			const vh = stickyEl?.offsetHeight || window.innerHeight || 1;
			// rect.height = sticky window + pinHeight (extra scroll room).
			// Track progress from when the section's top hits viewport top (start of pin)
			// to when the sticky reaches the bottom of its container (end of pin).
			const t = -rect.top;
			const span = rect.height - vh;
			progress = span > 0 ? Math.max(0, Math.min(1, t / span)) : 0;
		};
		// Only track scroll while the cycler is near the viewport.
		let listening = false;
		const listen = (on: boolean) => {
			if (on === listening) return;
			listening = on;
			if (on) {
				onScroll();
				window.addEventListener('scroll', onScroll, { passive: true });
				window.addEventListener('resize', onScroll);
			} else {
				window.removeEventListener('scroll', onScroll);
				window.removeEventListener('resize', onScroll);
			}
		};
		// Fail-open: start listening immediately; the observer only *pauses*
		// tracking once it has actually reported the cycler as off-screen.
		listen(true);
		if (typeof IntersectionObserver === 'undefined') {
			return () => listen(false);
		}
		const io = new IntersectionObserver(
			(entries) => listen(entries.some((e) => e.isIntersecting)),
			{ rootMargin: '100% 0px' },
		);
		io.observe(el);
		return () => {
			io.disconnect();
			listen(false);
		};
	});

	const virtualIndex = $derived(years.length > 1 ? progress * (years.length - 1) : 0);
</script>

<div
	bind:this={el}
	class="year-cycler"
	style:--c={color}
	style:--pin-height={pinHeight}
	aria-hidden="true">
	<div class="sticky" bind:this={stickyEl}>
		<div class="stage">
			{#each years as y, i (y)}
				{@const offset = i - virtualIndex}
				{@const opacity = Math.max(0, 1 - Math.min(1, Math.abs(offset)))}
				<span class="year" style:transform="translateY({offset * 100}%)" style:opacity>
					{y}
				</span>
			{/each}
		</div>
		<div class="rail">
			<div class="fill" style:transform="scaleX({progress})"></div>
		</div>
		{#if caption}
			<div class="caption">{caption}</div>
		{/if}
	</div>
</div>

<style>
	.year-cycler {
		position: relative;
		width: 100%;
		/* sticky window (100svh) + scroll distance (pinHeight) */
		height: calc(100svh + var(--pin-height));
		pointer-events: none;
		user-select: none;
	}
	.sticky {
		position: sticky;
		top: 0;
		height: 100svh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
	}
	.stage {
		position: relative;
		width: 100%;
		height: clamp(7rem, 22vw, 25rem);
		overflow: hidden;
	}
	.year {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: clamp(7rem, 22vw, 25rem);
		line-height: 1;
		letter-spacing: -0.04em;
		color: transparent;
		-webkit-text-stroke: 2px var(--c);
		font-variant-numeric: tabular-nums;
		transition:
			transform 120ms linear,
			opacity 120ms linear;
		will-change: transform, opacity;
	}
	.rail {
		width: min(50vw, 24rem);
		height: 2px;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 2px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		width: 100%;
		background: var(--c);
		transform-origin: left;
		transition: transform 80ms linear;
	}
	.caption {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		opacity: 0.5;
		color: #fff;
	}
	@media (max-width: 640px) {
		.year {
			-webkit-text-stroke-width: 1.5px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.year {
			transition: none;
		}
	}
</style>
