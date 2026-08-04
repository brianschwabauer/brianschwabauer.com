<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ArchiveFrame from '../primitives/ArchiveFrame.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { Gallery, Video, type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const CDN = 'https://cdn.brianschwabauer.com/media/';
	function photo(
		file: string,
		width: number,
		height: number,
		caption?: string,
	): GalleryItem {
		return {
			type: 'image',
			src: `${CDN}${file}`,
			width,
			height,
			...(caption ? { caption, alt: caption } : {}),
		};
	}

	// Every set photo from the Katie Bauer's Breakup shoot, keyed by shoot day.
	const KATIE_BAUER_BTS: GalleryItem[] = (
		[
			[
				'2014-02-22',
				[
					['093913', 1536],
					['095449', 1536],
				],
			],
			[
				'2014-03-21',
				[
					['120858', 1536],
					['125906', 1536],
					['133051', 1536],
					['184420', 1536],
					['200723', 1536],
				],
			],
			[
				'2014-03-22',
				[
					['121722', 1536],
					['121746', 1536],
					['124155', 1536],
					['163203', 1536],
					['192230', 1536],
					['192756', 1536],
				],
			],
			[
				'2014-03-23',
				[
					['095102', 1536],
					['111947', 1536],
					['161416', 1536],
					['171312', 1536],
					['190043', 1536],
					['202421', 1536],
				],
			],
			[
				'2014-03-28',
				[
					['140346', 1536],
					['140431', 1536],
					['140449', 1536],
					['144028', 1536],
					['151422', 1536],
					['153144', 1536],
					['153200', 1536],
				],
			],
			[
				'2014-03-29',
				[
					['131925', 1536],
					['131941', 1536],
					['172611', 1536],
					['175106', 1536],
					['182642', 1152],
					['191231', 1536],
				],
			],
			[
				'2014-03-30',
				[
					['135911', 1536],
					['135915', 1536],
					['140832', 1536],
					['141614', 1536],
					['155731', 1536],
					['155806', 1536],
					['155814', 1536],
				],
			],
		] as const
	).flatMap(([day, times]) =>
		times.map(([time, height]) =>
			photo(
				`${day}_med_562-katie_bauers_breakup_film-behind_the_scenes_set_photo_${time}.avif`,
				2048,
				height,
				"Katie Bauer's Breakup — on set",
			),
		),
	);

	// One camera roll for the whole era: class-project stillframes, every set
	// photo, and the college-years photos that don't appear anywhere else on the
	// page. Roughly chronological.
	const CAMERA_ROLL: GalleryItem[] = [
		photo(
			'2012-02-02_med_365-silent_film-character_looks_up_dramatically.avif',
			1080,
			608,
			'MED 365 — silent film',
		),
		photo(
			'2012-02-02_med_365-silent_film-character_throws_ball_against_wall.avif',
			1080,
			608,
			'MED 365 — silent film',
		),
		photo(
			'2012-04-12_med_365-chase_scene-character_hit_by_car.avif',
			1080,
			608,
			'MED 365 — chase scene',
		),
		photo(
			'2012-04-27_facebook_short_film-everyone_likes_a_post.avif',
			480,
			270,
			'Facebook in Real Life — everyone "likes" a post',
		),
		photo(
			'2012-05-10_med_365-complexity-character_drunkily_stumbles_out_of_bar.avif',
			1080,
			608,
			'MED 365 — Complexity',
		),
		photo(
			'2012-05-01_premier_studios_summer_internship-interns_group_photo.avif',
			2048,
			1375,
			'Premier Studios internship — the interns',
		),
		photo(
			'2012-06-24_premier_studios_summer_internship-target_video_shoot_behind_the_scenes_1.avif',
			2048,
			1536,
			'Premier Studios internship — Target shoot',
		),
		photo(
			'2012-06-24_premier_studios_summer_internship-target_video_shoot_behind_the_scenes_2.avif',
			2048,
			1536,
			'Premier Studios internship — Target shoot',
		),
		photo(
			'2012-06-24_premier_studios_summer_internship-target_video_shoot_behind_the_scenes_3.avif',
			2048,
			1536,
			'Premier Studios internship — Target shoot',
		),
		photo(
			'2012-07-12_premier_studios_summer_internship-green_screen_shoot_1.avif',
			2048,
			1536,
			'Premier Studios internship — green screen shoot',
		),
		photo(
			'2012-07-12_premier_studios_summer_internship-green_screen_shoot_2.avif',
			2048,
			1536,
			'Premier Studios internship — green screen shoot',
		),
		photo(
			'2012-08-01_premier_studios_summer_intership-flash_mob_shoot_group_photo.avif',
			1950,
			1309,
			'Premier Studios internship — flash mob shoot',
		),
		photo(
			'2012-11-09_live_life_green_festival_at_missouri_state_university-brian_holding_first_place_trophy.jpg',
			960,
			720,
			'First place at the Live Life Green festival',
		),
		photo(
			'2012-12-06_art_230_final-stop_action_animation_of_two_people_on_steps.avif',
			480,
			204,
			'ART 230 final — stop motion',
		),
		photo(
			'2013-09-17_video_shoot_behind_the_scenes-filming_dorm_talent_show.avif',
			2048,
			1536,
			'Filming the dorm talent show',
		),
		photo(
			'2013-10-29_ditch_the_pitch-short_film_snapshot-michael_in_silly_light_bulb_costume.jpg',
			1920,
			1080,
			'Ditch the Pitch',
		),
		...KATIE_BAUER_BTS,
		photo(
			'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_02.avif',
			2048,
			1536,
			'NODE — behind the scenes',
		),
		photo(
			'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_06.avif',
			2048,
			1536,
			'NODE — behind the scenes',
		),
		photo(
			'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_07.avif',
			2048,
			1536,
			'NODE — behind the scenes',
		),
		photo(
			'2014-04-10_art_300-project_3-behind_the_scenes-green_screen_1.avif',
			480,
			270,
			'ART 300 — Disturbance, green screen',
		),
		photo(
			'2014-04-10_art_300-project_3-behind_the_scenes-green_screen_2.avif',
			480,
			270,
			'ART 300 — Disturbance, green screen',
		),
		photo(
			'2014-04-10_art_300-project_3-behind_the_scenes-green_screen_3.avif',
			480,
			270,
			'ART 300 — Disturbance, green screen',
		),
		photo(
			'2014-04-10_art_300-project_3-disturbance-behind_the_scenes-green_screen_clip.avif',
			1080,
			608,
			'ART 300 — Disturbance, green screen',
		),
		photo(
			'2014-04-10_art_300-project_3-disturbance-stillframe_of_character_walking_in_hand_drawn_scene.avif',
			1920,
			1080,
			'ART 300 — Disturbance, finished shot',
		),
		photo(
			'2014-04-10_art_300-project_3-finished_vfx_shot_1.avif',
			480,
			270,
			'ART 300 — Disturbance, finished VFX',
		),
		photo(
			'2014-04-10_art_300-project_3-finished_vfx_shot_2.avif',
			480,
			270,
			'ART 300 — Disturbance, finished VFX',
		),
		photo(
			'2014-04-10_art_300-project_3-finished_vfx_shot_3.avif',
			480,
			270,
			'ART 300 — Disturbance, finished VFX',
		),
		photo('2014-05-03_brian_filming_news_anchor.jpg', 960, 720, 'Filming a news anchor'),
		photo(
			'2014-05-08_video_shoot_behind_the_scenes-green_screen_shoot_at_dorm.avif',
			2048,
			1536,
			'Green screen shoot at the dorm',
		),
		photo(
			'2014-05-15_art_300_final_project-glimpse-zach_laying_on_ground_green_screen_visual_effect.avif',
			480,
			270,
			'ART 300 final — Glimpse',
		),
		photo(
			'2014-05-15_art_300_final_project-glimpse-zach_walking_through_virtual_scene_visual_effect.avif',
			480,
			270,
			'ART 300 final — Glimpse',
		),
		photo(
			'2014-05-15_art_300_final_project-power_trip-character_summons_toothbrush_visual_effect.avif',
			480,
			270,
			'ART 300 final — Power Trip',
		),
		photo(
			'2014-06-16_video_shoot_behind_the_scenes-green_screen_shoot_of_music_video_at_church.avif',
			2048,
			1536,
			'Green screen music video shoot at church',
		),
		photo('2014-09-24_med_465-one_up-film_snapshot_1.jpg', 1920, 1080, 'One Up'),
		photo(
			'2014-09-24_med_465-one_up-close_up_shots_on_two_guys_staring_eachother_down.avif',
			480,
			270,
			'One Up',
		),
		photo(
			'2014-09-24_med_465-one_up-quick_cuts_between_two_character_close_ups.avif',
			480,
			204,
			'One Up',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_01.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_02.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_03.avif',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_04.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_05.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_06.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_07.jpg',
			2048,
			1366,
			'One Up — on set',
		),
		photo(
			'2014-09-15_med_465-one_up-behind_the_scenes_set_photo_08.jpg',
			640,
			640,
			'One Up — on set',
		),
		photo(
			'2014-10-01_cinematography_class_film_shoot-behind_the_scenes_photo_1.avif',
			2048,
			1536,
			'Cinematography class shoot',
		),
		photo(
			'2014-10-01_cinematography_class_film_shoot-behind_the_scenes_photo_2.avif',
			2048,
			1536,
			'Cinematography class shoot',
		),
		photo(
			'2014-11-01_med_465_film_shoot-behind_the_scenes.avif',
			2048,
			1365,
			'MED 465 film shoot',
		),
		photo(
			'2015-04-12_split_life-sato_48-behind_the_scenes-group_meetup.avif',
			2048,
			1152,
			'Split Life — the 48-hour crew',
		),
		photo(
			'2015-04-12_split_life-sato_48-behind_the_scenes-group-planning_session_around_kitchen_table.avif',
			2048,
			1152,
			'Split Life — planning around the kitchen table',
		),
		photo(
			'2015-04-12_split_life-sato_48-behind_the_scenes-film_poster.jpg',
			1167,
			1803,
			'Split Life — poster',
		),
		photo(
			'2015-04-14_kats_film_project-behind_the_scenes_set_photo_1.avif',
			537,
			508,
			"On set for Kat's film",
		),
		photo(
			'2015-04-14_kats_film_project-behind_the_scenes_set_photo_2.avif',
			960,
			720,
			"On set for Kat's film",
		),
		photo(
			'2015-04-22_legacy-behind_the_scenes-fog_lighting_test_in_house.jpg',
			2048,
			1152,
			'Legacy — fog lighting test',
		),
		photo(
			'2015-05-15_missouri_state_university_graduation-brian_and_jordan_hold_diploma.avif',
			2048,
			1365,
			'Graduation day',
		),
		photo(
			'2015-05-15_missouri_state_university_graduation-brian_and_jordan_selfie.avif',
			1920,
			825,
			'Graduation day',
		),
	];

	// The finished frame first, then the rig that made it — the whole NODE
	// production in one slider, sitting where the still frame used to.
	const nodeImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-18_art_300_project-node-360_short_film_panorama_equirectangular.avif',
			width: 2048,
			height: 1024,
			caption: 'The stitched equirectangular panorama',
			alt: 'NODE — equirectangular panorama still',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_01-four_go_pro_mount.avif',
			width: 2048,
			height: 1536,
			caption: 'The rig — four GoPros on a toothpaste box',
			alt: 'NODE behind the scenes — the four-GoPro mount',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_03_four_gopro_mount_in_car.avif',
			width: 2048,
			height: 1536,
			caption: 'The rig riding in the car',
			alt: 'NODE behind the scenes — the four-GoPro mount in a car',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_04.avif',
			width: 2048,
			height: 1536,
			caption: 'On location',
			alt: 'NODE behind the scenes — on location',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_05-all_actors.avif',
			width: 2048,
			height: 1536,
			caption: 'The cast',
			alt: 'NODE behind the scenes — the whole cast',
		},
	];

	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2012-04-27_facebook_short_film-zolly_shot_of_main_character_falling_in_love.avif',
			width: 480,
			height: 270,
			caption: 'Facebook IRL — the dolly-zoom shot',
			alt: 'Facebook IRL — the dolly-zoom shot',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2012-04-27_facebook/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2012-04-27_facebook/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Facebook in Real Life (2012)',
			alt: 'Facebook in Real Life (2012)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-03-18_art_300_project-node-360_short_film_panorama_equirectangular.avif',
			width: 2048,
			height: 1024,
			caption: 'NODE — equirectangular panorama still',
			alt: 'NODE — equirectangular panorama still',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-05-12_pickvid_promo_video-demo_on_phone.avif',
			width: 480,
			height: 270,
			caption: 'PickVid demo on a phone',
			alt: 'PickVid demo on a phone',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2014-05-12_pickvid_promo_video-logo_animation.avif',
			width: 480,
			height: 270,
			caption: 'PickVid logo animation',
			alt: 'PickVid logo animation',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2014-05-12_pickvid_promo_video/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2014-05-12_pickvid_promo_video/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'PickVid (2014) — promo video / demo',
			alt: 'PickVid (2014) — promo video / demo',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording-main_menu.avif',
			width: 1080,
			height: 608,
			caption: 'Bear Bus Bash — main menu',
			alt: 'Bear Bus Bash — main menu',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording-gameplay_clip.avif',
			width: 1080,
			height: 608,
			caption: 'Bear Bus Bash — gameplay',
			alt: 'Bear Bus Bash — gameplay',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording-victory_results_page.avif',
			width: 1080,
			height: 608,
			caption: 'Bear Bus Bash — victory',
			alt: 'Bear Bus Bash — victory',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Bear Bus Bash (2013) — full gameplay recording',
			alt: 'Bear Bus Bash (2013) — full gameplay recording',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48-film_snapshot_1.avif',
			width: 2048,
			height: 873,
			caption: 'Split Life — perspective A',
			alt: 'Split Life — perspective A',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48-film_snapshot_2.avif',
			width: 2048,
			height: 873,
			caption: 'Split Life — perspective B',
			alt: 'Split Life — perspective B',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48/poster.jpg',
			width: 2534,
			height: 1080,
			caption: 'Split Life (2015) — 48-hour dual-perspective oner',
			alt: 'Split Life (2015) — 48-hour dual-perspective oner',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2014-05-15_katie_bauers_breakup/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2014-05-15_katie_bauers_breakup/poster.jpg',
			width: 1920,
			height: 1080,
			caption: "Katie Bauer's Breakup (2014)",
			alt: "Katie Bauer's Breakup (2014)",
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2014-09-24_med_465-one_up/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2014-09-24_med_465-one_up/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'One Up (2014)',
			alt: 'One Up (2014)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2014-09-02_nice_to_meet_you/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2014-09-02_nice_to_meet_you/poster.jpg',
			width: 1920,
			height: 818,
			caption: 'Nice to Meet You (2014)',
			alt: 'Nice to Meet You (2014)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2015-04-22_legacy/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2015-04-22_legacy/poster.jpg',
			width: 1920,
			height: 818,
			caption: 'Legacy (2015)',
			alt: 'Legacy (2015)',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="college" year="2012" label="College" theme="college">
	<div class="container">
		<Reveal>
			<YearMark year="2012" subtitle="Missouri State · Electronic Arts" color="#7a4dff" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="intro">
					<!-- No kicker: the year mark immediately above already reads
					     "Missouri State · Electronic Arts". -->
					<h2 class="title">
						Four years of <span class="grad">"go make something."</span>
					</h2>
					<p class="lede">
						I majored in <strong>Electronic Arts</strong>
						— a multidisciplinary major covering video production, audio production, animation,
						and interactive design — with a minor in
						<strong>Computer Science.</strong>
						Pretty much the perfect match for a kid who'd been combining all of those things
						in his basement since he was eleven.
					</p>
				</div>
			</Reveal>
		</div>

		<div class="fb-block">
			<Reveal>
				<div class="fb-grid">
					<div>
						<h3 class="sub">Facebook in Real Life (2012)</h3>
						<p>
							A short film I made to try a face-tracked graphics technique: what if
							Facebook was real life? A character starts college; everyone around him has
							a floating Facebook status above their head; people speak in social-media
							tone, "like" each other's comments out loud, etc.
						</p>
						<p>
							The shoot was an excuse to learn face tracking and HUD compositing. The
							script was an excuse for the shoot.
						</p>
						<PlayFilm
							title="Facebook in Real Life (2012)"
							meta="2012"
							color="#7a4dff"
							onclick={(e) => gallery?.open(1, e.currentTarget)} />
					</div>
					<div class="fb-card">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2012-04-27_facebook_short_film-zolly_shot_of_main_character_falling_in_love.avif"
							alt="Facebook IRL — the dolly-zoom shot"
							ratio="16 / 9"
							onclick={(e) => gallery?.open(0, e.currentTarget)} />
					</div>
				</div>
			</Reveal>
		</div>

		<div class="node-block">
			<Reveal>
				<div class="node-head">
					<span class="lab-tag">EXPERIMENTAL</span>
					<h3 class="sub">NODE — a 360° short film, in 2014</h3>
					<p>
						"Make something cool and impressive," our ART 300 professor said. So my group
						made a
						<strong>360-degree panoramic short film.</strong>
						In 2014. When you couldn't buy a 360 camera, when YouTube didn't support 360 video,
						when "360 rig" wasn't a thing you could rent.
					</p>
				</div>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="node-rig">
					<div class="rig-info">
						<div class="rig-eyebrow">THE RIG</div>
						<ol class="rig-steps">
							<li>Strap four GoPros to a square toothpaste box on a light stand.</li>
							<li>
								Box happens to be the perfect dimensions for 90° horizontal FOV per
								camera.
							</li>
							<li>
								Start all four cameras. Clap loudly. Use the audio waveform to sync them
								all.
							</li>
							<li>
								Act it out. The character moves through the space; the audience can look
								anywhere.
							</li>
							<li>
								Export each angle to PNG sequences. Photoshop's batch panorama-stitch each
								frame.
							</li>
							<li>
								Build a custom WebGL viewer (three.js) where a video plays on the inside
								of a 3D sphere.
							</li>
						</ol>
					</div>
					<div class="node-gallery">
						<Gallery
							items={nodeImages}
							display="slider"
							aspect_ratio="16 / 10"
							radius="2"
							meta_display_fullscreen="always" />
					</div>
				</div>
			</Reveal>

			<Reveal variant="up" delay={150}>
				<div class="node-viewer">
					<ArchiveFrame
						src="https://cdn.brianschwabauer.com/site/node/index.html"
						host="brianschwabauer.com/node"
						title="NODE — the WebGL 360 player I built (2014)"
						ratio="16 / 10"
						label="Try the original 360 viewer" />
				</div>
			</Reveal>

			<!-- How the viewer actually steers the audience. -->
			<Reveal>
				<div class="closing">
					<p>
						A 360 video is only half the problem. You also have to <em>guide</em>
						the viewer. At certain timecodes I disable the keyboard, smoothly animate the camera
						to a target azimuth + FOV (with easing), then release control back to the user.
						I also added a CSS letterbox overlay to force a 2.35 aspect ratio across the whole
						webpage — surprisingly fiddly in 2014.
					</p>
				</div>
			</Reveal>
		</div>

		<!-- The two side projects — a game and an app, not films — get matching
		     app cards, stacked and held to the same contained width. -->
		<Reveal>
			<div class="side-projects">
				<article class="app-card bear-bus">
					<h3 class="sub">Bear Bus Bash — my first "finished" game</h3>
					<p>
						A Flash bus-driving game where you pick up MSU campus bus passengers, collect
						coins, and dodge other cars. There are levels for each real MSU campus route,
						three drivers with different stats, and a real scoring + achievements system.
						A teammate hand-drew all the art. I did the programming, animation, and most
						of the motion graphics.
					</p>
					<p>
						Flash couldn't really do 3D in 2013, so I faked depth with scaled 2D sprites
						and crossfade swaps of the bus model from different angles. Clunky, but
						believable.
					</p>
					<PlayFilm
						label="Play the gameplay"
						title="Bear Bus Bash (2013) — full gameplay recording"
						meta="2013 · full run"
						color="#7a4dff"
						onclick={(e) => gallery?.open(9, e.currentTarget)} />
					<div class="bb-grid">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording-main_menu.avif"
							alt="Bear Bus Bash — main menu"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(6, e.currentTarget)} />
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2013-12-02_bear_bus_bash_flash_game_screen_recording-gameplay_clip.avif"
							alt="Bear Bus Bash — gameplay"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(7, e.currentTarget)} />
					</div>
				</article>

				<article class="app-card pickvid">
					<div class="pickvid-grid">
						<div>
							<h3 class="sub">PickVid (2014) — a tiny social app</h3>
							<p>
								Another group project in the same class. Idea: a group of friends
								downloads the app and gets a prompt ("take a sad selfie", "take a picture
								of something funny"). Everyone uploads their photo to a shared S3 bucket.
								The app stitches all the photos into a single hollywood-style movie
								trailer with intense music and explosions — your friends as the cast. We
								shipped a working prototype.
							</p>
							<PlayFilm
								label="Play the promo"
								title="PickVid (2014) — promo video / demo"
								meta="2014"
								color="#7a4dff"
								onclick={(e) => gallery?.open(5, e.currentTarget)} />
						</div>
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2014-05-12_pickvid_promo_video-demo_on_phone.avif"
							alt="PickVid demo on a phone"
							ratio="9 / 16"
							onclick={(e) => gallery?.open(3, e.currentTarget)} />
					</div>
				</article>
			</div>
		</Reveal>

		<!-- Split Life borrows the film's own grammar: the synopsis plays as two
		     screens on a hard seam, the 2.35:1 frame runs full bleed, and the
		     production notes are set as the cue sheet that ran the shoot. -->
		<div class="split-life">
			<Reveal>
				<div class="split-head">
					<h3 class="sub">Split Life — a 48-hour film, in stereo (2015)</h3>
					<p>
						<strong>SATO 48</strong>
						is the region's 48-hour film race: you're handed a genre, a prop, and a line of
						dialogue at kickoff, then get 48 sleepless hours to write, shoot, score, and cut
						a finished short. I wanted to do something nobody had done before. So I made
						<strong>
							a film shot as two unbroken takes, shown side-by-side in real time.
						</strong>
					</p>
				</div>
			</Reveal>

			<!-- The synopsis staged the way the film is: both screens at once. -->
			<Reveal variant="up" delay={100}>
				<div class="screens">
					<article class="screen">
						<div class="screen-label">PERSPECTIVE A</div>
						<p>The protagonist leaves her house. Later, she comes back.</p>
					</article>
					<article class="screen">
						<div class="screen-label">PERSPECTIVE B</div>
						<p>A man hidden outside breaks in while she's gone.</p>
					</article>
					<p class="convergence">They turn out to know each other. It ends.</p>
				</div>
			</Reveal>

			<!-- No stills: the poster already IS the split screen, so a pair of
			     stillframes above it only said the same thing twice. -->
			<Reveal variant="up" delay={150}>
				<div class="film-strip">
					<Video
						src="https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48/master.m3u8"
						poster="https://cdn.brianschwabauer.com/media/2015-04-12_split_life-sato_48/poster.jpg"
						title="Split Life (2015) — 48-hour dual-perspective oner"
						aspect_ratio="2534 / 1080"
						preload="none" />
				</div>
			</Reveal>

			<Reveal variant="up">
				<div class="cue-sheet">
					<div class="strip-eyebrow">THE CUE SHEET — HOW TWO ONERS STAYED IN SYNC</div>
					<div class="cue-row">
						<div class="cue-key">SYNC</div>
						<div class="cue-body">
							<p>
								To make the two shots line up frame-perfect over multiple minutes, I built
								a master spreadsheet of every event in the film with exact timecodes —
								then recorded my own voice giving every cue at those exact timecodes:
							</p>
							<p class="cue-call">"3, 2, 1, open the door"</p>
							<p>
								…and blasted that audio through the house during filming, so every actor
								and operator knew exactly what should be happening at every moment.
							</p>
						</div>
					</div>
					<div class="cue-row">
						<div class="cue-key">SET</div>
						<div class="cue-body">
							<p>
								The actors had to be at exact locations at exact times — plus a handful of
								hidden cuts I knew I'd have to fix later.
							</p>
						</div>
					</div>
					<div class="cue-row">
						<div class="cue-key">POST</div>
						<div class="cue-body">
							<p>
								The hidden cuts fixed in VFX. The score written myself, late at night, on
								the deadline. Every trace of the cue audio replaced.
							</p>
						</div>
					</div>
				</div>
			</Reveal>

			<Reveal>
				<p class="split-close">
					The story is okay. The lighting is okay. The script is okay. But I did the thing
					I set out to do, which was: <em>invent a new kind of edit.</em>
					I'm still proud of that.
				</p>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="strip">
				<div class="strip-eyebrow bleed-head">
					A WHIRLWIND OF CLASS PROJECTS — THE CAMERA ROLL
				</div>
				<div class="gallery-bleed">
					<PeekGallery
						key="college-camera-roll"
						items={CAMERA_ROLL}
						peek={18}
						display="masonry"
						size="0" />
				</div>
			</div>
		</Reveal>

		<!-- The other films from these years. -->
		<div class="more-projects">
			<Reveal>
				<h3 class="sub-small">Other films from these years:</h3>
			</Reveal>

			<Reveal variant="up" delay={80}>
				<div class="film-quad">
					<article class="film-quad-card">
						<h4>
							Katie Bauer's Breakup <span class="film-year">2014</span>
						</h4>
						<p>
							Directing-class group film. I script-supervised, edited, and did the VFX.
							The character realizes she's inside a film and tries to escape it; boom mic
							crashes the frame on purpose.
						</p>
						<Video
							src="https://cdn.brianschwabauer.com/media/2014-05-15_katie_bauers_breakup/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2014-05-15_katie_bauers_breakup/poster.jpg"
							title="Katie Bauer's Breakup (2014)"
							aspect_ratio="16 / 9"
							preload="none" />
					</article>
					<article class="film-quad-card">
						<h4>
							One Up <span class="film-year">2014</span>
						</h4>
						<p>
							Cinematography-class short. Two guys try to one-up each other to land the
							same job. Real lighting setups, real coverage.
						</p>
						<Video
							src="https://cdn.brianschwabauer.com/media/2014-09-24_med_465-one_up/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2014-09-24_med_465-one_up/poster.jpg"
							title="One Up (2014)"
							aspect_ratio="16 / 9"
							preload="none" />
					</article>
					<article class="film-quad-card">
						<h4>
							Nice to Meet You <span class="film-year">2014</span>
						</h4>
						<p>
							The senior-thesis tech rehearsal: Canon RAW on a 5D mkIII with Magic Lantern
							firmware. A guy chats up a girl on a park bench, not realizing she's on the
							phone — and her half of the call happens to answer him perfectly. The title
							is the punchline.
						</p>
						<Video
							src="https://cdn.brianschwabauer.com/media/2014-09-02_nice_to_meet_you/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2014-09-02_nice_to_meet_you/poster.jpg"
							title="Nice to Meet You (2014)"
							aspect_ratio="1920 / 818"
							preload="none" />
					</article>
					<article class="film-quad-card">
						<h4>
							Legacy <span class="film-year">2015</span>
						</h4>
						<p>
							A quiet 2-character short for my directing class. A husband obsessed with
							his career, a wife who wants him home. Conversation as conflict.
						</p>
						<Video
							src="https://cdn.brianschwabauer.com/media/2015-04-22_legacy/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2015-04-22_legacy/poster.jpg"
							title="Legacy (2015)"
							aspect_ratio="1920 / 818"
							preload="none" />
					</article>
				</div>
			</Reveal>
		</div>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="college"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	/* The violet was there already but only as a 10%-opacity hint over black. It
	   is now the actual colour of the room. */
	:global([data-theme='college']) {
		background:
			radial-gradient(
				ellipse 115% 70% at 50% 0%,
				oklch(0.38 0.13 292 / 0.5),
				transparent 62%
			),
			linear-gradient(
				180deg,
				oklch(0.19 0.075 288),
				oklch(0.245 0.1 285) 50%,
				oklch(0.155 0.07 292)
			);
		color: #ece8ff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;

		/* #7a4dff is the section's violet, but at ~L 0.54 it only manages about
		   2.4:1 against the room's dark ground — fine as a surface (.lab-tag),
		   too dim as ink. Text derives lifted tints from it instead: labels get
		   the most light (they're small), inline strongs a bit less so they
		   still read as saturated emphasis. */
		--violet-label: oklch(from #7a4dff 0.78 calc(c * 0.72) h);
		--violet-strong: oklch(from #7a4dff 0.7 calc(c * 0.88) h);
	}
	.lockup {
		margin-bottom: 4rem;
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.grad {
		color: oklch(from #ff5fb3 0.82 calc(c * 0.9) h);
		/* The quotation is a unit — it starts its own line rather than being
		   broken across one wherever it happens to run out of room. */
		display: block;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}
	.lede strong {
		color: var(--violet-strong);
	}
	/* Title and lede side by side rather than stacked — the third section in a
	   row to open with the same left-column block starts to read as a template
	   rather than as a chapter. */
	.intro {
		display: grid;
		gap: 1.25rem clamp(2rem, 5vw, 4.5rem);
	}
	@media (min-width: 900px) {
		.intro {
			/*
			 * Set smaller in the split layout than it would be full-bleed, because
			 * the heading has a column rather than the page to run in. At 5rem the
			 * quotation was 782px against a 612px column, so it broke as `…of "go /
			 * make / something."` — a one-word line in the middle of a heading.
			 * 3.75rem lands it at ~597px: two lines, the lead-in and then the quote
			 * whole. Held in a variable because the optical alignment below needs
			 * to know it.
			 */
			--title-fs: clamp(2.2rem, 4.2vw, 3.75rem);

			grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
			align-items: start;
		}
		.title {
			font-size: var(--title-fs);
		}
		/*
		 * Line the two columns up by their *ink*, not their boxes. Equal box tops
		 * leave them 11px apart: Merriweather's natural line box is 1.257em, so a
		 * heading at line-height 1 has negative half-leading and its caps start
		 * ~0.133em above the box, while the copy at 1.6 starts ~0.156em below its
		 * own. Take the difference off the copy — expressed in ems of each side's
		 * type, so it holds as both clamps move.
		 */
		.lede {
			margin-top: calc(-0.133 * var(--title-fs) - 0.156em);
		}
	}

	.strip {
		margin: 4rem 0;
	}
	.strip-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: var(--violet-label);
		margin-bottom: 0.8rem;
	}

	.fb-block,
	.node-block,
	.more-projects {
		margin: 5rem 0;
	}
	.side-projects {
		margin: 5rem auto;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.7rem;
	}
	.sub-small {
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0 0 1rem;
		opacity: 0.9;
	}

	.fb-grid {
		display: grid;
		grid-template-columns: 1fr 1.2fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.fb-grid {
			grid-template-columns: 1fr;
		}
	}
	.fb-grid p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}
	.fb-card {
		position: relative;
	}

	/* Above the title, not beside it: it labels the whole project, so it reads
	   as a kicker rather than as another word in the headline. */
	.lab-tag {
		display: inline-block;
		margin-bottom: 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		padding: 0.15rem 0.55rem;
		border-radius: 4px;
		background: #7a4dff;
		color: #fff;
		font-weight: 800;
	}
	.node-head {
		max-width: 56rem;
	}
	.node-head p {
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.node-head strong {
		color: var(--violet-strong);
	}
	.node-rig {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 2rem 0;
	}
	@media (max-width: 768px) {
		.node-rig {
			grid-template-columns: 1fr;
		}
	}
	.rig-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: var(--violet-label);
		margin-bottom: 0.6rem;
	}
	.rig-steps {
		padding-left: 1.2rem;
		line-height: 1.65;
	}
	.rig-steps li {
		margin-bottom: 0.4rem;
	}
	/* A grid item's default `min-width: auto` lets the carousel's own content
	   set the column's floor and push the layout wider than its track. */
	.node-gallery {
		min-width: 0;
		/* The slider's inline controls are absolutely positioned at `top: 100%`,
		   so they hang below the gallery box without adding to its height and
		   would otherwise land on top of whatever follows. Reserve their row —
		   3.5rem is the height the component gives them. */
		padding-bottom: 3.5rem;
	}
	.node-viewer {
		margin: 2rem 0;
	}

	/* The two side-project app cards, stacked at one shared width — contained
	   like the old PickVid card rather than stretched to the page. */
	.side-projects {
		display: grid;
		gap: clamp(1.25rem, 3vw, 2rem);
		max-width: 52rem;
	}
	/* Same surface as the film-quad cards. */
	.app-card {
		padding: clamp(1.4rem, 3vw, 2.25rem);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(122, 77, 255, 0.2);
		border-radius: 12px;
		container-type: inline-size;
	}
	.app-card p {
		line-height: 1.6;
		max-width: 36rem;
		margin-bottom: 1rem;
	}

	.bb-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.8rem;
		margin-top: 1.5rem;
	}

	/* Copy left, phone right — the phone column stays phone-sized, scaling with
	   the card (cqw) rather than the viewport. */
	.pickvid-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) clamp(130px, 36cqw, 190px);
		gap: clamp(1.25rem, 5cqw, 2rem);
		align-items: center;
	}
	/* Too narrow for two columns: stack, phone centered under the copy. */
	@container (max-width: 420px) {
		.pickvid-grid {
			grid-template-columns: 1fr;
		}
		.pickvid-grid > :global(:last-child) {
			max-width: 200px;
			margin-inline: auto;
		}
	}

	.split-life {
		margin: 8rem 0 10rem;
	}
	.split-head {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		padding-inline: clamp(1rem, 3vw, 2rem);
		box-sizing: border-box;
		h3 {
			max-width: 56rem;
		}
		p {
			line-height: 1.65;
			max-width: 56rem;
		}
	}

	/* The synopsis staged the way the film plays: two screens running at the
	   same time, divided by the seam, breaking out to the full viewport (same
	   breakout as .gallery-bleed) like a frame of the film itself. */
	.screens {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		padding-inline: clamp(1rem, 3vw, 2rem);
		box-sizing: border-box;
		margin-top: 2rem;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.screen {
		background: oklch(0.14 0.05 290 / 0.6);
		padding: clamp(1.5rem, 3.5vw, 2.75rem) clamp(1.25rem, 4vw, 3.5rem);
		display: grid;
		gap: 0.7rem;
		align-content: center;
		justify-items: center;
		text-align: center;
		min-height: clamp(8rem, 15vw, 12rem);
	}
	/* The seam. */
	.screen + .screen {
		border-left: 2px solid oklch(0.92 0.02 290 / 0.4);
	}
	.screen-label {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.3em;
		color: var(--violet-label);
	}
	.screen p {
		font-size: clamp(1.02rem, 1.5vw, 1.2rem);
		line-height: 1.55;
		max-width: 38rem;
		margin: 0;
	}
	.convergence {
		grid-column: 1 / -1;
		text-align: center;
		margin-top: 1.1rem;
		font-style: italic;
		opacity: 0.85;
	}

	/* The 2.35:1 frame gets the whole viewport — it's the section's hero. */
	.film-strip {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		padding-inline: clamp(1rem, 3vw, 2rem);
		box-sizing: border-box;
		margin-top: 2.5rem;
	}

	/* The production notes set as the document that ran the shoot: a ruled
	   sheet with a mono key gutter, not another run of plain paragraphs. */
	.cue-sheet {
		max-width: 56rem;
		margin: 3.5rem auto 0;
		padding: 0.5rem 1.5rem;
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.18);
	}
	.cue-sheet .strip-eyebrow {
		padding-top: 0.8rem;
	}
	.cue-row {
		display: grid;
		grid-template-columns: 6rem minmax(0, 1fr);
		gap: 1.5rem;
		padding-block: 1.1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	.cue-key {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.25em;
		color: var(--violet-label);
		font-weight: 700;
		padding-top: 0.35em;
	}
	.cue-body p {
		line-height: 1.6;
		margin: 0;
		max-width: 44rem;
	}
	.cue-body p + p {
		margin-top: 0.6rem;
	}
	/* The one cue everyone on set actually heard, at the size it was heard. */
	.cue-body .cue-call {
		font-family: var(--font-mono);
		font-size: clamp(1.15rem, 2vw, 1.5rem);
		font-weight: 700;
		color: #ff5fb3;
		border-left: 3px solid #ff5fb3;
		padding-left: 0.9rem;
		margin-block: 0.9rem;
	}

	.split-close {
		max-width: 40rem;
		margin: 5rem auto 0;
		text-align: center;
		font-size: clamp(1.05rem, 2vw, 1.5rem);
		line-height: 1.7;
	}
	.split-close em {
		color: #ff5fb3;
	}

	@media (max-width: 700px) {
		.screens {
			grid-template-columns: minmax(0, 1fr);
		}
		/* Stacked, the seam turns horizontal. */
		.screen + .screen {
			border-left: none;
			border-top: 2px solid oklch(0.92 0.02 290 / 0.4);
		}
		.cue-row {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.4rem;
		}
	}

	.film-quad {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin: 1.5rem 0 2.5rem;
	}
	@media (max-width: 768px) {
		.film-quad {
			grid-template-columns: 1fr;
		}
	}
	.film-quad-card {
		padding: 1.4rem;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(122, 77, 255, 0.2);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.film-quad-card h4 {
		font-size: 1.15rem;
		font-weight: 800;
		margin: 0;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.film-year {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		color: var(--violet-label);
		font-weight: 700;
	}
	.film-quad-card p {
		font-size: 0.92rem;
		line-height: 1.5;
		opacity: 0.85;
		margin: 0 0 0.4rem;
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
		color: #ff5fb3;
		font-style: italic;
	}
</style>
