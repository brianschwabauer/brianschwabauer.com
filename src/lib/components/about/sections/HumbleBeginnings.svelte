<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import ViewfinderFrame from '../primitives/ViewfinderFrame.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	let gallery = $state<ReturnType<typeof LightboxGallery>>();

	// Every clickable piece of media in this section, in document order. The lightbox cycles through them all.
	const sectionMedia: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/1998-05-01_brian_and_kevin_at_preschool_graduation.jpg',
			width: 677,
			height: 958,
			caption: 'Brian and Kevin at preschool graduation',
			alt: 'Brian and Kevin at preschool graduation',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2006-08-10_quanesha-brian_puppets_stuffed_animal.avif',
			width: 320,
			height: 240,
			caption: 'Quanesha — the leading actor, and the hand working him',
			alt: 'A stuffed bear in a Santa hat propped up on a desk and puppeted by a hand',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo.avif',
			width: 352,
			height: 240,
			caption: 'The "slowmo" fight scene — take one',
			alt: 'Brian and Kevin fight in slow motion',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo_2.avif',
			width: 352,
			height: 240,
			caption: 'The "slowmo" fight scene — round two',
			alt: 'Round two, still in slowmo',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-09-09_ninja_men-grant_splits_apple_with_karate_chop_special_effect.avif',
			width: 352,
			height: 240,
			caption: 'Ninja Men — the karate-chop apple split',
			alt: 'The karate-chop apple split',
		},
	];

	// The REC readout above the heading is a real deck: it starts rolling when
	// the page hydrates and counts how long you've been here, in tape timecode.
	// It only ticks while the section is on screen — off screen there is nobody
	// reading it, so there is no reason to burn a frame loop on it.
	const START = Date.now();
	let elapsed_ms = $state(0);
	let rec_el = $state<HTMLElement>();

	function pad(n: number) {
		return String(Math.floor(n)).padStart(2, '0');
	}
	const timecode = $derived.by(() => {
		const s = elapsed_ms / 1000;
		return `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad((s * 30) % 30)}`;
	});

	$effect(() => {
		const el = rec_el;
		if (!el) return;
		// Frames tick 30 times a second, which is exactly the kind of motion
		// reduced-motion readers asked us not to make — drop to whole seconds and
		// let the frame field sit at :00 for them.
		const reduced = matchMedia('(prefers-reduced-motion: reduce)');
		let frame = 0;
		// The displayed string only changes 30 times a second (once a second
		// under reduced motion), so a 60Hz rAF lands on the same timecode every
		// other frame — skip the state write (and the DOM update behind it)
		// unless the tape frame count has actually moved on.
		let last_tape_frame = -1;
		function tick() {
			frame = requestAnimationFrame(tick);
			const ms = Date.now() - START;
			const tape_frame = reduced.matches
				? Math.floor(ms / 1000)
				: Math.floor((ms * 30) / 1000);
			if (tape_frame === last_tape_frame) return;
			last_tape_frame = tape_frame;
			elapsed_ms = reduced.matches ? tape_frame * 1000 : ms;
		}
		const io = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				if (!frame) frame = requestAnimationFrame(tick);
			} else {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		});
		io.observe(el);
		return () => {
			io.disconnect();
			cancelAnimationFrame(frame);
		};
	});
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
				<span bind:this={rec_el} class="rec" aria-hidden="true">
					<span class="rec-dot"></span>
					REC
					<span class="tc">{timecode}</span>
				</span>
				A bedroom, two kids,
				<br />
				and a tape that had to rewind.
			</h2>
		</Reveal>

		<div class="lede-grid">
			<Reveal variant="up" delay={100}>
				<p class="lede">
					My best friend Kevin and I had our families' miniDV cameras — the kind where you
					literally had to play the tape back into the computer in real time to digitize
					it. We had no filmmaking skills. We had no lights, no mics, no idea what a
					"script" was. But we had time, and that was the only thing the work required.
				</p>
				<p class="lede">
					We called ourselves <strong>Hunky Spunky Productions.</strong>
					We were eleven.
				</p>
			</Reveal>

			<Reveal variant="right" delay={200}>
				<figure class="annotated">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/1998-05-01_brian_and_kevin_at_preschool_graduation.jpg"
						alt="Brian and Kevin at preschool graduation"
						ratio="4 / 3"
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
					<svg class="arrows" viewBox="0 0 400 300" aria-hidden="true">
						<defs>
							<marker
								id="arrowhead"
								markerWidth="10"
								markerHeight="10"
								refX="3"
								refY="3"
								orient="auto">
								<polygon points="0 0, 6 3, 0 6" fill="#00d6ff" />
							</marker>
						</defs>
						<path
							d="M 25,40 Q 30,80 120,120"
							fill="none"
							stroke="#00d6ff"
							stroke-width="3.5"
							marker-end="url(#arrowhead)" />
						<text
							x="20"
							y="34"
							fill="#00d6ff"
							font-family="ui-monospace, monospace"
							font-size="20"
							font-weight="700">
							ME
						</text>
						<path
							d="M 380,50 Q 350,140 260,120"
							fill="none"
							stroke="#00d6ff"
							stroke-width="3.5"
							marker-end="url(#arrowhead)" />
						<text
							x="328"
							y="44"
							fill="#00d6ff"
							font-family="ui-monospace, monospace"
							font-size="20"
							font-weight="700">
							KEVIN
						</text>
					</svg>
				</figure>
			</Reveal>
		</div>

		<div class="problem-grid">
			<Reveal variant="up" delay={150}>
				<div class="problem">
					<div class="problem-eyebrow">PROBLEM</div>
					<p>
						Setting up a tripod was hard. We <em>thought</em>
						we could film handheld — we couldn't. That meant one of us was always behind the
						camera. With only two of us, how do you make a film with only one character?
					</p>
					<div class="problem-eyebrow">ANSWER</div>
					<p>Film your stuffed animals.</p>
				</div>
			</Reveal>

			<Reveal variant="right" delay={250}>
				<figure class="answer">
					<ViewfinderFrame timecode="00:02:47:03">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2006-08-10_quanesha-brian_puppets_stuffed_animal.avif"
							alt="A stuffed bear in a Santa hat propped up on a desk and puppeted by a hand"
							ratio="16 / 9"
							onclick={(e) => gallery?.open(1, e.currentTarget)} />
					</ViewfinderFrame>
					<figcaption>
						<strong>Quanesha</strong>
						· 08.10.2006 — our first film. stuffed animal characters.
					</figcaption>
				</figure>
			</Reveal>
		</div>

		<div class="fight-block">
			<Reveal variant="up">
				<div class="fight-copy">
					<h3 class="subtle">
						<span class="caret">▌</span>
						The "slowmo" fight scene
					</h3>
					<p>
						Our first big special-effects idea: act a fight in slow motion, then speed it
						up in editing so we wouldn't actually hurt each other. It turns out humans
						cannot act believably in slow motion. The footage is ridiculous. We kept it
						anyway.
					</p>
				</div>
			</Reveal>
			<div class="fight-pair">
				<Reveal variant="left" delay={100}>
					<ViewfinderFrame timecode="00:04:12:08">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo.avif"
							alt="Brian and Kevin fight in slow motion"
							ratio="16 / 9"
							onclick={(e) => gallery?.open(2, e.currentTarget)} />
					</ViewfinderFrame>
				</Reveal>
				<Reveal variant="right" delay={200}>
					<ViewfinderFrame timecode="00:07:33:19">
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2006-10-21_the_fight_scene-brian_and_kevin_fight_in_slowmo_2.avif"
							alt="Round two, still in slowmo"
							ratio="16 / 9"
							onclick={(e) => gallery?.open(3, e.currentTarget)} />
					</ViewfinderFrame>
				</Reveal>
			</div>
		</div>

		<Reveal variant="up">
			<div class="karate">
				<div class="karate-text">
					<h3 class="subtle">
						<span class="caret">▌</span>
						Duct-tape special effects
					</h3>
					<p>
						A year after The Fight Scene we made <strong>Ninja Men.</strong>
						We pre-cut an apple, jammed a toothpick into it to hold it together, and let a karate
						chop "split" it cleanly. Seventh-grade ingenuity I'm still a little proud of.
					</p>
				</div>
				<LazyMedia
					src="https://cdn.brianschwabauer.com/media/2007-09-09_ninja_men-grant_splits_apple_with_karate_chop_special_effect.avif"
					alt="The karate-chop apple split"
					ratio="16 / 9"
					class="karate-media"
					onclick={(e) => gallery?.open(4, e.currentTarget)} />
			</div>
		</Reveal>

		<Reveal variant="up">
			<div class="closing">
				<p>
					Every weekend looked the same. I'd walk (through neighbors' yards) to Kevin's
					house. We'd come up with whatever crazy thing we could that day. We'd film it.
					We'd edit it. All within a day, sometimes two. Then we'd repeat that loop, over
					and over.
				</p>
				<p>
					We upgraded our camera to one that recorded to a hard drive. We got a computer
					with actual editing software (we'd been editing <em>directly on the camera</em>
					before). We still didn't have lights or mics. But we started learning how to piece
					together multiple shots in a row to build a real narrative.
				</p>
				<p>
					With our new software, we could finally start doing "special effects". The first
					one was speed manipulation. The second was greenscreen. Each project added a new
					tool to the toolbag. Each tool combined with the others to unlock the next one.
				</p>
			</div>
		</Reveal>
	</div>

	<LightboxGallery bind:this={gallery} key="humble-beginnings" items={sectionMedia} />
