<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';
	import PinScrub from '../primitives/PinScrub.svelte';
	import { media } from '../media';

	const calamityShots = [
		'2009-12-25_calamity-airplane_fly_through_clouds.avif',
		'2009-12-25_calamity-airplane_fly_through_city_first_person.avif',
		'2009-12-25_calamity-airplane_fly_through_city_third_person.avif',
		'2009-12-25_calamity-animated_radar_screen_visual_effect.avif',
		'2009-12-25_calamity-dialog_scene_with_animated_mouths.avif',
		'2009-12-25_calamity-explosions.avif',
		'2009-12-25_calamity-monster_blown_up.avif'
	].map((src) => ({ src }));

	const exposureShots = [
		'2011-03-01_exposure-camera_robot_chases_kevin.avif',
		'2011-03-01_exposure-camera_robot_overheats_and_transforms_back_to_a_camera.avif',
		'2011-03-01_exposure-camera_robot_scans_house_in_3d.avif',
		'2011-03-01_exposure-camera_robot_shoots_tape_with_3d_effect.avif',
		'2011-03-01_exposure-first_person_camera_robot_chase.avif',
		'2011-03-01_exposure-3d_camera_model_wireframe.avif',
		'2011-03-01_exposure-behind_the_scenes-brian_controls_rc_car_with_camera_mounted_for_robot_pov_shot.avif',
		'2011-03-01_exposure-behind_the_scenes-brian_films_scene_of_actors.avif',
		'2011-03-01_exposure-behind_the_scenes-brian_runs_backwards_with_camera_filming.avif',
		'2011-03-01_exposure-behind_the_scenes-wes_dumps_water_on_himself_for_rainy_scene.avif'
	].map((src) => ({ src }));
</script>

