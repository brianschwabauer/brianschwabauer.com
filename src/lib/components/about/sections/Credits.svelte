<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';

	const REPO = 'github.com/brianschwabauer/brianschwabauer.com';
	/** Roll speed, px/s. The crawl is slower — the perspective foreshortens it. */
	const ROLL_SPEED = 70;
	const CRAWL_SPEED = 50;
	const FAST_FORWARD = 5;

	const reducedMotion = () =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let reduced = $state(false);
	let crawl = $state(false);
	let holding = $state(false);
	let offset = $state(0);

	let stage_el = $state<HTMLElement | null>(null);
	let roll_el = $state<HTMLElement | null>(null);
	let fin_el = $state<HTMLElement | null>(null);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	// The roll is time-based, never frame-based, so it reads at the same speed on
	// a 60Hz laptop and a 120Hz phone. It only runs while the section is at least
	// half on screen, and picks up exactly where it stopped — scrolling away and
	// back does not restart the credits.
	$effect(() => {
		if (!stage_el || !roll_el) return;
		if (reduced || typeof IntersectionObserver === 'undefined') return;
		let raf = 0;
		let last = 0;
		const step = (now: number) => {
			const delta = last ? (now - last) / 1000 : 0;
			last = now;
			const speed = (crawl ? CRAWL_SPEED : ROLL_SPEED) * (holding ? FAST_FORWARD : 1);
			// Park with FIN centred rather than letting it sail off the top.
			const end = fin_el
				? stage_el!.clientHeight / 2 + fin_el.offsetTop + fin_el.offsetHeight / 2
				: Infinity;
			offset = Math.min(end, offset + speed * delta);
			raf = offset < end ? requestAnimationFrame(step) : 0;
		};
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !raf) {
					last = 0; // drop the gap spent off-screen instead of jumping
					raf = requestAnimationFrame(step);
				} else if (!entry.isIntersecting && raf) {
					cancelAnimationFrame(raf);
					raf = 0;
				}
			},
			{ threshold: 0.5 },
		);
		io.observe(stage_el);
		return () => {
			io.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});

	function onpointerdown(event: PointerEvent) {
		// The crawl toggle lives inside the stage; pressing it shouldn't also
		// fast-forward past the joke it turns on.
		if ((event.target as HTMLElement | null)?.closest('.crawl-toggle')) return;
		holding = true;
	}

	// Release is tracked on the window: a pointer that goes down on the credits
	// and up somewhere else would otherwise leave the roll stuck at 5×.
	$effect(() => {
		if (!holding) return;
		const release = () => (holding = false);
		window.addEventListener('pointerup', release);
		window.addEventListener('pointercancel', release);
		return () => {
			window.removeEventListener('pointerup', release);
			window.removeEventListener('pointercancel', release);
		};
	});
</script>

