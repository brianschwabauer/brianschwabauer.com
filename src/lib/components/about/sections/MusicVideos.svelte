<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import DeletedScenes from '../primitives/DeletedScenes.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	/*
	 * Standing waves, drifting.
	 *
	 * The two louder ideas that came before this — forty equaliser bars bouncing
	 * on a loop, then a full oscillogram you scrubbed with the scroll — both read
	 * as a *component* sitting on the section rather than as its background. This
	 * is the quiet version of the same thought: a few sine waves at different
	 * frequencies, sliding past each other at different speeds, which is what
	 * sound actually is and what an oscilloscope shows you when nothing much is
	 * happening.
	 *
	 * Nothing here reacts to the reader, and that is the point — it should be
	 * something you notice second, after the copy.
	 */
	const WAVES = [
		{ amp: 34, freq: 4, phase: 0, y: 130, width: 2, opacity: 0.85, dur: 34, back: false },
		{
			amp: 21,
			freq: 6,
			phase: 1.1,
			y: 196,
			width: 1.5,
			opacity: 0.6,
			dur: 47,
			back: true,
		},
		{
			amp: 46,
			freq: 2,
			phase: 2.4,
			y: 268,
			width: 2.5,
			opacity: 0.5,
			dur: 61,
			back: false,
		},
		{
			amp: 15,
			freq: 8,
			phase: 0.6,
			y: 172,
			width: 1.2,
			opacity: 0.45,
			dur: 26,
			back: true,
		},
	];

	/*
	 * Two sines summed rather than one: a single sine is a textbook diagram, and
	 * adding its second harmonic at a third of the amplitude gives the lopsided,
	 * slightly-peaked shape a real signal has.
	 *
	 * The path spans 2400 units and every `freq` is even, so exactly half of it is
	 * a whole number of cycles — which is what lets the drift translate by half
	 * the path width and loop with no seam.
	 */
	const WIDTH = 2400;
	const path_for = (amp: number, freq: number, phase: number, y: number) => {
		let d = '';
		for (let x = 0; x <= WIDTH; x += 15) {
			const t = (x / WIDTH) * Math.PI * 2 * freq;
			const v = Math.sin(t + phase) * amp + Math.sin(t * 2 + phase * 1.7) * amp * 0.32;
			d += `${x === 0 ? 'M' : 'L'}${x} ${(y + v).toFixed(1)}`;
		}
		return d;
	};
	const flavaImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-music_video_intro.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-caleb_dancing_in_front_of_animated_stage.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-caleb_dances_with_his_bling.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-caleb_dancing_with_3d_moving_platform_animation.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-caleb_clones_dancing_in_street.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-grandpa_spins_and_dances.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-family_dancing_together_in_yard.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-matthew_dancing.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-flash_video_game_screen_recording.avif',
			width: 1080,
			height: 720,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-family_family_dancing_together_in_house.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g-caleb_hits_baseball_visual_effect.avif',
			width: 480,
			height: 320,
		},
	];

	const flashlightImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-26_flashlight-brian_plays_guitar.avif',
			width: 352,
			height: 240,
			caption: 'Flashlight (2007) — Brian plays guitar',
			alt: 'Flashlight (2007) — Brian plays guitar',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-26_flashlight-brian_summons_guitar_reversed_footage_visual_effect.avif',
			width: 352,
			height: 240,
			caption: 'Flashlight — summoning a guitar via reversed footage',
			alt: 'Flashlight — summoning a guitar via reversed footage',
		},
	];

	const calcImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-whole_class_looks_at_camera.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-class_dances_on_green_screen_virtual_set.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-class_dances_with_dance_routine.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-sarah_sings_to_camera.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-teacher_looks_at_camera_with_funny_face.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-class_walks_towards_camera_dramatically.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-kevin_dancing_in_front_of_green_screen.avif',
			width: 480,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy-lavergne_dancing_in_front_of_green_screen.avif',
			width: 480,
			height: 320,
		},
	];

	// One roll for all three songs, in the order the tracks are numbered. Three
	// separate galleries of the same kind of thing, one per song, read as three
	// piles rather than one body of work.
	const trackImages: GalleryItem[] = [...flashlightImages, ...flavaImages, ...calcImages];

	// The inline video posters, in document order: Flashlight, Do Da Flava G,
	// You Derive Me Crazy.
	const sectionExtras: GalleryItem[] = [
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-26_flashlight/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2007-08-26_flashlight/poster.jpg',
			width: 352,
			height: 240,
			caption: 'Flashlight (2007) — music video',
			alt: 'Flashlight (2007) — music video',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Do Da Flava G (2010) — music video',
			alt: 'Do Da Flava G (2010) — music video',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy/poster.jpg',
			width: 720,
			height: 480,
			caption: 'You Derive Me Crazy (2010) — calculus parody music video',
			alt: 'You Derive Me Crazy (2010) — calculus parody music video',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="music-videos" year="2009" label="Music Videos" theme="audio">
	<!--
	  Pinned to the viewport so the waves are behind the whole chapter rather than
	  behind one screenful of it, and drawn at twice the width so each one can
	  slide a full half of itself and land exactly where it started.
	-->
	<div class="waves" aria-hidden="true">
		<svg viewBox="0 0 {WIDTH} 400" preserveAspectRatio="none">
			{#each WAVES as w, i (i)}
				<path
					class:back={w.back}
					d={path_for(w.amp, w.freq, w.phase, w.y)}
					stroke-width={w.width}
					style:opacity={w.opacity}
					style:--dur="{w.dur}s" />
			{/each}
		</svg>
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2009" subtitle="Music Videos" color="#ff7ad0" />
		</Reveal>

		<div class="hero-grid">
			<Reveal>
				<div class="eyebrow">FOLLOWING THE BEAT</div>
				<h2 class="title">
					When you don't
					<br />
					have a script,
					<br />
					<span class="grad">follow the song.</span>
				</h2>
				<p class="lede">
					I was always drawn to music videos. You don't have to invent a plot or
					characters — you just get to mash a bunch of clips against a beat with quick
					cuts and clever transitions. It is the cleanest excuse to do editing exercises
					while pretending you're making art.
				</p>
				<p class="lede">
					Our first attempts were honestly just "stand in front of a tripod and lip-sync".
					By 2010 we'd graduated to writing the songs ourselves, recording in our own
					awful little home studio, and building a music video concept around the lyrics.
					The audio-mixing skills we built here later carried into the sound design of
					every short film.
				</p>
			</Reveal>

			<Reveal variant="right" delay={120}>
				<div class="vinyl">
					<div class="vinyl-disc">
						<div class="vinyl-label">DDFG · 2010</div>
						<div class="grooves"></div>
					</div>
					<div class="vinyl-arm"></div>
				</div>
			</Reveal>
		</div>

		<!-- The three songs themselves. The stills roll below is always
		     there, so a reader who never opens this still gets the photos. -->
		<DeletedScenes scenes={3}>
			<div class="track">
				<span class="track-num" aria-hidden="true">01</span>
				<Reveal>
					<div class="track-copy">
						<h3 class="sub">
							Flashlight <span class="dot">·</span>
							2007
						</h3>
						<p>
							Our first original song, written and recorded with Kevin. A guy goes slowly
							insane searching for a flashlight he can't find. The music video has way
							more shots, way more quick cuts, and starts to actually feel like a music
							video.
						</p>
					</div>
				</Reveal>
				<Reveal variant="right" delay={160}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2007-08-26_flashlight/poster.jpg"
						alt="Flashlight (2007) — music video"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
				</Reveal>
			</div>

			<div class="track">
				<span class="track-num" aria-hidden="true">02</span>
				<Reveal>
					<div class="track-copy">
						<h3 class="sub">
							Do Da Flava G <span class="dot">·</span>
							2010
						</h3>
						<p>
							We wrote a rap song for a friend, made him "into a rapper", filmed my whole
							family doing a goofy family dance to it — grandparents included — and shot
							the music video. It placed in a local film festival. I think second.
						</p>
						<p>
							I also built a whole Flash website for the fake artist. There was a game on
							the site: press a number on the keyboard and the animated Flava G character
							would do that dance. We wrote four songs for him. We only ever shot a music
							video for one.
						</p>
					</div>
				</Reveal>
				<Reveal variant="right" delay={160}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g/poster.jpg"
						alt="Do Da Flava G (2010) — music video"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(1, e.currentTarget)} />
				</Reveal>
			</div>

			<div class="track">
				<span class="track-num" aria-hidden="true">03</span>
				<Reveal>
					<div class="track-copy">
						<h3 class="sub">
							You Derive Me Crazy <span class="dot">·</span>
							2010
						</h3>
						<p>
							AP Calculus had just wrapped, so my teacher let us be creative. We wrote a
							parody — set to Britney Spears' "You Drive Me Crazy" — with lyrics full of
							calc puns. Shot it in class, used greenscreen to put the whole class into
							virtual sets, and turned in the most absurd math project the school had ever
							seen.
						</p>
					</div>
				</Reveal>
				<Reveal variant="right" delay={160}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy/poster.jpg"
						alt="You Derive Me Crazy (2010) — calculus parody music video"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(2, e.currentTarget)} />
				</Reveal>
			</div>
		</DeletedScenes>

		<Reveal variant="up" delay={120}>
			<div class="roll-eyebrow bleed-head">
				ALL THREE SHOOTS · {trackImages.length} STILLS
			</div>
			<div class="gallery-bleed">
				<PeekGallery key="music-videos-stills" items={trackImages} peek={8} size="2" />
			</div>
		</Reveal>

		<Reveal>
			<div class="closing">
				<p>
					We were not good musicians. The recordings live somewhere on a hard drive
					between "endearing" and "unlistenable", depending on the track. But the music
					videos taught me <em>so much</em>
					about editing to tempo, about how a cut can land on a beat, about how a small change
					in audio can completely change what a viewer feels in a shot. I cut every short film
					I make differently because of those years.
				</p>
			</div>
		</Reveal>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="music-videos"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	:global([data-theme='audio']) {
		background:
			radial-gradient(ellipse at 80% 0%, rgba(255, 122, 208, 0.12), transparent 50%),
			radial-gradient(ellipse at 0% 100%, rgba(0, 200, 255, 0.1), transparent 50%),
			linear-gradient(180deg, #0c0316, #16071f 50%, #08041a);
		color: #ffe9f6;
	}
	.waves {
		position: sticky;
		top: 0;
		height: 100svh;
		/* Back out of flow — the copy sits over the waves, not a screen below. */
		margin-bottom: -100svh;
		pointer-events: none;
		display: grid;
		align-content: center;
		overflow: clip;
		opacity: 0.3;
		/* No start and no finish — a slice out of something already playing. */
		mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
	}
	.waves svg {
		/* Twice the viewport, so half of it is always off to the right waiting to
		   slide in and the loop never shows an end. */
		width: 200%;
		height: clamp(180px, 30vh, 340px);
		overflow: visible;
	}
	.waves path {
		fill: none;
		stroke: #ff7ad0;
		stroke-linecap: round;
		animation: drift var(--dur) linear infinite;
	}
	/* Half the waves run the other way. Two lines crossing at different speeds is
	   the whole illusion — all of them sliding together is a moving image. */
	.waves .back {
		stroke: #4fd8ff;
		animation-name: drift-back;
	}
	@keyframes drift {
		to {
			/* Exactly half the path, which is a whole number of cycles, so the wave
			   arrives back on top of itself. */
			translate: -50% 0;
		}
	}
	@keyframes drift-back {
		from {
			translate: -50% 0;
		}
		to {
			translate: 0 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.waves path {
			animation: none;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.hero-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
		margin-bottom: 5rem;
	}
	@media (max-width: 768px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff7ad0;
		margin-bottom: 1rem;
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.grad {
		color: oklch(from #ffb84d 0.82 calc(c * 0.9) h);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 38rem;
	}

	.vinyl {
		position: relative;
		aspect-ratio: 1;
		max-width: 420px;
		margin: 0 auto;
	}
	.vinyl-disc {
		position: absolute;
		inset: 5%;
		border-radius: 50%;
		background:
			repeating-radial-gradient(circle at center, #181818 0 1px, #0a0a0a 1px 3px), #0a0a0a;
		box-shadow:
			0 30px 80px rgba(255, 122, 208, 0.25),
			0 6px 20px rgba(0, 0, 0, 0.6),
			inset 0 0 30px rgba(0, 0, 0, 0.8);
		animation: spin 12s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.vinyl-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 38%;
		height: 38%;
		border-radius: 50%;
		background: radial-gradient(circle, #ff7ad0 0%, #ff4090 70%, #d02b78 100%);
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		color: #fff;
	}
	.vinyl-label::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		background: #000;
		border-radius: 50%;
	}
	.vinyl-arm {
		position: absolute;
		top: 0;
		right: -10%;
		width: 60%;
		height: 8px;
		background: linear-gradient(180deg, #444, #222);
		border-radius: 4px;
		transform-origin: right center;
		transform: rotate(35deg);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
	}
	@media (prefers-reduced-motion: reduce) {
		.vinyl-disc {
			animation: none;
		}
	}

	/* Numeral, copy, film — the numeral in its own column so 01 → 02 → 03 line
	   up down the page, and the film beside the copy rather than under it. */
	.track {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) minmax(0, 1.1fr);
		align-items: start;
		column-gap: clamp(1rem, 3vw, 2.5rem);
		margin: 4.5rem 0;
	}
	/* The numeral pins itself under the header while its track scrolls by, so
	   you always know which song you're reading. It has to be a direct child of
	   the track — inside a Reveal it would only have the Reveal's own height to
	   travel through. */
	.track-num {
		position: sticky;
		top: calc(80px + 1.5rem);
		font-family: var(--font-mono);
		font-size: clamp(2.6rem, 5vw, 4rem);
		font-weight: 900;
		color: transparent;
		-webkit-text-stroke: 2px #ff7ad0;
		letter-spacing: -0.02em;
		line-height: 1;
	}
	.track-copy {
		line-height: 1.65;
	}
	.track-copy p {
		margin-bottom: 1rem;
	}
	.track-copy p:last-child {
		margin-bottom: 0;
	}
	@media (max-width: 900px) {
		.track {
			grid-template-columns: auto minmax(0, 1fr);
			row-gap: 1.5rem;
		}
		.track > :global(.reveal:last-child) {
			grid-column: 2;
		}
	}
	.sub {
		font-size: clamp(1.5rem, 2.8vw, 2.2rem);
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.dot {
		color: #ff7ad0;
	}
	.roll-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff7ad0;
		margin: 0 0 0.7rem;
	}
	/* Closes the section in the same voice it opened in: the lede's type and
	   the section's own ink, held to a reading measure. */
	.closing {
		max-width: 44rem;
		margin-inline: auto;
	}
	.closing p {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.closing em {
		color: #ff7ad0;
		font-style: italic;
	}
</style>
