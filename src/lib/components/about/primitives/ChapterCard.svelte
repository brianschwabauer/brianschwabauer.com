<script lang="ts">
	// The three act breaks. Each is a full-viewport card pinned to a stretch of
	// scroll, so the reader drives the transition themselves: a film-leader
	// countdown into the camcorder years, a slate that claps on the pivot to film
	// school, and a text editor typing out the bridge into software.
	//
	// Not a scrubber stop — these are transitions, not destinations, so they carry
	// no `data-section` and never appear in the nav.
	import PinScrub from './PinScrub.svelte';
	import ViewfinderFrame from './ViewfinderFrame.svelte';

	let { act }: { act: 1 | 2 | 3 } = $props();

	let reduced = $state(false);
	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	const meta = $derived(
		{
			1: {
				eyebrow: 'Act I · 2006–2011',
				title: 'The Film Kid',
				sub: "A couple of kids, one camcorder, and no idea what 'coverage' means.",
			},
			2: {
				eyebrow: 'Act II · 2012–2015',
				title: 'The Pivot',
				sub: 'Film school, a senior thesis, and the slow realization that the tool he kept reaching for was a code editor.',
			},
			3: {
				eyebrow: 'Act III · 2016–Today',
				title: 'The Builder',
				sub: '',
			},
		}[act],
	);

	// ── Act 1: the countdown ────────────────────────────────────────────────
	const NUMERALS = [8, 7, 6, 5, 4, 3, 2];
	/** Progress at which the countdown gives way to the title card. */
	const COUNT_END = 0.8;
	const STEP = COUNT_END / NUMERALS.length;
	/** The one numeral that gets a frame of dust on the print. */
	const DUSTY = 5;
	// Fixed, not random: the server and the client have to agree.
	const SPECKS = [
		[18, 24, 2],
		[71, 12, 1],
		[44, 63, 2],
		[86, 47, 1],
		[29, 81, 1],
		[62, 35, 2],
	];

	function countdownAt(p: number) {
		const i = Math.min(NUMERALS.length - 1, Math.max(0, Math.floor(p / STEP)));
		return {
			numeral: NUMERALS[i],
			local: Math.min(1, Math.max(0, (p - i * STEP) / STEP)),
		};
	}

	/** Timecode that runs *backwards* — we're still rewinding into the past. */
	function timecodeAt(p: number) {
		const frames = Math.max(0, Math.round((1 - p) * 8 * 30));
		const ss = String(Math.floor(frames / 30)).padStart(2, '0');
		const ff = String(frames % 30).padStart(2, '0');
		return `00:00:${ss}:${ff}`;
	}

	// ── Act 3: the type-on ──────────────────────────────────────────────────
	const LINES = [
		'The medium changed. The job didn’t.',
		'Storytelling became product thinking. Editing became iteration.',
		'Delighting an audience became delighting users.',
		'Same kid, new camera.',
	];
	const TYPED_BY = 0.85;
	const TOTAL_CHARS = LINES.join('\n').length;

	/** The bridge line, revealed character by character by scroll position. */
	function typedAt(p: number) {
		const shown = Math.round(Math.min(1, Math.max(0, p / TYPED_BY)) * TOTAL_CHARS);
		return LINES.join('\n').slice(0, shown);
	}
</script>