</SectionShell>

<style>
	:global([data-theme='tape']) {
		--tape-bg: #1a120a;
		--tape-ink: #f5e6cf;
		--tape-accent: #ff9c4a;
		--tape-accent-2: #00d6ff;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		color: var(--tape-ink, #f5e6cf);
	}
	/* Warmed up out of near-black — the colour of tungsten light on a camcorder
	   tape rather than the black the tape starts on. */
	:global([data-theme='tape']) {
		background:
			radial-gradient(
				ellipse 115% 65% at 50% 0%,
				oklch(0.46 0.095 62 / 0.4),
				transparent 62%
			),
			linear-gradient(
				180deg,
				oklch(0.22 0.042 58),
				oklch(0.29 0.068 56) 45%,
				oklch(0.19 0.04 48)
			);
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
		font-size: clamp(2.4rem, 7vw, 5rem);
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
	/* It counts, so the digits have to hold still — proportional numerals would
	   make the whole REC chip twitch 30 times a second. */
	.tc {
		opacity: 0.7;
		margin-left: 0.4rem;
		font-variant-numeric: tabular-nums;
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
		:global(img) {
			object-position: 50% 36%;
		}
	}
	.arrows {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* The answer to "how do you film with one actor" should be sitting right
	   there next to the question, not a scroll away. */
	.problem-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 2.5rem 0;
	}
	@media (max-width: 768px) {
		.problem-grid {
			grid-template-columns: 1fr;
		}
	}
	/* The pull-quote as a strip of masking tape stuck on the camcorder era:
	   light tape stock, marker mono, slapped on at a slight angle. */
	.problem {
		background: linear-gradient(100deg, #ead9b8, #f2e5c6 45%, #e6d5b2);
		color: #2a1a08;
		font-family: var(--font-mono);
		padding: 1.25rem 1.5rem;
		rotate: -0.6deg;
		border-radius: 2px;
		box-shadow: 0 3px 10px rgba(0, 0, 0, 0.35);
	}
	.answer {
		margin: 0;
		figcaption {
			font-family: var(--font-mono);
			font-size: 0.78rem;
			line-height: 1.5;
			letter-spacing: 0.04em;
			opacity: 0.72;
			margin-top: 0.75rem;
		}
		strong {
			color: var(--tape-accent);
			letter-spacing: 0.1em;
			text-transform: uppercase;
		}
	}
	.problem-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.32em;
		/* Marker ink dark enough to read on the tape stock. */
		color: oklch(from var(--tape-accent) 0.45 c h);
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
	/* The two frames want the full width; the copy above them does not — a
	   paragraph running the whole 80rem container is a paragraph nobody
	   finishes. Hold it to a reading measure and let it hang left of the pair. */
	.fight-copy {
		max-width: 38rem;
		p {
			line-height: 1.65;
		}
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

	/* Closes the section the way the lede opened it — same type, same colour,
	   just centred in the container instead of hanging off the left edge. */
	.closing {
		max-width: 44rem;
		margin-inline: auto;
	}
	.closing p {
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.closing em {
		color: var(--tape-accent);
		font-style: italic;
	}
</style>
