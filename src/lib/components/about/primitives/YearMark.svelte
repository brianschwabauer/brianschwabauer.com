<script lang="ts">
	/**
	 * The giant year that opens each chapter. The numerals are a line drawing that
	 * fills in as the mark crosses the viewport — every section gets that — and
	 * one of a handful of `treatment`s on top, which is how the year picks up the
	 * medium its chapter was made with.
	 *
	 * The treatments all hang off the same `--p` the wipe already runs on, so a
	 * section never pays for a second scroll listener to get one: they are
	 * different readings of the same number.
	 */
	let {
		year,
		subtitle = '',
		color = 'currentColor',
		size = 'clamp(7rem, 22vw, 18rem)',
		treatment = 'plain',
	}: {
		year: string;
		subtitle?: string;
		color?: string;
		size?: string;
		/**
		 * - `plain` — the wipe on its own.
		 * - `fringe` — three passes out of register, converging as the year fills.
		 *   Belongs to the compositing chapter.
		 * - `foil` — stamped gold, with the specular highlight riding the wipe's
		 *   leading edge. The awards show.
		 * - `clone` — the year copies itself, and each copy is a copy of the copy
		 *   before it: further out, fainter, blurrier. The teleporter chapter.
		 */
		treatment?: 'plain' | 'fringe' | 'foil' | 'clone';
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

	/**
	 * Where each generation goes. Directions are deliberately uneven in both angle
	 * and length: copies that fan out symmetrically read as a designed starburst,
	 * and the point here is that nobody chose where these went.
	 */
	const CLONES = [
		{ dx: 1, dy: -0.34 },
		{ dx: -0.86, dy: 0.52 },
		{ dx: 0.51, dy: 0.83 },
		{ dx: -0.44, dy: -0.71 },
		{ dx: 1.12, dy: 0.24 },
	];
</script>

<div
	bind:this={el}
	class="year-mark {treatment}"
	style:--p={progress}
	style:--year-color={color}
	style:--year-size={size}>
	{#if treatment === 'clone'}
		<!--
		  Behind the original, not in front of it: the copies are what came off it,
		  so the thing you scanned stays the most solid object on screen.

		  `copy`, not `clone` — the treatment name goes on the root element, so a
		  child class of `clone` was also matching the root and absolutely
		  positioning the entire year mark out of flow, which let the section's
		  title ride straight over it.
		-->
		{#each CLONES as c, i (i)}
			<span
				class="copy"
				aria-hidden="true"
				style:--dx={c.dx}
				style:--dy={c.dy}
				style:--g={i + 1}>
				{year}
			</span>
		{/each}
	{/if}

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
		/* Above its own clones. */
		position: relative;
		z-index: 1;
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

	/*
	 * Stamped gold. The trick is that the specular highlight is not a separate
	 * animation — it is three stops parked just behind the wipe's leading edge,
	 * so the shine sits exactly where the metal is being revealed. Foil catches
	 * the light along the edge that is turning toward you, and here the wipe is
	 * that edge.
	 *
	 * The stops behind it run dark → bright → mid rather than flat gold: a flat
	 * fill is yellow paint, and what separates metal from paint is that it is
	 * lighter and darker than itself within a single glyph.
	 */
	.foil .year {
		background: linear-gradient(
			98deg,
			#7a5a10 0%,
			#c9a233 calc(var(--p) * 100% - 26%),
			#f6e08a calc(var(--p) * 100% - 11%),
			#fffbe8 calc(var(--p) * 100% - 3.5%),
			#d9ab1e calc(var(--p) * 100%),
			transparent calc(var(--p) * 100%)
		);
		-webkit-background-clip: text;
		background-clip: text;
		/* The bounce light a gold surface throws onto whatever it sits on. */
		filter: drop-shadow(0 0 26px rgba(255, 205, 60, 0.18));
	}

	/*
	 * The teleporter.
	 *
	 * The film's premise is that the machine scans you, sends the data, prints a
	 * new you at the far end, and destroys the original — and the question it
	 * leaves open is whether the copy is still you. So the year makes copies of
	 * itself as it crosses the screen, and each generation is a copy of the
	 * generation before rather than of the original: further out, fainter, and
	 * softer, until there is not enough left to read.
	 *
	 * Everything degrades with `--g`, the generation number. That is the whole
	 * argument — no single copy is obviously wrong, but the fifth one is barely
	 * a year at all.
	 */
	.copy {
		position: absolute;
		top: 0;
		left: 0;
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: var(--year-size);
		line-height: 0.85;
		letter-spacing: -0.04em;
		white-space: nowrap;
		color: transparent;
		/* Outline only. A filled copy would compete with the original; an outline
		   is visibly the *shape* of it with the substance gone. */
		-webkit-text-stroke: 1.4px var(--year-color);
		/*
		 * Distance compounds with generation, so the gaps between copies grow
		 * rather than staying even — each one is drifting from the one before it,
		 * not from the source.
		 */
		translate: calc(var(--dx) * var(--p) * var(--g) * 0.17em)
			calc(var(--dy) * var(--p) * var(--g) * 0.17em);
		/* Later generations drift a little larger, the way a copy never quite
		   registers at the same size. */
		scale: calc(1 + var(--p) * var(--g) * 0.014);
		/* Loss of detail is the degradation you can actually see. */
		filter: blur(calc(var(--p) * var(--g) * 1.15px));
		/*
		 * Nothing at the start, strongest around the middle of the travel, gone by
		 * the end — the copies emerge, separate, and are lost. `sin()` gives that
		 * arc in one expression off the same `--p` everything else uses.
		 */
		opacity: calc(sin(var(--p) * 180deg) * 0.52 / var(--g));
	}
	@media (prefers-reduced-motion: reduce) {
		/* The whole effect is travel. Held still it is five stacked outlines, which
		   is worse than nothing. */
		.copy {
			display: none;
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
		.copy {
			-webkit-text-stroke-width: 1px;
		}
	}
</style>
