<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';

	const REPO = 'github.com/brianschwabauer/brianschwabauer.com';
	/**
	 * Roll speed in *screen heights per second* rather than pixels — the credits
	 * now play on the theatre screen in the photo, and that screen is a very
	 * different size on a phone than on a monitor. Tying the speed to the screen
	 * keeps a line's journey top-to-bottom at ~11s everywhere.
	 */
	const ROLL_RATE = 0.09;
	/**
	 * How long the credits can sit off screen before the reader has lost their
	 * place and the roll is better off starting over. Under this, scrolling away
	 * and back is treated as a glance, and the roll picks up mid-sentence.
	 */
	const RESTART_AFTER_MS = 15_000;

	let reduced = $state(false);
	// Held until the section is actually on screen, so the credits open on their
	// first frame for the reader who scrolls all the way down — not somewhere in
	// the middle of the list because the page happened to load a minute ago.
	let paused = $state(true);

	let stage_el = $state<HTMLElement | null>(null);
	let screen_el = $state<HTMLElement | null>(null);
	let block_el = $state<HTMLElement | null>(null);
	let roll_el = $state<HTMLElement | null>(null);

	let block_height = $state(0);
	let screen_height = $state(0);

	/** One loop of the list, in seconds. */
	const duration = $derived(
		block_height && screen_height ? block_height / (screen_height * ROLL_RATE) : 0,
	);
	/**
	 * The lead-in: the roll opens pushed a full screen down, so the house lights
	 * come up on an empty screen with the heading just below the bottom edge, and
	 * the credits play in from nothing. Only once the list has run all the way
	 * through does the loop take over — the second copy is already right behind
	 * the first, so the hand-off is invisible.
	 *
	 * At the roll's own speed, crossing one screen height takes 1/ROLL_RATE
	 * seconds by definition.
	 */
	const intro = $derived(duration ? 1 / ROLL_RATE : 0);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	// The roll is one CSS animation over two identical copies of the list, so the
	// wrap is invisible: by the time copy one has left the top, copy two sits
	// exactly where copy one started. Its duration is measured, not guessed, so
	// editing the credits doesn't quietly change how fast they crawl.
	$effect(() => {
		if (!block_el || !screen_el) return;
		const measure = () => {
			block_height = block_el?.offsetHeight ?? 0;
			screen_height = screen_el?.offsetHeight ?? 0;
		};
		// Measured up front rather than waiting on the observer's first callback:
		// a tab that is hidden at mount never gets one, and the roll would sit
		// frozen with no duration until something happened to resize it.
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(block_el);
		ro.observe(screen_el);
		return () => ro.disconnect();
	});

	/**
	 * Rewind to the first frame — an empty screen with the heading about to rise
	 * into it. The roll is a pair of CSS animations, so this reaches for the
	 * animation objects rather than re-rendering the list: zeroing both puts the
	 * lead-in back at its start and parks the loop back inside its delay.
	 */
	const rewind = () => {
		for (const a of roll_el?.getAnimations?.() ?? []) a.currentTime = 0;
	};

	// Parked while the section is off screen, and rewound if it was off screen
	// long enough that the reader has lost the thread.
	$effect(() => {
		if (!stage_el) return;
		// If IntersectionObserver isn't there at all, a running roll is the safe
		// failure, not a frozen one.
		if (typeof IntersectionObserver === 'undefined') {
			paused = false;
			return;
		}
		let started = false;
		let left_at = 0;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!started || performance.now() - left_at > RESTART_AFTER_MS) rewind();
					started = true;
					paused = false;
				} else {
					if (started) left_at = performance.now();
					paused = true;
				}
			},
			{ threshold: 0.25 },
		);
		io.observe(stage_el);
		return () => io.disconnect();
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
		'MiniDV · four GoPros · Canon 60D · any camera I could find · coffee',
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

	<div class="entry">
		<p class="role">Next project</p>
		<p class="name">
			<a class="casting" href="/contact">could be yours — get in touch</a>
		</p>
	</div>

	<div class="colophon">
		<p>This website was shot entirely on Svelte 5 and Cloudflare.</p>
		<p>Built by the director.</p>
		<p class="source">
			View source:
			<a href="https://{REPO}" target="_blank" rel="noopener">{REPO}</a>
		</p>
	</div>

	<p class="joke">Based on a true story. All of it, unfortunately.</p>

	<p class="fin">FIN</p>

	<div class="stinger">
		<p class="stinger-title">Brian Schwabauer will return</p>
		<p class="stinger-sub">in: whatever gets built next.</p>
	</div>
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
		</div>
	{:else}
		<div bind:this={stage_el} class="stage">
			<!-- The photo is sized off the *screen* inside it, not off the viewport:
			     whatever the window's shape, the whole screen plus a margin is in
			     frame, and the rest of the auditorium crops away around it. -->
			<div class="theater">
				<img
					class="photo"
					src="/movie-theater.avif"
					alt=""
					width="2048"
					height="1351"
					fetchpriority="low"
					decoding="async" />

				<div bind:this={screen_el} class="screen">
					<div
						bind:this={roll_el}
						class="roll"
						class:paused
						class:ready={duration > 0}
						style:--dur="{duration}s"
						style:--intro="{intro}s"
						style:--lead="{screen_height}px">
						<div bind:this={block_el} class="loop">{@render list()}</div>
						<div class="loop" aria-hidden="true" inert>{@render list()}</div>
					</div>
				</div>
			</div>
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
	   crop the photo. */
	:global(.section-shell.credits-shell) {
		padding: 0;
		contain-intrinsic-size: 1px 100svh;
	}
	@supports (contain-intrinsic-size: auto 1px) {
		:global(.section-shell.credits-shell) {
			contain-intrinsic-size: auto 1px auto 100svh;
		}
	}

	/*
	 * Where the screen sits inside movie-theater.avif (2048×1351), as unitless
	 * fractions of the photo. Everything below is derived from these numbers, so
	 * swapping the photo out is a six-line edit.
	 */
	.stage {
		--screen-x: 0.2134;
		--screen-y: 0.1865;
		--screen-w: 0.5298;
		--screen-h: 0.3375;
		--screen-cx: 0.4783;
		--photo-ratio: 0.6597; /* 1351/2048 */

		/*
		 * How much auditorium shows past the screen. Sideways it grows with the
		 * window — 8px on a phone, which has none to spare, up to 250px on a
		 * desktop. Overhead it stays small on purpose: cropping the ceiling
		 * lights away is what buys the rows of seats below, and the seats are
		 * what make the shot read as a theatre.
		 */
		--edge: clamp(8px, calc(23vw - 82px), 250px);
		--above: clamp(24px, 5svh, 54px);
		--below: 40px;

		/* Whichever axis is tighter wins. The height candidate is expressed as a
		   width so the two can be compared. */
		--photo-w: min(
			calc((100cqw - 2 * var(--edge)) / var(--screen-w)),
			calc(
				(100cqh - var(--above) - var(--below)) / (var(--screen-h) * var(--photo-ratio))
			)
		);
		--photo-h: calc(var(--photo-w) * var(--photo-ratio));
		/*
		 * Where the picture starts, measured down from the top of the photo, and
		 * fading in over the 14px below it. Normally that is `--above` clear of
		 * the screen; the second term is the hard limit, because the lowest row
		 * of ceiling lights ends at 12.5% of the frame and the whole point of
		 * this crop is to lose them.
		 */
		--cut-top: max(
			calc(var(--screen-y) * var(--photo-h) - var(--above) - 14px),
			calc(0.128 * var(--photo-h))
		);

		position: relative;
		height: 100svh;
		overflow: clip;
		background: #000;
		container-type: size;
	}

	/*
	 * Hung from the *screen*, not centred as a picture: the screen's top edge
	 * lands `--above` below the top of the section and everything else falls
	 * where it falls. The second term is the floor — a photo shorter than the
	 * section can't be pulled up past its own bottom edge, or the seats would
	 * lift off the floor of the frame.
	 */
	.theater {
		position: absolute;
		left: 50%;
		top: max(
			calc(var(--above) - var(--screen-y) * var(--photo-h)),
			calc(100cqh - var(--photo-h))
		);
		width: var(--photo-w);
		height: var(--photo-h);
		/* Centres the *screen* in the stage rather than the photo. */
		translate: calc(var(--screen-cx) * -100%) 0;
		/*
		 * The top of the picture is cut away above the screen (see `--cut-top`).
		 * On a wide window that line lands on the top edge of the section anyway;
		 * on a tall one it does the real work, taking the ceiling lights with it
		 * so the frame is screen and seats and nothing else. The remaining edges
		 * are feathered for a different reason: a photo smaller than the section
		 * would otherwise end in a hard cut against the black page.
		 */
		mask-image:
			linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent),
			linear-gradient(
				transparent var(--cut-top),
				#000 calc(var(--cut-top) + 14px),
				#000 93%,
				transparent
			);
		mask-composite: intersect;
	}
	.photo {
		display: block;
		width: 100%;
		height: 100%;
	}

	.screen {
		position: absolute;
		left: calc(var(--screen-x) * 100%);
		top: calc(var(--screen-y) * 100%);
		width: calc(var(--screen-w) * 100%);
		height: calc(var(--screen-h) * 100%);
		overflow: clip;
		container-type: size;
		/* Everything inside is sized in `em` off this one value, so the credits
		   are the same picture at every screen size — just projected bigger or
		   smaller, the way a real print is. `--photo-w` resolves against the
		   stage, so this is genuinely "2.1% of the projected screen width". */
		font-size: clamp(0.78rem, calc(var(--photo-w) * var(--screen-w) * 0.021), 1.5rem);
		/* A screen showing white credits is a black screen. Most of the house
		   lighting in the photo is washed out, but not all of it — what is left
		   reads as the picture being *projected* rather than pasted on. */
		background: radial-gradient(
			130% 130% at 50% 38%,
			rgba(0, 0, 0, 0.74),
			rgba(0, 0, 0, 0.91)
		);
	}
	.roll {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		animation: none;
	}
	/*
	 * Two animations, played back to back at the same speed. `lead-in` walks the
	 * list up from a screen below, so the credits open on an empty screen; `roll`
	 * then takes over at the exact translate the lead-in finished on and loops
	 * from there. `roll` fills *forwards* only, so it contributes nothing during
	 * its delay and the lead-in owns those first seconds uncontested.
	 */
	.roll.ready {
		animation:
			lead-in var(--intro) linear both,
			roll var(--dur) linear var(--intro) infinite forwards;
	}
	.roll.paused {
		animation-play-state: paused;
	}
	@keyframes lead-in {
		from {
			translate: 0 var(--lead);
		}
		to {
			translate: 0 0;
		}
	}
	/*
	 * Two identical copies, and the roll travels exactly one copy per cycle — so
	 * the moment it snaps back, copy two is standing precisely where copy one
	 * was. There is no restart to see.
	 */
	@keyframes roll {
		from {
			translate: 0 0;
		}
		to {
			translate: 0 -50%;
		}
	}
	/* The breath between the sign-off and the heading coming round again. */
	.loop {
		padding-bottom: 90cqh;
	}
	/* The name column gets the extra room: the roles are short and fixed, the
	   names carry the long location and camera lists. */
	.entry {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 0 1.5em;
		margin-bottom: 1.7em;
		padding: 0 5%;
	}
	.role {
		margin: 0;
		text-align: right;
		font-family: var(--font-mono);
		font-size: 0.66em;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		line-height: 1.7;
		color: rgba(246, 242, 232, 0.55);
	}
	.name {
		margin: 0;
		text-align: left;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1em;
		line-height: 1.5;
	}
	/* Two columns on a narrow screen leaves ~80px a side, which breaks "Matthew
	   Schwabauer, younger brother" across four lines. Stack instead — role over
	   name, both centred — which is how narrow credits have always run. The query
	   is on the screen's own type size, so it trips on a small phone rather than
	   at some viewport width that no longer means anything here. */
	@container (max-width: 38em) {
		.entry {
			grid-template-columns: 1fr;
			gap: 0.15em;
			margin-bottom: 2em;
		}
		.role,
		.name {
			text-align: center;
		}
	}
	.note {
		display: block;
		font-family: var(--font-sans);
		font-size: 0.78em;
		line-height: 1.5;
		color: rgba(246, 242, 232, 0.6);
	}
	.card-heading {
		margin: 0 0 3.5em;
		padding: 0 6%;
		text-align: center;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1.8em;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-wrap: balance;
	}
	.colophon,
	.joke,
	.fin,
	.stinger {
		text-align: center;
	}
	.colophon {
		margin: 4em auto 0;
		max-width: 34em;
		padding: 0 6%;
	}
	.colophon p {
		margin: 0 0 0.35em;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1em;
		line-height: 1.6;
	}
	.colophon .source {
		font-family: var(--font-mono);
		font-size: 0.74em;
		word-break: break-word;
	}
	.colophon a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.casting {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.joke {
		margin: 2.6em auto 0;
		max-width: 34em;
		padding: 0 6%;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-style: italic;
		font-size: 1em;
	}

	.fin {
		margin: 5em auto 0;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-style: italic;
		font-size: 2.6em;
		letter-spacing: 0.2em;
	}

	/* The stinger that used to be its own post-credits scene, now the last card
	   of the roll. The gap above it is what sells it as a separate beat. */
	.stinger {
		margin: 7em auto 0;
		max-width: 34em;
		padding: 0 6%;
	}
	.stinger-title {
		margin: 0 0 0.7em;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: 1.5em;
		line-height: 1.15;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.stinger-sub {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.7em;
		letter-spacing: 0.22em;
		color: rgba(246, 242, 232, 0.5);
	}

	/* Reduced motion: no roll at all — the credits are just a page you read. */
	.static {
		max-width: min(56rem, 92vw);
		margin: 0 auto;
		padding: clamp(4rem, 10vw, 7rem) 0;
		font-size: 1rem;
	}
	.static .entry,
	.static .card-heading,
	.static .colophon,
	.static .joke,
	.static .thanks,
	.static .stinger {
		padding: 0;
	}
	/* The container query above only knows about the projected screen, which the
	   reduced-motion version doesn't have — so it needs the viewport rule too. */
	@media (max-width: 35rem) {
		.static .entry {
			grid-template-columns: 1fr;
			gap: 0.15em;
			margin-bottom: 2em;
		}
		.static .role,
		.static .name {
			text-align: center;
		}
	}
</style>
