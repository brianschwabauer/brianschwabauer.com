<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import { Gallery, type GalleryItem } from '@delightstack/components/media';

	let { signedIn = false }: { signedIn?: boolean } = $props();

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
		const updateProgress = () => {
			const rect = pacTunnel!.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			const range = vh + pacTunnel!.offsetHeight;
			const p = range > 0 ? (vh - rect.top) / range : 0;
			pacProgress = Math.max(0, Math.min(1, p));
		};
		const onResize = () => {
			recomputePelletTargets();
			updateProgress();
		};
		recomputePelletTargets();
		updateProgress();
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('scroll', updateProgress);
			window.removeEventListener('resize', onResize);
		};
	});

	const xyzImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen.avif',
			width: 352,
			height: 240,
			caption: 'Floating anchor — turns out you need a tripod',
			alt: 'Floating anchor — turns out you need a tripod',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-brian_talks_while_floating_with_green_screen.avif',
			width: 352,
			height: 240,
			caption: 'Same thumbs-up bug, different shot',
			alt: 'Same thumbs-up bug, different shot',
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
			src: 'https://cdn.brianschwabauer.com/media/2007-08-09_xyz_news_episode_i-kevin_makes_funny_expression_while_wearing_a_frisbee.avif',
			width: 352,
			height: 240,
			caption: 'Kevin, also wearing a frisbee',
			alt: 'Kevin, also wearing a frisbee',
		},
	];

	const vfxImages: GalleryItem[] = [
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
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-hit_by_car.avif',
			width: 480,
			height: 320,
			caption: 'Same effect, in a real film a year later',
			alt: 'Same effect, in a real film a year later',
			favorite: true,
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

	const nuisanceImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone-brian_explains_the_product.avif',
			width: 480,
			height: 320,
			caption: 'The pitch',
			alt: 'The pitch',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone-product_makes_chair_disappear_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Chair, gone',
			alt: 'Chair, gone',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone-product_makes_shoe_disappear_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Shoe, gone',
			alt: 'Shoe, gone',
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
			caption: 'XYZ News — the floating anchor bug',
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

	let gallery = $state<ReturnType<typeof Gallery>>();
</script>

<SectionShell id="green-screen" year="2007" label="Green Screen" theme="green">
	<div class="bg-grid" aria-hidden="true"></div>
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
					Suddenly the possibilities felt infinite. We didn't know how to use a chroma
					key. We didn't know what "chroma key" was. We knew our editing software had a
					button labeled "green screen". That was enough.
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
						<div class="key-label">CHROMA · 0x22FF90</div>
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

		<div class="xyz-block">
			<Reveal variant="up">
				<h3 class="sub">XYZ News, Episode I</h3>
				<p>The funniest thing we'd ever made, by a country mile.</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<Gallery items={xyzImages} display="masonry-row" size="2" />
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
						eating animated faces. It was my first real taste of programming creating
						something on screen. I never forgot it.
					</p>
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

			<Reveal variant="up" delay={200}>
				<div class="pac-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2008-01-06_pac-attack/poster.jpg"
						alt="Pac-Attack (2008) — full short"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(5, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="ae-block">
			<Reveal variant="up">
				<h3 class="sub">Discovering After Effects</h3>
				<p>
					Our editor couldn't take us further. So I picked up After Effects and started
					running tests — every VFX artist's rite of passage. Clone yourself. Build a
					lightsaber. Get hit by a car. Animate a logo.
				</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<Gallery items={vfxImages} display="masonry" size="0" />
			</Reveal>
		</div>

		<div class="nuisance-block">
			<Reveal variant="up">
				<h3 class="sub">Nuisance-B-Gone</h3>
				<p>
					Once I learned After Effects had a "rotoscope" capability, I had to test it. Cut
					out a chair before it vanishes. Cut out a shoe. Stay locked-off on a tripod and
					let the trick do the work. We turned the test into a fake infomercial.
				</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<Gallery items={nuisanceImages} display="masonry-row" size="2" />
			</Reveal>
			<Reveal variant="up" delay={150}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2008-08-21_nuisance-b-gone/poster.jpg"
						alt="Nuisance-B-Gone — the fake infomercial"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(6, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<div class="sideline-block">
			<Reveal variant="up">
				<h3 class="sub">Sideline Huddler</h3>
				<p>
					My sister Amanda "invented" a warm blanket with a waterproof shell for outdoor
					sports — basically a Snuggie you could take outside, before Snuggies existed. We
					made her a fake commercial that put her into rain, snow, and fire via green
					screen.
				</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<div class="inline-video">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2009-02-13_sideline_huddler/poster.jpg"
						alt="Sideline Huddler — Amanda's invention commercial"
						ratio="16 / 9"
						video
						onclick={(e) => gallery?.open(7, e.currentTarget)} />
				</div>
			</Reveal>
		</div>

		<Reveal>
			<Expandable label="Why we never planned. Why it worked anyway.">
				<div class="prose">
					<p>
						This was the pattern: we picked an effect we'd never done before. We dove
						right in. No research, no tutorials. We learned by failing in public. With
						each film we added another tool to the box.
					</p>
					<p>
						The "everything I make is a thinly disguised pretext to try one new technical
						thing" loop never really left me. Pac-Attack was about a greenscreen trick.
						Nuisance-B-Gone was about cleanplate rotoscope. The "Calamity" film a year
						later (next section over) was about stop-motion. Everything was an excuse.
					</p>
				</div>
			</Expandable>
		</Reveal>
	</div>

	<Gallery bind:this={gallery} items={sectionExtras} display="lightbox" autoplay_video />
</SectionShell>

<style>
	.lb-img {
		display: block;
		max-width: min(1400px, 92vw);
		max-height: calc(95svh - 8rem);
		object-fit: contain;
		border-radius: 6px;
	}
	:global([data-theme='green']) {
		background:
			radial-gradient(ellipse at top, rgba(34, 255, 144, 0.06), transparent 50%),
			linear-gradient(180deg, #04130a 0%, #0a1f12 50%, #04140b 100%);
		color: #d8ffe6;
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
	.xyz-block,
	.ae-block,
	.nuisance-block,
	.sideline-block {
		margin: 4rem 0;
	}
	.pac-block {
		margin: 0;
	}
	.inline-video {
		max-width: 880px;
		margin: 2rem auto 0;
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
		font-weight: 800;
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
	.pac-video {
		margin-top: 2.5rem;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.prose p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.prose em {
		color: #22ff90;
		font-style: italic;
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
		width: var(--pac-size);
		height: var(--pac-size);
		margin-top: calc(var(--pac-size) / -2);
		left: calc(var(--p, 0) * (100vw + var(--pac-size) + 80px) - var(--pac-size) - 20px);
		filter: drop-shadow(0 0 32px rgba(255, 217, 52, 0.55));
		will-change: left;
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
