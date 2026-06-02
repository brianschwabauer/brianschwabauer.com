<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import { Gallery, type GalleryItem } from '@delightstack/components/media';
	import { imageItem, imageItems } from '../media';

	import Expandable from '../primitives/Expandable.svelte';

	const dashboardMockups = [
		{
			src: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_list.avif',
			caption: 'Project list · dark mode',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif',
			caption: 'Project detail',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_client_page.avif',
			caption: 'Project · client view',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_settings_page.avif',
			caption: 'Settings',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_mockup-clients_page_empty.avif',
			caption: 'Clients (empty state)',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_mockup-projects_page_empty.avif',
			caption: 'Projects (empty state)',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_mockup-delivery_page_dark.avif',
			caption: 'Delivery page · dark',
		},
		{
			src: '2026-01-01_show_and_tour-dashboard_mockup-media_player.avif',
			caption: 'Built-in media player',
		},
	];

	const deliveryPages = [
		{
			src: '2026-01-01_show_and_tour-legacy_delivery_page_screenshot-963_n1950_rd.avif',
			caption: '963 N 1950 RD · client delivery',
		},
		{
			src: '2026-01-01_show_and_tour-property_website_screenshot-8700leeboulevard.avif',
			caption: '8700 Lee Boulevard · property site',
		},
		{
			src: '2026-01-01_show_and_tour-property_website_screenshot-prairievillageestate.avif',
			caption: 'Prairie Village Estate · property site',
		},
	];

	const brand = [
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-laptop_mockup.avif',
			caption: 'On a laptop',
		},
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-app_icon_mockup.avif',
			caption: 'App icon',
		},
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-website_mockup.avif',
			caption: 'Marketing site',
		},
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-business_card_mockup.avif',
			caption: 'Business cards',
		},
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-instagram_ad_mockup.avif',
			caption: 'Instagram ad',
		},
		{
			src: '2026-01-01_show_and_tour-brand_style_guide-first_page.avif',
			caption: 'Brand guide cover',
		},
	];

	const features = [
		{
			title: 'Delivery Pages',
			text: 'Premium project delivery experiences where clients can download files, pay invoices, and view licensing — all branded as the photographer.',
		},
		{
			title: 'Property Websites',
			text: 'MLS-compliant virtual tours and property sites with thoughtful, beautiful layouts.',
		},
		{
			title: 'Pay-to-Download',
			text: 'Optional gate that requires clients to pay the invoice before downloading the media. Never get paid late again.',
		},
		{
			title: 'White-labeled',
			text: 'Your brand, your domain, your SSL, your terms. We sit invisibly behind it.',
		},
		{
			title: 'Integrations',
			text: 'QuickBooks, Stripe, Square. Invoices stay synced across the tools photographers already use.',
		},
		{
			title: 'Unlimited',
			text: 'Unlimited property sites, deliveries, and clients. No per-seat math.',
		},
	];

	const heroShot: GalleryItem[] = [
		imageItem(
			'2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif',
			'Show&Tour — project detail page',
			'Show&Tour · project detail page',
		),
	];
	let gallery = $state<ReturnType<typeof Gallery>>();
</script>

