<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const currentYear = new Date().getFullYear();

	const heroShot: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif',
			width: 1890,
			height: 975,
			caption: 'Show&Tour · project detail page',
			alt: 'Show&Tour project detail page',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();

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
	 * Out-of-focus highlights behind the section — what a fast lens does to
	 * points of light it isn't focused on. Show&Tour is built for photographers,
	 * so the background is a photograph's defect rather than a diagram's grid.
	 *
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
</script>

<SectionShell
	id="what-im-up-to"
	year={String(currentYear)}
	label="Which brings us to now"
	theme="snt">
	<div bind:this={bg_el} class="bg" aria-hidden="true" style:--shift={shift}>
		{#each BOKEH as ball}
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
	<div class="container">
		<div class="grid">
			<div class="copy">
				<Reveal variant="up">
					<!-- Closes the cassette metaphor Rewind opened, twenty years back. -->
					<p class="playback">&#9205; Playback complete — you're all caught up.</p>
				</Reveal>

				<Reveal variant="up" delay={60}>
					<h2 class="title">
						Which brings us <span class="grad">to now</span>
					</h2>
				</Reveal>

				<Reveal variant="up" delay={140}>
					<div class="lockup">
						<div class="snt-mark" aria-hidden="true">
							<img
								src="https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-logo-icon_flash.svg"
								alt="Show&Tour Logo" />
						</div>
						<div>
							<div class="brand">Show&amp;Tour</div>
							<div class="tagline">The best way to deliver real estate media.</div>
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={220}>
					<p class="lede">
						Twenty years of tapes, timelines, and terminals later — this is what all of it
						was pointed at. I'm full-time building <a
							href="https://showandtour.com"
							target="_blank"
							rel="noopener">
							Show&amp;Tour
						</a>
						: a project-delivery platform for real estate photographers. Beautiful property
						websites, branded delivery pages, smart invoicing — the whole workflow built around
						how photographers actually work. Thousands of users and counting.
					</p>
				</Reveal>

				<Reveal variant="up" delay={300}>
					<div class="ctas">
						<a
							class="cta-primary"
							href="https://showandtour.com"
							target="_blank"
							rel="noopener">
							Visit showandtour.com
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M5 12h14M13 6l6 6-6 6"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
						</a>
						<a class="cta-ghost" href="#creed">
							Why I build this way
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M12 4v16M6 14l6 6 6-6"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round" />
							</svg>
						</a>
					</div>
				</Reveal>
			</div>

			<Reveal variant="left" delay={200}>
				<div class="shot">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif"
						alt="Show&Tour project detail page"
						ratio="16 / 10"
						rounded={false}
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
					<div class="shot-glow" aria-hidden="true"></div>
				</div>
			</Reveal>
		</div>
	</div>

	<LightboxGallery bind:this={gallery} key="what-im-up-to" items={heroShot} />
</SectionShell>

<style>
	/* The teal and violet corner glows that used to sit here are gone with the
	   grid — the depth now comes from the bokeh, which is a real photographic
	   effect rather than a light source with nothing making it. */
	:global([data-theme='snt']) {
		background: linear-gradient(180deg, #050a0c, #08161a 60%, #050a10);
		color: #e8faf6;
	}
	.bg {
		position: absolute;
		inset: 0;
		overflow: clip;
		pointer-events: none;
		/* Densest at the edges, clear behind the copy — the same thing a
		   photographer does by putting the subject in the plane of focus. */
		mask-image: radial-gradient(ellipse 70% 62% at 42% 50%, transparent, #000 88%);
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
	/*
	 * Parallax, while scrolling. The discs sit at different distances, so they
	 * cross the frame at different rates — the big ones are nearest and travel
	 * furthest, which is what makes the field feel like depth rather than a
	 * pattern painted on the section. Scroll-driven animation is progressive
	 * enhancement: where it isn't supported the bokeh simply holds still and
	 * twinkles, which was the previous behaviour anyway.
	 *
	 * `translate` is left alone by both, because the parallax owns it — the three
	 * effects sit on three separate properties, so they compose instead of the
	 * last one winning outright.
	 */
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
	   is still there, just held. Must stay after the @supports block above so it
	   wins on order. */
	@media (prefers-reduced-motion: reduce) {
		.bokeh {
			animation: none;
			/* The effect never updates `--shift` under reduced motion, but pin the
			   translate too so a stale value can't leave the field off-register. */
			translate: none;
		}
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.95rem;
		background: rgba(0, 242, 195, 0.08);
		border: 1px solid rgba(0, 242, 195, 0.25);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #00f2c3;
		margin-bottom: 1.4rem;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #00f2c3;
		box-shadow: 0 0 12px #00f2c3;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.55;
			transform: scale(1.3);
		}
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
	}
	@media (min-width: 960px) {
		.grid {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
			gap: clamp(2.5rem, 5vw, 4.5rem);
		}
	}

	.playback {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 1.1rem;
	}
	.title {
		font-size: clamp(2.8rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1.6rem;
	}
	.grad {
		color: oklch(from #00f2c3 0.84 calc(c * 0.86) h);
	}

	.lockup {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.4rem;
	}
	.snt-mark {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 16px;
		flex-shrink: 0;
		padding: 4px;
	}
	.brand {
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1;
		margin-bottom: 0.25rem;
	}
	.tagline {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: #00f2c3;
	}

	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 36rem;
		color: rgba(255, 255, 255, 0.82);
		margin: 0 0 1.6rem;
	}
	.lede a {
		color: #00f2c3;
		text-decoration: underline;
		text-decoration-color: rgba(0, 242, 195, 0.4);
		text-underline-offset: 4px;
	}
	.lede a:hover {
		transition-duration: 0s;
		color: #fff;
	}

	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.85rem 1.35rem;
		background: #00e0b6;
		color: #052028;
		font-weight: 800;
		border-radius: 999px;
		text-decoration: none;
		transition:
			transform 200ms ease,
			box-shadow 200ms ease;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
	}
	.cta-primary:hover {
		transition-duration: 0s;
		transform: translateY(-2px);
		box-shadow: 0 14px 40px rgba(0, 242, 195, 0.45);
	}
	.cta-primary svg {
		width: 16px;
		height: 16px;
	}

	.cta-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.85rem 1.35rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: #fff;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 600;
		transition:
			background 200ms ease,
			border-color 200ms ease,
			transform 200ms ease;
	}
	.cta-ghost:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(0, 242, 195, 0.45);
		transform: translateY(-2px);
	}
	.cta-ghost svg {
		width: 16px;
		height: 16px;
	}

	.shot {
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid rgba(0, 242, 195, 0.18);
		box-shadow:
			0 40px 90px rgba(0, 0, 0, 0.55),
			0 6px 20px rgba(0, 242, 195, 0.15);
	}
	.shot-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at top center,
			rgba(0, 242, 195, 0.18),
			transparent 60%
		);
		pointer-events: none;
	}
</style>
