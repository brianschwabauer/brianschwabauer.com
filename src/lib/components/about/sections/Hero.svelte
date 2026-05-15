<script lang="ts">
	import { media } from '../media';

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
		const r = (n: number) => ((Math.sin(seed * n) + 1) / 2);
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

	function scrollNext() {
		const hero = document.getElementById('hero');
		const next = hero?.nextElementSibling as HTMLElement | null;
		const target = next ?? hero;
		if (!target) return;
		const top = target.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top, behavior: 'smooth' });
	}
</script>

<section class="hero" id="hero" data-section data-section-label="Today" data-section-year="{currentYear}">
	<div class="starfield" aria-hidden="true">
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
			/>
		{/each}
		<div class="vignette"></div>
	</div>

	<div class="hero-inner">
		<div class="badge">
			<span class="avatar" aria-hidden="true">
				<img src="/profile_picture2.webp" alt="" loading="eager" decoding="async" />
				<span class="avatar-ring"></span>
			</span>
			<span>👋 Hi, I'm Brian Schwabauer</span>
		</div>

		<h1>
			<span class="grad">Delivering</span>
			<span class="grad accent">Delight</span>
		</h1>

		<p class="lede">
			For as long as I have lived, I have loved to create. I've built startups, developed apps, and
			produced videos. I live to create. I work to delight.
		</p>

		<button class="cta" type="button" onclick={scrollNext}>
			<span>See what I'm up to</span>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 4v16M6 14l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	</div>
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
		8% {
			opacity: 0.85;
			filter: blur(0) saturate(1);
		}
		70% {
			opacity: 0.75;
		}
		100% {
			transform: translate(-50%, -50%) scale(var(--scale, 0.7)) rotate(var(--rotate));
			opacity: 0;
			filter: blur(0) saturate(1);
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
	.badge:hover .avatar img {
		filter: saturate(1.15);
	}
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
		/* padding-bottom extends the painted area so background-clip:text
		   covers descenders (g, y, p). The matching negative margin-top on
		   the next line keeps the original tight line spacing. */
		padding-bottom: 0.18em;
		background: linear-gradient(95deg, #ffffff 20%, #00f2c3 70%, #6c63ff 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.grad + .grad {
		margin-top: -0.18em;
	}
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
	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		background: rgba(255, 255, 255, 0.05);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.2);
		padding: 0.85rem 1.5rem;
		border-radius: 999px;
		font: inherit;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.6rem;
		transition: background 200ms ease, transform 200ms ease, border-color 200ms ease;
	}
	.cta:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(0, 242, 195, 0.45);
		transform: translateY(-2px);
	}
	.cta:focus-visible {
		outline: 2px solid #00f2c3;
		outline-offset: 3px;
	}
	.cta svg {
		width: 18px;
		height: 18px;
		animation: bob 2.4s ease-in-out infinite;
	}
	@keyframes bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(4px); }
	}

	@media (prefers-reduced-motion: reduce) {
		.star { animation: none; opacity: 0.45; }
		.ping { animation: none; }
		.cta svg { animation: none; }
	}
</style>
