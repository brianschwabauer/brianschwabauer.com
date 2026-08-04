<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';
	import PlayFilm from '../primitives/PlayFilm.svelte';
	import { Video, type GalleryItem } from '@delightstack/components/media';
	import { ripple } from '@delightstack/utilities';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const reelImages = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-19_lawrence_high_school_film_festival-brian_and_kevin_in_front_of_theater.avif',
			width: 1365,
			height: 2048,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-19_lawrence_high_school_film_festival-brian_close_shot_in_front_of_theater.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_1.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_2.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_3.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-23_johnson_county_community_college_film_festival-brian_and_kevin_6.avif',
			width: 2048,
			height: 1365,
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-04-29_shawnee_mission_east_film_festival-kevin_and_brian_1.avif',
			width: 2048,
			height: 1365,
		},
	] satisfies GalleryItem[];

	const yardSaleImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-brian_leaves_shot_and_reveals_yard_sale_sign.avif',
			width: 480,
			height: 320,
			caption: 'The setup',
			alt: 'The setup',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-matthew_hides_in_stuff_animal_pile.avif',
			width: 480,
			height: 320,
			caption: 'The pile',
			alt: 'The pile',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-stop_action_animation_with_stuffed_animal.avif',
			width: 480,
			height: 320,
			caption: 'Stop-motion stuffed animals',
			alt: 'Stop-motion stuffed animals',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-stop_action_all_animals_moving.avif',
			width: 480,
			height: 320,
			caption: 'All 20+ at once',
			alt: 'All 20+ at once',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-animals_attack_from_behind.avif',
			width: 480,
			height: 320,
			caption: 'Attack scene',
			alt: 'Attack scene',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-brian_runs_to_start_car.avif',
			width: 480,
			height: 320,
			caption: 'Run to the car',
			alt: 'Run to the car',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-hit_by_car.avif',
			width: 480,
			height: 320,
			caption: 'Hit-by-car effect, lifted from earlier',
			alt: 'Hit-by-car effect, lifted from earlier',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale-close_up_on_brian_as_animals_attack.avif',
			width: 480,
			height: 320,
			caption: 'The penguin gets the last peck',
			alt: 'The penguin gets the last peck',
		},
	];

	const liveBroadcastImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-intro_animation.avif',
			width: 720,
			height: 480,
			caption: 'Custom intro animation',
			alt: 'Custom intro animation',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-commentators.avif',
			width: 720,
			height: 480,
			caption: 'The booth',
			alt: 'The booth',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-replay_animation.avif',
			width: 720,
			height: 480,
			caption: 'Instant replay',
			alt: 'Instant replay',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-sideline-reporter.avif',
			width: 720,
			height: 480,
			caption: 'Sideline reporter',
			alt: 'Sideline reporter',
		},
	];

	const blockPartyImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_001.jpg',
			caption: 'Block Party · live show #1',
			alt: 'Block Party · live show #1',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_002.jpg',
			caption: 'Block Party · live show #2',
			alt: 'Block Party · live show #2',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_003.jpg',
			caption: 'Block Party · live show #3',
			alt: 'Block Party · live show #3',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_004.jpg',
			caption: 'Block Party · live show #4',
			alt: 'Block Party · live show #4',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_005.jpg',
			caption: 'Block Party · live show #5',
			alt: 'Block Party · live show #5',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party_live_show_007.jpg',
			caption: 'Block Party · live show #6',
			alt: 'Block Party · live show #6',
		},
	];

	let reelGallery = $state<ReturnType<typeof LightboxGallery>>();

	/*
	 * Standalone clickable LazyMedias + play triggers in document order.
	 *
	 * Every film that has room to *be* a film now plays where it sits — the
	 * broadcast opener inside the rig, the Block Party sources on the switcher,
	 * the last two shorts in their own columns. What's left in here is the
	 * handful of things that are still a poster or a screenshot beside some copy.
	 *
	 * 0: Yard Sale
	 * 1: Austin Fender
	 * 2: KSMS site cr-card LazyMedia
	 * 3: Flash Video Game cr-card LazyMedia
	 * 4: Hall View cr-card LazyMedia
	 */
	const sectionExtras: GalleryItem[] = [
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2009-03-22_yard_sale/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Yard Sale (2009) — the stuffed-animal short',
			alt: 'Yard Sale (2009) — the stuffed-animal short',
		},
		{
			type: 'video',
			src: 'https://cdn.brianschwabauer.com/media/2008-03-19_austin_fender/master.m3u8',
			poster: 'https://cdn.brianschwabauer.com/media/2008-03-19_austin_fender/poster.jpg',
			width: 720,
			height: 480,
			caption: 'Austin Fender (2008)',
			alt: 'Austin Fender (2008)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-07-30_ksms_flash_website_large_version_screen_recording-main_menu.avif',
			width: 1080,
			height: 808,
			caption: 'The KSMS website (Flash version)',
			alt: 'KSMS Flash site (later version)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-01-01_scott_hirons_experience_flash_game_screen_recording-gameplay.avif',
			width: 1078,
			height: 720,
			caption: 'Flash Video Game',
			alt: 'Flash Video Game — gameplay',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2010-08-18_ksms_hallview_full_page_screen_recording.avif',
			width: 1000,
			height: 748,
			caption: 'KSMS Hall View — school panorama viewer',
			alt: 'KSMS Hall View screen recording',
		},
	];
	let extrasGallery = $state<ReturnType<typeof LightboxGallery>>();

	/*
	 * The laurel branch, as a film festival actually prints it: a stem that bows
	 * outward and leaves that fan up toward the top of the wreath. Placed from a
	 * table rather than a formula so the leaf sizes can swell through the middle
	 * of the branch the way a real one does — an evenly-stepped fan reads as a
	 * generated starburst, which is the one thing this shape must not look like.
	 */
	const LEAVES = [
		{ x: 30, y: 16, a: 58, rx: 6 },
		{ x: 22, y: 30, a: 50, rx: 7.6 },
		{ x: 16, y: 44, a: 40, rx: 8.8 },
		{ x: 13, y: 58, a: 28, rx: 9.2 },
		{ x: 13, y: 72, a: 14, rx: 8.6 },
		{ x: 17, y: 86, a: -2, rx: 7.4 },
		{ x: 25, y: 98, a: -18, rx: 5.8 },
	];

	/* The chain, in the order the signal actually walked it. */
	const RIG = [
		{ icon: 'camera', name: 'Cameras', note: '2–3 of them' },
		{ icon: 'switcher', name: 'Switcher', note: 'push a button to cut' },
		{ icon: 'deck', name: 'Tape decks', note: 'one per camera' },
		{ icon: 'converter', name: 'A/D', note: 'analog out, digital in' },
		{ icon: 'laptop', name: 'Laptop', note: 'to a streaming service' },
	];

	/*
	 * The rig ends in the thing it was for. Pressing GO LIVE walks a pulse down
	 * the chain and only *then* rolls the tape — the point of the diagram is that
	 * the picture had to travel through all five boxes before anyone at home saw
	 * it, and you feel that in the second it takes to arrive.
	 */
	let rig_player = $state<HTMLVideoElement>();
	let firing = $state(false);
	let armed = $state(false);
	let on_air = $state(false);

	/** 4 cables × 150ms apart, each 380ms long. */
	const TRAVEL = 4 * 150 + 380;

	function goLive() {
		if (armed) return;
		armed = true;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			rig_player?.play();
			return;
		}
		firing = true;
		setTimeout(() => {
			firing = false;
			rig_player?.play();
		}, TRAVEL);
	}

	/*
	 * The Block Party sources, on a bus. Three films from one night is three
	 * inputs on a switcher, not three posters in a row — so the monitor holds
	 * still and the buttons under it change what's on it, which is exactly the
	 * box we ran the show through.
	 */
	const SOURCES = [
		{
			label: 'Trailer',
			title: 'Block Party trailer (2011)',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-15_block_party_trailer/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-15_block_party_trailer/poster.jpg',
		},
		{
			label: 'Full show',
			title: 'KSMS Block Party (2011) — full live show',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-14_ksms_block_party/poster.jpg',
		},
		{
			label: 'Promo',
			title: 'This is KSMS — trick-shot promo (2011)',
			src: 'https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms_basketball_shot/master.m3u8',
			poster:
				'https://cdn.brianschwabauer.com/media/2011-04-14_this_is_ksms_basketball_shot/poster.jpg',
		},
	];

	let source = $state(0);
	let cutting = $state(false);
	let cut_timer: ReturnType<typeof setTimeout>;

	function cutTo(i: number) {
		if (i === source) return;
		source = i;
		// A hard cut, not a dissolve: the flash covers the frame the new player
		// spends painting its poster, which is the same thing the real switcher's
		// vertical-interval cut was hiding.
		cutting = true;
		clearTimeout(cut_timer);
		cut_timer = setTimeout(() => (cutting = false), 170);
	}
