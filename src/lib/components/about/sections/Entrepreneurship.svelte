<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ArchiveFrame from '../primitives/ArchiveFrame.svelte';
	import { Gallery, type GalleryItem } from '@delightstack/components/media';
	import { imageItem, imageItems } from '../media';

	const towerShots = [
		'2016-01-01_tower_of_the_americas_panorama-equirectangular.avif',
		'2016-01-01_tower_of_the_americas_panorama-little_planet.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_a1-home_page.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_e1-panorama_page.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_e1-panorama_page_zoomed_in.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_g1-location_info_page.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_d3-view_story_page.avif',
		'2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_b1-location_selection.avif',
	].map((src) => ({ src }));

	const tapnotionShots = [
		'2017-01-01_tapnotion_app_screenshot_home_page-scores.avif',
		'2017-01-01_tapnotion_app_screenshot_game-item-multiple_choice.avif',
		'2017-01-01_tapnotion_app_screenshot_challenge_page-completed_level.avif',
		'2017-01-01_tapnotion_app_screenshot_game_over-win.avif',
		'2017-01-01_tapnotion_app_screenshot_milestone-start.avif',
		'2017-01-01_tapnotion_app_screenshot_question-multiple_choice-answer_revealed.avif',
	].map((src) => ({ src }));

	const engagementShots = [
		'2016-01-01_engagement_grower_settings_page_mockup.avif',
		'2016-01-01_engagement_grower_settings_page_addons_mockup.avif',
		'2016-01-01_engagement_grower_infinite_scroll_settings_page_mockup.avif',
		'2016-01-01_engagement_grower-fresh_content_addon_animation_for_website.gif',
	].map((src) => ({ src }));

	const markableShots = [
		'2024-01-01_remarkably_organized_app-home_page_screenshot.avif',
		'2024-01-01_remarkably_organized_app-settings_popup_screenshot.avif',
		'2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-close_up_on_navigation.avif',
		'2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-shallow_depth_of_field_year_view.avif',
		'2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-title_page_close_up.avif',
	].map((src) => ({ src }));

	const scrambledLetters = ['S', 'C', 'R', 'M', 'B', 'L', 'D'];

	const towerImages: GalleryItem[] = imageItems(towerShots);
	const engagementImages: GalleryItem[] = imageItems(engagementShots);
	const markableImages: GalleryItem[] = imageItems(markableShots);

	// Standalone clickable LazyMedias in document order:
	// 0: Tower BTS camera shot, 1: Tower demo on tablet shot,
	// 2..7: 6 tapnotion phone mockups
	const sectionExtras: GalleryItem[] = [
		imageItem(
			'2016-06-08_tower_of_the_americas_virtual_tour_app-panorama_shoot_behind_the_scenes-brian_with_camera.avif',
			'Brian shooting the panorama',
			'Shooting the panorama on the observation deck',
		),
		imageItem(
			'2016-06-30_tower_of_the_americas_virtual_tour_app-demo_video_on_tablet-rotate_tablet_360.avif',
			'Demo on the tablet',
			'Demoed on the tablet',
		),
		...tapnotionShots.map((s) => imageItem(s.src, 'TapNotion screenshot')),
	];
	let gallery = $state<ReturnType<typeof Gallery>>();
</script>

