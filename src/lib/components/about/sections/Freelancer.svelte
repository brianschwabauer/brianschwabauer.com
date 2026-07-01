<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ArchiveFrame from '../primitives/ArchiveFrame.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const reel = [
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-08-24_brian_demo_reel_2015-logo_animation_over_sunset_timelapse.avif',
			width: 480,
			height: 204,
			caption: '2015 demo reel · open',
			alt: '2015 demo reel · open',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2014-07-25_missouri_reverse_transfer-animated_character_and_graphics.avif',
			width: 480,
			height: 270,
			caption: 'MO Reverse Transfer · motion graphics',
			alt: 'MO Reverse Transfer · motion graphics',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2014-07-25_missouri_reverse_transfer-logo_animation.avif',
			width: 480,
			height: 270,
			caption: 'MO Reverse Transfer · logo',
			alt: 'MO Reverse Transfer · logo',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2014-10-05_decisionfx_logo_animation.avif',
			width: 480,
			height: 270,
			caption: 'DecisionFX · logo animation',
			alt: 'DecisionFX · logo animation',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2014-11-24_ursa_promo-logo_animation.avif',
			width: 480,
			height: 270,
			caption: 'URSA · promo',
			alt: 'URSA · promo',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-02-08_engage_mobile_5_logo_animation.avif',
			width: 480,
			height: 270,
			caption: 'Engage Mobile · 5yr anniversary',
			alt: 'Engage Mobile · 5yr anniversary',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-04-25_humane_society-logo_animation.avif',
			width: 480,
			height: 204,
			caption: 'Humane Society · logo',
			alt: 'Humane Society · logo',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-08-04_adpi_recruitment_video_2015-women_jumping_off_fountain_ledge_in_slowmo.avif',
			width: 480,
			height: 204,
			caption: 'ADPi · recruitment',
			alt: 'ADPi · recruitment',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-08-04_adpi_recruitment_video_2015-women_dancing_and_laughing_with_fireworks.avif',
			width: 480,
			height: 204,
			caption: 'ADPi · recruitment 2',
			alt: 'ADPi · recruitment 2',
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2012-03-22_holy_cross_lutheran_church_tshirt_commericial-angel_appears.avif',
			width: 480,
			height: 270,
			caption: 'Holy Cross · t-shirt commercial',
			alt: 'Holy Cross · t-shirt commercial',
		},
	];

	const weddingImages: GalleryItem[] = [
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-08-24_brian_demo_reel_2015-wedding_footage_of_bride_in_dress_smiling.avif',
			width: 480,
			height: 204,
		},
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2015-08-24_brian_demo_reel_2015-wedding_footage_bride_walks_towards_smiling_groom.avif',
			width: 480,
			height: 204,
		},
	];

	// Standalone clickable LazyMedias in document order:
	// 0: business card image, 1..N: reel cards
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image' as const,
			src: 'https://cdn.brianschwabauer.com/media/2013-03-12_brian_schwabauer_business_card.avif',
			width: 1062,
			height: 615,
			caption: 'The actual business card',
			alt: 'The actual business card',
		},
		...reel,
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="freelancer" year="2016" label="Freelancer" theme="hustle">
	<div class="container">
		<Reveal>
			<YearMark
				year="2016"
				subtitle="Freelancer · Wedding Films · Brand Work"
				color="#ffb84d" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">POST-GRAD HUSTLE</div>
				<h2 class="title">
					I bought
					<br />
					<span class="grad">business cards.</span>
				</h2>
				<p class="lede">
					College ended. I was freelancing full time. New site. New cards. A whole 2015
					demo reel cut specifically to land me freelance gigs. I was technically a
					"videographer", but in practice the gigs would shape-shift — sometimes it was a
					logo animation, sometimes a kickstarter video, sometimes a promotional
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
		</div>

		<div class="card-stack">
			<Reveal variant="up">
				<div class="biz-card">
					<div class="biz-name">Brian Schwabauer</div>
					<div class="biz-role">video · motion · interactive</div>
					<div class="biz-cut"></div>
					<div class="biz-meta">brian@brianschwabauer.com</div>
				</div>
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2013-03-12_brian_schwabauer_business_card.avif"
					alt="The actual business card"
					ratio="16 / 9"
					onclick={(e) => gallery?.open(0, e.currentTarget)} />
			</Reveal>
		</div>

		<div class="reel-block">
			<Reveal>
				<h3 class="sub">A slice of the portfolio</h3>
				<p>Brand work, motion graphics, logo animations, promos. A taste:</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="reel-grid">
					{#each reel as item, i}
						<figure class="reel-card" style:--i={i}>
							<LazyMedia
								src={item.src}
								alt={item.caption}
								ratio="16 / 9"
								onclick={(e) => gallery?.open(1 + i, e.currentTarget)} />
							<figcaption>{item.caption}</figcaption>
						</figure>
					{/each}
				</div>
			</Reveal>
		</div>

		<div class="portfolio-list">
			<Reveal>
				<h3 class="sub">More, for the curious</h3>
				<ul>
					<li>
						<strong>Net Price Calculator</strong>
						— a typography motion-graphics piece for the U.S. Department of Education's Net
						Price Calculator video contest.
						<em>1st place.</em>
					</li>
					<li>
						<strong>Missouri Reverse Transfer</strong>
						— promo for a State of Missouri program that lets 4-year students retroactively
						earn their associates.
					</li>
					<li>
						<strong>Bioblitz 2014</strong>
						— highlight video for a local environment-awareness event.
					</li>
					<li>
						<strong>DecisionFX</strong>
						— logo animation for a Kansas City data-collection company.
					</li>
					<li>
						<strong>URSA Experience</strong>
						— promo animation for MSU's first-year summer program.
					</li>
					<li>
						<strong>Engage Mobile</strong>
						— 5-year anniversary logo piece using one icon from every app they'd ever built.
					</li>
					<li>
						<strong>Humane Society</strong>
						— promo for the Southwest Missouri branch.
					</li>
					<li>
						<strong>ADPi Recruitment</strong>
						— sorority recruitment video at MSU.
					</li>
					<li>
						<strong>"Met You" by Tamish</strong>
						— official music video; I did the post, another videographer shot.
					</li>
					<li>
						<strong>121 Live</strong>
						— Kickstarter video for a startup that wanted to share private live streams across
						the world.
					</li>
					<li>
						<strong>Wedding films</strong>
						— many. The Schwikes brand never took off. The work was great.
					</li>
				</ul>
			</Reveal>
		</div>

		<div class="weddings">
			<Reveal>
				<h3 class="sub">Wedding films</h3>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<LightboxGallery key="freelancer-wedding" items={weddingImages} display="masonry-row" size="2" />
			</Reveal>
		</div>

		<div class="archives">
			<Reveal>
				<h3 class="sub">Sites I built and archived</h3>
				<p>
					A handful of small-business marketing sites I designed and built during this
					stretch. All of these still load — open them up.
				</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="archive-stack">
					<ArchiveFrame
						src="http://cdn.brianschwabauer.com/site/schwikes/index.html"
						title="Schwikes — the wedding business that didn't quite happen"
						label="Open Schwikes" />
					<ArchiveFrame
						src="https://cdn.brianschwabauer.com/site/nortonschmidt/v2/index.html"
						title="Norton & Schmidt — engineering firm in KC"
						label="Open Norton & Schmidt" />
					<ArchiveFrame
						src="https://cdn.brianschwabauer.com/site/soundraiser/index.html"
						title="SoundRaiser — fundraising platform for music programs"
						label="Open SoundRaiser" />
				</div>
			</Reveal>
		</div>
	</div>

	<LightboxGallery bind:this={gallery} key="freelancer" items={sectionExtras} />
</SectionShell>

<style>
	:global([data-theme='hustle']) {
		background:
			radial-gradient(ellipse at top right, rgba(255, 184, 77, 0.08), transparent 50%),
			linear-gradient(180deg, #0a0805, #14100a 50%, #06050a);
		color: #faf2e2;
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
		background: linear-gradient(90deg, #ffb84d, #ff6688, #ffd934);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
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

	.card-stack {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		align-items: center;
		margin: 3rem 0 4rem;
	}
	@media (max-width: 768px) {
		.card-stack {
			grid-template-columns: 1fr;
		}
	}
	.biz-card {
		aspect-ratio: 16 / 9;
		max-width: 360px;
		background: linear-gradient(135deg, #1e1814, #0d0a08);
		border: 1px solid rgba(255, 184, 77, 0.3);
		border-radius: 10px;
		padding: 1.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-family: var(--font-mono);
		color: #ffb84d;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		transform: rotate(-3deg);
		transition: transform 300ms ease;
	}
	.biz-card:hover {
		transition-duration: 0s;
		transform: rotate(0deg) scale(1.02);
	}
	.biz-name {
		font-size: 1.6rem;
		font-weight: 800;
		color: #fff;
		letter-spacing: 0.02em;
	}
	.biz-role {
		font-size: 0.85rem;
		letter-spacing: 0.18em;
	}
	.biz-cut {
		flex: 1;
		border-bottom: 1px dashed rgba(255, 184, 77, 0.3);
		margin: 0.5rem 0;
	}
	.biz-meta {
		font-size: 0.75rem;
		color: rgba(250, 242, 226, 0.7);
	}

	.reel-block,
	.portfolio-list,
	.weddings,
	.archives {
		margin: 4rem 0;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}

	.reel-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 8px;
		margin-top: 1.5rem;
	}
	.reel-card {
		margin: 0;
		position: relative;
		overflow: hidden;
		border-radius: 8px;
		transition: transform 200ms ease;
	}
	.reel-card:hover {
		transition-duration: 0s;
		transform: translateY(-4px);
	}
	.reel-card figcaption {
		position: absolute;
		left: 0.6rem;
		bottom: 0.6rem;
		right: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		padding: 0.25rem 0.55rem;
		background: rgba(0, 0, 0, 0.75);
		color: #ffb84d;
		border-radius: 4px;
		opacity: 0;
		transition: opacity 200ms ease;
	}
	.reel-card:hover figcaption {
		transition-duration: 0s;
		opacity: 1;
	}

	.portfolio-list ul {
		list-style: none;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 0.6rem;
		margin: 0;
	}
	.portfolio-list li {
		padding: 0.9rem 1.1rem;
		background: rgba(255, 184, 77, 0.04);
		border-left: 2px solid #ffb84d;
		border-radius: 0 6px 6px 0;
		font-size: 0.92rem;
		line-height: 1.5;
	}
	.portfolio-list strong {
		color: #ffb84d;
	}
	.portfolio-list em {
		color: #ffd934;
		font-style: italic;
	}

	.archive-stack {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}
</style>
