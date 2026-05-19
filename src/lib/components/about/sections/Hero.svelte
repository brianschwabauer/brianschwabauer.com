<script lang="ts">
	import { media } from '../media';
	import HeroMascot from './HeroMascot.svelte';
	import HeroExplosion from './HeroExplosion.svelte';

	const projectStars = [
		'2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_list.avif',
		'2026-01-01_show_and_tour-legacy_delivery_page_screenshot-963_n1950_rd.avif',
		'2024-01-01_remarkably_organized_app-home_page_screenshot.avif',
		'2015-08-24_brian_demo_reel_2015-wedding_footage_of_bride_in_dress_smiling.avif',
		'2015-08-04_adpi_recruitment_video_2015-women_jumping_off_fountain_ledge_in_slowmo.avif',
		'2015-02-08_engage_mobile_5_logo_animation.avif',
		'2014-10-05_decisionfx_logo_animation.avif',
		'2014-06-04_what_makes_us_human-main_character_stuck_in_high_tech_jail_cell_visual_effect.avif',
		'2013-06-22_the_spunksters-logo_animation.avif',
		'2011-04-14_this_is_ksms-basketball_trick_shot_with_vfx.avif',
		'2011-03-18_xyz_news_special_report-weather_report.avif',
		'2011-03-01_exposure-animated_on_transparent_background_camera_robot_transforms_from_camera_to_robot.avif',
		'2011-01-14_ksms_live_broadcast-boys_basketball_vs_smnw-replay_animation.avif',
		'2010-03-25_do_da_flava_g-whole_family_dances_in_back_yard.avif',
		'2010-03-25_do_da_flava_g-caleb_dances_with_his_bling.avif',
		'2010-03-25_do_da_flava_g-caleb_dances_on_virtual_stage.avif',
		'2009-12-25_calamity-airplane_fly_through_city_first_person.avif',
		'2009-12-25_new_hunky_spunky_productions_logo_animation_long.avif',
		'2009-03-22_yard_sale-close_up_on_brian_as_animals_attack.avif',
		'2009-03-22_yard_sale-matthew_hides_in_stuff_animal_pile.avif',
		'2009-02-13_sideline_huddler-band_plays_to_song.avif',
		'2009-01-01_hunky_spunky_productions_website_scroll.avif',
		'2008-12-24_the_ape-brian_in_ape_suit_pounds_his_chest.avif',
		'2008-08-21_nuisance-b-gone-product_makes_chair_disappear_visual_effect.avif',
		'2008-08-21_nuisance-b-gone-product_makes_shoe_disappear_visual_effect.avif',
		'2008-08-21_nuisance-b-gone-brian_explains_the_product.avif',
		'2008-06-22_take_one_films_logo_animation.avif',
		'2008-02-23_rush_for_an_idea-split_screen_effect_kevin_and_emma_talk.avif',
		'2007-09-09_ninja_men-grant_punches_brian_from_behind.avif',
		'2007-09-09_ninja_men-grant_is_repeately_punched_in_the_stomach.avif',
		'2007-09-06_spatula_story-emma_intensely_plays_video_game.avif',
		'2007-08-26_flashlight-brian_plays_guitar.avif',
		'2007-08-26_flashlight-brian_summons_guitar_reversed_footage_visual_effect.avif',
		'2007-08-09_xyz_news_episode_i-brian_gives_thumbs_up_while_floating_with_green_screen.avif',
		'2007-07-26_power_rangers_360-vino_disappears_visual_effect.avif',
		'2007-07-26_power_rangers_360-logo_animation.avif',
		'2006-11-27_the_fight_scene_ii-kevin_and_brian_fight_with_brooms_and_shovels_3.avif',
		'2006-11-27_the_fight_scene_ii-brian_and_kevin_frolic_in_snow.avif',
		'2006-08-30_bobby_mcqueen-kevin_and_brian_fight_with_brooms.avif'
	];

	const stars = projectStars.map((src, i) => {
		const seed = (i + 1) * 9301 + 49297;
		const r = (n: number) => (Math.sin(seed * n) + 1) / 2;
		return {
			src,
			x: 5 + r(1.7) * 90,
			y: 5 + r(2.3) * 90,
			delay: r(3.1) * 14,
			duration: 12 + r(4.7) * 10,
			scale: 0.35 + r(5.9) * 0.55,
			rotate: (r(7.3) - 0.5) * 24
		};
	});

	const currentYear = new Date().getFullYear();

	// ---- destruction sequence ----------------------------------------------
	type Phase = 'idle' | 'awake' | 'pumping' | 'boom' | 'aftermath';

	let phase = $state<Phase>('idle');
	let pumpCount = $state(0);
	let pumpStroke = $state(0); // 0 = up, 1 = down
	let explosionTick = $state(0);
	let warned = $state(false); // user hovered/peeked
	let prePress = $state(false); // momentary squish on click

	// Button scale is purely derived from pump count (no transition during scale —
	// we apply a per-pump spring via .pulse class instead)
	const buttonScale = $derived(1 + pumpCount * 0.55);

	const buttonLabel = $derived(
		phase === 'idle' && !warned
			? "Don't push this button"
			: phase === 'idle' && warned
				? 'Seriously, don’t.'
				: phase === 'awake'
					? 'uh oh'
					: phase === 'pumping' && pumpCount < 3
						? 'hey, stop'
						: phase === 'pumping'
							? 'HELP'
							: ''
	);

	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	async function startDestruction() {
		if (phase !== 'idle') return;

		const reduce =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			phase = 'aftermath';
			explosionTick++;
			return;
		}

		// little anticipation squish on press
		prePress = true;
		await sleep(180);
		prePress = false;

		phase = 'awake';
		// mascot springs up + settles
		await sleep(1500);

		phase = 'pumping';
		const pumps = 4;
		for (let i = 0; i < pumps; i++) {
			// stroke down (arm pushes pump handle)
			pumpStroke = 1;
			await sleep(180);
			// at impact, count the pump (button inflates)
			pumpCount = i + 1;
			await sleep(160);
			// stroke back up
			pumpStroke = 0;
			await sleep(360);
		}

		// pre-boom held breath — button shudders
		await sleep(420);

		phase = 'boom';
		explosionTick++;
		await sleep(1500);

		phase = 'aftermath';
	}

	// ---- contact form ------------------------------------------------------
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let formState = $state<'idle' | 'sending' | 'sent' | 'error'>('idle');
	let formError = $state('');

	async function submitContact(e: SubmitEvent) {
		e.preventDefault();
		if (formState === 'sending') return;
		if (!name.trim() || !email.trim() || !message.trim()) {
			formError = 'Please fill in every field.';
			formState = 'error';
			return;
		}
		formState = 'sending';
		formError = '';
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message })
			});
			if (!res.ok) {
				const txt = await res.text().catch(() => '');
				throw new Error(txt || `Send failed (${res.status})`);
			}
			formState = 'sent';
		} catch (err) {
			formState = 'error';
			formError = err instanceof Error ? err.message : 'Send failed';
		}
	}

	function scrollNext() {
		const hero = document.getElementById('hero');
		const next = hero?.nextElementSibling as HTMLElement | null;
		const target = next ?? hero;
		if (!target) return;
		const top = target.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top });
	}
