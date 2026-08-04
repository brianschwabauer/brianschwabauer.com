<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import DriftStrip from '../primitives/DriftStrip.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';
	import BokehField from '../primitives/BokehField.svelte';

	const spunkstersImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_01.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_02.avif',
			width: 1365,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_03.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_04.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_05.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_06.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_07.avif',
			width: 1536,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-live_show_behind_the_scenes_photos_08.jpg',
			width: 720,
			height: 960,
		},
	];

	const messages = [
		{ from: '+1 (913) ••• 4451', text: 'this is HILARIOUS' },
		{ from: '+1 (816) ••• 8210', text: 'Why is Zordon a dog' },
		{ from: '+1 (913) ••• 2199', text: 'cried laughing at the PR3 trailer' },
		{ from: '+1 (785) ••• 0772', text: 'I love this so much' },
		{ from: '+1 (816) ••• 5621', text: 'Brian and Kevin forever ❤️' },
		{ from: '+1 (913) ••• 9088', text: 'Oscars who?' },
	];

	// Standalone images + inline video posters combined into one lightbox-only Gallery.
	// Order matches document order:
	//   0: Spunksters logo image
	//   1: The Spunksters awards show video
	//   2: Kevin (Bubbly Bros) image
	//   3: Bubbly Bros video
	//   4: Power Rangers III logo image
	//   5: Kevin visits Zordon's grave image
	//   6: Power Rangers III trailer video
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-logo_animation.avif',
			width: 480,
			height: 270,
			alt: 'The Spunksters logo animation',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'The Spunksters (2013) — the live awards show',
			alt: 'The Spunksters (2013) — the live awards show',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros-kevin_jumps_up_and_down.avif',
			width: 480,
			height: 270,
			alt: 'Kevin from Bubbly Bros',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Bubbly Bros (2013) — photo music video',
			alt: 'Bubbly Bros (2013) — photo music video',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-logo_animation.avif',
			width: 480,
			height: 270,
			alt: 'Power Rangers III logo animation',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-kevin_visits_zordons_grave.avif',
			width: 480,
			height: 270,
			alt: "Kevin visits Zordon's grave",
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Power Rangers 360 III — fake trailer (2013)',
			alt: 'Power Rangers 360 III — fake trailer (2013)',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
	let btsGallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="spunksters" year="2013" label="The Spunksters" theme="spunksters">
	<!--
	  The same lens the Show&Tour sections use, running gold instead of teal —
	  which is what the show's own logo does: a trophy with the room thrown out of
	  focus behind it. The flashes are the thing that makes it an awards show
	  rather than a warm background.
	-->
	<BokehField
		tints={['255, 199, 46', '255, 132, 18']}
		flashes
		mask="linear-gradient(90deg, #000, rgba(0, 0, 0, 0.28) 26%, rgba(0, 0, 0, 0.28) 74%, #000)" />

	<div class="container">
		<Reveal>
			<YearMark year="2013" subtitle="End of an era" color="#ffd934" treatment="foil" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<h2 class="title">
					<span class="grow w1">Hunky</span>
					<span class="grow w2">Spunky's</span>
					<span class="grow w3">Oscars.</span>
				</h2>
				<p class="lede">
					By 2013, Kevin and I were two years into college in two different states — him
					at Baylor, me at Missouri State. Hunky Spunky Productions, the version with our
					childhood in it, was over, and we both knew it. We were never going to make
					films together again. That deserved more than a quiet fade-out.
				</p>
				<p class="lede">
					So we came home that summer and sent it off the only way we knew how:
					<strong>The Spunksters</strong>
					— an awards show, modeled after the Oscars, for ourselves and our films. Awards in
					every category. Speeches. Live-streamed. Projected on the side of my childhood house
					— the same backyard where the Power Rangers premieres had played. Forty friends watching
					a live video feed of Kevin hosting from inside, so the host appeared on a twenty-foot
					tall projection like a giant.
				</p>
				<PlayFilm
					label="Play the show"
					title="The Spunksters (2013) — the live awards show"
					meta="2013 · live"
					color="#ffd934"
					onclick={(e) => gallery?.open(1, e.currentTarget)} />
			</Reveal>
		</div>

		<div class="logo-stage">
			<!--
			  The beams are anchored to the top corners of the logo card, not to the
			  section. Floating in the middle of the background they had no source —
			  a searchlight is only a searchlight if you can see the thing it is
			  standing on, and the trophy card is the thing. They sweep up and out
			  from behind it, which is also the only direction two lights either
			  side of a marquee could sweep.
			-->
			<div class="lights" aria-hidden="true">
				<span class="beam left"></span>
				<span class="beam right"></span>
			</div>
			<Reveal variant="up">
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-06-22_the_spunksters-logo_animation.avif"
					alt="The Spunksters logo animation"
					ratio="16 / 9"
					onclick={(e) => gallery?.open(0, e.currentTarget)} />
			</Reveal>
		</div>

		<div class="sms-block">
			<Reveal>
				<div class="sms-grid">
					<div class="sms-text">
						<div class="sms-eyebrow">A SMALL, RIDICULOUS THING I'M PROUD OF</div>
						<h3 class="sub">
							An SMS feature, hacked together because Google Voice doesn't have an API.
						</h3>
						<p>
							I wanted viewers to be able to text in their reactions and have them appear
							on the projected wall. Google Voice didn't (and doesn't) expose an API. But
							it can forward incoming texts to email. So: text → Google Voice → email → my
							little polling script → OBS overlay. Untested until the moment it had to
							work. It worked.
						</p>
						<p class="aside">
							I deeply believe in this: live life all the way through, even the parts that
							don't matter. Backyard awards shows are nothing. It's so much more fun to
							take them seriously than to phone them in.
						</p>
					</div>
					<div class="phone">
						<div class="phone-frame">
							<div class="phone-bar">9:41 PM · The Spunksters · live</div>
							<ul class="phone-msgs">
								{#each messages as msg, i}
									<li style:--i={i}>
										<div class="from">{msg.from}</div>
										<div class="bubble">{msg.text}</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="bts">
				<div class="bts-eyebrow bleed-head">
					BEHIND THE SCENES · {spunkstersImages.length} PHOTOS
				</div>
				<DriftStrip
					items={spunkstersImages}
					speed={90}
					onitemclick={({ index, element }) => btsGallery?.open(index, element)} />
			</div>
		</Reveal>
		<LightboxGallery
			bind:this={btsGallery}
			key="spunksters-photos"
			items={spunkstersImages} />

		<div class="bubbly-bros">
			<Reveal variant="left">
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-06-22_bubbly_bros-kevin_jumps_up_and_down.avif"
					alt="Kevin from Bubbly Bros"
					ratio="4 / 3"
					onclick={(e) => gallery?.open(2, e.currentTarget)} />
			</Reveal>
			<Reveal>
				<h3 class="sub">Bubbly Bros — the unofficial encore</h3>
				<p>
					For the show, Kevin and I wrote a song called "Bubbly Bros". A rap song about
					two guys who love blowing bubbles. It sounds like a constant innuendo. It is
					not. We're really just rapping about bubbles.
				</p>
				<p>
					We ran out of time to shoot a real music video, so we did a photo shoot, set it
					to the song, and called it done. It got cheers from a backyard. It belongs
					there.
				</p>
				<PlayFilm
					label="Play the video"
					title="Bubbly Bros (2013) — photo music video"
					meta="2013"
					color="#ffd934"
					onclick={(e) => gallery?.open(3, e.currentTarget)} />
			</Reveal>
		</div>

		<div class="prtrailer">
			<Reveal variant="left">
				<h3 class="sub">A fake Power Rangers III trailer</h3>
				<p>
					For The Spunksters we also cut a fake trailer for a "Power Rangers III". An
					adult Kevin — the blue ranger from our childhood movies — has not let his glory
					days go. The other rangers have grown up. They have kids. They have jobs. Kevin
					doesn't. The trailer ends with a gag where the words "in 3D" break the letterbox
					bars. It still kills me.
				</p>
				<PlayFilm
					label="Play the trailer"
					title="Power Rangers 360 III — fake trailer (2013)"
					meta="2013 · in 3D"
					color="#ffd934"
					onclick={(e) => gallery?.open(6, e.currentTarget)} />
			</Reveal>
			<!--
			  One image, not two. The logo card is the title; the grave shot is a
			  punchline that only lands after it, and side by side they argued for
			  the same attention. It's still one click away — the lightbox opens on
			  the logo with the rest of the section's stills behind it.
			-->
			<Reveal variant="right" delay={100}>
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-06-22_power_rangers_iii_trailer-logo_animation.avif"
					alt="Power Rangers III logo animation"
					ratio="16 / 9"
					onclick={(e) => gallery?.open(4, e.currentTarget)} />
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="endcap">
				<div class="endcap-line"></div>
				<div class="endcap-text">
					<span>END OF THE HUNKY SPUNKY CHAPTER</span>
					<strong>We never made another film together. That was the point.</strong>
				</div>
				<div class="endcap-line"></div>
			</div>
		</Reveal>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="spunksters"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	/*
	 * A lit room, not a dark one. The previous stops were effectively black with
	 * a 6%-opacity gold wash over the top, which gave the gold bokeh nothing to
	 * be *in* — the discs were the only colour on screen, so they read as
	 * decoration rather than as light. Taking the base up into a real amber puts
	 * the whole section under the same stage lighting the trophy is under.
	 */
	:global([data-theme='spunksters']) {
		background:
			radial-gradient(
				ellipse 120% 75% at 50% 0%,
				oklch(0.46 0.12 80 / 0.5),
				transparent 62%
			),
			radial-gradient(
				ellipse 90% 60% at 18% 100%,
				oklch(0.36 0.1 48 / 0.45),
				transparent 66%
			),
			linear-gradient(
				180deg,
				oklch(0.23 0.058 74),
				oklch(0.29 0.078 68) 48%,
				oklch(0.17 0.05 62)
			);
		color: #fff5d6;
	}
	/*
	 * Searchlights. Anchored to the bottom of the first screenful and swinging
	 * from there, so the beams read as standing in the parking lot pointed at the
	 * sky rather than as two diagonal stripes laid over the section.
	 *
	 * The two never share a period and neither period is a round number, so they
	 * cross at a different point every pass instead of settling into a rhythm —
	 * a pair of lights in step looks mechanised, and this was forty friends in a
	 * backyard.
	 */
	/*
	 * The lamps sit at the card's top corners and throw upward, so the box is
	 * pinned to the card's top edge and everything inside it grows out of the
	 * two corners. No `overflow: hidden` — the whole point is that the beams
	 * leave the card and carry on up the page.
	 */
	.lights {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 0;
		pointer-events: none;
	}
	.beam {
		position: absolute;
		/* Origin at the corner itself; the beam extends up and away from it. */
		bottom: 0;
		width: 170px;
		/* Tall enough to clear the "2013" sitting above the card and carry on past
		   it. The lamps are on the ground pointing at the sky; a beam that stops
		   partway up the page reads as a shape rather than as light going
		   somewhere. */
		height: 132vh;
		transform-origin: 50% 100%;
		/* Brightest at the source and thinning as it climbs — a beam is only
		   visible in the haze it is passing through, and there is less of that the
		   higher it gets. It now survives well past the year rather than being
		   gone before it. */
		background: linear-gradient(
			0deg,
			rgba(255, 214, 120, 0.17),
			rgba(255, 205, 100, 0.08) 45%,
			rgba(255, 200, 90, 0.03) 74%,
			transparent 94%
		);
		/* Narrow at the lamp, wide at the top — the spread is what makes it a
		   beam and not a bar. */
		clip-path: polygon(44% 100%, 56% 100%, 100% 0%, 0% 0%);
		filter: blur(26px);
	}
	/* Centred on each corner — half the beam's width outside the card, half
	   inside, so the source is the corner rather than a point near it. */
	.beam.left {
		left: -85px;
		animation: sweep-left 19s ease-in-out infinite alternate;
	}
	.beam.right {
		right: -85px;
		animation: sweep-right 23.5s ease-in-out infinite alternate;
	}
	/* Both sweep outward from the card and never cross back over it: lights
	   mounted either side of a marquee point away from the marquee. */
	@keyframes sweep-left {
		from {
			rotate: -34deg;
		}
		to {
			rotate: -6deg;
		}
	}
	@keyframes sweep-right {
		from {
			rotate: 29deg;
		}
		to {
			rotate: 4deg;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.beam {
			animation: none;
		}
		.beam.left {
			rotate: -22deg;
		}
		.beam.right {
			rotate: 17deg;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		/* Above the bokeh and the beams. */
		position: relative;
		z-index: 1;
	}
	.lockup {
		text-align: center;
		margin-bottom: 3rem;
	}
	.title {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		font-size: clamp(2.4rem, 8vw, 6rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		/* Less the descender room added to `.grow`, so the words sit where they
		   always did relative to the copy below. */
		margin: 0 0 calc(1.4rem - 0.15em);
		flex-wrap: wrap;
	}
	.grow {
		background: linear-gradient(180deg, #ffe57a 0%, #ffd934 50%, #c79900 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 60px rgba(255, 217, 52, 0.15);
		/*
		 * A clipped background paints nothing outside the element's box, and
		 * Merriweather's descender drops ~12px below a 96px box at line-height 1
		 * — so the y in "Hunky" and the p in "Spunky's" were being rendered with
		 * no gradient behind them, which on transparent text means not rendered
		 * at all. Extend the paint area past the baseline; the title's own bottom
		 * margin gives the space back so the gap to the copy doesn't grow.
		 */
		padding-bottom: 0.15em;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 48rem;
		margin: 0 auto 1rem;
	}
	.lede strong {
		color: #ffd934;
	}

	.logo-stage {
		max-width: 800px;
		margin: 3rem auto 4rem;
		/* Anchors the beams to this card's corners. */
		position: relative;
	}
	/* The card itself sits over its own lamps. */
	.logo-stage > :global(.reveal) {
		position: relative;
		z-index: 1;
	}

	.sms-block {
		margin: 4rem 0;
	}
	.sms-grid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.sms-grid {
			grid-template-columns: 1fr;
		}
	}
	.sms-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 0.6rem;
	}
	.sub {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
		line-height: 1.2;
	}
	.sms-text p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}
	/* The creed of the chapter gets engraved: serif italic on a dark plaque
	   with a thin gold frame and inner bevel, same metal as the trophies. */
	.aside {
		padding: 1.2rem 1.4rem;
		font-family: var(--font-serif);
		font-style: italic;
		color: oklch(from #ffd934 0.9 calc(c * 0.3) h);
		background: linear-gradient(160deg, #241d0d, #2e2612 55%, #1f190b);
		border: 1px solid oklch(from #ffd934 0.62 calc(c * 0.7) h / 0.55);
		border-radius: 3px;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.09),
			inset 0 0 0 3px rgba(0, 0, 0, 0.35),
			inset 0 0 0 4px oklch(from #ffd934 0.5 calc(c * 0.5) h / 0.35);
	}

	.phone {
		display: flex;
		justify-content: center;
	}
	.phone-frame {
		width: 280px;
		background: #111;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 28px;
		padding: 1.4rem 1rem 1.2rem;
		box-shadow:
			0 30px 80px rgba(0, 0, 0, 0.6),
			0 6px 20px rgba(255, 217, 52, 0.15);
	}
	.phone-bar {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-align: center;
		opacity: 0.6;
		margin-bottom: 0.8rem;
	}
	.phone-msgs {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.phone-msgs li {
		opacity: 0;
		transform: translateY(20px);
		animation: msgIn 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
		animation-delay: calc(var(--i) * 0.6s);
	}
	@keyframes msgIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.from {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		opacity: 0.5;
		margin-bottom: 0.15rem;
	}
	.bubble {
		background: linear-gradient(135deg, #ffd934, #ffaa00);
		color: #1a1100;
		padding: 0.5rem 0.8rem;
		border-radius: 16px 16px 16px 4px;
		font-size: 0.85rem;
		font-weight: 500;
		display: inline-block;
		max-width: 90%;
	}

	.bts {
		margin: 4rem 0;
	}
	.bts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 1rem;
	}

	.bubbly-bros {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 4rem 0;
		padding: 2rem;
		background: rgba(255, 217, 52, 0.04);
		border-radius: 14px;
	}
	@media (max-width: 768px) {
		.bubbly-bros {
			grid-template-columns: 1fr;
		}
	}
	.bubbly-bros p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}

	/* Copy left, one image right — the mirror of the Bubbly Bros block above it,
	   so the two encores alternate sides instead of stacking the same way twice. */
	.prtrailer {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 4rem 0;
	}
	@media (max-width: 768px) {
		.prtrailer {
			grid-template-columns: 1fr;
		}
	}
	.prtrailer p {
		max-width: 40rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.endcap {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin: 5rem 0 0;
		opacity: 0.85;
	}
	.endcap-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, #ffd934, transparent);
	}
	.endcap-text {
		text-align: center;
		font-family: var(--font-mono);
	}
	.endcap-text span {
		font-size: 0.75rem;
		letter-spacing: 0.32em;
		opacity: 0.7;
	}
	.endcap-text strong {
		display: block;
		font-size: 1rem;
		color: #ffd934;
		margin-top: 0.3rem;
	}
</style>
