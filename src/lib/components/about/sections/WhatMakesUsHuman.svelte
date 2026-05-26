<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';
	import Expandable from '../primitives/Expandable.svelte';

	const filmShots = [
		'2014-06-04_what_makes_us_human-dramatic_dolly_shot_in_library.avif',
		'2014-06-04_what_makes_us_human-drone_show_of_telescan_building_visual_effect.avif',
		'2014-06-04_what_makes_us_human-eye_recording_light_visual_effect.avif',
		'2014-06-04_what_makes_us_human-main_character_stuck_in_high_tech_jail_cell_visual_effect.avif',
		'2014-06-04_what_makes_us_human-main_character_uses_futuristic_computer_hologram_ui_visual_effect.avif',
		'2014-06-04_what_makes_us_human-transparent_tablet_ui_animation_visual_effect.avif',
		'2014-06-04_what_makes_us_human-transparent_tablet_ui_animation_visual_effect_2.avif',
		'2014-06-04_what_makes_us_human-villian_lectures_protagonist_in_high_tech_jail_cell.avif'
	].map((src) => ({ src }));

	const conceptArt = [
		{ src: '2014-06-04_what_makes_us_human-concept_art-telescan_building.avif', caption: 'Telescan headquarters · concept art' },
		{ src: '2014-06-04_what_makes_us_human-concept_art-disposal_room.jpg', caption: 'Disposal room' },
		{ src: '2014-06-04_what_makes_us_human-concept_art-teleporter.jpg', caption: 'The teleporter' },
		{ src: '2014-06-04_what_makes_us_human-concept_art-handcuffs.jpg', caption: 'Hi-tech restraints' },
		{ src: '2014-06-04_what_makes_us_human-concept_art-main_characters_eye_recorder_close_up.jpg', caption: 'Eye-recorder UI' }
	];

	const btsPhotos = [
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-001.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-002.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-057.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-059.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-060.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-062.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-072.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-084.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-088.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-094.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-096.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-101.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-127.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-155.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-163.avif',
		'2014-06-04_what_makes_us_human-behind_the_scenes_set_photo_stillframe-194.avif'
	].map((src) => ({ src }));

	const premierePhotos = [
		'2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-empty_theater.avif',
		'2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-crowd.avif',
		'2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-brian_schwabauer_close_up.jpg',
		'2015-05-11_missouri_state_electronic_arts_showcase-what_makes_us_human_premier-what_makes_us_human_crew_group_photo.avif'
	].map((src) => ({ src }));
</script>

<SectionShell id="what-makes-us-human" year="2015" label="Senior Thesis" theme="thesis">
	<div class="scan" aria-hidden="true">
		<div class="scan-line"></div>
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2015" subtitle="Senior Thesis" color="#00f2c3" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<div class="film-poster" style:background-image="url(https://cdn.brianschwabauer.com/media/2014-06-04_what_makes_us_human-film_poster_without_text.avif)"></div>
				<div class="poster-text">
					<div class="award-tag">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M12 2l2.4 5 5.6.8-4 4 1 5.5L12 14.5l-5 2.8 1-5.5-4-4 5.6-.8z" fill="currentColor" />
						</svg>
						<span>MBEA · 1st Place · Screenwriting</span>
					</div>
					<h2 class="title">WHAT MAKES<br />US HUMAN</h2>
					<div class="subtitle">A short film about teleportation, identity, and what gets left behind.</div>
				</div>
			</Reveal>
		</div>

		<div class="synopsis">
			<Reveal>
				<h3 class="eyebrow">SYNOPSIS</h3>
				<p>
					Eve, a journalist, is digging into a new teleportation technology when she's forced to use a teleporter
					in an emergency. The machine works by scanning your body at the molecular level, transmitting the data,
					and "printing" you on the other end — then destroying the original. The public doesn't know that last
					part.
				</p>
				<p>
					The power flickers mid-scan. The machine prints a new Eve but fails to destroy the old one. Now there
					are two of her, and the company has reasons to make sure nobody finds out. She eventually exposes the
					secret to the world.
				</p>
				<p class="aside">
					<strong>The question the film never quite answers:</strong> if a perfect 1:1 copy of you exists, is the
					original still "you"? What does this technology do to the meaning of being a person? We didn't try to
					solve that on screen. We tried to let it sit in your stomach.
				</p>
			</Reveal>
		</div>

		<div class="film-grid">
			<Reveal variant="up">
				<div class="eyebrow">FROM THE FILM</div>
				<MediaGrid items={filmShots} min={240} gap={6} ratio="16 / 9" />
			</Reveal>
			<Reveal variant="up" delay={120}>
				<div class="full-film">
					<div class="full-film-eyebrow">
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<polygon points="6,4 22,12 6,20" fill="currentColor" />
						</svg>
						<span>WATCH THE FULL FILM · 15 MIN</span>
					</div>
					<VideoPlayer slug="2014-06-04_what_makes_us_human" title="What Makes Us Human (2014) — full senior thesis short" ratio="16 / 9" />
				</div>
			</Reveal>
		</div>

		<div class="concept-grid">
			<Reveal variant="up">
				<div class="eyebrow">CONCEPT ART · PRE-PRODUCTION</div>
				<MediaGrid items={conceptArt} min={220} gap={8} ratio="16 / 9" captions={true} />
			</Reveal>
		</div>

		<div class="prod-stats">
			<Reveal>
				<div class="stat">
					<div class="stat-num">15</div>
					<div class="stat-label">minutes long</div>
				</div>
				<div class="stat">
					<div class="stat-num">20+</div>
					<div class="stat-label">script revisions</div>
				</div>
				<div class="stat">
					<div class="stat-num">~$5k</div>
					<div class="stat-label">crowdfunded on Indiegogo</div>
				</div>
				<div class="stat">
					<div class="stat-num">∞</div>
					<div class="stat-label">favors called in</div>
				</div>
			</Reveal>
		</div>

		<div class="bts-block">
			<Reveal>
				<h3 class="big-sub">We approached it like a Hollywood film.</h3>
				<p>
					A 15-minute short, but with craft services, extras, multiple locations, a casting call, an Indiegogo
					fundraising campaign, real camera rigs, multiple revisions on the script over months of preproduction.
					Not because we needed all of that to deliver — but because we wanted to know what it felt like to
					actually do it.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<MediaGrid items={btsPhotos} min={180} gap={4} ratio="16 / 9" />
			</Reveal>
		</div>

		<div class="premiere-block">
			<Reveal>
				<h3 class="big-sub">Premiere · MSU Electronic Arts Showcase · May 2015</h3>
				<p>
					The end of college. A theater. A crowd. The film ran. People reacted to the beats we'd been building
					toward for almost a year. It is, to this day, the single longest project I've ever shipped.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<MediaGrid items={premierePhotos} min={240} gap={6} ratio="16 / 9" />
			</Reveal>
		</div>
	</div>
