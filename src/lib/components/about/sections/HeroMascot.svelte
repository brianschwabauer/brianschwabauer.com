<script lang="ts">
	type Phase = "idle" | "awake" | "pumping" | "boom" | "aftermath";

	let {
		phase = "idle",
		pumpCount = 0,
		pumpStroke = 0,
		buttonScale = 1,
	}: {
		phase?: Phase;
		pumpCount?: number;
		pumpStroke?: number;
		buttonScale?: number;
	} = $props();

	const onStage = $derived(
		phase === "awake" || phase === "pumping" || phase === "boom",
	);
	const panicking = $derived(phase === "boom");
	const armDown = $derived(phase === "pumping" && pumpStroke === 1);
	const gaugeGlow = $derived(Math.min(1, pumpCount / 4));
	void buttonScale;
</script>

<div
	class="mascot-root"
	class:on-stage={onStage}
	class:panic={panicking}
	class:gone={phase === "aftermath"}
	aria-hidden="true"
>
	<svg
		class="mascot"
		viewBox="0 0 240 340"
		aria-hidden="true"
		style:--pump-count={pumpCount}
	>
		<defs>
			<linearGradient id="helmet-grad" x1="0.4" x2="0.6" y1="0" y2="1">
				<stop offset="0%" stop-color="#ffd954" />
				<stop offset="60%" stop-color="#ffc107" />
				<stop offset="100%" stop-color="#c38400" />
			</linearGradient>
			<linearGradient id="helmet-shadow" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#a36e00" />
				<stop offset="100%" stop-color="#6b4400" />
			</linearGradient>
			<linearGradient id="skin-grad" x1="0.3" x2="0.7" y1="0" y2="1">
				<stop offset="0%" stop-color="#f3c8a8" />
				<stop offset="100%" stop-color="#d99c75" />
			</linearGradient>
			<linearGradient id="shirt-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#ffd954" />
				<stop offset="100%" stop-color="#e8a000" />
			</linearGradient>
			<linearGradient id="overalls-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#2a4a72" />
				<stop offset="100%" stop-color="#142848" />
			</linearGradient>
			<linearGradient id="boot-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#a86838" />
				<stop offset="100%" stop-color="#5e3416" />
			</linearGradient>
			<linearGradient id="pump-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#33415a" />
				<stop offset="100%" stop-color="#0b121f" />
			</linearGradient>
			<radialGradient id="led-grad" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#fffbe0" />
				<stop offset="50%" stop-color="rgba(255,233,140,0.6)" />
				<stop offset="100%" stop-color="rgba(255,233,140,0)" />
			</radialGradient>
			<radialGradient id="gauge-grad" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#ffe080" />
				<stop offset="100%" stop-color="rgba(255,224,128,0)" />
			</radialGradient>
		</defs>

		<!-- ground shadow (sits on the floor, doesn't move with the dipping body) -->
		<ellipse
			class="ground-shadow"
			cx="120"
			cy="328"
			rx="68"
			ry="7"
			fill="rgba(0,0,0,0.55)"
		/>

		<!-- BODY: breathing layer (subtle scale loop) -->
		<g class="body">
			<!-- BOOTS — stay planted on the floor, no dip transform -->
			<g class="boots">
					<rect
						x="80"
						y="282"
						width="32"
						height="10"
						rx="3"
						fill="#d5d5d5"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<rect
						x="128"
						y="282"
						width="32"
						height="10"
						rx="3"
						fill="#d5d5d5"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<path
						d="M78 292 L114 292 L114 310 Q114 320 104 320 L78 320 Q70 320 70 312 Z"
						fill="url(#boot-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
					<path
						d="M126 292 L162 292 L170 312 Q170 320 162 320 L136 320 Q126 320 126 310 Z"
						fill="url(#boot-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
					<rect
						x="70"
						y="313"
						width="44"
						height="3"
						fill="rgba(255,255,255,0.15)"
					/>
					<rect
						x="126"
						y="313"
						width="44"
						height="3"
						fill="rgba(255,255,255,0.15)"
					/>
				</g>

			<!-- LEGS — squash on the down stroke so the knees bend while the
				 boots stay planted. -->
			<g class="leg-pose" class:dip={armDown}>
				<g class="legs">
					<path
						d="M84 230 L114 230 L114 285 Q114 290 108 290 L84 290 Q78 290 78 284 Z"
						fill="url(#overalls-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
					<path
						d="M126 230 L156 230 L162 284 Q162 290 156 290 L132 290 Q126 290 126 285 Z"
						fill="url(#overalls-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
				</g>
			</g>

			<!-- UPPER BODY (torso, head, pump handle, arms) — translates down on
				 the down stroke. The pump-back below stays anchored to the
				 ground and renders LAST so it sits in front of the torso (no
				 clipping) and visually swallows the bottom of the rod. -->
			<g class="upper-pose" class:dip={armDown}>
				<!-- TORSO -->
				<g class="torso">
					<path
						d="M76 168 Q120 158 164 168 L168 200 Q120 196 72 200 Z"
						fill="url(#shirt-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
					<path
						d="M74 192 Q120 184 166 192 L170 238 Q120 244 70 238 Z"
						fill="url(#overalls-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>
					<path
						d="M96 168 L92 195 L100 198 L104 172 Z"
						fill="url(#overalls-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
						stroke-linejoin="round"
					/>
					<path
						d="M144 172 L148 198 L156 195 L152 168 Z"
						fill="url(#overalls-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
						stroke-linejoin="round"
					/>
					<circle
						cx="100"
						cy="200"
						r="3.5"
						fill="#ffd954"
						stroke="#1a1a1a"
						stroke-width="1.2"
					/>
					<circle
						cx="140"
						cy="200"
						r="3.5"
						fill="#ffd954"
						stroke="#1a1a1a"
						stroke-width="1.2"
					/>
					<line
						x1="120"
						y1="208"
						x2="120"
						y2="232"
						stroke="#0a1c36"
						stroke-width="1.5"
						stroke-linecap="round"
						opacity="0.7"
					/>
				</g>

				<!-- HEAD -->
				<g class="head">
					<ellipse
						cx="63"
						cy="118"
						rx="7"
						ry="11"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<ellipse
						cx="177"
						cy="118"
						rx="7"
						ry="11"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<ellipse
						cx="64"
						cy="118"
						rx="3"
						ry="6"
						fill="#b87a55"
						opacity="0.7"
					/>
					<ellipse
						cx="176"
						cy="118"
						rx="3"
						ry="6"
						fill="#b87a55"
						opacity="0.7"
					/>

					<path
						class="face"
						d="M70 95 Q70 70 120 65 Q170 70 170 95 L170 138 Q170 168 120 172 Q70 168 70 138 Z"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2.5"
						stroke-linejoin="round"
					/>

					<path
						d="M70 90 Q80 78 92 84 L92 100 Q80 102 70 100 Z"
						fill="#1a1a1a"
					/>
					<path
						d="M170 90 Q160 78 148 84 L148 100 Q160 102 170 100 Z"
						fill="#1a1a1a"
					/>

					<path
						class="brow brow-left"
						d="M82 102 Q98 96 110 102"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="5"
						stroke-linecap="round"
					/>
					<path
						class="brow brow-right"
						d="M130 102 Q142 96 158 102"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="5"
						stroke-linecap="round"
					/>

					<g class="eye eye-left">
						<ellipse
							cx="96"
							cy="118"
							rx="10"
							ry="11"
							fill="#ffffff"
							stroke="#1a1a1a"
							stroke-width="2.2"
						/>
						<circle
							class="pupil pupil-left"
							cx="98"
							cy="120"
							r="5"
							fill="#1a1a1a"
						/>
						<circle cx="100" cy="117" r="2" fill="#ffffff" />
					</g>
					<g class="eye eye-right">
						<ellipse
							cx="144"
							cy="118"
							rx="10"
							ry="11"
							fill="#ffffff"
							stroke="#1a1a1a"
							stroke-width="2.2"
						/>
						<circle
							class="pupil pupil-right"
							cx="146"
							cy="120"
							r="5"
							fill="#1a1a1a"
						/>
						<circle cx="148" cy="117" r="2" fill="#ffffff" />
					</g>

					<path
						d="M114 132 Q120 142 126 132 Q124 138 120 138 Q116 138 114 132 Z"
						fill="#c89770"
						stroke="#1a1a1a"
						stroke-width="1.6"
						stroke-linejoin="round"
					/>

					<path
						class="mouth mouth-smirk"
						d="M106 152 Q120 162 134 152"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						class="mouth mouth-strain"
						d="M106 156 Q120 146 134 156 Q120 162 106 156 Z"
						fill="#5a1818"
						stroke="#1a1a1a"
						stroke-width="2"
						stroke-linejoin="round"
					/>

					<g class="helmet">
						<path
							class="helmet-dome"
							d="M52 92 Q60 38 120 32 Q180 38 188 92 Q188 96 184 98 L56 98 Q52 96 52 92 Z"
							fill="url(#helmet-grad)"
							stroke="#1a1a1a"
							stroke-width="3"
							stroke-linejoin="round"
						/>
						<path
							d="M58 92 Q70 84 120 84 Q170 84 182 92 L180 100 Q120 102 60 100 Z"
							fill="url(#helmet-shadow)"
						/>
						<ellipse
							cx="120"
							cy="98"
							rx="72"
							ry="10"
							fill="url(#helmet-grad)"
							stroke="#1a1a1a"
							stroke-width="3"
						/>
						<path
							d="M64 88 Q78 60 96 54"
							fill="none"
							stroke="rgba(255,255,255,0.45)"
							stroke-width="3"
							stroke-linecap="round"
						/>
						<circle cx="120" cy="42" r="9" fill="url(#led-grad)" class="led" />
						<circle cx="120" cy="42" r="3" fill="#fffbe0" />
					</g>
				</g>

				<!-- PUMP — T-handle (bar + tall rod). The rod extends down to the
					 pump body which now sits on the ground. The cap of the
					 cylinder visually covers the lower portion of this rod so it
					 looks like the rod slides into the cylinder on each stroke. -->
				<g class="pump-handle" class:down={armDown}>
					<!-- tall vertical rod from just below the bar down into the cap -->
					<rect x="117" y="218" width="6" height="58" rx="2" fill="#1a2230" />
					<!-- the horizontal bar both fists grip -->
					<rect
						x="88"
						y="206"
						width="64"
						height="12"
						rx="4"
						fill="url(#pump-grad)"
						stroke="#1a1a1a"
						stroke-width="1.8"
					/>
					<rect
						x="92"
						y="208"
						width="56"
						height="3"
						rx="1.5"
						fill="rgba(255,255,255,0.22)"
					/>
				</g>

				<!-- ARMS — both come straight down from the shoulders and grip the
					 bar with little fists, then rotate slightly on the down stroke. -->
				<g class="arm arm-left" class:down={armDown}>
					<!-- yellow shirt sleeve cap (at the shoulder) -->
					<ellipse
						cx="92"
						cy="180"
						rx="14"
						ry="12"
						fill="url(#shirt-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<!-- forearm dropping down to the handle -->
					<path
						d="M82 190 Q86 195 88 200 L96 218 Q104 220 110 218 L106 198 Q104 192 102 188 Z"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2.2"
						stroke-linejoin="round"
					/>
					<!-- fist gripping the left side of the bar -->
					<circle
						cx="102"
						cy="215"
						r="9"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<!-- thumb curl -->
					<path
						d="M97 208 Q100 205 105 208"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</g>

				<g class="arm arm-right" class:down={armDown}>
					<ellipse
						cx="148"
						cy="180"
						rx="14"
						ry="12"
						fill="url(#shirt-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<path
						d="M138 188 Q136 192 134 198 L130 218 Q136 220 144 218 L152 200 Q154 195 158 190 Z"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2.2"
						stroke-linejoin="round"
					/>
					<circle
						cx="138"
						cy="215"
						r="9"
						fill="url(#skin-grad)"
						stroke="#1a1a1a"
						stroke-width="2"
					/>
					<path
						d="M133 208 Q136 205 141 208"
						fill="none"
						stroke="#1a1a1a"
						stroke-width="1.5"
						stroke-linecap="round"
					/>
				</g>
			</g>

			<!-- PUMP — body (cylinder + cap + gauge). Sits on the ground (bottom
				 aligned with the boots) and renders AFTER everything else so it
				 sits in front of the torso and visibly swallows the rod. -->
			<g class="pump-back" class:compressed={armDown}>
				<!-- cap covers the rod bottom — rod slides into the cap on a stroke -->
				<rect
					x="86"
					y="264"
					width="68"
					height="10"
					rx="3"
					fill="#0a0e15"
					stroke="#1a1a1a"
					stroke-width="2"
				/>
				<!-- main cylinder, bottom at the feet/floor level -->
				<rect
					x="92"
					y="270"
					width="56"
					height="50"
					rx="6"
					fill="url(#pump-grad)"
					stroke="#1a1a1a"
					stroke-width="2"
				/>
				<line x1="100" y1="286" x2="140" y2="286" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
				<line x1="100" y1="292" x2="140" y2="292" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
				<g class="gauge">
					<circle cx="120" cy="300" r="11" fill="#0a0e15" stroke="#1a1a1a" stroke-width="1.8" />
					<circle cx="120" cy="300" r="10" fill="url(#gauge-grad)" style:opacity={gaugeGlow} />
					<line
						class="needle"
						x1="120"
						y1="300"
						x2="120"
						y2="292"
						stroke="#ff5a3c"
						stroke-width="2.2"
						stroke-linecap="round"
						style:transform-origin="120px 300px"
					/>
				</g>
			</g>
		</g>
	</svg>
</div>

<style>
	.mascot-root {
		position: absolute;
		bottom: 0;
		left: 10%;
		width: clamp(144px, 19vw, 288px);
		height: clamp(184px, 26vw, 352px);
		transform: translate(80%, 110%);
		opacity: 0;
		pointer-events: none;
		z-index: 6;
		filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.55));
		transition:
			transform 1100ms cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 380ms ease 220ms;
	}
	.mascot-root.on-stage {
		opacity: 1;
		transform: translate(80%, 12%);
	}
	.mascot-root.panic {
		transform: translate(110%, 90%) rotate(8deg);
		opacity: 0.95;
		transition:
			transform 480ms cubic-bezier(0.7, -0.4, 0.4, 1),
			opacity 480ms ease;
	}
	.mascot-root.gone {
		transform: translate(110%, 130%) rotate(14deg);
		opacity: 0;
		transition:
			transform 600ms ease,
			opacity 600ms ease;
	}

	.mascot {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.ground-shadow {
		transform-origin: 120px 328px;
		transition: transform 220ms ease;
	}

	/* BODY: subtle breathing (constant loop). The pose layer below handles
	   the snappy knee-bend that happens during a pump stroke. */
	.body {
		transform-origin: 120px 290px;
		animation: breathe 3.6s ease-in-out infinite;
	}
	@keyframes breathe {
		0%,
		100% {
			transform: scaleY(1) scaleX(1);
		}
		50% {
			transform: scaleY(1.012) scaleX(0.994);
		}
	}

	/* POSE: the down stroke bends the knees. Boots stay planted on the
	   ground, the legs squash from the boot top, and the upper body
	   (torso/head/handle/arms) translates straight down so it follows
	   the hips. The pump cylinder is a sibling, untouched, so it stays
	   anchored to the floor while the handle (inside upper-pose) is
	   pushed down with the mascot's hands. */
	.leg-pose {
		transform-origin: 120px 290px;
		transition: transform 220ms cubic-bezier(0.7, 0, 0.4, 1);
	}
	.leg-pose.dip {
		transform: scaleY(0.7);
	}
	.upper-pose {
		transform-origin: 120px 230px;
		transition: transform 220ms cubic-bezier(0.7, 0, 0.4, 1);
	}
	.upper-pose.dip {
		transform: translateY(18px);
	}

	/* HEAD bobs subtly */
	.head {
		transform-origin: 120px 172px;
		animation: head-bob 3.6s ease-in-out infinite;
	}
	@keyframes head-bob {
		0%,
		100% {
			transform: translateY(0) rotate(-0.6deg);
		}
		50% {
			transform: translateY(-1.4px) rotate(0.6deg);
		}
	}

	/* HELMET wobble (follow-through) */
	.helmet {
		transform-origin: 120px 98px;
		animation: helmet-wobble 3.6s ease-in-out infinite;
	}
	@keyframes helmet-wobble {
		0%,
		100% {
			transform: rotate(-1.4deg);
		}
		50% {
			transform: rotate(1.4deg);
		}
	}

	/* EYES: glance side to side */
	.pupil {
		transform-origin: center;
		animation: pupil-glance 4.2s ease-in-out infinite;
	}
	@keyframes pupil-glance {
		0%,
		30% {
			transform: translate(0, 0);
		}
		38% {
			transform: translate(-2.5px, 0);
		}
		55% {
			transform: translate(-2.5px, 0);
		}
		60% {
			transform: translate(0, 0);
		}
		70% {
			transform: translate(2px, 0);
		}
		85% {
			transform: translate(2px, 0);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	/* MOUTH swap based on pressure */
	.mouth {
		transition: opacity 280ms ease;
	}
	.mouth-strain {
		opacity: 0;
	}
	.mascot[style*="--pump-count: 3"] .mouth-strain,
	.mascot[style*="--pump-count: 4"] .mouth-strain {
		opacity: 1;
	}
	.mascot[style*="--pump-count: 3"] .mouth-smirk,
	.mascot[style*="--pump-count: 4"] .mouth-smirk {
		opacity: 0;
	}

	/* LED pulse */
	.led {
		animation: led-pulse 2.4s ease-in-out infinite;
	}
	@keyframes led-pulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* ARMS — both pivot at the shoulder, swinging slightly down on the stroke.
	   The body dip carries them further down so the fists track the handle. */
	.arm-left {
		transform-origin: 92px 180px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-left.down {
		transform: rotate(6deg);
	}
	.arm-right {
		transform-origin: 148px 180px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-right.down {
		transform: rotate(-6deg);
	}

	/* PUMP — handle bar travels down on the stroke; cylinder squashes slightly */
	.pump-handle {
		transform-origin: 120px 220px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.pump-handle.down {
		/* small extra travel on top of the body dip — both fists and bar end up
		   in roughly the same place at the bottom of the stroke. */
		transform: translateY(4px);
	}
	.pump-back {
		/* origin at the bottom of the cylinder (floor) so the squash compresses
		   downward into the ground rather than floating off it. */
		transform-origin: 120px 320px;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.pump-back.compressed {
		transform: scaleY(0.94) scaleX(1.03);
	}

	.needle {
		transform: rotate(calc(-80deg + var(--pump-count, 0) * 35deg));
		transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* PANIC */
	.mascot-root.panic .body {
		animation: panic-shake 420ms ease both;
	}
	@keyframes panic-shake {
		0% {
			transform: translate(0, 0) rotate(0);
		}
		25% {
			transform: translate(-3px, -2px) rotate(-2deg);
		}
		60% {
			transform: translate(8px, 3px) rotate(6deg);
		}
		100% {
			transform: translate(14px, 14px) rotate(10deg);
		}
	}
	.mascot-root.panic .helmet {
		animation: helmet-fly 600ms ease-out forwards;
	}
	@keyframes helmet-fly {
		0% {
			transform: translate(0, 0) rotate(0);
		}
		100% {
			transform: translate(40px, -70px) rotate(140deg);
		}
	}
	.mascot-root.panic .pump-back,
	.mascot-root.panic .pump-handle {
		animation: pump-drop 500ms ease-in forwards;
	}
	@keyframes pump-drop {
		0% {
			transform: translate(0, 0) rotate(0);
		}
		100% {
			transform: translate(-18px, 30px) rotate(-22deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.body,
		.head,
		.helmet,
		.pupil,
		.led {
			animation: none;
		}
	}
</style>
