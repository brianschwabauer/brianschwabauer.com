<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { Comparison } from '@delightstack/components/display';
	import PinScrub from '../primitives/PinScrub.svelte';
	import PinDrift from '../primitives/PinDrift.svelte';
	import ScrubVideo from '../primitives/ScrubVideo.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	// The whole Calamity shot list — the VFX frames first, then the behind-the-
	// scenes shots of how the city was built and lit. They used to sit outside the
	// gallery as a separate pair; they belong to the same set of pictures.
	const calamityImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-monster_fight_scene_with_army.avif',
			width: 854,
			height: 480,
			caption: 'The army takes on the clay monster',
			alt: 'Lego soldiers firing on the clay monster in the city street',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-airplane_fly_through_clouds.avif',
			width: 480,
			height: 320,
			caption: 'Composited clouds for the flyover',
			alt: 'A lego plane flying through composited clouds',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-airplane_fly_through_city_first_person.avif',
			width: 480,
			height: 320,
			caption: 'The flyover from the cockpit',
			alt: 'First-person view from a lego plane flying through the city',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-airplane_fly_through_city_third_person.avif',
			width: 480,
			height: 320,
			caption: 'The same pass, from outside',
			alt: 'Third-person view of a lego plane flying through the city',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-animated_radar_screen_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'An animated radar screen, drawn in After Effects',
			alt: 'An animated radar screen visual effect',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-dialog_scene_with_animated_mouths.avif',
			width: 480,
			height: 320,
			caption: 'Mouths animated on, frame by frame',
			alt: 'A dialog scene with mouths animated onto the lego faces',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-explosions.avif',
			width: 480,
			height: 320,
			caption: 'Explosions painted in behind the roto',
			alt: 'Explosions composited into the lego city',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-monster_blown_up.avif',
			width: 480,
			height: 320,
			caption: 'The monster finally goes up',
			alt: 'The clay monster blown up in a fireball',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-behind_the_scenes-filming_lego_city_with_ladder_and_light.jpg',
			width: 720,
			height: 480,
			caption: 'Behind the scenes — filming the city from a ladder',
			alt: 'Filming the lego city from a ladder',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-behind_the_scenes_timelapse_of_building_lego_buildings.avif',
			width: 480,
			height: 320,
			caption: 'Behind the scenes — building the city, in timelapse',
			alt: 'Timelapse of building the lego city',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-lego_plan_with_green_screen_background.avif',
			width: 720,
			height: 480,
			caption: 'Behind the scenes — some shots used greenscreen instead of roto',
			alt: 'A lego scene set up in front of a greenscreen',
		},
	];

	const exposureImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-camera_robot_chases_kevin.avif',
			width: 480,
			height: 270,
			caption: 'The robot runs Kevin down',
			alt: 'The camera robot chasing Kevin down a street',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-camera_robot_overheats_and_transforms_back_to_a_camera.avif',
			width: 480,
			height: 270,
			caption: 'Overexposed — it overheats and folds back into a camera',
			alt: 'The camera robot overheating and transforming back into a camera',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-camera_robot_scans_house_in_3d.avif',
			width: 480,
			height: 270,
			caption: 'Scanning the house in 3D',
			alt: 'The camera robot scanning a house, rendered as a 3D wireframe',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-camera_robot_shoots_tape_with_3d_effect.avif',
			width: 480,
			height: 270,
			caption: 'Bullet-time — a DV tape modeled in 3D, fired in slow motion',
			alt: 'The camera robot firing a DV tape with a 3D bullet-time effect',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-first_person_camera_robot_chase.avif',
			width: 480,
			height: 270,
			caption: 'The chase from the robot’s own POV',
			alt: 'First-person view of the camera robot chasing the actors',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-3d_camera_model_wireframe.avif',
			width: 2048,
			height: 1365,
			caption: 'The camera, modeled from scratch — wireframe',
			alt: 'Wireframe of the 3D camera model',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-behind_the_scenes-brian_controls_rc_car_with_camera_mounted_for_robot_pov_shot.avif',
			width: 480,
			height: 320,
			caption: 'Behind the scenes — a camera strapped to an RC car for the POV shots',
			alt: 'Brian driving an RC car with a camera mounted on it',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-behind_the_scenes-brian_films_scene_of_actors.avif',
			width: 480,
			height: 320,
			caption: 'Behind the scenes — shooting the actors',
			alt: 'Brian filming a scene with the actors',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-behind_the_scenes-brian_runs_backwards_with_camera_filming.avif',
			width: 480,
			height: 320,
			caption: 'Behind the scenes — running backwards, filming the chase',
			alt: 'Brian running backwards while filming the chase',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure-behind_the_scenes-wes_dumps_water_on_himself_for_rainy_scene.avif',
			width: 480,
			height: 320,
			caption: 'Behind the scenes — no rain, so Wes dumped water on himself',
			alt: 'Wes pouring water over himself to fake rain',
		},
	];

	// Standalone clickable LazyMedias + inline video posters in document order:
	// 0: Calamity walk-cycle lead image
	// 1: Calamity video
	// 2: Exposure video
	// 3: iPrez set jib shot LazyMedia
	// 4: iPrez video
	// 5: XYZ News Special Report
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-main_character_stop_motion_walk_cycle.avif',
			width: 854,
			height: 480,
			caption: 'Our lead, walking — one frame at a time',
			alt: 'The main character’s stop-motion walk cycle',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Calamity (2009) — full stop-motion short',
			alt: 'Calamity (2009) — full stop-motion short',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2011-03-01_exposure/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'Exposure (2011) — the camera-robot short',
			alt: 'Exposure (2011) — the camera-robot short',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez-camera_jib_shot_of_studio.avif',
			width: 480,
			height: 270,
			caption: 'The 3D newsroom set, on a jib move',
			alt: 'iPrez 3D set jib shot',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'XYZ News — iPrez (2011)',
			alt: 'XYZ News — iPrez (2011)',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2011-03-18_xyz_news_special_report/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-03-18_xyz_news_special_report/poster.jpg',
			width: 1920,
			height: 1080,
			caption: 'XYZ News Special Report (2011)',
			alt: 'XYZ News Special Report (2011)',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="animation" year="2010" label="Animation & VFX" theme="vfx">
	<div class="container">
		<Reveal>
			<!-- The one year that earns the misregistration: this is the compositing
			     and VFX chapter, so the numerals arrive out of register and line up
			     as the year fills. -->
			<YearMark
				year="2010"
				subtitle="Animation & Special Effects"
				color="#6c63ff"
				treatment="fringe" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<h2 class="title">
					Software gives you
					<br />
					<span class="grad">superpowers.</span>
				</h2>
				<p class="lede">
					Gone were the days of PowerPoint exports keyed onto live footage. By 2009 I was
					deep into After Effects and learning Cinema 4D / 3ds Max. The software let me
					build the things I could only dream of three years earlier. The "I can put
					anything on screen" feeling didn't go away. It still hasn't.
				</p>
			</Reveal>
		</div>

		<div class="calamity">
			<div class="cal-grid">
				<Reveal>
					<h3 class="sub">
						<span class="brick-tag">LEGO</span>
						Calamity
					</h3>
					<p>
						<strong>Calamity</strong>
						is a stop-motion short about a town of lego men attacked by a clay monster. We built
						a city on the floor of my basement, set a ladder over the whole thing so we could
						lay across it without getting in shot, and moved each lego one frame at a time.
					</p>
					<p>
						Then in After Effects, I painstakingly rotoscoped every character so I could
						replace the city behind them — explosions, fireballs, animated mouths, smoke,
						planes flying through the clouds. Every second has 3–4 VFX layers. It took an
						obscene amount of time.
					</p>
					<PlayFilm
						label="Play the short"
						title="Calamity (2009) — full stop-motion short"
						meta="2009 · stop-motion"
						color="#6c63ff"
						onclick={(e) => gallery?.open(1, e.currentTarget)} />
				</Reveal>
				<Reveal variant="right" delay={120}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2009-12-25_calamity-main_character_stop_motion_walk_cycle.avif"
						alt="The main character’s stop-motion walk cycle"
						ratio="16 / 9"
						caption="Our lead, walking — one frame at a time"
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="storyboard">
					<div class="story-eyebrow bleed-head">FROM THE SHOT LIST</div>
					<div class="gallery-bleed">
						<LightboxGallery
							key="animation-calamity"
							items={calamityImages}
							display="masonry"
							size="2" />
					</div>
				</div>
			</Reveal>
		</div>

		<div class="exposure">
			<!-- The copy holds still on the left while the robot unfolds beside it:
			     the text is what the scrub is *about*, so it should stay readable for
			     the whole two-and-a-half screens the transformation takes. Below
			     1024px there's no room for two columns — the copy scrolls away
			     normally and the robot takes the full width underneath. -->
			<div class="exposure-stage">
				<div class="exposure-head">
					<div class="head-sticky">
						<Reveal>
							<h3 class="sub robot">
								<span class="bracket">[</span>
								EXPOSURE
								<span class="bracket">]</span>
							</h3>
							<p>
								My most ambitious VFX project. A camera struck by lightning "comes alive",
								transforms into a Transformers-style robot, and chases a group of friends.
								They eventually defeat it by overexposing it — they shine all their lights
								directly at it and it overheats.
							</p>
							<p>
								Over <strong>250 hours</strong>
								went into the post-production. I modeled the camera robot from scratch in 3D,
								animated the transformation, tracked it to live footage, integrated lighting,
								added smoke.
							</p>
							<p>
								We wanted to shoot in rain at night, but couldn't wait for the weather, so
								we filmed outside during the day and dunked the actors in water. The
								ground got soaked from a hose. I did day-to-night color conversion in
								post. It almost works.
							</p>
							<p>
								For the robot's POV shots, I built a camera mount that strapped to an RC
								car. We drove it during the chase scene so it could get the low, weaving
								angle that a human couldn't.
							</p>
							<p>
								The "bullet-time" shot where the camera-robot shoots a DV tape at the
								protagonist is a complete 3D recreation of the tape, animated in slow-mo
								past the camera. Looking back at it, I'm still genuinely proud of that
								one.
							</p>
							<PlayFilm
								label="Play the short"
								title="Exposure (2011) — the camera-robot short"
								meta="2011"
								color="#6c63ff"
								onclick={(e) => gallery?.open(2, e.currentTarget)} />
						</Reveal>
					</div>
				</div>

				<div class="transformer-stage">
					<PinScrub height="280vh">
						{#snippet children({ progress, scrolled })}
							<!-- The short is called Exposure and it is defeated by overexposing it,
						     so the gauge is an aperture ring: the standard engraved stops, in
						     order, cycling forever the way a real ring does. Only marks a lens
						     actually carries — a made-up f/13.5 would read as a number line
						     dressed up as a lens. -->
							{@const F_STOPS = [
								'1.2',
								'1.4',
								'2',
								'2.8',
								'4',
								'5.6',
								'8',
								'11',
								'16',
								'22',
							]}
							<!-- The ring climbs at exactly the scroll's rate. The transform
						     itself is scrubbed, not scrolled, so without it the page reads as
						     frozen for the best part of two screens while the robot unfolds.
						     Left only — the year scrubber owns the right edge.

						     Two minor ticks split each stop into thirds, the way the detents
						     between engraved stops actually fall. They also carry most of the
						     motion: three times the moving edges of the numbers alone. -->
							{#snippet rung({ k }: { k: number })}
								<i class="tick major"></i>
								<span class="stop">
									f/{F_STOPS[k % F_STOPS.length]}
								</span>
								{#each [30, 60] as offset (offset)}
									<i class="tick" style:top="{offset}px"></i>
								{/each}
							{/snippet}
							<div class="gauge"><PinDrift {scrolled} period={90} mark={rung} /></div>

							<ScrubVideo
								src="https://cdn.brianschwabauer.com/media/2011-03-01_exposure-animated_on_transparent_background_camera_robot_transforms_from_camera_to_robot.webm"
								reverseSrc="https://cdn.brianschwabauer.com/media/2011-03-01_exposure-animated_on_transparent_background_camera_robot_transforms_from_camera_to_robot-reverse.webm"
								{progress}
								ariaLabel="Camera transforming into a robot, scrubbed by scroll"
								class="transformer-video" />
						{/snippet}
					</PinScrub>
				</div>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="exposure-grid">
					<div class="gallery-bleed">
						<PeekGallery
							key="animation-exposure"
							items={exposureImages}
							peek={6}
							size="2" />
					</div>
				</div>
			</Reveal>
		</div>

		<div class="iprez">
			<div class="iprez-grid">
				<Reveal>
					<h3 class="sub">XYZ News &middot; iPrez</h3>
					<p>
						The XYZ News bit, again — three years on. By 2011 our skills were
						"professional" enough that I think we could've published this against The
						Onion at the time. A 3D virtual newsroom set with actual jib-style camera
						moves. Proper greenscreen lighting. The whole thing centered around one fake
						story: a new iPhone app for the U.S. president that gives him unlimited power.
					</p>
					<p class="aside">
						This is, embarrassingly, still one of the funnier things I've ever made.
					</p>
					<PlayFilm
						title="XYZ News — iPrez (2011)"
						meta="2011"
						color="#6c63ff"
						onclick={(e) => gallery?.open(4, e.currentTarget)} />
				</Reveal>
				<Reveal variant="right" delay={100}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez-camera_jib_shot_of_studio.avif"
						alt="iPrez 3D set jib shot"
						ratio="16 / 9"
						caption="The 3D newsroom set, on a jib move"
						onclick={(e) => gallery?.open(3, e.currentTarget)} />
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<!-- Drag between the raw greenscreen shot and the finished
					     virtual-studio composite. -->
				<div class="iprez-compare">
					<Comparison
						before="https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez-brian_as_new_anchor_in_front_of_green_screen_behind_the_scenes.avif"
						after="https://cdn.brianschwabauer.com/media/2011-08-28_xyz_news-iprez/poster.jpg"
						before_alt="Brian on greenscreen, raw shot"
						after_alt="The finished 3D virtual newsroom composite"
						label_before="GREENSCREEN"
						label_after="ON AIR"
						snaps={[50]} />
				</div>
			</Reveal>

			<Reveal variant="up" delay={170}>
				<PlayFilm
					label="Also watch — XYZ News Special Report"
					title="XYZ News Special Report (2011)"
					meta="2011"
					color="#6c63ff"
					onclick={(e) => gallery?.open(5, e.currentTarget)} />
			</Reveal>
		</div>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="animation"
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
	:global([data-theme='vfx']) {
		background:
			radial-gradient(circle at 20% 0%, rgba(108, 99, 255, 0.15), transparent 50%),
			radial-gradient(circle at 80% 100%, rgba(0, 200, 255, 0.1), transparent 50%),
			linear-gradient(180deg, #050514, #0a0a26 50%, #050514);
		color: #e8ecff;
		overflow-x: clip;
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
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
		color: oklch(from #00f2c3 0.82 calc(c * 0.9) h);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}

	.sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin: 0 0 0.8rem;
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
	}
	.calamity,
	.exposure,
	.iprez {
		margin: 5rem 0;
	}
	.cal-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.cal-grid {
			grid-template-columns: 1fr;
		}
	}
	.cal-grid p {
		max-width: 38rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.brick-tag {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		padding: 0.15rem 0.55rem;
		border-radius: 4px;
		background: linear-gradient(180deg, #ffd934, #ffb800);
		color: #2a1a00;
		font-weight: 800;
		box-shadow:
			0 2px 0 #b88500,
			inset 0 -2px 0 rgba(0, 0, 0, 0.1);
	}
	.story-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #6c63ff;
		margin: 2rem 0 0.6rem;
	}
	.storyboard {
		margin: 2rem 0;
	}
	/* Copy on the left, robot on the right. Above 1024px the stage goes full
	   bleed and the two are layered into the same grid cell rather than given a
	   column each: the aperture rail belongs on the viewport's edge and the robot
	   needs the whole width to be the size it should be. Below that they stack. */
	.exposure-stage {
		/* The copy sits just clear of the rail rather than tracking the page
		   container's left edge. The section is full bleed here, and that dead
		   strip between rail and text was width neither the copy nor the robot
		   could spare. */
		--copy-start: max(8rem, 3vw);
		/* Wide enough for a real measure at the lede's type size once there's room
		   for it; below that the robot needs the width more than the copy does. */
		--copy-width: clamp(30rem, 34vw, 38rem);
		display: grid;
		gap: clamp(1.5rem, 4vw, 3rem);
		@media (min-width: 1024px) {
			width: 100vw;
			margin-inline: calc(50% - 50vw);
			gap: 0;
			& > * {
				grid-area: 1 / 1;
			}
		}
	}
	.head-sticky {
		/* Only pin the copy when the viewport is tall enough to hold all of it —
		   otherwise it would sit clipped for the entire length of the scrub, with
		   the play button stuck off-screen. Short windows just scroll it. */
		@media (min-width: 1024px) and (min-height: 870px) {
			position: sticky;
			top: 0;
			min-height: 100svh;
			display: flex;
			flex-direction: column;
			/* `safe` so a viewport shorter than the copy pins it to the top rather
			   than centring it and pushing the heading off-screen. */
			justify-content: safe center;
			padding-block: 1.5rem;
		}
	}
	.exposure-head {
		max-width: 56rem;
		margin-bottom: 2rem;
		@media (min-width: 1024px) {
			/* Only as wide as the copy it holds, so the rest of the bleed stays
			   free for the robot. */
			justify-self: start;
			width: calc(var(--copy-start) + var(--copy-width) + 1.5rem);
			max-width: none;
			margin-bottom: 0;
			padding-inline: var(--copy-start) 1.5rem;
			z-index: 2;
		}
	}
	.exposure-head p {
		line-height: 1.6;
		margin-bottom: 1rem;
		/* Held at the lede's size rather than shrunk to sub-section type: while
		   it's pinned this is the only thing to read for two and a half screens.
		   It reaches full lede size around 1700px, where the column is finally
		   wide enough that the whole block still fits one screen. */
		@media (min-width: 1024px) {
			font-size: clamp(1.05rem, 0.5rem + 0.66vw, 1.2rem);
			line-height: 1.55;
			margin-bottom: 0.9rem;
		}
	}
	.exposure-head strong {
		color: #6c63ff;
	}
	.robot {
		color: #6c63ff;
		font-family: var(--font-mono);
		letter-spacing: 0.08em;
	}
	.bracket {
		color: rgba(255, 255, 255, 0.4);
	}

	.transformer-stage {
		position: relative;
		pointer-events: none;
		/* The robot is sized and placed off this box, so it never lands under the
		   rail or the copy. */
		container-type: inline-size;
		/* The gauge's own offset plus its width — the strip on the left that the
		   robot has to stay clear of. */
		--rail: 5.5rem;
		--reserved: calc(var(--rail) + 1rem);
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		margin-block: -2rem -3rem;
		@media (max-width: 768px) {
			--rail: 2rem;
		}
		@media (min-width: 1024px) {
			width: auto;
			margin-inline: 0;
			margin-block: 0;
			/* Full bleed, so the robot centres in what's left of the viewport once
			   the rail and the copy have taken their share. */
			--reserved: calc(var(--copy-start) + var(--copy-width) + 3rem);
		}
	}
	.gauge {
		position: absolute;
		inset-block: 0;
		left: 2rem;
		width: 3.5rem;
		mask-image: linear-gradient(180deg, transparent, #000 22% 78%, transparent);

		/* A fixed hairline for the ticks to slide against — travel is only as
		   readable as the still thing it can be measured against. */
		&::before {
			content: '';
			position: absolute;
			inset-block: 0;
			left: 0;
			width: 1px;
			background: rgba(108, 99, 255, 0.2);
		}
	}
	.tick {
		position: absolute;
		left: 0;
		top: 0;
		width: 0.65rem;
		height: 1px;
		background: rgba(108, 99, 255, 0.5);

		&.major {
			width: 1.75rem;
			height: 2px;
			background: rgba(108, 99, 255, 0.9);
		}
	}
	.stop {
		position: absolute;
		left: 0.35rem;
		top: 0.45rem;
		font-family: var(--font-mono);
		font-size: 0.64rem;
		letter-spacing: 0.1em;
		font-variant-numeric: tabular-nums;
		color: rgba(108, 99, 255, 0.78);
		white-space: nowrap;
	}
	@media (max-width: 768px) {
		.gauge {
			left: 0;
			/* Still has to clear the major tick, the widest thing left once the stops
			   go. */
			width: 2rem;
		}
		.stop {
			display: none;
		}
	}

	.transformer-stage :global(.transformer-video) {
		width: 100%;
		height: 100svh;
		object-fit: contain;
		filter: drop-shadow(0 30px 60px rgba(108, 99, 255, 0.35));
	}
	/* The robot's alpha only covers x 11%–61%, y 13%–89% of the 1920×1080 frame —
	   it sits well left of centre with wide empty margins. So the video element is
	   deliberately oversized and offset by that bounding box, which centres the
	   *robot* in the space right of `--reserved` rather than centring the mostly
	   empty frame it lives in. */
	.transformer-stage :global(.transformer-video video) {
		/* Centre of the robot's bounding box, as a fraction of the frame. */
		--content-center-x: 0.36;
		--content-center-y: 0.287;
		/* Tall enough to nearly fill the pin — that's the scale this shot has
		   always been played at — but never so wide it runs into the copy. */
		--frame: min(230svh, calc((100cqw - var(--reserved)) * 1.85));
		width: var(--frame);
		height: calc(var(--frame) * 9 / 16);
		left: calc(
			var(--reserved) + (100cqw - var(--reserved)) / 2 - var(--frame) *
				var(--content-center-x)
		);
		top: calc(50% - var(--frame) * var(--content-center-y));
	}

	.exposure-grid {
		margin: 3rem 0 2rem;
	}

	.iprez-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.iprez-grid {
			grid-template-columns: 1fr;
		}
	}
	.iprez-grid p {
		line-height: 1.6;
		margin-bottom: 1rem;
		max-width: 36rem;
	}
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(108, 99, 255, 0.08);
		border-left: 3px solid #6c63ff;
		border-radius: 0 8px 8px 0;
		font-style: italic;
	}
	.iprez-compare {
		margin-top: 2rem;
	}
	.iprez-compare :global(.comparison img) {
		height: 100%;
	}
</style>