{#snippet titleCard(shown: boolean)}
	<div class="title-card" class:shown>
		<p class="eyebrow">{meta.eyebrow}</p>
		<h2>{meta.title}</h2>
		{#if meta.sub}<p class="sub">{meta.sub}</p>{/if}
	</div>
{/snippet}

{#snippet scene(progress: number)}
	{@const p = reduced ? 1 : progress}

	{#if act === 1}
		{@const { numeral, local } = countdownAt(p)}
		{@const done = p >= COUNT_END}
		<ViewfinderFrame timecode={timecodeAt(p)}>
			<div class="leader-stage">
				{#if !done}
					<div class="countdown" style:--wipe="{local * 360}deg">
						<div class="ring"></div>
						<div class="wipe"></div>
						<div class="crosshair v"></div>
						<div class="crosshair h"></div>
						<div class="numeral">{numeral}</div>
						{#if numeral === DUSTY}
							<div class="dust" aria-hidden="true">
								{#each SPECKS as [x, y, r] (x)}
									<span style:left="{x}%" style:top="{y}%" style:--r="{r}px"></span>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
				{@render titleCard(done)}
				<div class="grain" aria-hidden="true"></div>
				<!-- The splice: one blown-out frame where the leader hands over. -->
				<div class="splice" class:on={p >= 0.795 && p <= 0.815} aria-hidden="true"></div>
			</div>
		</ViewfinderFrame>
	{:else if act === 2}
		{@const shut = Math.min(1, Math.max(0, (p - 0.46) / 0.04))}
		{@const clapped = p >= 0.5}
		{@const shake =
			clapped && p < 0.53 ? Math.sin((p - 0.5) * 260) * 4 * (1 - (p - 0.5) / 0.03) : 0}
		<div class="slate-stage" style:translate="0 {shake}px">
			<div class="slate">
				<div class="clapper" style:rotate="{-18 * (1 - shut)}deg">
					<div class="stripes"></div>
				</div>
				<div class="board">
					<div class="stripes bottom"></div>
					<dl>
						<div>
							<dt>Prod</dt>
							<dd>Real life</dd>
						</div>
						<div>
							<dt>Scene</dt>
							<dd>Film school</dd>
						</div>
						<div>
							<dt>Take</dt>
							<dd>2</dd>
						</div>
						<div>
							<dt>Director</dt>
							<dd>B. Schwabauer</dd>
						</div>
						<div>
							<dt>Date</dt>
							<dd>2012</dd>
						</div>
					</dl>
				</div>
			</div>
			{@render titleCard(clapped)}
			<div class="splice" class:on={p >= 0.5 && p <= 0.515} aria-hidden="true"></div>
		</div>
	{:else}
		{@const text = typedAt(p)}
		{@const typed = p >= TYPED_BY}
		<div class="editor-stage">
			<div class="editor">
				<div class="tabs">
					<span class="tab">act_3.md</span>
				</div>
				<div class="chrome">
					<div class="lights">
						<span class="r"></span>
						<span class="y"></span>
						<span class="g"></span>
					</div>
					<div class="addr"><span class="url">~/brianschwabauer/act_3.md</span></div>
				</div>
				<pre>{text}<span class="caret" class:done={typed}></span></pre>
			</div>
			{@render titleCard(typed)}
		</div>
	{/if}
{/snippet}

<section id="act-{act}" class="chapter act-{act}">
	<PinScrub height={act === 1 ? '200vh' : '150vh'}>
		{#snippet children({ progress })}
			{@render scene(progress)}
		{/snippet}
	</PinScrub>
</section>

<style>
	.chapter {
		position: relative;
		width: 100%;
		/* Same skip-when-far-away treatment as SectionShell, sized for the pin. */
		content-visibility: auto;
		contain-intrinsic-size: 1px 200vh;
	}
	.act-1 :global(.pin-inner),
	.act-2 :global(.pin-inner),
	.act-3 :global(.pin-inner) {
		background: #05050a;
	}
	.act-3 :global(.pin-inner) {
		background: #0b0d12;
	}
	/* PinScrub centres its child as a flex item. ViewfinderFrame has no intrinsic
	   width, so without this the whole leader collapses to zero. */
	.act-1 :global(.viewfinder) {
		width: 100%;
		height: 100svh;
	}

	/* ── Shared title card ──────────────────────────────────────────────── */
	.title-card {
		position: absolute;
		inset: auto 0 auto 0;
		display: grid;
		place-items: center;
		gap: 0.7rem;
		padding: 0 clamp(1rem, 5vw, 3rem);
		text-align: center;
		opacity: 0;
		transition: opacity 400ms ease;
		pointer-events: none;
	}
	.title-card.shown {
		opacity: 1;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.36em;
		text-transform: uppercase;
		opacity: 0.65;
		margin: 0;
	}
	h2 {
		font-size: clamp(2.6rem, 9vw, 6.5rem);
		font-weight: 900;
		letter-spacing: -0.03em;
		line-height: 1;
		margin: 0;
	}
	.sub {
		max-width: 34rem;
		font-size: clamp(0.95rem, 1.6vw, 1.15rem);
		line-height: 1.5;
		opacity: 0.7;
		margin: 0;
		text-wrap: balance;
	}

	/* One blown-out frame at the splice. */
	.splice {
		position: absolute;
		inset: 0;
		background: #fff;
		opacity: 0;
		pointer-events: none;
	}
	.splice.on {
		opacity: 0.92;
	}

	/* ── Act 1 · film leader ────────────────────────────────────────────── */
	.leader-stage {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100svh;
		color: #fff;
	}
	.countdown {
		position: relative;
		width: min(40svh, 78vw);
		aspect-ratio: 1;
		display: grid;
		place-items: center;
	}
	.ring {
		position: absolute;
		inset: 0;
		border: 2px solid rgba(255, 255, 255, 0.85);
		border-radius: 50%;
	}
	/* The sweep hand: a wedge of slightly brighter film, one turn per numeral. */
	.wipe {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			from -90deg,
			rgba(255, 255, 255, 0.16) 0deg,
			rgba(255, 255, 255, 0.16) var(--wipe),
			transparent var(--wipe)
		);
	}
	.crosshair {
		position: absolute;
		background: rgba(255, 255, 255, 0.5);
	}
	.crosshair.v {
		top: -12%;
		bottom: -12%;
		width: 2px;
	}
	.crosshair.h {
		left: -12%;
		right: -12%;
		height: 2px;
	}
	.numeral {
		position: relative;
		font-size: min(26svh, 46vw);
		font-weight: 900;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		text-shadow: 0 0 40px rgba(0, 0, 0, 0.9);
	}
	.dust span {
		position: absolute;
		width: var(--r);
		height: var(--r);
		background: rgba(255, 255, 255, 0.85);
		border-radius: 50%;
	}
	/* Old stock never sits perfectly still. */
	.grain {
		position: absolute;
		inset: 0;
		background: #fff;
		opacity: 0;
		pointer-events: none;
		animation: flicker 220ms steps(2) infinite;
	}
	@keyframes flicker {
		0% {
			opacity: 0.02;
		}
		50% {
			opacity: 0.06;
		}
		100% {
			opacity: 0.03;
		}
	}

	/* ── Act 2 · the slate ──────────────────────────────────────────────── */
	.slate-stage {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100svh;
		color: #fff;
	}
	.slate {
		position: relative;
		width: min(46rem, 84vw);
	}
	.clapper {
		height: clamp(2.2rem, 5vw, 3.2rem);
		border-radius: 4px 4px 0 0;
		transform-origin: left bottom;
		transition: rotate 60ms linear;
		margin-bottom: 3px;
	}
	.stripes {
		height: 100%;
		border-radius: inherit;
		background: repeating-linear-gradient(
			62deg,
			#f4f1e8 0 clamp(1.4rem, 3vw, 2.2rem),
			#14141a clamp(1.4rem, 3vw, 2.2rem) clamp(2.8rem, 6vw, 4.4rem)
		);
		border: 2px solid #14141a;
	}
	.board {
		background: #14141a;
		border: 2px solid #2a2a34;
		border-radius: 4px;
		padding: clamp(0.9rem, 2.4vw, 1.5rem);
	}
	.stripes.bottom {
		height: clamp(1rem, 2.2vw, 1.4rem);
		margin-bottom: clamp(0.8rem, 2vw, 1.2rem);
		border-radius: 2px;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.5rem clamp(1rem, 3vw, 2rem);
		margin: 0;
		font-family: var(--font-mono);
	}
	dl > div {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		border-bottom: 1px solid rgba(244, 241, 232, 0.18);
		padding-bottom: 0.3rem;
	}
	dl > div:last-child {
		grid-column: 1 / -1;
	}
	dt {
		font-size: 0.6rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.5;
		flex-shrink: 0;
	}
	dd {
		margin: 0;
		font-size: clamp(0.85rem, 2vw, 1.15rem);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		/* Chalk, not type — a hair off true. */
		rotate: -0.6deg;
		color: #f4f1e8;
	}

	/* ── Act 3 · the editor ─────────────────────────────────────────────── */
	.editor-stage {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100svh;
		color: #fff;
	}
	.editor {
		width: min(52rem, 88vw);
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 40px 90px rgba(0, 0, 0, 0.6);
		background: #10131a;
	}
	.tabs {
		display: flex;
		background: #14171f;
		padding: 0.35rem 0.5rem 0;
	}
	.tab {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		padding: 0.45rem 0.9rem;
		background: linear-gradient(180deg, #2a2c34, #1f2027);
		border-radius: 6px 6px 0 0;
		color: rgba(255, 255, 255, 0.8);
	}
	.chrome {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.85rem;
		background: linear-gradient(180deg, #2a2c34, #1f2027);
		border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		color: rgba(255, 255, 255, 0.7);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
	.lights {
		display: flex;
		gap: 0.35rem;
	}
	.lights span {
		display: block;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.4);
	}
	.lights .r {
		background: #ff5f57;
	}
	.lights .y {
		background: #febc2e;
	}
	.lights .g {
		background: #28c840;
	}
	.addr {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		padding: 0.3rem 0.7rem;
		background: rgba(0, 0, 0, 0.35);
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		overflow: hidden;
	}
	.url {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	pre {
		margin: 0;
		padding: clamp(1.1rem, 3vw, 2rem);
		font-family: var(--font-mono);
		font-size: clamp(0.8rem, 1.7vw, 1.05rem);
		line-height: 1.85;
		white-space: pre-wrap;
		color: #d8e2f0;
		/* Hold the full block's height from the first frame so the card doesn't
		   grow under the reader as the text types on. */
		min-height: calc(4 * 1.85em + 2 * clamp(1.1rem, 3vw, 2rem));
	}
	.caret {
		display: inline-block;
		width: 0.6em;
		height: 1.05em;
		margin-left: 0.08em;
		translate: 0 0.18em;
		background: #00f2c3;
	}
	.caret.done {
		/* The line is written; stop drawing attention to the cursor. */
		opacity: 0;
	}

	@media (prefers-reduced-motion: reduce) {
		.chapter {
			contain-intrinsic-size: 1px 100svh;
		}
		.grain,
		.title-card {
			animation: none;
			transition: none;
		}
		.clapper {
			transition: none;
		}
	}
</style>
