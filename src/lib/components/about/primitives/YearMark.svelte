<script lang="ts">
	let {
		year,
		subtitle = '',
		color = 'currentColor',
		size = 'clamp(7rem, 22vw, 18rem)',
		fringe = false,
	}: {
		year: string;
		subtitle?: string;
		color?: string;
		size?: string;
		/**
		 * Print the numerals as three passes out of register — the colour fringing
		 * of a fast lens, or a plate that never quite lined up. Off by default:
		 * it's a strong effect, and it belongs to the sections about lenses and
		 * compositing rather than to every year on the page.
		 */
		fringe?: boolean;
	} = $props();

	let el = $state<HTMLElement | null>(null);
	let progress = $state(0);

	$effect(() => {
		if (!el) return;
		const onScroll = () => {
			const rect = el!.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			const navbarHeight = 350;
			const total = rect.height + vh - navbarHeight;
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
	class:fringe
	style:--p={progress}
	style:--year-color={color}
	style:--year-size={size}>
	<span class="year" aria-hidden="true" data-year={year}>{year}</span>
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
	/*
	 * Chromatic misregistration on the numerals, converging as the year arrives.
	 *
	 * The hero-style trick of two coloured text-shadows can't work here: the
	 * glyph is `color: transparent` until the wipe fills it, so nothing would
	 * mask the middle of the shadows and you'd get two solid silhouettes instead
	 * of a fringe. What these numerals *are* is a line drawing, so the honest
	 * version is the one a misregistered print actually produces — the same
	 * outline struck twice more, in two colours, a little to either side.
	 *
	 * The separation is driven by `--p`, the scroll progress the wipe already
	 * runs on, so no second animation and no new machinery: the passes are ~5×
	 * apart when the year is still empty and pull into register exactly as it
	 * fills. The plates line up as the year lands.
	 */
	.fringe .year {
		--sep: calc((1 - var(--p)) * 0.05em + 0.012em);
		position: relative;
	}
	.fringe .year::before,
	.fringe .year::after {
		content: attr(data-year);
		position: absolute;
		left: 0;
		top: 0;
		color: transparent;
		pointer-events: none;
	}
	.fringe .year::before {
		-webkit-text-stroke: 2px rgba(0, 224, 182, 0.7);
		translate: var(--sep) 0;
	}
	.fringe .year::after {
		-webkit-text-stroke: 2px rgba(255, 95, 179, 0.6);
		translate: calc(var(--sep) * -1) 0;
	}
	/* Scroll-linked movement is still movement. Pin the plates in register. */
	@media (prefers-reduced-motion: reduce) {
		.fringe .year {
			--sep: 0.012em;
		}
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
		.year,
		.fringe .year::before,
		.fringe .year::after {
			-webkit-text-stroke-width: 1.5px;
		}
	}
</style>
