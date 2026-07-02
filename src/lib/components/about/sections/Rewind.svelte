<script lang="ts">
	import { onMount } from 'svelte';
	import SectionShell from '../primitives/SectionShell.svelte';
	import PinScrub from '../primitives/PinScrub.svelte';

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
</script>

<SectionShell id="rewind" year={String(currentYear)} label="Rewind" theme="rewind">
	<div class="bg" aria-hidden="true">
		<div class="grid-overlay"></div>
		<div class="vignette"></div>
	</div>

	<PinScrub height="260vh" class="rewind-pin">
		{#snippet children({ progress })}
			{@const p = reduced ? 1 : progress}
			{@const yearFloat = yearFloatAt(p)}
			{@const done = p >= 0.995}
			<div class="scene">
				<div class="intro">
					<div class="eyebrow">
						<span class="rew-icon" class:running={p > 0.01 && !done} aria-hidden="true">
							◄◄
						</span>
						Rewind the tape
					</div>
					<h2 class="title">Where it all started.</h2>
					<p class="lede">
						That's today. But none of it started with a company. It started with a miniDV
						camera, a bedroom wall painted green, and a friend named Kevin.
						<strong>Keep scrolling to rewind twenty years.</strong>
					</p>
				</div>

				<div class="cassette" class:done>
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
							HUNKY SPUNKY PRODUCTIONS
						</text>
						<text x="170" y="60" class="label-sub" text-anchor="middle">
							TAPE 01 · {START_YEAR}–{currentYear}
						</text>
						<!-- tape window -->
						<rect x="58" y="88" width="224" height="84" rx="12" class="window" />
						<!-- tape packs -->
						<circle cx="112" cy="130" r={packLeft(p)} class="pack" />
						<circle cx="228" cy="130" r={packRight(p)} class="pack" />
						<!-- tape path across the head -->
						<path
							d="M 112 {130 + packLeft(p)} L 145 168 L 195 168 L 228 {130 + packRight(p)}"
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

				<!-- Years fly past the camera as the tape rewinds: the year being
				     left behind blows up toward the viewer and fades, while the
				     next one back approaches from the distance. -->
				<div
					class="year-stage"
					class:done
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
	:global([data-theme='rewind']) {
		background:
			radial-gradient(circle at 50% 0%, rgba(108, 99, 255, 0.18), transparent 55%),
			radial-gradient(circle at 50% 100%, rgba(255, 156, 74, 0.1), transparent 60%),
			linear-gradient(180deg, #050a10, #0a0a12 50%, #100a06);
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
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
		margin-bottom: 0.9rem;
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
	}
</style>
