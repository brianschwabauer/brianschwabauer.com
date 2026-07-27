<script lang="ts">
	/**
	 * Out-of-focus highlights behind a section — what a fast lens does to points
	 * of light it isn't focused on. Show&Tour is built for photographers, so the
	 * background is a photograph's defect rather than a diagram's grid.
	 *
	 * Absolutely positioned to fill its nearest positioned ancestor, so drop it
	 * straight inside a `SectionShell` where the decorative background div would
	 * otherwise go.
	 */
	let {
		/** 1 = the full 17-disc field; 0.5 ≈ half the discs. */
		density = 1,
		/**
		 * How the field fades out where the copy sits. Each section keeps its own
		 * copy legible its own way: a tall section with content all the way down
		 * wants a gentler mask than one with a single centred block.
		 */
		mask = 'radial-gradient(ellipse 70% 62% at 42% 50%, transparent, #000 88%)',
	}: { density?: number; mask?: string } = $props();

	let bg_el = $state<HTMLElement | null>(null);
	/** −0.5 when the field is still below the fold, +0.5 once it has left the top. */
	let shift = $state(0);

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
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
			window.removeEventListener('scroll', measure);
			window.removeEventListener('resize', measure);
		};
	});

	/**
	 * x/y are percentages of the section, size is px at the widest, tint is the
	 * disc's colour, and twinkle/delay are the shimmer's period and phase — no
	 * two share a period, so the field never beats in unison. Sizes and spacing
	 * are hand-placed rather than generated: real bokeh clumps and leaves gaps,
	 * and an even scatter reads as wallpaper.
	 */
	const BOKEH = [
		{
			x: 6,
			y: 14,
			size: 210,
			tint: '150, 255, 232',
			opacity: 0.5,
			twinkle: 7.5,
			delay: -8,
		},
		{
			x: 15,
			y: 34,
			size: 96,
			tint: '255, 236, 200',
			opacity: 0.42,
			twinkle: 5.2,
			delay: -22,
		},
		{
			x: 3,
			y: 62,
			size: 148,
			tint: '150, 255, 232',
			opacity: 0.3,
			twinkle: 9.1,
			delay: -3,
		},
		{
			x: 21,
			y: 79,
			size: 64,
			tint: '255, 236, 200',
			opacity: 0.5,
			twinkle: 6.4,
			delay: -35,
		},
		{
			x: 11,
			y: 91,
			size: 122,
			tint: '150, 255, 232',
			opacity: 0.24,
			twinkle: 11.3,
			delay: -14,
		},
		{
			x: 34,
			y: 8,
			size: 74,
			tint: '255, 236, 200',
			opacity: 0.34,
			twinkle: 8.2,
			delay: -27,
		},
		{
			x: 46,
			y: 96,
			size: 172,
			tint: '150, 255, 232',
			opacity: 0.2,
			twinkle: 6.8,
			delay: -41,
		},
		{
			x: 62,
			y: 6,
			size: 118,
			tint: '150, 255, 232',
			opacity: 0.26,
			twinkle: 12.4,
			delay: -17,
		},
		{
			x: 78,
			y: 21,
			size: 236,
			tint: '150, 255, 232',
			opacity: 0.44,
			twinkle: 9.7,
			delay: -5,
		},
		{
			x: 71,
			y: 44,
			size: 82,
			tint: '255, 236, 200',
			opacity: 0.46,
			twinkle: 5.8,
			delay: -30,
		},
		{
			x: 92,
			y: 37,
			size: 138,
			tint: '255, 236, 200',
			opacity: 0.28,
			twinkle: 10.6,
			delay: -19,
		},
		{
			x: 86,
			y: 68,
			size: 190,
			tint: '150, 255, 232',
			opacity: 0.34,
			twinkle: 7.1,
			delay: -44,
		},
		{
			x: 96,
			y: 88,
			size: 88,
			tint: '150, 255, 232',
			opacity: 0.4,
			twinkle: 13.2,
			delay: -11,
		},
		{
			x: 68,
			y: 92,
			size: 58,
			tint: '255, 236, 200',
			opacity: 0.52,
			twinkle: 6.1,
			delay: -25,
		},
		/*
		 * The near plane. These sit closest to the lens, so they are much larger,
		 * much softer (a nearer defocus spreads the same light over more area, so
		 * the rim all but disappears — see `.near`), dimmer, slower to breathe,
		 * and they travel furthest on the parallax. Two of the three are placed
		 * deliberately off the edge of the frame: foreground bokeh is almost never
		 * politely contained, and a disc that runs off the side is what stops the
		 * field reading as a row of circles.
		 */
		{
			x: -6,
			y: 33,
			size: 520,
			tint: '255, 236, 200',
			opacity: 0.3,
			twinkle: 18.3,
			delay: -6,
			near: true,
		},
		{
			x: 57,
			y: 4,
			size: 430,
			tint: '150, 255, 232',
			opacity: 0.24,
			twinkle: 15.8,
			delay: -31,
			near: true,
		},
		{
			x: 104,
			y: 72,
			size: 470,
			tint: '255, 236, 200',
			opacity: 0.26,
			twinkle: 21.4,
			delay: -47,
			near: true,
		},
	];

	/*
	 * Thinning is a fixed stride, never a random sample: the placement is
	 * hand-tuned, so a subset has to be the same subset on every render (and on
	 * the server as well as the client). The stride keeps the far/near mix
	 * intact — the near plane is at the end of the array and every other index
	 * still lands on two of the three.
	 */
	const discs = $derived.by(() => {
		if (density >= 1) return BOKEH;
		const stride = Math.max(2, Math.round(1 / Math.max(0.01, density)));
		const kept = BOKEH.filter((_, i) => i % stride === 0);
		return kept.some((d) => d.near) ? kept : [...kept, BOKEH.findLast((d) => d.near)!];
	});
</script>

<div
	bind:this={bg_el}
	class="bg"
	aria-hidden="true"
	style:--shift={shift}
	style:mask-image={mask}>
	{#each discs as ball}
		<span
			class="bokeh"
			class:near={ball.near}
			style:--x="{ball.x}%"
			style:--y="{ball.y}%"
			style:--size="{ball.size}px"
			style:--tint={ball.tint}
			style:--opacity={ball.opacity}
			style:--twinkle="{ball.twinkle}s"
			style:--delay="{ball.delay}s">
		</span>
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
		background: radial-gradient(
			circle closest-side,
			rgba(var(--tint), 0.05) 0%,
			rgba(var(--tint), 0.07) 68%,
			rgba(var(--tint), 0.13) 86%,
			rgba(var(--tint), 0.08) 94%,
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
			rgba(var(--tint), 0.035) 0%,
			rgba(var(--tint), 0.045) 62%,
			rgba(var(--tint), 0.062) 82%,
			rgba(var(--tint), 0.03) 93%,
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
	   is still there, just held. */
	@media (prefers-reduced-motion: reduce) {
		.bokeh {
			animation: none;
			/* The effect never updates `--shift` under reduced motion, but pin the
			   translate too so a stale value can't leave the field off-register. */
			translate: none;
		}
	}
</style>
