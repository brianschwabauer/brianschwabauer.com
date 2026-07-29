<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import FlipText from '../primitives/FlipText.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	/** Clicking the board spells out a sentence, a word per click, then wraps back
	 * to SCRMBLD. Only characters in the split-flap alphabet. */
	const flapEggs = ['HELLO', 'YOU', 'FOUND', 'THE', 'EASTER', 'EGG :)'];

	/**
	 * The toolkit under everything else in this section — and under this page.
	 * Deliberately typographic: the package list *is* the artwork, so there are no
	 * screenshots here.
	 */
	const PACKAGES = [
		{ name: 'components', role: 'Svelte 5 component library' },
		{ name: 'styles', role: 'OKLCH design tokens & base CSS' },
		{ name: 'utilities', role: 'shared utilities & DelightError' },
		{ name: 'editor', role: 'rich-text block editor' },
		{ name: 'auth', role: 'edge-native sessions & OAuth' },
		{ name: 'database', role: 'reactive SQLite on Durable Objects' },
		{ name: 'websocket', role: 'real-time presence & messaging' },
		{ name: 'rate-limiter', role: 'sliding-window rate limiting' },
		{ name: 'images', role: 'image processing & uploads' },
		{ name: 'ai', role: 'embeddings, gateway, streaming' },
		{ name: 'stripe', role: 'billing & metered usage' },
	];

	const markableShots = [
		{
			src: 'https://cdn.brianschwabauer.com/media/2024-01-01_remarkably_organized_app-home_page_screenshot.avif',
			width: 1907,
			height: 979,
			caption: 'markable.page · the builder',
			alt: 'markable.page builder',
		},
		{
			src: 'https://cdn.brianschwabauer.com/media/2024-01-01_remarkably_organized_app-settings_popup_screenshot.avif',
			width: 1532,
			height: 1222,
			caption: 'Planner settings',
			alt: 'markable.page planner settings',
		},
		{
			src: 'https://cdn.brianschwabauer.com/media/2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-close_up_on_navigation.avif',
			width: 2048,
			height: 1536,
			caption: 'On the reMarkable · navigation',
			alt: 'Planner navigation on a reMarkable tablet',
		},
		{
			src: 'https://cdn.brianschwabauer.com/media/2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-shallow_depth_of_field_year_view.avif',
			width: 2048,
			height: 1536,
			caption: 'On the reMarkable · year view',
			alt: 'Planner year view on a reMarkable tablet',
		},
		{
			src: 'https://cdn.brianschwabauer.com/media/2024-01-01_remarkably_organized_planner-picture_of_planner_on_remarkable_device-title_page_close_up.avif',
			width: 2048,
			height: 1536,
			caption: 'On the reMarkable · title page',
			alt: 'Planner title page on a reMarkable tablet',
		},
	];
	const markableImages: GalleryItem[] = markableShots.map((shot) => ({
		type: 'image',
		...shot,
	}));
	// Three of the five sit in the card; the lightbox carries the whole set.
	const MARKABLE_THUMBS = [0, 2, 3];

	const ghtuiImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_ghtui_screen_recording.avif',
			width: 1080,
			height: 608,
			caption: 'ghtui · terminal UI for GitHub',
			alt: 'ghtui in action',
		},
	];

	const videoCuratorImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-dashboard.avif',
			width: 1920,
			height: 993,
			caption: 'Video Curator · dashboard',
			alt: 'Video Curator dashboard',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-clips_page.avif',
			width: 1920,
			height: 993,
			caption: 'Video Curator · clips page',
			alt: 'Video Curator clips page',
		},
	];

	let markable_gallery = $state<ReturnType<typeof LightboxGallery>>();
	let ghtui_gallery = $state<ReturnType<typeof LightboxGallery>>();
	let curator_gallery = $state<ReturnType<typeof LightboxGallery>>();

	/**
	 * The one photograph in this section, and the only non-screenshot on it.
	 *
	 * TODO(brian): add family photo — a snapshot, not a product shot. Shape:
	 * `{ src: string; width: number; height: number; alt: string }`. The block is
	 * designed to read as finished without it, so leaving this `null` is a valid
	 * shipping state rather than a gap.
	 */
	const bio_photo = null as {
		src: string;
		width: number;
		height: number;
		alt: string;
	} | null;

	/**
	 * Motes rising through the light. Hand-placed across the width, with no two
	 * periods matching, so the field never falls into step — the moment a handful
	 * of drifting particles start moving together they stop reading as dust and
	 * start reading as an animation.
	 */
	const MOTES = [
		{ x: 4, size: 3, o: 0.5, sway: 26, dur: 27, delay: -3 },
		{ x: 11, size: 2, o: 0.36, sway: -18, dur: 34, delay: -19 },
		{ x: 18, size: 4, o: 0.44, sway: 32, dur: 22, delay: -11 },
		{ x: 24, size: 2, o: 0.3, sway: -24, dur: 41, delay: -30 },
		{ x: 31, size: 3, o: 0.48, sway: 14, dur: 29, delay: -7 },
		{ x: 37, size: 5, o: 0.26, sway: -30, dur: 47, delay: -24 },
		{ x: 44, size: 2, o: 0.42, sway: 22, dur: 25, delay: -16 },
		{ x: 51, size: 3, o: 0.34, sway: -16, dur: 38, delay: -2 },
		{ x: 57, size: 4, o: 0.4, sway: 28, dur: 31, delay: -35 },
		{ x: 63, size: 2, o: 0.28, sway: -22, dur: 44, delay: -13 },
		{ x: 70, size: 3, o: 0.46, sway: 18, dur: 24, delay: -27 },
		{ x: 76, size: 5, o: 0.24, sway: -34, dur: 52, delay: -6 },
		{ x: 82, size: 2, o: 0.38, sway: 20, dur: 33, delay: -21 },
		{ x: 88, size: 3, o: 0.32, sway: -14, dur: 28, delay: -38 },
		{ x: 94, size: 4, o: 0.44, sway: 30, dur: 36, delay: -9 },
		{ x: 98, size: 2, o: 0.3, sway: -20, dur: 43, delay: -32 },
	];
