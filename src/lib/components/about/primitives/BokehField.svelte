<script lang="ts">
	/**
	 * Out-of-focus highlights behind a section — what a fast lens does to points
	 * of light it isn't focused on. Show&Tour is built for photographers, so the
	 * background is a photograph's defect rather than a diagram's grid.
	 *
	 * Absolutely positioned to fill its nearest positioned ancestor, so drop it
	 * straight inside a `SectionShell` where the decorative background div would
	 * otherwise go.
	 *
	 * The field is laid out in *bands*, not across the section as a whole. Disc
	 * positions are percentages, so a single pass over a 4000px section put the
	 * same discs four times further apart than the same pass over a 1000px one —
	 * the field read as dense when it was first built against a short section and
	 * has been thinning out ever since as the sections grew. Repeating the
	 * placement once per screenful instead keeps the spacing the lens actually
	 * produces: a constant number of highlights in frame, however long the
	 * section that frame is scrolling through.
	 */
	let {
		/** 1 = the full field; 0.5 ≈ half the discs in each band. */
		density = 1,
		/**
		 * How the field fades out where the copy sits. Each section keeps its own
		 * copy legible its own way: a tall section with content all the way down
		 * wants a gentler mask than one with a single centred block.
		 */
		mask = 'radial-gradient(ellipse 70% 62% at 42% 50%, transparent, #000 88%)',
		/**
		 * The two lights in the scene, as `r, g, b`. Every disc picks one of them
		 * — real bokeh comes from a handful of practical sources, so a field of
		 * many hues reads as confetti rather than as one room out of focus.
		 *
		 * Saturated on purpose. The first pass used near-white tints — a very pale
		 * mint and a paler cream — which is what a highlight *clips* to in a photo,
		 * and the result read as grey smudges rather than as colour. Real bokeh
		 * takes its colour from the light source, and light sources have hues, so
		 * these are the hues with the white pulled back out of them.
		 *
		 * Both defaults are cool, because the default caller is Show&Tour and the
		 * warm second light it used to have put stray gold discs in a teal room —
		 * two lights, but not two lights that could be in the same scene. Teal and
		 * ice blue still read as two distinct sources without leaving the section's
		 * colour.
		 */
		tints = ['0, 255, 198', '96, 206, 255'],
		/**
		 * Camera flashes going off in the field — for the awards-show section.
		 * Off by default; a press pit is not what a photographer's portfolio
		 * background is doing.
		 */
		flashes = false,
	}: {
		density?: number;
		mask?: string;
		tints?: [string, string] | string[];
		flashes?: boolean;
	} = $props();

	let bg_el = $state<HTMLElement | null>(null);
	/** −0.5 when the field is still below the fold, +0.5 once it has left the top. */
	let shift = $state(0);
	/**
	 * How many screenfuls tall the section is — the number of times the placement
	 * repeats. Starts at 2 rather than 1 so the server-rendered field is already
	 * in the right ballpark for a typical section and the correction on mount is
	 * a disc or two appearing, not the field doubling.
	 */
	let bands = $state(2);

	/*
	 * Parallax, driven from the scroll position rather than from a CSS
	 * `view()` timeline. The timeline version was wired correctly — the right
	 * subject, the right keyframes — but its `currentTime` never left `null`,
	 * because the subject lives inside a section with `content-visibility: auto`
	 * and a skipped subtree has no layout for a view timeline to measure. This
	 * is also how `Parallax.svelte` already does it elsewhere on the page, and it
	 * works in Safari, which has no scroll-driven animations at all.
	 *
	 * One listener for the whole field: it writes a single number and every disc
	 * derives its own travel from it in CSS, so there is no per-element work here
	 * however many discs the array grows to.
	 */
	$effect(() => {
		if (!bg_el) return;
		const measure_bands = () => {
			const h = bg_el!.getBoundingClientRect().height;
			// One band per screenful, rounded rather than ceiled: a section 2.4
			// screens tall wants its placement stretched slightly over two bands,
			// not squashed into three. Never fewer than one.
			if (h > 0) bands = Math.max(1, Math.round(h / Math.max(1, window.innerHeight)));
		};
		measure_bands();
		const ro = new ResizeObserver(measure_bands);
		ro.observe(bg_el);

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return () => ro.disconnect();
		}
		const measure = () => {
			const rect = bg_el!.getBoundingClientRect();
			const travel = window.innerHeight + rect.height;
			if (travel <= 0) return;
			const raw = (window.innerHeight / 2 - (rect.top + rect.height / 2)) / travel;
			// ±0.5 spans the field's whole pass through the viewport; past that the
			// ratio keeps growing, and twenty sections away it reached ±15 — a
			// translate of thousands of pixels on discs nobody can see.
			shift = Math.max(-0.5, Math.min(0.5, raw));
		};
		measure();
		window.addEventListener('scroll', measure, { passive: true });
		window.addEventListener('resize', measure);
		return () => {
			ro.disconnect();
			window.removeEventListener('scroll', measure);
			window.removeEventListener('resize', measure);
		};
	});

	/**
	 * One screenful of lens. x/y are percentages *of a band*, size is px at the
	 * widest, tint indexes `tints`, and twinkle/delay are the shimmer's period
	 * and phase — no two share a period, so the field never beats in unison.
	 *
	 * Sizes and spacing are hand-placed rather than generated: real bokeh clumps
	 * and leaves gaps, and an even scatter reads as wallpaper. The clumps here
	 * are deliberate — a tight knot of small discs around 12/30 and another
	 * around 80/60, each with one big disc anchoring it, because highlights come
	 * from clusters of practical lights rather than from a spray.
	 */
	const BOKEH = [
		// Upper-left knot.
		{ x: 6, y: 11, size: 210, tint: 0, opacity: 0.5, twinkle: 7.5, delay: -8 },
		{ x: 13, y: 5, size: 54, tint: 1, opacity: 0.46, twinkle: 4.4, delay: -19 },
		{ x: 2, y: 22, size: 88, tint: 1, opacity: 0.38, twinkle: 6.9, delay: -2 },
		{ x: 17, y: 19, size: 42, tint: 0, opacity: 0.54, twinkle: 5.1, delay: -33 },
		{ x: 15, y: 32, size: 96, tint: 1, opacity: 0.42, twinkle: 5.2, delay: -22 },
		{ x: 8, y: 38, size: 38, tint: 0, opacity: 0.48, twinkle: 8.7, delay: -12 },
		{ x: 24, y: 27, size: 128, tint: 0, opacity: 0.26, twinkle: 10.2, delay: -40 },
		// Left edge, falling away.
		{ x: 3, y: 58, size: 148, tint: 0, opacity: 0.3, twinkle: 9.1, delay: -3 },
		{ x: 12, y: 66, size: 46, tint: 1, opacity: 0.44, twinkle: 6.2, delay: -28 },
		{ x: 21, y: 77, size: 64, tint: 1, opacity: 0.5, twinkle: 6.4, delay: -35 },
		{ x: 5, y: 84, size: 34, tint: 0, opacity: 0.52, twinkle: 4.8, delay: -16 },
		{ x: 11, y: 91, size: 122, tint: 0, opacity: 0.24, twinkle: 11.3, delay: -14 },
		// Across the top.
		{ x: 34, y: 7, size: 74, tint: 1, opacity: 0.34, twinkle: 8.2, delay: -27 },
		{ x: 43, y: 16, size: 40, tint: 0, opacity: 0.4, twinkle: 5.6, delay: -6 },
		{ x: 51, y: 9, size: 106, tint: 1, opacity: 0.22, twinkle: 12.1, delay: -37 },
		{ x: 62, y: 5, size: 118, tint: 0, opacity: 0.26, twinkle: 12.4, delay: -17 },
		{ x: 70, y: 13, size: 48, tint: 1, opacity: 0.44, twinkle: 7.3, delay: -24 },
		// Right-hand knot.
		{ x: 78, y: 20, size: 236, tint: 0, opacity: 0.44, twinkle: 9.7, delay: -5 },
		{ x: 88, y: 14, size: 52, tint: 1, opacity: 0.42, twinkle: 5.9, delay: -31 },
		{ x: 71, y: 43, size: 82, tint: 1, opacity: 0.46, twinkle: 5.8, delay: -30 },
		{ x: 82, y: 48, size: 36, tint: 0, opacity: 0.5, twinkle: 4.6, delay: -9 },
		{ x: 92, y: 36, size: 138, tint: 1, opacity: 0.28, twinkle: 10.6, delay: -19 },
		{ x: 86, y: 65, size: 190, tint: 0, opacity: 0.34, twinkle: 7.1, delay: -44 },
		{ x: 76, y: 71, size: 44, tint: 1, opacity: 0.48, twinkle: 6.7, delay: -21 },
		{ x: 96, y: 86, size: 88, tint: 0, opacity: 0.4, twinkle: 13.2, delay: -11 },
		// Along the bottom.
		{ x: 46, y: 94, size: 172, tint: 0, opacity: 0.2, twinkle: 6.8, delay: -41 },
		{ x: 37, y: 84, size: 32, tint: 1, opacity: 0.46, twinkle: 5.4, delay: -13 },
		{ x: 58, y: 88, size: 58, tint: 0, opacity: 0.36, twinkle: 9.4, delay: -46 },
		{ x: 68, y: 92, size: 58, tint: 1, opacity: 0.52, twinkle: 6.1, delay: -25 },
		// The mid-field, kept sparse — this is where the copy sits, and the mask
		// clears it anyway, but a disc or two drifting behind text sells depth.
		{ x: 40, y: 52, size: 66, tint: 1, opacity: 0.2, twinkle: 11.8, delay: -34 },
		{ x: 55, y: 64, size: 30, tint: 0, opacity: 0.28, twinkle: 7.8, delay: -18 },
		/*
		 * Second pass, filling the field out. The gaps these close were all in the
		 * band between the edge knots and the centre — the field read as two
		 * clusters with a hole rather than as a scene. Kept small and mostly dim:
		 * what a denser field needs is more *little* highlights between the big
		 * ones, not more big ones.
		 */
		{ x: 28, y: 4, size: 28, tint: 1, opacity: 0.5, twinkle: 4.1, delay: -7 },
		{ x: 19, y: 46, size: 58, tint: 1, opacity: 0.3, twinkle: 8.9, delay: -26 },
		{ x: 31, y: 62, size: 26, tint: 0, opacity: 0.42, twinkle: 5.7, delay: -39 },
		{ x: 26, y: 88, size: 84, tint: 0, opacity: 0.28, twinkle: 10.9, delay: -4 },
		{ x: 41, y: 33, size: 22, tint: 1, opacity: 0.46, twinkle: 4.9, delay: -15 },
		{ x: 49, y: 76, size: 40, tint: 1, opacity: 0.34, twinkle: 7.6, delay: -43 },
		{ x: 61, y: 27, size: 34, tint: 0, opacity: 0.4, twinkle: 6.3, delay: -20 },
		{ x: 64, y: 57, size: 52, tint: 0, opacity: 0.26, twinkle: 12.7, delay: -36 },
		{ x: 89, y: 55, size: 24, tint: 1, opacity: 0.48, twinkle: 5.3, delay: -1 },
		{ x: 94, y: 8, size: 68, tint: 0, opacity: 0.3, twinkle: 9.9, delay: -29 },
		{ x: 98, y: 62, size: 106, tint: 1, opacity: 0.22, twinkle: 11.1, delay: -48 },
		{ x: 84, y: 96, size: 42, tint: 0, opacity: 0.38, twinkle: 6.6, delay: -10 },
		{ x: 1, y: 45, size: 30, tint: 1, opacity: 0.44, twinkle: 7.2, delay: -23 },
		{ x: 9, y: 74, size: 76, tint: 1, opacity: 0.24, twinkle: 13.8, delay: -45 },
		/*
		 * The near plane. These sit closest to the lens, so they are much larger,
		 * much softer (a nearer defocus spreads the same light over more area, so
		 * the rim all but disappears — see `.near`), dimmer, slower to breathe,
		 * and they travel furthest on the parallax. Two of the four are placed
		 * deliberately off the edge of the frame: foreground bokeh is almost never
		 * politely contained, and a disc that runs off the side is what stops the
		 * field reading as a row of circles.
		 */
		{
			x: -6,
			y: 31,
			size: 520,
			tint: 1,
			opacity: 0.3,
			twinkle: 18.3,
			delay: -6,
			near: true,
		},
		{
			x: 57,
			y: 3,
			size: 430,
			tint: 0,
			opacity: 0.24,
			twinkle: 15.8,
			delay: -31,
			near: true,
		},
		{
			x: 104,
			y: 70,
			size: 470,
			tint: 1,
			opacity: 0.26,
			twinkle: 21.4,
			delay: -47,
			near: true,
		},
		{
			x: 28,
			y: 97,
			size: 380,
			tint: 0,
			opacity: 0.22,
			twinkle: 16.9,
			delay: -12,
			near: true,
		},
	];

	/** Two flashes per band, so a screenful pops every few seconds at most. */
	const FLASHES = [
		{ x: 24, y: 22, period: 9.3, delay: -2.1 },
		{ x: 79, y: 63, period: 13.7, delay: -8.4 },
	];

	/*
	 * Thinning is a fixed stride, never a random sample: the placement is
	 * hand-tuned, so a subset has to be the same subset on every render (and on
	 * the server as well as the client). The stride keeps the far/near mix
	 * intact — the near plane is at the end of the array and every other index
	 * still lands on two of the four.
	 */
	const discs = $derived.by(() => {
		if (density >= 1) return BOKEH;
		const stride = Math.max(2, Math.round(1 / Math.max(0.01, density)));
		const kept = BOKEH.filter((_, i) => i % stride === 0);
		return kept.some((d) => d.near) ? kept : [...kept, BOKEH.findLast((d) => d.near)!];
	});

	/*
	 * Per-band variation, so the repeat doesn't read as a tiled pattern. Every
	 * value is derived from the band index by integer hash — deterministic, so
	 * server and client agree, and stable across re-renders, so a resize that
	 * adds a band doesn't reshuffle the ones already on screen.
	 *
	 * Odd bands mirror horizontally, and every band gets its own small x nudge
	 * and size scaling. Mirroring alone would give an obvious A/B/A/B rhythm;
	 * the nudge and the scale break it.
	 */
	const hash = (n: number) => ((n * 2654435761) % 4294967296) / 4294967296;
	const band_list = $derived(
		Array.from({ length: bands }, (_, b) => ({
			b,
			mirror: b % 2 === 1,
			dx: (hash(b + 1) - 0.5) * 14,
			scale: 0.86 + hash(b + 7) * 0.3,
		})),
	);
