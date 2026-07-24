<script lang="ts">
	// The lobby. Poster wall first (the billing block), then the ticket window:
	// pick the theatrical cut or the director's cut before walking in.
	import { ripple } from '@delightstack/utilities';
	import SectionShell from '../primitives/SectionShell.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import { cut, setCut, type Cut } from '$lib/cut.svelte';

	const stubs: Array<{
		id: Cut;
		name: string;
		runtime: string;
		desc: string;
	}> = [
		{
			id: 'theatrical',
			name: 'Theatrical cut',
			runtime: '≈ 5 min',
			desc: 'The story, the highlights, the good parts.',
		},
		{
			id: 'director',
			name: "Director's cut",
			runtime: '≈ 25 min',
			desc: 'Every deleted scene, BTS photo, and nerdy detail.',
		},
	];

	let stub_els: Record<string, HTMLButtonElement | undefined> = $state({});
</script>

<SectionShell
	id="ticket-booth"
	year="Lobby"
	label="Choose Your Cut"
	theme="lobby"
	class="booth">
	<div class="marquee" aria-hidden="true"></div>

	<div class="container">
		<Reveal variant="fade">
			<!-- The condensed tall-type block from the bottom of a film poster. -->
			<div class="billing">
				<p>
					<small>A</small>
					<b>SHOWANDTOUR</b>
					<small>PRODUCTION</small>
				</p>
				<p>
					<b>BRIAN SCHWABAUER</b>
					<small>·</small>
					<b>SOFTWARE ENGINEER</b>
					<small>·</small>
					<b>DESIGNER</b>
					<small>·</small>
					<b>ENTREPRENEUR</b>
				</p>
				<p>
					<small>CURRENTLY BUILDING</small>
					<b>
						<a href="https://showandtour.com">&quot;SHOW&amp;TOUR&quot;</a>
					</b>
					<small>· FORMERLY</small>
					<b>FILMMAKER</b>
					<small>·</small>
					<b>FREELANCER</b>
					<small>·</small>
					<b>FLASH KID</b>
				</p>
				<p>
					<small>FILMED ON LOCATION IN</small>
					<b>KANSAS CITY</b>
					<small>· RUNTIME:</small>
					<b>20 YEARS AND COUNTING</b>
				</p>
			</div>
		</Reveal>

		<Reveal variant="up" delay={80}>
			<div class="intro">
				<p class="eyebrow">Now showing</p>
				<h2>Choose your screening.</h2>
				<p class="subline">
					One story, two runtimes. Switch anytime — look for the deleted-scene markers.
				</p>
			</div>
		</Reveal>

		<Reveal variant="up" delay={160}>
			<div class="stubs">
				{#each stubs as stub (stub.id)}
					{@const selected = cut.value === stub.id}
					<button
						bind:this={stub_els[stub.id]}
						type="button"
						class="stub {stub.id}"
						class:selected
						aria-pressed={selected}
						onclick={() => setCut(stub.id, stub_els[stub.id])}
						{@attach ripple()}>
						<span class="edge" aria-hidden="true">
							<span>Admit one</span>
						</span>
						<span class="body">
							<span class="name">{stub.name}</span>
							<span class="runtime">{stub.runtime}</span>
							<span class="desc">{stub.desc}</span>
							<span class="barcode" aria-hidden="true"></span>
						</span>
						{#if selected}
							<span class="stamp" aria-hidden="true">Admitted</span>
						{/if}
					</button>
				{/each}
			</div>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='lobby']) {
		background: #0a0810;
		color: #f4ecdd;
	}
	/* The lobby is ~one screen. The shell's default section padding would push
	   the stubs off it, so override it here (two classes beat the shell's one). */
	:global(.section-shell.booth) {
		min-height: 100svh;
		display: grid;
		align-items: center;
		padding-block: clamp(4rem, 9vw, 7rem);
	}
	/* Warm spill from the marquee lights just out of frame, above the poster. */
	.marquee {
		position: absolute;
		inset: 0 0 auto;
		height: 55%;
		background: radial-gradient(
			ellipse 70% 100% at 50% 0%,
			rgba(255, 214, 110, 0.08),
			transparent 70%
		);
		pointer-events: none;
	}
	.container {
		max-width: 68rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}

	/* ── Billing block ───────────────────────────────────────────────────── */
	.billing {
		max-width: 44rem;
		margin: 0 auto;
		text-align: center;
		text-wrap: balance;
		opacity: 0.6;
		letter-spacing: 0.08em;
		line-height: 1.35;
		/* Nunito Sans has no width axis, so the poster-condensed look comes from
		   a horizontal squeeze. font-stretch is set too, for the day it does. */
		font-stretch: semi-condensed;
		scale: 0.72 1;

		p {
			margin: 0;
			text-transform: uppercase;
			font-weight: 800;
		}
		b {
			font-size: 0.8rem;
			font-weight: 800;
		}
		small {
			font-size: 0.55rem;
			font-weight: 700;
			opacity: 0.75;
		}
		a {
			color: inherit;
			text-decoration: none;
			transition: text-decoration-color 250ms ease;
			text-decoration: underline 1px transparent;
			text-underline-offset: 0.2em;
		}
		a:hover {
			transition-duration: 0s;
			text-decoration-color: currentColor;
		}
	}

	/* ── Ticket window ───────────────────────────────────────────────────── */
	.intro {
		text-align: center;
		margin-top: clamp(2.5rem, 6vw, 4rem);
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.36em;
		text-transform: uppercase;
		color: #ffd66e;
		margin: 0 0 0.9rem;
	}
	h2 {
		font-size: clamp(2rem, 5.5vw, 3.4rem);
		font-weight: 900;
		letter-spacing: -0.03em;
		margin: 0;
	}
	.subline {
		margin: 0.9rem auto 0;
		max-width: 34rem;
		font-size: 1.02rem;
		line-height: 1.55;
		opacity: 0.7;
	}

	.stubs {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(1rem, 3vw, 2rem);
		margin-top: clamp(2rem, 5vw, 3.25rem);
	}

	.stub {
		--accent: #ffd66e;
		appearance: none;
		position: relative;
		display: grid;
		grid-template-columns: 2.4rem 1fr;
		align-items: stretch;
		min-height: 11rem;
		padding: 0;
		font: inherit;
		text-align: left;
		cursor: pointer;
		overflow: hidden;
		color: #f4ecdd;
		border: 1px solid oklch(from var(--accent) l c h / 0.35);
		border-radius: 10px;
		background:
			linear-gradient(
				135deg,
				oklch(from var(--accent) l c h / 0.09),
				oklch(from var(--accent) l c h / 0.02) 60%
			),
			#120f18;
		opacity: 0.9;
		transition:
			translate 220ms cubic-bezier(0.25, 1, 0.5, 1),
			scale 220ms cubic-bezier(0.25, 1, 0.5, 1),
			opacity 250ms ease,
			border-color 250ms ease;
	}
	.stub.director {
		--accent: #00d6ff;
	}
	.stub:hover {
		transition-duration: 0s;
		translate: 0 -3px;
		border-color: oklch(from var(--accent) l c h / 0.6);
		opacity: 1;
	}
	.stub:active {
		transition-duration: 0s;
		translate: 0 1px;
		scale: 0.99;
	}
	.stub:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 3px;
	}
	.stub.selected {
		opacity: 1;
		scale: 1.02;
		border-color: oklch(from var(--accent) l c h / 0.75);
		/* Punch the ticket: a real hole through the stub, on the perforation. */
		mask-image: radial-gradient(circle 7px at 2.4rem 22%, transparent 99%, #000 100%);
	}

	/* Perforated stub edge with ADMIT ONE running up it. */
	.edge {
		display: grid;
		place-items: center;
		border-right: 1px dashed oklch(from var(--accent) l c h / 0.45);
		background: oklch(from var(--accent) l c h / 0.06);

		span {
			writing-mode: vertical-rl;
			rotate: 180deg;
			font-family: var(--font-mono);
			font-size: 0.58rem;
			letter-spacing: 0.3em;
			text-transform: uppercase;
			color: var(--accent);
			opacity: 0.8;
		}
	}

	.body {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.3rem;
		padding: clamp(1rem, 2.5vw, 1.5rem);
	}
	.name {
		font-size: clamp(1.15rem, 2.6vw, 1.6rem);
		font-weight: 900;
		letter-spacing: -0.02em;
		text-transform: uppercase;
		line-height: 1.05;
	}
	.runtime {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--accent);
	}
	.desc {
		margin-top: 0.35rem;
		font-size: 0.9rem;
		line-height: 1.45;
		opacity: 0.7;
		max-width: 22rem;
	}
	.barcode {
		margin-top: auto;
		padding-top: 1rem;
		width: min(11rem, 70%);
		/* border-box sizing is global, so the height has to carry the top gap. */
		height: calc(1rem + 26px);
		background: repeating-linear-gradient(
			90deg,
			rgba(244, 236, 221, 0.55) 0 2px,
			transparent 2px 4px,
			rgba(244, 236, 221, 0.55) 4px 5px,
			transparent 5px 9px,
			rgba(244, 236, 221, 0.55) 9px 12px,
			transparent 12px 14px
		);
		background-clip: content-box;
		opacity: 0.45;
	}

	/* Bottom-right, over the barcode — where a real usher's stamp lands, and the
	   one corner of the stub with no text for it to collide with. */
	.stamp {
		position: absolute;
		bottom: 1.15rem;
		right: 1rem;
		rotate: -8deg;
		padding: 0.25rem 0.7rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--accent);
		border: 1px solid var(--accent);
		border-radius: 3px;
		animation: stamp-down 260ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes stamp-down {
		from {
			opacity: 0;
			rotate: -22deg;
			scale: 1.5;
		}
	}

	@media (max-width: 720px) {
		.stubs {
			grid-template-columns: 1fr;
		}
		.stub {
			min-height: 9rem;
		}
		.billing {
			scale: 0.82 1;

			b {
				font-size: 0.72rem;
			}
			small {
				font-size: 0.5rem;
			}
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.stamp {
			animation: none;
		}
		/* Movement collapses away; the base rule's opacity and border-color
		   transitions still carry every state change. */
		.stub:hover,
		.stub:active,
		.stub.selected {
			transition-duration: 0s;
			translate: none;
			scale: none;
		}
	}
</style>
