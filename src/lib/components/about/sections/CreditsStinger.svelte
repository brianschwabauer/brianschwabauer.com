<script lang="ts">
	/**
	 * The post-credits scene. The mascot from the hero comes back out with a
	 * broom to sweep up after the party, then the page signs off.
	 *
	 * The character is redrawn here rather than shared with `HeroMascot.svelte`:
	 * the two poses differ exactly where the drawing is most intricate (those
	 * arms grip a pump handle, these grip a broom), and the hero's pump rig is
	 * wired into its own scroll choreography. Same coordinates, same palette,
	 * same shapes everywhere else — it is deliberately the same character.
	 */

	/** Lying where the confetti fell — x/y in %, rotation, colour from TheEnd. */
	const SCRAPS = [
		{ x: 16, y: -6, r: -18, c: '#00f2c3' },
		{ x: 25, y: -2, r: 12, c: '#ffd66e' },
		{ x: 34, y: -8, r: 34, c: '#ff8b8b' },
		{ x: 43, y: -3, r: -7, c: '#00d6ff' },
		{ x: 52, y: -7, r: 22, c: '#a78bfa' },
		{ x: 61, y: -2, r: -29, c: '#ffd66e' },
		{ x: 70, y: -6, r: 8, c: '#00f2c3' },
		{ x: 79, y: -3, r: -14, c: '#ff8b8b' },
	];

	let section_el = $state<HTMLElement | null>(null);
	let playing = $state(false);
	let reduced = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	// Plays once per page load. Re-running it every time the section scrolls back
	// into view would turn a sight gag into a loop.
	$effect(() => {
		if (!section_el || reduced) return;
		if (typeof IntersectionObserver === 'undefined') {
			playing = true;
			return;
		}
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				playing = true;
				io.disconnect();
			},
			{ threshold: 0.5 },
		);
		io.observe(section_el);
		return () => io.disconnect();
	});

	const done = $derived(reduced);
</script>

