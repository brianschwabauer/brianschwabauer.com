<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	let { signedIn = false }: { signedIn?: boolean } = $props();

	const reelImages = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-19_lawrence_high_school_film_festival-brian_and_kevin_in_front_of_theater.avif',
			width: 1365,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-19_lawrence_high_school_film_festival-brian_close_shot_in_front_of_theater.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_1.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_2.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_3.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_6.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-29_shawnee_mission_east_film_festival-kevin_and_brian_1.avif',
			width: 2048,
			height: 1365,
		},
	] satisfies GalleryItem[];

	const yardSaleImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-brian_leaves_shot_and_reveals_yard_sale_sign.avif',
			width: 480,
			height: 320,
			caption: 'The setup',
			alt: 'The setup',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-matthew_hides_in_stuff_animal_pile.avif',
			width: 480,
			height: 320,
			caption: 'The pile',
			alt: 'The pile',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-stop_action_animation_with_stuffed_animal.avif',
			width: 480,
			height: 320,
			caption: 'Stop-motion stuffed animals',
			alt: 'Stop-motion stuffed animals',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-stop_action_all_animals_moving.avif',
			width: 480,
			height: 320,
			caption: 'All 20+ at once',
			alt: 'All 20+ at once',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-animals_attack_from_behind.avif',
			width: 480,
			height: 320,
			caption: 'Attack scene',
			alt: 'Attack scene',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-brian_runs_to_start_car.avif',
			width: 480,
			height: 320,
			caption: 'Run to the car',
			alt: 'Run to the car',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-hit_by_car.avif',
			width: 480,
			height: 320,
			caption: 'Hit-by-car effect, lifted from earlier',
			alt: 'Hit-by-car effect, lifted from earlier',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-close_up_on_brian_as_animals_attack.avif',
			width: 480,
			height: 320,
			caption: 'The penguin gets the last peck',
			alt: 'The penguin gets the last peck',
		},
	];

	const liveBroadcastImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-intro_animation.avif',
			width: 720,
			height: 480,
			caption: 'Custom intro animation',
			alt: 'Custom intro animation',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-commentators.avif',
			width: 720,
			height: 480,
			caption: 'The booth',
			alt: 'The booth',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-replay_animation.avif',
			width: 720,
			height: 480,
			caption: 'Instant replay',
			alt: 'Instant replay',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-sideline-reporter.avif',
			width: 720,
			height: 480,
			caption: 'Sideline reporter',
			alt: 'Sideline reporter',
		},
	];

	const blockPartyImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_001.jpg',
			caption: 'Block Party · live show #1',
			alt: 'Block Party · live show #1',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_002.jpg',
			caption: 'Block Party · live show #2',
			alt: 'Block Party · live show #2',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_003.jpg',
			caption: 'Block Party · live show #3',
			alt: 'Block Party · live show #3',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_004.jpg',
			caption: 'Block Party · live show #4',
			alt: 'Block Party · live show #4',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_005.jpg',
			caption: 'Block Party · live show #5',
			alt: 'Block Party · live show #5',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_006.jpg',
			caption: 'Block Party · live show #6',
			alt: 'Block Party · live show #6',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_007.jpg',
			caption: 'Block Party · live show #7',
			alt: 'Block Party · live show #7',
		},
	];

	let reelGallery = $state<ReturnType<typeof LightboxGallery>>();

	// Standalone clickable LazyMedias + inline video posters in document order.
	// 0: Yard Sale inline video
	// 1: Austin Fender (inside <details>)
	// 2: KSMS site cr-card LazyMedia
	// 3: Scott Hirons game cr-card LazyMedia
	// 4: Hall View cr-card LazyMedia
	// 5: live broadcast inline video
	// 6: trick-shot LazyMedia
	// 7: Block Party FULL SHOW video
	// 8: Block Party TRAILER video
	// 9: Block Party PROMO video
	// 10: A MidWestSide Story video
	// 11: Long Time No See video
	const sectionExtras: GalleryItem[] = [
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Yard Sale (2009) — the stuffed-animal short',
			alt: 'Yard Sale (2009) — the stuffed-animal short',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2008-03-19_austin_fender/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2008-03-19_austin_fender/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Austin Fender (2008)',
			alt: 'Austin Fender (2008)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-07-30_ksms_flash_website_large_version_screen_recording-main_menu.avif',
			width: 1080,
			height: 808,
			caption: 'The KSMS website (Flash version)',
			alt: 'KSMS Flash site (later version)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-01-01_scott_hirons_experience_flash_game_screen_recording-gameplay.avif',
			width: 1078,
			height: 720,
			caption: 'Scott Hirons Experience — Flash game',
			alt: 'Scott Hirons Experience gameplay',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-18_ksms_hallview_full_page_screen_recording.avif',
			width: 1000,
			height: 748,
			caption: 'KSMS Hall View — school panorama viewer',
			alt: 'KSMS Hall View screen recording',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-broadcast_beginning_clip/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-broadcast_beginning_clip/poster.jpg',
			width: 720,
			height: 480,
			caption: 'KSMS live broadcast · basketball vs SM-NW (2011) — broadcast opener',
			alt: 'KSMS live broadcast · basketball vs SM-NW (2011) — broadcast opener',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms-basketball_trick_shot_with_vfx.avif',
			width: 480,
			height: 320,
			caption: 'The KSMS trick shot',
			alt: 'The KSMS trick shot',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party/poster.jpg',
			width: 720,
			height: 480,
			caption: 'KSMS Block Party (2011) — full live show',
			alt: 'KSMS Block Party (2011) — full live show',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-15_block_party_trailer/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-15_block_party_trailer/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Block Party trailer (2011)',
			alt: 'Block Party trailer (2011)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms_basketball_shot/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms_basketball_shot/poster.jpg',
			width: 720,
			height: 480,
			caption: 'This is KSMS — trick-shot promo (2011)',
			alt: 'This is KSMS — trick-shot promo (2011)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2010-03-20_a_midwestside_story/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2010-03-20_a_midwestside_story/poster.jpg',
			width: 720,
			height: 480,
			caption: 'A MidWestSide Story (2010)',
			alt: 'A MidWestSide Story (2010)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-08-28_long_time_no_see/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-08-28_long_time_no_see/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Long Time No See (2011)',
			alt: 'Long Time No See (2011)',
		},
	];
	let extrasGallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="festivals-ksms" year="2011" label="Festivals & KSMS" theme="broadcast">
	<div class="container">
		<Reveal>
			<YearMark year="2011" subtitle="Festivals · KSMS · Live TV" color="#ff3a3a" />
		</Reveal>

		<div class="award-banner">
			<Reveal>
				<div class="award-num">
					<svg class="laurel laurel-l" viewBox="0 0 40 100" aria-hidden="true">
						<path
							d="M34 6 C18 22 12 42 14 62 C16 78 24 90 36 96"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round" />
						{#each [12, 26, 40, 54, 68, 82] as y, i (y)}
							<path
								d="M {17 - i * 0.6} {y} q -12 -2 -15 -12 q 12 -2 15 12 Z"
								fill="currentColor" />
						{/each}
					</svg>
					<span class="num-digit">20</span>
					<span class="num-plus">+</span>
					<svg class="laurel laurel-r" viewBox="0 0 40 100" aria-hidden="true">
						<path
							d="M6 6 C22 22 28 42 26 62 C24 78 16 90 4 96"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round" />
						{#each [12, 26, 40, 54, 68, 82] as y, i (y)}
							<path
								d="M {23 + i * 0.6} {y} q 12 -2 15 -12 q -12 -2 -15 12 Z"
								fill="currentColor" />
						{/each}
					</svg>
				</div>
				<div class="award-meta">
					<div class="award-title">awards won at film festivals in high school</div>
					<div class="award-sub">
						Kevin and I submitted everything, everywhere, every year.
					</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up" delay={100}>
			<FilmReel
				images={reelImages}
				height={170}
				speed={50}
				onframeclick={({ index, element }) => reelGallery?.open(index, element)} />
		</Reveal>

		<div class="yard-sale">
			<Reveal class="bleed-head">
				<h3 class="sub">Yard Sale (2009) — the one I was most proud of</h3>
				<p>
					Almost no dialogue. A guy holds a yard sale and tries to get rid of his stuffed
					animals. The stuffed animals come to life. They are not pleased. He flees. They
					chase. The film ends with an inflatable penguin pecking him on the face and a
					cut to black.
				</p>
				<p>
					Some shots used stop-motion. Some used hidden puppeting. I tried to mix them in
					a way you couldn't tell. In the climax, twenty-plus animals all stop-motion
					together. The shot took so long that a nearby tree's shadow moves across the
					screen faster than the animals do. I still laugh at that.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="gal-eyebrow bleed-head">
					YARD SALE · {yardSaleImages.length} STILLS
				</div>
				<div class="gallery-bleed">
					<LightboxGallery
						key="festivals-yard-sale"
						items={yardSaleImages}
						display="masonry"
						size="1" />
				</div>
			</Reveal>
			<Reveal variant="up" delay={160}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale/poster.jpg"
						alt="Yard Sale (2009) — the stuffed-animal short"
						ratio="16 / 9"
						video
						onclick={(e) => extrasGallery?.open(0, e.currentTarget)} />
				</div>
			</Reveal>

			<Reveal variant="up" delay={200}>
				<details class="extra-video">
					<summary>
						Also watch — Austin Fender (2008) · our first festival submission
					</summary>
					<div class="inline-video">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2008-03-19_austin_fender/poster.jpg"
							alt="Austin Fender (2008)"
							ratio="16 / 9"
							video
							onclick={(e) => extrasGallery?.open(1, e.currentTarget)} />
					</div>
				</details>
			</Reveal>
		</div>

		<div class="ksms-block">
			<Reveal>
				<div class="ksms-eyebrow">[ KSMS · THE VOICE OF SHAWNEE MISSION SOUTH ]</div>
				<h3 class="ksms-title">
					Inside the
					<br />
					<span class="ksms-grad">control room.</span>
				</h3>
				<p class="lede">
					KSMS was my high school's broadcast journalism program. We made the morning
					announcement show, news packages, sports features, comedy sketches — everything.
					Our teacher Mr. Hirons was supportive of every crazy idea we had, and we had a
					lot of them.
				</p>
			</Reveal>

			<div class="control-room">
				<Reveal variant="up" delay={80}>
					<div class="cr-card">
						<div class="cr-eyebrow">SITE</div>
						<h4>The KSMS website</h4>
						<p>
							I built two versions: an animated, interactive Flash version that won "Best
							Interactive Site" at a local competition, then a WordPress version once
							Flash started its slow death so future students could keep updating it.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-07-30_ksms_flash_website_large_version_screen_recording-main_menu.avif"
								alt="KSMS Flash site (later version)"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(2, e.currentTarget)} />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={140}>
					<div class="cr-card">
						<div class="cr-eyebrow">GAME</div>
						<h4>"Scott Hirons Experience"</h4>
						<p>
							A Flash game where you play as Mr. Hirons defending the building from
							astronauts by shooting tennis balls. With actual scoring this time. The
							furthest I'd gotten on a complete game.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-01-01_scott_hirons_experience_flash_game_screen_recording-gameplay.avif"
								alt="Scott Hirons Experience gameplay"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(3, e.currentTarget)} />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={200}>
					<div class="cr-card">
						<div class="cr-eyebrow">EXPERIMENT</div>
						<h4>"Hall View"</h4>
						<p>
							Google Street View, but for our school. I walked around with a camera, shot
							360-stitched panoramas at every hallway junction, then built a minimap-based
							viewer so you could click a dot to "stand" at that point. QuickTime did the
							actual panorama rendering.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-08-18_ksms_hallview_full_page_screen_recording.avif"
								alt="KSMS Hall View screen recording"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(4, e.currentTarget)} />
						</div>
					</div>
				</Reveal>
			</div>

			<div class="live-broadcast">
				<Reveal>
					<h4 class="lb-title">
						<span class="rec-pulse"></span>
						LIVE · The KSMS sports broadcast rig
					</h4>
					<p>
						Probably my favorite KSMS memory. We brought live broadcasts to our sports
						events — before YouTube had livestreams. I wired a row of cameras into an
						analog video switcher, ran that into an analog-to-digital converter, and
						pushed the output through some random live streaming service.
					</p>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<div class="rig-diagram">
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">📷</div>
							<div class="rig-label">Cameras</div>
							<div class="rig-sub">2–3 of them</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">🎚️</div>
							<div class="rig-label">Analog switcher</div>
							<div class="rig-sub">push button to cut</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">📼</div>
							<div class="rig-label">Tape decks</div>
							<div class="rig-sub">poor man's instant replay</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">💻</div>
							<div class="rig-label">A/D → laptop</div>
							<div class="rig-sub">→ random streaming service</div>
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={150}>
					<LightboxGallery
						key="festivals-live-broadcast"
						items={liveBroadcastImages}
						display="masonry-row"
						size="2" />
				</Reveal>

				<Reveal variant="up" delay={180}>
					<div class="inline-video">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-broadcast_beginning_clip/poster.jpg"
							alt="KSMS live broadcast · basketball vs SM-NW (2011) — broadcast opener"
							ratio="16 / 9"
							video
							onclick={(e) => extrasGallery?.open(5, e.currentTarget)} />
					</div>
				</Reveal>

				<p class="aside">
					The tape decks were our "instant replay" rig. Each camera also fed a tape deck
					that recorded its input to a DV tape. When something happened we wanted to
					replay, we'd rewind, hit play on the deck, and switch the live broadcast to that
					input. Sometimes it worked. When it worked, it felt like magic.
				</p>
			</div>

			<div class="block-party">
				<Reveal class="bleed-head">
					<h4 class="lb-title">KSMS Block Party — the senior-year finale</h4>
					<p>
						A live, SNL-style variety show in our school auditorium. Months of
						preparation. A full live audience. Multi-camera coverage. Pre-recorded
						sketches. Stand-up. Improv. A live band. A custom motion-graphics package.
						Everything KSMS had taught us, in one night.
					</p>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<div class="gal-eyebrow bleed-head">
						THE BLOCK PARTY · {blockPartyImages.length} PHOTOS
					</div>
					<div class="gallery-bleed">
						<LightboxGallery
							key="festivals-block-party"
							items={blockPartyImages}
							display="masonry"
							size="2" />
					</div>
				</Reveal>

				<Reveal variant="up" delay={150}>
					<div class="trick-shot">
						<div class="ts-info">
							<div class="ts-eyebrow">PROMO · "This is KSMS"</div>
							<p>
								To promote Block Party I made a trick-shot commercial: a member of KSMS
								hits a basketball from an absurd distance. (Yes, the make is a VFX trick.)
								It got people talking.
							</p>
						</div>
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms-basketball_trick_shot_with_vfx.avif"
							alt="The KSMS trick shot"
							ratio="16 / 9"
							onclick={(e) => extrasGallery?.open(6, e.currentTarget)} />
					</div>
				</Reveal>

				<Reveal variant="up" delay={180}>
					<div class="block-party-videos">
						<div class="bp-video-card">
							<div class="bp-video-eyebrow">FULL SHOW</div>
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party/poster.jpg"
								alt="KSMS Block Party (2011) — full live show"
								ratio="16 / 9"
								video
								onclick={(e) => extrasGallery?.open(7, e.currentTarget)} />
						</div>
						<div class="bp-video-card">
							<div class="bp-video-eyebrow">TRAILER</div>
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2011-04-15_block_party_trailer/poster.jpg"
								alt="Block Party trailer (2011)"
								ratio="16 / 9"
								video
								onclick={(e) => extrasGallery?.open(8, e.currentTarget)} />
						</div>
						<div class="bp-video-card">
							<div class="bp-video-eyebrow">PROMO</div>
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms_basketball_shot/poster.jpg"
								alt="This is KSMS — trick-shot promo (2011)"
								ratio="16 / 9"
								video
								onclick={(e) => extrasGallery?.open(9, e.currentTarget)} />
						</div>
					</div>
				</Reveal>
			</div>

			<div class="midwestside">
				<Reveal>
					<h4 class="lb-title">A MidWestSide Story (2010)</h4>
					<p>
						A parody short film for KSMS about life in the midwest. Just a fun one with
						Kevin and a handful of KSMS regulars.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<div class="inline-video">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2010-03-20_a_midwestside_story/poster.jpg"
							alt="A MidWestSide Story (2010)"
							ratio="16 / 9"
							video
							onclick={(e) => extrasGallery?.open(10, e.currentTarget)} />
					</div>
				</Reveal>
			</div>
		</div>

		<div class="last-film">
			<Reveal>
				<h3 class="sub">One last film before college — Long Time No See (2011)</h3>
				<p>
					Kevin and I were headed to different colleges, so we made one last film together
					that summer. A fish-out-of-water comedy about a guy meeting his foreign-raised
					long-lost brother. Lighter on effects, heavier on story. Our best storytelling
					at that point.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2011-08-28_long_time_no_see/poster.jpg"
						alt="Long Time No See (2011)"
						ratio="16 / 9"
						video
						onclick={(e) => extrasGallery?.open(11, e.currentTarget)} />
				</div>
			</Reveal>
		</div>
	</div>

	<LightboxGallery
		bind:this={reelGallery}
		key="festivals-reel"
		items={reelImages}
		autoplay_video />

	<LightboxGallery
		bind:this={extrasGallery}
		key="festivals-extras"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	:global([data-theme='broadcast']) {
		background: linear-gradient(180deg, #0c0808 0%, #160c0c 50%, #0a0606 100%);
		color: #fdebe5;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}

	.award-banner {
		display: flex;
		justify-content: center;
		margin: 3rem 0;
	}
	.award-banner > :global(.reveal) {
		display: flex;
		align-items: baseline;
		gap: 2rem;
		padding: 1.6rem 2.2rem;
		background: linear-gradient(135deg, rgba(255, 58, 58, 0.12), transparent);
		border-left: 4px solid #ff3a3a;
		border-radius: 0 12px 12px 0;
	}
	.award-num {
		display: flex;
		align-items: baseline;
	}
	.laurel {
		width: clamp(1.6rem, 4vw, 3rem);
		height: auto;
		align-self: center;
		color: rgba(255, 58, 58, 0.75);
	}
	.laurel-l {
		margin-right: 0.35rem;
	}
	.laurel-r {
		margin-left: 0.35rem;
	}
	.num-digit {
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 900;
		line-height: 0.85;
		color: transparent;
		-webkit-text-stroke: 3px #ff3a3a;
		font-family: var(--font-mono);
	}
	.num-plus {
		font-size: clamp(2rem, 5vw, 4rem);
		font-weight: 800;
		color: #ff3a3a;
		font-family: var(--font-mono);
		margin-left: 0.2rem;
	}
	.award-title {
		font-size: clamp(1.1rem, 2vw, 1.5rem);
		font-weight: 700;
		max-width: 26rem;
		line-height: 1.3;
	}
	.award-sub {
		font-size: 0.95rem;
		opacity: 0.75;
		margin-top: 0.4rem;
	}

	.yard-sale,
	.ksms-block {
		margin: 5rem 0;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}
	.yard-sale p,
	.ksms-block p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.ksms-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff3a3a;
		margin: 4rem 0 1rem;
	}
	.ksms-title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.ksms-grad {
		background: linear-gradient(90deg, #ff3a3a, #ffb84d);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}

	.control-room {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 2.5rem 0;
	}
	@media (max-width: 900px) {
		.control-room {
			grid-template-columns: 1fr;
		}
	}
	.cr-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition:
			border-color 200ms ease,
			transform 200ms ease;
	}
	.cr-card:hover {
		transition-duration: 0s;
		border-color: rgba(255, 58, 58, 0.4);
		transform: translateY(-3px);
	}
	.cr-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		color: #ff3a3a;
	}
	.cr-card h4 {
		font-size: 1.2rem;
		font-weight: 800;
		margin: 0;
	}
	.cr-card p {
		font-size: 0.95rem;
		line-height: 1.5;
		opacity: 0.85;
		max-width: none;
		margin: 0;
	}
	.cr-media {
		margin-top: 0.5rem;
	}

	.live-broadcast {
		margin: 4rem 0;
	}
	.lb-title {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: clamp(1.4rem, 2.2vw, 1.8rem);
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.rec-pulse {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ff3a3a;
		box-shadow: 0 0 12px #ff3a3a;
		animation: rec 1.4s ease-in-out infinite;
	}
	@keyframes rec {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	.rig-diagram {
		display: grid;
		grid-template-columns: repeat(7, auto);
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		padding: 1.6rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		margin: 1.5rem 0;
		overflow-x: auto;
		font-family: var(--font-mono);
	}
	@media (max-width: 768px) {
		.rig-diagram {
			grid-template-columns: 1fr;
		}
		.rig-arrow {
			transform: rotate(90deg);
			justify-self: center;
		}
	}
	.rig-node {
		text-align: center;
		min-width: 110px;
	}
	.rig-icon {
		font-size: 1.6rem;
	}
	.rig-label {
		font-weight: 700;
		font-size: 0.85rem;
		margin-top: 0.2rem;
	}
	.rig-sub {
		font-size: 0.7rem;
		opacity: 0.6;
		margin-top: 0.1rem;
	}
	.rig-arrow {
		color: #ff3a3a;
		font-size: 1.4rem;
		font-weight: 800;
	}

	.aside {
		padding: 1rem 1.2rem;
		background: rgba(255, 58, 58, 0.06);
		border-left: 3px solid #ff3a3a;
		border-radius: 0 8px 8px 0;
		font-style: italic;
		margin: 1.5rem 0;
	}

	.block-party {
		margin: 4rem 0;
	}

	.trick-shot {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: clamp(1rem, 3vw, 2rem);
		align-items: center;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		margin-top: 2rem;
	}
	@media (max-width: 768px) {
		.trick-shot {
			grid-template-columns: 1fr;
		}
	}
	.ts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffb84d;
		margin-bottom: 0.5rem;
	}
	.ts-info p {
		line-height: 1.55;
	}

	.prose p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.prose strong {
		color: #ffb84d;
	}

	.inline-video {
		max-width: 880px;
		margin: 2rem auto 0;
	}
	.extra-video {
		max-width: 880px;
		margin: 1.5rem auto 0;
	}
	.extra-video summary {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		padding: 0.5rem 1rem;
		border: 1px solid rgba(255, 184, 77, 0.4);
		border-radius: 999px;
		cursor: pointer;
		list-style: none;
		color: #ffb84d;
	}
	.extra-video[open] summary {
		margin-bottom: 1rem;
	}
	.extra-video summary::-webkit-details-marker {
		display: none;
	}
	.extra-video summary {
		transition: background 200ms ease;
	}
	.extra-video summary:hover {
		transition-duration: 0s;
		background: rgba(255, 184, 77, 0.12);
	}
	.extra-video summary::after {
		content: '▾';
		display: inline-block;
		transition: transform 250ms ease;
	}
	.extra-video[open] summary::after {
		transform: rotate(180deg);
	}

	.gal-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: #ffb84d;
		margin-bottom: 0.75rem;
	}

	.block-party-videos {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 2.5rem 0;
	}
	@media (max-width: 900px) {
		.block-party-videos {
			grid-template-columns: 1fr;
		}
	}
	.bp-video-card {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.bp-video-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		color: #ff3a3a;
	}

	.midwestside {
		margin: 4rem 0;
	}
	.midwestside p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.last-film {
		margin: 5rem 0 0;
	}
	.last-film p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}
</style>
