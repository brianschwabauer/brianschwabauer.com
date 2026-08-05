<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import { Video, type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';
	import { onScrollProgress } from '../primitives/scrollProgress';

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
			src: 'https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster_with_text.avif',
			width: 648,
			height: 960,
			caption: 'What Makes Us Human Poster',
			alt: 'What Makes Us Human — poster',
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

	/*
	 * The scan. It was already here — an 80px band blurred by 8px, sweeping the
	 * top 120vh of the section on an 8s loop — and it read as a soft smear
	 * because of two things: it had no hard edge anywhere in it, and it passed
	 * over nothing. A beam is only legible if it has a defined core, and it only
	 * means anything if it finds something.
	 *
	 * So: a bright 2px core inside the same wide falloff (which reads far
	 * sharper at the same overall brightness, rather than needing more of it).
	 */

	/** The section box — parent of the effect layers, and what both of them measure. */
	let host = $state<HTMLDivElement | null>(null);
	const section = () => host?.parentElement ?? null;

	/* ---------------------------------------------------------------------------
	 * The beam, now sweeping the section instead of the screen.
	 *
	 * Pinned to the viewport it was always in front of you, which is also why it
	 * never felt like it belonged to the film: a real scan passes over a subject
	 * once and is gone. So the band travels the section's own length and you can
	 * scroll out from under it.
	 *
	 * That alone would make it rare — this section is several screens tall, so one
	 * band crossing it end to end is off-screen most of the time. The fix is to
	 * hold the *speed* fixed and let the count follow the geometry: a band takes
	 * `CROSS` seconds to cover one viewport, so a section N viewports tall needs N
	 * bands, evenly staggered, for roughly one to be in front of you at any moment.
	 * A short section under a tall screen gets one; a long section on a laptop gets
	 * six. Nothing here has to know which case it is.
	 * ------------------------------------------------------------------------- */

	/** Seconds for a band to travel one viewport height. Sets the beam's speed. */
	const CROSS = 5;

	let section_h = $state(0);
	let viewport_h = $state(0);

	/** Viewports of section to cross — the whole geometry both numbers come from. */
	let spans = $derived(viewport_h > 0 ? Math.max(1, section_h / viewport_h) : 1);
	/** One band per viewport of travel: enough for ~1 to be on screen at a time. */
	let band_count = $derived(Math.min(8, Math.ceil(spans)));
	/** Constant speed, so a taller section takes proportionally longer to sweep. */
	let sweep_dur = $derived(CROSS * spans);
	/**
	 * Phase spacing between bands — one full cycle divided by the number of bands,
	 * which is the only value that spreads them evenly.
	 *
	 * This used to be a flat `CROSS`, on the reasoning that a band covers one
	 * viewport in `CROSS` seconds so `CROSS` apart is one viewport apart. That only
	 * holds when `spans` is a whole number. At `spans = 3.2` the cycle is 16s but
	 * the four bands sat at 0/5/10/15s — so the last band trailed the first by 1s,
	 * not 5, and you got two beams a few pixels apart. Dividing the cycle instead
	 * keeps them evenly spread at every geometry; the beam's *speed* is still fixed
	 * by `CROSS` (it sets `sweep_dur`), only the spacing follows the band count.
	 */
	let band_gap = $derived(sweep_dur / band_count);

	$effect(() => {
		const sec = section();
		if (!sec || typeof ResizeObserver === 'undefined') return;
		const measure = () => {
			viewport_h = window.innerHeight || 1;
		};
		measure();
		const ro = new ResizeObserver(() => {
			const h = sec.getBoundingClientRect().height;
			if (h > 0) section_h = h;
		});
		ro.observe(sec);
		window.addEventListener('resize', measure);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', measure);
		};
	});

	/* ---------------------------------------------------------------------------
	 * The copies.
	 *
	 * The year mark's own treatment is the scan itself: outlines out of register
	 * that resolve into one solid 2015 as the mark arrives. What happens after
	 * that is the film's actual premise. The machine already ran; now the copies
	 * come off.
	 *
	 * Each generation spawns from the *previous* generation, not from the year —
	 * that is the whole point of a copy of a copy. Generation n starts wherever
	 * n-1 had drifted to by the time it appeared, heads off on its own bearing,
	 * and is fainter and softer than its parent. Solid, unlike the outlines
	 * above: these are the substance that got printed, and there is less of it
	 * every time.
	 *
	 * Ceiling on all of it is `PEAK` — these live behind body copy, so the
	 * brightest ghost on screen is a sixth of a stop above the background.
	 * ------------------------------------------------------------------------- */

	/** How far a copy travels from its spawn point over its life, in `em`. */
	const DRIFT = 0.85;
	/** Section progress between spawns. */
	const STEP = 0.115;
	/** Section progress a copy takes to emerge, drift and vanish. */
	const LIFE = 0.34;
	/** Opacity of the first copy at its peak. Everything after is dimmer. */
	const PEAK = 0.155;

	/**
	 * Bearings, deliberately uneven in angle. Copies fanning out at even
	 * intervals read as a designed starburst; the premise is that nobody chose
	 * where these went.
	 */
	const BEARINGS = [
		/* The first one heads out to the left: the year mark sits at the left edge,
		   so leaving to the left takes the brightest copy off the page instead of
		   across the synopsis. */
		{ dx: -0.92, dy: -0.28 },
		{ dx: -0.71, dy: 0.62 },
		{ dx: 0.44, dy: 0.86 },
		{ dx: -0.95, dy: -0.22 },
		{ dx: 0.66, dy: -0.72 },
		{ dx: -0.38, dy: 0.9 },
		{ dx: 0.88, dy: 0.4 },
	];

	/**
	 * Where each generation is born: the point its parent had reached by then.
	 * A parent is `STEP / LIFE` of the way through its own drift when its child
	 * appears, so the birthplaces chain outward on their own — no generation is
	 * measured from the original.
	 */
	const ORIGINS: { x: number; y: number }[] = [];
	for (let i = 0, x = 0, y = 0; i < BEARINGS.length; i++) {
		ORIGINS.push({ x, y });
		x += BEARINGS[i].dx * DRIFT * (STEP / LIFE);
		y += BEARINGS[i].dy * DRIFT * (STEP / LIFE);
	}

	/** 0 when the section's top reaches the top of the screen, 1 at its bottom. */
	let progress = $state(0);

	$effect(() => {
		const sec = section();
		if (!sec) return;
		return onScrollProgress(sec, (rect) => {
			const travel = Math.max(1, rect.height - (window.innerHeight || 0));
			progress = Math.max(0, Math.min(1, -rect.top / travel));
		});
	});

	let copies = $derived(
		BEARINGS.map((b, i) => {
			// Nothing before this generation's turn, nothing after it dissolves.
			const life = Math.max(0, Math.min(1, (progress - i * STEP) / LIFE));
			const origin = ORIGINS[i];
			return {
				born: life > 0 && life < 1,
				tx: origin.x + b.dx * DRIFT * life,
				ty: origin.y + b.dy * DRIFT * life,
				// Emerge, hold, fade — one arc, and each generation's is lower
				// than its parent's.
				opacity: Math.sin(life * Math.PI) * PEAK * 0.8 ** i,
				// Each copy swells as it goes, and starts a little larger than its
				// parent did — a print that never quite registers at the same size,
				// and, growing while it dims, something coming toward you as it
				// loses substance.
				scale: 1 + i * 0.05 + life * 0.32,
				blur: 1 + i * 0.7,
			};
		}),
	);
