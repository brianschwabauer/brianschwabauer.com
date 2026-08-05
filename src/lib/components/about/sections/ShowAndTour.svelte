<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';
	import BokehField from '../primitives/BokehField.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import ShippedWall, { type Column } from '../primitives/ShippedWall.svelte';

	/*
	 * Everything the product looks like, as one diagonal scrub at the end of the
	 * chapter: the tall full-page captures of what the photographer's clients see,
	 * and the dashboard screens they run the business from, on the same wall.
	 *
	 * Columns are balanced by total *height*, not by count — a column's travel is
	 * the part of it that doesn't fit on screen, so a short column would arrive
	 * early and then sit still. The tall 2048px captures do most of that work, so
	 * each column gets one or two of them and the 16:9 dashboard screens fill in
	 * around them.
	 *
	 * The project detail page is deliberately absent: it is the hero shot at the
	 * top of the section, and seeing it again forty lines later reads as a mistake
	 * rather than as a set.
	 */
	const WALL_COLUMNS: Column[] = [
		{
			direction: -1,
			speed: 1,
			// Three ~1900px-wide captures, which are the first things to go illegible
			// in a third of a phone screen.
			drop_on_phone: true,
			shots: [
				{
					file: '2026-01-01_show_and_tour-legacy_delivery_page_screenshot-963_n1950_rd.avif',
					width: 702,
					height: 2048,
					caption: '963 N 1950 RD · client delivery',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_mockup-signin_page.avif',
					width: 2048,
					height: 1152,
					caption: 'Sign in',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_list.avif',
					width: 1904,
					height: 978,
					caption: 'Project list · dark mode',
				},
				{
					file: '2026-01-01_show_and_tour-website_screenshot-home_page.avif',
					width: 1890,
					height: 956,
					caption: 'showandtour.com · home',
				},
			],
		},
		{
			direction: 1,
			speed: 1,
			shots: [
				{
					file: '2026-01-01_show_and_tour-dashboard_mockup-delivery_page_dark.avif',
					width: 733,
					height: 2048,
					caption: 'Delivery page · dark',
				},
				{
					file: '2026-01-01_show_and_tour-property_website_screenshot-prairievillageestate.avif',
					width: 1375,
					height: 2048,
					caption: 'Prairie Village Estate · property site',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_settings_page.avif',
					width: 1907,
					height: 1632,
					caption: 'Settings',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_mockup-media_player.avif',
					width: 1440,
					height: 960,
					caption: 'Built-in media player',
				},
			],
		},
		{
			direction: -1,
			speed: 0.75,
			shots: [
				{
					file: '2026-01-01_show_and_tour-property_website_screenshot-8700leeboulevard.avif',
					width: 854,
					height: 2048,
					caption: '8700 Lee Boulevard · property site',
				},
				{
					file: '2026-01-01_show_and_tour-website_screenshot-home_page-portrait.avif',
					width: 1897,
					height: 1852,
					caption: 'showandtour.com · the long scroll',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_client_page.avif',
					width: 1907,
					height: 980,
					caption: 'Project · client view',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_mockup-clients_page_empty.avif',
					width: 2048,
					height: 1152,
					caption: 'Clients (empty state)',
				},
				{
					file: '2026-01-01_show_and_tour-dashboard_mockup-projects_page_empty.avif',
					width: 2048,
					height: 1152,
					caption: 'Projects (empty state)',
				},
			],
		},
	];

	const brandImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-laptop_mockup.avif',
			width: 2048,
			height: 1152,
			caption: 'On a laptop',
			alt: 'On a laptop',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-app_icon_mockup.avif',
			width: 2048,
			height: 1152,
			caption: 'App icon',
			alt: 'App icon',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-website_mockup.avif',
			width: 2048,
			height: 1152,
			caption: 'Marketing site',
			alt: 'Marketing site',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-business_card_mockup.avif',
			width: 2048,
			height: 1152,
			caption: 'Business cards',
			alt: 'Business cards',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-instagram_ad_mockup.avif',
			width: 2048,
			height: 1152,
			caption: 'Instagram ad',
			alt: 'Instagram ad',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-brand_style_guide-first_page.avif',
			width: 2048,
			height: 1152,
			caption: 'Brand guide cover',
			alt: 'Brand guide cover',
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
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif',
			width: 1890,
			height: 975,
			caption: 'Show&Tour · project detail page',
			alt: 'Show&Tour — project detail page',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();

	/*
	 * A rack focus onto the title. This section is the photography product and
	 * the background is already a lens; the logical thing for the subject to do
	 * is come into focus rather than fade or slide in like everything else on the
	 * page.
	 *
	 * One-shot on entry rather than scroll-linked: a real focus pull is an
	 * operator turning a ring once and stopping, not a value that tracks your
	 * scrollbar. It is also a transition rather than a per-frame blur, which
	 * matters — blurring live text on every scroll event is one of the more
	 * expensive things you can ask a browser to do.
	 */
	let title_el = $state<HTMLElement | null>(null);
	let focused = $state(false);

	$effect(() => {
		if (!title_el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			focused = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					focused = true;
					io.disconnect();
				}
			},
			{ rootMargin: '-12% 0px -20% 0px' },
		);
		io.observe(title_el);
		return () => io.disconnect();
	});
