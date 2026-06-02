<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import { Gallery, type GalleryItem } from '@delightstack/components/media';

	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2026-01-01_ghtui_screen_recording.avif',
			width: 1080,
			height: 608,
			caption: 'ghtui · terminal UI for GitHub',
			alt: 'ghtui in action',
		},
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
	let gallery = $state<ReturnType<typeof Gallery>>();
</script>

<SectionShell id="side-projects" year="Now" label="Side projects" theme="side">
	<div class="container">
		<Reveal>
			<YearMark year="2026 →" subtitle="Side projects · for fun" color="#a78bfa" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">FOR THE LOVE OF IT</div>
				<h2 class="title">
					Things I built
					<br />
					<span class="grad">because I felt like it.</span>
				</h2>
			</Reveal>
		</div>

		<div class="grid">
			<Reveal variant="up">
				<article class="card terminal">
					<header>
						<div class="terminal-bar">
							<span class="dot r"></span>
							<span class="dot y"></span>
							<span class="dot g"></span>
							<span class="terminal-title">~/projects/ghtui — bash</span>
						</div>
					</header>
					<div class="card-body">
						<h3>ghtui</h3>
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
							onclick={(e) => gallery?.open(0, e.currentTarget)} />
					</div>
				</article>
			</Reveal>

			<Reveal variant="up" delay={120}>
				<article class="card video">
					<header>
						<div class="video-tag">VIDEO TOOL</div>
					</header>
					<div class="card-body">
						<h3>Video Curator</h3>
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
						<div class="screens">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-dashboard.avif"
								alt="Video Curator dashboard"
								ratio="16 / 10"
								onclick={(e) => gallery?.open(1, e.currentTarget)} />
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2026-01-01_video_curator_screenshot-clips_page.avif"
								alt="Video Curator clips page"
								ratio="16 / 10"
								onclick={(e) => gallery?.open(2, e.currentTarget)} />
						</div>
					</div>
				</article>
			</Reveal>
		</div>

		<div class="family">
			<Reveal>
				<div class="family-eyebrow">PERSONAL · FAMILY</div>
				<h3 class="sub">There's a separate, less professional version of all this.</h3>
				<p>
					<a href="https://schwabauer.family" target="_blank" rel="noopener">
						schwabauer.family
					</a>
					is where the rest of my life lives. Wedding photos and films. Blog posts. Family photos.
					A short film I made for fun called "Socially Distant Halloween". Photos of the treehouse
					I've been building in the backyard. Our family cookbook (with the PDF you can download).
					The renovation of our house. The slow domestic accretion that turns out to be most
					of life.
				</p>
				<a
					class="family-link"
					href="https://schwabauer.family"
					target="_blank"
					rel="noopener">
					schwabauer.family
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
			</Reveal>
		</div>

		<div class="closing">
			<Reveal>
				<div class="closing-line"></div>
				<p class="closing-text">
					I started this page in 2006 with a stuffed-animal puppet show on a miniDV tape.
					I'm wrapping it up in
					{new Date().getFullYear()} with a property delivery platform that pays my bills. Somewhere
					in between, every "useless" detour — Flash games, fake newscasts, lego stop-motion,
					Hall View, NODE, the Pacman PowerPoint trick — became a piece of the next thing.
				</p>
				<p class="closing-text">
					The loop hasn't changed. Pick a thing I've never done. Try it. Fail in public.
					Add it to the toolbag. Use it later in something that matters more.
				</p>
				<p class="closing-sign">— Brian</p>
			</Reveal>
		</div>
	</div>

	<Gallery bind:this={gallery} items={sectionExtras} display="lightbox" />
</SectionShell>

<style>
	:global([data-theme='side']) {
		background:
			radial-gradient(ellipse at top, rgba(167, 139, 250, 0.06), transparent 50%),
			linear-gradient(180deg, #08060f, #100b1a 50%, #060410);
		color: #efe6ff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
	}
	.lockup {
		margin-bottom: 3rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #a78bfa;
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
		background: linear-gradient(90deg, #a78bfa, #ff8b8b, #ffd66e);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin: 3rem 0;
	}
	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: rgba(167, 139, 250, 0.04);
		border: 1px solid rgba(167, 139, 250, 0.18);
		border-radius: 14px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.terminal header {
		background: #1a1a1a;
		padding: 0.45rem 0.7rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}
	.terminal-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	.video header {
		padding: 0.7rem 1rem;
	}
	.video-tag {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		padding: 0.18rem 0.6rem;
		background: rgba(167, 139, 250, 0.15);
		color: #a78bfa;
		border-radius: 4px;
		font-weight: 700;
	}

	.card-body {
		padding: 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.card-body h3 {
		font-size: 1.6rem;
		font-weight: 800;
		margin: 0;
	}
	.card-tagline {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		color: #a78bfa;
		margin: 0;
	}
	.card-body p {
		font-size: 0.95rem;
		line-height: 1.55;
		margin: 0;
	}
	.card-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #a78bfa;
		text-decoration: underline;
		text-underline-offset: 4px;
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}
	.card-link svg {
		width: 14px;
		height: 14px;
	}
	.screens {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-top: 0.4rem;
	}
	@media (max-width: 640px) {
		.screens {
			grid-template-columns: 1fr;
		}
	}

	.family {
		margin: 5rem 0 4rem;
		padding: 2.4rem;
		background: rgba(255, 139, 139, 0.05);
		border: 1px solid rgba(255, 139, 139, 0.2);
		border-radius: 16px;
		max-width: 64rem;
	}
	.family-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff8b8b;
		margin-bottom: 0.8rem;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2rem);
		font-weight: 800;
		margin: 0 0 1rem;
	}
	.family p {
		line-height: 1.6;
		margin-bottom: 1.2rem;
	}
	.family a {
		color: #ff8b8b;
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.family-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.6rem 1.2rem;
		background: linear-gradient(135deg, #ff8b8b, #ffd66e);
		color: #2a0a0a;
		border-radius: 999px;
		font-weight: 700;
		text-decoration: none;
		transition: transform 200ms ease;
	}
	.family-link:hover {
		transition-duration: 0s;
		transform: translateY(-2px);
	}
	.family-link svg {
		width: 16px;
		height: 16px;
	}

	.closing {
		max-width: 56rem;
		margin: 6rem auto 2rem;
		text-align: center;
	}
	.closing-line {
		width: 80px;
		height: 2px;
		background: linear-gradient(90deg, transparent, #a78bfa, transparent);
		margin: 0 auto 2rem;
	}
	.closing-text {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.65;
		margin-bottom: 1.2rem;
		opacity: 0.92;
	}
	.closing-sign {
		font-family: 'Caveat', cursive, var(--font-sans);
		font-size: 1.8rem;
		color: #a78bfa;
		margin-top: 2rem;
		opacity: 0.85;
	}
</style>
