<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import PeekGallery from '../primitives/PeekGallery.svelte';
	import FilmReel from '../primitives/FilmReel.svelte';
	import { type GalleryItem } from '@delightstack/components/media';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';

	const pr1ReelImages = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-power_rangers_start_the_morphin_time.avif',
			width: 352,
			height: 240,
			caption: 'Morphin time',
			alt: 'Morphin time',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-amanda_morphs_on_green_screen_graphic.avif',
			width: 352,
			height: 240,
			caption: 'Amanda morphs (greenscreen graphic)',
			alt: 'Amanda morphs (greenscreen graphic)',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-brian_morphs_on_green_screen_graphic.avif',
			width: 352,
			height: 240,
			caption: 'Brian morphs',
			alt: 'Brian morphs',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-emma_morphs_on_green_screen_graphic.avif',
			width: 352,
			height: 240,
			caption: 'Emma morphs',
			alt: 'Emma morphs',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-kevin_morphs_on_green_screen_graphic.avif',
			width: 352,
			height: 240,
			caption: 'Kevin morphs',
			alt: 'Kevin morphs',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-brian_and_kevin_sword_fight.avif',
			width: 352,
			height: 240,
			caption: 'Red vs Blue, the duel',
			alt: 'Red vs Blue, the duel',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-vino_kicks_brian_in_360_move.avif',
			width: 352,
			height: 240,
			caption: 'Vino lands the "360"',
			alt: 'Vino lands the "360"',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-vino_summons_fallen_broom_stick_reversed_footage_visual_effect.avif',
			width: 352,
			height: 240,
			caption: 'Reversed-footage summoning',
			alt: 'Reversed-footage summoning',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-vino_disappears_visual_effect.avif',
			width: 352,
			height: 240,
			caption: 'Vino vanishes',
			alt: 'Vino vanishes',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-07-26_power_rangers_360-brian_pulls_out_knife.avif',
			width: 352,
			height: 240,
			caption: 'The final duel begins',
			alt: 'The final duel begins',
		},
	] satisfies GalleryItem[];

	const pr2BTSImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_03-clapper.avif',
			width: 480,
			height: 320,
			caption: 'A real clapper this time',
			alt: 'A real clapper this time',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_01.avif',
			width: 480,
			height: 320,
			caption: 'On set, take whatever',
			alt: 'On set, take whatever',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_02.avif',
			width: 480,
			height: 320,
			caption: 'Stunt prep',
			alt: 'Stunt prep',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_filming_a_dog.avif',
			width: 480,
			height: 320,
			caption: 'Yes, Zordon was played by a dog',
			alt: 'Yes, Zordon was played by a dog',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_green_screen_super_hero.avif',
			width: 480,
			height: 320,
			caption: 'Flight comp, greenscreen',
			alt: 'Flight comp, greenscreen',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-behind_the_scenes_set_clip_04.avif',
			width: 480,
			height: 320,
			caption: 'More set life',
			alt: 'More set life',
		},
		// The premiere is behind-the-scenes too — it's the night the shoot became
		// a screening, which is the only reason any of the rest of it happened.
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-09_power_rangers_360_ii-premiere-backyward_projector_setup.avif',
			width: 1536,
			height: 2048,
			caption: 'Premiere night · the backyard projector setup',
			alt: 'The PR360 II premiere projector setup',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-09_power_rangers_360_ii-premiere-brian_and_kevin_1.jpg',
			width: 1024,
			height: 1536,
			caption: 'Brian and Kevin at the PR360 II premiere',
			alt: 'Brian and Kevin at the PR360 II premiere',
		},
	];

	const pr2StillImages: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-all_power_rangers_charge_towards_bad_guys.avif',
			width: 480,
			height: 320,
			caption: 'The charge',
			alt: 'The charge',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-all_power_rangers_pull_out_their_knifes.avif',
			width: 480,
			height: 320,
			caption: 'Blades out',
			alt: 'Blades out',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-brian_and_grant_fight_with_swords.avif',
			width: 480,
			height: 320,
			caption: 'Red vs henchman',
			alt: 'Red vs henchman',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-brian_flies_towards_camera_using_green_screen_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Flight, greenscreen',
			alt: 'Flight, greenscreen',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-brian_flies_through_clouds_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Through the clouds',
			alt: 'Through the clouds',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-vino_appears_by_tree_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Vino, back from "the dead"',
			alt: 'Vino, back from "the dead"',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-all_power_rangers_charge_towards_bad_guys_profile_shot.avif',
			width: 480,
			height: 320,
			caption: 'Profile shot',
			alt: 'Profile shot',
		},
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2008-08-15_power_rangers_360_ii-brian_flies_and_lands_on_ground_visual_effect.avif',
			width: 480,
			height: 320,
			caption: 'Landing',
			alt: 'Landing',
		},
	];

	const sectionExtras: GalleryItem[] = [
		{
			type: 'image',
			src: 'https://cdn.brianschwabauer.com/media/2007-06-16_power_rangers_360-premiere-power_rangers_group_photo_1.jpg',
			width: 1536,
			height: 1024,
			caption: 'Premiere · summer 2007 · backyard cinema · ~40 friends and family',
			alt: 'The Power Rangers cast',
		},
	];

	let reelGallery = $state<ReturnType<typeof LightboxGallery>>();
	let extrasGallery = $state<ReturnType<typeof LightboxGallery>>();

	/**
	 * Red, blue, black, yellow, pink — the order they were always introduced in.
	 * Black is lifted well off actual black: on this background the real costume
	 * colour is a gap in the row rather than a member of it.
	 */
	const RANGERS = ['#ff3a3a', '#3f7dff', '#6a6a80', '#ffcc33', '#ff6fc4'];

	let scope_el = $state<HTMLElement | null>(null);
	/**
	 * 0 before the crop, 1 once it has fully closed, ramping between. The bars are
	 * driven by this rather than by an enter/leave flag so the crop *arrives* — a
	 * projectionist racking the masking in, not two divs appearing.
	 */
	let closed = $state(0);

	$effect(() => {
		if (!scope_el) return;
		const section = scope_el.closest('section');
		const year = section?.querySelector('.year-mark');
		if (!section || !year) return;
		const measure = () => {
			const vh = window.innerHeight || 1;
			/*
			 * The crop is timed off the year mark, not off the section's arrival.
			 * Tying it to how much of the section covered the viewport meant the
			 * bars were already closing while the section was still sliding in —
			 * so the reader met the crop before they had met the chapter. Running
			 * it over the year's last 30% of travel instead means the frame
			 * finishes closing exactly as "2008" reaches the top of the screen,
			 * which is a beat *after* you have arrived rather than during.
			 */
			const y = year.getBoundingClientRect().top;
			const arriving = (vh * 0.3 - y) / (vh * 0.3);
			// …and opens back up as the section's bottom edge leaves.
			const leaving = section.getBoundingClientRect().bottom / (vh * 0.6);
			closed = Math.max(0, Math.min(1, Math.min(arriving, leaving)));
		};
		measure();
		window.addEventListener('scroll', measure, { passive: true });
		window.addEventListener('resize', measure);
		return () => {
			window.removeEventListener('scroll', measure);
			window.removeEventListener('resize', measure);
		};
	});
