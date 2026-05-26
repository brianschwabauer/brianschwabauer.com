<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';
	import { media } from '../media';

	let { signedIn = false }: { signedIn?: boolean } = $props();

	const earlyFilms = [
		{
			slug: '2006-08-10_quanesha',
			title: 'Quanesha',
			date: '2006-08-10',
			private: true,
			blurb: 'No script. No actors. Just two kids and a pile of stuffed animals.',
		},
		{
			slug: '2006-08-30_bobby_mcqueen',
			title: 'Bobby McQueen',
			date: '2006-08-30',
			private: true,
			blurb:
				'A third friend joins. The plot? Mostly Turbana, a guy in a comically large turban.',
		},
		{
			slug: '2006-10-21_the_fight_scene',
			title: 'The Fight Scene',
			date: '2006-10-21',
			private: true,
			blurb:
				'We tried to act in slow motion so we could "speed it up" later. It does not work.',
		},
		{
			slug: '2006-12-22_super_swatter_3001',
			title: 'Super Swatter 3001',
			date: '2006-12-22',
			private: true,
			blurb:
				'A class assignment "invention" — a 3-headed fly swatter — sold via fake infomercial.',
		},
		{
			slug: '2007-01-05_noggin_saver',
			title: 'Noggin Saver',
			date: '2007-01-05',
			private: true,
			blurb: "Kevin's invention: a device that stops chairs from tipping over.",
		},
		{
			slug: '2007-09-09_ninja_men',
			title: 'Ninja Men',
			date: '2007-09-09',
			private: true,
			blurb:
				'A year later. Pre-cut apple + toothpick = a karate-chop split that holds up.',
		},
		{
			slug: '2007-09-06_spatula_story',
			title: 'Spatula Story',
			date: '2007-09-06',
			private: true,
			blurb: "A quest. For a spatula. Don't ask.",
		},
		{
			slug: '2008-02-23_rush_for_an_idea',
			title: 'Rush for an Idea',
			date: '2008-02-23',
			private: true,
			blurb:
				'Our first film with a real script. Greenscreen, a soundtrack, multiple takes.',
		},
		{
			slug: '2008-02-29_02.29.08',
			title: '02.29.08',
			date: '2008-02-29',
			private: true,
			blurb:
				'Newspaper contest: a 29-second short for leap day. Got 2nd place — and taught us quick cuts.',
		},
	];
</script>