</script>

<section
	class="hero"
	id="hero"
	data-section
	data-section-label="Today"
	data-section-year={currentYear}
	class:shake={phase === 'boom'}
	data-phase={phase}
>
	<div
		class="starfield"
		class:scattering={phase === 'boom' || phase === 'aftermath'}
		aria-hidden="true"
	>
		{#each stars as star, i (i)}
			<img
				class="star"
				src={media(star.src)}
				alt=""
				loading={i < 6 ? 'eager' : 'lazy'}
				decoding="async"
				style:--x="{star.x}%"
				style:--y="{star.y}%"
				style:--delay="-{star.delay}s"
				style:--duration="{star.duration}s"
				style:--scale={star.scale}
				style:--rotate="{star.rotate}deg"
				style:--blast-dx="{star.x - 50}%"
				style:--blast-dy="{star.y - 50}%"
				style:--blast-spin="{star.rotate * 8}deg"
				style:--blast-delay="{(i % 9) * 20}ms"
			/>
		{/each}
		<div class="vignette"></div>
	</div>

	<!-- BEFORE: the original content (badge, headline, lede, button) -->
	{#if phase !== 'aftermath'}
		<div class="hero-inner before" class:exploding={phase === 'boom'}>
			<div class="badge" data-frag>
				<span class="avatar" aria-hidden="true">
					<img src="/profile_picture2.webp" alt="" loading="eager" decoding="async" />
					<span class="avatar-ring"></span>
				</span>
				<span>👋 Hi, I'm Brian Schwabauer</span>
			</div>

			<h1 data-frag>
				<span class="grad">Delivering</span>
				<span class="grad accent">Delight</span>
			</h1>

			<p class="lede" data-frag>
				For as long as I have lived, I have loved to create. I've built startups, developed apps,
				and produced videos. I live to create. I work to delight.
			</p>

			<div class="button-stage" data-frag>
				<button
					class="boom-btn"
					class:warn={warned}
					class:pre-press={prePress}
					class:wobble={phase === 'pumping' && pumpCount > 0}
					class:shudder={phase === 'pumping' && pumpCount >= 4}
					class:popped={phase === 'boom'}
					type="button"
					onmouseenter={() => (warned = true)}
					onmouseleave={() => (warned = phase !== 'idle')}
					onfocus={() => (warned = true)}
					onclick={startDestruction}
					disabled={phase !== 'idle'}
					aria-label={phase === 'idle' ? "Don't push this button" : 'Boom in progress'}
					style:--scale={buttonScale}
				>
					<span class="boom-btn-skin"></span>
					<span class="boom-btn-label" aria-live="polite">
						{#key buttonLabel}
							<span class="boom-btn-text">{buttonLabel}</span>
						{/key}
					</span>
				</button>

				<HeroMascot {phase} {pumpCount} {pumpStroke} {buttonScale} />
			</div>
		</div>
	{/if}

	<HeroExplosion trigger={explosionTick} origin={{ x: 0.5, y: 0.62 }} />

	<!-- AFTERMATH: shown after the dust settles -->
	{#if phase === 'aftermath'}
		<div class="hero-inner aftermath">
			<h1 class="aftermath-h1">
				<span class="line line-1">You destroyed</span>
				<span class="line line-2">my site.</span>
			</h1>
			<p class="aftermath-lede">
				Well&hellip; that escalated. Since you went and blew the place up, the least you can do is
				stick around. Tell me your name and what you want to build together — I'll get back to you
				faster than my poor mascot can find his helmet.
			</p>

			<form
				class="contact-form"
				onsubmit={submitContact}
				class:sent={formState === 'sent'}
				class:err={formState === 'error'}
			>
				{#if formState === 'sent'}
					<div class="form-success">
						<svg viewBox="0 0 24 24" aria-hidden="true" class="success-check">
							<path
								d="M4 12 L10 18 L20 6"
								fill="none"
								stroke="currentColor"
								stroke-width="3"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<h3>Message received.</h3>
						<p>Thanks, {name || 'friend'}. I'll be in touch soon.</p>
					</div>
				{:else}
					<label class="field">
						<span>Your name</span>
						<input
							type="text"
							bind:value={name}
							required
							maxlength="100"
							autocomplete="name"
							placeholder="Jane Builder"
							disabled={formState === 'sending'}
						/>
					</label>
					<label class="field">
						<span>Email</span>
						<input
							type="email"
							bind:value={email}
							required
							maxlength="200"
							autocomplete="email"
							placeholder="jane@example.com"
							disabled={formState === 'sending'}
						/>
					</label>
					<label class="field">
						<span>What should we build?</span>
						<textarea
							bind:value={message}
							required
							maxlength="5000"
							rows="4"
							placeholder="Tell me about the project, the dream, or just say hi."
							disabled={formState === 'sending'}
						></textarea>
					</label>

					{#if formError}
						<div class="form-error" role="alert">{formError}</div>
					{/if}

					<button class="send-btn" type="submit" disabled={formState === 'sending'}>
						{formState === 'sending' ? 'Sending…' : 'Send it'}
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M5 12h14M13 6l6 6-6 6"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{/if}
			</form>
		</div>
	{/if}

	<button
		class="scroll-cue"
		class:hidden={phase === 'boom'}
		type="button"
		onclick={scrollNext}
		aria-label="Scroll to next section"
	>
		<span class="cue-label">More below</span>
		<span class="cue-arrow" aria-hidden="true">
			<svg viewBox="0 0 24 24">
				<path
					d="M6 9l6 6 6-6"
					fill="none"
					stroke="currentColor"
					stroke-width="2.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</span>
	</button>
</section>

<style>
	.hero {
		position: relative;
		min-height: 100svh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 9rem 1.5rem 6rem;
		overflow: hidden;
		isolation: isolate;
		color: #fff;
	}
	/* camera shake on boom */
	.hero.shake {
		animation: cam-shake 720ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
	@keyframes cam-shake {
		0% { transform: translate(0, 0); }
		10% { transform: translate(-6px, 3px) rotate(-0.4deg); }
		20% { transform: translate(8px, -4px) rotate(0.5deg); }
		30% { transform: translate(-9px, 6px) rotate(-0.6deg); }
		40% { transform: translate(7px, 5px) rotate(0.4deg); }
		50% { transform: translate(-5px, -3px) rotate(-0.3deg); }
		60% { transform: translate(4px, 4px) rotate(0.3deg); }
		70% { transform: translate(-3px, -2px); }
		80% { transform: translate(2px, 2px); }
		100% { transform: translate(0, 0); }
	}

	.starfield {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
	}
	.star {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: clamp(80px, 11vw, 200px);
		height: auto;
		object-fit: cover;
		border-radius: 6px;
		box-shadow: 0 0 30px rgba(0, 244, 195, 0.25);
		transform: translate(-50%, -50%) scale(0) rotate(0deg);
		animation: warp var(--duration, 18s) linear infinite;
		animation-delay: var(--delay, 0s);
		will-change: transform, opacity;
		opacity: 0;
	}
	@keyframes warp {
		0% {
			transform: translate(-50%, -50%) scale(0.04) rotate(var(--rotate));
			opacity: 0;
			filter: blur(2px) saturate(0.4);
		}
		8% { opacity: 0.85; filter: blur(0) saturate(1); }
		70% { opacity: 0.75; }
		100% {
			transform: translate(-50%, -50%) scale(var(--scale, 0.7)) rotate(var(--rotate));
			opacity: 0;
			filter: blur(0) saturate(1);
		}
	}
	/* when boom triggers, kill the warp loop and blast each star outward */
	.starfield.scattering .star {
		animation: star-blast 1100ms cubic-bezier(0.34, 1.2, 0.5, 1) forwards;
		animation-delay: var(--blast-delay, 0ms);
	}
	@keyframes star-blast {
		0% {
			opacity: 0.85;
			transform: translate(-50%, -50%) scale(1) rotate(var(--rotate));
			filter: brightness(1.6) saturate(1.4);
		}
		35% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1.35) rotate(var(--rotate));
			filter: brightness(2.6) saturate(1.6);
		}
		100% {
			opacity: 0;
			transform:
				translate(-50%, -50%)
				translate(calc(var(--blast-dx, 0%) * 2.4), calc(var(--blast-dy, 0%) * 2.4))
				scale(2.6)
				rotate(calc(var(--rotate) + var(--blast-spin, 0deg)));
			filter: brightness(3) saturate(0.6) blur(2px);
		}
	}
	.vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(ellipse at center, transparent 0%, rgba(8, 8, 14, 0.78) 65%, #06060a 100%),
			radial-gradient(circle at 20% 30%, rgba(108, 99, 255, 0.18), transparent 55%),
			radial-gradient(circle at 80% 70%, rgba(0, 244, 195, 0.16), transparent 55%);
		pointer-events: none;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		max-width: 64rem;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.6rem;
	}

	/* ----- BEFORE content ----- */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.35rem 0.95rem 0.35rem 0.35rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
	}
	.avatar {
		position: relative;
		display: inline-block;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		overflow: hidden;
		flex-shrink: 0;
		isolation: isolate;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: saturate(0.85);
		transition: filter 350ms ease;
	}
	.badge:hover .avatar img { filter: saturate(1.15); }
	.avatar-ring {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35), 0 0 12px rgba(0, 242, 195, 0.4);
		pointer-events: none;
		z-index: 1;
	}
	h1 {
		font-family: 'Nunito Sans', sans-serif;
		font-size: clamp(3rem, 13vw, 5rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		margin: 0.4rem 0 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	@media (min-width: 768px) {
		h1 { font-size: clamp(6rem, 11vw, 9rem); }
	}
	.grad {
		padding-bottom: 0.18em;
		background: linear-gradient(95deg, #ffffff 20%, #00f2c3 70%, #6c63ff 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.grad + .grad { margin-top: -0.18em; }
	.grad.accent {
		background: linear-gradient(95deg, #00f2c3, #6c63ff 80%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		max-width: 44rem;
		font-size: clamp(1.05rem, 1.6vw, 1.25rem);
		line-height: 1.55;
		color: rgba(255, 255, 255, 0.75);
		margin: 0;
	}

	/* ---- The big red button ---- */
	.button-stage {
		position: relative;
		display: inline-flex;
		justify-content: center;
		align-items: flex-end;
		margin-top: 0.8rem;
		min-height: 80px;
		min-width: 280px;
		/* anchor the absolutely-positioned mascot inside this stage so the
		   mascot rises from behind the button rather than from the bottom
		   of the entire hero section. */
		isolation: isolate;
	}
	.boom-btn {
		--scale: 1;
		position: relative;
		z-index: 5;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		appearance: none;
		border: none;
		background: transparent;
		color: #052028;
		font: inherit;
		font-weight: 800;
		font-size: 1rem;
		letter-spacing: 0.02em;
		/* fixed footprint so the label can swap without resizing */
		width: clamp(220px, 24vw, 280px);
		height: 56px;
		padding: 0 1.8rem;
		border-radius: 999px;
		cursor: pointer;
		transform-origin: 50% 100%;
		transform: scale(var(--scale));
		transition:
			transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
			color 220ms ease;
		will-change: transform;
	}
	.boom-btn:disabled { cursor: default; }
	.boom-btn-skin {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background:
			radial-gradient(circle at 30% 25%, #aaffe8 0%, #00f2c3 35%, #6c63ff 90%);
		box-shadow:
			inset 0 -6px 16px rgba(20, 10, 40, 0.4),
			inset 0 4px 12px rgba(255, 255, 255, 0.45),
			0 14px 36px rgba(0, 242, 195, 0.4),
			0 4px 18px rgba(108, 99, 255, 0.35);
		transition:
			background 320ms ease,
			box-shadow 320ms ease;
	}
	.boom-btn-label {
		position: relative;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.boom-btn-text {
		grid-area: 1 / 1;
		display: inline-block;
		white-space: nowrap;
		animation: label-swap 420ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes label-swap {
		0% { opacity: 0; transform: translateY(110%); filter: blur(4px); }
		60% { opacity: 1; transform: translateY(-6%); filter: blur(0); }
		100% { opacity: 1; transform: translateY(0); filter: blur(0); }
	}

	/* idle invitation pulse */
	.boom-btn:not(:disabled) {
		animation: invite 2.6s ease-in-out infinite;
	}
	@keyframes invite {
		0%, 100% { transform: scale(var(--scale)) translateY(0); }
		50% { transform: scale(calc(var(--scale) * 1.03)) translateY(-2px); }
	}

	.boom-btn:hover:not(:disabled) .boom-btn-skin {
		background:
			radial-gradient(circle at 30% 25%, #d9fff5 0%, #00f2c3 30%, #8a82ff 95%);
		box-shadow:
			inset 0 -6px 16px rgba(20, 10, 40, 0.45),
			inset 0 4px 14px rgba(255, 255, 255, 0.6),
			0 20px 50px rgba(0, 242, 195, 0.55),
			0 6px 22px rgba(108, 99, 255, 0.5);
	}
	.boom-btn.warn {
		color: #052028;
	}
	.boom-btn.pre-press {
		animation: none;
		transform: scale(calc(var(--scale) * 0.88)) translateY(2px);
		transition: transform 120ms ease-out;
	}

	/* wobble between pumps — overlap/follow-through */
	.boom-btn.wobble {
		animation: btn-wobble 480ms cubic-bezier(0.36, 1.4, 0.4, 1) 1;
	}
	@keyframes btn-wobble {
		0% { transform: scale(calc(var(--scale) * 0.85)) translateY(4px); }
		40% { transform: scale(calc(var(--scale) * 1.12)) translateY(-4px); }
		70% { transform: scale(calc(var(--scale) * 0.96)) translateY(2px); }
		100% { transform: scale(var(--scale)) translateY(0); }
	}
	.boom-btn.shudder {
		animation: btn-shudder 220ms ease infinite;
	}
	@keyframes btn-shudder {
		0%, 100% { transform: scale(var(--scale)) translate(0, 0); }
		25% { transform: scale(var(--scale)) translate(-3px, -1px); }
		50% { transform: scale(var(--scale)) translate(3px, 1px); }
		75% { transform: scale(var(--scale)) translate(-2px, 2px); }
	}

	/* When it pops, the button vanishes (its mass becomes the canvas particles) */
	.boom-btn.popped {
		animation: btn-pop 280ms ease-in forwards;
		pointer-events: none;
	}
	@keyframes btn-pop {
		0% { transform: scale(var(--scale)) translateY(0); opacity: 1; filter: brightness(2); }
		60% { transform: scale(calc(var(--scale) * 1.4)) translateY(-4px); opacity: 1; filter: brightness(3.5); }
		100% { transform: scale(calc(var(--scale) * 0.1)) translateY(0); opacity: 0; filter: brightness(5); }
	}

	/* fragments fly outward on boom */
	.before {
		transition: filter 300ms ease;
	}
	.before.exploding [data-frag] {
		animation: frag-fly 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
		pointer-events: none;
	}
	.before.exploding [data-frag]:nth-child(1) { --fx: -260px; --fy: -180px; --fr: -18deg; }
	.before.exploding [data-frag]:nth-child(2) { --fx: 80px; --fy: -360px; --fr: 12deg; animation-delay: 40ms; }
	.before.exploding [data-frag]:nth-child(3) { --fx: -180px; --fy: 240px; --fr: -22deg; animation-delay: 80ms; }
	.before.exploding [data-frag]:nth-child(4) { --fx: 280px; --fy: 200px; --fr: 26deg; animation-delay: 120ms; }
	@keyframes frag-fly {
		0% {
			transform: translate(0, 0) rotate(0) scale(1);
			opacity: 1;
			filter: blur(0);
		}
		20% {
			transform: translate(0, -8px) rotate(0) scale(1.05);
			opacity: 1;
		}
		100% {
			transform: translate(var(--fx, 0), var(--fy, 0)) rotate(var(--fr, 0)) scale(0.6);
			opacity: 0;
			filter: blur(4px);
		}
	}

	/* ---- AFTERMATH ---- */
	.aftermath {
		max-width: 44rem;
		animation: aftermath-in 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@keyframes aftermath-in {
		from { opacity: 0; transform: translateY(20px); filter: blur(8px); }
		to { opacity: 1; transform: none; filter: blur(0); }
	}
	.aftermath-h1 {
		font-family: 'Nunito Sans', sans-serif;
		font-size: clamp(2.6rem, 10vw, 5.5rem);
		font-weight: 900;
		line-height: 0.95;
		letter-spacing: -0.035em;
		margin: 0.6rem 0 0.6rem;
		display: flex;
		flex-direction: column;
	}
	.aftermath-h1 .line {
		background: linear-gradient(95deg, #ffffff 10%, #ff9d40 60%, #ff5a3c 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		padding-bottom: 0.12em;
	}
	.aftermath-h1 .line-2 {
		background: linear-gradient(95deg, #ff9d40, #ff5a3c 80%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		margin-top: -0.12em;
	}
	.aftermath-lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.78);
		margin: 0 0 1.6rem;
	}

	.contact-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		text-align: left;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 18px;
		padding: 1.4rem;
		backdrop-filter: blur(10px);
		box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);
	}
	.field { display: flex; flex-direction: column; gap: 0.4rem; }
	.field span {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
	}
	.field input,
	.field textarea {
		font: inherit;
		font-size: 1rem;
		color: #fff;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 10px;
		padding: 0.75rem 0.95rem;
		transition: border-color 200ms ease, background 200ms ease, box-shadow 200ms ease;
		resize: vertical;
	}
	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: #00f2c3;
		background: rgba(0, 242, 195, 0.06);
		box-shadow: 0 0 0 4px rgba(0, 242, 195, 0.12);
	}
	.field input::placeholder,
	.field textarea::placeholder {
		color: rgba(255, 255, 255, 0.32);
	}

	.send-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		padding: 0.95rem 1.5rem;
		background: linear-gradient(135deg, #00f2c3, #00d6ff);
		color: #052028;
		border: none;
		border-radius: 999px;
		font: inherit;
		font-weight: 800;
		cursor: pointer;
		box-shadow: 0 10px 30px rgba(0, 242, 195, 0.3);
		transition: transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease;
	}
	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 14px 40px rgba(0, 242, 195, 0.45);
	}
	.send-btn:disabled { opacity: 0.6; cursor: progress; }
	.send-btn svg { width: 16px; height: 16px; }

	.form-error {
		color: #ffb1a1;
		background: rgba(255, 90, 60, 0.12);
		border: 1px solid rgba(255, 90, 60, 0.35);
		border-radius: 10px;
		padding: 0.6rem 0.85rem;
		font-size: 0.9rem;
	}
	.form-success {
		text-align: center;
		padding: 1rem 0.4rem;
		animation: pop-in 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pop-in {
		from { opacity: 0; transform: scale(0.85); }
		to { opacity: 1; transform: scale(1); }
	}
	.form-success h3 { font-size: 1.4rem; margin: 0.6rem 0 0.2rem; color: #00f2c3; }
	.form-success p { margin: 0; color: rgba(255, 255, 255, 0.75); }
	.success-check {
		width: 56px;
		height: 56px;
		color: #00f2c3;
		filter: drop-shadow(0 0 12px rgba(0, 242, 195, 0.55));
	}

	/* ---- scroll cue ---- */
	.scroll-cue {
		position: absolute;
		left: 50%;
		bottom: 1.4rem;
		transform: translateX(-50%);
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		cursor: pointer;
		font: inherit;
		font-family: var(--font-mono);
		font-size: 0.65rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		z-index: 2;
		padding: 0.4rem 0.6rem;
		transition: color 200ms ease, opacity 380ms ease, transform 380ms ease;
	}
	.scroll-cue:hover {
		color: #00f2c3;
	}
	.scroll-cue.hidden {
		opacity: 0;
		transform: translate(-50%, 30px);
		pointer-events: none;
	}
	.cue-arrow {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(255, 255, 255, 0.04);
		animation: cue-bob 2s ease-in-out infinite;
	}
	.cue-arrow svg {
		width: 16px;
		height: 16px;
	}
	@keyframes cue-bob {
		0%, 100% { transform: translateY(0); border-color: rgba(255, 255, 255, 0.25); }
		50% { transform: translateY(6px); border-color: rgba(0, 242, 195, 0.65); }
	}
	.scroll-cue:focus-visible {
		outline: 2px solid #00f2c3;
		outline-offset: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.star { animation: none; opacity: 0.45; }
		.boom-btn { animation: none; }
		.cue-arrow { animation: none; }
		.hero.shake { animation: none; }
		.aftermath { animation: none; }
	}
</style>