</script>

<SectionShell id="feature-length" year="2008" label="Feature Length" theme="ranger">
	<!--
	  The chapter where two kids decided the next one would be a *feature*, so the
	  section puts on the one thing that says feature before a single frame plays:
	  it goes wide. The bars close in as you enter and open again as you leave —
	  and being fixed to the viewport rather than to the section, they crop the
	  page itself, which is what a scope print does to the room you're sitting in.
	-->
	<div bind:this={scope_el} class="scope" aria-hidden="true" style:--closed={closed}>
		<span class="bar top"></span>
		<span class="bar bottom"></span>
	</div>

	<div class="container">
		<Reveal>
			<YearMark year="2008" subtitle="Backyard Blockbusters" color="#ffcc33" />
		</Reveal>

		<div class="lockup">
			<Reveal>
				<h2 class="title">
					<span class="word w1">&ldquo;FEATURE LENGTH&rdquo;</span>
					<span class="word w2">FILMS</span>
				</h2>
				<p class="lede">
					We'd spent two summers on short films. We were ready for the big one — a
					Hollywood feature-length movie. We didn't know how long a script needed to be,
					so we wrote until we couldn't write anymore. It was too much work to invent
					characters or world-building, so we "borrowed" an existing IP. We were thirteen.
				</p>
			</Reveal>
		</div>

		<div class="pr-grid">
			<Reveal>
				<h3 class="sub">Power Rangers 360 (2007)</h3>
				<p>
					Thirty minutes long. Our first "feature". The blue ranger goes rogue, joins the
					villain Vino, fights the red ranger, and dies in his arms. Not a good film. But
					it taught us to aim way past what we could actually pull off — a habit that
					never wore off.
				</p>
				<p>
					We held the film premiere in my backyard after sundown. We put white bed sheets
					over the windows to make a 20ft tall screen and a projector on a card table. It
					was a pretty big deal&hellip; at the time.
				</p>
			</Reveal>
			<Reveal variant="right" delay={100}>
				<div class="premiere">
					<LazyMedia
						src="https://cdn.brianschwabauer.com/media/2007-06-16_power_rangers_360-premiere-power_rangers_group_photo_1.jpg"
						alt="The Power Rangers cast"
						ratio="4 / 3"
						onclick={(e) => extrasGallery?.open(0, e.currentTarget)} />
					<div class="premiere-cap">
						Premiere · summer 2007 · backyard cinema · ~40 friends and family
					</div>
				</div>
			</Reveal>
		</div>

		<Reveal variant="up" delay={120}>
			<div class="pr1-reel-wrap">
				<FilmReel
					images={pr1ReelImages}
					height={160}
					speed={70}
					onframeclick={({ index, element }) => reelGallery?.open(index, element)} />
				<div class="film-meta">FROM POWER RANGERS 360 · 2007</div>
			</div>
		</Reveal>

		<div class="seq-divider">
			<span></span>
			<div class="seq-text">
				ONE YEAR LATER
				<br />
				<strong>WE TRIED IT AGAIN — BIGGER</strong>
			</div>
			<span></span>
		</div>

		<!--
		  The second film gets the widest layout in the section, because the second
		  film is the one there are two months of photographs of. The writing holds
		  still in a narrow column on the left — a page from the script binder,
		  pinned — while the footage scrolls past it.
		-->
		<div class="pr2-block">
			<div class="pr2-copy">
				<Reveal>
					<h3 class="sub">Power Rangers 360 II (2008)</h3>
					<p>
						The next summer it was time for BIGGER and BETTER. We spent weeks writing a
						60+ page script and printed script binders for the whole cast — which by now
						was a small army of whichever friends were available.
					</p>
					<p>
						It turns out it's pretty hard to make a 60+ minute film in the heat of summer,
						when everyone just wants to be at the pool. But we stuck it out. We had to pad
						the film with some unnecessary scenes and a very long credits reel, but we did
						it. We made a 64-minute film we could be proud of.
					</p>

					<aside class="casting-note">
						<div class="note-eyebrow">CASTING NOTE</div>
						<p>
							One of the &ldquo;characters&rdquo; in the film was Zordon, the rangers'
							leader. We thought it would be funny if he was played by Kevin's dog. So
							that's what we did. We filmed him &ldquo;talking&rdquo; via the ol'
							peanut-butter-in-the-mouth trick, then used a green screen to comp him into
							scenes with the rangers.
						</p>
					</aside>
				</Reveal>
			</div>

			<div class="pr2-media">
				<Reveal variant="up" delay={100}>
					<div class="bts-strip">
						<div class="bts-eyebrow">BEHIND THE SCENES</div>
						<div class="gallery-contained">
							<PeekGallery
								key="feature-length-pr2-bts"
								items={pr2BTSImages}
								peek={6}
								size="1" />
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={150}>
					<div class="bts-strip">
						<div class="bts-eyebrow">FROM THE FILM</div>
						<div class="gallery-contained">
							<PeekGallery
								key="feature-length-pr2-stills"
								items={pr2StillImages}
								peek={6}
								size="1" />
						</div>
					</div>
				</Reveal>
			</div>
		</div>
	</div>

	<LightboxGallery
		bind:this={reelGallery}
		key="feature-length-reel"
		items={pr1ReelImages} />

	<LightboxGallery
		bind:this={extrasGallery}
		key="feature-length-extras"
		items={sectionExtras} />