</script>

<SectionShell id="showandtour" year="2019" label="Show&Tour" theme="snt">
	<!-- The field runs the whole section, behind the lockup, the features and all
	     three galleries. Its mask is gentler than the NOW section's: there is copy
	     from top to bottom here, so the discs thin toward the middle column rather
	     than clearing one hole in the centre. -->
	<!-- Brand teal and brand blue, so the two light sources in the room are the
	     two Show&Tour accents rather than generic cyans. -->
	<BokehField
		tints={['0, 242, 195', '0, 128, 253']}
		mask="linear-gradient(90deg, #000, rgba(0, 0, 0, 0.32) 30%, rgba(0, 0, 0, 0.32) 70%, #000)" />

	<div class="container">
		<Reveal>
			<YearMark year="2019" subtitle="Co-founder" color="#00f2c3" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<!-- No kicker: the year mark immediately above already reads as one,
				     and it carries "Co-founder" as its subtitle. -->
				<h2 bind:this={title_el} class="title" class:focused>
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
				<!-- The origin, told from 2019. Every present-tense claim about
				     Show&Tour — full-time, the user count, the roadmap — belongs to
				     the NOW section, so this chapter never has to say "still". -->
				<p class="lede">
					Everything else on this page was practice for this. A decade of shipping other
					people's projects, a string of products that almost worked — and then the one
					that stuck.
				</p>
				<div class="cta-row">
					<PlayFilm
						href="https://showandtour.com"
						target="_blank"
						rel="noopener"
						icon="arrow"
						label="showandtour.com"
						color="#00f2c3" />
				</div>
			</Reveal>
		</div>

		<Reveal variant="up">
			<div class="hero-shot">
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif"
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
				<h3 class="sub">The pitch, in six bullets</h3>
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

		<div class="brand-block">
			<Reveal class="bleed-head">
				<h3 class="sub">Brand</h3>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="gallery-bleed">
					<LightboxGallery
						key="show-and-tour-brand"
						items={brandImages}
						display="masonry"
						size="2" />
				</div>
			</Reveal>
		</div>
	</div>

	<!--
	  The chapter's last word is the product itself: every screen — the dashboard
	  the photographer works in and the pages their clients land on — scrubbing
	  past on the diagonal.
	-->
	<ShippedWall key="show-and-tour-wall" columns={WALL_COLUMNS} accent="#00f2c3" />

	<LightboxGallery bind:this={gallery} key="show-and-tour" items={heroShot} />
</SectionShell>

<style>
	/* The teal and violet corner glows that used to sit here are gone with the
	   grid — the depth now comes from the bokeh, which is a real photographic
	   effect rather than a light source with nothing making it. */
	/*
	 * The Show&Tour brand palette, since this is the Show&Tour chapter. The base
	 * of the room is FOCUS (#004a63 → oklch(0.383 0.076 229)): the linear stops
	 * sit either side of it so the middle of the section lands on the brand
	 * colour exactly and the ends fall away into shadow. The two washes are the
	 * accents used as light rather than as fill — BLUE from above, TEAL bouncing
	 * off the lower right — which is the "occasional use of accents in more
	 * prominent and unexpected ways" the brand guide asks for.
	 *
	 * Bokeh is light in a *room*, so the room has to have a colour for the discs
	 * to read as highlights on a scene rather than dots on black.
	 *
	 * NOW no longer shares this theme; it owns `now` and stays green.
	 */
	:global([data-theme='snt']) {
		background:
			radial-gradient(
				ellipse 110% 70% at 50% 0%,
				oklch(0.5 0.115 250 / 0.5),
				transparent 62%
			),
			radial-gradient(
				ellipse 95% 60% at 82% 100%,
				oklch(0.55 0.1 187 / 0.3),
				transparent 66%
			),
			linear-gradient(
				180deg,
				oklch(0.26 0.06 232),
				oklch(0.383 0.076 229) 55%,
				oklch(0.23 0.068 248)
			);
		color: #f4f2f2;
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
		/*
		 * Out of focus until the observer says otherwise. The scale is part of the
		 * effect and not decoration: a lens breathes as it racks, and a title that
		 * only unblurs reads as a CSS filter coming off rather than as a lens
		 * finding its subject.
		 *
		 * Slow, and quart-out, so almost all of the travel happens early and the
		 * last of the softness takes its time — which is what the end of a focus
		 * pull looks like when somebody good is doing it.
		 */
		filter: blur(16px);
		scale: 1.035;
		opacity: 0.55;
		transition:
			filter 1100ms cubic-bezier(0.25, 1, 0.5, 1),
			scale 1100ms cubic-bezier(0.25, 1, 0.5, 1),
			opacity 700ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	.title.focused {
		filter: blur(0);
		scale: 1;
		opacity: 1;
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
		font-weight: 700;
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

	/* No bottom margin: the wall follows immediately and brings its own edge fade,
	   so a gap here would just read as the section running out. */
	.brand-block {
		margin: 4rem 0 0;
		:global(.gallery-bleed .gallery.display-masonry.size-2) {
			@media (max-width: 768px) {
				--cols: 4;
			}
		}
	}
</style>
