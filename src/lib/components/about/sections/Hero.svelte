<script lang="ts">
	import { onMount } from "svelte";
	import { media } from "../media";
	import { STARFIELD_IMAGES } from "../starfield-images";
	import HeroMascot from "./HeroMascot.svelte";
	import HeroExplosion from "./HeroExplosion.svelte";

	// ---- starfield ---------------------------------------------------------
	// A 3D "warp" field of past-work thumbnails. A fixed seed renders the whole
	// field into the SSR HTML, so it is present the instant the page paints.
	// From then on one rAF loop drives every tile — and only runs while the
	// hero is on screen.
	//
	// Each tile rides a warp position u: 0 = deep space (small, faded in), 1 =
	// swept past the camera (faded out). Idle, every tile drifts u forward at
	// its own gentle pace and recycles with fresh work. Scrolling advances
	// *every* tile's u in lockstep — a real zoom-through: scrolling down sweeps
	// tiles out and leaves them gone, so the field empties across the pin;
	// scrolling up flows tiles on and also draws drained tiles back in from
	// deep space, so fresh work zooms toward you.
	const STAR_COUNT = 24;

	// How long the down-scroll keeps the field stocked — extra tiles cycled
	// through on top of STAR_COUNT. It stretches the drain: the field thins
	// from full to empty over (1 + SCROLL_EXTRA / STAR_COUNT) pin-lengths of
	// scroll. 0 = empties exactly at the end of the pin; higher = it keeps
	// streaming well past the pin (it never fully empties before you scroll
	// the hero off screen). Tune to taste.
	const SCROLL_EXTRA = 50;
	const DRAIN_REACH = 1 + SCROLL_EXTRA / STAR_COUNT;

	// Hero content (badge, headline, copy, CTA) parallax: as you scroll into
	// the pin each item drifts up and fades — staggered, and each at its own
	// rate so the column gently separates rather than leaving as a block.
	const FRAG_LIFT = 250; // px the first item travels up before it is gone
	const FRAG_LIFT_STEP = 0; // each item below travels a little less (parallax)
	const FRAG_STAGGER = 0.14; // scroll-progress offset between items
	const FRAG_SPAN = 2; // scroll-progress each item takes to depart

	// the warp tunnel in px of translateZ. Z_NEAR stays well inside the
	// `perspective` distance so a tile never reaches the projection
	// singularity (where scale blows up to infinity).
	const Z_FAR = -260;
	const Z_NEAR = 320;

	type Star = {
		id: number;
		src: string;
		x: number; // % across the hero — the tile's anchor / direction from centre
		y: number; // % down the hero
		w: number; // width factor (~0.7–1.5)
		rot: number; // flat in-plane rotation (deg) — no 3D skew
		drift: number; // seconds for one idle (unscrolled) pass through the tunnel
	};

	// deterministic PRNG (mulberry32) — the seeded field must be byte-identical
	// on the server and the client so hydration never flickers.
	function mulberry32(seed: number) {
		let a = seed >>> 0;
		return () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	// A raw anchor that stays clear of the central column the headline owns.
	function randomAnchor(rand: () => number): { x: number; y: number } {
		let x = 4 + rand() * 92;
		let y = 6 + rand() * 88;
		for (let i = 0; i < 12; i++) {
			if (Math.abs(x - 50) > 23 || Math.abs(y - 50) > 34) break;
			x = 4 + rand() * 92;
			y = 6 + rand() * 88;
		}
		return { x, y };
	}

	// Best-candidate sampling: try a handful of anchors and keep the one
	// sitting furthest from every other tile, so a new star drops into the
	// emptiest gap instead of piling onto its neighbours.
	function placeStar(
		rand: () => number,
		others: Star[],
	): { x: number; y: number } {
		let best = { x: 50, y: 50 };
		let bestDist = -1;
		for (let c = 0; c < 9; c++) {
			const cand = randomAnchor(rand);
			let nearest = Infinity;
			for (const o of others) {
				const dx = cand.x - o.x;
				const dy = cand.y - o.y;
				const d = dx * dx + dy * dy;
				if (d < nearest) nearest = d;
			}
			if (nearest > bestDist) {
				bestDist = nearest;
				best = cand;
			}
		}
		return best;
	}

	let starId = 0;

	// A shuffle-bag of image names: every image is dealt exactly once before
	// any repeat. When the bag empties it refills with the full pool minus
	// whatever is on screen, so no two tiles ever show the same image and
	// every image in the pool is guaranteed its turn.
	let imageBag: string[] = [];

	function drawImage(rand: () => number, onScreen: string[]): string {
		if (imageBag.length === 0) {
			imageBag = STARFIELD_IMAGES.filter((s) => !onScreen.includes(s));
			if (imageBag.length === 0) imageBag = STARFIELD_IMAGES.slice();
		}
		const idx = Math.floor(rand() * imageBag.length);
		return imageBag.splice(idx, 1)[0];
	}

	function makeStar(rand: () => number, others: Star[]): Star {
		const { x, y } = placeStar(rand, others);
		return {
			id: starId++,
			src: drawImage(
				rand,
				others.map((o) => o.src),
			),
			x,
			y,
			w: 1.1 + rand() * 0.8,
			rot: (rand() - 0.5) * 22,
			drift: 15 + rand() * 13,
		};
	}

	// The look of a tile at warp position u — a pure function, so the server,
	// the hydrated first paint and the rAF loop all agree exactly. u rides
	// from 0 (deep space, small + faded) to 1 (swept past the camera, faded
	// out again); outside that range the tile is invisible.
	function starVisual(u: number, rot: number) {
		const z = Z_FAR + u * (Z_NEAR - Z_FAR);
		const fadeIn = Math.min(1, Math.max(0, u / 0.12));
		const fadeOut = Math.min(1, Math.max(0, (1 - u) / 0.28));
		const vis = u <= 0 || u >= 1 ? 0 : Math.min(fadeIn, fadeOut);
		const blur = 5 * (1 - fadeIn) + 1.5 * (1 - fadeOut);
		const sat = 0.45 + 0.65 * fadeIn;
		const bright = 0.7 + 0.55 * u;
		return {
			transform: `translate(-50%, -50%) translateZ(${z.toFixed(1)}px) rotate(${rot}deg)`,
			opacity: (0.9 * vis).toFixed(3),
			filter: `blur(${blur.toFixed(2)}px) saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)})`,
		};
	}

	// SSR-stable seed → an identical field on server and client. Each tile is
	// placed against the ones already chosen so the opening field is spread,
	// and seeded with a warp position so the field looks alive on first paint.
	const seededRand = mulberry32(0x5742_2026);
	const seededStars: Star[] = [];
	const seededU: number[] = [];
	for (let i = 0; i < STAR_COUNT; i++) {
		seededStars.push(makeStar(seededRand, seededStars));
		seededU.push(seededRand());
	}
	let stars = $state<Star[]>(seededStars);
	// static fallback styles — shown as-is under reduced motion (no animation),
	// and harmlessly overridden by the CSS idle drift / JS warp loop otherwise.
	const seedStyles = seededStars.map((s, i) => starVisual(seededU[i], s.rot));

	let pinRef: HTMLDivElement | undefined;
	let warpRef: HTMLDivElement | undefined;
	// the BEFORE content is conditionally rendered, so this ref is reassigned
	let beforeRef = $state<HTMLDivElement>();

	// ---- the warp loop ------------------------------------------------------
	// One rAF loop owns the field. It advances every tile's warp position,
	// recycles tiles that reach the end, and writes transform/opacity/filter
	// straight to the DOM. It runs only while the hero is on screen.
	onMount(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		// per-tile warp position, and whether it has been swept out and parked
		const u = seededU.slice();
		const parked: boolean[] = new Array(STAR_COUNT).fill(false);

		let heroVisible = true;
		let raf = 0;
		let lastT = 0;
		let lastY = window.scrollY;
		let pendingScroll = 0; // signed px scrolled since the last frame
		let refillBudget = 0; // fractional count of parked tiles owed re-entry
		let pinTop = 0;
		let pinDist = 1; // scroll distance the hero stays pinned for
		let scrollGain = 0; // px scrolled → u advanced (a whole pin drains the field)
		let refillGain = 0; // px scrolled up → parked tiles drawn back in
		let activeCount = STAR_COUNT; // tiles currently in the field (not parked)

		// pin geometry only shifts on resize — measure it then, not per frame
		function measure() {
			const hero = document.getElementById("hero");
			if (!pinRef || !hero) return;
			pinTop = pinRef.getBoundingClientRect().top + window.scrollY;
			pinDist = Math.max(1, pinRef.offsetHeight - hero.offsetHeight);
			scrollGain = 1.15 / pinDist;
			refillGain = (STAR_COUNT + 4) / pinDist;
		}

		// give tile i fresh work (image, place, tilt) in place — its id stays,
		// so the DOM element is reused. Only ever called while it is invisible.
		function swapContent(i: number) {
			const fresh = makeStar(
				Math.random,
				stars.filter((_, j) => j !== i),
			);
			const s = stars[i];
			s.src = fresh.src;
			s.x = fresh.x;
			s.y = fresh.y;
			s.w = fresh.w;
			s.rot = fresh.rot;
			s.drift = fresh.drift;
		}

		// the hero's badge, headline, copy and CTA drift up and fade as you
		// scroll into the pin — each on its own stagger and at its own rate, so
		// the column gently parallaxes apart rather than leaving as a block
		function applyContentParallax(p: number) {
			const items = beforeRef?.children;
			if (!items) return;
			for (let k = 0; k < items.length; k++) {
				const el = items[k] as HTMLElement | undefined;
				if (!el) continue;
				const local = Math.min(
					1,
					Math.max(0, (p - k * FRAG_STAGGER) / FRAG_SPAN),
				);
				const e = local * local * (3 - 2 * local); // smoothstep
				const lift = -e * (FRAG_LIFT - k * FRAG_LIFT_STEP);
				el.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0) scale(${(1 - e * 0.04).toFixed(3)})`;
				el.style.opacity = (1 - e).toFixed(3);
			}
		}

		function tick(now: number) {
			// once the button is pushed, release the tiles to the CSS blast
			// animation (clear the inline `animation: none`) and stop the loop
			if (phase === "boom" || phase === "aftermath") {
				const blasting = warpRef?.children;
				if (blasting) {
					for (let i = 0; i < STAR_COUNT; i++) {
						const el = blasting[i] as HTMLElement | undefined;
						if (el) el.style.animation = "";
					}
				}
				raf = 0;
				return;
			}
			const dt = Math.min(now - lastT, 50);
			lastT = now;

			const d = pendingScroll;
			pendingScroll = 0;
			const advance = Math.abs(d) * scrollGain;
			const up = d < 0;
			const down = d > 0;

			// how far past the top of the pin we are, in pin-lengths —
			// uncapped, so the drain is free to run on well past the pin. The
			// field thins linearly from full to empty across DRAIN_REACH of
			// these, so a bigger SCROLL_EXTRA literally stretches the drain.
			const progress = Math.max(0, (window.scrollY - pinTop) / pinDist);
			const target = Math.max(0, STAR_COUNT * (1 - progress / DRAIN_REACH));

			// advance every live tile in lockstep: gentle idle drift + scroll
			for (let i = 0; i < STAR_COUNT; i++) {
				if (parked[i]) continue;
				u[i] += dt / (stars[i].drift * 1000) + advance;
				if (u[i] >= 1) {
					if (down && activeCount > target) {
						// the field is fuller than this point in the pin calls
						// for — sweep this tile away for good, and preload its
						// next image for when scrolling draws it back
						parked[i] = true;
						activeCount--;
						swapContent(i);
					} else if (down) {
						// an extra tile keeping the down-scroll zoom stocked —
						// recycle the very same image and element: the zoom is
						// fast enough to hide the repeat, and it spares a load
						u[i] -= 1;
					} else {
						// idle drift / up-scroll flow → a fresh, unseen image
						u[i] -= 1;
						swapContent(i);
					}
				}
			}

			// scrolling up also draws parked tiles back in from deep space,
			// metered by distance so they zoom in one after another. Each kept
			// the image it loaded while parked, so re-entry never flickers.
			if (up) {
				refillBudget += -d * refillGain;
				while (refillBudget >= 1) {
					const p = parked.indexOf(true);
					if (p === -1) {
						refillBudget = 0;
						break;
					}
					parked[p] = false;
					activeCount++;
					u[p] = -Math.random() * 0.04;
					refillBudget -= 1;
				}
			}

			// at rest at the very top the field is simply full — top up any
			// stragglers, spread through the tunnel rather than bunched deep
			if (window.scrollY <= pinTop + 4) {
				for (let i = 0; i < STAR_COUNT; i++) {
					if (parked[i]) {
						parked[i] = false;
						u[i] = Math.random();
					}
				}
				activeCount = STAR_COUNT;
			}

			const tiles = warpRef?.children;
			if (tiles) {
				for (let i = 0; i < STAR_COUNT; i++) {
					const el = tiles[i] as HTMLElement | undefined;
					if (!el) continue;
					if (parked[i]) {
						el.style.visibility = "hidden";
						continue;
					}
					el.style.visibility = "visible";
					const v = starVisual(u[i], stars[i].rot);
					el.style.transform = v.transform;
					el.style.opacity = v.opacity;
					el.style.filter = v.filter;
				}
			}

			// the headline, badge, copy and button parallax with the scroll
			applyContentParallax(progress);

			raf = heroVisible ? requestAnimationFrame(tick) : 0;
		}

		function pump() {
			if (raf || phase === "boom" || phase === "aftermath") return;
			lastT = performance.now();
			raf = requestAnimationFrame(tick);
		}

		function onScroll() {
			const y = window.scrollY;
			if (heroVisible) pendingScroll += y - lastY;
			lastY = y;
		}

		measure();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", measure);

		// pause the whole loop whenever the hero is off screen — no warp work,
		// no graphics resources spent while the field can't be seen
		const hero = document.getElementById("hero");
		const io = hero
			? new IntersectionObserver(([entry]) => {
					heroVisible = entry.isIntersecting;
					if (heroVisible) {
						// re-entering: drop any scroll banked while away, resume
						measure();
						lastY = window.scrollY;
						pendingScroll = 0;
						pump();
					} else if (raf) {
						cancelAnimationFrame(raf);
						raf = 0;
					}
				})
			: undefined;
		io?.observe(hero!);

		// hand off from the pre-hydration CSS idle drift: read where each tile
		// sits right now, then disable its CSS animation so the loop can take
		// over without a jump
		const handoff = warpRef?.children;
		if (handoff) {
			for (let i = 0; i < STAR_COUNT; i++) {
				const el = handoff[i] as HTMLElement | undefined;
				if (!el) continue;
				// the CSS animation's current iteration progress IS the tile's
				// warp position (delay and all) — pick it up exactly so there
				// is no jump and the seeded spread is preserved
				const prog = el
					.getAnimations()[0]
					?.effect?.getComputedTiming()?.progress;
				if (typeof prog === "number") u[i] = prog;
				el.style.animation = "none";
				const v = starVisual(u[i], stars[i].rot);
				el.style.transform = v.transform;
				el.style.opacity = v.opacity;
				el.style.filter = v.filter;
			}
		}

		pump();

		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", measure);
			io?.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	});

	const currentYear = new Date().getFullYear();

	// ---- destruction sequence ----------------------------------------------
	type Phase = "idle" | "awake" | "pumping" | "boom" | "aftermath";

	let phase = $state<Phase>("idle");
	let pumpCount = $state(0);
	let pumpStroke = $state(0); // 0 = up, 1 = down
	let explosionTick = $state(0);
	let warned = $state(false); // user hovered/peeked
	let prePress = $state(false); // momentary squish on click

	// Button scale is purely derived from pump count (no transition during scale —
	// we apply a per-pump spring via .pulse class instead)
	const buttonScale = $derived(1 + pumpCount * 0.55);

	const buttonLabel = $derived(
		phase === "idle" && !warned
			? "Don't push this button"
			: phase === "idle" && warned
				? "Seriously, don’t."
				: phase === "awake"
					? "uh oh"
					: phase === "pumping" && pumpCount < 3
						? "hey, stop"
						: phase === "pumping"
							? "HELP"
							: "",
	);

	function sleep(ms: number) {
		return new Promise((r) => setTimeout(r, ms));
	}

	async function startDestruction() {
		if (phase !== "idle") return;

		const reduce =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (reduce) {
			phase = "aftermath";
			explosionTick++;
			return;
		}

		// little anticipation squish on press
		prePress = true;
		await sleep(180);
		prePress = false;

		phase = "awake";
		// mascot springs up + settles
		await sleep(1500);

		phase = "pumping";
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

		phase = "boom";
		explosionTick++;
		await sleep(1500);

		phase = "aftermath";
	}

	// ---- contact form ------------------------------------------------------
	let name = $state("");
	let email = $state("");
	let message = $state("");
	let formState = $state<"idle" | "sending" | "sent" | "error">("idle");
	let formError = $state("");

	async function submitContact(e: SubmitEvent) {
		e.preventDefault();
		if (formState === "sending") return;
		if (!name.trim() || !email.trim() || !message.trim()) {
			formError = "Please fill in every field.";
			formState = "error";
			return;
		}
		formState = "sending";
		formError = "";
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, message }),
			});
			if (!res.ok) {
				const txt = await res.text().catch(() => "");
				throw new Error(txt || `Send failed (${res.status})`);
			}
			formState = "sent";
		} catch (err) {
			formState = "error";
			formError = err instanceof Error ? err.message : "Send failed";
		}
	}

	function scrollNext() {
		const hero = document.getElementById("hero");
		// the hero is pinned inside .hero-pin — skip past the whole pin zone
		const pin = hero?.closest(".hero-pin") ?? hero;
		const next = pin?.nextElementSibling as HTMLElement | null;
		const target = next ?? pin;
		if (!target) return;
		const top = target.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top });
	}
</script>

<div
	class="hero-pin"
	class:unpinned={phase === "boom" || phase === "aftermath"}
	bind:this={pinRef}
>
	<section
		class="hero"
		id="hero"
		data-section
		data-section-label="Today"
		data-section-year={currentYear}
		class:shake={phase === "boom"}
		data-phase={phase}
	>
		<div
			class="starfield"
			class:scattering={phase === "boom" || phase === "aftermath"}
			aria-hidden="true"
		>
			<div class="star-warp" bind:this={warpRef}>
				{#each stars as star, i (star.id)}
					<img
						class="star"
						src={media(star.src)}
						alt=""
						loading={i < 8 ? "eager" : "lazy"}
						decoding="async"
						style:--x="{star.x}%"
						style:--y="{star.y}%"
						style:--w={star.w}
						style:--rot="{star.rot}deg"
						style:--u0={seededU[i]}
						style:--drift={star.drift}
						style:transform={seedStyles[i].transform}
						style:opacity={seedStyles[i].opacity}
						style:filter={seedStyles[i].filter}
						style:--blast-spin="{star.rot * 8}deg"
						style:--blast-delay="{(i % 9) * 22}ms"
					/>
				{/each}
			</div>
			<div class="vignette"></div>
		</div>

		<!-- BEFORE: the original content (badge, headline, lede, button) -->
		{#if phase !== "aftermath"}
			<div
				class="hero-inner before"
				class:exploding={phase === "boom"}
				bind:this={beforeRef}
			>
				<div class="badge" data-frag>
					<span class="avatar" aria-hidden="true">
						<img
							src="/profile_picture2.webp"
							alt="Selfie of Brian Schwabauer"
							loading="eager"
							decoding="async"
						/>
					</span>
					<span>Hi, I'm Brian Schwabauer</span>
				</div>

				<h1 data-frag>
					<span class="grad">Delivering</span>
					<span class="grad accent">Delight</span>
				</h1>

				<p class="lede" data-frag>
					For as long as I have lived, I have loved to create. I've built
					startups, developed apps, and produced videos. I live to create. I
					work to delight.
				</p>

				<div class="button-stage" data-frag>
					<button
						class="boom-btn"
						class:warn={warned}
						class:pre-press={prePress}
						class:wobble={phase === "pumping" && pumpCount > 0}
						class:shudder={phase === "pumping" && pumpCount >= 4}
						class:popped={phase === "boom"}
						type="button"
						onmouseenter={() => (warned = true)}
						onmouseleave={() => (warned = phase !== "idle")}
						onfocus={() => (warned = true)}
						onclick={startDestruction}
						disabled={phase !== "idle"}
						aria-label={phase === "idle"
							? "Don't push this button"
							: "Boom in progress"}
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
		{#if phase === "aftermath"}
			<div class="hero-inner aftermath">
				<h1 class="aftermath-h1">
					<span class="line line-1">You destroyed</span>
					<span class="line line-2">my site.</span>
				</h1>
				<p class="aftermath-lede">
					Well&hellip; that escalated. Since you went and blew the place up, the
					least you can do is stick around. Tell me your name and what you want
					to build together — I'll get back to you faster than my poor mascot
					can find his helmet.
				</p>

				<form
					class="contact-form"
					onsubmit={submitContact}
					class:sent={formState === "sent"}
					class:err={formState === "error"}
				>
					{#if formState === "sent"}
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
							<p>Thanks, {name || "friend"}. I'll be in touch soon.</p>
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
								disabled={formState === "sending"}
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
								disabled={formState === "sending"}
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
								disabled={formState === "sending"}
							></textarea>
						</label>

						{#if formError}
							<div class="form-error" role="alert">{formError}</div>
						{/if}

						<button
							class="send-btn"
							type="submit"
							disabled={formState === "sending"}
						>
							{formState === "sending" ? "Sending…" : "Send it"}
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
			class:hidden={phase === "boom"}
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
</div>

<style>
	/* The hero pins in place while the page scrolls under it for an extra
	   --pin-scroll of distance, so the scroll-driven starfield surge has room
	   to be felt before the page moves on to the next section. */
	.hero-pin {
		min-height: calc(100svh + var(--pin-scroll, 650px));
	}
	/* Once the button is pushed, release the pin so the (taller) aftermath
	   content scrolls freely instead of being trapped behind the fold. */
	.hero-pin.unpinned {
		min-height: 0;
	}
	.hero {
		position: sticky;
		top: 0;
		min-height: 100svh;
		display: flex;
		align-items: center;
		justify-content: center;
		/* tight side gutters so the headline can run near the screen edges */
		padding: 5rem 1rem 6rem;
		overflow: hidden;
		isolation: isolate;
		color: #fff;
	}
	/* camera shake on boom */
	.hero.shake {
		animation: cam-shake 720ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
	}
	@keyframes cam-shake {
		0% {
			transform: translate(0, 0);
		}
		10% {
			transform: translate(-6px, 3px) rotate(-0.4deg);
		}
		20% {
			transform: translate(8px, -4px) rotate(0.5deg);
		}
		30% {
			transform: translate(-9px, 6px) rotate(-0.6deg);
		}
		40% {
			transform: translate(7px, 5px) rotate(0.4deg);
		}
		50% {
			transform: translate(-5px, -3px) rotate(-0.3deg);
		}
		60% {
			transform: translate(4px, 4px) rotate(0.3deg);
		}
		70% {
			transform: translate(-3px, -2px);
		}
		80% {
			transform: translate(2px, 2px);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	.starfield {
		position: absolute;
		inset: 0;
		overflow: hidden;
		z-index: 0;
	}
	/* the 3D stage. perspective + a single centred vanishing point make every
	   tile stream straight out from behind the headline; preserve-3d depth-
	   sorts the tiles so a nearer (larger) one always paints over a farther
	   one. overflow MUST stay off this element — any clip flattens the 3D. */
	.star-warp {
		position: absolute;
		inset: 0;
		perspective: 28rem;
		perspective-origin: 50% 50%;
		transform-style: preserve-3d;
	}
	.star {
		position: absolute;
		left: var(--x);
		top: var(--y);
		display: block;
		width: calc(var(--w, 1) * clamp(62px, 9vw, 132px));
		/* a global `img { max-width: 100% }` would otherwise fight the
		   explicit width as perspective scales the tile up */
		max-width: none;
		height: auto;
		object-fit: cover;
		border-radius: 7px;
		box-shadow:
			0 0 34px rgba(0, 244, 195, 0.22),
			0 10px 32px rgba(0, 0, 0, 0.5);
		transform: translate(-50%, -50%);
		transform-origin: center;
		will-change: transform, opacity, filter;
		opacity: 0;
		/* Before hydration this CSS animation runs the idle drift, so the field
		   is alive the instant the page paints — no waiting for JS. --u0 (the
		   seeded warp position) offsets each tile via a negative delay. Once
		   the JS warp loop mounts it reads each tile's progress, sets
		   `animation: none`, and drives transform/opacity/filter itself. */
		animation: star-warp-idle calc(var(--drift, 20) * 1s) linear infinite;
		animation-delay: calc(var(--u0, 0) * var(--drift, 20) * -1s);
	}
	/* the idle drift, kept in exact step with starVisual() in the script (same
	   breakpoints, linear between) so the JS loop can take over mid-stream */
	@keyframes star-warp-idle {
		0% {
			transform: translate(-50%, -50%) translateZ(-260px)
				rotate(var(--rot, 0deg));
			opacity: 0;
			filter: blur(5px) saturate(0.45) brightness(0.7);
		}
		12% {
			transform: translate(-50%, -50%) translateZ(-190.4px)
				rotate(var(--rot, 0deg));
			opacity: 0.9;
			filter: blur(0px) saturate(1.1) brightness(0.766);
		}
		72% {
			transform: translate(-50%, -50%) translateZ(157.6px)
				rotate(var(--rot, 0deg));
			opacity: 0.9;
			filter: blur(0px) saturate(1.1) brightness(1.096);
		}
		100% {
			transform: translate(-50%, -50%) translateZ(320px)
				rotate(var(--rot, 0deg));
			opacity: 0;
			filter: blur(1.5px) saturate(1.1) brightness(1.25);
		}
	}
	/* when boom triggers, kill the warp loop and blast each star outward */
	.starfield.scattering .star {
		animation: star-blast 1150ms cubic-bezier(0.34, 1.15, 0.5, 1) forwards;
		animation-delay: var(--blast-delay, 0ms);
	}
	@keyframes star-blast {
		0% {
			opacity: 0.9;
			transform: translate(-50%, -50%) translateZ(0) rotate(var(--rot, 0deg));
			filter: brightness(1.7) saturate(1.4);
		}
		30% {
			opacity: 1;
			transform: translate(-50%, -50%) translateZ(150px)
				rotate(var(--rot, 0deg));
			filter: brightness(2.6) saturate(1.6);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) translateZ(540px)
				rotate(calc(var(--rot, 0deg) + var(--blast-spin, 0deg)));
			filter: brightness(3) saturate(0.6) blur(3px);
		}
	}
	.vignette {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				ellipse at center,
				transparent 0%,
				rgba(8, 8, 14, 0.78) 65%,
				#06060a 100%
			),
			radial-gradient(
				circle at 20% 30%,
				rgba(108, 99, 255, 0.18),
				transparent 55%
			),
			radial-gradient(
				circle at 80% 70%,
				rgba(0, 244, 195, 0.16),
				transparent 55%
			);
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
		padding: 0.5rem 0.95rem 0.5rem 0.35rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.16);
		font-family: var(--font-mono);
		font-size: 0.9rem;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(8px);
	}
	.avatar {
		position: relative;
		display: inline-block;
		border-bottom-left-radius: 20px;
		overflow: hidden;
		flex-shrink: 0;
		isolation: isolate;
		width: 52px;
		height: 52px;
		margin: -20px 0 -10px -4px;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	h1 {
		font-family: "Nunito Sans", sans-serif;
		font-size: clamp(3rem, 19vw, 5.5rem);
		font-weight: 900;
		line-height: 0.9;
		letter-spacing: -0.04em;
		margin: 0.4rem 0 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}
	@media (min-width: 768px) {
		h1 {
			font-size: clamp(6rem, 11vw, 9rem);
		}
	}
	.grad {
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
		/* fixed footprint so the label can swap without resizing; wide enough
		   for the longest label ("Don't push this button"), and capped to the
		   viewport so it never overflows a narrow phone */
		width: min(280px, 80vw);
		height: 56px;
		padding: 0 1.4rem;
		border-radius: 999px;
		cursor: pointer;
		/* other feedback (squish, label swap) covers the press — no tap flash */
		-webkit-tap-highlight-color: transparent;
		transform-origin: 50% 100%;
		transform: scale(var(--scale));
		transition:
			transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
			color 220ms ease;
		will-change: transform;
	}
	.boom-btn:disabled {
		cursor: default;
	}
	.boom-btn-skin {
		position: absolute;
		inset: 0;
		border-radius: 999px;
		background-color: rgb(255 255 255 / 0.8);
		backdrop-filter: blur(10px);
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
		0% {
			opacity: 0;
			transform: translateY(110%);
			filter: blur(4px);
		}
		60% {
			opacity: 1;
			transform: translateY(-6%);
			filter: blur(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	/* idle invitation pulse */
	.boom-btn:not(:disabled) {
		animation: invite 2.6s ease-in-out infinite;
	}
	@keyframes invite {
		0%,
		100% {
			transform: scale(var(--scale)) translateY(0);
		}
		50% {
			transform: scale(calc(var(--scale) * 1.03)) translateY(-2px);
		}
	}

	.boom-btn:hover:not(:disabled) .boom-btn-skin {
		transition: none;
		background-color: white;
		box-shadow:
			0 20px 50px rgba(0, 242, 195, 0.35),
			0 6px 22px rgba(108, 99, 255, 0.3);
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
		0% {
			transform: scale(calc(var(--scale) * 0.85)) translateY(4px);
		}
		40% {
			transform: scale(calc(var(--scale) * 1.12)) translateY(-4px);
		}
		70% {
			transform: scale(calc(var(--scale) * 0.96)) translateY(2px);
		}
		100% {
			transform: scale(var(--scale)) translateY(0);
		}
	}
	.boom-btn.shudder {
		animation: btn-shudder 220ms ease infinite;
	}
	@keyframes btn-shudder {
		0%,
		100% {
			transform: scale(var(--scale)) translate(0, 0);
		}
		25% {
			transform: scale(var(--scale)) translate(-3px, -1px);
		}
		50% {
			transform: scale(var(--scale)) translate(3px, 1px);
		}
		75% {
			transform: scale(var(--scale)) translate(-2px, 2px);
		}
	}

	/* When it pops, the button vanishes (its mass becomes the canvas particles) */
	.boom-btn.popped {
		animation: btn-pop 280ms ease-in forwards;
		pointer-events: none;
	}
	@keyframes btn-pop {
		0% {
			transform: scale(var(--scale)) translateY(0);
			opacity: 1;
			filter: brightness(2);
		}
		60% {
			transform: scale(calc(var(--scale) * 1.4)) translateY(-4px);
			opacity: 1;
			filter: brightness(3.5);
		}
		100% {
			transform: scale(calc(var(--scale) * 0.1)) translateY(0);
			opacity: 0;
			filter: brightness(5);
		}
	}

	/* fragments fly outward on boom */
	.before {
		transition: filter 300ms ease;
	}
	.before.exploding [data-frag] {
		animation: frag-fly 1100ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
		pointer-events: none;
	}
	.before.exploding [data-frag]:nth-child(1) {
		--fx: -260px;
		--fy: -180px;
		--fr: -18deg;
	}
	.before.exploding [data-frag]:nth-child(2) {
		--fx: 80px;
		--fy: -360px;
		--fr: 12deg;
		animation-delay: 40ms;
	}
	.before.exploding [data-frag]:nth-child(3) {
		--fx: -180px;
		--fy: 240px;
		--fr: -22deg;
		animation-delay: 80ms;
	}
	.before.exploding [data-frag]:nth-child(4) {
		--fx: 280px;
		--fy: 200px;
		--fr: 26deg;
		animation-delay: 120ms;
	}
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
			transform: translate(var(--fx, 0), var(--fy, 0)) rotate(var(--fr, 0))
				scale(0.6);
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
		from {
			opacity: 0;
			transform: translateY(20px);
			filter: blur(8px);
		}
		to {
			opacity: 1;
			transform: none;
			filter: blur(0);
		}
	}
	.aftermath-h1 {
		font-family: "Nunito Sans", sans-serif;
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
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
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
		transition:
			border-color 200ms ease,
			background 200ms ease,
			box-shadow 200ms ease;
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
		transition:
			transform 200ms ease,
			box-shadow 200ms ease,
			opacity 200ms ease;
	}
	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 14px 40px rgba(0, 242, 195, 0.45);
	}
	.send-btn:disabled {
		opacity: 0.6;
		cursor: progress;
	}
	.send-btn svg {
		width: 16px;
		height: 16px;
	}

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
		from {
			opacity: 0;
			transform: scale(0.85);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.form-success h3 {
		font-size: 1.4rem;
		margin: 0.6rem 0 0.2rem;
		color: #00f2c3;
	}
	.form-success p {
		margin: 0;
		color: rgba(255, 255, 255, 0.75);
	}
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
		transition:
			color 200ms ease,
			opacity 380ms ease,
			transform 380ms ease;
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
		0%,
		100% {
			transform: translateY(0);
			border-color: rgba(255, 255, 255, 0.25);
		}
		50% {
			transform: translateY(6px);
			border-color: rgba(0, 242, 195, 0.65);
		}
	}
	.scroll-cue:focus-visible {
		outline: 2px solid #00f2c3;
		outline-offset: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		/* nothing animates to linger for — let the page scroll normally. The
		   warp loop never starts and the idle drift is off, so the field is a
		   calm, static starfield at its seeded positions. */
		.hero-pin {
			min-height: 0;
		}
		.star {
			animation: none;
		}
		.boom-btn {
			animation: none;
		}
		.cue-arrow {
			animation: none;
		}
		.hero.shake {
			animation: none;
		}
		.aftermath {
			animation: none;
		}
	}
</style>
