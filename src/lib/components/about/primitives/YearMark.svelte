<script lang="ts">
	let {
		year,
		subtitle = '',
		color = 'currentColor',
		size = 'clamp(7rem, 22vw, 18rem)'
	}: {
		year: string;
		subtitle?: string;
		color?: string;
		size?: string;
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
</script>

<div
	bind:this={el}
	class="year-mark"
	style:--p={progress}
	style:--year-color={color}
	style:--year-size={size}
>
	<span class="year" aria-hidden="true">{year}</span>
	{#if subtitle}
		<span class="subtitle">{subtitle}</span>
	{/if}
</div>

<style>
	.year-mark {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		pointer-events: none;
		user-select: none;
		margin: clamp(2rem, 6vw, 4rem) 0;
	}
	.year {
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: var(--year-size);
		line-height: 0.85;
		letter-spacing: -0.04em;
		color: transparent;
		-webkit-text-stroke: 2px var(--year-color);
		background: linear-gradient(
			90deg,
			var(--year-color) calc(var(--p) * 100%),
			transparent calc(var(--p) * 100%)
		);
		-webkit-background-clip: text;
		background-clip: text;
		transform: translateX(calc((1 - var(--p)) * -3vw));
		transition: transform 200ms linear;
	}
	.subtitle {
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.4em;
		font-size: 0.85rem;
		opacity: 0.7;
		padding-left: 0.4rem;
	}
	@media (max-width: 640px) {
		.year {
			-webkit-text-stroke-width: 1.5px;
		}
	}
</style>
