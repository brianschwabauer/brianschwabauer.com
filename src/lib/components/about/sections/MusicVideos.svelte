<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';

	const flavaShots = [
		'2010-03-25_do_da_flava_g-music_video_intro.avif',
		'2010-03-25_do_da_flava_g-caleb_dancing_in_front_of_animated_stage.avif',
		'2010-03-25_do_da_flava_g-caleb_dances_with_his_bling.avif',
		'2010-03-25_do_da_flava_g-caleb_dancing_with_3d_moving_platform_animation.avif',
		'2010-03-25_do_da_flava_g-caleb_clones_dancing_in_street.avif',
		'2010-03-25_do_da_flava_g-grandpa_spins_and_dances.avif',
		'2010-03-25_do_da_flava_g-family_dancing_together_in_yard.avif',
		'2010-03-25_do_da_flava_g-matthew_dancing.avif',
		'2010-03-25_do_da_flava_g-flash_video_game_screen_recording.avif',
		'2010-03-25_do_da_flava_g-family_family_dancing_together_in_house.avif',
		'2010-03-25_do_da_flava_g-caleb_hits_baseball_visual_effect.avif'
	].map((src) => ({ src }));

	const calcShots = [
		'2010-08-10_you_derive_me_crazy-whole_class_looks_at_camera.avif',
		'2010-08-10_you_derive_me_crazy-class_dances_on_green_screen_virtual_set.avif',
		'2010-08-10_you_derive_me_crazy-class_dances_with_dance_routine.avif',
		'2010-08-10_you_derive_me_crazy-sarah_sings_to_camera.avif',
		'2010-08-10_you_derive_me_crazy-teacher_looks_at_camera_with_funny_face.avif',
		'2010-08-10_you_derive_me_crazy-class_walks_towards_camera_dramatically.avif',
		'2010-08-10_you_derive_me_crazy-kevin_dancing_in_front_of_green_screen.avif',
		'2010-08-10_you_derive_me_crazy-lavergne_dancing_in_front_of_green_screen.avif'
	].map((src) => ({ src }));
</script>

