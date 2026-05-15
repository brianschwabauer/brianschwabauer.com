<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';

	const pr1Shots = [
		{ src: '2007-07-26_power_rangers_360-power_rangers_start_the_morphin_time.avif', caption: 'Morphin time' },
		{ src: '2007-07-26_power_rangers_360-amanda_morphs_on_green_screen_graphic.avif', caption: 'Amanda morphs (greenscreen graphic)' },
		{ src: '2007-07-26_power_rangers_360-brian_morphs_on_green_screen_graphic.avif', caption: 'Brian morphs' },
		{ src: '2007-07-26_power_rangers_360-emma_morphs_on_green_screen_graphic.avif', caption: 'Emma morphs' },
		{ src: '2007-07-26_power_rangers_360-kevin_morphs_on_green_screen_graphic.avif', caption: 'Kevin morphs' },
		{ src: '2007-07-26_power_rangers_360-brian_and_kevin_sword_fight.avif', caption: 'Red vs Blue, the duel' },
		{ src: '2007-07-26_power_rangers_360-vino_kicks_brian_in_360_move.avif', caption: 'Vino lands the "360"' },
		{ src: '2007-07-26_power_rangers_360-vino_summons_fallen_broom_stick_reversed_footage_visual_effect.avif', caption: 'Reversed-footage summoning' },
		{ src: '2007-07-26_power_rangers_360-vino_disappears_visual_effect.avif', caption: 'Vino vanishes' },
		{ src: '2007-07-26_power_rangers_360-brian_pulls_out_knife.avif', caption: 'The final duel begins' }
	];

	const pr2BTS = [
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_03-clapper.avif', caption: 'A real clapper this time' },
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_01.avif', caption: 'On set, take whatever' },
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_02.avif', caption: 'Stunt prep' },
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_filming_a_dog.avif', caption: 'Yes, Zordon was played by a dog' },
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_green_screen_super_hero.avif', caption: 'Flight comp, greenscreen' },
		{ src: '2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_04.avif', caption: 'More set life' }
	];

	const pr2Stills = [
		{ src: '2008-08-15_power_rangers_360_ii-all_power_rangers_charge_towards_bad_guys.avif', caption: 'The charge' },
		{ src: '2008-08-15_power_rangers_360_ii-all_power_rangers_pull_out_their_knifes.avif', caption: 'Blades out' },
		{ src: '2008-08-15_power_rangers_360_ii-brian_and_grant_fight_with_swords.avif', caption: 'Red vs henchman' },
		{ src: '2008-08-15_power_rangers_360_ii-brian_flies_towards_camera_using_green_screen_visual_effect.avif', caption: 'Flight, greenscreen' },
		{ src: '2008-08-15_power_rangers_360_ii-brian_flies_through_clouds_visual_effect.avif', caption: 'Through the clouds' },
		{ src: '2008-08-15_power_rangers_360_ii-vino_appears_by_tree_visual_effect.avif', caption: 'Vino, back from "the dead"' },
		{ src: '2008-08-15_power_rangers_360_ii-all_power_rangers_charge_towards_bad_guys_profile_shot.avif', caption: 'Profile shot' },
		{ src: '2008-08-15_power_rangers_360_ii-brian_flies_and_lands_on_ground_visual_effect.avif', caption: 'Landing' }
	];
</script>