</script>

<SectionShell id="now" year="Now" label="Now" theme="now">
	<!--
	  Not the bokeh field. That belongs to 2019 and to the awards show, and using
	  it a third time made "now" read as a reprise of a chapter you'd already had.
	  This is the present tense instead: a glow rising off the bottom edge with
	  motes drifting up through it, the way dust moves in a room somebody is still
	  working in. Nothing here has arrived anywhere — it is all still going.
	-->
	<div class="active" aria-hidden="true">
		<span class="glow"></span>
		{#each MOTES as m, i (i)}
			<span
				class="mote"
				style:--x="{m.x}%"
				style:--size="{m.size}px"
				style:--o={m.o}
				style:--sway="{m.sway}px"
				style:--dur="{m.dur}s"
				style:--delay="{m.delay}s">
			</span>
		{/each}
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="NOW" color="#00f2c3" />
		</Reveal>

		<div class="snt">
			<Reveal variant="up">
				<h2 class="title">
					Still building <span class="accent">Show&amp;Tour.</span>
				</h2>
				<p class="lede">
					Show&amp;Tour is my full-time work, today and for the foreseeable future.
					Thousands of photographers deliver their projects through it, and the roadmap is
					longer than it has ever been. Six years in, it still gets the best hours of my
					day.
				</p>
				<div class="ctas">
					<PlayFilm
						href="https://showandtour.com"
						target="_blank"
						rel="noopener"
						icon="arrow"
						label="Visit showandtour.com"
						color="#00f2c3" />
				</div>
			</Reveal>
		</div>

		<div class="toolkit">
			<Reveal variant="up">
				<h3>delightstack</h3>
				<p class="tagline">
					A full-stack toolkit for building delightful apps on Cloudflare.
				</p>
				<p class="body">
					Twenty years of building things leaves you with opinions about how software
					should feel. Delightstack is where mine ended up: Svelte 5 components,
					edge-native auth, a reactive database on Durable Objects, real-time websockets,
					image processing, billing, AI — eleven packages designed to work together and
					usable on their own. It runs under this site, under my side projects, and under
					everything I start now.
				</p>
			</Reveal>

			<!-- Cells divided by hairlines rather than eleven little boxes: the block
			     is supposed to read as one system, and a grid of bordered chips inside
			     a bordered panel is just cards inside cards. -->
			<Reveal variant="up" delay={100}>
				<ul class="packages">
					{#each PACKAGES as pkg (pkg.name)}
						<li class="pkg">
							<!-- Both halves are elements, and the `code` is a flex container, so
							     the formatter is free to break the line without a space
							     appearing in the middle of the package name. -->
							<code>
								<span class="scope">@delightstack/</span>
								<span class="name">{pkg.name}</span>
							</code>
							<span class="role">{pkg.role}</span>
						</li>
					{/each}
				</ul>
			</Reveal>

			<Reveal variant="up" delay={160}>
				<div class="links">
					<a href="https://thedelight.co" target="_blank" rel="noopener">
						thedelight.co
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
					<a href="https://docs.thedelight.co" target="_blank" rel="noopener">
						docs.thedelight.co
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

		<div class="projects">
			<Reveal variant="up">
				<h3 class="sub">…and whatever else I feel like building.</h3>
				<p class="lede">
					Nights, weekends, and the occasional all-consuming obsession. None of these are
					finished, because none of them are abandoned — this list only grows.
				</p>
			</Reveal>

			<!-- The breakout. It is the centrepiece of the collection and is meant to
			     be bigger than everything under it. -->
			<Reveal variant="up" delay={80}>
				<article class="card breakout">
					<h4>
						<a href="https://scrmbld.app" target="_blank" rel="noopener">scrmbld.app</a>
						<span class="dash">— a daily word game in split-flap style</span>
					</h4>
					<p>
						You're given 8 letters. One is a decoy. Unscramble the other 7 into the day's
						word. Letters animate on like a split-flap display — I spent a stupid amount
						of time hand-crafting the look and feel of that animation.
					</p>
					<div class="splitflap">
						<FlipText word="SCRMBLD" eggWords={flapEggs} />
					</div>
				</article>
			</Reveal>

			<!-- A plain grid, and a project is allowed to break out of it. Adding the
			     next side project is adding one <article>. -->
			<div class="grid">
				<Reveal variant="up">
					<article class="card">
						<h4>
							<a href="https://markable.page" target="_blank" rel="noopener">
								markable.page
							</a>
							<span class="dash">— a PDF planner builder for e-ink tablets</span>
						</h4>
						<p>
							A planner builder that generates highly customizable PDFs with internal
							links, designed for devices like the reMarkable. Originally called
							"Remarkably Organized". Open-sourced.
							<strong>200+ stars on GitHub.</strong>
							Built with Svelte.
						</p>
						<a
							class="card-link"
							href="https://github.com/brianschwabauer/remarkably-organized"
							target="_blank"
							rel="noopener">
							github.com/brianschwabauer/remarkably-organized
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
						<div class="shots three">
							{#each MARKABLE_THUMBS as index (index)}
								<LazyMedia
									src={markableShots[index].src}
									alt={markableShots[index].alt}
									ratio="4 / 3"
									onclick={(e) => markable_gallery?.open(index, e.currentTarget)} />
							{/each}
						</div>
					</article>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<article class="card terminal">
						<div class="terminal-bar">
							<span class="dot r"></span>
							<span class="dot y"></span>
							<span class="dot g"></span>
							<span class="terminal-title">~/projects/ghtui — bash</span>
						</div>
						<div class="card-body">
							<h4>ghtui</h4>
							<p class="card-tagline">A fast, minimal terminal UI for managing GitHub.</p>
							<p>
								Triage your inbox without leaving the terminal. Open PRs, comment, review,
								merge — all keyboard-first.
							</p>
							<a
								class="card-link"
								href="https://github.com/brianschwabauer/ghtui"
								target="_blank"
								rel="noopener">
								github.com/brianschwabauer/ghtui
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
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2026-01-01_ghtui_screen_recording.avif"
								alt="ghtui in action"
								ratio="16 / 10"
								onclick={(e) => ghtui_gallery?.open(0, e.currentTarget)} />
						</div>
					</article>
				</Reveal>

				<Reveal variant="up" delay={180}>
					<article class="card">
						<h4>Video Curator</h4>
						<p class="card-tagline">Intelligent curation for action-camera footage.</p>
						<p>
							Processes huge volumes of footage automatically: drops pocket shots,
							surfaces high-quality clips and stills, and picks out moments where children
							are smiling or laughing. Mostly used to wrangle GoPro footage from family
							trips.
						</p>
						<a
							class="card-link"
							href="https://github.com/brianschwabauer/videocurator"
							target="_blank"
							rel="noopener">
							github.com/brianschwabauer/videocurator
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
						<div class="shots">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-dashboard.avif"
								alt="Video Curator dashboard"
								ratio="16 / 10"
								onclick={(e) => curator_gallery?.open(0, e.currentTarget)} />
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-clips_page.avif"
								alt="Video Curator clips page"
								ratio="16 / 10"
								onclick={(e) => curator_gallery?.open(1, e.currentTarget)} />
						</div>
					</article>
				</Reveal>
			</div>
		</div>

		<!-- The page is the site's de-facto About page and otherwise never says who
		     any of this belongs to. One eyebrow, one paragraph: brevity is what
		     keeps it from reading as an appendix, which is also why it is not
		     folded away behind a "learn more". -->
		<div class="bio" class:with-photo={Boolean(bio_photo)}>
			<Reveal variant="up">
				<div class="eyebrow">OFF THE CLOCK</div>
				<p>
					When I'm not shipping, I'm in Kansas City with my wife and our four kids —
					building them a treehouse, camping, out on a run, or halfway through the next
					DIY renovation. I play guitar and write songs. I 3D-print things we could've
					just bought. The projects don't stop when I close the laptop; they just change
					material.
				</p>
			</Reveal>
			{#if bio_photo}
				<Reveal variant="left" delay={120}>
					<div class="snapshot">
						<LazyMedia
							src={bio_photo.src}
							alt={bio_photo.alt}
							ratio="{bio_photo.width} / {bio_photo.height}"
							shadow={false} />
					</div>
				</Reveal>
			{/if}
		</div>

		<div class="bridge">
			<Reveal variant="up">
				<p>The projects keep changing. The way I build them doesn't.</p>
			</Reveal>
		</div>
	</div>

	<LightboxGallery
		bind:this={markable_gallery}
		key="now-markable"
		items={markableImages} />
	<LightboxGallery bind:this={ghtui_gallery} key="now-ghtui" items={ghtuiImages} />
	<LightboxGallery
		bind:this={curator_gallery}
		key="now-video-curator"
		items={videoCuratorImages} />
</SectionShell>

<style>
	/*
	 * NOW owns its own theme. It used to share `snt` with the Show&Tour chapter,
	 * but Show&Tour has moved onto the brand palette (FOCUS blue), and this
	 * section keeps the green — same room, later in the day, and the split lets
	 * the two chapters read as different places.
	 */
	:global([data-theme='now']) {
		background:
			radial-gradient(
				ellipse 110% 70% at 50% 0%,
				oklch(0.42 0.1 197 / 0.55),
				transparent 62%
			),
			radial-gradient(
				ellipse 95% 60% at 82% 100%,
				oklch(0.38 0.09 212 / 0.45),
				transparent 66%
			),
			linear-gradient(
				180deg,
				oklch(0.22 0.052 200),
				oklch(0.28 0.072 196) 55%,
				oklch(0.18 0.048 214)
			);
		color: #e8faf6;
	}

	/* Pinned, so the room stays around you for the whole chapter rather than
	   scrolling past as a panel. */
	.active {
		position: sticky;
		top: 0;
		height: 100svh;
		margin-bottom: -100svh;
		overflow: clip;
		pointer-events: none;
	}
	/*
	 * Light coming up off the bottom edge. Warm at its base and cooling into the
	 * section's teal as it rises — the two ends of a working day in one gradient,
	 * and the only warm note anywhere in the Show&Tour chapters.
	 */
	.glow {
		position: absolute;
		inset: auto 0 0;
		height: 62%;
		background:
			radial-gradient(
				ellipse 70% 100% at 50% 100%,
				rgba(0, 242, 195, 0.13),
				transparent 72%
			),
			radial-gradient(
				ellipse 42% 80% at 22% 100%,
				rgba(255, 168, 92, 0.09),
				transparent 70%
			);
		animation: breathe 19s ease-in-out infinite alternate;
	}
	@keyframes breathe {
		from {
			opacity: 0.72;
		}
		to {
			opacity: 1;
		}
	}
	.mote {
		position: absolute;
		left: var(--x);
		bottom: 0;
		width: var(--size);
		aspect-ratio: 1;
		border-radius: 50%;
		background: #7ff5dd;
		box-shadow: 0 0 6px rgba(0, 242, 195, 0.5);
		opacity: 0;
		animation: rise var(--dur) linear var(--delay) infinite;
	}
	/*
	 * `svh` rather than percentages: a percentage translate resolves against the
	 * mote's own 3px box, so the whole field would have travelled nine pixels.
	 */
	@keyframes rise {
		0% {
			translate: 0 0;
			opacity: 0;
		}
		9% {
			opacity: var(--o);
		}
		50% {
			translate: var(--sway) -52svh;
		}
		86% {
			opacity: var(--o);
		}
		100% {
			translate: 0 -104svh;
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.glow {
			animation: none;
		}
		/* Dust that isn't moving is not dust. */
		.mote {
			display: none;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.playback {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		opacity: 0.6;
		margin: 0 0 1.1rem;
	}

	/* ── Show&Tour, present tense ───────────────────────────────────────── */
	.snt {
		max-width: 44rem;
		margin-bottom: clamp(5rem, 10vw, 8rem);
	}
	.title {
		font-size: clamp(2.4rem, 6vw, 4.2rem);
		font-weight: 900;
		line-height: 1.02;
		letter-spacing: -0.03em;
		margin: 0 0 1.2rem;
	}
	.accent {
		color: oklch(from #00f2c3 0.84 calc(c * 0.86) h);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.82);
		margin: 0;
	}
	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.8rem;
	}

	/* ── delightstack ───────────────────────────────────────────────────── */
	.toolkit {
		margin-bottom: clamp(5rem, 10vw, 8rem);
		padding: clamp(1.6rem, 4vw, 3rem);
		border: 1px solid rgba(0, 242, 195, 0.2);
		border-radius: 18px;
		background: rgba(0, 242, 195, 0.03);
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 1rem;
	}
	.toolkit h3 {
		font-size: clamp(2.2rem, 5.5vw, 3.4rem);
		font-weight: 900;
		letter-spacing: -0.035em;
		line-height: 1;
		margin: 0 0 0.6rem;
	}
	.tagline {
		font-family: var(--font-mono);
		font-size: clamp(0.85rem, 1.3vw, 1rem);
		letter-spacing: 0.02em;
		color: #00f2c3;
		margin: 0 0 1.4rem;
	}
	.body {
		font-size: 1.02rem;
		line-height: 1.65;
		max-width: 46rem;
		color: rgba(255, 255, 255, 0.8);
		margin: 0 0 2rem;
	}
	/* One panel ruled into cells. The rules are box-shadows rather than a 1px
	   grid gap showing the container through: eleven packages never fill the last
	   row evenly, and with the gap trick the leftover cell showed up as a bright
	   rectangle. Shadows take no layout space, the container clips the outermost
	   ones, and an empty cell simply stays empty. */
	.packages {
		--rule: rgba(0, 242, 195, 0.16);
		list-style: none;
		margin: 0 0 1.8rem;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
		background: #071417;
		border: 1px solid var(--rule);
		border-radius: 10px;
		overflow: hidden;
	}
	.pkg {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.8rem 1rem;
		box-shadow:
			-1px 0 0 var(--rule),
			0 -1px 0 var(--rule);
		transition: background 250ms ease;
	}
	.pkg:hover {
		transition-duration: 0s;
		background: #0a2027;
	}
	.pkg code {
		/* The global `code` rule dresses inline code as a chip; in here that would
		   be a box inside a cell inside a panel. */
		background: none;
		padding: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		font-family: var(--font-mono);
		font-size: 0.88rem;
		color: #00f2c3;
		font-weight: 700;
	}
	.scope {
		opacity: 0.45;
		font-weight: 400;
	}
	.role {
		font-size: 0.82rem;
		line-height: 1.4;
		color: rgba(255, 255, 255, 0.62);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: 1.6rem;
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: #00f2c3;
		text-decoration: underline;
		text-decoration-color: rgba(0, 242, 195, 0.4);
		text-underline-offset: 5px;
		transition: color 250ms ease;
	}
	.links a:hover {
		transition-duration: 0s;
		color: #fff;
	}
	.links svg {
		width: 14px;
		height: 14px;
	}

	/* ── Side projects ──────────────────────────────────────────────────── */
	.sub {
		font-size: clamp(1.8rem, 4vw, 2.8rem);
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0 0 0.8rem;
	}
	.projects .lede {
		max-width: 40rem;
		margin-bottom: 2.5rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(0, 242, 195, 0.15);
		border-radius: 14px;
		transition: border-color 250ms ease;
	}
	.card:hover {
		transition-duration: 0s;
		border-color: rgba(0, 242, 195, 0.35);
	}
	.card h4 {
		font-size: clamp(1.25rem, 2.2vw, 1.6rem);
		font-weight: 800;
		margin: 0;
		line-height: 1.25;
	}
	.dash {
		font-weight: 500;
		opacity: 0.72;
	}
	.card h4 a {
		color: #00f2c3;
		text-decoration: underline;
		text-underline-offset: 5px;
	}
	.card h4 a:hover {
		transition-duration: 0s;
		color: #fff;
	}
	.card p {
		font-size: 0.95rem;
		line-height: 1.6;
		margin: 0;
		color: rgba(255, 255, 255, 0.8);
	}
	.card strong {
		color: #00f2c3;
	}
	.card-tagline {
		font-family: var(--font-mono);
		font-size: 0.92rem;
		color: #00f2c3;
	}
	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		align-self: flex-start;
		color: #00f2c3;
		text-decoration: underline;
		text-underline-offset: 4px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		word-break: break-all;
		transition: color 250ms ease;
	}
	.card-link:hover {
		transition-duration: 0s;
		color: #fff;
	}
	.card-link svg {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}
	.shots {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		padding-top: 0.4rem;
	}
	.shots.three {
		grid-template-columns: repeat(3, 1fr);
	}
	@media (max-width: 640px) {
		.shots,
		.shots.three {
			grid-template-columns: 1fr;
		}
	}

	.breakout {
		margin-bottom: 1.5rem;
		padding: clamp(1.5rem, 3.5vw, 2.5rem);
		border-color: rgba(0, 242, 195, 0.28);
		background: rgba(0, 242, 195, 0.04);
	}
	.breakout p {
		max-width: 48rem;
	}
	/* The board is 11.34em wide at any size, so dividing the container width by that
	   makes it span the card exactly. */
	.splitflap {
		container-type: inline-size;
		display: flex;
		justify-content: center;
		/* The frame overhangs the flaps by 0.12em, so leave a little room beside it */
		padding: 2.5rem 1rem 1.75rem;
		--flip-size: calc(100cqi / 11.34);
	}
	.splitflap :global(.flip-text) {
		box-shadow: 0 18px 44px rgba(0, 0, 0, 0.55);
	}

	/* Cards take their own height rather than stretching to the tallest in the
	   row: these carry very different amounts of artwork, and forcing them level
	   left a card's worth of empty space above the shorter one's screenshots. A
	   ragged last row is also the honest shape of a list that only grows. */
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	.terminal {
		padding: 0;
		overflow: hidden;
	}
	.terminal-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.7rem;
		background: #1a1a1a;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: rgba(255, 255, 255, 0.6);
	}
	.dot {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		display: block;
	}
	.dot.r {
		background: #ff5f57;
	}
	.dot.y {
		background: #febc2e;
	}
	.dot.g {
		background: #28c840;
	}
	.terminal-title {
		margin-left: 0.5rem;
	}
	.card-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 1.5rem;
	}
	.video-tag {
		align-self: flex-start;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		padding: 0.18rem 0.6rem;
		background: rgba(0, 242, 195, 0.14);
		color: #00f2c3;
		border-radius: 4px;
		font-weight: 700;
	}

	/* ── Off the clock ──────────────────────────────────────────────────── */
	.bio {
		margin: clamp(5rem, 10vw, 8rem) 0 0;
		max-width: 44rem;
	}
	.bio p {
		font-size: clamp(1.02rem, 1.4vw, 1.15rem);
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
	}
	/* Only when the photo lands: text-only, the block keeps its single measure. */
	.bio.with-photo {
		max-width: none;
		display: grid;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (min-width: 900px) {
		.bio.with-photo {
			grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		}
	}
	/* A snapshot, not a product shot — no glow, no teal rim, just a frame. */
	.snapshot {
		border-radius: 10px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.14);
	}

	/* ── The bridge into the Creed ──────────────────────────────────────── */
	.bridge {
		margin: clamp(5rem, 14vw, 15rem) 0 0;
		text-align: center;
	}
	.bridge p {
		font-size: clamp(1.15rem, 3vw, 2rem);
		line-height: 1.5;
		letter-spacing: 0.01em;
		color: rgba(255, 255, 255, 0.72);
		text-wrap: balance;
		margin: 0 0 2rem;
	}
</style>