</SectionShell>

<style>
	:global([data-theme='thesis']) {
		background:
			radial-gradient(ellipse at top, rgba(0, 242, 195, 0.06), transparent 50%),
			linear-gradient(180deg, #03080a, #06141a 50%, #02080c);
		color: #e8f7fa;
	}
	.scan {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		opacity: 0.35;
	}
	.scan-line {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 80px;
		background: linear-gradient(180deg, transparent 0%, rgba(0, 242, 195, 0.3) 50%, transparent 100%);
		filter: blur(8px);
		animation: scan 8s linear infinite;
	}
	@keyframes scan {
		from { transform: translateY(-80px); }
		to { transform: translateY(120vh); }
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.lockup {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		padding: 3rem 0;
		margin-bottom: 3rem;
	}
	.lockup > :global(.reveal) {
		display: contents;
	}
	.film-poster {
		position: absolute;
		inset: -10% -25%;
		background-size: cover;
		background-position: center;
		opacity: 0.18;
		filter: blur(10px) saturate(1.2);
		z-index: 0;
	}
	.poster-text {
		position: relative;
		z-index: 1;
		text-align: center;
	}
	.award-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 1rem;
		background: rgba(255, 217, 52, 0.15);
		color: #ffd934;
		border: 1px solid #ffd934;
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.18em;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}
	.award-tag svg { width: 14px; height: 14px; }
	.title {
		font-size: clamp(2.8rem, 8vw, 6rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: 0.02em;
		margin: 0 0 1rem;
		background: linear-gradient(180deg, #fff 30%, #00f2c3 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		text-shadow: 0 0 80px rgba(0, 242, 195, 0.25);
	}
	.subtitle {
		font-family: var(--font-mono);
		font-size: 1rem;
		letter-spacing: 0.06em;
		opacity: 0.8;
		max-width: 40rem;
		margin: 0 auto;
	}

	.synopsis {
		max-width: 52rem;
		margin: 0 auto 4rem;
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 1rem;
		font-weight: 700;
	}
	.synopsis p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(0, 242, 195, 0.06);
		border-left: 3px solid #00f2c3;
		border-radius: 0 8px 8px 0;
	}
	.aside strong { color: #00f2c3; }

	.film-grid, .concept-grid, .bts-block, .premiere-block {
		margin: 4rem 0;
	}

	.prod-stats > :global(.reveal) {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1rem;
		margin: 4rem 0;
		padding: 2rem;
		background: linear-gradient(135deg, rgba(0, 242, 195, 0.06), transparent);
		border: 1px solid rgba(0, 242, 195, 0.2);
		border-radius: 12px;
	}
	@media (max-width: 768px) {
		.prod-stats > :global(.reveal) { grid-template-columns: repeat(2, 1fr); }
	}
	.stat {
		text-align: center;
	}
	.stat-num {
		font-family: var(--font-mono);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 900;
		color: #00f2c3;
		line-height: 1;
	}
	.stat-label {
		font-size: 0.85rem;
		opacity: 0.75;
		margin-top: 0.3rem;
	}

	.big-sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin: 0 0 0.8rem;
	}
	.bts-block p, .premiere-block p {
		max-width: 56rem;
		line-height: 1.65;
		margin-bottom: 1.5rem;
	}

	.full-film {
		margin: 2.5rem auto 0;
		max-width: 920px;
		padding: 1.4rem;
		background: linear-gradient(135deg, rgba(0, 242, 195, 0.06), transparent);
		border: 1px solid rgba(0, 242, 195, 0.25);
		border-radius: 14px;
	}
	.full-film-eyebrow {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.78rem;
		letter-spacing: 0.32em;
		color: #00f2c3;
		margin-bottom: 0.8rem;
	}
	.full-film-eyebrow svg { width: 14px; height: 14px; }
</style>