<SectionShell id="power-rangers" year="2007-2008" label="Power Rangers 360" theme="ranger">
	<div class="prismatic" aria-hidden="true">
		<span class="band red"></span>
		<span class="band blue"></span>
		<span class="band yellow"></span>
		<span class="band pink"></span>
		<span class="band black"></span>
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2007 – 2008" subtitle="Feature Length" color="#ffcc33" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="eyebrow">PROJECT 02 · A FULL-LENGTH FILM, ALMOST</div>
				<h2 class="title">
					<span class="word w1">POWER</span>
					<span class="word w2">RANGERS</span>
					<span class="word w3">360</span>
				</h2>
				<p class="lede">
					We'd spent two summers on short films. We were ready for the big one — a Hollywood feature-length movie.
					We didn't know how long a script needed to be, so we wrote until we couldn't write anymore. We didn't
					want to invent characters or world-building, so we borrowed an existing IP. We were thirteen.
				</p>
			</Reveal>
		</div>

		<div class="rangers">
			{#each [
				{ name: 'RED', who: 'Brian', color: '#ff3a3a' },
				{ name: 'BLUE', who: 'Kevin', color: '#3a8cff' },
				{ name: 'YELLOW', who: 'Emma', color: '#ffd934' },
				{ name: 'PINK', who: 'Amanda', color: '#ff5fb3' }
			] as r, i}
				<Reveal variant="up" delay={i * 90}>
					<div class="ranger-card" style:--c={r.color}>
						<div class="ranger-helmet">
							<svg viewBox="0 0 100 110" aria-hidden="true">
								<path d="M50 8 L82 26 L82 62 Q82 100 50 100 Q18 100 18 62 L18 26 Z" fill="var(--c)" stroke="#000" stroke-width="2" />
								<rect x="28" y="46" width="44" height="14" fill="#000" />
								<path d="M50 8 L62 26 L38 26 Z" fill="#fff" opacity="0.18" />
							</svg>
						</div>
						<div class="ranger-name">{r.name}</div>
						<div class="ranger-who">played by {r.who}</div>
					</div>
				</Reveal>
			{/each}
		</div>

		<div class="pr-grid">
			<Reveal>
				<h3 class="sub">Power Rangers 360 (2007)</h3>
				<p>
					Thirty minutes. Our first "feature". The blue ranger goes rogue, joins the villain Vino, fights the red
					ranger, dies in his arms. Our friends gave up their summer to be in it.
				</p>
				<p>
					We held the premiere in my backyard. Bed sheets over the windows, a projector on a borrowed light stand,
					sundown. The "screen" was 20 feet tall. It was the biggest moment of either of our lives at that point.
				</p>
			</Reveal>
			<Reveal variant="right" delay={100}>
				<div class="premiere">
					<LazyMedia
						src="2007-06-16_power_rangers_360-premiere-power_rangers_group_photo_1.jpg"
						alt="The Power Rangers cast"
						ratio="4 / 3"
					/>
					<div class="premiere-cap">Premiere · summer 2007 · backyard cinema · ~40 friends and family</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up" delay={120}>
			<div class="pr1-reel-wrap">
				<FilmReel images={pr1Shots} height={160} speed={70} />
				<div class="film-meta">FROM POWER RANGERS 360 · 2007</div>
			</div>
		</Reveal>

		<div class="seq-divider">
			<span></span>
			<div class="seq-text">
				ONE YEAR LATER<br /><strong>WE TRIED IT AGAIN — BIGGER</strong>
			</div>
			<span></span>
		</div>

		<div class="pr2-block">
			<Reveal>
				<h3 class="sub">Power Rangers 360 II (2008)</h3>
				<p>
					We spent weeks writing. The script hit 60+ pages, printed into binders and handed out to a cast that, by
					then, had grown to a small army of friends. The result was 64 minutes long — counting the credits and a
					handful of scenes we left way too long because we were chasing a runtime. Worth it.
				</p>
				<p>
					Zordon, the rangers' leader, was played by Kevin's dog. We filmed him "talking" via peanut butter and
					comped him into the scene with — what else — greenscreen.
				</p>
			</Reveal>

			<Reveal variant="up" delay={100}>
				<div class="bts-strip">
					<div class="bts-eyebrow">BEHIND THE SCENES</div>
					<MediaGrid items={pr2BTS} min={220} gap={8} ratio="16 / 9" captions={true} />
				</div>
			</Reveal>

			<Reveal variant="up" delay={150}>
				<div class="bts-strip">
					<div class="bts-eyebrow">FROM THE FILM</div>
					<MediaGrid items={pr2Stills} min={240} gap={8} ratio="16 / 9" captions={true} />
				</div>
			</Reveal>

			<div class="premiere-2">
				<Reveal variant="left">
					<LazyMedia
						src="2008-08-09_power_rangers_360_ii-premiere-backyward_projector_setup.avif"
						alt="The PR360 II premiere projector setup"
						ratio="4 / 3"
					/>
				</Reveal>
				<Reveal variant="right" delay={100}>
					<LazyMedia
						src="2008-08-09_power_rangers_360_ii-premiere-brian_and_kevin_1.jpg"
						alt="Brian and Kevin at the PR360 II premiere"
						ratio="4 / 3"
					/>
				</Reveal>
			</div>
		</div>

		<Reveal>
			<Expandable label="What we learned filming for two months in a row">
				<div class="prose">
					<p>
						Filming day after day in midwestern August heat is a different kind of work. By week three, everyone
						is tired. Performances slip. Composition slips. Patience slips. We learned to plan harder. We learned
						what call sheets were for. We learned what an actual production day's energy looks like. None of
						that is in a film school book — you can only learn it by doing it.
					</p>
					<p>
						Looking back, neither of these movies is good. But I'm still proud of them. They were the first time
						we tried something that should have been out of reach, and finished it.
					</p>
				</div>
			</Expandable>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='ranger']) {
		background:
			radial-gradient(ellipse at top, rgba(255, 60, 60, 0.08), transparent 50%),
			radial-gradient(ellipse at bottom, rgba(58, 140, 255, 0.08), transparent 60%),
			linear-gradient(180deg, #0a0710 0%, #100612 50%, #06080f 100%);
		color: #f4ecff;
	}
	.prismatic {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		pointer-events: none;
		mix-blend-mode: screen;
		opacity: 0.3;
	}
	.prismatic .band {
		flex: 1;
		mix-blend-mode: screen;
	}
	.prismatic .red { background: linear-gradient(90deg, transparent, #ff3a3a 40%, #ff3a3a 60%, transparent); }
	.prismatic .blue { background: linear-gradient(90deg, transparent, #3a8cff 40%, #3a8cff 60%, transparent); }
	.prismatic .yellow { background: linear-gradient(90deg, transparent, #ffd934 40%, #ffd934 60%, transparent); }
	.prismatic .pink { background: linear-gradient(90deg, transparent, #ff5fb3 40%, #ff5fb3 60%, transparent); }
	.prismatic .black { background: linear-gradient(90deg, transparent, #444 40%, #444 60%, transparent); }

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.lockup {
		text-align: center;
		margin-bottom: 4rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.4em;
		opacity: 0.75;
		margin-bottom: 1rem;
	}
	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		font-family: 'Inter', sans-serif;
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		margin: 0;
	}
	.word {
		display: inline-block;
		font-size: clamp(3rem, 12vw, 9rem);
		background: linear-gradient(180deg, #ffd934 0%, #ffcc33 50%, #ffaa00 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 60px rgba(255, 217, 52, 0.15);
		transform-origin: center;
	}
	.w1 { animation: slamIn 1s cubic-bezier(.2,1,.3,1.2) both; }
	.w2 { animation: slamIn 1s cubic-bezier(.2,1,.3,1.2) 0.15s both; }
	.w3 { animation: slamIn 1s cubic-bezier(.2,1,.3,1.2) 0.3s both; color: #fff; -webkit-text-stroke: 2px #ffcc33; }
	@keyframes slamIn {
		from { transform: scale(1.25); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
	.lede {
		max-width: 44rem;
		margin: 1.4rem auto 0;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		line-height: 1.6;
		opacity: 0.88;
	}

	.rangers {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin: 0 0 4rem;
	}
	@media (max-width: 720px) {
		.rangers { grid-template-columns: repeat(2, 1fr); }
	}
	.ranger-card {
		text-align: center;
		padding: 1.4rem 0.6rem;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent);
		border: 1px solid var(--c);
		border-radius: 12px;
		position: relative;
		overflow: hidden;
		transition: transform 200ms ease;
	}
	.ranger-card:hover {
		transform: translateY(-4px);
	}
	.ranger-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(circle at 50% 0%, var(--c), transparent 65%);
		opacity: 0.16;
	}
	.ranger-helmet svg {
		width: 70px;
		height: auto;
		filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5));
	}
	.ranger-name {
		font-family: var(--font-mono);
		font-weight: 800;
		letter-spacing: 0.16em;
		margin-top: 0.4rem;
		color: var(--c);
	}
	.ranger-who {
		font-size: 0.85rem;
		opacity: 0.7;
		margin-top: 0.2rem;
	}

	.pr-grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin-bottom: 3rem;
	}
	@media (max-width: 768px) {
		.pr-grid { grid-template-columns: 1fr; }
	}
	.premiere-cap {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		opacity: 0.75;
		margin-top: 0.6rem;
	}
	.sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin-bottom: 0.4rem;
	}

	.pr1-reel-wrap {
		margin: 3rem 0;
		position: relative;
	}
	.film-meta {
		text-align: center;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		opacity: 0.7;
		margin-top: 0.7rem;
	}

	.seq-divider {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		margin: 4rem 0;
	}
	.seq-divider span {
		display: block;
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	}
	.seq-text {
		text-align: center;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		letter-spacing: 0.18em;
		opacity: 0.7;
	}
	.seq-text strong {
		display: block;
		color: #ffd934;
		font-size: 1rem;
		letter-spacing: 0.22em;
		margin-top: 0.2rem;
	}

	.pr2-block { margin-bottom: 3rem; }
	.pr2-block p { max-width: 56rem; line-height: 1.6; }

	.bts-strip {
		margin: 2rem 0;
	}
	.bts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 0.8rem;
	}

	.premiere-2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-top: 2rem;
	}
	@media (max-width: 640px) {
		.premiere-2 { grid-template-columns: 1fr; }
	}

	.prose p { line-height: 1.65; margin-bottom: 1rem; }
</style>
