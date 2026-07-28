<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ArchiveTabs from '../primitives/ArchiveTabs.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const tapnotionShots = [
		'2017-01-01_tapnotion_app_screenshot_home_page-scores.avif',
		'2017-01-01_tapnotion_app_screenshot_game-item-multiple_choice.avif',
		'2017-01-01_tapnotion_app_screenshot_challenge_page-completed_level.avif',
		'2017-01-01_tapnotion_app_screenshot_game_over-win.avif',
		'2017-01-01_tapnotion_app_screenshot_milestone-start.avif',
		'2017-01-01_tapnotion_app_screenshot_question-multiple_choice-answer_revealed.avif',
	].map((src) => ({ src: `https://cdn.brianschwabauer.com/media/${src}` }));

	const towerImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama-equirectangular.avif',
			width: 2048,
			height: 1024,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama-little_planet.avif',
			width: 2048,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_a1-home_page.avif',
			width: 1920,
			height: 1080,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_e1-panorama_page.avif',
			width: 1920,
			height: 1080,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_e1-panorama_page_zoomed_in.avif',
			width: 1920,
			height: 1080,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_g1-location_info_page.avif',
			width: 1920,
			height: 1080,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_d3-view_story_page.avif',
			width: 1920,
			height: 1080,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_tower_of_the_americas_panorama_app_screenshot_page_b1-location_selection.avif',
			width: 1920,
			height: 1080,
		},
	];
	const engagementImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_engagement_grower_settings_page_mockup.avif',
			width: 1787,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_engagement_grower_settings_page_addons_mockup.avif',
			width: 1787,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_engagement_grower_infinite_scroll_settings_page_mockup.avif',
			width: 1787,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-01-01_engagement_grower-fresh_content_addon_animation_for_website.gif',
		},
	];
	// Standalone clickable LazyMedias in document order:
	// 0: Tower BTS camera shot, 1: Tower demo on tablet shot,
	// 2..7: 6 tapnotion phone mockups
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-06-08_tower_of_the_americas_virtual_tour_app-panorama_shoot_behind_the_scenes-brian_with_camera.avif',
			width: 1080,
			height: 608,
			caption: 'Shooting the panorama on the observation deck',
			alt: 'Brian shooting the panorama',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2016-06-30_tower_of_the_americas_virtual_tour_app-demo_video_on_tablet-rotate_tablet_360.avif',
			width: 1080,
			height: 608,
			caption: 'Demoed on the tablet',
			alt: 'Demo on the tablet',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_home_page-scores.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_game-item-multiple_choice.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_challenge_page-completed_level.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_game_over-win.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_milestone-start.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2017-01-01_tapnotion_app_screenshot_question-multiple_choice-answer_revealed.avif',
			width: 375,
			height: 812,
			alt: 'TapNotion screenshot',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="entrepreneurship" year="2017" label="Entrepreneurship" theme="entr">
	<!--
	  The board, after somebody has half-wiped it. Boxes and arrows with no labels
	  in them — a diagram you can read the *shape* of but not the content of,
	  which is exactly what the year looked like from inside it. The smears are
	  what makes it a whiteboard rather than a flowchart: nothing here came off
	  cleanly.
	-->
	<svg
		class="board"
		viewBox="0 0 1200 800"
		preserveAspectRatio="xMidYMid meet"
		aria-hidden="true">
		<defs>
			<!-- The eraser, as a mask rather than a blend: white keeps, black
			     removes, and the blur on the strokes is what turns "wiped" into
			     "smeared". A blend mode can't subtract in CSS — only a mask can. -->
			<mask id="board-wipe">
				<rect width="1200" height="800" fill="#fff" />
				<g class="wipe">
					<path d="M40 300 C 300 210, 620 330, 1160 220" />
					<path d="M60 520 C 340 430, 700 560, 1180 470" />
					<path d="M20 700 C 380 620, 760 730, 1190 660" />
				</g>
			</mask>
		</defs>
		<g class="ink" mask="url(#board-wipe)">
			<rect x="88" y="96" width="190" height="92" rx="6" />
			<rect x="430" y="70" width="150" height="80" rx="6" />
			<rect x="760" y="140" width="210" height="98" rx="6" />
			<rect x="180" y="380" width="170" height="86" rx="6" />
			<rect x="560" y="430" width="230" height="104" rx="6" />
			<rect x="880" y="580" width="160" height="80" rx="6" />
			<circle cx="380" cy="250" r="46" />
			<circle cx="1010" cy="380" r="34" />
			<path d="M278 142 C 340 142, 360 110, 430 110" />
			<path d="M580 110 C 660 110, 690 170, 760 180" />
			<path d="M380 296 C 380 340, 300 350, 265 380" />
			<path d="M350 420 C 450 420, 470 450, 560 470" />
			<path d="M790 500 C 850 510, 850 560, 880 600" />
			<path d="M866 238 C 900 290, 980 300, 1008 346" />
			<!-- Arrowheads, drawn as two strokes because that is how a marker draws
			     one — you never lift and fill a triangle. -->
			<path d="M420 108 l-14 -7 M420 112 l-14 8" />
			<path d="M756 178 l-13 -9 M754 182 l-11 10" />
			<path d="M556 468 l-14 -6 M556 472 l-13 9" />
		</g>
	</svg>

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
				<div class="gal-eyebrow">FROM THE TOWER SHOOT · {towerImages.length} PHOTOS</div>
				<div class="gallery-contained">
					<LightboxGallery
						key="entrepreneurship-tower"
						items={towerImages}
						display="masonry"
						size="1" />
				</div>
			</Reveal>
			<Reveal variant="up" delay={150}>
				<div class="bts-row">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2016-06-08_tower_of_the_americas_virtual_tour_app-panorama_shoot_behind_the_scenes-brian_with_camera.avif"
						alt="Brian shooting the panorama"
						ratio="16 / 9"
						caption="Shooting the panorama on the observation deck"
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2016-06-30_tower_of_the_americas_virtual_tour_app-demo_video_on_tablet-rotate_tablet_360.avif"
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
				<LightboxGallery
					key="entrepreneurship-engagement"
					items={engagementImages}
					display="masonry-row"
					size="2" />
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
				<p class="archive-lead">Both companies' sites, archived in amber:</p>
				<ArchiveTabs
					tabs={[
						{
							title: 'Engagement Grower',
							src: 'http://cdn.brianschwabauer.com/site/engagementgrower/index.html',
						},
						{
							title: 'Wyoti',
							src: 'https://cdn.brianschwabauer.com/site/wyoti/index.html',
						},
					]} />
			</Reveal>
		</div>
	</div>

	<LightboxGallery bind:this={gallery} key="entrepreneurship" items={sectionExtras} />
