<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import DeletedScenes from '../primitives/DeletedScenes.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';
	import { onScrollProgress } from '../primitives/scrollProgress';

	let pacTunnel = $state<HTMLElement | null>(null);
	let pacProgress = $state(0);
	let pelletTargets = $state([0.2, 0.31, 0.42, 0.54, 0.66, 0.77]);

	$effect(() => {
		if (!pacTunnel) return;
		const recomputePelletTargets = () => {
			const vw = window.innerWidth || 1;
			const pacSize = Math.max(220, Math.min(400, vw * 0.3));
			const startCenter = -pacSize / 2 - 20;
			const travel = vw + pacSize + 80;
			const padding = vw * 0.08;
			const spacing = (vw - 2 * padding) / 5;
			pelletTargets = [0, 1, 2, 3, 4, 5].map(
				(i) => (padding + i * spacing - startCenter) / travel,
			);
		};
		recomputePelletTargets();
		window.addEventListener('resize', recomputePelletTargets);
		const unsubscribe = onScrollProgress(pacTunnel, (rect) => {
			const vh = window.innerHeight || 1;
			const range = vh + pacTunnel!.offsetHeight;
			const p = range > 0 ? (vh - rect.top) / range : 0;
			pacProgress = Math.max(0, Math.min(1, p));
		});
		return () => {
			window.removeEventListener('resize', recomputePelletTargets);
			unsubscribe();
		};
	});

	const aeTests: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-03-09_clone_brian_test.avif',
			width: 352,
			height: 240,
			caption: 'Clone effect — twin Brians',
			alt: 'Clone effect — twin Brians',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-03-20_star_wars_test.avif',
			width: 480,
			height: 384,
			caption: 'Lightsaber, the obligatory VFX rite',
			alt: 'Lightsaber, the obligatory VFX rite',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-06-20_amanda_hit_by_car_test.avif',
			width: 352,
			height: 240,
			caption: 'Hit-by-car test',
			alt: 'Hit-by-car test',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-hit_by_car.avif',
			width: 480,
			height: 320,
			caption: 'Hit-by-car test, in a real film a year later',
			alt: 'Hit-by-car test, in a real film a year later',
			favorite: true,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-kevin_dances_in_front_of_green_screen_weather_report.avif',
			width: 352,
			height: 240,
			caption: 'Kevin as weatherman #1',
			alt: 'Kevin as weatherman #1',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-kevin_appears_using_green_screen_blanket_visual_effect.avif',
			width: 352,
			height: 240,
			caption: 'Greenscreen blanket → vanishing trick',
			alt: 'Greenscreen blanket → vanishing trick',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-06-22_awc_logo_animation.avif',
			width: 480,
			height: 384,
			caption: 'AWC studio logo test',
			alt: 'AWC studio logo test',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-06-22_take_one_films_logo_animation.avif',
			width: 480,
			height: 384,
			caption: 'Take One Films logo',
			alt: 'Take One Films logo',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-07-13_hunky_spunky_productions_logo_animation_2.avif',
			width: 480,
			height: 320,
			caption: 'Hunky Spunky Productions logo',
			alt: 'Hunky Spunky Productions logo',
		},
	];

	// The Nuisance-B-Gone stills are the rotoscope entry in the same run of
	// tests, so they live at the end of the VFX set rather than in a gallery of
	// their own — captions name the film, since the surrounding tiles don't.
	const vfxImages: GalleryItem[] = [
		...aeTests,
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone-product_makes_chair_disappear_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Cleanplate rotoscope — chair, gone',
			alt: 'Cleanplate rotoscope — chair, gone',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone-product_makes_shoe_disappear_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Cleanplate rotoscope — shoe, gone',
			alt: 'Cleanplate rotoscope — shoe, gone',
		},
	];

	// All standalone images + inline videos in document order. The headless Gallery
	// at the bottom of the section drives the lightbox for these.
	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen_2.avif',
			width: 352,
			height: 240,
			caption: 'Floating anchor — turns out you need a tripod',
			alt: 'Brian floating in front of XYZ News greenscreen',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_eats_kevin_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Pac-Attack — Pacman eats Kevin',
			alt: 'Pacman eats Kevin',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_on_green_background_using_powerpoint_for_visual_effect.avif',
			width: 352,
			height: 240,
			caption: 'Step 1 — animated in PowerPoint on a green slide',
			alt: 'Pacman on greenscreen — PowerPoint export',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_coming_out_of_tv.avif',
			width: 480,
			height: 320,
			caption: 'Step 2 — keyed onto real footage',
			alt: 'Pacman keyed onto real footage',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-flash_game_screen_recording-pacman_eats_brians_floating_faces.avif',
			width: 824,
			height: 600,
			caption: 'Step 3 — the companion Flash game',
			alt: 'The companion Flash game',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Pac-Attack (2008) — full short',
			alt: 'Pac-Attack (2008) — full short',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Nuisance-B-Gone — the fake infomercial',
			alt: 'Nuisance-B-Gone — the fake infomercial',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2009-02-13_sideline_huddler/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2009-02-13_sideline_huddler/poster.jpg',
			width: 720,
			height: 480,
			caption: "Sideline Huddler — Amanda's invention commercial",
			alt: "Sideline Huddler — Amanda's invention commercial",
		},
	];

	let gallery = $state<ReturnType<typeof LightboxGallery>>();