<SectionShell id="humble-beginnings" year="2006" label="Humble Beginnings" theme="tape">
	<div class="grain"></div>
	<div class="scanlines" aria-hidden="true"></div>

	<div class="container">
		<Reveal>
			<YearMark year="2006" subtitle="The miniDV era" color="#ff9c4a" />
		</Reveal>

		<Reveal variant="up">
			<h2 class="title">
				<span class="rec" aria-hidden="true">
					<span class="rec-dot"></span>
					REC
					<span class="tc">00:00:01:14</span>
				</span>
				A bedroom, two kids,
				<br />
				and a tape that had to rewind.
			</h2>
		</Reveal>

		<div class="lede-grid">
			<Reveal variant="up" delay={100}>
				<p class="lede">
					My best friend Kevin and I were equipped with our family's miniDV cameras — the
					kind where you literally had to play the tape back into the computer in real
					time to digitize it. We had no filmmaking skills. We had no lights, no mics, no
					idea what a "script" was. But we had time, and that was the only thing the work
					required.
				</p>
				<p class="lede">
					We called ourselves <strong>Hunky Spunky Productions</strong>
					. We were eleven.
				</p>
			</Reveal>

			<Reveal variant="right" delay={200}>
				<figure class="annotated">
					<LazyMedia
						src="2007-06-16_power_rangers_360-premiere-power_rangers_group_photo_1.jpg"
						alt="Brian and Kevin with the early crew"
						ratio="4 / 3" />
					<svg class="arrows" viewBox="0 0 400 300" aria-hidden="true">
						<defs>
							<marker
								id="arrowhead"
								markerWidth="10"
								markerHeight="10"
								refX="6"
								refY="3"
								orient="auto">
								<polygon points="0 0, 6 3, 0 6" fill="#ff9c4a" />
							</marker>
						</defs>
						<path
							d="M 60,40 Q 130,80 180,160"
							fill="none"
							stroke="#ff9c4a"
							stroke-width="2.5"
							marker-end="url(#arrowhead)" />
						<text
							x="20"
							y="34"
							fill="#ff9c4a"
							font-family="ui-monospace, monospace"
							font-size="14"
							font-weight="700">
							ME
						</text>
						<path
							d="M 360,50 Q 300,100 260,170"
							fill="none"
							stroke="#00e0ff"
							stroke-width="2.5"
							marker-end="url(#arrowhead)" />
						<text
							x="328"
							y="44"
							fill="#00e0ff"
							font-family="ui-monospace, monospace"
							font-size="14"
							font-weight="700">
							KEVIN
						</text>
					</svg>
				</figure>
			</Reveal>
		</div>

		<Reveal variant="up" delay={150}>
			<div class="problem">
				<div class="problem-eyebrow">PROBLEM</div>
				<p>
					Setting up a tripod was hard. We <em>thought</em>
					we could film handheld — we couldn't. That meant one of us was always behind the camera.
					With only two of us, how do you make a film with only one character?
				</p>
				<div class="problem-eyebrow">ANSWER</div>
				<p>Film your stuffed animals.</p>
			</div>
		</Reveal>

		<div class="fight-block">
			<Reveal variant="up">
				<h3 class="subtle">
					<span class="caret">▌</span>
					The "slowmo" fight scene
				</h3>
				<p>
					Our first big special-effects idea: act a fight in slow motion, then speed it up
					in editing so we wouldn't actually hurt each other. It turns out humans cannot
					act believably in slow motion. The footage is ridiculous. We kept it anyway.
				</p>
			</Reveal>
			<div class="fight-pair">
				<Reveal variant="left" delay={100}>
					<LazyMedia
						src="2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo.avif"
						alt="Brian and Kevin fight in slow motion"
						ratio="16 / 9" />
				</Reveal>
				<Reveal variant="right" delay={200}>
					<LazyMedia
						src="2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo_2.avif"
						alt="Round two, still in slowmo"
						ratio="16 / 9" />
				</Reveal>
			</div>
		</div>

		<Reveal variant="up">
			<div class="karate">
				<div class="karate-text">
					<h3 class="subtle">
						<span class="caret">▌</span>
						Pre-school special effects
					</h3>
					<p>
						A year after The Fight Scene we made <strong>Ninja Men</strong>
						. We pre-cut an apple, jammed a toothpick into it to hold it together, and let a
						karate chop "split" it cleanly. Seventh-grade ingenuity I'm still a little proud
						of.
					</p>
				</div>
				<LazyMedia
					src="2007-09-09_ninja_men-grant_splits_apple_with_karate_chop_special_effect.avif"
					alt="The karate-chop apple split"
					ratio="16 / 9"
					class="karate-media" />
			</div>
		</Reveal>

		<Reveal>
			<div class="quick-cuts">
				<div class="qc-meta">
					<div class="qc-title">02.29.08</div>
					<div class="qc-sub">Leap-day shorts contest · 29 seconds</div>
					<p>
						The local paper ran a 29-second short film contest for leap day. The
						constraint forced us to learn quick cuts for the first time. We placed 2nd.
						The technique stuck with us forever.
					</p>
				</div>
				<LazyMedia
					src="2008-02-25_02.29.08-editing_with_quick_shots.avif"
					alt="Editing with quick cuts on 02.29.08"
					ratio="16 / 9" />
			</div>
		</Reveal>

		<Reveal variant="up">
			<h3 class="vault-heading">
				<span class="vault-line"></span>
				The vault — every short, in order
			</h3>
			<p class="vault-sub">
				These are bad. Some of them are wonderful-bad. They are <em>
					where every other section of this page came from.
				</em>
			</p>
		</Reveal>

		<ul class="films">
			{#each earlyFilms as film, i}
				<Reveal variant="up" delay={50 + (i % 3) * 80}>
					<li class="film">
						<div class="film-head">
							<span class="film-index">№ {String(i + 1).padStart(2, '0')}</span>
							<span class="film-date">{film.date}</span>
							{#if film.private}<span class="film-tag">private</span>{/if}
						</div>
						<h4 class="film-title">{film.title}</h4>
						<p class="film-blurb">{film.blurb}</p>
						{#if signedIn}
							<div class="film-video">
								<VideoPlayer slug={film.slug} title={film.title} />
							</div>
						{/if}
					</li>
				</Reveal>
			{/each}
		</ul>

		<Reveal variant="up">
			<Expandable label="The longer story — how the process worked">
				<div class="prose">
					<p>
						Every weekend looked the same. I'd ride over to Kevin's house. We'd come up
						with whatever crazy thing we could that day. We'd film it. We'd edit it. All
						within a day, sometimes two. Then we'd repeat that loop, over and over.
					</p>
					<p>
						We upgraded our camera to one that recorded to a hard drive. We got a computer
						with actual editing software (we'd been editing <em>
							directly on the camera
						</em>
						before). We still didn't have lights or mics. But we started learning how to piece
						together multiple shots in a row to build a real narrative.
					</p>
					<p>
						With our new software, we could finally start doing "special effects". The
						first one was speed manipulation. The second was greenscreen, which is its own
						section below. Each project added a new tool to the toolbag. Each tool
						combined with the others to unlock the next one. That stacking is the entire
						story of this page, really.
					</p>
					<p>
						Around this time I noticed I had a real knack for the technical side. Kevin
						was the better actor, so he started to act more. I started to film more. That
						split has basically held to this day.
					</p>
				</div>
			</Expandable>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='tape']) {
		--tape-bg: #1a120a;
		--tape-ink: #f5e6cf;
		--tape-accent: #ff9c4a;
		--tape-accent-2: #00e0ff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		color: var(--tape-ink, #f5e6cf);
	}
	:global([data-theme='tape']) {
		background: linear-gradient(180deg, #06060a, #160e07 30%, #1a120a 70%, #0a0709);
		color: var(--tape-ink);
	}
	.grain {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0'/></filter><rect width='160' height='160' filter='url(%23n)' opacity='0.55'/></svg>");
		opacity: 0.35;
		mix-blend-mode: overlay;
		pointer-events: none;
		animation: grainmove 1.4s steps(4) infinite;
	}
	@keyframes grainmove {
		0% {
			transform: translate(0, 0);
		}
		25% {
			transform: translate(-10px, 5px);
		}
		50% {
			transform: translate(8px, -6px);
		}
		75% {
			transform: translate(-4px, 8px);
		}
	}
	.scanlines {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			0deg,
			rgba(255, 255, 255, 0.04) 0 1px,
			transparent 1px 4px
		);
		mix-blend-mode: overlay;
		pointer-events: none;
		opacity: 0.5;
	}

	.title {
		font-size: clamp(2.2rem, 6vw, 4.5rem);
		font-weight: 800;
		line-height: 1.04;
		letter-spacing: -0.02em;
		max-width: 50rem;
		margin: 0 0 2rem;
	}
	.rec {
		display: flex;
		width: fit-content;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--tape-accent);
		background: rgba(255, 156, 74, 0.1);
		border: 1px solid rgba(255, 156, 74, 0.35);
		padding: 0.25rem 0.7rem;
		border-radius: 4px;
		margin-bottom: 0.9rem;
		letter-spacing: 0.18em;
	}
	.rec-dot {
		display: inline-block;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #ff3535;
		box-shadow: 0 0 12px #ff3535;
		animation: blink 1.4s infinite;
	}
	@keyframes blink {
		0%,
		60% {
			opacity: 1;
		}
		70%,
		100% {
			opacity: 0.25;
		}
	}
	.tc {
		opacity: 0.7;
		margin-left: 0.4rem;
	}

	.lede-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: start;
		margin: 2rem 0;
	}
	@media (max-width: 768px) {
		.lede-grid {
			grid-template-columns: 1fr;
		}
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.6;
		max-width: 36rem;
	}
	.lede strong {
		color: var(--tape-accent);
	}

	.annotated {
		position: relative;
		margin: 0;
	}
	.arrows {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	.problem {
		max-width: 50rem;
		background: rgba(255, 156, 74, 0.06);
		border-left: 3px solid var(--tape-accent);
		padding: 1.25rem 1.5rem;
		margin: 2.5rem 0;
		border-radius: 0 8px 8px 0;
	}
	.problem-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.32em;
		color: var(--tape-accent);
		margin-bottom: 0.4rem;
	}
	.problem p {
		margin: 0 0 1rem;
		line-height: 1.55;
	}
	.problem p:last-child {
		margin: 0;
	}

	.fight-block {
		margin: 4rem 0;
	}
	.subtle {
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		font-weight: 700;
		margin-bottom: 0.6rem;
	}
	.caret {
		color: var(--tape-accent);
		margin-right: 0.4rem;
	}
	.fight-pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
		margin-top: 1.4rem;
	}
	@media (max-width: 640px) {
		.fight-pair {
			grid-template-columns: 1fr;
		}
	}

	.karate {
		display: grid;
		grid-template-columns: 1fr 1.3fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 4rem 0;
	}
	@media (max-width: 768px) {
		.karate {
			grid-template-columns: 1fr;
		}
	}
	.karate-text p {
		line-height: 1.6;
	}

	.quick-cuts {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		background: linear-gradient(135deg, rgba(255, 156, 74, 0.08), transparent);
		border: 1px solid rgba(255, 156, 74, 0.15);
		border-radius: 12px;
		padding: 2rem;
		margin: 4rem 0;
	}
	@media (max-width: 768px) {
		.quick-cuts {
			grid-template-columns: 1fr;
		}
	}
	.qc-title {
		font-family: var(--font-mono);
		font-size: 2.2rem;
		font-weight: 800;
		color: var(--tape-accent);
		letter-spacing: 0.02em;
	}
	.qc-sub {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		opacity: 0.75;
		margin-bottom: 0.8rem;
	}

	.vault-heading {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: clamp(1.4rem, 2.4vw, 2rem);
		margin: 4rem 0 0.5rem;
	}
	.vault-line {
		display: block;
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, var(--tape-accent), transparent);
	}
	.vault-sub {
		opacity: 0.75;
		max-width: 40rem;
		margin: 0 0 2rem;
	}

	.films {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 1.25rem;
	}
	.film {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.07);
		border-radius: 10px;
		padding: 1.2rem 1.3rem;
		transition:
			transform 220ms ease,
			border-color 220ms ease,
			background 220ms ease;
	}
	.film:hover {
		transition-duration: 0s;
		transform: translateY(-3px);
		border-color: rgba(255, 156, 74, 0.45);
		background: rgba(255, 156, 74, 0.06);
	}
	.film-head {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		color: rgba(245, 230, 207, 0.6);
		margin-bottom: 0.6rem;
	}
	.film-index {
		color: var(--tape-accent);
		font-weight: 700;
	}
	.film-tag {
		margin-left: auto;
		padding: 0.05rem 0.5rem;
		border: 1px solid rgba(245, 230, 207, 0.3);
		border-radius: 999px;
		font-size: 0.55rem;
	}
	.film-title {
		font-size: 1.2rem;
		font-weight: 700;
		margin: 0 0 0.4rem;
	}
	.film-blurb {
		font-size: 0.95rem;
		line-height: 1.5;
		opacity: 0.82;
		margin: 0;
	}
	.film-video {
		margin-top: 1rem;
	}

	.prose p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.prose em {
		color: var(--tape-accent);
		font-style: italic;
	}
</style>
