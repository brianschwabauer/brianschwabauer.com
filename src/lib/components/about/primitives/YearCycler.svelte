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
	let progress = $state(0);

	$effect(() => {
		if (!el) return;
		const onScroll = () => {
			const rect = el!.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			// rect.height = vh (sticky window) + pinHeight (extra scroll room).
			// Track progress from when the section's top hits viewport top (start of pin)
			// to when the sticky reaches the bottom of its container (end of pin).
			const t = -rect.top;
			const span = rect.height - vh;
			progress = span > 0 ? Math.max(0, Math.min(1, t / span)) : 0;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
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
	<div class="sticky">
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
			<div class="fill" style:width="{progress * 100}%"></div>
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
		/* sticky window (100vh) + scroll distance (pinHeight) */
		height: calc(100vh + var(--pin-height));
		pointer-events: none;
		user-select: none;
	}
	.sticky {
		position: sticky;
		top: 0;
		height: 100vh;
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
		background: var(--c);
		transition: width 80ms linear;
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
