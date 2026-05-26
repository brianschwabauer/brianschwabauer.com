<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';
	import ArchiveFrame from '../primitives/ArchiveFrame.svelte';
	import Expandable from '../primitives/Expandable.svelte';

	const variousShots = [
		'2012-02-02_med_365-silent_film-character_looks_up_dramatically.avif',
		'2012-02-02_med_365-silent_film-character_throws_ball_against_wall.avif',
		'2012-04-12_med_365-chase_scene-character_hit_by_car.avif',
		'2012-05-10_med_365-complexity-character_drunkily_stumbles_out_of_bar.avif',
		'2012-12-06_art_230_final-stop_action_animation_of_two_people_on_steps.avif',
		'2014-04-10_art_300-project_3-disturbance-stillframe_of_character_walking_in_hand_drawn_scene.avif',
		'2014-09-24_med_465-one_up-close_up_shots_on_two_guys_staring_eachother_down.avif',
		'2014-09-24_med_465-one_up-quick_cuts_between_two_character_close_ups.avif',
	].map((src) => ({ src }));

	const nodeBTS = [
		'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_01-four_go_pro_mount.avif',
		'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_03_four_gopro_mount_in_car.avif',
		'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_04.avif',
		'2014-03-06_art_300_project-node-360_short_film-behind_the_scenes_05-all_actors.avif',
	].map((src) => ({ src }));

	const oneUpBTS = Array.from({ length: 8 }, (_, i) => {
		const n = String(i + 1).padStart(2, '0');
		const ext = i === 2 ? 'avif' : 'jpg';
		return { src: `2014-09-15_med_465-one_up-behind_the_scenes_set_photo_${n}.${ext}` };
	});
</script>

