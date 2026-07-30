<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ArchiveTabs from '../primitives/ArchiveTabs.svelte';
	import ShippedWall from '../primitives/ShippedWall.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const CDN = 'https://cdn.brianschwabauer.com/media/';

	/** `caption` doubles as `alt` everywhere in this section — one string, one edit. */
	function img(file: string, width: number, height: number, caption: string) {
		return {
			type: 'image' as const,
			src: CDN + file,
			width,
			height,
			caption,
			alt: caption,
		};
	}

	// Everything the freelance years actually produced, in one gallery: the motion
	// and logo work first, then the films the reel was cut from, then the design
	// and web work, then the sets and the gear that made it all possible.
	const work: GalleryItem[] = [
		img(
			'2015-08-24_brian_demo_reel_2015-logo_animation_over_sunset_timelapse.avif',
			480,
			204,
			'My own logo, animated over a sunset timelapse — the open of the 2015 reel',
		),
		img(
			'2014-07-25_missouri_reverse_transfer-animated_character_and_graphics.avif',
			480,
			270,
			'Missouri Reverse Transfer · animated character and graphics for a State of Missouri program',
		),
		img(
			'2014-07-25_missouri_reverse_transfer-logo_animation.avif',
			480,
			270,
			'Missouri Reverse Transfer · logo animation',
		),
		img(
			'2014-10-05_decisionfx_logo_animation.avif',
			480,
			270,
			'DecisionFX · logo animation for a Kansas City data-collection company',
		),
		img(
			'2014-11-24_ursa_promo-logo_animation.avif',
			480,
			270,
			"URSA Experience · promo animation for MSU's first-year summer program",
		),
		img(
			'2015-02-08_engage_mobile_5_logo_animation.avif',
			480,
			270,
			"Engage Mobile · a 5-year anniversary piece built from one icon of every app they'd shipped",
		),
		img(
			'2015-02-16_engagecloud_solutions_logo_animation.avif',
			480,
			270,
			'EngageCloud Solutions · logo animation',
		),
		img(
			'2015-04-25_humane_society-logo_animation.avif',
			480,
			204,
			'Humane Society of Southwest Missouri · logo animation',
		),
		img(
			'2016-04-25_121_kickstarter_video-logo_animation.avif',
			480,
			270,
			'121 Live · logo animation for the Kickstarter video',
		),
		img(
			'2016-04-25_121_kickstarter_video-demo_video_animation.avif',
			480,
			270,
			'121 Live · animated product demo — private live streams, shared anywhere',
		),
		img(
			'2016-04-25_121_kickstarter_video-ui_animation_snapshot_1.avif',
			1920,
			1080,
			'121 Live · app UI animated for the campaign',
		),
		img(
			'2016-04-25_121_kickstarter_video-phone_screen_replacement_visual_effect_snapshot.avif',
			1920,
			1080,
			'121 Live · phone screen replaced in post, frame by frame',
		),
		img(
			'2016-04-25_121_kickstarter_video-360_sphere_snapshot.avif',
			1920,
			1080,
			'121 Live · a 360 capture, mapped to a sphere',
		),
		img(
			'2015-12-02_met_you-tamish/poster.jpg',
			1920,
			1080,
			'"Met You" by Tamish · official music video — another videographer shot it, I did the post',
		),
		img(
			'2012-01-12_net_price_calculator/poster.jpg',
			1920,
			1080,
			"Net Price Calculator · a typography piece for the U.S. Department of Education's video contest. First place",
		),
		img(
			'2015-08-04_adpi_recruitment_video_2015-women_jumping_off_fountain_ledge_in_slowmo.avif',
			480,
			204,
			'ADPi recruitment · the fountain jump, in slow motion',
		),
		img(
			'2015-08-04_adpi_recruitment_video_2015-women_dancing_and_laughing_with_fireworks.avif',
			480,
			204,
			'ADPi recruitment · dancing, laughing, fireworks',
		),
		img(
			'2012-03-22_holy_cross_lutheran_church_tshirt_commericial-angel_appears.avif',
			480,
			270,
			'Holy Cross Lutheran · a t-shirt commercial, complete with an angel',
		),
		img(
			'2013-02-23_schwikes_studios_pricing_graphics_for_website.avif',
			1920,
			1024,
			'Schwikes Studios · the pricing graphics for the wedding business Kevin and I tried to start',
		),
		img(
			'2016-01-01_one_part_laugh_one_part_life_podcast_website_design_mockup_with_tablet_and_phone.avif',
			1920,
			1080,
			'One Part Laugh, One Part Life · website design for a podcast',
		),
		img(
			'2015-02-07_video_shoot_behind_the_scenes-filming_beheadstrong_promo_video_interview.avif',
			2048,
			1152,
			'On set · filming an interview for the Beheadstrong promo',
		),
		img(
			'2015-04-29_video_shoot_behind_the_scenes-humane_society_promo_video_shoot_1.avif',
			2048,
			1152,
			'On set · the Humane Society promo shoot',
		),
		img(
			'2015-04-29_video_shoot_behind_the_scenes-humane_society_promo_video_shoot_2.avif',
			2048,
			1152,
			'On set · the Humane Society promo shoot, other side of the room',
		),
		img(
			'2015-06-03_video_shoot_behind_the_scenes-one_year_adventure_novel_promo_video_shoot.avif',
			2048,
			1152,
			'On set · the One Year Adventure Novel promo shoot',
		),
		img(
			'2016-07-07_video_shoot_behind_the_scenes-church_video_set_photo_with_lights.avif',
			2048,
			1152,
			'On set · a church video, lit properly for once',
		),
		img(
			'2013-11-09_video_shoot_behind_the_scenes-filming_cross_fit_workout_competition.avif',
			2048,
			1536,
			'On set · shooting a CrossFit competition',
		),
		img(
			'2014-10-17_video_shoot_behind_the_scenes-filming_sports_at_missouri_state_university.avif',
			2048,
			1536,
			'On set · sports at Missouri State',
		),
	];

	const weddingImages: GalleryItem[] = [
		img(
			'2015-08-24_brian_demo_reel_2015-wedding_footage_of_bride_in_dress_smiling.avif',
			480,
			204,
			'The bride, before the doors open',
		),
		img(
			'2015-08-24_brian_demo_reel_2015-wedding_footage_bride_walks_towards_smiling_groom.avif',
			480,
			204,
			'The walk down the aisle',
		),
		img(
			'2015-08-24_brian_demo_reel_2015-wedding_footage_of_bride_smiling.avif',
			480,
			204,
			'A smile caught between takes',
		),
		img(
			'2015-08-24_brian_demo_reel_2015-wedding_footage_of_dancing_reception.avif',
			480,
			204,
			'The reception, once the dancing starts',
		),
		img(
			'2013-09-28_maggie_and_brian_wedding_video-stillframe_1.avif',
			1920,
			1080,
			'Maggie & Brian, 2013 · a frame from their film',
		),
		img(
			'2013-09-28_video_shoot_behind_the_scenes-filming_wedding_group_photo.avif',
			2048,
			1536,
			'On set · working around the group photo',
		),
		img(
			'2014-03-01_video_shoot_behind_the_scenes-filming_wedding_at_big_church.avif',
			2048,
			1536,
			'On set · a wedding in a very large church',
		),
	];

	// Standalone clickable LazyMedias in document order:
	// 0: business card, 1: 2015 demo reel, 2: wedding film
	const sectionExtras: GalleryItem[] = [
		img(
			'2013-03-12_brian_schwabauer_business_card.avif',
			1062,
			615,
			'The actual business card',
		),
		{
			type: 'video' as const,
			src: `${CDN}2015-08-24_brian_demo_reel_2015/master.m3u8`,
			poster: `${CDN}2015-08-24_brian_demo_reel_2015/poster.jpg`,
			width: 1920,
			height: 818,
			caption: 'Brian Schwabauer — 2015 demo reel',
			alt: 'Brian Schwabauer — 2015 demo reel',
		},
		{
			type: 'video' as const,
			src: `${CDN}2015-06-27_jordan_and_brian_wedding-highlight_video/master.m3u8`,
			poster: `${CDN}2015-06-27_jordan_and_brian_wedding-highlight_video/poster.jpg`,
			width: 1920,
			height: 818,
			caption: 'Jordan & Brian (2015) — our wedding highlight film',
			alt: 'Jordan & Brian (2015) — wedding highlight film',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();

	const STAMPS = [
		{ label: 'PAID', kind: 'paid', x: 3, y: 9, rot: -13, scale: 1.1 },
		{ label: 'SENT', kind: 'sent', x: 79, y: 5, rot: 8, scale: 0.85 },
		{ label: 'PAID', kind: 'paid', x: 84, y: 24, rot: -6, scale: 0.95 },
		{ label: 'OVERDUE', kind: 'overdue', x: 1, y: 34, rot: 17, scale: 1 },
		{ label: 'PAID', kind: 'paid', x: 72, y: 44, rot: -19, scale: 0.8 },
		{ label: 'SENT', kind: 'sent', x: 6, y: 55, rot: 5, scale: 1.05 },
		{ label: 'PAID', kind: 'paid', x: 82, y: 63, rot: 11, scale: 0.9 },
		{ label: 'PAID', kind: 'paid', x: 2, y: 74, rot: -8, scale: 0.88 },
		{ label: 'OVERDUE', kind: 'overdue', x: 74, y: 82, rot: -14, scale: 0.92 },
		{ label: 'SENT', kind: 'sent', x: 8, y: 91, rot: 12, scale: 1 },
	];
</script>

<SectionShell
	id="freelancer"
	year="2016"
	label="Freelancer"
	theme="hustle"
	class="hustle-shell">
	<!--
	  The year of invoices. Rubber stamps at the angles a hand actually leaves
	  them — never square, never all the same rotation, and PAID outnumbering the
	  other two, which is the honest ratio and also the happier one. They spread
	  across the written half of the chapter only — the shipped wall at the end is
	  its own set piece and gets a clean sheet.
	-->
	<div class="hustle-body">
		<div class="stamps" aria-hidden="true">
			{#each STAMPS as s, i (i)}
				<span
					class="stamp {s.kind}"
					style:left="{s.x}%"
					style:top="{s.y}%"
					style:rotate="{s.rot}deg"
					style:--scale={s.scale}>
					{s.label}
				</span>
			{/each}
		</div>

		<div class="container">
			<Reveal>
				<YearMark
					year="2016"
					subtitle="Freelancer · Wedding Films · Brand Work"
					color="#ffb84d" />
			</Reveal>

			<div class="lockup">
				<Reveal class="lockup-copy">
					<div class="eyebrow">POST-GRAD HUSTLE</div>
					<h2 class="title">
						I bought
						<br />
						<span class="grad">business cards.</span>
					</h2>
					<p class="lede">
						College ended. I was freelancing full time. New site. New cards. A whole 2015
						demo reel cut specifically to land me freelance gigs. I was technically a
						"videographer", but in practice the gigs would shape-shift — sometimes it was
						a logo animation, sometimes a kickstarter video, sometimes a promotional
						motion-graphics piece, sometimes a wedding film, sometimes a WordPress theme.
					</p>
					<p class="lede">
						Most freelance videographers eventually get to wedding films. I did too. Kevin
						and I tried to spin a wedding business out of it called <strong>
							Schwikes
						</strong>
						— I'd shoot, he'd DJ. It didn't really work. The wedding films themselves did, though.
					</p>
				</Reveal>

				<!--
				  A short stack, the way a box of 500 actually sits on a desk: the two
				  underneath show only an edge, and nothing in the stack is square to
				  anything else. The back two are decoration — one card is clickable.
				-->
				<Reveal variant="up" delay={80} class="lockup-cards">
					<div class="cards">
						<div class="card back back-2" aria-hidden="true"></div>
						<div class="card back back-1" aria-hidden="true"></div>
						<LazyMedia
							class="card top"
							src="{CDN}2013-03-12_brian_schwabauer_business_card.avif"
							alt="The actual business card"
							ratio="1062 / 615"
							onclick={(e) => gallery?.open(0, e.currentTarget)} />
					</div>
				</Reveal>
			</div>

			<div class="reel-feature">
				<Reveal>
					<div class="reel-eyebrow">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<polygon points="6,4 22,12 6,20" fill="currentColor" />
						</svg>
						<span>THE 2015 DEMO REEL · 1:32</span>
					</div>
					<h3 class="reel-headline">Ten years of work. Ninety seconds.</h3>
					<p class="reel-copy">
						By 2015 I had almost a decade behind me — short films, music videos, motion
						graphics, VFX, wedding films, brand work. This is the reel I cut from all of
						it. It's still the fastest way to see what these years actually looked like.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<div class="reel-stage">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2015-08-24_brian_demo_reel_2015/poster.jpg"
							alt="Brian Schwabauer — 2015 demo reel"
							ratio="1920 / 818"
							rounded={false}
							video
							onclick={(e) => gallery?.open(1, e.currentTarget)} />
					</div>
				</Reveal>
			</div>

			<div class="reel-block">
				<Reveal class="bleed-head">
					<h3 class="sub">The pieces behind it</h3>
					<p>
						The work the reel was cut from, and the years around it — logo animations,
						promos, campaign videos, client sites, the sets they were shot on, and the
						gear I built because I couldn't afford to buy it:
					</p>
				</Reveal>

				<Reveal variant="up" delay={100}>
					<div class="gallery-bleed">
						<LightboxGallery
							key="freelancer-work"
							items={work}
							display="masonry"
							size="1" />
					</div>
				</Reveal>

				<div class="weddings">
					<Reveal>
						<h3 class="sub">Wedding films</h3>
						<p>
							Many of them — most for other couples. But the one I'm proudest of is the
							one I was standing in: Jordan and I got married in June 2015, and I cut our
							own highlight film.
						</p>
					</Reveal>
					<Reveal variant="up" delay={80}>
						<div class="inline-video">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2015-06-27_jordan_and_brian_wedding-highlight_video/poster.jpg"
								alt="Jordan & Brian (2015) — our wedding highlight film"
								ratio="1920 / 818"
								video
								onclick={(e) => gallery?.open(2, e.currentTarget)} />
						</div>
					</Reveal>
					<Reveal variant="up" delay={120}>
						<LightboxGallery
							key="freelancer-wedding"
							items={weddingImages}
							display="masonry-row"
							size="2" />
					</Reveal>
				</div>

				<div class="archives">
					<Reveal>
						<h3 class="sub">Sites I built and archived</h3>
						<p>Three client sites, preserved exactly as they shipped:</p>
					</Reveal>
					<Reveal variant="up" delay={100}>
						<div class="archive-stack">
							<ArchiveTabs
								tabs={[
									{
										title: 'Schwikes',
										src: 'http://cdn.brianschwabauer.com/site/schwikes/index.html',
									},
									{
										title: 'Norton & Schmidt',
										src: 'https://cdn.brianschwabauer.com/site/nortonschmidt/v2/index.html',
									},
									{
										title: 'SoundRaiser',
										src: 'https://cdn.brianschwabauer.com/site/soundraiser/index.html',
									},
								]} />
						</div>
					</Reveal>
				</div>
			</div>

			<LightboxGallery
				bind:this={gallery}
				key="freelancer"
				items={sectionExtras}
				autoplay_video />
		</div>
	</div>

	<!--
	  The chapter's last word is a picture, not a sentence: every screen that
	  shipped out of these years, scrubbing past on the diagonal.
	-->
	<ShippedWall />
</SectionShell>

<style>
	/* Lamp-lit rather than lights-out: a desk at the end of a long day, not an
	   empty room. The wash sits top-right where a desk lamp would be. */
	:global([data-theme='hustle']) {
		background:
			radial-gradient(
				ellipse 110% 70% at 78% 0%,
				oklch(0.52 0.115 68 / 0.45),
				transparent 62%
			),
			linear-gradient(
				180deg,
				oklch(0.24 0.05 66),
				oklch(0.3 0.072 62) 52%,
				oklch(0.2 0.045 54)
			);
		color: #faf2e2;
	}
	/* This chapter now ends in a 250vh pinned scrub, so the 1200px default
	   estimate is off by an order of magnitude — which throws off hash jumps
	   until the section has rendered once. */
	:global(.section-shell.hustle-shell) {
		contain-intrinsic-size: 1px 6000px;
	}
	@supports (contain-intrinsic-size: auto 1px) {
		:global(.section-shell.hustle-shell) {
			contain-intrinsic-size: auto 1px auto 6000px;
		}
	}
	/* The written half of the chapter. The stamps are absolute to *this*, not to
	   the section, so the shipped wall at the end stays unstamped. */
	.hustle-body {
		position: relative;
	}
	.stamps {
		position: absolute;
		inset: 0;
		pointer-events: none;
		/* Out of the way of the middle column, where the copy lives. */
		mask-image: linear-gradient(
			90deg,
			#000,
			rgba(0, 0, 0, 0.15) 30%,
			rgba(0, 0, 0, 0.15) 70%,
			#000
		);
	}
	.stamp {
		position: absolute;
		font-family: var(--font-mono);
		font-weight: 800;
		font-size: clamp(0.8rem, 1.6vw, 1.25rem);
		letter-spacing: 0.2em;
		padding: 0.35em 0.7em;
		border: 3px solid currentColor;
		border-radius: 4px;
		scale: var(--scale);
		white-space: nowrap;
		/* Rubber never lays down evenly — the ink is thin enough to see the paper
		   through it, and the box is heavier than the letters. */
		opacity: 0.16;
	}
	.paid {
		color: #6bd68a;
	}
	.sent {
		color: #ffb84d;
	}
	.overdue {
		color: #ff6b5e;
		/* The one you actually looked at. */
		opacity: 0.22;
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	/* Copy on the left, the cards to its right, both hanging off the same top
	   edge — the headline is about buying them, so they should be in frame. */
	.lockup {
		display: grid;
		gap: clamp(2.5rem, 5vw, 4rem);
		align-items: start;
		margin-bottom: 4rem;
	}
	@media (min-width: 900px) {
		.lockup {
			grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
			align-items: center;
		}
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffb84d;
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
		color: oklch(from #ff6688 0.82 calc(c * 0.9) h);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
		margin-bottom: 1rem;
	}
	.lede strong {
		color: #ffb84d;
	}

	/* A stack of cards, seen from just off-square. The two underneath are
	   decoration — same image, nudged and rotated so only their edges read. The
	   whole stack tips toward the reader on hover, as one object. */
	.cards {
		position: relative;
		width: min(100%, 26rem);
		margin-inline: auto;
		aspect-ratio: 1062 / 615;
	}
	.cards :global(.card) {
		position: absolute;
		inset: 0;
		border-radius: 10px;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		transition:
			rotate 300ms ease,
			translate 300ms ease;
	}
	.back {
		background: url('https://cdn.brianschwabauer.com/media/2013-03-12_brian_schwabauer_business_card.avif')
			center / cover no-repeat;
		/* The ones underneath sit in shadow — you see an edge, not a second copy. */
		filter: brightness(0.55);
	}
	.back-2 {
		rotate: -7deg;
		translate: -1.5% 3.5%;
	}
	.back-1 {
		rotate: 4deg;
		translate: 1.5% 1.5%;
	}
	.cards :global(.top) {
		rotate: -2deg;
	}
	.cards:hover :global(.card) {
		transition-duration: 0s;
	}
	.cards:hover .back-2 {
		rotate: -11deg;
		translate: -4% 5%;
	}
	.cards:hover .back-1 {
		rotate: 7deg;
		translate: 4% 2%;
	}
	.cards:hover :global(.top) {
		rotate: 0deg;
		translate: 0 -2%;
	}
	@media (prefers-reduced-motion: reduce) {
		.cards :global(.card) {
			transition: none;
		}
	}

	.reel-feature,
	.reel-block,
	.weddings,
	.archives {
		margin: 4rem 0;
	}
	.reel-feature {
		margin: 4.5rem 0;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}
	.weddings p {
		max-width: 44rem;
		line-height: 1.6;
		margin: 0 0 1rem;
	}
	.inline-video {
		margin: 1.5rem 0 0.75rem;
	}

	.reel-eyebrow {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.28em;
		color: #ffb84d;
		margin-bottom: 0.85rem;
	}
	.reel-eyebrow svg {
		width: 14px;
		height: 14px;
	}
	.reel-headline {
		font-size: clamp(1.7rem, 3.4vw, 2.6rem);
		font-weight: 900;
		line-height: 1.05;
		letter-spacing: -0.02em;
		margin: 0 0 0.7rem;
	}
	.reel-copy {
		max-width: 46rem;
		line-height: 1.6;
		margin: 0;
		color: rgba(250, 242, 226, 0.85);
	}
	.reel-stage {
		position: relative;
		margin-top: 1.75rem;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid rgba(255, 184, 77, 0.3);
		box-shadow:
			0 40px 90px rgba(0, 0, 0, 0.55),
			0 6px 24px rgba(255, 184, 77, 0.14);
	}

	/* The gallery bleeds wide, so it needs its own vertical room — otherwise it
	   runs straight into the wedding block that follows. */
	.reel-block :global(.gallery-bleed) {
		margin-top: 1.75rem;
		margin-bottom: 1rem;
	}

	.archive-stack {
		margin-top: 1.5rem;
	}
</style>
