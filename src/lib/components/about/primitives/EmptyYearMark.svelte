<script lang="ts">
	let {
		year,
		color = '#ffffff',
		height = '60vh',
		note = '',
	}: {
		year: string | number;
		color?: string;
		height?: string;
		/** Optional "meanwhile…" footnote so a gap year reads as intentional. */
		note?: string;
	} = $props();

	let el = $state<HTMLElement | null>(null);
	let progress = $state(0);

	$effect(() => {
		if (!el) return;
		const onScroll = () => {
			const rect = el!.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			const total = rect.height + vh;
			const traversed = vh - rect.top;
			progress = Math.max(0, Math.min(1, traversed / total));
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	// Bell curve — invisible at edges, peak when centered in viewport.
	const wave = $derived(Math.sin(progress * Math.PI));
	// Drift the year from right to left across the viewport.
	const drift = $derived((0.5 - progress) * 40);
</script>

<div
	bind:this={el}
	class="empty-year"
	style:--p={progress}
	style:--w={wave}
	style:--drift="{drift}vw"
	style:--year-color={color}
	style:--block-height={height}
	aria-hidden={note ? undefined : 'true'}>
	<span class="tick tick-l"></span>
	<span class="year" aria-hidden="true">{year}</span>
	<span class="tick tick-r"></span>
	{#if note}
		<p class="note">
			<span class="note-label">Meanwhile</span>
			{note}
		</p>
	{/if}
</div>

<style>
	.empty-year {
		position: relative;
		width: 100%;
		height: var(--block-height);
		min-height: 18rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(0.75rem, 2vw, 1.5rem);
		overflow: hidden;
		pointer-events: none;
		user-select: none;
		contain: layout paint;
	}
	.year {
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: clamp(7rem, 24vw, 20rem);
		line-height: 0.85;
		letter-spacing: -0.04em;
		color: transparent;
		-webkit-text-stroke: 2px var(--year-color);
		opacity: calc(0.15 + var(--w) * 0.55);
		transform: translateX(var(--drift)) scale(calc(0.78 + var(--w) * 0.22));
		transition:
			opacity 80ms linear,
			transform 80ms linear;
		font-variant-numeric: tabular-nums;
	}
	.tick {
		display: block;
		height: 1px;
		flex: 1;
		max-width: 22vw;
		background: linear-gradient(90deg, transparent, var(--year-color) 50%, transparent);
		opacity: calc(var(--w) * 0.5);
	}
	.note {
		position: absolute;
		left: 50%;
		bottom: clamp(1.5rem, 8vh, 4rem);
		transform: translateX(-50%);
		width: min(34rem, 86vw);
		margin: 0;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.55);
		opacity: calc(var(--w) * 1.2);
	}
	.note-label {
		display: block;
		margin-bottom: 0.35rem;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--year-color);
		opacity: 0.8;
	}
	@media (max-width: 640px) {
		.year {
			-webkit-text-stroke-width: 1.5px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.year {
			transform: none;
			transition: none;
		}
	}
</style>