<section
	bind:this={section_el}
	id="stinger"
	class="stinger"
	class:playing
	class:done
	aria-label="Post-credits scene">
	<div class="floor" aria-hidden="true">
		{#each SCRAPS as scrap, i}
			<span
				class="scrap"
				style:--x="{scrap.x}%"
				style:--y="{scrap.y}px"
				style:--r="{scrap.r}deg"
				style:--c={scrap.c}
				style:--i={SCRAPS.length - 1 - i}>
			</span>
		{/each}
	</div>

	<div class="walker" aria-hidden="true">
		<svg class="mascot" viewBox="0 0 300 340">
			<defs>
				<linearGradient id="stinger-helmet" x1="0.4" x2="0.6" y1="0" y2="1">
					<stop offset="0%" stop-color="#ffd954" />
					<stop offset="60%" stop-color="#ffc107" />
					<stop offset="100%" stop-color="#c38400" />
				</linearGradient>
				<linearGradient id="stinger-helmet-shadow" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#a36e00" />
					<stop offset="100%" stop-color="#6b4400" />
				</linearGradient>
				<linearGradient id="stinger-skin" x1="0.3" x2="0.7" y1="0" y2="1">
					<stop offset="0%" stop-color="#f3c8a8" />
					<stop offset="100%" stop-color="#d99c75" />
				</linearGradient>
				<linearGradient id="stinger-shirt" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#ffd954" />
					<stop offset="100%" stop-color="#e8a000" />
				</linearGradient>
				<linearGradient id="stinger-overalls" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#2a4a72" />
					<stop offset="100%" stop-color="#142848" />
				</linearGradient>
				<linearGradient id="stinger-boot" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stop-color="#a86838" />
					<stop offset="100%" stop-color="#5e3416" />
				</linearGradient>
			</defs>

			<ellipse cx="120" cy="328" rx="62" ry="6" fill="rgba(0,0,0,0.5)" />

			<!-- BROOM — held out ahead, sweeping across the floor. -->
			<g class="broom">
				<rect
					x="186"
					y="150"
					width="7"
					height="150"
					rx="3"
					fill="#b07a3c"
					stroke="#1a1a1a"
					stroke-width="2"
					transform="rotate(24 189 300)" />
				<g transform="rotate(24 189 300)">
					<rect
						x="152"
						y="296"
						width="76"
						height="18"
						rx="4"
						fill="#2a4a72"
						stroke="#1a1a1a"
						stroke-width="2.2" />
					<path
						d="M154 314 L150 332 M164 314 L161 332 M174 314 L172 332 M184 314 L183 332
						   M194 314 L195 332 M204 314 L206 332 M214 314 L217 332 M224 314 L228 332"
						stroke="#d8a24a"
						stroke-width="3"
						stroke-linecap="round" />
				</g>
			</g>

			<g class="body">
				<g class="boots">
					<path
						d="M78 292 L114 292 L114 310 Q114 320 104 320 L78 320 Q70 320 70 312 Z"
						fill="url(#stinger-boot)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
					<path
						d="M126 292 L162 292 L170 312 Q170 320 162 320 L136 320 Q126 320 126 310 Z"
						fill="url(#stinger-boot)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
				</g>

				<g class="legs">
					<path
						d="M84 230 L114 230 L114 285 Q114 290 108 290 L84 290 Q78 290 78 284 Z"
						fill="url(#stinger-overalls)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
					<path
						d="M126 230 L156 230 L162 284 Q162 290 156 290 L132 290 Q126 290 126 285 Z"
						fill="url(#stinger-overalls)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
				</g>

				<g class="torso">
					<path
						d="M76 168 Q120 158 164 168 L168 200 Q120 196 72 200 Z"
						fill="url(#stinger-shirt)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
					<path
						d="M74 192 Q120 184 166 192 L170 238 Q120 244 70 238 Z"
						fill="url(#stinger-overalls)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
					<path
						d="M96 168 L92 195 L100 198 L104 172 Z"
						fill="url(#stinger-overalls)"
						stroke="#1a1a1a"
						stroke-width="2"
						stroke-linejoin="round" />
					<path
						d="M144 172 L148 198 L156 195 L152 168 Z"
						fill="url(#stinger-overalls)"
						stroke="#1a1a1a"
						stroke-width="2"
						stroke-linejoin="round" />
					<circle
						cx="100"
						cy="200"
						r="3.5"
						fill="#ffd954"
						stroke="#1a1a1a"
						stroke-width="1.2" />
					<circle
						cx="140"
						cy="200"
						r="3.5"
						fill="#ffd954"
						stroke="#1a1a1a"
						stroke-width="1.2" />
				</g>

				<g class="head">
					<ellipse
						cx="63"
						cy="118"
						rx="7"
						ry="11"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2" />
					<ellipse
						cx="177"
						cy="118"
						rx="7"
						ry="11"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2" />
					<path
						d="M70 95 Q70 70 120 65 Q170 70 170 95 L170 138 Q170 168 120 172 Q70 168 70 138 Z"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round" />
					<path d="M70 90 Q80 78 92 84 L92 100 Q80 102 70 100 Z" fill="#1a1a1a" />
					<path d="M170 90 Q160 78 148 84 L148 100 Q160 102 170 100 Z" fill="#1a1a1a" />
					<path
						d="M82 102 Q98 96 110 102"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="5"
						stroke-linecap="round" />
					<path
						d="M130 102 Q142 96 158 102"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="5"
						stroke-linecap="round" />
					<g class="eye">
						<ellipse
							cx="96"
							cy="118"
							rx="10"
							ry="11"
							fill="#ffffff"
							stroke="#1a1a1a"
							stroke-width="2.2" />
						<circle cx="98" cy="120" r="5" fill="#1a1a1a" />
						<circle cx="100" cy="117" r="2" fill="#ffffff" />
					</g>
					<g class="eye">
						<ellipse
							cx="144"
							cy="118"
							rx="10"
							ry="11"
							fill="#ffffff"
							stroke="#1a1a1a"
							stroke-width="2.2" />
						<circle cx="146" cy="120" r="5" fill="#1a1a1a" />
						<circle cx="148" cy="117" r="2" fill="#ffffff" />
					</g>
					<path
						d="M114 132 Q120 142 126 132 Q124 138 120 138 Q116 138 114 132 Z"
						fill="#c89770"
						stroke="#1a1a1a"
						stroke-width="1.6"
						stroke-linejoin="round" />
					<path
						d="M106 152 Q120 162 134 152"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="3"
						stroke-linecap="round" />
					<g class="helmet">
						<path
							d="M52 92 Q60 38 120 32 Q180 38 188 92 Q188 96 184 98 L56 98 Q52 96 52 92 Z"
							fill="url(#stinger-helmet)"
							stroke="#1a1a1a"
							stroke-width="3"
							stroke-linejoin="round" />
						<path
							d="M58 92 Q70 84 120 84 Q170 84 182 92 L180 100 Q120 102 60 100 Z"
							fill="url(#stinger-helmet-shadow)" />
						<ellipse
							cx="120"
							cy="98"
							rx="72"
							ry="10"
							fill="url(#stinger-helmet)"
							stroke="#1a1a1a"
							stroke-width="3" />
						<path
							d="M64 88 Q78 60 96 54"
							fill="none"
							stroke="rgba(255,255,255,0.45)"
							stroke-width="3"
							stroke-linecap="round" />
					</g>
				</g>

				<!-- ARMS — reaching forward to the broom handle instead of down to a
					 pump bar. Same sleeve caps, same skin, same fists. -->
				<g class="arm">
					<ellipse
						cx="148"
						cy="180"
						rx="14"
						ry="12"
						fill="url(#stinger-shirt)"
						stroke="#1a1a1a"
						stroke-width="2" />
					<path
						d="M142 172 Q158 168 172 176 L182 190 Q176 198 168 196 L152 188 Q146 182 142 178 Z"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2.2"
						stroke-linejoin="round" />
					<circle
						cx="176"
						cy="190"
						r="9"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2" />
				</g>
				<g class="arm">
					<ellipse
						cx="92"
						cy="180"
						rx="14"
						ry="12"
						fill="url(#stinger-shirt)"
						stroke="#1a1a1a"
						stroke-width="2" />
					<path
						d="M88 190 Q104 200 124 216 L136 232 Q130 240 122 236 L102 216 Q94 206 86 198 Z"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2.2"
						stroke-linejoin="round" />
					<circle
						cx="130"
						cy="232"
						r="9"
						fill="url(#stinger-skin)"
						stroke="#1a1a1a"
						stroke-width="2" />
				</g>
			</g>
		</svg>
	</div>

	<div class="signoff">
		<p class="title">Brian Schwabauer will return</p>
		<p class="sub">in: whatever gets built next.</p>
	</div>
</section>

<style>
	.stinger {
		position: relative;
		min-height: 70svh;
		overflow: clip;
		background: #000;
		content-visibility: auto;
		contain-intrinsic-size: 1px 70svh;
	}

	.floor {
		position: absolute;
		left: 0;
		right: 0;
		bottom: clamp(5rem, 16vh, 9rem);
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(246, 242, 232, 0.22) 12%,
			rgba(246, 242, 232, 0.22) 88%,
			transparent
		);
	}
	.scrap {
		position: absolute;
		left: var(--x);
		bottom: calc(1px - var(--y));
		width: 9px;
		height: 4px;
		border-radius: 1px;
		background: var(--c);
		rotate: var(--r);
		opacity: 0.85;
	}
	/* Swept away as the broom reaches them. The mascot walks in from the right,
	   so the stagger runs right-to-left — hence the reversed index. */
	.stinger.playing .scrap {
		animation: swept 700ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
		/* Paced to the walk-in, not to the sweep gesture: each scrap goes as the
		   mascot actually reaches it, and the two deliberate passes at the end
		   clear up whatever is left nearest the exit. */
		animation-delay: calc(0.75s + var(--i) * 190ms);
	}
	@keyframes swept {
		to {
			translate: -40px 0;
			opacity: 0;
		}
	}

	.walker {
		position: absolute;
		bottom: calc(clamp(5rem, 16vh, 9rem) - 4px);
		left: 0;
		width: clamp(112px, 13vw, 172px);
		aspect-ratio: 300 / 340;
		/* Parked off the right edge until the scene plays. */
		translate: 130vw 0;
	}
	.stinger.playing .walker {
		animation: cross 4.4s linear forwards;
	}
	@keyframes cross {
		0% {
			translate: 105vw 0;
		}
		45% {
			translate: 34vw 0;
		}
		/* the two sweep passes happen here, standing still */
		68% {
			translate: 28vw 0;
		}
		100% {
			translate: -40vw 0;
		}
	}
	.mascot {
		width: 100%;
		height: 100%;
		overflow: visible;
		filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.6));
	}

	/* Walk: a bob and a slight lean, which reads as walking at this size without
	   articulating the legs. */
	.stinger.playing .body {
		transform-origin: 120px 320px;
		animation: step 460ms ease-in-out infinite;
	}
	@keyframes step {
		0%,
		100% {
			transform: translateY(0) rotate(-1.2deg);
		}
		50% {
			transform: translateY(-4px) rotate(1.2deg);
		}
	}
	.stinger.playing .broom {
		transform-origin: 189px 300px;
		animation: sweep 700ms ease-in-out 2s 2 both;
	}
	@keyframes sweep {
		0%,
		100% {
			transform: rotate(0deg);
		}
		50% {
			transform: rotate(-26deg);
		}
	}

	.signoff {
		position: absolute;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
		width: min(40rem, 88vw);
		text-align: center;
		opacity: 0;
	}
	.stinger.playing .signoff {
		animation: rise 900ms cubic-bezier(0.16, 1, 0.3, 1) 5s forwards;
	}
	@keyframes rise {
		from {
			opacity: 0;
			translate: -50% calc(-50% + 18px);
		}
		to {
			opacity: 1;
			translate: -50% -50%;
		}
	}
	.title {
		margin: 0 0 0.9rem;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: clamp(1.5rem, 4.2vw, 2.6rem);
		line-height: 1.15;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #f6f2e8;
	}
	.sub {
		margin: 0;
		font-family: var(--font-mono);
		font-size: clamp(0.65rem, 1.5vw, 0.78rem);
		letter-spacing: 0.22em;
		color: rgba(246, 242, 232, 0.5);
	}

	/* Reduced motion: no performance — the scraps are already swept, the mascot
	   has already gone, and the sign-off is simply there. */
	.stinger.done .walker {
		display: none;
	}
	.stinger.done .signoff {
		opacity: 1;
	}
</style>
