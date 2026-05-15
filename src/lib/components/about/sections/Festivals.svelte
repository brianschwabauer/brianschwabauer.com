<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import VideoPlayer from '../primitives/VideoPlayer.svelte';
	import MediaGrid from '../primitives/MediaGrid.svelte';
	import Expandable from '../primitives/Expandable.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';

	let { signedIn = false }: { signedIn?: boolean } = $props();

	const festPhotos = [
		'2009-04-19_lawrence_high_school_film_festival-brian_and_kevin_in_front_of_theater.avif',
		'2009-04-19_lawrence_high_school_film_festival-brian_close_shot_in_front_of_theater.avif',
		'2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_1.avif',
		'2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_2.avif',
		'2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_3.avif',
		'2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_6.avif',
		'2009-04-29_shawnee_mission_east_film_festival-kevin_and_brian_1.avif'
	].map((src) => ({ src }));

	const yardSale = [
		{ src: '2009-03-22_yard_sale-brian_leaves_shot_and_reveals_yard_sale_sign.avif', caption: 'The setup' },
		{ src: '2009-03-22_yard_sale-matthew_hides_in_stuff_animal_pile.avif', caption: 'The pile' },
		{ src: '2009-03-22_yard_sale-stop_action_animation_with_stuffed_animal.avif', caption: 'Stop-motion stuffed animals' },
		{ src: '2009-03-22_yard_sale-stop_action_all_animals_moving.avif', caption: 'All 20+ at once' },
		{ src: '2009-03-22_yard_sale-animals_attack_from_behind.avif', caption: 'Attack scene' },
		{ src: '2009-03-22_yard_sale-brian_runs_to_start_car.avif', caption: 'Run to the car' },
		{ src: '2009-03-22_yard_sale-hit_by_car.avif', caption: 'Hit-by-car effect, lifted from earlier' },
		{ src: '2009-03-22_yard_sale-close_up_on_brian_as_animals_attack.avif', caption: 'The penguin gets the last peck' }
	];

	const liveBroadcastShots = [
		{ src: '2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-intro_animation.avif', caption: 'Custom intro animation' },
		{ src: '2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-commentators.avif', caption: 'The booth' },
		{ src: '2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-replay_animation.avif', caption: 'Instant replay' },
		{ src: '2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-sideline-reporter.avif', caption: 'Sideline reporter' }
	];

	const blockPartyPhotos = Array.from({ length: 7 }, (_, i) => ({
		src: `2011-04-14_ksms_block_party_live_show_${String(i + 1).padStart(3, '0')}.jpg`,
		caption: `Block Party · live show #${i + 1}`
	}));
</script>

