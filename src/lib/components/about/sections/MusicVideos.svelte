<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import DeletedScenes from '../primitives/DeletedScenes.svelte';
	import Turntable, { type Track } from '../primitives/Turntable.svelte';
	import { Gallery, Video, type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	// The record's three bands, outermost first — the order a record actually
	// plays in, which is also the order the tracks are numbered below.
	const TRACKS: Track[] = [
		{ num: '01', title: 'Flashlight', year: '2007', target: 'track-flashlight' },
		{ num: '02', title: 'Do Da Flava G', year: '2010', target: 'track-flava' },
		{ num: '03', title: 'You Derive Me Crazy', year: '2010', target: 'track-calc' },
	];

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

	// The stills grid lives inside a `DeletedScenes` fold, which unmounts its
	// children — so the deep-linkable `LightboxGallery` stays mounted out here,
	// headless, and the folded grid is a plain `Gallery` that opens it. (A
	// LightboxGallery inside a fold loses its `?media=` links.)
	let stills = $state<ReturnType<typeof LightboxGallery>>();

	function onStillClick(event: MouseEvent | KeyboardEvent, index: number) {
		const tile = (event.target as HTMLElement | null)?.closest?.('.gallery-item');
		stills?.open(index, (tile as HTMLElement) ?? undefined);
		return false as const;
	}
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
			<YearMark year="2009" subtitle="Music Videos" color="#ff66cc" />
		</Reveal>

		<div class="hero-grid">
			<Reveal>
				<h2 class="title">
					When you don't
					<br />
					have a script,
					<br />
					<span class="grad">follow the song.</span>
				</h2>
				<p class="lede">
					The websites didn't replace the films — the two threads just started running in
					parallel. And on the film side, I was always drawn to music videos. You don't
					have to invent a plot or characters — you just get to mash a bunch of clips
					against a beat with quick cuts and clever transitions. We were not good
					musicians; the recordings live somewhere between "endearing" and "unlistenable",
					depending on the track. But they taught me <em>so much</em>
					about editing to tempo, about how a cut can land on a beat, about how a small change
					in audio completely changes what a viewer feels in a shot. I still cut everything
					differently because of those years.
				</p>
				<p class="lede">
					Our first attempts were honestly just "stand in front of a tripod and lip-sync".
					Eventually we graduated to writing the songs ourselves, recording in our own
					awful little home studio, and building a music video concept around the lyrics.
					The audio-mixing skills we built here later carried into the sound design of
					every short film.
				</p>
			</Reveal>

			<Reveal variant="right" delay={120}>
				<Turntable tracks={TRACKS} color="#ff66cc" />
			</Reveal>
		</div>

		<!-- The three songs themselves, each with its film playing where it sits:
		     the section is three tracks, so the tracks are the section. -->
		<div class="tracks">
			<div class="track" id="track-flashlight">
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
					<div class="film">
						<Video
							src="https://cdn.brianschwabauer.com/media/2007-08-26_flashlight/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2007-08-26_flashlight/poster.jpg"
							title="Flashlight (2007)"
							aspect_ratio="352/240"
							preload="none" />
					</div>
				</Reveal>
			</div>

			<div class="track" id="track-flava">
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
					<div class="film">
						<Video
							src="https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2010-03-25_do_da_flava_g/poster.jpg"
							title="Do Da Flava G (2010)"
							aspect_ratio="3/2"
							preload="none" />
					</div>
				</Reveal>
			</div>

			<div class="track" id="track-calc">
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
					<div class="film">
						<Video
							src="https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2010-08-10_you_derive_me_crazy/poster.jpg"
							title="You Derive Me Crazy (2010)"
							aspect_ratio="3/2"
							preload="none" />
					</div>
				</Reveal>
			</div>
		</div>

		<!-- The stills are the extra footage now that the films play in place, so
		     they're what the strip hides. -->
		<div class="stills-fold">
			<DeletedScenes scenes={trackImages.length}>
				<div class="roll-eyebrow bleed-head">
					ALL THREE SHOOTS · {trackImages.length} STILLS
				</div>
				<div class="gallery-bleed">
					<Gallery
						items={trackImages}
						display="masonry"
						size="2"
						disable_fullscreen
						onclick={onStillClick} />
				</div>
			</DeletedScenes>
		</div>
	</div>

	<LightboxGallery bind:this={stills} key="music-videos-stills" items={trackImages} />
</SectionShell>

<style>
	:global([data-theme='audio']) {
		background:
			radial-gradient(ellipse at 80% 0%, rgba(255, 102, 204, 0.12), transparent 50%),
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
		stroke: #ff66cc;
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
	.lede em {
		color: #ff66cc;
		font-style: italic;
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
		-webkit-text-stroke: 2px #ff66cc;
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
		color: #ff66cc;
	}
	/* The player carries the same corners and lift the poster tiles used to, so
	   swapping a still for a real film changed the behaviour and not the look. */
	.film {
		border-radius: 12px;
		overflow: clip;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.35),
			0 2px 6px rgba(0, 0, 0, 0.25);
	}
	/* The strip is a full-width rule; give it room off the last track and off
	   whatever section follows. */
	.stills-fold {
		margin-top: 4rem;
	}
	.roll-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff66cc;
		margin: 1.5rem 0 0.7rem;
	}
</style>