<SectionShell id="animation" year="2009-2011" label="Animation & VFX" theme="vfx">
	<div class="container">
		<Reveal>
			<YearMark year="2009 – 2011" subtitle="Animation & Special Effects" color="#6c63ff" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">EFFECTS BAY ONLINE</div>
				<h2 class="title">
					Software gives you<br /><span class="grad">superpowers.</span>
				</h2>
				<p class="lede">
					Gone were the days of PowerPoint exports keyed onto live footage. By 2009 I was deep into After Effects
					and learning Cinema 4D / 3ds Max. The software let me build the things I could only dream of three years
					earlier. The "I can put anything on screen" feeling didn't go away. It still hasn't.
				</p>
			</Reveal>
		</div>

		<div class="calamity">
			<div class="cal-grid">
				<Reveal>
					<h3 class="sub">
						<span class="brick-tag">LEGO</span> Calamity
					</h3>
					<p>
						<strong>Calamity</strong> is a stop-motion short about a town of lego men attacked by a clay monster.
						We built a city on the floor of my basement, set a ladder over the whole thing so we could lay across
						it without getting in shot, and moved each lego one frame at a time.
					</p>
					<p>
						Then in After Effects, I painstakingly rotoscoped every character so I could replace the city behind
						them — explosions, fireballs, animated mouths, smoke, planes flying through the clouds. Every second
						has 3–4 VFX layers. It took an obscene amount of time.
					</p>
				</Reveal>
				<Reveal variant="right" delay={120}>
					<LazyMedia
						src="2009-12-25_calamity-behind_the_scenes-filming_lego_city_with_ladder_and_light.jpg"
						alt="Filming the lego city from a ladder"
						ratio="4 / 3"
					/>
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="storyboard">
					<div class="story-eyebrow">FROM THE SHOT LIST</div>
					<MediaGrid items={calamityShots} min={220} gap={6} ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={150}>
				<div class="bts-pair">
					<LazyMedia
						src="2009-12-25_calamity-behind_the_scenes_timelapse_of_building_lego_buildings.avif"
						alt="Timelapse of building the lego city"
						ratio="16 / 9"
						caption="Building the city — timelapse"
					/>
					<LazyMedia
						src="2009-12-25_calamity-lego_plan_with_green_screen_background.avif"
						alt="A lego scene in front of a greenscreen"
						ratio="16 / 9"
						caption="Some shots used greenscreen instead of roto"
					/>
				</div>
			</Reveal>

			<Reveal variant="up" delay={200}>
				<div class="inline-video">
					<VideoPlayer slug="2009-12-25_calamity" title="Calamity (2009) — full stop-motion short" ratio="16 / 9" />
				</div>
			</Reveal>
		</div>

		<div class="exposure">
			<div class="exposure-head">
				<Reveal>
					<h3 class="sub robot">
						<span class="bracket">[</span>EXPOSURE<span class="bracket">]</span>
					</h3>
					<p>
						My most ambitious VFX project. A camera struck by lightning "comes alive", transforms into a Transformers-style
						robot, and chases a group of friends. They eventually defeat it by overexposing it — they shine
						all their lights directly at it and it overheats.
					</p>
					<p>
						Over <strong>250 hours</strong> went into the post-production. I modeled the camera robot from scratch
						in 3D, animated the transformation, tracked it to live footage, integrated lighting, added smoke.
					</p>
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="transformer-stage">
					<PinScrub height="180vh">
						{#snippet children({ progress })}
							<div class="transformer-inner">
								<img
									src={media('2011-03-01_exposure-animated_on_transparent_background_camera_robot_transforms_from_camera_to_robot.avif')}
									alt="Camera robot transforming, scroll-scrubbed"
									loading="lazy"
									decoding="async"
									style:opacity="1"
									class="transformer-img"
								/>
								<div class="transformer-text">
									<div class="t-eyebrow">SCROLL TO TRANSFORM</div>
									<div class="t-progress">
										<span class="t-bar" style:width="{progress * 100}%"></span>
									</div>
									<div class="t-stages">
										<span class:active={progress < 0.33}>CAMERA</span>
										<span class:active={progress >= 0.33 && progress < 0.66}>MORPH</span>
										<span class:active={progress >= 0.66}>ROBOT</span>
									</div>
								</div>
							</div>
						{/snippet}
					</PinScrub>
				</div>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="exposure-grid">
					<MediaGrid items={exposureShots} min={220} gap={6} ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={130}>
				<div class="inline-video">
					<VideoPlayer slug="2011-03-01_exposure" title="Exposure (2011) — the camera-robot short" ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal>
				<Expandable label="The film-making tricks behind the shoot">
					<div class="prose">
						<p>
							We wanted to shoot in rain at night, but couldn't wait for the weather, so we filmed outside
							during the day and dunked the actors in water. The ground got soaked from a hose. I did
							day-to-night color conversion in post. It almost works.
						</p>
						<p>
							For the robot's POV shots, I built a camera mount that strapped to an RC car. We drove it during
							the chase scene so it could get the low, weaving angle that a human couldn't.
						</p>
						<p>
							The "bullet-time" shot where the camera-robot shoots a DV tape at the protagonist is a complete
							3D recreation of the tape, animated in slow-mo past the camera. Looking back at it, I'm still
							genuinely proud of that one.
						</p>
					</div>
				</Expandable>
			</Reveal>
		</div>

		<div class="iprez">
			<div class="iprez-grid">
				<Reveal>
					<h3 class="sub">
						<span class="news-tag">BREAKING</span> XYZ News &middot; iPrez
					</h3>
					<p>
						The XYZ News bit, again — three years on. By 2011 our skills were "professional" enough that I
						think we could've published this against The Onion at the time. A 3D virtual newsroom set with
						actual jib-style camera moves. Proper greenscreen lighting. The whole thing centered around one
						fake story: a new iPhone app for the U.S. president that gives him unlimited power.
					</p>
					<p class="aside">
						This is, embarrassingly, still one of the funnier things I've ever made.
					</p>
				</Reveal>
				<Reveal variant="right" delay={100}>
					<LazyMedia src="2011-08-28_xyz_news-iprez-camera_jib_shot_of_studio.avif" alt="iPrez 3D set jib shot" ratio="16 / 9" />
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="iprez-row">
					<LazyMedia src="2011-08-28_xyz_news-iprez-brian_as_new_anchor_in_front_of_green_screen_behind_the_scenes.avif" alt="Brian on greenscreen" ratio="16 / 9" />
					<LazyMedia src="2011-08-28_xyz_news-iprez-kevin_as_weather_man_on_green_screen_raw_shot.avif" alt="Kevin on greenscreen" ratio="16 / 9" />
					<LazyMedia src="2011-08-28_xyz_news-iprez-film_snapshot_of_kevin_as_news_anchor.avif" alt="Kevin in the final cut" ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={140}>
				<div class="inline-video">
					<VideoPlayer slug="2011-08-28_xyz_news-iprez" title="XYZ News — iPrez (2011)" ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={170}>
				<details class="extra-video">
					<summary>Also watch — XYZ News Special Report (2011)</summary>
					<div class="inline-video">
						<VideoPlayer slug="2011-03-18_xyz_news_special_report" title="XYZ News Special Report (2011)" ratio="16 / 9" />
					</div>
				</details>
			</Reveal>
		</div>
	</div>
</SectionShell>

<style>
	:global([data-theme='vfx']) {
		background:
			radial-gradient(circle at 20% 0%, rgba(108, 99, 255, 0.15), transparent 50%),
			radial-gradient(circle at 80% 100%, rgba(0, 200, 255, 0.1), transparent 50%),
			linear-gradient(180deg, #050514, #0a0a26 50%, #050514);
		color: #e8ecff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.lockup { margin-bottom: 4rem; }
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #6c63ff;
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
		background: linear-gradient(90deg, #6c63ff, #00f2c3, #00c8ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
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
	.calamity, .exposure, .iprez {
		margin: 5rem 0;
	}
	.cal-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.cal-grid { grid-template-columns: 1fr; }
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
		box-shadow: 0 2px 0 #b88500, inset 0 -2px 0 rgba(0, 0, 0, 0.1);
	}
	.story-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #6c63ff;
		margin: 2rem 0 0.6rem;
	}
	.storyboard { margin: 2rem 0; }
	.bts-pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	@media (max-width: 640px) {
		.bts-pair { grid-template-columns: 1fr; }
	}

	.exposure-head { max-width: 56rem; margin-bottom: 2rem; }
	.exposure-head p { line-height: 1.6; margin-bottom: 1rem; }
	.exposure-head strong { color: #6c63ff; }
	.robot { color: #6c63ff; font-family: var(--font-mono); letter-spacing: 0.08em; }
	.bracket { color: rgba(255, 255, 255, 0.4); }

	.transformer-stage {
		margin: 3rem 0;
	}
	.transformer-inner {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
		padding: 2rem;
		background:
			radial-gradient(ellipse at center, rgba(108, 99, 255, 0.18), transparent 70%),
			linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.5));
	}
	.transformer-img {
		max-width: 60%;
		max-height: 70%;
		object-fit: contain;
		filter: drop-shadow(0 30px 60px rgba(108, 99, 255, 0.45));
	}
	.transformer-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.6rem;
		width: min(28rem, 90%);
	}
	.t-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.4em;
		color: rgba(255, 255, 255, 0.65);
	}
	.t-progress {
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 4px;
		overflow: hidden;
	}
	.t-bar {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #6c63ff, #00f2c3);
		transition: width 60ms linear;
	}
	.t-stages {
		display: flex;
		gap: 1.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.2em;
		color: rgba(255, 255, 255, 0.35);
	}
	.t-stages .active { color: #00f2c3; }

	.exposure-grid { margin: 3rem 0 2rem; }

	.iprez-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.iprez-grid { grid-template-columns: 1fr; }
	}
	.iprez-grid p { line-height: 1.6; margin-bottom: 1rem; max-width: 36rem; }
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(108, 99, 255, 0.08);
		border-left: 3px solid #6c63ff;
		border-radius: 0 8px 8px 0;
		font-style: italic;
	}
	.news-tag {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		padding: 0.18rem 0.6rem;
		background: #cc0000;
		color: #fff;
		font-weight: 800;
		border-radius: 2px;
	}
	.iprez-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 0.75rem;
		margin-top: 2rem;
	}
	@media (max-width: 768px) {
		.iprez-row { grid-template-columns: 1fr; }
	}

	.prose p { line-height: 1.65; margin-bottom: 1rem; }

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
		border: 1px solid rgba(108, 99, 255, 0.4);
		border-radius: 999px;
		cursor: pointer;
		list-style: none;
		color: #6c63ff;
	}
	.extra-video[open] summary { margin-bottom: 1rem; }
	.extra-video summary::-webkit-details-marker { display: none; }
</style>