<SectionShell id="festivals-ksms" year="2009-2011" label="Festivals & KSMS" theme="broadcast">
	<div class="container">
		<Reveal>
			<YearMark year="2009 – 2011" subtitle="Festivals · KSMS · Live TV" color="#ff3a3a" />
		</Reveal>

		<div class="award-banner">
			<Reveal>
				<div class="award-num">
					<span class="num-digit">20</span><span class="num-plus">+</span>
				</div>
				<div class="award-meta">
					<div class="award-title">awards won at film festivals in high school</div>
					<div class="award-sub">Kevin and I submitted everything, everywhere, every year.</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up" delay={100}>
			<FilmReel images={festPhotos} height={170} speed={50} />
		</Reveal>

		<div class="yard-sale">
			<Reveal>
				<h3 class="sub">Yard Sale (2009) — the one I was most proud of</h3>
				<p>
					Almost no dialogue. A guy holds a yard sale and tries to get rid of his stuffed animals. The stuffed
					animals come to life. They are not pleased. He flees. They chase. The film ends with an inflatable
					penguin pecking him on the face and a cut to black.
				</p>
				<p>
					Some shots used stop-motion. Some used hidden puppeting. I tried to mix them in a way you couldn't tell.
					In the climax, twenty-plus animals all stop-motion together. The shot took so long that a nearby tree's
					shadow moves across the screen faster than the animals do. I still laugh at that.
				</p>
			</Reveal>
			<Reveal variant="up" delay={120}>
				<MediaGrid items={yardSale} min={200} gap={6} ratio="16 / 9" captions={true} />
			</Reveal>
		</div>

		<div class="ksms-block">
			<Reveal>
				<div class="ksms-eyebrow">[ KSMS · THE VOICE OF SHAWNEE MISSION SOUTH ]</div>
				<h3 class="ksms-title">
					Inside the<br />
					<span class="ksms-grad">control room.</span>
				</h3>
				<p class="lede">
					KSMS was my high school's broadcast journalism program. We made the morning announcement show, news
					packages, sports features, comedy sketches — everything. Our teacher Mr. Hirons was supportive of every
					crazy idea we had, and we had a lot of them.
				</p>
			</Reveal>

			<div class="control-room">
				<Reveal variant="up" delay={80}>
					<div class="cr-card">
						<div class="cr-eyebrow">SITE</div>
						<h4>The KSMS website</h4>
						<p>I built two versions: an animated, interactive Flash version that won "Best Interactive Site"
							at a local competition, then a WordPress version once Flash started its slow death so future
							students could keep updating it.</p>
						<div class="cr-media">
							<LazyMedia src="2010-07-30_ksms_flash_website_large_version_screen_recording-main_menu.avif" alt="KSMS Flash site (later version)" ratio="4 / 3" />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={140}>
					<div class="cr-card">
						<div class="cr-eyebrow">GAME</div>
						<h4>"Scott Hirons Experience"</h4>
						<p>A Flash game where you play as Mr. Hirons defending the building from astronauts by shooting
							tennis balls. With actual scoring this time. The furthest I'd gotten on a complete game.</p>
						<div class="cr-media">
							<LazyMedia src="2010-01-01_scott_hirons_experience_flash_game_screen_recording-gameplay.avif" alt="Scott Hirons Experience gameplay" ratio="4 / 3" />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={200}>
					<div class="cr-card">
						<div class="cr-eyebrow">EXPERIMENT</div>
						<h4>"Hall View"</h4>
						<p>Google Street View, but for our school. I walked around with a camera, shot 360-stitched panoramas
							at every hallway junction, then built a minimap-based viewer so you could click a dot to "stand"
							at that point. QuickTime did the actual panorama rendering.</p>
						<div class="cr-media">
							<LazyMedia src="2010-08-18_ksms_hallview_full_page_screen_recording.avif" alt="KSMS Hall View screen recording" ratio="4 / 3" />
						</div>
					</div>
				</Reveal>
			</div>

			<div class="live-broadcast">
				<Reveal>
					<h4 class="lb-title">
						<span class="rec-pulse"></span> LIVE · The KSMS sports broadcast rig
					</h4>
					<p>
						Probably my favorite KSMS memory. We brought live broadcasts to our sports events — before YouTube
						had livestreams. I wired a row of cameras into an analog video switcher, ran that into an
						analog-to-digital converter, and pushed the output through some random live streaming service.
					</p>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<div class="rig-diagram">
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">📷</div>
							<div class="rig-label">Cameras</div>
							<div class="rig-sub">2–3 of them</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">🎚️</div>
							<div class="rig-label">Analog switcher</div>
							<div class="rig-sub">push button to cut</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">📼</div>
							<div class="rig-label">Tape decks</div>
							<div class="rig-sub">poor man's instant replay</div>
						</div>
						<div class="rig-arrow">→</div>
						<div class="rig-node">
							<div class="rig-icon" aria-hidden="true">💻</div>
							<div class="rig-label">A/D → laptop</div>
							<div class="rig-sub">→ random streaming service</div>
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={150}>
					<MediaGrid items={liveBroadcastShots} min={220} gap={6} ratio="16 / 9" captions={true} />
				</Reveal>

				<p class="aside">
					The tape decks were our "instant replay" rig. Each camera also fed a tape deck that recorded its input
					to a DV tape. When something happened we wanted to replay, we'd rewind, hit play on the deck, and
					switch the live broadcast to that input. Sometimes it worked. When it worked, it felt like magic.
				</p>
			</div>

			<div class="block-party">
				<Reveal>
					<h4 class="lb-title">KSMS Block Party — the senior-year finale</h4>
					<p>
						A live, SNL-style variety show in our school auditorium. Months of preparation. A full live audience.
						Multi-camera coverage. Pre-recorded sketches. Stand-up. Improv. A live band. A custom motion-graphics
						package. Everything KSMS had taught us, in one night.
					</p>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<MediaGrid items={blockPartyPhotos} min={200} gap={6} ratio="4 / 3" captions={true} />
				</Reveal>

				<Reveal variant="up" delay={150}>
					<div class="trick-shot">
						<div class="ts-info">
							<div class="ts-eyebrow">PROMO · "This is KSMS"</div>
							<p>
								To promote Block Party I made a trick-shot commercial: a member of KSMS hits a basketball from
								an absurd distance. (Yes, the make is a VFX trick.) It got people talking.
							</p>
						</div>
						<LazyMedia
							src="2011-04-14_this_is_ksms-basketball_trick_shot_with_vfx.avif"
							alt="The KSMS trick shot"
							ratio="16 / 9"
						/>
					</div>
				</Reveal>
			</div>
		</div>

		<Reveal>
			<Expandable label="One last festival film before college — Long Time No See">
				<div class="prose">
					<p>
						Kevin and I were headed to different colleges, so we made one last film together that summer —
						<strong>Long Time No See</strong> (2011). A fish-out-of-water comedy about a guy meeting his
						foreign-raised long-lost brother. Lighter on effects, heavier on story. Our best storytelling at
						that point.
					</p>
					{#if signedIn}
						<VideoPlayer slug="2011-08-28_long_time_no_see" title="Long Time No See (2011)" />
					{/if}
				</div>
			</Expandable>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='broadcast']) {
		background:
			linear-gradient(180deg, #0c0808 0%, #160c0c 50%, #0a0606 100%);
		color: #fdebe5;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}

	.award-banner {
		display: flex;
		justify-content: center;
		margin: 3rem 0;
	}
	.award-banner > :global(.reveal) {
		display: flex;
		align-items: baseline;
		gap: 2rem;
		padding: 1.6rem 2.2rem;
		background: linear-gradient(135deg, rgba(255, 58, 58, 0.12), transparent);
		border-left: 4px solid #ff3a3a;
		border-radius: 0 12px 12px 0;
	}
	.award-num {
		display: flex;
		align-items: baseline;
	}
	.num-digit {
		font-size: clamp(4rem, 12vw, 8rem);
		font-weight: 900;
		line-height: 0.85;
		color: transparent;
		-webkit-text-stroke: 3px #ff3a3a;
		font-family: var(--font-mono);
	}
	.num-plus {
		font-size: clamp(2rem, 5vw, 4rem);
		font-weight: 800;
		color: #ff3a3a;
		font-family: var(--font-mono);
		margin-left: 0.2rem;
	}
	.award-title {
		font-size: clamp(1.1rem, 2vw, 1.5rem);
		font-weight: 700;
		max-width: 26rem;
		line-height: 1.3;
	}
	.award-sub {
		font-size: 0.95rem;
		opacity: 0.75;
		margin-top: 0.4rem;
	}

	.yard-sale, .ksms-block {
		margin: 5rem 0;
	}
	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}
	.yard-sale p, .ksms-block p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.ksms-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff3a3a;
		margin: 4rem 0 1rem;
	}
	.ksms-title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.ksms-grad {
		background: linear-gradient(90deg, #ff3a3a, #ffb84d);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
	}

	.control-room {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
		margin: 2.5rem 0;
	}
	@media (max-width: 900px) {
		.control-room { grid-template-columns: 1fr; }
	}
	.cr-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition: border-color 200ms ease, transform 200ms ease;
	}
	.cr-card:hover {
		border-color: rgba(255, 58, 58, 0.4);
		transform: translateY(-3px);
	}
	.cr-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		color: #ff3a3a;
	}
	.cr-card h4 {
		font-size: 1.2rem;
		font-weight: 800;
		margin: 0;
	}
	.cr-card p {
		font-size: 0.95rem;
		line-height: 1.5;
		opacity: 0.85;
		max-width: none;
		margin: 0;
	}
	.cr-media {
		margin-top: 0.5rem;
	}

	.live-broadcast {
		margin: 4rem 0;
	}
	.lb-title {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: clamp(1.4rem, 2.2vw, 1.8rem);
		font-weight: 800;
		margin: 0 0 0.5rem;
	}
	.rec-pulse {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: #ff3a3a;
		box-shadow: 0 0 12px #ff3a3a;
		animation: rec 1.4s ease-in-out infinite;
	}
	@keyframes rec {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.4; }
	}

	.rig-diagram {
		display: grid;
		grid-template-columns: repeat(7, auto);
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		padding: 1.6rem;
		background: rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 10px;
		margin: 1.5rem 0;
		overflow-x: auto;
		font-family: var(--font-mono);
	}
	@media (max-width: 768px) {
		.rig-diagram { grid-template-columns: 1fr; }
		.rig-arrow { transform: rotate(90deg); justify-self: center; }
	}
	.rig-node {
		text-align: center;
		min-width: 110px;
	}
	.rig-icon {
		font-size: 1.6rem;
	}
	.rig-label {
		font-weight: 700;
		font-size: 0.85rem;
		margin-top: 0.2rem;
	}
	.rig-sub {
		font-size: 0.7rem;
		opacity: 0.6;
		margin-top: 0.1rem;
	}
	.rig-arrow {
		color: #ff3a3a;
		font-size: 1.4rem;
		font-weight: 800;
	}

	.aside {
		padding: 1rem 1.2rem;
		background: rgba(255, 58, 58, 0.06);
		border-left: 3px solid #ff3a3a;
		border-radius: 0 8px 8px 0;
		font-style: italic;
		margin: 1.5rem 0;
	}

	.block-party {
		margin: 4rem 0;
	}

	.trick-shot {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		gap: clamp(1rem, 3vw, 2rem);
		align-items: center;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.03);
		border-radius: 10px;
		margin-top: 2rem;
	}
	@media (max-width: 768px) {
		.trick-shot { grid-template-columns: 1fr; }
	}
	.ts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffb84d;
		margin-bottom: 0.5rem;
	}
	.ts-info p { line-height: 1.55; }

	.prose p { line-height: 1.65; margin-bottom: 1rem; }
	.prose strong { color: #ffb84d; }
</style>