<SectionShell id="entrepreneurship" year="2017" label="Entrepreneurship" theme="entr">
	<div class="container">
		<Reveal>
			<YearMark year="2017" subtitle="Entrepreneurship" color="#00d6ff" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">FROM FREELANCER → FOUNDER</div>
				<h2 class="title">
					I stopped
					<br />
					<span class="cross">selling time.</span>
					<br />
					<span class="grad">I started building things.</span>
				</h2>
				<p class="lede">
					Somewhere in this stretch I stopped thinking of myself as a freelancer and
					started thinking of myself as an entrepreneur. I wanted to build products, not
					deliver projects. I wanted to make things that could keep running without me
					there. Some worked. Some didn't. Almost all of them taught me a thing I used in
					the next one.
				</p>
			</Reveal>
		</div>

		<div class="card project tower">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2016</div>
					<h3 class="sub">
						<span class="loc">[SA]</span>
						Tower of the Americas — a kiosk companion app
					</h3>
					<p>
						The Tower of the Americas (in San Antonio) hired me to build an immersive
						companion app. The idea: visitors get a tablet on a kiosk mount, point it
						where they're looking out the windows, and the app shows them a 360 panorama
						with landmark labels they can tap to learn more.
					</p>
					<p>
						I went up the tower, shot photos in every direction, stitched them into a
						massive 360 panorama, and built the whole thing in Angular. The tablet's
						compass tracked which way it was pointed and matched that to the panorama
						angle. Tap a landmark, get a video and info card.
					</p>
				</Reveal>
			</div>
			<Reveal variant="up" delay={100}>
				<Gallery items={towerImages} display="masonry-row" />
			</Reveal>
			<Reveal variant="up" delay={150}>
				<div class="bts-row">
					<LazyMedia
						src="2016-06-08_tower_of_the_americas_virtual_tour_app-panorama_shoot_behind_the_scenes-brian_with_camera.avif"
						alt="Brian shooting the panorama"
						ratio="16 / 9"
						caption="Shooting the panorama on the observation deck"
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
					<LazyMedia
						src="2016-06-30_tower_of_the_americas_virtual_tour_app-demo_video_on_tablet-rotate_tablet_360.avif"
						alt="Demo on the tablet"
						ratio="16 / 9"
						caption="Demoed on the tablet"
						onclick={(e) => gallery?.open(1, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="card project tapnotion">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2017–2019</div>
					<h3 class="sub">TapNotion — gamified training for restaurants</h3>
					<p>
						A swipe-based flashcard game to onboard waiters and bartenders. A restaurant
						owner sets up their menu and drinks in an admin dashboard, then invites new
						hires. The new hire learns through a quick flashcard game with left/right
						swipes, points for correct answers, points for speed, and immediate review of
						anything they got wrong. Owners see employee progress in the dashboard.
					</p>
				</Reveal>
			</div>
			<Reveal variant="up" delay={100}>
				<div class="phone-grid">
					{#each tapnotionShots as item, i}
						<div class="phone-mini" style:--i={i}>
							<LazyMedia
								src={item.src}
								alt=""
								ratio="9 / 16"
								onclick={(e) => gallery?.open(2 + i, e.currentTarget)} />
						</div>
					{/each}
				</div>
			</Reveal>
		</div>

		<div class="card project engagement">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2016–2017</div>
					<h3 class="sub">Engagement Grower — a smarter "related posts" plugin</h3>
					<p>
						A WordPress plugin that picks suggested posts intelligently. It tracks
						impressions, clicks, and bounce rate on each suggestion, builds a model from
						that data, and serves the ones with the best signal. The plugin didn't break
						out commercially. The data pipeline was a good build.
					</p>
				</Reveal>
			</div>
			<Reveal variant="up" delay={100}>
				<Gallery items={engagementImages} display="masonry-row" />
			</Reveal>
			<Reveal variant="up" delay={150}>
				<ArchiveFrame
					src="http://cdn.brianschwabauer.com/site/engagementgrower/index.html"
					title="Engagement Grower marketing site"
					label="Open the archived marketing site" />
			</Reveal>
		</div>

		<div class="card project wyoti">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2017–2018</div>
					<h3 class="sub">Wyoti — partnered WordPress agency</h3>
					<p>
						Spun out of the Engagement Grower work — we partnered with Wyoti to build
						custom WordPress sites and plugins for clients. A solid bridge between
						freelance and product.
					</p>
				</Reveal>
			</div>
			<Reveal variant="up" delay={100}>
				<ArchiveFrame
					src="https://cdn.brianschwabauer.com/site/wyoti/index.html"
					title="Wyoti — agency site"
					label="Open Wyoti" />
			</Reveal>
		</div>

		<div class="card project markable">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2024</div>
					<h3 class="sub">
						<a href="https://markable.page" target="_blank" rel="noopener">
							markable.page
						</a>
						— a PDF planner builder for e-ink tablets
					</h3>
					<p>
						A planner builder that generates highly customizable PDFs with internal links,
						designed for devices like the reMarkable. Originally called "Remarkably
						Organized". Open-sourced.
						<strong>200+ stars on GitHub.</strong>
						Built with Svelte.
					</p>
					<p>
						<a
							href="https://github.com/brianschwabauer/remarkably-organized"
							target="_blank"
							rel="noopener">
							github.com/brianschwabauer/remarkably-organized
						</a>
					</p>
				</Reveal>
			</div>
			<Reveal variant="up" delay={100}>
				<Gallery items={markableImages} display="masonry-row" />
			</Reveal>
		</div>

		<div class="card project scrmbld">
			<div class="card-head">
				<Reveal>
					<div class="year-tag">2024+</div>
					<h3 class="sub">
						<a href="https://scrmbld.app" target="_blank" rel="noopener">SCRMBLD</a>
						— a daily word game in split-flap style
					</h3>
					<p>
						You're given 8 letters. One is a decoy. Unscramble the other 7 into the day's
						word. Letters animate on like a split-flap display — I spent a stupid amount
						of time hand-crafting the look and feel of that animation. Made for fun, not
						for money.
					</p>
				</Reveal>
			</div>

			<Reveal variant="up" delay={100}>
				<div class="splitflap">
					{#each scrambledLetters as letter, i}
						<div class="flap" style:--delay="{i * 100}ms">
							<div class="flap-inner">
								<span class="flap-top">{letter}</span>
								<span class="flap-bottom">{letter}</span>
							</div>
						</div>
					{/each}
				</div>
				<div class="splitflap-tag">scrmbld.app · daily</div>
			</Reveal>
		</div>
	</div>

	<Gallery bind:this={gallery} items={sectionExtras} display="lightbox" />
</SectionShell>

<style>
	:global([data-theme='entr']) {
		background:
			radial-gradient(ellipse at 20% 0%, rgba(0, 214, 255, 0.08), transparent 50%),
			radial-gradient(ellipse at 80% 100%, rgba(255, 102, 204, 0.06), transparent 50%),
			linear-gradient(180deg, #050a14, #07101f 50%, #050810);
		color: #e0f1fa;
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
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00d6ff;
		margin-bottom: 1rem;
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.cross {
		position: relative;
		opacity: 0.6;
	}
	.cross::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: 52%;
		height: 4px;
		background: #ff6688;
		transform: skewY(-3deg);
	}
	.grad {
		background: linear-gradient(90deg, #00d6ff, #00f2c3, #ff6688);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}

	.card {
		margin: 4rem 0;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(0, 214, 255, 0.12);
		border-radius: 16px;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.card-head {
		max-width: 56rem;
	}
	.year-tag {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		padding: 0.18rem 0.6rem;
		background: rgba(0, 214, 255, 0.12);
		color: #00d6ff;
		border-radius: 4px;
		margin-bottom: 0.6rem;
	}
	.sub {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 800;
		margin: 0 0 0.7rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem;
	}
	.sub a {
		color: #00d6ff;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.loc {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		padding: 0.15rem 0.55rem;
		background: #00d6ff;
		color: #052a35;
		font-weight: 800;
		border-radius: 4px;
		margin-right: 0.35rem;
		display: inline-block;
		transform: translateY(-3px);
	}
	.card p {
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	.card strong {
		color: #00f2c3;
	}
	.card a {
		color: #00d6ff;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.bts-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
		margin-top: 0.8rem;
	}
	@media (max-width: 640px) {
		.bts-row {
			grid-template-columns: 1fr;
		}
	}

	.phone-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
	}
	.phone-mini {
		background: #000;
		border-radius: 18px;
		padding: 6px;
		box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5);
		transform: rotate(calc((var(--i) - 2.5) * 1.2deg));
		transition: transform 200ms ease;
	}
	.phone-mini:hover {
		transition-duration: 0s;
		transform: rotate(0deg) translateY(-4px);
	}

	.splitflap {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		padding: 2rem 0 1rem;
		font-family: var(--font-mono);
	}
	.flap {
		position: relative;
		width: clamp(40px, 7vw, 70px);
		aspect-ratio: 1;
		background: #1a1a1a;
		border-radius: 6px;
		overflow: hidden;
		perspective: 600px;
		box-shadow: 0 10px 26px rgba(0, 0, 0, 0.6);
		animation: flap 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
		animation-delay: var(--delay);
	}
	.flap-inner {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.flap-top,
	.flap-bottom {
		position: absolute;
		width: 100%;
		height: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: clamp(1.5rem, 3vw, 2.4rem);
		font-weight: 800;
		color: #fff;
		background: #2a2a2a;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}
	.flap-top {
		top: 0;
		align-items: flex-end;
		padding-bottom: 4%;
		border-bottom: 1px solid #000;
	}
	.flap-bottom {
		bottom: 0;
		align-items: flex-start;
		padding-top: 4%;
	}
	@keyframes flap {
		0%,
		20% {
			transform: rotateX(0);
		}
		30% {
			transform: rotateX(-30deg);
		}
		40% {
			transform: rotateX(0);
		}
		100% {
			transform: rotateX(0);
		}
	}
	.splitflap-tag {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.32em;
		text-align: center;
		opacity: 0.7;
	}
</style>