</script>

<SectionShell id="green-screen" year="2007" label="Green Screen" theme="green">
	<div class="bg-grid" aria-hidden="true"></div>
	<!--
	  Spill. A green screen lights the whole room green whether you want it to or
	  not — it comes off the cloth, wraps the edges of everything in front of it,
	  and turns up in your footage as a rim you spend the evening trying to
	  remove. Here it leans in from both sides, breathing slightly, because a
	  bedsheet on a wall never hung still either.
	-->
	<div class="spill" aria-hidden="true"></div>
	<div class="container">
		<Reveal>
			<YearMark year="2007" subtitle="Early Technical Tests" color="#22ff90" />
		</Reveal>

		<div class="grid-2">
			<Reveal>
				<h2 class="green-title">
					Bedroom wall
					<br />
					<span class="key">painted neon green.</span>
				</h2>
				<p class="lede">
					After painting a green screen on a bedroom wall, suddenly the possibilities felt
					infinite. We didn't know how to use a chroma key. We didn't know what "chroma
					key" was. We knew our editing software had a button labeled "green screen". That
					was enough.
				</p>
				<p class="lede">
					So we wrote up a fake news broadcast. <strong>XYZ News</strong>
					was born — Brian as the anchor, Kevin as every other character. The lesson we learned
					that day is etched permanently into my brain:
					<em>use a tripod when you use a green screen, or your anchor will float.</em>
				</p>
			</Reveal>

			<Reveal variant="right" delay={120}>
				<div class="key-card">
					<div class="key-frame" aria-hidden="true">
						<div class="key-marker tl"></div>
						<div class="key-marker tr"></div>
						<div class="key-marker bl"></div>
						<div class="key-marker br"></div>
						<div class="key-label">CHROMAKEY</div>
					</div>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen_2.avif"
						alt="Brian floating in front of XYZ News greenscreen"
						ratio="16 / 9"
						class="key-img"
						onclick={(e) => gallery?.open(0, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div
			bind:this={pacTunnel}
			class="pac-tunnel"
			style:--p={pacProgress}
			aria-hidden="true">
			<div class="pac-stage">
				<div class="pac-pellets">
					{#each pelletTargets as t, i (i)}
						<span class:eaten={pacProgress > t}></span>
					{/each}
				</div>
				<div class="pac-runner">
					<svg viewBox="0 0 100 100">
						<defs>
							<mask id="pac-mouth-mask">
								<rect x="0" y="0" width="100" height="100" fill="white" />
								<polygon
									points="50,50 100,18 100,82"
									fill="black"
									class="pac-runner-mouth" />
							</mask>
						</defs>
						<circle cx="50" cy="50" r="46" fill="#ffd934" mask="url(#pac-mouth-mask)" />
						<circle cx="62" cy="28" r="4" fill="#1a0c00" />
					</svg>
				</div>
			</div>
		</div>

		<div class="pac-block">
			<div class="pac-grid">
				<Reveal>
					<h3 class="sub neon">PAC-ATTACK</h3>
					<p>
						We figured out a trick. Our editing software couldn't animate things. But it <em>
							could
						</em>
						do greenscreen. So we built our animations in PowerPoint, on top of a bright green
						slide, exported the whole slideshow as a video, and keyed out the green. Suddenly
						we had a pacman chomping his way across real footage.
					</p>
					<p>
						We wrote a whole short film around the trick. A group of friends watching TV.
						Pacman climbs out of the screen. Carnage ensues.
					</p>
					<p>
						I also built a small Flash game to launch with the film — you played a pacman
						eating animated faces. It was the first time I wrote code and watched it
						become something on a screen.
					</p>
					<PlayFilm
						label="Watch the short"
						title="Pac-Attack (2008) — full short"
						meta="2008"
						color="#22ff90"
						onclick={(e) => gallery?.open(5, e.currentTarget)} />
				</Reveal>

				<Reveal variant="right" delay={100}>
					<div class="arcade">
						<div class="arcade-screen">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_eats_kevin_visual_effect.avif"
								alt="Pacman eats Kevin"
								ratio="4 / 3"
								onclick={(e) => gallery?.open(1, e.currentTarget)} />
						</div>
						<div class="arcade-base">
							<span class="coin">INSERT COIN</span>
							<span class="hi">
								PLAYER 1
								<span class="blink">_</span>
							</span>
						</div>
					</div>
				</Reveal>
			</div>

			<!-- How the trick actually worked, beside the film it produced — the
			     three steps only read as steps next to the Pac-Attack copy. -->
			<Reveal variant="up" delay={150}>
				<div class="pac-flow">
					<div class="pac-step">
						<span class="num">1</span>
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_on_green_background_using_powerpoint_for_visual_effect.avif"
							alt="Pacman on greenscreen — PowerPoint export"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(2, e.currentTarget)} />
						<p>Animated in PowerPoint, exported to video, on a bright green slide.</p>
					</div>
					<div class="arrow" aria-hidden="true">→</div>
					<div class="pac-step">
						<span class="num">2</span>
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-pacman_coming_out_of_tv.avif"
							alt="Pacman keyed onto real footage"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(3, e.currentTarget)} />
						<p>Key out the green in our editor. Pacman now lives in real footage.</p>
					</div>
					<div class="arrow" aria-hidden="true">→</div>
					<div class="pac-step">
						<span class="num">3</span>
						<LazyMedia
							src="https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack-flash_game_screen_recording-pacman_eats_brians_floating_faces.avif"
							alt="The companion Flash game"
							ratio="4 / 3"
							onclick={(e) => gallery?.open(4, e.currentTarget)} />
						<p>Bonus: a Flash game launched alongside the film. Eat the Brian-faces.</p>
					</div>
				</div>
			</Reveal>
		</div>

		<div class="ae-block">
			<Reveal variant="up">
				<h3 class="sub">Discovering After Effects</h3>
				<p>
					Our video editing software couldn't take us further. So I picked up Adobe After
					Effects and started running tests — every VFX artist's rite of passage. Clone
					yourself. Build a lightsaber. Get hit by a car. Animate a logo.
				</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<PeekGallery key="green-screen-vfx" items={vfxImages} size="00" />
			</Reveal>
		</div>

		<!-- The two films those tests turned into, and why we never planned. -->
		<DeletedScenes scenes={3}>
			<!-- Copy and player side by side, and the second one mirrored: two
			     identical text-then-video stacks in a row read as a template,
			     and the alternation keeps the eye moving across the page
			     instead of straight down one gutter. -->
			<div class="spot-block">
				<Reveal variant="up">
					<div class="spot-copy">
						<h3 class="sub">Nuisance-B-Gone</h3>
						<p>
							Once I learned After Effects had a "rotoscope" capability, I had to test it.
							Cut out a chair before it vanishes. Cut out a shoe. Stay locked-off on a
							tripod and let the trick do the work. We turned the test into a fake
							infomercial.
						</p>
					</div>
				</Reveal>
				<Reveal variant="right" delay={150}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone/poster.jpg"
						alt="Nuisance-B-Gone — the fake infomercial"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(6, e.currentTarget)} />
				</Reveal>
			</div>

			<div class="spot-block mirrored">
				<Reveal variant="up">
					<div class="spot-copy">
						<h3 class="sub">Sideline Huddler</h3>
						<p>
							My sister Amanda "invented" a warm blanket with a waterproof shell for
							outdoor sports — basically a Snuggie you could take outside, before Snuggies
							existed. We made her a fake commercial that put her into rain, snow, and
							fire via green screen.
						</p>
					</div>
				</Reveal>
				<Reveal variant="left" delay={100}>
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2009-02-13_sideline_huddler/poster.jpg"
						alt="Sideline Huddler — Amanda's invention commercial"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(7, e.currentTarget)} />
				</Reveal>
			</div>

			<Reveal>
				<div class="closing">
					<p>
						This was the pattern: pick an effect we'd never done, dive in with no research
						and no tutorials, and learn by failing in public.
					</p>
					<p>
						Pac-Attack was about a greenscreen trick. Nuisance-B-Gone was about cleanplate
						rotoscope. Calamity, a year later, was about stop-motion.
					</p>
				</div>
			</Reveal>
		</DeletedScenes>
	</div>

	<LightboxGallery
		bind:this={gallery}
		key="green-screen"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	:global([data-theme='green']) {
		background:
			radial-gradient(ellipse at top, rgba(34, 255, 144, 0.06), transparent 50%),
			linear-gradient(180deg, #04130a 0%, #0a1f12 50%, #04140b 100%);
		color: #d8ffe6;
	}
	.spill {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background:
			radial-gradient(
				ellipse 34% 60% at -6% 34%,
				rgba(34, 255, 144, 0.16),
				transparent 70%
			),
			radial-gradient(
				ellipse 30% 52% at 106% 66%,
				rgba(34, 255, 144, 0.13),
				transparent 70%
			);
		mix-blend-mode: screen;
		animation: spill-breathe 13s ease-in-out infinite alternate;
	}
	@keyframes spill-breathe {
		from {
			opacity: 0.75;
			scale: 1 1;
		}
		to {
			opacity: 1;
			/* Only the vertical — the cloth sags and lifts, it doesn't zoom. */
			scale: 1 1.06;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spill {
			animation: none;
		}
	}
	.bg-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(34, 255, 144, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(34, 255, 144, 0.04) 1px, transparent 1px);
		background-size: 40px 40px;
		mask-image: radial-gradient(ellipse at center, #000 30%, transparent 80%);
		pointer-events: none;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.green-title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 800;
		line-height: 1.02;
		letter-spacing: -0.02em;
		margin: 0 0 1.2rem;
	}
	.key {
		color: #22ff90;
		font-style: italic;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.6;
		max-width: 36rem;
	}
	.lede strong {
		color: #22ff90;
	}
	.lede em {
		color: #b6ffd0;
	}
	.grid-2 {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin-bottom: 4rem;
	}
	@media (max-width: 768px) {
		.grid-2 {
			grid-template-columns: 1fr;
		}
	}

	.key-card {
		position: relative;
	}
	.key-frame {
		position: absolute;
		inset: -16px;
		pointer-events: none;
		z-index: 2;
	}
	.key-marker {
		position: absolute;
		width: 22px;
		height: 22px;
		border: 2px solid #22ff90;
		box-shadow: 0 0 14px rgba(34, 255, 144, 0.6);
	}
	.key-marker.tl {
		top: 0;
		left: 0;
		border-right: 0;
		border-bottom: 0;
	}
	.key-marker.tr {
		top: 0;
		right: 0;
		border-left: 0;
		border-bottom: 0;
	}
	.key-marker.bl {
		bottom: 0;
		left: 0;
		border-right: 0;
		border-top: 0;
	}
	.key-marker.br {
		bottom: 0;
		right: 0;
		border-left: 0;
		border-top: 0;
	}
	.key-label {
		position: absolute;
		top: -28px;
		left: 0;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: #22ff90;
		letter-spacing: 0.16em;
	}
	:global(.key-img) {
		filter: saturate(1.1);
	}

	.sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin-bottom: 0.4rem;
	}
	.sub.neon {
		color: #ffd934;
		text-shadow: 0 0 30px rgba(255, 217, 52, 0.4);
		font-family: var(--font-mono);
		letter-spacing: 0.04em;
	}
	.ae-block {
		margin: 4rem 0;
		p {
			max-width: 600px;
		}
	}
	/* The gallery is the bulk of the block — it needs to sit off the copy rather
	   than butt against it. `:global` because the child is a `Reveal` root. */
	.ae-block > :global(.reveal + .reveal) {
		margin-top: 1.5rem;
	}
	.spot-block {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		align-items: center;
		gap: clamp(1.5rem, 4vw, 3.5rem);
		margin: 4rem 0;
	}
	/* Video first in the visual order, copy second — swapped with `order` so the
	   reading order (and the tab order) still runs title → film. `:global`
	   because these grid items are `Reveal` roots, which never carry this
	   component's scoping class. */
	.spot-block.mirrored {
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
	}
	.spot-block.mirrored > :global(.reveal:first-child) {
		order: 2;
	}
	.spot-copy p {
		margin-bottom: 0;
	}
	@media (max-width: 820px) {
		.spot-block {
			grid-template-columns: minmax(0, 1fr);
		}
		.spot-block.mirrored {
			grid-template-columns: minmax(0, 1fr);
		}
		.spot-block.mirrored > :global(.reveal:first-child) {
			order: 0;
		}
	}
	.pac-block {
		margin: 0;
	}
	.pac-grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin-bottom: 3rem;
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.6;
	}
	@media (max-width: 768px) {
		.pac-grid {
			grid-template-columns: 1fr;
		}
	}
	.arcade {
		background: #111;
		border: 1px solid rgba(255, 217, 52, 0.25);
		border-radius: 8px;
		padding: 1rem;
		box-shadow:
			0 0 30px rgba(255, 217, 52, 0.15),
			inset 0 0 30px rgba(0, 0, 0, 0.8);
	}
	.arcade-screen {
		position: relative;
		background: #000;
		border-radius: 4px;
		overflow: hidden;
	}
	.arcade-base {
		display: flex;
		justify-content: space-between;
		margin-top: 0.6rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: #ffd934;
		letter-spacing: 0.2em;
	}
	.blink {
		animation: blink 1s steps(1) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.pac-flow {
		display: grid;
		grid-template-columns: 1fr auto 1fr auto 1fr;
		gap: 1rem;
		align-items: center;
		margin-top: 2rem;
	}
	@media (max-width: 768px) {
		.pac-flow {
			grid-template-columns: 1fr;
		}
		.arrow {
			transform: rotate(90deg);
			justify-self: center;
		}
	}
	.pac-step {
		position: relative;
		background: rgba(34, 255, 144, 0.04);
		border: 1px solid rgba(34, 255, 144, 0.18);
		border-radius: 10px;
		padding: 1rem;
	}
	.pac-step p {
		margin: 0.6rem 0 0;
		font-size: 0.9rem;
		line-height: 1.5;
		opacity: 0.85;
	}
	.num {
		position: absolute;
		top: -14px;
		left: -14px;
		width: 30px;
		height: 30px;
		background: #22ff90;
		color: #04130a;
		font-weight: 700;
		font-family: var(--font-mono);
		display: grid;
		place-items: center;
		border-radius: 50%;
		box-shadow: 0 0 20px rgba(34, 255, 144, 0.6);
	}
	.arrow {
		color: #22ff90;
		font-size: 1.6rem;
		font-weight: 700;
	}

	/* Closes the section in the same voice it opened in: the lede's type and
	   the section's own ink, held to a reading measure. */
	.closing {
		max-width: 44rem;
		margin-inline: auto;
	}
	.closing p {
		font-size: clamp(1.05rem, 1.5vw, 1.25rem);
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.pac-tunnel {
		--pac-size: clamp(220px, 30vw, 400px);
		--stage-height: calc(var(--pac-size) + clamp(20px, 3vw, 48px));
		--extra-scroll: 50vh;
		position: relative;
		width: 100vw;
		max-width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
		margin-top: 2rem;
		margin-bottom: 0;
		height: calc(var(--stage-height) + var(--extra-scroll));
		pointer-events: none;
	}
	.pac-stage {
		position: sticky;
		top: calc(50vh - var(--stage-height) / 2);
		height: var(--stage-height);
		overflow-x: clip;
		overflow-y: visible;
	}
	.pac-pellets {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8vw;
	}
	.pac-pellets span {
		display: block;
		width: clamp(14px, 1.6vw, 22px);
		height: clamp(14px, 1.6vw, 22px);
		background: #ffd934;
		border-radius: 50%;
		box-shadow: 0 0 18px rgba(255, 217, 52, 0.6);
		transition:
			transform 140ms ease-out,
			opacity 140ms ease-out;
	}
	.pac-pellets span.eaten {
		opacity: 0;
		transform: scale(0);
	}
	.pac-runner {
		position: absolute;
		top: 50%;
		left: 0;
		width: var(--pac-size);
		height: var(--pac-size);
		margin-top: calc(var(--pac-size) / -2);
		/* transform instead of `left` — compositor-only, no layout/paint on every
		   scroll frame while --p updates. */
		transform: translateX(
			calc(var(--p, 0) * (100vw + var(--pac-size) + 80px) - var(--pac-size) - 20px)
		);
		filter: drop-shadow(0 0 32px rgba(255, 217, 52, 0.55));
		will-change: transform;
	}
	.pac-runner svg {
		width: 100%;
		height: 100%;
		display: block;
		overflow: visible;
	}
	.pac-runner-mouth {
		transform-origin: 50% 50%;
		animation: pac-chomp 0.28s ease-in-out infinite alternate;
	}
	@keyframes pac-chomp {
		from {
			transform: scaleY(1);
		}
		to {
			transform: scaleY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pac-tunnel {
			display: none;
		}
	}
</style>