<SectionShell id="showandtour" year="2019" label="Show&Tour" theme="snt">
	<div class="snt-bg" aria-hidden="true"></div>

	<div class="container">
		<Reveal>
			<YearMark year="2019 → today" subtitle="What I'm building now" color="#00f2c3" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">CURRENT FOCUS · CO-FOUNDER</div>
				<h2 class="title">
					<span class="snt-mark">
						<img
							src="https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-logo-icon_flash.svg"
							alt="Show&Tour Logo" />
					</span>
					Show&amp;Tour
				</h2>
				<p class="tagline">The best way to deliver real estate media.</p>
				<p class="lede">
					<a href="https://joshmais.com" target="_blank" rel="noopener">Josh</a>
					and I started Show&amp;Tour in 2019. It's a project delivery platform for real estate
					photographers — beautiful property websites, branded delivery pages, smart invoicing,
					and a workflow built around how photographers actually work.
				</p>
				<p class="lede">
					This is my full-time job now. We have thousands of users. I'm incredibly proud
					of what we've built.
				</p>
				<div class="cta-row">
					<a
						class="cta-primary"
						href="https://showandtour.com"
						target="_blank"
						rel="noopener">
						showandtour.com
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M5 12h14M13 6l6 6-6 6"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round" />
						</svg>
					</a>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="hero-shot">
				<LazyMedia
					src="2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif"
					alt="Show&Tour — project detail page"
					ratio="16 / 9"
					rounded={false}
					class="hero-img"
					onclick={(e) => gallery?.open(0, e.currentTarget)} />
				<div class="hero-glow"></div>
			</div>
		</Reveal>

		<div class="features">
			<Reveal>
				<h3 class="sub">What it does, in six bullets</h3>
			</Reveal>
			<div class="features-grid">
				{#each features as f, i}
					<Reveal variant="up" delay={50 + (i % 3) * 80}>
						<div class="feature">
							<div class="feature-num">{String(i + 1).padStart(2, '0')}</div>
							<div>
								<h4>{f.title}</h4>
								<p>{f.text}</p>
							</div>
						</div>
					</Reveal>
				{/each}
			</div>
		</div>

		<div class="dash-block">
			<Reveal>
				<h3 class="sub">The dashboard</h3>
				<p>Where photographers run their business day to day.</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="gallery-bleed">
					<Gallery items={imageItems(dashboardMockups)} display="masonry" size="2" />
				</div>
			</Reveal>
		</div>

		<div class="delivery-block">
			<Reveal>
				<h3 class="sub">Property websites &amp; delivery pages</h3>
				<p>What the photographer's clients actually see.</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<Gallery items={imageItems(deliveryPages)} display="masonry-row" size="2" />
			</Reveal>
		</div>

		<div class="brand-block">
			<Reveal>
				<h3 class="sub">Brand · the rest</h3>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="gallery-bleed">
					<Gallery items={imageItems(brand)} display="masonry" size="2" />
				</div>
			</Reveal>
		</div>
	</div>

	<Gallery bind:this={gallery} items={heroShot} display="lightbox" />
</SectionShell>

<style>
	:global([data-theme='snt']) {
		background:
			radial-gradient(circle at 20% 20%, rgba(0, 242, 195, 0.1), transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(108, 99, 255, 0.08), transparent 50%),
			linear-gradient(180deg, #050a0c, #08161a 50%, #050a10);
		color: #e8faf6;
	}
	.snt-bg {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 242, 195, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 242, 195, 0.04) 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
		pointer-events: none;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}

	.lockup {
		margin-bottom: 3rem;
		max-width: 64rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 1.2rem;
	}
	.title {
		font-size: clamp(2.8rem, 9vw, 6rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 0.6rem;
		display: flex;
		align-items: center;
		gap: 1.2rem;
		flex-wrap: wrap;
	}
	.snt-mark {
		display: inline-grid;
		place-items: center;
		width: clamp(60px, 9vw, 100px);
		height: clamp(60px, 9vw, 100px);
		border-radius: 22px;
		flex-shrink: 0;
		padding: 8px;
	}
	.tagline {
		font-family: var(--font-mono);
		font-size: 1.05rem;
		letter-spacing: 0.06em;
		color: #00f2c3;
		margin: 0 0 1.2rem;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
		margin-bottom: 1rem;
	}
	.lede a {
		color: #00f2c3;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.cta-row {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		flex-wrap: wrap;
	}
	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.85rem 1.4rem;
		background: linear-gradient(135deg, #00f2c3, #00d6ff);
		color: #052028;
		font-weight: 800;
		border-radius: 999px;
		text-decoration: none;
		transition:
			transform 200ms ease,
			box-shadow 200ms ease;
		box-shadow: 0 10px 30px rgba(0, 242, 195, 0.3);
	}
	.cta-primary:hover {
		transition-duration: 0s;
		transform: translateY(-3px);
		box-shadow: 0 14px 40px rgba(0, 242, 195, 0.45);
	}
	.cta-primary svg {
		width: 18px;
		height: 18px;
	}

	.hero-shot {
		position: relative;
		margin: 3rem 0 4rem;
		border-radius: 16px;
		overflow: hidden;
		box-shadow:
			0 40px 100px rgba(0, 0, 0, 0.55),
			0 6px 20px rgba(0, 242, 195, 0.18);
		border: 1px solid rgba(0, 242, 195, 0.18);
	}
	.hero-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center top,
			rgba(0, 242, 195, 0.16),
			transparent 60%
		);
		pointer-events: none;
	}

	.features {
		margin: 5rem 0;
	}
	.sub {
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.features p {
		line-height: 1.55;
		opacity: 0.9;
	}
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		margin-top: 1.5rem;
	}
	.feature {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.9rem;
		padding: 1.2rem 1.3rem;
		background: rgba(0, 242, 195, 0.05);
		border: 1px solid rgba(0, 242, 195, 0.15);
		border-radius: 12px;
		transition:
			transform 200ms ease,
			border-color 200ms ease;
	}
	.feature:hover {
		transition-duration: 0s;
		transform: translateY(-3px);
		border-color: rgba(0, 242, 195, 0.4);
	}
	.feature-num {
		font-family: var(--font-mono);
		font-size: 1.4rem;
		font-weight: 900;
		color: #00f2c3;
		line-height: 1;
	}
	.feature h4 {
		font-size: 1.1rem;
		font-weight: 800;
		margin: 0 0 0.3rem;
	}
	.feature p {
		font-size: 0.92rem;
		opacity: 0.85;
		margin: 0;
	}

	.dash-block,
	.delivery-block,
	.brand-block {
		margin: 4rem 0;
	}
</style>