</script>

<SectionShell id="senior-thesis" year="2015" label="Senior Thesis" theme="thesis">
	<!--
	  The beam. One element per band, all on the same keyframes at the same speed,
	  each offset by a negative delay of `i` gaps — a single animation per band and
	  nothing to keep in sync, because the stagger is baked into where in the cycle
	  each one starts rather than maintained frame to frame.

	  The key includes `band_count` on purpose. A band's phase is only its negative
	  delay *relative to when it mounted*, so bands added later (the section is
	  measured after paint, and `content-visibility` makes it remeasure as you
	  scroll into it) start their cycle from a different zero than the ones already
	  running — which is the other way two beams ended up on top of each other.
	  Re-keying remounts the whole set whenever the count changes, so every band's
	  clock starts at the same instant and the even spacing actually holds.
	-->
	<div
		bind:this={host}
		class="scan"
		aria-hidden="true"
		style:--sec-h="{section_h}px"
		style:--dur="{sweep_dur}s"
		style:--stagger="{band_gap}s">
		{#each Array(band_count) as _, i (`${band_count}:${i}`)}
			<div class="band" style:--i={i}>
				<div class="core"></div>
			</div>
		{/each}
	</div>

	<!--
	  The copies, on a layer pinned to the viewport so a generation stays legible
	  for its whole life instead of being left behind the moment it is born. Its
	  rail repeats the container's geometry, which is what puts the first copy on
	  top of the real year mark at the moment the section's top reaches the top of
	  the screen — where generation 0 spawns.
	-->
	<div class="echoes" aria-hidden="true">
		<div class="rail">
			{#each copies as c, i (i)}
				{#if c.born}
					<span
						class="echo"
						style:--tx={c.tx}
						style:--ty={c.ty}
						style:--o={c.opacity}
						style:--s={c.scale}
						style:--b="{c.blur}px">
						2015
					</span>
				{/if}
			{/each}
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
					<strong>The question the film explores:</strong>
					if a perfect 1:1 copy of you exists, is the copy still "you"? What does this technology
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
					<Video
						src="https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human/master.m3u8"
						poster="https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human/poster.jpg"
						title="What Makes Us Human (2015) — full senior thesis short"
						aspect_ratio="1920/818"
						preload="none" />
				</div>
			</Reveal>
		</div>

		<div class="poster-grid">
			<Reveal variant="up">
				<div class="eyebrow">THE POSTER SERIES</div>
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
					revisions on the script over months of preproduction.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="gallery-bleed">
					<PeekGallery
						key="what-makes-us-human-bts"
						items={btsImages}
						peek={9}
						size="2" />
				</div>
			</Reveal>
		</div>

		<div class="premiere-block">
			<Reveal>
				<h3 class="big-sub">Premiere · MSU Electronic Arts Showcase · May 2015</h3>
				<p>
					The end of college. A theater. A crowd. The film ran. People reacted to the
					beats we'd been building toward for almost a year. It's still the biggest film
					production I've ever been a part of — and now that I build software instead of
					films, the biggest I ever will be.
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
</SectionShell>

<style>
	:global([data-theme='thesis']) {
		background:
			radial-gradient(ellipse at top, rgba(0, 242, 195, 0.06), transparent 50%),
			linear-gradient(180deg, #03080a, #06141a 50%, #02080c);
		color: #e8f7fa;
	}
	.scan {
		--band-h: 260px;
		/* Laid over the section, not the screen — so a band passes you once and is
		   gone, and you can scroll out from under it. The section's paint
		   containment (`content-visibility: auto`) clips the bands to it. */
		position: absolute;
		inset: 0;
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
		/* The stagger is a head start, not a wait: every band is mid-cycle from the
		   first frame, one `--stagger` apart, so the section is never empty while
		   the first one gets going. */
		animation-delay: calc(var(--i) * var(--stagger) * -1);
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
	/* The section's top edge to its bottom edge, then back to the top. */
	@keyframes scan-band {
		from {
			translate: 0 calc(var(--band-h) * -1);
		}
		to {
			translate: 0 var(--sec-h);
		}
	}
	/* A beam sweeping the page is exactly the kind of large ambient motion
	   reduced motion is asking us to drop. Keep one band, parked, so the section
	   keeps its instrument without the sweep. */
	@media (prefers-reduced-motion: reduce) {
		.band {
			animation: none;
			translate: 0 calc(var(--sec-h) * 0.2);
		}
		.band:not(:first-child) {
			display: none;
		}
	}

	/*
	 * The copies. Pinned to the viewport and pulled back out of flow, so the page
	 * content sits over the layer rather than a screen below it.
	 */
	.echoes {
		position: sticky;
		top: 0;
		height: 100svh;
		margin-bottom: -100svh;
		overflow: hidden;
		pointer-events: none;
	}
	/* The container's geometry, repeated, so the first generation lands on the
	   real year mark instead of near it. */
	.rail {
		position: relative;
		height: 100%;
		max-width: 80rem;
		margin: 0 auto;
	}
	.echo {
		position: absolute;
		/* The year mark's own top margin — where the numerals actually start. */
		top: clamp(2rem, 6vw, 4rem);
		left: clamp(1rem, 3vw, 2rem);
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: clamp(7rem, 22vw, 18rem);
		line-height: 0.85;
		letter-spacing: -0.04em;
		white-space: nowrap;
		/* Filled, unlike the outlines that converge above: the outlines are the
		   scan, these are what the printer put down. */
		color: #00f2c3;
		opacity: var(--o);
		translate: calc(var(--tx) * 1em) calc(var(--ty) * 1em);
		scale: var(--s);
		filter: blur(var(--b));
	}
	@media (prefers-reduced-motion: reduce) {
		/* The effect is entirely travel and generation. Held still it is a stack of
		   overlapping numerals on top of the body copy. */
		.echoes {
			display: none;
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
	/* The aside as a margin note on the Nth photocopy of the script: dashed
	   rule, faint toner banding, stuck on slightly crooked. */
	.aside {
		padding: 1rem 1.2rem;
		font-family: var(--font-mono);
		font-size: 0.92rem;
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.78);
		border: 1.5px dashed rgba(255, 255, 255, 0.32);
		rotate: -0.4deg;
		background: repeating-linear-gradient(
				0deg,
				transparent 0 7px,
				rgba(255, 255, 255, 0.02) 7px 8px
			)
			rgba(255, 255, 255, 0.03);
	}
	.aside strong {
		color: #00f2c3;
	}

	.film-grid,
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
		/* It's the fifteen-minute film, not a supporting still — give it most of the
		   container. The bleed gallery above it runs the full viewport, so a 920px
		   card read like a footnote underneath. */
		max-width: 1120px;
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