</script>

{#snippet laurel()}
	<svg class="laurel" viewBox="0 0 46 110" aria-hidden="true">
		<path
			class="stem"
			d="M40 5 C18 25 8 52 12 76 C15 93 25 103 40 105"
			fill="none"
			stroke="currentColor"
			stroke-width="2.4"
			stroke-linecap="round" />
		{#each LEAVES as leaf (leaf.y)}
			<ellipse
				cx={leaf.x - leaf.rx}
				cy={leaf.y}
				rx={leaf.rx}
				ry={leaf.rx * 0.38}
				fill="currentColor"
				transform="rotate({leaf.a} {leaf.x} {leaf.y})" />
		{/each}
	</svg>
{/snippet}

{#snippet rigIcon(kind: string)}
	<svg
		viewBox="0 0 26 24"
		aria-hidden="true"
		fill="none"
		stroke="currentColor"
		stroke-width="1.4"
		stroke-linejoin="round">
		{#if kind === 'camera'}
			<rect x="3.5" y="7" width="13" height="10" rx="1.5" />
			<path d="M16.5 10.5 L22.5 7.5 v9 l-6 -3 z" />
			<rect x="6" y="4" width="4" height="3" rx="0.8" />
			<circle cx="13.5" cy="10" r="0.9" fill="currentColor" stroke="none" />
		{:else if kind === 'switcher'}
			<rect x="2" y="5" width="22" height="14" rx="1.5" />
			<rect x="5" y="8" width="3" height="3" rx="0.6" />
			<rect x="9.5" y="8" width="3" height="3" rx="0.6" />
			<rect x="14" y="8" width="3" height="3" rx="0.6" />
			<rect x="18.5" y="8" width="3" height="3" rx="0.6" />
			<path d="M5 15.5 h16" stroke-linecap="round" />
			<rect
				x="9"
				y="13.8"
				width="3"
				height="3.4"
				rx="0.9"
				fill="currentColor"
				stroke="none" />
		{:else if kind === 'deck'}
			<rect x="2" y="5" width="22" height="14" rx="1.5" />
			<circle cx="9" cy="12.5" r="3.2" />
			<circle cx="17" cy="12.5" r="3.2" />
			<circle cx="9" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
			<circle cx="17" cy="12.5" r="0.8" fill="currentColor" stroke="none" />
			<path d="M9 9.3 h8" stroke-linecap="round" />
		{:else if kind === 'converter'}
			<rect x="2" y="6" width="22" height="12" rx="1.5" />
			<path d="M4.6 12 q1.7 -3.8 3.4 0 t3.4 0" stroke-linecap="round" />
			<path d="M14 15.5 V10.5 H16.4 V15.5 H18.8 V10.5 H21.2" stroke-linecap="round" />
		{:else}
			<rect x="4" y="5" width="18" height="11" rx="1.4" />
			<path d="M1.5 19 h23 l-2 -3 h-19 z" />
		{/if}
	</svg>
{/snippet}

<SectionShell id="festivals-ksms" year="2011" label="Festivals & KSMS" theme="broadcast">
	<div class="container">
		<!--
		  The year and the count are one lockup, running the full width the film
		  strip below runs. They are the same fact said two ways — this is the year
		  the festival run peaked, and here is what the run was worth — so putting
		  them in one row lets the reader take both in a single look instead of
		  meeting a stat block floating on its own beneath the chapter title.
		-->
		<div class="masthead">
			<Reveal>
				<YearMark year="2011" subtitle="Festivals · KSMS · Live TV" color="#ff3a3a" />
			</Reveal>
			<Reveal variant="left" delay={120}>
				<div class="awards">
					<div class="wreath">
						{@render laurel()}
						<div class="count">
							<span class="num">
								<span class="digits">20</span>
								<span class="plus">+</span>
							</span>
							<span class="won">awards won</span>
							<span class="where">at film festivals · 2008–2011</span>
						</div>
						<span class="mirror">{@render laurel()}</span>
					</div>
					<p class="brag">Kevin and I submitted everything, everywhere, every year.</p>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up" delay={100}>
			<FilmReel
				images={reelImages}
				height={170}
				speed={50}
				onframeclick={({ index, element }) => reelGallery?.open(index, element)} />
		</Reveal>

		<!-- Copy pinned, stills scrolling past it — the same shape the other film
		     with two months of photographs behind it gets. -->
		<div class="yard-sale">
			<div class="copy">
				<Reveal>
					<h3 class="sub">Yard Sale (2009) — the one I was most proud of</h3>
					<p>
						Almost no dialogue. A guy holds a yard sale and tries to get rid of his
						stuffed animals. The stuffed animals come to life. They are not pleased. He
						flees. They chase. The film ends with an inflatable penguin pecking him on the
						face and a cut to black.
					</p>
					<p>
						Some shots used stop-motion. Some used hidden puppeting. I tried to mix them
						in a way you couldn't tell. In the climax, twenty-plus animals all stop-motion
						together. The shot took so long that a nearby tree's shadow moves across the
						screen faster than the animals do. I still laugh at that.
					</p>
					<PlayFilm
						label="Play the short"
						title="Yard Sale (2009) — the stuffed-animal short"
						meta="2009"
						color="#ff3a3a"
						onclick={(e) => extrasGallery?.open(0, e.currentTarget)} />
				</Reveal>
			</div>
			<div class="media">
				<Reveal variant="up" delay={120}>
					<div class="gallery-contained">
						<LightboxGallery
							key="festivals-yard-sale"
							items={yardSaleImages}
							display="masonry"
							size="1" />
					</div>
				</Reveal>
			</div>
		</div>

		<div class="ksms-block">
			<Reveal>
				<div class="ksms-eyebrow">[ KSMS · THE VOICE OF SHAWNEE MISSION SOUTH ]</div>
				<h3 class="ksms-title">
					Inside the
					<br />
					<span class="ksms-grad">control room.</span>
				</h3>
				<p class="lede">
					KSMS was my high school's broadcast journalism program. We made news packages,
					sports features, comedy sketches — everything.
				</p>
			</Reveal>

			<!-- The three things I built around the broadcast rather than for it. -->
			<div class="control-room">
				<Reveal variant="up" delay={80}>
					<div class="cr-card">
						<div class="cr-eyebrow">SITE</div>
						<h4>The KSMS website</h4>
						<p>
							I built two versions: an animated, interactive Flash version that won "Best
							Interactive Site" at a local competition, then a WordPress version once
							Flash started its slow death so future students could keep updating it.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-07-30_ksms_flash_website_large_version_screen_recording-main_menu.avif"
								alt="KSMS Flash site (later version)"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(2, e.currentTarget)} />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={140}>
					<div class="cr-card">
						<div class="cr-eyebrow">GAME</div>
						<h4>Flash Video Game</h4>
						<p>
							A Flash game where you play as a teacher defending the building from
							astronauts by shooting tennis balls. With actual scoring this time. The
							furthest I'd gotten on a complete game.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-01-01_scott_hirons_experience_flash_game_screen_recording-gameplay.avif"
								alt="Flash Video Game — gameplay"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(3, e.currentTarget)} />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={200}>
					<div class="cr-card">
						<div class="cr-eyebrow">EXPERIMENT</div>
						<h4>"Hall View"</h4>
						<p>
							Google Street View, but for our school. I walked around with a camera, shot
							360-stitched panoramas at every hallway junction, then built a minimap-based
							viewer so you could click a dot to "stand" at that point. QuickTime did the
							actual panorama rendering.
						</p>
						<div class="cr-media">
							<LazyMedia
								src="https://cdn.brianschwabauer.com/media/2010-08-18_ksms_hallview_full_page_screen_recording.avif"
								alt="KSMS Hall View screen recording"
								ratio="4 / 3"
								onclick={(e) => extrasGallery?.open(4, e.currentTarget)} />
						</div>
					</div>
				</Reveal>
			</div>

			<div class="live-broadcast">
				<Reveal>
					<h4 class="lb-title">LIVE · The KSMS sports broadcast rig</h4>
					<p>
						Probably my favorite KSMS memory. We brought live broadcasts to our sports
						events — before YouTube had livestreams. I wired a row of cameras into an
						analog video switcher, ran that into an analog-to-digital converter, and
						pushed the output through some random live streaming service.
					</p>
					<p>
						Each camera also fed a tape deck that recorded its input to a DV tape — that
						was our "instant replay" rig. When something happened we wanted to replay,
						we'd rewind, hit play on the deck, and switch the live broadcast to that
						input. Sometimes it worked. When it worked, it felt like magic.
					</p>
				</Reveal>

				<Reveal variant="up" delay={120}>
					<div class="rack" class:firing class:live={on_air}>
						<div class="rack-head">
							<span class="rack-title">Signal path</span>
							<span class="rack-sub">gym floor → the internet</span>
						</div>

						<ol class="chain">
							{#each RIG as node, i (node.name)}
								<li style:--i={i}>
									<span class="icon">{@render rigIcon(node.icon)}</span>
									<span class="name">{node.name}</span>
									<span class="note">{node.note}</span>
								</li>
							{/each}
						</ol>

						<div class="program">
							<div class="program-head">
								<span class="tally" class:on={on_air}></span>
								<span class="program-label">{on_air ? 'On air' : 'Program'}</span>
								<span class="program-src">basketball vs SM-NW · 2011</span>
								{#if !armed}
									<button class="golive" onclick={goLive} {@attach ripple()}>
										Go live
									</button>
								{/if}
							</div>
							<div class="screen">
								<Video
									bind:player={rig_player}
									src="https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-broadcast_beginning_clip/master.m3u8"
									poster="https://cdn.brianschwabauer.com/media/2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-broadcast_beginning_clip/poster.jpg"
									title="KSMS live broadcast · basketball vs SM-NW (2011)"
									aspect_ratio="16 / 9"
									preload="none"
									onplay={() => {
										armed = true;
										on_air = true;
									}}
									onpause={() => (on_air = false)}
									onended={() => (on_air = false)} />
							</div>
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={150}>
					<div class="booth">
						<div class="gallery-contained">
							<LightboxGallery
								key="festivals-live-broadcast"
								items={liveBroadcastImages}
								display="masonry"
								size="1" />
						</div>
					</div>
				</Reveal>
			</div>

			<div class="block-party">
				<div class="copy">
					<Reveal>
						<h4 class="lb-title">KSMS Block Party — the senior-year finale</h4>
						<p>
							A live, SNL-style variety show in our school auditorium. Months of
							preparation. A full live audience. Multi-camera coverage. Pre-recorded
							sketches. Stand-up. Improv. A live band. A custom motion-graphics package.
							Everything KSMS had taught us, in one night.
						</p>
						<aside class="promo-note">
							<div class="note-eyebrow">PROMO · "THIS IS KSMS"</div>
							<p>
								To promote it I made a trick-shot commercial: a member of KSMS hits a
								basketball from an absurd distance. (Yes, the make is a VFX trick.) It got
								people talking — and it's the third camera source in the switcher demo.
							</p>
						</aside>
					</Reveal>
				</div>

				<div class="media">
					<Reveal variant="up" delay={100}>
						<div class="switcher" class:cutting>
							<div class="screen">
								{#key source}
									<Video
										src={SOURCES[source].src}
										poster={SOURCES[source].poster}
										title={SOURCES[source].title}
										aspect_ratio="1.35"
										preload="none" />
								{/key}
								<span class="flash" aria-hidden="true"></span>
							</div>
							<div class="bus">
								<span class="bus-label">Source</span>
								<div class="keys">
									{#each SOURCES as s, i (s.label)}
										<button
											class="key"
											class:live={i === source}
											aria-pressed={i === source}
											onclick={() => cutTo(i)}
											{@attach ripple()}>
											<span class="lamp"></span>
											<span class="key-label">{s.label}</span>
											<span class="key-num">{i + 1}</span>
										</button>
									{/each}
								</div>
							</div>
						</div>
					</Reveal>

					<Reveal variant="up" delay={150}>
						<div class="bp-stills">
							<div class="gallery-contained">
								<PeekGallery
									key="festivals-block-party"
									items={blockPartyImages}
									peek={6}
									size="0" />
							</div>
						</div>
					</Reveal>
				</div>
			</div>
		</div>

		<!-- The two that close the chapter, side by side because they're the same
		     size of thing: one film each, playing where it sits. -->
		<div class="two-films">
			<div class="film">
				<Reveal>
					<h4 class="lb-title">A MidWestSide Story (2010)</h4>
					<p>
						A parody short film for KSMS about life in the midwest. Just a fun one with
						Kevin and a handful of KSMS regulars. We made this as part of "KSMSmas" where
						we each made fun films around Christmas time - for no reason other than to
						make each other laugh.
					</p>
				</Reveal>
				<Reveal variant="up" delay={120}>
					<div class="screen">
						<Video
							src="https://cdn.brianschwabauer.com/media/2010-03-20_a_midwestside_story/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2010-03-20_a_midwestside_story/poster.jpg"
							title="A MidWestSide Story (2010)"
							aspect_ratio="16 / 9"
							preload="none" />
					</div>
				</Reveal>
			</div>

			<div class="film">
				<Reveal>
					<h4 class="lb-title">Long Time No See (2011)</h4>
					<p>
						Kevin and I were headed to different colleges, so we made what we thought was
						our last film together that summer. A fish-out-of-water comedy about a guy
						meeting his foreign-raised long-lost brother. Lighter on effects, heavier on
						story. Our best storytelling at that point.
					</p>
				</Reveal>
				<Reveal variant="up" delay={160}>
					<div class="screen">
						<Video
							src="https://cdn.brianschwabauer.com/media/2011-08-28_long_time_no_see/master.m3u8"
							poster="https://cdn.brianschwabauer.com/media/2011-08-28_long_time_no_see/poster.jpg"
							title="Long Time No See (2011)"
							aspect_ratio="16 / 9"
							preload="none" />
					</div>
				</Reveal>
			</div>
		</div>
	</div>

	<LightboxGallery
		bind:this={reelGallery}
		key="festivals-reel"
		items={reelImages}
		autoplay_video />

	<LightboxGallery
		bind:this={extrasGallery}
		key="festivals-extras"
		items={sectionExtras}
		autoplay_video />
</SectionShell>

<style>
	/* The house lights on a festival stage, not the black between screenings. */
	:global([data-theme='broadcast']) {
		background:
			radial-gradient(
				ellipse 112% 68% at 50% 0%,
				oklch(0.4 0.115 30 / 0.45),
				transparent 62%
			),
			linear-gradient(
				180deg,
				oklch(0.185 0.058 26),
				oklch(0.235 0.085 22) 50%,
				oklch(0.15 0.052 18)
			);
		color: #fdebe5;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;

		--red: #ff3a3a;
		--gold: #ffb84d;
	}

	/*
	 * The year and the count share one row that runs the full width of the film
	 * strip below — which is the container, not the viewport. Bleeding it past
	 * the strip only swapped one misalignment for another: what the lockup was
	 * missing was an edge to end on, and the strip is that edge.
	 */
	.masthead {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: clamp(1.5rem, 5vw, 4rem);
	}
	.masthead > :global(.reveal:last-child) {
		justify-self: end;
	}

	.wreath {
		display: grid;
		grid-template-columns: auto auto auto;
		align-items: center;
		justify-content: center;
		gap: clamp(0.2rem, 1.4vw, 1rem);
	}
	.laurel {
		display: block;
		height: clamp(6.5rem, 13vw, 10rem);
		width: auto;
		color: oklch(from var(--red) l c h / 0.8);
	}
	/* One branch, drawn once, reflected — a hand-mirrored second path drifts out
	   of register with the first at every size. */
	.mirror {
		display: block;
		scale: -1 1;
	}
	.count {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding-block: 0.4rem;
	}
	.num {
		display: flex;
		align-items: flex-start;
		font-family: var(--font-mono);
		font-size: clamp(3.4rem, 8.5vw, 6.5rem);
		font-weight: 900;
		line-height: 0.82;
		letter-spacing: -0.03em;
		color: transparent;
		-webkit-text-stroke: 3px var(--red);
	}
	.plus {
		font-size: 0.4em;
		margin: 0.08em 0 0 0.05em;
		-webkit-text-stroke: 0;
		color: var(--red);
	}
	.won {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: clamp(0.78rem, 1.3vw, 1rem);
		letter-spacing: 0.26em;
		text-transform: uppercase;
	}
	.where {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		opacity: 0.6;
	}
	.brag {
		max-width: 24rem;
		margin: 1rem auto 0;
		text-align: center;
		font-size: 0.95rem;
		line-height: 1.5;
		opacity: 0.78;
	}

	@media (max-width: 900px) {
		.masthead {
			grid-template-columns: minmax(0, 1fr);
		}
		.masthead > :global(.reveal:last-child) {
			justify-self: start;
		}
	}

	.first-submission {
		--play-film-offset: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 1.1rem;
		margin-top: 1.75rem;
	}
	.fs-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		opacity: 0.55;
	}

	.sub {
		font-size: clamp(1.5rem, 2.6vw, 2.1rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}

	/* The two pinned-copy blocks. The prose column is capped at a readable
	   measure rather than taking a share of the width — on a wide monitor a 50%
	   text column is a wall, and the pictures deserve the extra pixels. */
	.yard-sale,
	.block-party {
		display: grid;
		grid-template-columns: minmax(0, 31rem) minmax(0, 1fr);
		gap: clamp(1.5rem, 4vw, 4rem);
		align-items: start;
	}
	.yard-sale {
		margin-block: clamp(3.5rem, 8vw, 6rem);
	}
	.block-party {
		margin-block: clamp(3rem, 6vw, 4.5rem);
	}
	.copy {
		position: sticky;
		top: max(6rem, 14vh);
	}
	.media {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		/* The galleries carry their own @container context; without a min of 0 a
		   masonry child's intrinsic width can blow the grid track out. */
		min-width: 0;
	}
	@media (max-width: 900px) {
		.yard-sale,
		.block-party {
			grid-template-columns: minmax(0, 1fr);
		}
		.copy {
			position: static;
		}
	}

	.yard-sale p,
	.ksms-block p {
		max-width: 56rem;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.ksms-block {
		margin: 5rem 0;
	}
	.ksms-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: var(--red);
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
		color: oklch(from #ff5a2a 0.82 calc(c * 0.9) h);
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
		.control-room {
			grid-template-columns: 1fr;
		}
	}
	.cr-card {
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		padding: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition:
			border-color 200ms ease,
			transform 200ms ease;
	}
	.cr-card:hover {
		transition-duration: 0s;
		border-color: oklch(from var(--red) l c h / 0.4);
		transform: translateY(-3px);
	}
	.cr-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		color: var(--red);
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
	/* A tally lamp, not a status indicator: dark until the rig is actually
	   pushing a picture, then steady. Blinking would be decoration. */
	.tally {
		flex: none;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: oklch(from var(--red) calc(l * 0.42) calc(c * 0.55) h);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
		transition:
			background 260ms ease,
			box-shadow 260ms ease;
	}
	.tally.on {
		background: var(--red);
		box-shadow:
			inset 0 0 0 1px oklch(from var(--red) 0.95 c h / 0.6),
			0 0 14px oklch(from var(--red) l c h / 0.75);
	}

	/*
	 * The rack.
	 *
	 * Five boxes and the wire between them, drawn the way the diagram taped
	 * inside a road case is drawn — mono labels, hairline rules, no colour except
	 * on the signal itself. Pressing GO LIVE sends a pulse down the chain and the
	 * monitor only rolls once it arrives, so the wait *is* the explanation.
	 */
	.rack {
		--wire: rgba(255, 255, 255, 0.16);
		--hot: var(--red);
		--cable: clamp(0.9rem, 3vw, 2.4rem);
		margin: 2rem 0;
		padding: clamp(1rem, 2.5vw, 1.6rem);
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.32));
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 12px;
	}
	.rack.live {
		--wire: oklch(from var(--red) l c h / 0.55);
	}
	.rack-head {
		display: flex;
		align-items: baseline;
		gap: 0.7rem;
		font-family: var(--font-mono);
		padding-bottom: 0.9rem;
		margin-bottom: 1.2rem;
		border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
	}
	.rack-title {
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.rack-sub {
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		opacity: 0.5;
	}

	.chain {
		display: flex;
		align-items: flex-start;
		gap: var(--cable);
		list-style: none;
		margin: 0;
		padding: 0;
		font-family: var(--font-mono);
	}
	.chain li {
		position: relative;
		flex: 1 1 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-align: center;
	}
	.chain .icon {
		display: grid;
		place-items: center;
		width: 100%;
		height: 3rem;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.03);
		color: #ffd9cf;
	}
	.chain .icon :global(svg) {
		width: 34px;
		height: auto;
	}
	.chain .name {
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.chain .note {
		font-size: 0.66rem;
		line-height: 1.35;
		opacity: 0.55;
	}
	/*
	 * The cable. One pseudo-element carrying two layers: the dashed wire itself,
	 * and a single bright dot parked off its left end. Firing just slides the dot
	 * layer across, which is the cheapest possible way to say "the picture went
	 * this way" — no extra DOM, no per-frame JS.
	 */
	.chain li:not(:last-child)::after {
		content: '';
		position: absolute;
		left: 100%;
		top: 1.45rem;
		width: var(--cable);
		height: 2px;
		background:
			radial-gradient(circle at 50% 50%, var(--hot) 0 1.6px, transparent 2.6px) no-repeat,
			repeating-linear-gradient(90deg, var(--wire) 0 5px, transparent 5px 9px);
		background-size:
			14px 100%,
			auto;
		background-position:
			-16px 0,
			0 0;
		transition: background 260ms ease;
	}
	.rack.firing li:not(:last-child)::after {
		animation: travel 380ms linear calc(var(--i) * 150ms) both;
	}
	@keyframes travel {
		from {
			background-position:
				-16px 0,
				0 0;
		}
		to {
			background-position:
				calc(100% + 16px) 0,
				0 0;
		}
	}

	@media (max-width: 760px) {
		.chain {
			flex-direction: column;
			align-items: stretch;
			gap: var(--cable);
		}
		.chain li {
			flex-direction: row;
			align-items: center;
			text-align: left;
			gap: 0.8rem;
		}
		.chain .icon {
			width: 3.4rem;
			flex: none;
		}
		.chain li:not(:last-child)::after {
			left: 1.7rem;
			top: 100%;
			width: 2px;
			height: var(--cable);
			background:
				radial-gradient(circle at 50% 50%, var(--hot) 0 1.6px, transparent 2.6px)
					no-repeat,
				repeating-linear-gradient(180deg, var(--wire) 0 5px, transparent 5px 9px);
			background-size:
				100% 14px,
				auto;
			background-position:
				0 -16px,
				0 0;
		}
		/* A separately named animation rather than a second `travel` inside the
		   query: same-name keyframes resolving by document order is a subtlety to
		   rely on, and this costs nothing. */
		.rack.firing li:not(:last-child)::after {
			animation-name: travel-down;
		}
	}
	@keyframes travel-down {
		from {
			background-position:
				0 -16px,
				0 0;
		}
		to {
			background-position:
				0 calc(100% + 16px),
				0 0;
		}
	}

	.program {
		margin-top: clamp(1.4rem, 3vw, 2rem);
		max-width: 46rem;
		margin-inline: auto;
	}
	.program-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		margin-bottom: 0.6rem;
		/* Holds the row's height once GO LIVE is spent, so the monitor doesn't
		   hop up the instant you press the thing above it. */
		min-height: 2.2rem;
	}
	.program-label {
		font-size: 0.72rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		font-weight: 700;
	}
	.program-src {
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		opacity: 0.5;
	}
	.golive {
		margin-left: auto;
		position: relative;
		overflow: hidden;
		appearance: none;
		cursor: pointer;
		font: inherit;
		font-size: 0.7rem;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		font-weight: 700;
		color: #1a0605;
		background: var(--red);
		border: 0;
		border-radius: 999px;
		padding: 0.5rem 1.1rem;
		box-shadow: 0 3px 0 oklch(from var(--red) calc(l * 0.55) c h);
		transition:
			translate 180ms cubic-bezier(0.25, 1, 0.5, 1),
			box-shadow 180ms cubic-bezier(0.25, 1, 0.5, 1),
			background 260ms ease;
	}
	.golive:hover {
		transition-duration: 0s;
		background: oklch(from var(--red) calc(l * 1.12) c h);
	}
	.golive:active {
		translate: 0 3px;
		box-shadow: 0 0 0 oklch(from var(--red) calc(l * 0.55) c h);
	}
	.golive:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: 3px;
	}

	/* Every player in the section carries the same corners and lift, so a film
	   playing in place looks like the poster tile it replaced. */
	.screen {
		position: relative;
		border-radius: 12px;
		overflow: clip;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.35),
			0 2px 6px rgba(0, 0, 0, 0.25);
	}

	.booth {
		margin-top: clamp(1.6rem, 3vw, 2.4rem);
	}

	/* A note in a different voice from the section's narration, styled as a
	   broadcast lower-third: solid accent bar, angled trailing edge, and the
	   slug set as a name-strap on live TV. */
	.promo-note {
		margin-top: 1.6rem;
		padding: 0.9rem 2.6rem 0.9rem 1.1rem;
		border-left: 6px solid var(--gold);
		background: linear-gradient(
			90deg,
			oklch(from var(--gold) 0.72 c h / 0.16),
			oklch(from var(--gold) 0.72 c h / 0.04) 70%,
			transparent
		);
		clip-path: polygon(0 0, 100% 0, calc(100% - 1.4rem) 100%, 0 100%);
	}
	.note-eyebrow {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		font-weight: 700;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: oklch(from var(--gold) 0.24 c h);
		background: var(--gold);
		padding: 0.22rem 0.9rem 0.22rem 0.6rem;
		clip-path: polygon(0 0, 100% 0, calc(100% - 0.5rem) 100%, 0 100%);
		margin-bottom: 0.6rem;
	}
	.promo-note p {
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.55;
		opacity: 0.92;
	}

	/*
	 * The switcher.
	 *
	 * Three films from one night are three inputs, so they get one monitor and a
	 * source bus instead of three posters in a row: the frame never moves, only
	 * what's on it. The lamp on the live key is the same tally lamp the rig above
	 * uses, because on the night it was the same lamp.
	 */
	.switcher .screen {
		background: #000;
	}
	.flash {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: #fff;
		opacity: 0;
		transition: opacity 170ms cubic-bezier(0.11, 0, 0.5, 0);
	}
	.switcher.cutting .flash {
		opacity: 0.22;
		transition-duration: 0s;
	}
	.bus {
		display: grid;
		gap: 0.55rem;
		margin-top: 0.8rem;
		padding: 0.75rem 0.85rem 0.85rem;
		background: linear-gradient(180deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3));
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-radius: 10px;
	}
	.bus-label {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		opacity: 0.5;
	}
	.keys {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.5rem;
	}
	.key {
		position: relative;
		overflow: hidden;
		appearance: none;
		cursor: pointer;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.62rem 0.7rem;
		font-family: var(--font-mono);
		color: inherit;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.09),
			rgba(255, 255, 255, 0.03)
		);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 7px;
		box-shadow: 0 2px 0 rgba(0, 0, 0, 0.5);
		transition:
			background 260ms ease,
			border-color 260ms ease,
			translate 160ms cubic-bezier(0.25, 1, 0.5, 1),
			box-shadow 160ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	.key:hover {
		transition-duration: 0s;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.16),
			rgba(255, 255, 255, 0.06)
		);
		border-color: rgba(255, 255, 255, 0.24);
	}
	.key:active {
		translate: 0 2px;
		box-shadow: 0 0 0 rgba(0, 0, 0, 0.5);
	}
	.key:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: 2px;
	}
	.key.live {
		background: linear-gradient(
			180deg,
			oklch(from var(--red) l c h / 0.34),
			oklch(from var(--red) l c h / 0.14)
		);
		border-color: oklch(from var(--red) l c h / 0.7);
	}
	.lamp {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: oklch(from var(--red) calc(l * 0.4) calc(c * 0.5) h);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.16);
		transition:
			background 220ms ease,
			box-shadow 220ms ease;
	}
	.key.live .lamp {
		background: var(--red);
		box-shadow: 0 0 12px oklch(from var(--red) l c h / 0.85);
	}
	.key-label {
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.key-num {
		font-size: 0.62rem;
		opacity: 0.45;
	}
	@media (max-width: 520px) {
		.keys {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.bp-stills {
		max-width: 62rem;
	}

	.two-films {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: start;
		margin: 4rem 0;
	}
	.two-films p {
		line-height: 1.6;
		margin: 0 0 1.2rem;
	}
	@media (max-width: 768px) {
		.two-films {
			grid-template-columns: minmax(0, 1fr);
			gap: 2.5rem;
		}
	}
</style>