</script>

<div
	bind:this={bg_el}
	class="bg"
	aria-hidden="true"
	style:--shift={shift}
	style:--tint-a={tints[0]}
	style:--tint-b={tints[1] ?? tints[0]}
	style:mask-image={mask}>
	{#each band_list as band (band.b)}
		<div
			class="band"
			style:--top="{(band.b * 100) / bands}%"
			style:--height="{100 / bands}%">
			{#each discs as ball, i (i)}
				<span
					class="bokeh"
					class:near={ball.near}
					style:--x="{(band.mirror ? 100 - ball.x : ball.x) + band.dx}%"
					style:--y="{ball.y}%"
					style:--size="{Math.round(ball.size * band.scale)}px"
					style:--tint="var(--tint-{ball.tint === 0 ? 'a' : 'b'})"
					style:--opacity={ball.opacity}
					style:--twinkle="{ball.twinkle}s"
					style:--delay="{ball.delay}s">
				</span>
			{/each}
			{#if flashes}
				{#each FLASHES as f, i (i)}
					<span
						class="flash"
						style:--x="{(band.mirror ? 100 - f.x : f.x) + band.dx}%"
						style:--y="{f.y}%"
						style:--period="{f.period + band.b * 1.7}s"
						style:--delay="{f.delay - band.b * 3.4}s">
					</span>
				{/each}
			{/if}
		</div>
	{/each}
	<span class="grain"></span>
</div>

<style>
	.bg {
		position: absolute;
		inset: 0;
		overflow: clip;
		pointer-events: none;
		/* The mask is a prop: densest at the edges and clear behind the copy is
		   the default — the same thing a photographer does by putting the subject
		   in the plane of focus — but a section with copy all the way down needs
		   to make that trade differently. */
	}
	/* One screenful of placement. Percentage positions inside resolve against
	   this rather than against the whole section, which is what keeps the
	   spacing constant however tall the section grows. */
	.band {
		position: absolute;
		top: var(--top);
		left: 0;
		right: 0;
		height: var(--height);
	}
	.bokeh {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		aspect-ratio: 1;
		margin: calc(var(--size) / -2);
		border-radius: 50%;
		opacity: var(--opacity);
		/*
		 * Travel scales with diameter, because a bigger blur circle is a nearer
		 * one and near things cross the frame faster than far ones. That
		 * relationship — not the movement on its own — is what reads as depth.
		 * Negative, so the discs run *ahead* of the page as it scrolls up, the
		 * way foreground does.
		 */
		translate: 0 calc(var(--shift, 0) * var(--size) * -0.633);
		/*
		 * A defocused highlight is not a glow: it is a disc, slightly dimmer in
		 * the middle than at its rim, that ends. The bright ring at 86–94% is
		 * what separates the two, and it is why this reads as a lens rather than
		 * as a light behind the page.
		 */
		/* Roughly doubled from the first pass. At the old alphas the rim — the one
		   feature that separates a defocused disc from a glow — was under 15%
		   opacity on a near-black background, which is to say invisible. */
		background: radial-gradient(
			circle closest-side,
			rgba(var(--tint), 0.09) 0%,
			rgba(var(--tint), 0.13) 68%,
			rgba(var(--tint), 0.27) 86%,
			rgba(var(--tint), 0.16) 94%,
			rgba(var(--tint), 0) 100%
		);
		/*
		 * Twinkle, at rest — a candle out of focus. Two animations, because a
		 * flame has two speeds: a slow breath as the flame leans and the disc
		 * swells, and a faster shimmer riding on top of it. They stay on separate
		 * properties (`opacity`/`scale` vs `filter`) so both apply — a second
		 * animation on the same property would simply win.
		 *
		 * The breath's keyframes are deliberately at uneven offsets and uneven
		 * amounts: an evenly-spaced fade in and out is a pulsing UI dot, which is
		 * the one thing this must not look like.
		 *
		 * `translate` is left alone by both, because the parallax owns it — the
		 * three effects sit on three separate properties, so they compose instead
		 * of the last one winning outright.
		 */
		animation:
			twinkle var(--twinkle) ease-in-out var(--delay) infinite,
			flicker calc(var(--twinkle) / 5.7) ease-in-out var(--delay) infinite;
	}
	/*
	 * The near plane. Push a highlight further out of focus and the disc doesn't
	 * just grow — the same light is spread over a much larger area, so it dims,
	 * and the crisp rim smears into nothing. Keeping the far discs' hard ring on
	 * something this size would read as a drawn circle sitting on the page, which
	 * is exactly what we don't want this close to the copy.
	 */
	.bokeh.near {
		background: radial-gradient(
			circle closest-side,
			rgba(var(--tint), 0.062) 0%,
			rgba(var(--tint), 0.08) 62%,
			rgba(var(--tint), 0.115) 82%,
			rgba(var(--tint), 0.055) 93%,
			rgba(var(--tint), 0) 100%
		);
	}
	@keyframes twinkle {
		0%,
		100% {
			opacity: var(--opacity);
			scale: 1;
		}
		9% {
			opacity: calc(var(--opacity) * 0.892);
			scale: 0.991;
		}
		17% {
			opacity: calc(var(--opacity) * 1.054);
			scale: 1.008;
		}
		31% {
			opacity: calc(var(--opacity) * 0.784);
			scale: 0.971;
		}
		44% {
			opacity: calc(var(--opacity) * 0.937);
			scale: 0.996;
		}
		58% {
			opacity: calc(var(--opacity) * 1.198);
			scale: 1.031;
		}
		69% {
			opacity: calc(var(--opacity) * 1.045);
			scale: 1.012;
		}
		83% {
			opacity: calc(var(--opacity) * 0.847);
			scale: 0.98;
		}
	}
	@keyframes flicker {
		0%,
		100% {
			filter: brightness(1);
		}
		30% {
			filter: brightness(0.892);
		}
		64% {
			filter: brightness(1.126);
		}
	}

	/*
	 * A flashbulb somewhere in the crowd. The whole event is over in about 4% of
	 * the cycle — a press pit is not a strobe, it is long dark stretches with the
	 * occasional pop — and the periods are coprime-ish and offset per band so two
	 * never land together.
	 */
	.flash {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: 3px;
		aspect-ratio: 1;
		margin: -1.5px;
		border-radius: 50%;
		opacity: 0;
		background: #fff;
		/* The bloom does the work — the source itself is a couple of pixels. */
		box-shadow:
			0 0 6px 3px rgba(255, 255, 255, 0.9),
			0 0 26px 12px rgba(255, 244, 214, 0.5),
			0 0 70px 34px rgba(255, 226, 150, 0.22);
		animation: pop var(--period) linear var(--delay) infinite;
	}
	/* The horizontal flare an anamorphic-ish lens throws off a point that
	   bright. Scales with the pop, so it arrives and leaves with it. */
	.flash::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 180px;
		height: 2px;
		translate: -50% -50%;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 240, 200, 0.55) 42%,
			rgba(255, 255, 255, 0.8) 50%,
			rgba(255, 240, 200, 0.55) 58%,
			transparent
		);
		filter: blur(1px);
	}
	@keyframes pop {
		0%,
		100% {
			opacity: 0;
			scale: 0.4;
		}
		/* Rise is faster than the fall — a bulb dumps its charge, then the
		   phosphor and the eye both take a moment to let go. */
		0.6% {
			opacity: 1;
			scale: 1.15;
		}
		1.4% {
			opacity: 0.85;
			scale: 1;
		}
		4% {
			opacity: 0;
			scale: 0.8;
		}
	}

	/* Film grain over the whole thing, so the bokeh sits in an image instead of
	   floating on a flat panel. */
	.grain {
		position: absolute;
		inset: 0;
		opacity: 0.3;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E");
	}
	/* Neither the twinkle nor the parallax survives reduced motion — the field
	   is still there, just held. The flashes go entirely: a bulb firing is the
	   one thing here that can't be expressed as a still. */
	@media (prefers-reduced-motion: reduce) {
		.bokeh {
			animation: none;
			/* The effect never updates `--shift` under reduced motion, but pin the
			   translate too so a stale value can't leave the field off-register. */
			translate: none;
		}
		.flash {
			display: none;
		}
	}
</style>