</SectionShell>

<style>
	:global([data-theme='entr']) {
		background:
			radial-gradient(ellipse at 20% 0%, rgba(0, 214, 255, 0.08), transparent 50%),
			radial-gradient(ellipse at 80% 100%, rgba(255, 102, 204, 0.06), transparent 50%),
			linear-gradient(180deg, #050a14, #07101f 50%, #050810);
		color: #e0f1fa;
	}
	/*
	 * Drawn at its own proportions rather than stretched to the section's.
	 * `slice` on a section several screens tall crops to a sliver of the board
	 * and magnifies it, which turned a diagram into two enormous arcs; `meet`
	 * keeps the whole board legible as a board. It occupies the top of the
	 * section — a whiteboard is a thing on a wall, not a texture over everything.
	 */
	.board {
		position: absolute;
		top: 3%;
		left: 0;
		width: 100%;
		height: auto;
		pointer-events: none;
		/* Pulled right back. At 0.4 the diagram was legible enough that you read
		   the boxes instead of the copy in front of them — a background you can
		   follow is a competing subject. This is the level where you notice there
		   is *something* on the wall and then stop looking at it. */
		opacity: 0.16;
		/* And kept out of the middle column entirely. */
		mask-image: linear-gradient(
			90deg,
			#000,
			rgba(0, 0, 0, 0.25) 28%,
			rgba(0, 0, 0, 0.25) 72%,
			#000
		);
	}
	.ink {
		fill: none;
		stroke: #00d6ff;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.3;
	}
	/*
	 * The eraser strokes, inside the mask. Black removes; the blur is what stops
	 * the result reading as three clean stripes and makes it a smear instead.
	 * Not quite opaque, so the ink survives faintly even where the cloth went —
	 * a board nobody has cleaned properly since the first meeting.
	 */
	.wipe {
		fill: none;
		stroke: rgba(0, 0, 0, 0.88);
		stroke-width: 110;
		stroke-linecap: round;
		filter: blur(26px);
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
	.gal-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: #00d6ff;
		margin-bottom: 0.75rem;
	}
	/* Slate rule: the kicker runs into a hairline that carries the eye across the
	   measure instead of stopping dead. It uses the width the stacked kicker left
	   empty, and gives this chapter an opening that isn't the same three moves
	   every other one makes. */
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00d6ff;
		margin-bottom: 1rem;
	}
	.eyebrow::after {
		content: '';
		flex: 1;
		height: 1px;
		background: currentColor;
		opacity: 0.3;
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
		color: oklch(from #00f2c3 0.82 calc(c * 0.9) h);
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
	.archive-lead {
		margin: 0 0 0.9rem;
		line-height: 1.6;
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
</style>