<SectionShell id="music-videos" year="2008-2010" label="Music Videos" theme="audio">
	<div class="eq" aria-hidden="true">
		{#each Array(40) as _, i}
			<span style:--i={i}></span>
		{/each}
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2008 – 2010" subtitle="Music Videos" color="#ff7ad0" />
		</Reveal>

		<div class="hero-grid">
			<Reveal>
				<div class="eyebrow">FOLLOWING THE BEAT</div>
				<h2 class="title">
					When you don't<br />
					have a script,<br />
					<span class="grad">follow the song.</span>
				</h2>
				<p class="lede">
					I was always drawn to music videos. You don't have to invent a plot or characters — you just get to mash a
					bunch of clips against a beat with quick cuts and clever transitions. It is the cleanest excuse to do
					editing exercises while pretending you're making art.
				</p>
				<p class="lede">
					Our first attempts were honestly just "stand in front of a tripod and lip-sync". By 2010 we'd graduated to
					writing the songs ourselves, recording in our own awful little home studio, and building a music video
					concept around the lyrics. The audio-mixing skills we built here later carried into the sound design of
					every short film.
				</p>
			</Reveal>

			<Reveal variant="right" delay={120}>
				<div class="vinyl">
					<div class="vinyl-disc">
						<div class="vinyl-label">DDFG · 2010</div>
						<div class="grooves"></div>
					</div>
					<div class="vinyl-arm"></div>
				</div>
			</Reveal>
		</div>

		<div class="track">
			<div class="track-num">01</div>
			<div class="track-body">
				<Reveal>
					<h3 class="sub">Flashlight <span class="dot">·</span> 2007</h3>
					<p>
						Our first original song, written and recorded with Kevin. A guy goes slowly insane searching for a
						flashlight he can't find. The music video has way more shots, way more quick cuts, and starts to
						actually feel like a music video.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<div class="paired">
						<LazyMedia src="2007-08-26_flashlight-brian_plays_guitar.avif" alt="Brian plays guitar" ratio="16 / 9" />
						<LazyMedia src="2007-08-26_flashlight-brian_summons_guitar_reversed_footage_visual_effect.avif" alt="Summoning a guitar via reversed footage" ratio="16 / 9" />
					</div>
				</Reveal>
				<Reveal variant="up" delay={160}>
					<div class="track-video">
						<VideoPlayer slug="2007-08-26_flashlight" title="Flashlight (2007) — music video" ratio="16 / 9" />
					</div>
				</Reveal>
			</div>
		</div>

		<div class="track">
			<div class="track-num">02</div>
			<div class="track-body">
				<Reveal>
					<h3 class="sub">Do Da Flava G <span class="dot">·</span> 2010</h3>
					<p>
						We wrote a rap song for a friend, made him "into a rapper", filmed my whole family doing a goofy
						family dance to it — grandparents included — and shot the music video. It placed in a local film
						festival. I think second.
					</p>
					<p>
						I also built a whole Flash website for the fake artist. There was a game on the site: press a number
						on the keyboard and the animated Flava G character would do that dance. We wrote four songs for him.
						We only ever shot a music video for one.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<MediaGrid items={flavaShots} min={200} gap={6} ratio="4 / 3" />
				</Reveal>
				<Reveal variant="up" delay={160}>
					<div class="track-video">
						<VideoPlayer slug="2010-03-25_do_da_flava_g" title="Do Da Flava G (2010) — music video" ratio="16 / 9" />
					</div>
				</Reveal>
			</div>
		</div>

		<div class="track">
			<div class="track-num">03</div>
			<div class="track-body">
				<Reveal>
					<h3 class="sub">You Derive Me Crazy <span class="dot">·</span> 2010</h3>
					<p>
						AP Calculus had just wrapped, so my teacher let us be creative. We wrote a parody — set to Britney
						Spears' "You Drive Me Crazy" — with lyrics full of calc puns. Shot it in class, used greenscreen to
						put the whole class into virtual sets, and turned in the most absurd math project the school had ever
						seen.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<MediaGrid items={calcShots} min={220} gap={6} ratio="16 / 9" />
				</Reveal>
				<Reveal variant="up" delay={160}>
					<div class="track-video">
						<VideoPlayer slug="2010-08-10_you_derive_me_crazy" title="You Derive Me Crazy (2010) — calculus parody music video" ratio="16 / 9" />
					</div>
				</Reveal>
			</div>
		</div>

		<Reveal>
			<Expandable label="An honest take on the music side">
				<div class="prose">
					<p>
						We were not good musicians. The recordings live somewhere on a hard drive between "endearing" and
						"unlistenable", depending on the track. But the music videos taught me <em>so much</em> about editing
						to tempo, about how a cut can land on a beat, about how a small change in audio can completely change
						what a viewer feels in a shot. I cut every short film I make differently because of those years.
					</p>
				</div>
			</Expandable>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='audio']) {
		background:
			radial-gradient(ellipse at 80% 0%, rgba(255, 122, 208, 0.12), transparent 50%),
			radial-gradient(ellipse at 0% 100%, rgba(0, 200, 255, 0.1), transparent 50%),
			linear-gradient(180deg, #0c0316, #16071f 50%, #08041a);
		color: #ffe9f6;
	}
	.eq {
		position: absolute;
		bottom: 6%;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		gap: 4px;
		height: 200px;
		pointer-events: none;
		opacity: 0.15;
	}
	.eq span {
		display: block;
		width: 8px;
		background: linear-gradient(180deg, #ff7ad0, #00c8ff);
		border-radius: 4px 4px 0 0;
		animation: eq 1.8s ease-in-out infinite;
		animation-delay: calc(var(--i) * 60ms);
		height: 20%;
		transform-origin: bottom;
	}
	@keyframes eq {
		0%, 100% { transform: scaleY(0.3); }
		25% { transform: scaleY(1); }
		50% { transform: scaleY(0.6); }
		75% { transform: scaleY(0.9); }
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.hero-grid {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: center;
		margin-bottom: 5rem;
	}
	@media (max-width: 768px) {
		.hero-grid { grid-template-columns: 1fr; }
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff7ad0;
		margin-bottom: 1rem;
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.grad {
		background: linear-gradient(90deg, #ff7ad0, #ffb84d, #00c8ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 38rem;
	}

	.vinyl {
		position: relative;
		aspect-ratio: 1;
		max-width: 420px;
		margin: 0 auto;
	}
	.vinyl-disc {
		position: absolute;
		inset: 5%;
		border-radius: 50%;
		background:
			repeating-radial-gradient(circle at center, #181818 0 1px, #0a0a0a 1px 3px),
			#0a0a0a;
		box-shadow:
			0 30px 80px rgba(255, 122, 208, 0.25),
			0 6px 20px rgba(0, 0, 0, 0.6),
			inset 0 0 30px rgba(0, 0, 0, 0.8);
		animation: spin 12s linear infinite;
	}
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	.vinyl-label {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 38%;
		height: 38%;
		border-radius: 50%;
		background: radial-gradient(circle, #ff7ad0 0%, #ff4090 70%, #d02b78 100%);
		display: grid;
		place-items: center;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		color: #fff;
	}
	.vinyl-label::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 6px;
		height: 6px;
		background: #000;
		border-radius: 50%;
	}
	.vinyl-arm {
		position: absolute;
		top: 0;
		right: -10%;
		width: 60%;
		height: 8px;
		background: linear-gradient(180deg, #444, #222);
		border-radius: 4px;
		transform-origin: right center;
		transform: rotate(35deg);
		box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
	}
	@media (prefers-reduced-motion: reduce) {
		.vinyl-disc { animation: none; }
	}

	.track {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		margin: 3rem 0;
	}
	@media (max-width: 640px) {
		.track { grid-template-columns: 1fr; }
	}
	.track-num {
		font-family: var(--font-mono);
		font-size: clamp(3rem, 6vw, 5rem);
		font-weight: 900;
		color: transparent;
		-webkit-text-stroke: 2px #ff7ad0;
		letter-spacing: -0.02em;
		line-height: 1;
		position: sticky;
		top: 100px;
		height: max-content;
	}
	.sub {
		font-size: clamp(1.5rem, 2.8vw, 2.2rem);
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.dot { color: #ff7ad0; }
	.paired {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}
	@media (max-width: 640px) {
		.paired { grid-template-columns: 1fr; }
	}
	.track-video {
		margin-top: 1.2rem;
		max-width: 820px;
	}

	.prose p { line-height: 1.65; margin-bottom: 1rem; }
	.prose em { color: #ff7ad0; font-style: italic; }
</style>
