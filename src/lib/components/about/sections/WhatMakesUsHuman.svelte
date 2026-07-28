<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const filmImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-dramatic_dolly_shot_in_library.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-drone_show_of_telescan_building_visual_effect.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-eye_recording_light_visual_effect.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-main_character_stuck_in_high_tech_jail_cell_visual_effect.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-main_character_uses_futuristic_computer_hologram_ui_visual_effect.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-transparent_tablet_ui_animation_visual_effect.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-transparent_tablet_ui_animation_visual_effect_2.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-villian_lectures_protagonist_in_high_tech_jail_cell.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-logo_animation.avif',
			width: 480,
			height: 204,
		},
	];

	const conceptImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-concept_art-telescan_building.avif',
			width: 2048,
			height: 1536,
			caption: 'Telescan headquarters · concept art',
			alt: 'Telescan headquarters · concept art',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-concept_art-disposal_room.jpg',
			width: 843,
			height: 474,
			caption: 'Disposal room',
			alt: 'Disposal room',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-concept_art-teleporter.jpg',
			width: 738,
			height: 960,
			caption: 'The teleporter',
			alt: 'The teleporter',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-concept_art-handcuffs.jpg',
			width: 843,
			height: 474,
			caption: 'Hi-tech restraints',
			alt: 'Hi-tech restraints',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-concept_art-main_characters_eye_recorder_close_up.jpg',
			width: 1920,
			height: 818,
			caption: 'Eye-recorder UI',
			alt: 'Eye-recorder UI',
		},
	];

	const btsImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-001.avif',
			width: 2048,
			height: 1152,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-002.avif',
			width: 2048,
			height: 1152,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-057.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-059.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-060.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-062.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-072.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-084.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-088.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-094.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-096.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-101.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-127.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-155.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-163.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-194.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-063.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-089.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-093.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-105.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-112.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-114.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-140.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-193.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-196.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-212.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-233.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-251.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-254.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-255.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-270.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-284.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-297.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-323.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-324.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-334.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-344.avif',
			width: 2048,
			height: 1367,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-07-22_what_makes_us_human-behind_the_scenes_set_photo_stillframe_02.jpg',
			width: 960,
			height: 540,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-07-22_what_makes_us_human-behind_the_scenes_set_photo_stillframe_03.jpg',
			width: 960,
			height: 540,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-07-22_what_makes_us_human-behind_the_scenes_set_photo_stillframe_04.jpg',
			width: 960,
			height: 540,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-164.jpg',
			width: 640,
			height: 640,
		},
	];

	const premiereImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-empty_theater.avif',
			width: 2048,
			height: 1537,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-crowd.avif',
			width: 2048,
			height: 1536,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-brian_schwabauer_close_up.jpg',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-what_makes_us_human_crew_group_photo.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-brian_schwabauer_3.jpg',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-brian_schwabauer_1.jpg',
			width: 240,
			height: 320,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-brian_schwabauer_2.jpg',
			width: 240,
			height: 320,
		},
	];

	const posterImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster-minimalistic.jpg',
			width: 648,
			height: 960,
			caption: 'The minimalist cut',
			alt: 'What Makes Us Human — minimalist poster',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster-villian.avif',
			width: 1167,
			height: 1803,
			caption: 'The villain one-sheet',
			alt: 'What Makes Us Human — villain poster',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster-villain_in_times_magazine.avif',
			width: 1365,
			height: 2048,
			caption: 'In-world prop — the villain on a Times cover',
			alt: 'What Makes Us Human — villain on a mocked-up Times magazine cover',
		},
	];

	// Only the full thesis film is rendered inline — defer playback to a Gallery lightbox.
	const sectionExtras: GalleryItem[] = [
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human/poster.jpg',
			width: 1920,
			height: 818,
			caption: 'What Makes Us Human (2014) — full senior thesis short',
			alt: 'What Makes Us Human (2014) — full senior thesis short',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();

	/*
	 * The scan. It was already here — an 80px band blurred by 8px, sweeping the
	 * top 120vh of the section on an 8s loop — and it read as a soft smear
	 * because of two things: it had no hard edge anywhere in it, and it passed
	 * over nothing. A beam is only legible if it has a defined core, and it only
	 * means anything if it finds something.
	 *
	 * So: a bright 2px core inside the same wide falloff (which reads far
	 * sharper at the same overall brightness, rather than needing more of it),
	 * and a layer of vitals underneath that exists *only* where the beam is
	 * crossing. A film called What Makes Us Human, being measured for an answer.
	 */
</script>

<SectionShell id="what-makes-us-human" year="2015" label="Senior Thesis" theme="thesis">
	<!--
	  The beam and what it finds are two elements moving on identical, opposite
	  keyframes: the band travels down, and the vitals inside it travel up by
	  exactly as much, which leaves the vitals standing still while the band's
	  window slides over them. Both are `translate`, so both stay on the
	  compositor, and being one animation each they can't drift out of sync the
	  way a mask-position sweep would.

	  The whole apparatus is pinned to the viewport rather than laid over the
	  section. Sweeping the section end to end sounds more thorough and is worse:
	  this section is several screens tall, so the beam spent most of its cycle
	  somewhere you weren't looking. Pinned, it is always crossing the screenful
	  you are actually on — which is what "make it more prominent" needed.
	-->
	<div class="scan" aria-hidden="true">
		<div class="band">
			<div class="core"></div>
		</div>
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2015" subtitle="Senior Thesis" color="#00f2c3" treatment="clone" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div
					class="film-poster"
					style:background-image="url(https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster_without_text.avif)">
				</div>
				<div class="poster-text">
					<div class="award-tag">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M12 2l2.4 5 5.6.8-4 4 1 5.5L12 14.5l-5 2.8 1-5.5-4-4 5.6-.8z"
								fill="currentColor" />
						</svg>
						<span>MBEA · 1st Place · Screenwriting</span>
					</div>
					<h2 class="title">
						WHAT MAKES
						<br />
						US HUMAN
					</h2>
					<div class="subtitle">
						A short film about teleportation, identity, and what gets left behind.
					</div>
				</div>
			</Reveal>
		</div>

		<div class="synopsis">
			<Reveal>
				<h3 class="eyebrow">SYNOPSIS</h3>
				<p>
					Eve, a journalist, is digging into a new teleportation technology when she's
					forced to use a teleporter in an emergency. The machine works by scanning your
					body at the molecular level, transmitting the data, and "printing" you on the
					other end — then destroying the original. The public doesn't know that last
					part.
				</p>
				<p>
					The power flickers mid-scan. The machine prints a new Eve but fails to destroy
					the old one. Now there are two of her, and the company has reasons to make sure
					nobody finds out. She eventually exposes the secret to the world.
				</p>
				<p class="aside">
					<strong>The question the film never quite answers:</strong>
					if a perfect 1:1 copy of you exists, is the original still "you"? What does this technology
					do to the meaning of being a person? We didn't try to solve that on screen. We tried
					to let it sit in your stomach.
				</p>
			</Reveal>
		</div>

		<div class="film-grid">
			<Reveal variant="up">
				<div class="eyebrow bleed-head">FROM THE FILM</div>
				<div class="gallery-bleed">
					<LightboxGallery
						key="what-makes-us-human-film"
						items={filmImages}
						display="masonry"
						size="1" />
				</div>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="full-film">
					<div class="full-film-eyebrow">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<polygon points="6,4 22,12 6,20" fill="currentColor" />
						</svg>
						<span>WATCH THE FULL FILM · 15 MIN</span>
					</div>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human/poster.jpg"
						alt="What Makes Us Human (2014) — full senior thesis short"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="concept-grid">
			<Reveal variant="up">
				<div class="eyebrow">CONCEPT ART · PRE-PRODUCTION</div>
				<LightboxGallery
					key="what-makes-us-human-concept"
					items={conceptImages}
					display="masonry-row"
					size="2" />
			</Reveal>
		</div>

		<div class="poster-grid">
			<Reveal variant="up">
				<div class="eyebrow">THE POSTER SERIES</div>
				<p class="poster-note">
					Part of treating it like a real release: a set of one-sheets — including an
					in-world <em>Times</em>
					cover we mocked up as a prop for the film itself.
				</p>
				<LightboxGallery
					key="what-makes-us-human-posters"
					items={posterImages}
					display="masonry-row"
					size="2" />
			</Reveal>
		</div>

		<div class="prod-stats">
			<Reveal>
				<div class="stat">
					<div class="stat-num">15</div>
					<div class="stat-label">minutes long</div>
				</div>
				<div class="stat">
					<div class="stat-num">20+</div>
					<div class="stat-label">script revisions</div>
				</div>
				<div class="stat">
					<div class="stat-num">~$5k</div>
					<div class="stat-label">crowdfunded on Indiegogo</div>
				</div>
				<div class="stat">
					<div class="stat-num">∞</div>
					<div class="stat-label">favors called in</div>
				</div>
			</Reveal>
		</div>

		<div class="bts-block">
			<Reveal>
				<h3 class="big-sub bleed-head">We approached it like a Hollywood film.</h3>
				<p class="bleed-head">
					A 15-minute short, but with craft services, extras, multiple locations, a
					casting call, an Indiegogo fundraising campaign, real camera rigs, multiple
					revisions on the script over months of preproduction. Not because we needed all
					of that to deliver — but because we wanted to know what it felt like to actually
					do it.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="gallery-bleed">
					<PeekGallery
						key="what-makes-us-human-bts"
						items={btsImages}
						peek={8}
						size="2" />
				</div>
			</Reveal>
		</div>

		<div class="premiere-block">
			<Reveal>
				<h3 class="big-sub">Premiere · MSU Electronic Arts Showcase · May 2015</h3>
				<p>
					The end of college. A theater. A crowd. The film ran. People reacted to the
					beats we'd been building toward for almost a year. It is, to this day, the
					single longest project I've ever shipped.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<LightboxGallery
					key="what-makes-us-human-premiere"
					items={premiereImages}
					display="masonry-row"
					size="2" />
			</Reveal>
		</div>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="what-makes-us-human"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	.lb-img {
		display: block;
		max-width: min(1400px, 92vw);
		max-height: calc(95svh - 8rem);
		object-fit: contain;
		border-radius: 6px;
	}
	:global([data-theme='thesis']) {
		background:
			radial-gradient(ellipse at top, rgba(0, 242, 195, 0.06), transparent 50%),
			linear-gradient(180deg, #03080a, #06141a 50%, #02080c);
		color: #e8f7fa;
	}
	.scan {
		--band-h: 260px;
		/* One screenful of travel, and the loop restarts as soon as it lands. */
		--travel: 100svh;
		--dur: 7s;
		position: sticky;
		top: 0;
		height: 100svh;
		/* Back out of flow, so the copy sits over the beam instead of a screen
		   below it. */
		margin-bottom: -100svh;
		overflow: hidden;
		pointer-events: none;
	}
	/*
	 * The beam's soft body. Wide and dim, exactly as before — what changed is
	 * that it now has a hard core running through it (`.core`) and something
	 * inside it to light up. A gradient with no hard edge anywhere reads as fog;
	 * one bright line inside the same fog reads as a beam.
	 */
	.band {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: var(--band-h);
		overflow: hidden;
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 242, 195, 0.07) 34%,
			rgba(0, 242, 195, 0.16) 50%,
			rgba(0, 242, 195, 0.07) 66%,
			transparent 100%
		);
		animation: scan-band var(--dur) linear infinite;
	}
	.core {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 2px;
		translate: 0 -1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(140, 255, 232, 0.85) 18%,
			rgba(190, 255, 244, 0.95) 50%,
			rgba(140, 255, 232, 0.85) 82%,
			transparent
		);
		box-shadow: 0 0 14px rgba(0, 242, 195, 0.55);
	}
	/* Top of the screen to the bottom, then straight back to the top. `--travel`
	   is one viewport, because the whole apparatus is pinned to one. */
	@keyframes scan-band {
		from {
			translate: 0 calc(var(--band-h) * -1);
		}
		to {
			translate: 0 var(--travel);
		}
	}
	/* A beam sweeping the page is exactly the kind of large ambient motion
	   reduced motion is asking us to drop. Leave the band parked mid-screen so
	   the section keeps its instrument, without the sweep. */
	@media (prefers-reduced-motion: reduce) {
		.band {
			animation: none;
			translate: 0 22vh;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.lockup {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 3rem 0;
		margin-bottom: 3rem;
	}
	.lockup > :global(.reveal) {
		display: contents;
	}
	.film-poster {
		position: absolute;
		inset: -10% -25%;
		background-size: cover;
		background-position: center;
		opacity: 0.18;
		filter: blur(10px) saturate(1.2);
		z-index: 0;
	}
	.poster-text {
		position: relative;
		z-index: 1;
		text-align: center;
	}
	.award-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		background: rgba(255, 217, 52, 0.15);
		color: #ffd934;
		border: 1px solid #ffd934;
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	.award-tag svg {
		width: 14px;
		height: 14px;
	}
	.title {
		font-size: clamp(2.8rem, 8vw, 6rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: 0.02em;
		margin: 0 0 1rem;
		background: linear-gradient(180deg, #fff 30%, #00f2c3 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 80px rgba(0, 242, 195, 0.25);
	}
	.subtitle {
		font-family: var(--font-mono);
		font-size: 1rem;
		letter-spacing: 0.06em;
		opacity: 0.8;
		max-width: 40rem;
		margin: 0 auto;
	}

	.synopsis {
		max-width: 52rem;
		margin: 0 auto 4rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 1rem;
		font-weight: 700;
	}
	.synopsis p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(0, 242, 195, 0.06);
		border-left: 3px solid #00f2c3;
		border-radius: 0 8px 8px 0;
	}
	.aside strong {
		color: #00f2c3;
	}

	.film-grid,
	.concept-grid,
	.poster-grid,
	.bts-block,
	.premiere-block {
		margin: 4rem 0;
	}
	.poster-note {
		max-width: 46rem;
		line-height: 1.6;
		opacity: 0.82;
		margin: 0 0 1.5rem;
	}
	.poster-note em {
		font-style: italic;
		color: #00f2c3;
	}

	.prod-stats > :global(.reveal) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin: 4rem 0;
		padding: 2rem;
		background: linear-gradient(135deg, rgba(0, 242, 195, 0.06), transparent);
		border: 1px solid rgba(0, 242, 195, 0.2);
		border-radius: 12px;
	}
	@media (max-width: 768px) {
		.prod-stats > :global(.reveal) {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	.stat {
		text-align: center;
	}
	.stat-num {
		font-family: var(--font-mono);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 900;
		color: #00f2c3;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.85rem;
		opacity: 0.75;
		margin-top: 0.3rem;
	}

	.big-sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin: 0 0 0.8rem;
	}
	.bts-block p,
	.premiere-block p {
		max-width: 56rem;
		line-height: 1.65;
		margin-bottom: 1.5rem;
	}

	.full-film {
		margin: 2.5rem auto 0;
		max-width: 920px;
		padding: 1.4rem;
		background: linear-gradient(135deg, rgba(0, 242, 195, 0.06), transparent);
		border: 1px solid rgba(0, 242, 195, 0.25);
		border-radius: 14px;
	}
	.full-film-eyebrow {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 0.8rem;
	}
	.full-film-eyebrow svg {
		width: 14px;
		height: 14px;
	}
</style>
