<script lang="ts">
	import { onMount } from 'svelte';
	import SectionShell from '../primitives/SectionShell.svelte';
	import PinScrub from '../primitives/PinScrub.svelte';
	import PinDrift from '../primitives/PinDrift.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';

	const currentYear = new Date().getFullYear();
	const START_YEAR = 2006;

	// Under reduced motion the pin collapses to a static scene — show the tape
	// fully rewound instead of frozen at "today".
	let reduced = $state(false);
	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduced = mq.matches;
		const onChange = () => (reduced = mq.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	// The pin opens on a present-day beat before the rewind starts. The first
	// slice of the scrub belongs to the bio; the rest is remapped to 0→1 and fed
	// to the rewind untouched, so the tape keeps exactly the pacing it had.
	const BIO_FRAC = 0.28;
	const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
	// Quart ease-out — the deck arrives early and settles, so it is already
	// assembled by the time the bio has left rather than racing it off-screen.
	const fadeFrom = (t: number, start: number) =>
		1 - Math.pow(1 - clamp01((t - start) / (1 - start)), 4);
	// Cubic ease-out on the year's descent: it clears the cassette band early and
	// then settles, so it is already parked when the deck finishes fading in.
	const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

	// The deck holds its layout the whole time it is invisible, which at the start
	// of the pin opens a void between the bio and the year. The year is lifted
	// across that void by transform and eased back to exactly 0 — measured from
	// the real layout rather than a guessed vh, and measured with offsetTop /
	// offsetHeight, which stay honest while everything on screen is transformed.
	let sceneEl = $state<HTMLElement | null>(null);
	let deckEl = $state<HTMLElement | null>(null);
	let stageEl = $state<HTMLElement | null>(null);
	let bioEl = $state<HTMLElement | null>(null);
	let yearLift = $state(0);

	$effect(() => {
		if (!sceneEl || !deckEl || !stageEl || !bioEl) return;
		const measure = () => {
			const sceneTop = sceneEl!.offsetTop;
			const deckTop = sceneTop + deckEl!.offsetTop;
			const stageTop = sceneTop + stageEl!.offsetTop;
			// Whatever the scene's own flex gap currently resolves to.
			const gap = stageTop - deckTop - deckEl!.offsetHeight;
			const bioBottom = bioEl!.offsetTop + bioEl!.offsetHeight;
			yearLift = Math.max(
				0,
				// Swallow the deck whole, unless the viewport is short enough that
				// doing so would slide the year up behind the bio.
				Math.min(stageTop - deckTop, stageTop - bioBottom - gap),
			);
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(sceneEl);
		ro.observe(bioEl);
		return () => ro.disconnect();
	});

	// Heavy ease-in-out: the first and last years linger long enough to actually
	// read (they're the ones that matter), while the middle years whip past as
	// pure motion — leaning into the time-travel blur rather than fighting it.
	const easeInOut = (t: number) =>
		t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

	const YEARS = Array.from(
		{ length: currentYear - START_YEAR + 1 },
		(_, i) => START_YEAR + i,
	);

	// Continuous position on the timeline (today → 2006) for the year flight.
	const yearFloatAt = (p: number) =>
		currentYear - (currentYear - START_YEAR) * easeInOut(p);

	// Tape geometry: as p goes 0→1 the tape mass moves from the right (take-up)
	// reel back onto the left (supply) reel.
	const PACK_MIN = 15;
	const PACK_MAX = 30;
	const packLeft = (p: number) => PACK_MIN + (PACK_MAX - PACK_MIN) * p;
	const packRight = (p: number) => PACK_MAX - (PACK_MAX - PACK_MIN) * p;
	// Reels spin backwards while rewinding; several full turns over the scrub.
	const spin = (p: number) => -p * 1440;

	// Tape counter for the rail. It travels 1:1 with the scroll so the wheel still
	// feels like it is moving the page, and the counter running down as it climbs
	// is the reason it's there: it reads as tape being wound off rather than as a
	// decorative treadmill.
	//
	// Minutes:seconds:frames, not hours-first. A leading field that never moves
	// makes the whole reading look frozen no matter how fast the rest of it spins,
	// so the counter carries no field slower than the scroll can visibly change —
	// and the step is sized to turn the minutes over within a screenful of rungs.
	const FPS = 24;
	const TC_SPAN = 60 * 60 * FPS; // one hour; the counter is MM:SS:FF, so it wraps there
	const TC_START = 59 * 60 * FPS; // 59:00:00 — a full tape, about to be wound off
	const TC_STEP = 163; // frames counted off per rung (~6.8s)
	const pad = (n: number) => String(n).padStart(2, '0');
	const timecode = (k: number) => {
		const f = (((TC_START - k * TC_STEP) % TC_SPAN) + TC_SPAN) % TC_SPAN;
		return [
			pad(Math.floor(f / (FPS * 60)) % 60),
			pad(Math.floor(f / FPS) % 60),
			pad(f % FPS),
		].join(':');
	};
</script>

<SectionShell id="rewind" year={String(currentYear)} label="Rewind" theme="rewind">
	<div class="bg" aria-hidden="true">
		<div class="grid-overlay"></div>
		<div class="vignette"></div>
	</div>

	<!-- 250vh, of which the first BIO_FRAC is the bio. What is left over is the
	     same 180vh the rewind had before, so the scrub still feels like a flick
	     rather than a commitment. -->
	<PinScrub height="250vh" class="rewind-pin">
		{#snippet children({ progress, scrolled })}
			{@const bioP = reduced ? 1 : clamp01(progress / BIO_FRAC)}
			{@const p = reduced ? 1 : clamp01((progress - BIO_FRAC) / (1 - BIO_FRAC))}
			{@const yearFloat = yearFloatAt(p)}
			{@const done = p >= 0.995}
			{@const introIn = reduced ? 1 : fadeFrom(bioP, 0.3)}
			{@const cassetteIn = reduced ? 1 : fadeFrom(bioP, 0.42)}
			{@const yearDrop = reduced ? 0 : yearLift * (1 - easeOut(bioP))}
			<!-- A tape counter up the left flank, climbing at exactly the scroll's own
			     rate. The scene in the middle is pinned; this is what keeps the scroll
			     feeling like scrolling. Left only — the year scrubber owns the right
			     edge on every section, and a second gauge beside it just reads as
			     clutter competing with the nav.

			     A major tick and a reading every rung, with minor ticks quartering the
			     gap. The minors carry most of the motion — four times as many moving
			     edges as the readings alone, which is what makes the travel legible
			     without having to shout. -->
			{#snippet rung({ k }: { k: number })}
				<i class="tick major"></i>
				<span class="tc">{timecode(k)}</span>
				{#each [24, 48, 72] as offset (offset)}
					<i class="tick" style:top="{offset}px"></i>
				{/each}
			{/snippet}
			<div class="rail"><PinDrift {scrolled} period={96} mark={rung} /></div>

			<!-- The room changes colour as the tape runs back: cool indigo at today,
			     warm sepia at 2006. It lives inside the pin because the pinned inner
			     is exactly the viewport the reader is watching while they scrub, and
			     one opacity on one layer is the cheapest thing that can composite. -->
			<div class="warm" style:opacity={p} aria-hidden="true"></div>

			<!-- The present-day beat the tape is about to run back from. It travels
			     on `scrolled`, not on `progress` — tied to the reader's own scrolling
			     it leaves like ordinary page content, where anything normalised to
			     the pin would read as a scrubbed layer being dragged off. -->
			<div
				bind:this={bioEl}
				class="bio"
				class:offstage={!reduced && bioP >= 1}
				style:transform={reduced ? 'none' : `translateY(${-scrolled}px)`}>
				<span>
					<i aria-hidden="true">&#9654;</i>
					Playing · today
				</span>
				<p>
					Today I'm the founder of Show&amp;Tour, building software from Kansas City,
					where I live with my wife and our four kids. Twenty years of startups, apps, and
					videos got me here — but it didn't start with any of that.
				</p>
			</div>

			<div bind:this={sceneEl} class="scene">
				<!-- A wrapper purely so the pair can be measured as one block; it
				     repeats the scene's own column and gap, so nothing about the
				     resting layout changes. -->
				<div bind:this={deckEl} class="deck">
					<div
						class="intro"
						class:offstage={introIn < 0.02}
						style:opacity={introIn}
						style:transform={introIn >= 1
							? 'none'
							: `translateY(${(1 - introIn) * 14}px)`}>
						<!-- Two transport modes on the same deck: the rewind ends its own
					     gesture here, so the leader that follows reads as the tape
					     playing rather than as a second countdown. -->
						<div class="eyebrow">
							<span class="mode" class:off={done}>
								<span
									class="rew-icon"
									class:running={p > 0.01 && !done}
									aria-hidden="true">
									◄◄
								</span>
								Rewind the tape
							</span>
							<span class="mode" class:off={!done}>
								&#9209; REWOUND TO {START_YEAR} · &#9654; PLAY
							</span>
						</div>
						<h2 class="title">Where it all started.</h2>
						<p class="lede">
							It started with a miniDV camera, a bedroom wall painted green, and a friend
							named Kevin.
							<strong>Keep scrolling to rewind twenty years.</strong>
						</p>
						<!-- A diegetic skip for anyone who came for "what does he do now".
					     The pin holds it on screen for the whole scrub, so it can stay
					     quiet and still never be missed. -->
						<PlayFilm
							href="#now"
							icon="forward"
							label="Fast-forward to now"
							color="#ff9c4a" />
					</div>

					<div
						class="cassette"
						class:done
						class:offstage={cassetteIn < 0.02}
						style:opacity={cassetteIn}
						style:transform={cassetteIn >= 1
							? 'none'
							: `translateY(${(1 - cassetteIn) * 18}px)`}>
						<svg
							viewBox="0 0 340 210"
							role="img"
							aria-label="A cassette tape rewinding from {currentYear} back to {START_YEAR} as you scroll">
							<!-- shell -->
							<rect x="4" y="4" width="332" height="202" rx="16" class="shell" />
							<!-- corner screws -->
							<circle cx="22" cy="22" r="3" class="screw" />
							<circle cx="318" cy="22" r="3" class="screw" />
							<circle cx="22" cy="188" r="3" class="screw" />
							<circle cx="318" cy="188" r="3" class="screw" />
							<!-- label -->
							<rect x="28" y="20" width="284" height="52" rx="8" class="label" />
							<text x="170" y="42" class="label-text" text-anchor="middle">
								EVERYTHING I'VE MADE
							</text>
							<!-- The tape is the body of work, not the life — which is why it
						     starts in 2006 and not at birth. -->
							<text x="170" y="60" class="label-sub" text-anchor="middle">
								TAPE 01 · {START_YEAR}–TODAY
							</text>
							<!-- tape window -->
							<rect x="58" y="88" width="224" height="84" rx="12" class="window" />
							<!-- tape packs -->
							<circle cx="112" cy="130" r={packLeft(p)} class="pack" />
							<circle cx="228" cy="130" r={packRight(p)} class="pack" />
							<!-- tape path across the head -->
							<path
								d="M 112 {130 + packLeft(p)} L 145 168 L 195 168 L 228 {130 +
									packRight(p)}"
								class="tape" />
							<!-- hubs + spokes, spinning with scroll -->
							{#each [112, 228] as cx (cx)}
								<g transform="rotate({spin(p)} {cx} 130)">
									<circle {cx} cy="130" r="11" class="hub" />
									{#each [0, 60, 120, 180, 240, 300] as a (a)}
										<line
											x1={cx + 5 * Math.cos((a * Math.PI) / 180)}
											y1={130 + 5 * Math.sin((a * Math.PI) / 180)}
											x2={cx + 10.5 * Math.cos((a * Math.PI) / 180)}
											y2={130 + 10.5 * Math.sin((a * Math.PI) / 180)}
											class="spoke" />
									{/each}
								</g>
							{/each}
						</svg>
					</div>
				</div>

				<!-- Years fly past the camera as the tape rewinds: the year being
				     left behind blows up toward the viewer and fades, while the
				     next one back approaches from the distance. -->
				<div
					bind:this={stageEl}
					class="year-stage"
					class:done
					style:transform={yearDrop <= 0.5 ? 'none' : `translateY(${-yearDrop}px)`}
					role="img"
					aria-label="Rewinding to {Math.round(yearFloat)}">
					{#each YEARS as y (y)}
						{@const t = y - yearFloat}
						{#if Math.abs(t) < 1}
							{@const passing = Math.max(0, t)}
							{@const approaching = Math.max(0, -t)}
							<!-- Squared opacity falloff: the year nearest "now" reads at
							     near-full strength while its neighbors drop off quickly,
							     so two mid-flight years never compete at similar alpha. -->
							<span
								class="year-fly"
								style:transform="scale({1 + passing * 2.4 - approaching * 0.55})"
								style:opacity={Math.pow(1 - Math.max(passing, approaching), 1.8)}>
								{y}
							</span>
						{/if}
					{/each}
				</div>
			</div>
		{/snippet}
	</PinScrub>
</SectionShell>

<style>
	/* Today's end of the tape: cool, blue, present tense. The warm layer inside
	   the pin takes it the rest of the way to 2006. */
	:global([data-theme='rewind']) {
		background:
			radial-gradient(circle at 50% 0%, rgba(108, 99, 255, 0.28), transparent 58%),
			linear-gradient(180deg, #05070f, #0a0f2a 50%, #060812);
		color: #fff;
	}
	/* The pinned scene provides its own vertical rhythm — the shell's default
	   block padding would just push the sticky start/end points around. */
	:global(.section-shell[data-theme='rewind']) {
		padding-block: 0;
	}
	.bg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.grid-overlay {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04) 0 2px,
			transparent 2px 80px
		);
		mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);
		opacity: 0.6;
	}
	/* 2006, fully rewound: amber, sepia, a warmer room. Opaque enough at p=1 that
	   the cool base is gone rather than tinted — the change has to be something
	   you watch happen, not something you'd have to A/B. */
	.warm {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(circle at 50% 12%, rgba(255, 156, 74, 0.22), transparent 60%),
			linear-gradient(180deg, #140b04, #3a2008 52%, #180d05);
	}
	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at center,
			transparent 0%,
			rgba(5, 5, 10, 0.65) 75%,
			#050a10 100%
		);
	}

	/* The counter sits in the far periphery: wide enough to register as motion, dim
	   enough that the year flight keeps the middle of the screen. */
	.rail {
		position: absolute;
		inset-block: 0;
		left: 2rem;
		/* Wide enough for a full reading plus its inset — the ladder clips its
		   overflow, so a rail even a few px short lops a digit off the end. */
		width: 4.5rem;
		mask-image: linear-gradient(180deg, transparent, #000 20% 80%, transparent);

		/* A fixed hairline for the ticks to slide against. Nothing about it moves —
		   that is the point: travel is only as readable as the still thing it can be
		   measured against, and without it the ticks are just drifting in space. */
		&::before {
			content: '';
			position: absolute;
			inset-block: 0;
			left: 0;
			width: 1px;
			background: rgba(255, 156, 74, 0.16);
		}
	}
	/* Ticks hang off the rail's outer edge and the numbers sit inboard of them, so
	   the pair reads as one fixed gauge the tape runs past rather than as a floating
	   column of numbers. */
	.tick {
		position: absolute;
		left: 0;
		top: 0;
		width: 0.7rem;
		height: 1px;
		background: rgba(255, 156, 74, 0.45);

		&.major {
			width: 1.9rem;
			height: 2px;
			background: rgba(255, 156, 74, 0.85);
		}
	}
	.tc {
		position: absolute;
		left: 0.4rem;
		top: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		font-variant-numeric: tabular-nums;
		color: rgba(255, 156, 74, 0.72);
		white-space: nowrap;
	}
	/* No width to spare beside the years here — the rail sheds the readings and
	   carries the motion on ticks alone rather than colliding with the scene. */
	@media (max-width: 768px) {
		.rail {
			left: 0;
			/* Still has to clear the major tick, the widest thing left once the
			   readings go. */
			width: 2.25rem;
		}
		.tc {
			display: none;
		}
	}

	/* Phase A. An overlay rather than a scene member so the deck underneath keeps
	   its layout while it is still invisible — nothing reflows when it fades in.
	   Sits high enough in the frame that it has cleared the top well inside the
	   bio's share of the scrub. */
	.bio {
		position: absolute;
		top: clamp(4rem, 14vh, 8rem);
		left: 0;
		right: 0;
		z-index: 2;
		width: min(42rem, 88%);
		margin-inline: auto;
		text-align: center;
		will-change: transform;
		/* Nothing in here is interactive, and it passes straight over the skip
		   button on its way out. */
		pointer-events: none;

		span {
			display: inline-flex;
			align-items: center;
			gap: 0.55rem;
			font-family: var(--font-mono);
			font-size: 0.72rem;
			letter-spacing: 0.32em;
			text-transform: uppercase;
			color: rgba(255, 255, 255, 0.6);
		}
		i {
			font-style: normal;
			color: #ff9c4a;
			opacity: 0.6;
		}
		p {
			font-size: clamp(1rem, 1.5vw, 1.15rem);
			line-height: 1.65;
			color: rgba(255, 255, 255, 0.74);
			text-wrap: pretty;
			margin: 0.95rem 0 0;
		}
	}
	/* Gone means gone — out of the a11y tree and out of the way, not merely
	   translated past the edge of a clipped box. */
	.bio.offstage,
	.intro.offstage,
	.cassette.offstage {
		visibility: hidden;
	}

	.scene {
		position: relative;
		z-index: 1;
		width: min(64rem, 100%);
		padding: clamp(1rem, 3vw, 2rem);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(1rem, 2.5vh, 2rem);
		text-align: center;
	}
	/* A measuring handle, not a layout change: same column, same gap, same
	   centring the scene already gave these two on its own. */
	.deck {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: clamp(1rem, 2.5vh, 2rem);
	}
	/* Both readouts share one grid cell so the swap is a crossfade in place and
	   the block below it never shifts. */
	.eyebrow {
		display: inline-grid;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 0.9rem;
	}
	.mode {
		grid-area: 1 / 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		white-space: nowrap;
		transition: opacity 260ms ease;
	}
	.mode.off {
		opacity: 0;
	}
	.rew-icon {
		color: #ff9c4a;
		opacity: 0.6;
	}
	.rew-icon.running {
		animation: rew-pulse 700ms ease-in-out infinite;
	}
	@keyframes rew-pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}
	.title {
		font-size: clamp(2rem, 5vw, 3.4rem);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.025em;
		margin: 0 0 0.7rem;
	}
	.lede {
		font-size: clamp(1rem, 1.6vw, 1.2rem);
		line-height: 1.55;
		max-width: 44rem;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 auto;
	}
	.lede strong {
		color: #ff9c4a;
		font-weight: 600;
	}

	/* The skip is a `PlayFilm` in link form now, so it carries the same squircle,
	   ripple and 3D press as every other transport control on the page. All this
	   section still owns is where it sits. */
	.intro :global(.play-film-wrap) {
		--play-film-offset: 1.6rem;
	}

	.cassette {
		width: min(420px, 82vw);
		filter: drop-shadow(0 24px 60px rgba(255, 156, 74, 0.12));
	}
	.cassette svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.shell {
		fill: rgba(255, 255, 255, 0.03);
		stroke: rgba(255, 255, 255, 0.2);
		stroke-width: 1.5;
	}
	.screw {
		fill: rgba(255, 255, 255, 0.25);
	}
	.label {
		fill: rgba(255, 156, 74, 0.07);
		stroke: rgba(255, 156, 74, 0.35);
		stroke-width: 1;
	}
	.label-text {
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.22em;
		fill: rgba(255, 255, 255, 0.85);
	}
	.label-sub {
		font-family: var(--font-mono);
		font-size: 9px;
		letter-spacing: 0.3em;
		fill: rgba(255, 255, 255, 0.45);
	}
	.window {
		fill: rgba(0, 0, 0, 0.5);
		stroke: rgba(255, 255, 255, 0.15);
		stroke-width: 1;
	}
	.pack {
		fill: #241608;
		stroke: rgba(255, 156, 74, 0.45);
		stroke-width: 1.5;
	}
	.tape {
		fill: none;
		stroke: rgba(255, 156, 74, 0.55);
		stroke-width: 2;
	}
	.hub {
		fill: #0d0d12;
		stroke: #ff9c4a;
		stroke-width: 1.5;
	}
	.spoke {
		stroke: #ff9c4a;
		stroke-width: 1.5;
		stroke-linecap: round;
	}
	.cassette.done .hub,
	.cassette.done .spoke {
		stroke: #7dffc9;
	}

	.year-stage {
		position: relative;
		width: 100%;
		height: clamp(8rem, 24vw, 18rem);
		display: grid;
		place-items: center;
		margin-top: -0.5rem;
	}
	.year-fly {
		position: absolute;
		font-family: var(--font-mono);
		font-weight: 900;
		font-size: clamp(7rem, 22vw, 17rem);
		line-height: 1;
		letter-spacing: -0.04em;
		font-variant-numeric: tabular-nums;
		color: transparent;
		-webkit-text-stroke: 2.5px #ff9c4a;
		user-select: none;
		pointer-events: none;
	}
	.year-stage.done .year-fly {
		-webkit-text-stroke-color: #7dffc9;
		text-shadow: 0 0 60px rgba(125, 255, 201, 0.25);
	}
	@media (max-width: 640px) {
		.year-fly {
			-webkit-text-stroke-width: 1.5px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.rew-icon.running {
			animation: none;
		}
		/* The pin has collapsed to one static scene, so the bio has nothing left to
		   scroll away from — it becomes an ordinary block stacked above it. */
		:global(.rewind-pin .pin-inner) {
			flex-direction: column;
			height: auto;
			overflow: visible;
			padding-block: clamp(3rem, 9vh, 6rem);
			gap: clamp(2rem, 6vh, 3.5rem);
		}
		.bio {
			position: static;
			width: min(42rem, 100%);
			will-change: auto;
		}
	}
</style>
