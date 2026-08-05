<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-01_hunky_spunky_productions-website_design-home_page.jpg',
			width: 1878,
			height: 916,
			caption: 'Hunky Spunky Productions · 2008',
			alt: 'HSP 2008 site',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-01-01_hunky_spunky_productions-website_design-home_page.jpg',
			width: 1878,
			height: 919,
			caption: 'Hunky Spunky Productions · 2009',
			alt: 'HSP 2009 site',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-01-01_hunky_spunky_productions-website_design-home_page.avif',
			width: 1878,
			height: 920,
			caption: 'Hunky Spunky Productions · 2010',
			alt: 'HSP 2010 site',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-12-25_calamity-flash_website_screen_recording-main_menu.avif',
			width: 1080,
			height: 604,
			caption: 'Calamity · Flash website · 2009',
			alt: 'Calamity Flash website screen recording',
		},
	];
	let gallery = $state<ReturnType<typeof LightboxGallery>>();

	/** The three homepage redesigns, oldest first. Index doubles as the gallery
	 *  index, since these are the first three entries in `sectionExtras`. */
	const sites = [
		{
			year: '2008',
			tool: 'iWeb',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-01_hunky_spunky_productions-website_design-home_page.jpg',
		},
		{
			year: '2009',
			tool: 'Dreamweaver',
			src: 'https://cdn.brianschwabauer.com/media/2009-01-01_hunky_spunky_productions-website_design-home_page.jpg',
		},
		{
			year: '2010',
			tool: 'Flash',
			src: 'https://cdn.brianschwabauer.com/media/2010-01-01_hunky_spunky_productions-website_design-home_page.avif',
		},
	];

	/** Which redesign is on top of the deck. Starts on 2009 so the stack looks
	 *  the way it always has before anyone touches it. */
	let front = $state(1);

	/** Cyclic depth, so bringing a card forward rotates the whole deck rather
	 *  than swapping two cards — it reads as one physical stack being shuffled. */
	function depthOf(i: number) {
		return (i - front + sites.length) % sites.length;
	}

	/** The deck deals itself, so all three redesigns get seen without anyone
	 *  having to discover the controls. */
	const DWELL_MS = 4000;

	let paused = $state(false);
	let visible = $state(false);
	let reduced_motion = $state(false);
	let stack = $state<HTMLElement>();

	$effect(() => {
		const query = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced_motion = query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	// Only deal while the deck is actually on screen — otherwise it has silently
	// cycled a dozen times before the reader ever scrolls down to it.
	$effect(() => {
		if (!stack) return;
		const observer = new IntersectionObserver(
			([entry]) => (visible = entry.isIntersecting),
			{ threshold: 0.35 },
		);
		observer.observe(stack);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (paused || !visible || reduced_motion) return;
		// Reading `front` restarts the dwell after every change, so a manual pick
		// gets a full 4s before the deck takes over again.
		// oxlint-disable-next-line no-unused-expressions
		front;
		const timer = setTimeout(() => (front = (front + 1) % sites.length), DWELL_MS);
		return () => clearTimeout(timer);
	});
</script>

<SectionShell id="first-websites" year="2009" label="First Websites" theme="flash">
	<div class="raster" aria-hidden="true"></div>

	<div class="container">
		<Reveal>
			<YearMark year="2009" subtitle="A Real Production Company" color="#ff66cc" />
		</Reveal>

		<div class="grid">
			<Reveal>
				<!-- No kicker: the year mark immediately above already reads as one,
				     and the title says the film-kid → web-kid turn itself. -->
				<h2 class="title">
					Real companies <br />
					have
					<span class="grad">websites.</span>
				</h2>
				<p class="lede">
					We wanted Hunky Spunky Productions to feel like a real production company. We
					made t-shirts. We made hats. And of course — every real company has a website.
					So I went and bought our first domain name. I didn't really know what a domain
					name was. But I knew we needed one.
				</p>
				<p class="lede">
					I fired up Apple's <strong>iWeb,</strong>
					which let me drag boxes onto a page and call it a website. It was perfect for someone
					who had no idea what HTML was. Pretty soon I outgrew it and moved to
					<strong>Adobe Dreamweaver.</strong>
					That meant I was actually writing code. Mostly badly. But I had crossed a line — I
					could make pixels do what I wanted, and the pixels could now do things on click.
				</p>
				<p class="lede">
					Soon I was writing Flash. A custom Flash header for the homepage with faces that
					made funny expressions when you hovered them. Animated transitions between
					pages. Embedded films. A blog. Anything that felt "interactive" I tried to ram
					in.
				</p>
			</Reveal>

			<Reveal variant="right" delay={100}>
				<div
					class="deck"
					role="group"
					aria-label="Hunky Spunky homepage redesigns"
					onpointerenter={() => (paused = true)}
					onpointerleave={() => (paused = false)}
					onfocusin={() => (paused = true)}
					onfocusout={() => (paused = false)}>
					<div class="browser-stack" bind:this={stack}>
						{#each sites as site, i (site.year)}
							<div class="browser" data-depth={depthOf(i)}>
								<div class="chrome">
									<div class="lights">
										<span></span>
										<span></span>
										<span></span>
									</div>
									<div class="url">www.hunkyspunky.com / {site.year}</div>
								</div>
								<LazyMedia
									src={site.src}
									alt="HSP {site.year} site — {site.tool}"
									ratio="4 / 3"
									onclick={(e) => {
										// Buried cards deal themselves to the top first; only the
										// card you can actually see opens full size.
										if (depthOf(i) !== 0) front = i;
										else gallery?.open(i, e.currentTarget);
									}} />
							</div>
						{/each}
					</div>

					<div class="deck-nav">
						{#each sites as site, i (site.year)}
							<button
								type="button"
								class="year"
								class:on={front === i}
								aria-pressed={front === i}
								onclick={() => (front = i)}>
								<span class="y">{site.year}</span>
								<span class="t">{site.tool}</span>
							</button>
						{/each}
					</div>
				</div>
			</Reveal>
		</div>

		<div class="calamity-launch">
			<Reveal variant="up">
				<h3 class="sub">A site for every film, eventually</h3>
				<p>
					When we released <strong>Calamity</strong>
					(a stop-motion lego film), I built it its own little Flash website. Players could
					move a lego character around and watch its walk cycle animate. There were no objectives.
					No scoring. No win condition. That wasn't the point.
				</p>
				<p class="aside">
					The point was: <em>
						I could write code, and the code would make things appear on a screen.
					</em>
					It was magic. And I was hooked — I still am.
				</p>
			</Reveal>

			<Reveal variant="up" delay={120}>
				<div class="flash-mock">
					<div class="flash-frame">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2009-12-25_calamity-flash_website_screen_recording-main_menu.avif"
							alt="Calamity Flash website screen recording"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(3, e.currentTarget)} />
					</div>
					<div class="flash-tag">FLASH · 2009</div>
				</div>
			</Reveal>
		</div>

		<LightboxGallery bind:this={gallery} key="first-websites" items={sectionExtras} />

		<Reveal>
			<div class="closing">
				<p>
					Looking back: iWeb → Dreamweaver → Flash + ActionScript. The blog was a
					hand-rolled mess. The video player was a custom embed. The "CMS" was me, in
					Dreamweaver, on my home PC, FTP-ing pages up to shared hosting. There were no
					frameworks. No git. No package manager. I knew none of those words.
				</p>
				<p>
					But the loop felt the same as it does now: write something, refresh the browser,
					see it on the screen. That feedback loop is the whole reason I do this.
				</p>
			</div>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='flash']) {
		background:
			radial-gradient(ellipse at 80% 20%, rgba(255, 102, 204, 0.08), transparent 50%),
			radial-gradient(ellipse at 10% 80%, rgba(0, 255, 200, 0.06), transparent 60%),
			linear-gradient(180deg, #0c0716, #14091a 50%, #07081a);
		color: #ffe2f4;
	}
	.raster {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			0deg,
			transparent 0 3px,
			rgba(255, 102, 204, 0.06) 3px 4px
		);
		pointer-events: none;
		opacity: 0.5;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
		text-wrap: balance;
		/* The authored break splits the sentence for wide screens; on a phone
		   each half wraps again and strands a word alone on a line — drop the
		   break there and let `balance` find even lines on its own. */
		br {
			@media (width < 48rem) {
				display: none;
			}
		}
	}
	.grad {
		color: oklch(from #ffb84d 0.82 calc(c * 0.9) h);
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 38rem;
		margin: 0 0 1rem;
	}
	.lede strong {
		color: #ffb84d;
	}

	.browser-stack {
		position: relative;
		aspect-ratio: 4 / 3;
		max-width: 540px;
		margin: 0 auto;
	}
	.browser {
		position: absolute;
		inset: 0;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		box-shadow:
			0 24px 60px rgba(0, 0, 0, 0.55),
			0 4px 14px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.12);
		/* Which card is on top is driven by `front`, never by hover — the same
		   easing plays whether a card is dealt up or falls back. Hover only
		   fans the deck apart so you can see what's buried. */
		transition:
			transform 420ms var(--ease-deck),
			filter 420ms ease;
		--ease-deck: cubic-bezier(0.34, 1.2, 0.64, 1);
	}
	/* The three resting slots. Cards cycle through them; they never swap places
	   pairwise, so the stack always reads as one deck. */
	.browser[data-depth='0'] {
		transform: rotate(-2deg);
		z-index: 3;
	}
	.browser[data-depth='1'] {
		transform: rotate(3deg) translate(5%, -5%);
		z-index: 2;
		filter: brightness(0.72) saturate(0.85);
	}
	.browser[data-depth='2'] {
		transform: rotate(-9deg) translate(-9%, 8%);
		z-index: 1;
		filter: brightness(0.55) saturate(0.7);
	}
	/* Hovering the stack spreads it out and brings the buried cards up out of
	   the shadows — a peek, not a selection.

	   Deliberate exception to the repo's instant-on-hover rule: these cards are
	   already animating between deck slots on their own, and a hard snap in the
	   middle of that reads as a glitch rather than as snappiness. The fan eases
	   both ways, so it stays in the same physical language as the deal. */
	.browser-stack:hover .browser[data-depth='0'] {
		transform: rotate(0deg) translate(3%, -3%);
	}
	.browser-stack:hover .browser[data-depth='1'] {
		transform: rotate(5deg) translate(10%, -9%);
		filter: brightness(0.88) saturate(0.95);
	}
	.browser-stack:hover .browser[data-depth='2'] {
		transform: rotate(-13deg) translate(-16%, 12%);
		filter: brightness(0.75) saturate(0.85);
	}

	.deck-nav {
		display: flex;
		justify-content: center;
		gap: 0.4rem;
		/* Clears the back card, which hangs below the stack's own box. */
		margin-top: 3rem;
	}
	.year {
		appearance: none;
		display: grid;
		gap: 0.15rem;
		padding: 0.4rem 0.85rem;
		background: transparent;
		border: 1px solid rgba(255, 102, 204, 0.25);
		border-radius: 999px;
		color: inherit;
		font-family: var(--font-mono);
		cursor: pointer;
		transition:
			background-color 260ms ease,
			border-color 260ms ease,
			color 260ms ease,
			translate 200ms ease;
	}
	.year:active {
		translate: 0 1px;
		scale: 0.97;
	}
	.year .y {
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.12em;
	}
	.year .t {
		font-size: 0.6rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.year.on {
		background: #ff66cc;
		border-color: #ff66cc;
		color: #1b0214;
	}
	.year.on .t {
		opacity: 0.75;
	}
	.year:focus-visible {
		outline: 2px solid #00d6ff;
		outline-offset: 2px;
	}
	@media (prefers-reduced-motion: reduce) {
		.browser {
			transition-duration: 1ms;
		}
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		background: linear-gradient(180deg, #ddd, #bbb);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: #222;
	}
	.lights {
		display: flex;
		gap: 4px;
	}
	.lights span {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.lights span:nth-child(1) {
		background: #ff5f57;
	}
	.lights span:nth-child(2) {
		background: #febc2e;
	}
	.lights span:nth-child(3) {
		background: #28c840;
	}
	.url {
		flex: 1;
		background: rgba(255, 255, 255, 0.6);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.6rem;
	}

	.calamity-launch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 5rem 0;
	}
	@media (max-width: 768px) {
		.calamity-launch {
			grid-template-columns: 1fr;
		}
	}
	.sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}
	/* The pull-quote reset as a period JS alert: the same chrome the browser
	   deck wears, shrunk to a dialog box. */
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(255, 102, 204, 0.06);
		border: 1px solid oklch(from #ff66cc l c h / 0.55);
		border-radius: 6px;
		overflow: hidden;
	}
	.aside::before {
		content: 'WWW.HUNKYSPUNKY.COM SAYS:';
		display: block;
		margin: -1rem -1.2rem 0.9rem;
		padding: 0.32rem 0.75rem;
		background: linear-gradient(180deg, #ddd, #bbb);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		color: #222;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.18em;
	}
	.aside em {
		font-style: italic;
		color: #ffb84d;
	}

	.flash-mock {
		position: relative;
	}
	.flash-frame {
		background: #000;
		padding: 8px;
		border-radius: 6px;
		box-shadow:
			0 24px 60px rgba(255, 102, 204, 0.18),
			0 4px 14px rgba(0, 0, 0, 0.4);
		border: 1px solid #ff66cc;
	}
	.flash-tag {
		position: absolute;
		bottom: -22px;
		right: 1rem;
		background: #ff66cc;
		color: #1b0214;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		padding: 0.25rem 0.8rem;
		border-radius: 999px;
	}

	/* Closes the section in the same voice it opened in: the lede's type and
	   the section's own ink, held to a reading measure. */
	.closing {
		max-width: 44rem;
		margin-inline: auto;
	}
	.closing p {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
</style>