{#snippet row(role: string, name: string, note?: string)}
	<div class="entry">
		<p class="role">{role}</p>
		<p class="name">
			{name}
			{#if note}
				<span class="note">{note}</span>
			{/if}
		</p>
	</div>
{/snippet}

{#snippet list()}
	<p class="card-heading">DELIVERING DELIGHT</p>

	{@render row('Written, directed, and lived by', 'Brian Schwabauer')}
	{@render row(
		'Executive producers',
		'Mom & Dad',
		'(who taught me the value of hard work)',
	)}
	{@render row(
		'Starring',
		'Jordan, my lovely wife',
		'(whose overwhelming support means more to me than can be put into words)',
	)}
	{@render row('Craft services', 'also Jordan', '(the delightful-food department)')}
	{@render row('Co-producer', 'Kevin Sikes', '(19 short films, zero budgets)')}
	{@render row(
		'Boom operator',
		'Matthew Schwabauer, younger brother',
		'(always willing to tag along)',
	)}
	{@render row(
		'Filmed on location in',
		'the backyard · the basement · Missouri State University · Texas · Kansas City',
	)}
	{@render row(
		'Shot on',
		'MiniDV · four GoPros · Canon 60D · Any camera I could find · Coffee',
	)}
	{@render row(
		'In loving memory of',
		'Russell Sikes',
		'(whose encouragement was the fuel I needed when things were hard)',
	)}
	{@render row(
		'In loving memory of',
		'Adobe Flash, 1996–2020',
		'gone, but still loading… 87%',
	)}

	<div class="colophon">
		<p>This website was shot entirely on Svelte 5 and Cloudflare.</p>
		<p>Built by the director.</p>
		<p class="source">
			View source:
			<a href="https://{REPO}" target="_blank" rel="noopener">{REPO}</a>
		</p>
	</div>

	<p class="joke">Based on a true story. All of it, unfortunately.</p>
	<p class="joke">No pixels were harmed in the making of this website.</p>

	<div class="rating">
		<p class="rating-top">The following life has been rated</p>
		<p class="rating-letter">D — Delightful</p>
		<p class="rating-bottom">Some scenes of excessive craft</p>
	</div>

	<p class="thanks">
		The director would like to thank YOU —
		<br />
		for scrolling all twenty years.
	</p>
{/snippet}

<SectionShell
	id="credits"
	year="Fin"
	label="Credits"
	theme="credits"
	class="credits-shell">
	{#if reduced}
		<div class="static">
			{@render list()}
			<p class="fin">FIN</p>
		</div>
	{:else}
		<div
			bind:this={stage_el}
			class="stage"
			class:crawling={crawl}
			{onpointerdown}
			role="presentation">
			<button
				type="button"
				class="crawl-toggle"
				aria-pressed={crawl}
				onclick={() => (crawl = !crawl)}>
				☆ Crawl mode
			</button>
			{#if crawl}
				<p class="crawl-note">
					(a long time ago, in a backyard far, far away — see also: star_wars_test, 2008)
				</p>
			{/if}

			<div class="viewport">
				<div class="tilt">
					<div bind:this={roll_el} class="roll" style:translate="0 {-offset}px">
						{@render list()}
						<p bind:this={fin_el} class="fin">FIN</p>
					</div>
				</div>
			</div>

			<p class="hint">HOLD TO FAST-FORWARD · SCROLL TO SKIP</p>
			{#if holding}
				<p class="ff" aria-hidden="true">▶▶</p>
			{/if}
		</div>
	{/if}
</SectionShell>

<style>
	:global([data-theme='credits']) {
		background: #000;
		color: #f6f2e8;
	}
	/* Two classes beat the shell's one, so this wins without !important. The
	   credits own the whole viewport — the shell's usual vertical padding would
	   crop the roll. */
	:global(.section-shell.credits-shell) {
		padding: 0;
		contain-intrinsic-size: 1px 100svh;
	}
	@supports (contain-intrinsic-size: auto 1px) {
		:global(.section-shell.credits-shell) {
			contain-intrinsic-size: auto 1px auto 100svh;
		}
	}

	.stage {
		position: relative;
		height: 100svh;
		overflow: clip;
		/* Press-and-hold is the fast-forward; without this the browser starts a
		   text selection instead. */
		user-select: none;
		cursor: default;
	}
	.viewport {
		position: absolute;
		inset: 0;
		perspective: 350px;
	}
	/* Names roll straight through the bottom gutter where the hint sits, and the
	   two were fighting each other for legibility. Dim the strip the hint lives
	   in, the way a player fades its chrome band over the picture. */
	.stage::after {
		content: '';
		position: absolute;
		inset: auto 0 0 0;
		height: clamp(4rem, 12vh, 7rem);
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(0deg, #000 20%, transparent);
	}
	.tilt {
		position: absolute;
		inset: 0;
		transform-origin: bottom center;
		transition: transform 400ms ease;
	}
	.stage.crawling .tilt {
		transform: rotateX(24deg);
	}
	.roll {
		position: absolute;
		/* Starts a full viewport below, so the first line rises into frame. */
		top: 100%;
		left: 50%;
		width: min(56rem, 92vw);
		margin-left: calc(min(56rem, 92vw) / -2);
	}
	.stage.crawling .roll {
		color: #ffe81f;
		/* The perspective shrinks everything upstage; win the size back. */
		font-size: 1.15em;
	}

	.entry {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 clamp(1rem, 3vw, 2.5rem);
		margin-bottom: 1.6rem;
	}
	.role {
		margin: 0;
		text-align: right;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		line-height: 1.7;
		color: rgba(246, 242, 232, 0.55);
	}
	.stage.crawling .role {
		color: rgba(255, 232, 31, 0.6);
	}
	.name {
		margin: 0;
		text-align: left;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1.05rem;
		line-height: 1.5;
	}
	/* Two columns on a phone leaves ~165px a side, which breaks "Matthew
	   Schwabauer, younger brother" across four lines. Stack instead — role over
	   name, both centred — which is how narrow credits have always run. */
	@media (max-width: 560px) {
		.entry {
			grid-template-columns: 1fr;
			gap: 0.15rem;
			margin-bottom: 1.9rem;
		}
		.role,
		.name {
			text-align: center;
		}
	}
	.note {
		display: block;
		font-family: var(--font-sans);
		font-size: 0.82rem;
		line-height: 1.5;
		color: rgba(246, 242, 232, 0.6);
	}
	.stage.crawling .note {
		color: rgba(255, 232, 31, 0.65);
	}

	.card-heading {
		margin: 0 0 4rem;
		text-align: center;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: clamp(1.6rem, 4vw, 2.6rem);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.colophon,
	.joke,
	.rating,
	.thanks,
	.fin {
		text-align: center;
	}
	.colophon {
		margin: 4rem auto 0;
		max-width: 34rem;
	}
	.colophon p {
		margin: 0 0 0.35rem;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1.05rem;
		line-height: 1.6;
	}
	.source {
		font-family: var(--font-mono);
		font-size: 0.78rem;
	}
	.colophon a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.joke {
		margin: 2.6rem auto 0;
		max-width: 34rem;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-style: italic;
		font-size: 1.05rem;
	}

	.rating {
		margin: 4rem auto 0;
		max-width: 30rem;
		padding: 1.1rem 1.4rem;
		border: 2px solid #2f8f4e;
		border-radius: 2px;
		background: rgba(47, 143, 78, 0.08);
		text-transform: uppercase;
	}
	.rating p {
		margin: 0;
		font-family: var(--font-mono);
		line-height: 1.5;
	}
	.rating-top,
	.rating-bottom {
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		color: rgba(246, 242, 232, 0.7);
	}
	.rating-letter {
		margin: 0.35rem 0 !important;
		font-size: 1.1rem;
		font-weight: 700;
		letter-spacing: 0.14em;
	}

	.thanks {
		margin: 4rem auto 0;
		max-width: 34rem;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: clamp(1.1rem, 2.2vw, 1.4rem);
		line-height: 1.6;
	}
	.fin {
		margin: 6rem auto 0;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-style: italic;
		font-size: clamp(2rem, 6vw, 3.5rem);
		letter-spacing: 0.2em;
	}

	.crawl-toggle {
		position: absolute;
		top: clamp(1rem, 3vw, 2rem);
		right: clamp(1rem, 3vw, 2rem);
		z-index: 2;
		padding: 0.4rem 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: rgba(246, 242, 232, 0.7);
		background: transparent;
		border: 1px solid rgba(246, 242, 232, 0.25);
		border-radius: 3px;
		cursor: pointer;
		transition:
			color 250ms ease,
			border-color 250ms ease;
	}
	.crawl-toggle:hover {
		transition-duration: 0s;
		color: #ffe81f;
		border-color: rgba(255, 232, 31, 0.7);
	}
	.crawl-toggle[aria-pressed='true'] {
		color: #ffe81f;
		border-color: rgba(255, 232, 31, 0.7);
	}
	.crawl-note {
		position: absolute;
		top: calc(clamp(1rem, 3vw, 2rem) + 2.2rem);
		right: clamp(1rem, 3vw, 2rem);
		z-index: 2;
		max-width: min(24rem, 60vw);
		margin: 0;
		text-align: right;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		line-height: 1.6;
		color: rgba(255, 232, 31, 0.55);
	}

	.hint,
	.ff {
		position: absolute;
		bottom: clamp(1rem, 3vw, 2rem);
		z-index: 2;
		margin: 0;
		font-family: var(--font-mono);
		pointer-events: none;
	}
	.hint {
		left: 50%;
		translate: -50% 0;
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		white-space: nowrap;
		color: rgba(246, 242, 232, 0.4);
	}
	.ff {
		right: clamp(1rem, 3vw, 2rem);
		font-size: 0.9rem;
		letter-spacing: 0.1em;
		color: rgba(246, 242, 232, 0.75);
	}

	/* Reduced motion: no roll at all — the credits are just a page you read. */
	.static {
		max-width: min(56rem, 92vw);
		margin: 0 auto;
		padding: clamp(4rem, 10vw, 7rem) 0;
	}
</style>