</SectionShell>

<style>
	:global([data-theme='ranger']) {
		background:
			radial-gradient(ellipse at 20% 10%, rgba(255, 58, 58, 0.2), transparent 55%),
			radial-gradient(ellipse at 80% 90%, rgba(80, 160, 255, 0.32), transparent 60%),
			linear-gradient(180deg, #0a0710 0%, #100612 50%, #06080f 100%);
		color: #f4ecff;
	}

	/*
	 * The scope crop.
	 *
	 * These are `sticky`, not `fixed`, and that is not a stylistic choice:
	 * `SectionShell` sets `content-visibility: auto`, which applies paint
	 * containment at all times, and a paint-contained element is a containing
	 * block for fixed descendants — so `position: fixed` here would have pinned
	 * the bars to the section and quietly done nothing. Sticky inside a
	 * full-height absolute wrapper gives the behaviour that was actually wanted:
	 * pinned to the top and bottom of the *viewport*, for exactly as long as this
	 * section is the thing on screen.
	 */
	.scope {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		pointer-events: none;
		z-index: 2;
	}
	.bar {
		display: block;
		width: 100%;
		background: #000;
		/* Fades up with the crop, so at rest there is no hairline rule sitting
		   across the top of the section waiting for something to happen. */
		--edge: rgba(255, 204, 51, calc(var(--closed, 0) * 0.34));
		/*
		 * The crop only exists if you can see its edge. On a section this dark,
		 * black bars over a near-black background were geometrically correct and
		 * completely invisible — what actually reads as masking coming in is the
		 * bright line where the mask meets the picture, so that line is the
		 * effect and the black is just what's behind it.
		 */
		box-shadow: 0 0 22px 4px rgba(0, 0, 0, 0.95);
		/*
		 * 2.39:1 worth of crop, which is what "we're making a feature" meant to
		 * two kids who had only ever seen one in a cinema. Capped at 14vh so a
		 * phone in portrait — where the maths wants to eat two thirds of the
		 * screen — gets the gesture rather than the geometry.
		 */
		height: calc(var(--closed, 0) * clamp(0px, (100svh - 41.84svw) / 2, 14svh));
		/* Short, and linear: the height already follows a scroll ramp, so this is
		   only smoothing the gaps between scroll events. Anything longer lags
		   behind the wheel and the crop stops feeling attached to it. */
		transition: height 120ms linear;
	}
	.bar.top {
		position: sticky;
		top: 0;
		border-bottom: 1px solid var(--edge);
	}
	.bar.bottom {
		position: sticky;
		bottom: 0;
		border-top: 1px solid var(--edge);
	}

	@media (prefers-reduced-motion: reduce) {
		.bar {
			transition: none;
		}
	}

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
	.title {
		/* One line, phone to desktop — the clamp below is sized so the longest
		   string still clears the narrowest gutter. */
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.28em;
		white-space: nowrap;
		font-family: 'Inter', sans-serif;
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.04em;
		margin: 0;
	}
	.word {
		display: inline-block;
		font-size: clamp(1.4rem, 6.6vw, 5rem);
		color: oklch(from #ffcc33 0.82 calc(c * 0.9) h);
		text-shadow: 0 0 60px rgba(255, 217, 52, 0.15);
		transform-origin: center;
	}
	.w1 {
		animation: slamIn 1s cubic-bezier(0.2, 1, 0.3, 1.2) both;
	}
	.w2 {
		animation: slamIn 1s cubic-bezier(0.2, 1, 0.3, 1.2) 0.15s both;
		color: #fff;
		-webkit-text-stroke: 2px #ffcc33;
	}
	@keyframes slamIn {
		from {
			transform: scale(1.25);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
	.lede {
		max-width: 44rem;
		margin: 1.4rem auto 0;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		line-height: 1.6;
		opacity: 0.88;
	}

	.pr-grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin-bottom: 3rem;
	}
	@media (max-width: 768px) {
		.pr-grid {
			grid-template-columns: 1fr;
		}
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
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.3),
			transparent
		);
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

	/* Full bleed, out of the 80rem container it is nested in. */
	.pr2-block {
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		padding-inline: clamp(1rem, 3vw, 2rem);
		box-sizing: border-box;
		margin-bottom: 3rem;
		display: grid;
		/*
		 * The prose column is capped at a readable measure rather than taking a
		 * share of the width — on a wide monitor a 50% text column is a wall, and
		 * the photographs are what deserve the extra pixels anyway.
		 */
		grid-template-columns: minmax(0, 31rem) minmax(0, 1fr);
		gap: clamp(1.5rem, 4vw, 4rem);
		align-items: start;
	}
	.pr2-copy {
		position: sticky;
		/*
		 * Clear of the scope bar, which eats up to 14svh off the top of the
		 * viewport while this section is on screen.
		 */
		top: max(6rem, 20vh);
	}
	.pr2-block p {
		line-height: 1.6;
	}

	/*
	 * A note pinned to the script binder — a different voice from the section's
	 * narration, so it gets a different surface rather than just italics.
	 */
	.casting-note {
		margin-top: 1.6rem;
		padding: 1rem 1.1rem;
		border-left: 2px solid #ffd934;
		border-radius: 0 6px 6px 0;
		background: linear-gradient(
			90deg,
			oklch(from #ffd934 0.72 c h / 0.12),
			oklch(from #ffd934 0.72 c h / 0.03)
		);
	}
	.note-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.28em;
		color: #ffd934;
		margin-bottom: 0.5rem;
	}
	.casting-note p {
		margin: 0;
		font-size: 0.95rem;
		opacity: 0.92;
	}

	.pr2-media {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		/* The galleries carry their own @container context; without a min of 0 a
		   masonry child's intrinsic width can blow the grid track out. */
		min-width: 0;
	}
	.bts-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ffd934;
		margin-bottom: 0.8rem;
	}

	@media (max-width: 900px) {
		.pr2-block {
			grid-template-columns: minmax(0, 1fr);
		}
		.pr2-copy {
			position: static;
		}
	}
</style>
