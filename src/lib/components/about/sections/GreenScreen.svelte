<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';

	let { signedIn = false }: { signedIn?: boolean } = $props();

	const xyzShots = [
		{
			src: '2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen.avif',
			caption: 'Floating anchor — turns out you need a tripod',
		},
		{
			src: '2007-08-09_xyz_news_episode_i-brian_talks_while_floating_with_green_screen.avif',
			caption: 'Same thumbs-up bug, different shot',
		},
		{
			src: '2007-08-09_xyz_news_episode_i-kevin_dances_in_front_of_green_screen_weather_report.avif',
			caption: 'Kevin as weatherman #1',
		},
		{
			src: '2007-08-09_xyz_news_episode_i-kevin_appears_using_green_screen_blanket_visual_effect.avif',
			caption: 'Greenscreen blanket → vanishing trick',
		},
		{
			src: '2007-08-09_xyz_news_episode_i-kevin_makes_funny_expression_while_wearing_a_frisbee.avif',
			caption: 'Kevin, also wearing a frisbee',
		},
	];

	const vfxTests = [
		{ src: '2008-03-09_clone_brian_test.avif', caption: 'Clone effect — twin Brians' },
		{
			src: '2008-03-20_star_wars_test.avif',
			caption: 'Lightsaber, the obligatory VFX rite',
		},
		{ src: '2008-06-20_amanda_hit_by_car_test.avif', caption: 'Hit-by-car test' },
		{
			src: '2009-03-22_yard_sale-hit_by_car.avif',
			caption: 'Same effect, in a real film a year later',
		},
		{ src: '2008-06-22_awc_logo_animation.avif', caption: 'AWC studio logo test' },
		{
			src: '2008-06-22_take_one_films_logo_animation.avif',
			caption: 'Take One Films logo',
		},
		{
			src: '2008-07-13_hunky_spunky_productions_logo_animation_2.avif',
			caption: 'Hunky Spunky Productions logo',
		},
	];

	const nuisanceShots = [
		{
			src: '2008-08-21_nuisance-b-gone-brian_explains_the_product.avif',
			caption: 'The pitch',
		},
		{
			src: '2008-08-21_nuisance-b-gone-product_makes_chair_disappear_visual_effect.avif',
			caption: 'Chair, gone',
		},
		{
			src: '2008-08-21_nuisance-b-gone-product_makes_shoe_disappear_visual_effect.avif',
			caption: 'Shoe, gone',
		},
	];
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
					Kevin's dad painted
					<br />
					<span class="key">a wall neon green.</span>
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
						src="2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen_2.avif"
						alt="Brian floating in front of XYZ News greenscreen"
						ratio="16 / 9"
						class="key-img" />
				</div>
			</Reveal>
		</div>

		<div class="xyz-block">
			<Reveal variant="up">
				<h3 class="sub">XYZ News, Episode I</h3>
				<p>The funniest thing we'd ever made, by a country mile.</p>
			</Reveal>
			<Reveal variant="up" delay={100}>
				<MediaGrid items={xyzShots} min={200} gap={10} ratio="16 / 9" captions={true} />
			</Reveal>
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
								src="2008-01-06_pac-attack-pacman_eats_kevin_visual_effect.avif"
								alt="Pacman eats Kevin"
								ratio="4 / 3" />
							<div class="pac-bites">
								<span class="pellet" style:--i="0"></span>
								<span class="pellet" style:--i="1"></span>
								<span class="pellet" style:--i="2"></span>
								<span class="pellet" style:--i="3"></span>
								<span class="pellet" style:--i="4"></span>
								<span class="pac" aria-hidden="true">
									<svg viewBox="0 0 100 100">
										<defs>
											<clipPath id="mouth">
												<polygon points="50,50 100,20 100,80"></polygon>
											</clipPath>
										</defs>
										<circle cx="50" cy="50" r="46" fill="#ffd934" />
										<polygon points="50,50 100,20 100,80" fill="#000" class="mouth-tri" />
									</svg>
								</span>
							</div>
						</div>
						<div class="arcade-base">
							<span class="coin">INSERT COIN</span>
							<span class="hi">
								HI · 1
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
							src="2008-01-06_pac-attack-pacman_on_green_background_using_powerpoint_for_visual_effect.avif"
							alt="Pacman on greenscreen — PowerPoint export"
							ratio="4 / 3" />
						<p>Animated in PowerPoint, exported to video, on a bright green slide.</p>
					</div>
					<div class="arrow" aria-hidden="true">→</div>
					<div class="pac-step">
						<span class="num">2</span>
						<LazyMedia
							src="2008-01-06_pac-attack-pacman_coming_out_of_tv.avif"
							alt="Pacman keyed onto real footage"
							ratio="4 / 3" />
						<p>Key out the green in our editor. Pacman now lives in real footage.</p>
					</div>
					<div class="arrow" aria-hidden="true">→</div>
					<div class="pac-step">
						<span class="num">3</span>
						<LazyMedia
							src="2008-01-06_pac-attack-flash_game_screen_recording-pacman_eats_brians_floating_faces.avif"
							alt="The companion Flash game"
							ratio="4 / 3" />
						<p>Bonus: a Flash game launched alongside the film. Brian-faces. Pellets.</p>
					</div>
				</div>
			</Reveal>

			<Reveal variant="up" delay={200}>
				<div class="pac-video">
					<VideoPlayer
						slug="2008-01-06_pac-attack"
						title="Pac-Attack (2008) — full short"
						ratio="16 / 9" />
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
				<MediaGrid items={vfxTests} min={220} gap={10} ratio="16 / 9" captions={true} />
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
				<MediaGrid
					items={nuisanceShots}
					min={240}
					gap={10}
					ratio="4 / 3"
					captions={true} />
			</Reveal>
			<Reveal variant="up" delay={150}>
				<div class="inline-video">
					<VideoPlayer
						slug="2008-08-21_nuisance-b-gone"
						title="Nuisance-B-Gone — the fake infomercial"
						ratio="16 / 9" />
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
					<VideoPlayer
						slug="2009-02-13_sideline_huddler"
						title="Sideline Huddler — Amanda's invention commercial"
						ratio="16 / 9" />
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
</SectionShell>

<style>
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
	.pac-block,
	.ae-block,
	.nuisance-block,
	.sideline-block {
		margin: 4rem 0;
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
	.pac-bites {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 100%;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: space-around;
		pointer-events: none;
	}
	.pellet {
		display: block;
		width: 8px;
		height: 8px;
		background: #ffd934;
		border-radius: 50%;
		opacity: 0;
		animation: eat 4s linear infinite;
		animation-delay: calc(var(--i) * 0.5s);
	}
	@keyframes eat {
		0%,
		95%,
		100% {
			opacity: 1;
		}
		96% {
			opacity: 0;
			transform: scale(2);
		}
	}
	.pac {
		position: absolute;
		left: -10%;
		top: 50%;
		width: 38px;
		height: 38px;
		transform: translateY(-50%);
		animation: chomp 4s linear infinite;
	}
	@keyframes chomp {
		from {
			left: -10%;
		}
		to {
			left: 110%;
		}
	}
	.mouth-tri {
		transform-origin: 50% 50%;
		animation: mouth 0.25s ease-in-out infinite alternate;
	}
	@keyframes mouth {
		from {
			transform: scaleY(1);
		}
		to {
			transform: scaleY(0.15);
		}
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
</style>