<SectionShell id="college" year="2012" label="College" theme="college">
	<div class="container">
		<Reveal>
			<YearMark year="2012" subtitle="Missouri State · Electronic Arts" color="#7a4dff" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">MISSOURI STATE UNIVERSITY · ELECTRONIC ARTS</div>
				<h2 class="title">
					Four years of <span class="grad">"go make something."</span>
				</h2>
				<p class="lede">
					I majored in <strong>Electronic Arts</strong>
					— a multidisciplinary major covering video production, audio production, animation,
					and interactive design — with a minor in
					<strong>Computer Science</strong>
					. Pretty much the perfect match for a kid who'd been combining all of those things
					in his basement since he was eleven.
				</p>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="strip">
				<div class="strip-eyebrow">A WHIRLWIND OF CLASS PROJECTS</div>
				<MediaGrid items={variousShots} min={220} gap={6} ratio="16 / 9" />
				<div class="strip-note">
					MED 365 silent film · chase scene · complexity edit · ART 230 stop-motion · ART
					300 disturbance · MED 465 One Up
				</div>
			</div>
		</Reveal>

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
					</div>
					<div class="fb-card">
						<LazyMedia
							src="2012-04-27_facebook_short_film-zolly_shot_of_main_character_falling_in_love.avif"
							alt="Facebook IRL — the zolly shot"
							ratio="16 / 9" />
						<div class="fb-overlay">
							<div class="fb-bubble">
								<div class="fb-name">Brian Schwabauer · just now</div>
								<div class="fb-status">
									is feeling <em>infatuated</em>
									.
								</div>
								<div class="fb-meta">142 reactions · 38 comments</div>
							</div>
						</div>
					</div>
				</div>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="inline-video">
					<VideoPlayer
						slug="2012-04-27_facebook"
						title="Facebook in Real Life (2012)"
						ratio="16 / 9" />
				</div>
			</Reveal>
		</div>

		<div class="node-block">
			<Reveal>
				<div class="node-head">
					<h3 class="sub">
						<span class="lab-tag">EXPERIMENTAL</span>
						NODE — a 360° short film, in 2014
					</h3>
					<p>
						"Make something cool and impressive," our ART 300 professor said. So my group
						made a
						<strong>360-degree panoramic short film</strong>
						. In 2014. When you couldn't buy a 360 camera, when YouTube didn't support 360 video,
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
					<LazyMedia
						src="2014-03-18_art_300_project-node-360_short_film_panorama_equirectangular.avif"
						alt="NODE — equirectangular panorama still"
						ratio="2 / 1" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="node-bts">
					<MediaGrid items={nodeBTS} min={220} gap={6} ratio="4 / 3" />
				</div>
			</Reveal>

			<Reveal variant="up" delay={150}>
				<div class="node-viewer">
					<ArchiveFrame
						src="https://cdn.brianschwabauer.com/site/node/index.html"
						title="NODE — the WebGL 360 player I built (2014)"
						ratio="16 / 10"
						label="Try the original 360 viewer" />
				</div>
			</Reveal>

			<Reveal>
				<Expandable label={'What it took to make the viewer feel "directed"'}>
					<div class="prose">
						<p>
							A 360 video is only half the problem. You also have to <em>guide</em>
							the viewer. At certain timecodes I disable the keyboard, smoothly animate the
							camera to a target azimuth + FOV (with easing), then release control back to the
							user. I also added a CSS letterbox overlay to force a 2.35 aspect ratio across
							the whole webpage — surprisingly fiddly in 2014.
						</p>
					</div>
				</Expandable>
			</Reveal>
		</div>

		<div class="pickvid">
			<Reveal>
				<h3 class="sub">PickVid (2014) — a tiny social app</h3>
				<p>
					Another group project in the same class. Idea: a group of friends downloads the
					app and gets a prompt ("take a sad selfie", "take a picture of something
					funny"). Everyone uploads their photo to a shared S3 bucket. The app stitches
					all the photos into a single hollywood-style movie trailer with intense music
					and explosions — your friends as the cast. We shipped a working prototype.
				</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="pickvid-grid">
					<LazyMedia
						src="2014-05-12_pickvid_promo_video-demo_on_phone.avif"
						alt="PickVid demo on a phone"
						ratio="9 / 16" />
					<LazyMedia
						src="2014-05-12_pickvid_promo_video-logo_animation.avif"
						alt="PickVid logo animation"
						ratio="16 / 9" />
				</div>
			</Reveal>
			<Reveal variant="up" delay={130}>
				<div class="inline-video">
					<VideoPlayer
						slug="2014-05-12_pickvid_promo_video"
						title="PickVid (2014) — promo video / demo"
						ratio="16 / 9" />
				</div>
			</Reveal>
		</div>

		<div class="bear-bus">
			<Reveal>
				<h3 class="sub">Bear Bus Bash — my first "finished" game</h3>
				<p>
					A Flash bus-driving game where you pick up MSU campus bus passengers, collect
					coins, and dodge other cars. There are levels for each real MSU campus route,
					three drivers with different stats, and a real scoring + achievements system. A
					teammate hand-drew all the art. I did the programming, animation, and most of
					the motion graphics.
				</p>
				<p>
					Flash couldn't really do 3D in 2013, so I faked depth with scaled 2D sprites and
					crossfade swaps of the bus model from different angles. Clunky, but believable.
				</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="bb-grid">
					<LazyMedia
						src="2013-12-02_bear_bus_bash_flash_game_screen_recording-main_menu.avif"
						alt="Bear Bus Bash — main menu"
						ratio="4 / 3" />
					<LazyMedia
						src="2013-12-02_bear_bus_bash_flash_game_screen_recording-gameplay_clip.avif"
						alt="Bear Bus Bash — gameplay"
						ratio="4 / 3" />
					<LazyMedia
						src="2013-12-02_bear_bus_bash_flash_game_screen_recording-victory_results_page.avif"
						alt="Bear Bus Bash — victory"
						ratio="4 / 3" />
				</div>
			</Reveal>
			<Reveal variant="up" delay={140}>
				<div class="inline-video">
					<VideoPlayer
						slug="2013-12-02_bear_bus_bash_flash_game_screen_recording"
						title="Bear Bus Bash (2013) — full gameplay recording"
						ratio="16 / 9" />
				</div>
			</Reveal>
		</div>

		<div class="split-life">
			<Reveal>
				<h3 class="sub">Split Life — a 48-hour film, in stereo (2015)</h3>
				<p>
					48-hour film festival. I wanted to do something nobody had done before. So I
					made a film with
					<strong>
						two oner-shot perspectives, shown side-by-side at the same time, in real time
					</strong>
					. One: the protagonist leaves her house. Two: a man hidden outside breaks in while
					she's gone. She comes back. He gets stuck. They turn out to know each other. It ends.
				</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="split-row">
					<div class="split-stage">
						<LazyMedia
							src="2015-04-12_split_life-sato_48-film_snapshot_1.avif"
							alt="Split Life — perspective A"
							ratio="16 / 9" />
						<div class="split-tag a">PERSPECTIVE A · LEFT</div>
					</div>
					<div class="split-stage">
						<LazyMedia
							src="2015-04-12_split_life-sato_48-film_snapshot_2.avif"
							alt="Split Life — perspective B"
							ratio="16 / 9" />
						<div class="split-tag b">PERSPECTIVE B · RIGHT</div>
					</div>
				</div>
			</Reveal>
			<Reveal variant="up" delay={130}>
				<div class="inline-video">
					<VideoPlayer
						slug="2015-04-12_split_life-sato_48"
						title="Split Life (2015) — 48-hour dual-perspective oner"
						ratio="16 / 9" />
				</div>
			</Reveal>

			<Reveal>
				<Expandable label="The tricks that let two real-time oners line up">
					<div class="prose">
						<p>
							To make the two shots line up frame-perfect over multiple minutes, I built a
							master spreadsheet of every event in the film with exact timecodes. I then
							recorded my own voice giving every cue ("3, 2, 1, open the door") at those
							exact timecodes, and blasted that audio through the house during filming so
							every actor and operator knew exactly what should be happening.
						</p>
						<p>
							The actors had to be at exact locations at exact times. Plus a handful of
							hidden cuts I had to fix in VFX. Plus I scored the music myself, late at
							night, on the deadline. Plus all the cue audio had to be replaced in post.
						</p>
						<p>
							The story is okay. The lighting is okay. The script is okay. But I did the
							thing I set out to do, which was: invent a new kind of edit. I'm still proud
							of that.
						</p>
					</div>
				</Expandable>
			</Reveal>
		</div>

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
						<VideoPlayer
							slug="2014-05-15_katie_bauers_breakup"
							title="Katie Bauer's Breakup (2014)"
							ratio="16 / 9" />
					</article>
					<article class="film-quad-card">
						<h4>
							One Up <span class="film-year">2014</span>
						</h4>
						<p>
							Cinematography-class short. Two guys try to one-up each other to land the
							same job. Real lighting setups, real coverage.
						</p>
						<VideoPlayer
							slug="2014-09-24_med_465-one_up"
							title="One Up (2014)"
							ratio="16 / 9" />
					</article>
					<article class="film-quad-card">
						<h4>
							Nice to Meet You <span class="film-year">2014</span>
						</h4>
						<p>
							Senior-thesis warmup, shot in Canon RAW on a 5D mkIV with Magic Lantern
							firmware. The girl on the bench was on the phone the whole time.
						</p>
						<VideoPlayer
							slug="2014-09-02_nice_to_meet_you"
							title="Nice to Meet You (2014)"
							ratio="16 / 9" />
					</article>
					<article class="film-quad-card">
						<h4>
							Legacy <span class="film-year">2015</span>
						</h4>
						<p>
							A quiet 2-character short for my directing class. A husband obsessed with
							his career, a wife who wants him home. Conversation as conflict.
						</p>
						<VideoPlayer slug="2015-04-22_legacy" title="Legacy (2015)" ratio="16 / 9" />
					</article>
				</div>
			</Reveal>

			<Reveal variant="up" delay={120}>
				<div class="oneup-bts">
					<div class="bts-eyebrow">ONE UP — BTS</div>
					<MediaGrid items={oneUpBTS} min={170} gap={6} ratio="4 / 3" />
				</div>
			</Reveal>
		</div>

		<div class="bassless">
			<Reveal>
				<h3 class="sub">Bassless Ideas (2015) — a senior-year band</h3>
				<p>
					Kevin came to Missouri State for grad school my senior year (he finished Baylor
					a year early). We moved into a house and started writing music again. The result
					was a band called <strong>Bassless Ideas</strong>
					— two short EPs, a few ridiculous songs, a few serious ones. Still online, still occasionally
					listened to.
				</p>
				<p>
					<a href="https://basslessideas.com" target="_blank" rel="noopener">
						basslessideas.com
					</a>
				</p>
			</Reveal>
		</div>
	</div>
</SectionShell>

<style>
	:global([data-theme='college']) {
		background:
			radial-gradient(ellipse at top, rgba(122, 77, 255, 0.1), transparent 50%),
			linear-gradient(180deg, #080414, #0d0a1a 50%, #050410);
		color: #ece8ff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
	}
	.lockup {
		margin-bottom: 4rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.32em;
		color: #7a4dff;
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
		background: linear-gradient(90deg, #7a4dff, #ff5fb3, #ffb84d);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}
	.lede strong {
		color: #7a4dff;
	}

	.strip {
		margin: 4rem 0;
	}
	.strip-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #7a4dff;
		margin-bottom: 0.8rem;
	}
	.strip-note {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		opacity: 0.6;
		margin-top: 0.6rem;
	}

	.fb-block,
	.node-block,
	.pickvid,
	.bear-bus,
	.split-life,
	.more-projects,
	.bassless {
		margin: 5rem 0;
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
	.fb-grid strong {
		color: #ff5fb3;
	}
	.fb-card {
		position: relative;
	}
	.fb-overlay {
		position: absolute;
		top: 12%;
		left: 8%;
		max-width: 70%;
		font-family: 'Inter', sans-serif;
		font-size: 0.85rem;
		pointer-events: none;
	}
	.fb-bubble {
		background: rgba(255, 255, 255, 0.96);
		color: #1a1a1a;
		padding: 0.6rem 0.9rem;
		border-radius: 8px;
		box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
		animation: fbPop 800ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes fbPop {
		from {
			transform: scale(0.9) translateY(-10px);
			opacity: 0;
		}
		to {
			transform: none;
			opacity: 1;
		}
	}
	.fb-name {
		font-weight: 700;
		color: #1877f2;
		font-size: 0.78rem;
	}
	.fb-status em {
		color: #1877f2;
	}
	.fb-meta {
		font-size: 0.7rem;
		color: #666;
		margin-top: 0.2rem;
	}

	.lab-tag {
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
		color: #7a4dff;
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
		color: #7a4dff;
		margin-bottom: 0.6rem;
	}
	.rig-steps {
		padding-left: 1.2rem;
		line-height: 1.65;
	}
	.rig-steps li {
		margin-bottom: 0.4rem;
	}
	.node-bts {
		margin: 2rem 0;
	}
	.node-viewer {
		margin: 2rem 0;
	}

	.pickvid-grid {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 1rem;
		align-items: center;
		max-width: 800px;
	}
	@media (max-width: 640px) {
		.pickvid-grid {
			grid-template-columns: 1fr;
		}
	}

	.bb-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.8rem;
		margin-top: 1.5rem;
	}
	@media (max-width: 768px) {
		.bb-grid {
			grid-template-columns: 1fr;
		}
	}

	.split-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin: 2rem 0;
	}
	@media (max-width: 640px) {
		.split-row {
			grid-template-columns: 1fr;
		}
	}
	.split-stage {
		position: relative;
	}
	.split-tag {
		position: absolute;
		bottom: 0.6rem;
		left: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		padding: 0.2rem 0.6rem;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
	}
	.split-tag.a {
		border-left: 2px solid #00f2c3;
	}
	.split-tag.b {
		border-left: 2px solid #ff5fb3;
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
		color: #7a4dff;
		font-weight: 700;
	}
	.film-quad-card p {
		font-size: 0.92rem;
		line-height: 1.5;
		opacity: 0.85;
		margin: 0 0 0.4rem;
	}
	.inline-video {
		max-width: 880px;
		margin: 2rem auto 0;
	}
	.oneup-bts {
		margin: 2.5rem 0;
	}
	.bts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #7a4dff;
		margin-bottom: 0.8rem;
	}

	.bassless p {
		line-height: 1.6;
		max-width: 36rem;
		margin-bottom: 1rem;
	}
	.bassless strong {
		color: #ff5fb3;
	}
	.bassless a {
		color: #00f2c3;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.prose p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.prose em {
		color: #ff5fb3;
		font-style: italic;
	}
</style>
