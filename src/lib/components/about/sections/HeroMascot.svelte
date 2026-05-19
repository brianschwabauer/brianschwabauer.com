<script lang="ts">
	type Phase = 'idle' | 'awake' | 'pumping' | 'boom' | 'aftermath';

	let {
		phase = 'idle',
		pumpCount = 0,
		pumpStroke = 0,
		buttonScale = 1
	}: {
		phase?: Phase;
		pumpCount?: number;
		pumpStroke?: number;
		buttonScale?: number;
	} = $props();

	// awake/pumping/boom => mascot is on stage
	const onStage = $derived(phase === 'awake' || phase === 'pumping' || phase === 'boom');
	// boom => he's about to scatter (panic + duck)
	const panicking = $derived(phase === 'boom');
	// pumping triggers the arm push
	const armDown = $derived(phase === 'pumping' && pumpStroke === 1);
	// glow on the gauge ramps up with pressure
	const gaugeGlow = $derived(Math.min(1, pumpCount / 4));
	// hose bulges with each pump
	const hosePulse = $derived(pumpStroke === 1 ? 1 : 0);
	// hose end is anchored to the right side of the (scaled) button
	const hoseStretch = $derived(buttonScale > 1 ? Math.min(buttonScale, 3.5) : 1);
</script>

<div
	class="mascot-root"
	class:on-stage={onStage}
	class:panic={panicking}
	class:gone={phase === 'aftermath'}
	aria-hidden="true"
>
	<!-- the hose is its own SVG so it can stretch toward the button -->
	<svg class="hose" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<linearGradient id="hose-grad" x1="0" x2="1" y1="0" y2="0">
				<stop offset="0%" stop-color="#3a2a18" />
				<stop offset="60%" stop-color="#5b4326" />
				<stop offset="100%" stop-color="#2a1f10" />
			</linearGradient>
		</defs>
		<path
			class="hose-tube"
			d="M 10 40 C 60 40 100 18 195 22"
			fill="none"
			stroke="url(#hose-grad)"
			stroke-width="12"
			stroke-linecap="round"
			style:--pulse={hosePulse}
		/>
		<path
			class="hose-highlight"
			d="M 10 36 C 60 36 100 14 195 18"
			fill="none"
			stroke="rgba(255,255,255,0.18)"
			stroke-width="2"
			stroke-linecap="round"
		/>
	</svg>

	<svg
		class="mascot"
		viewBox="0 0 240 320"
		aria-hidden="true"
		style:--pump-count={pumpCount}
		style:--button-scale={buttonScale}
	>
		<defs>
			<radialGradient id="body-shade" cx="0.35" cy="0.3" r="0.8">
				<stop offset="0%" stop-color="#1a2230" />
				<stop offset="60%" stop-color="#0c1018" />
				<stop offset="100%" stop-color="#06080d" />
			</radialGradient>
			<linearGradient id="helmet-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#ffe576" />
				<stop offset="55%" stop-color="#ffd934" />
				<stop offset="100%" stop-color="#c79900" />
			</linearGradient>
			<radialGradient id="helmet-light" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#fffae0" />
				<stop offset="60%" stop-color="rgba(255,236,150,0.6)" />
				<stop offset="100%" stop-color="rgba(255,236,150,0)" />
			</radialGradient>
			<linearGradient id="pump-grad" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stop-color="#2a3142" />
				<stop offset="100%" stop-color="#0e131c" />
			</linearGradient>
			<radialGradient id="gauge-grad" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0%" stop-color="#ffe080" />
				<stop offset="100%" stop-color="rgba(255,224,128,0)" />
			</radialGradient>
		</defs>

		<!-- ground shadow -->
		<ellipse class="ground-shadow" cx="120" cy="300" rx="80" ry="10" fill="rgba(0,0,0,0.5)" />

		<!-- BODY (everything that breathes / squashes together) -->
		<g class="body">
			<!-- legs -->
			<g class="legs">
				<rect class="leg leg-left" x="100" y="220" width="16" height="46" rx="4" fill="url(#body-shade)" />
				<rect class="leg leg-right" x="124" y="220" width="16" height="46" rx="4" fill="url(#body-shade)" />
				<!-- boots -->
				<ellipse cx="108" cy="270" rx="14" ry="6" fill="#06080d" />
				<ellipse cx="132" cy="270" rx="14" ry="6" fill="#06080d" />
			</g>

			<!-- torso -->
			<path
				class="torso"
				d="M88 178 Q120 168 152 178 L160 232 Q120 244 80 232 Z"
				fill="url(#body-shade)"
			/>
			<!-- vest stripe (reflective construction tape) -->
			<path
				d="M86 210 Q120 220 154 210"
				fill="none"
				stroke="#ffd934"
				stroke-width="3"
				stroke-linecap="round"
				opacity="0.85"
			/>
			<path
				d="M86 218 Q120 228 154 218"
				fill="none"
				stroke="#ffd934"
				stroke-width="2"
				stroke-linecap="round"
				opacity="0.5"
			/>

			<!-- HEAD (giant) -->
			<g class="head">
				<!-- jaw / neck shadow -->
				<rect x="108" y="168" width="24" height="14" fill="#06080d" />
				<!-- huge round head -->
				<circle cx="120" cy="115" r="62" fill="url(#body-shade)" />
				<!-- subtle teal rim light -->
				<circle
					cx="120"
					cy="115"
					r="62"
					fill="none"
					stroke="rgba(0,242,195,0.22)"
					stroke-width="2"
				/>

				<!-- eyes -->
				<g class="eyes">
					<g class="eye eye-left">
						<circle cx="100" cy="120" r="9" fill="#f8fbff" />
						<circle class="pupil pupil-left" cx="102" cy="121" r="4" fill="#0a0e15" />
						<circle cx="100" cy="117" r="1.6" fill="#fff" />
					</g>
					<g class="eye eye-right">
						<circle cx="140" cy="120" r="9" fill="#f8fbff" />
						<circle class="pupil pupil-right" cx="142" cy="121" r="4" fill="#0a0e15" />
						<circle cx="140" cy="117" r="1.6" fill="#fff" />
					</g>
				</g>

				<!-- mouth -->
				<path
					class="mouth mouth-smirk"
					d="M108 148 Q120 156 132 148"
					fill="none"
					stroke="#06080d"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<path
					class="mouth mouth-strain"
					d="M108 152 Q120 144 132 152 Q120 158 108 152 Z"
					fill="#06080d"
				/>

				<!-- HELMET -->
				<g class="helmet">
					<!-- helmet dome -->
					<path
						class="helmet-dome"
						d="M58 88 Q120 18 182 88 Q182 96 178 100 L62 100 Q58 96 58 88 Z"
						fill="url(#helmet-grad)"
					/>
					<!-- helmet rim -->
					<ellipse cx="120" cy="98" rx="68" ry="10" fill="#c79900" />
					<ellipse cx="120" cy="96" rx="64" ry="6" fill="url(#helmet-grad)" />
					<!-- helmet stripe -->
					<path
						d="M70 70 Q120 35 170 70"
						fill="none"
						stroke="#1a1100"
						stroke-width="6"
						stroke-linecap="round"
						opacity="0.9"
					/>
					<!-- helmet glint -->
					<path
						d="M80 55 Q102 36 122 38"
						fill="none"
						stroke="rgba(255,255,255,0.55)"
						stroke-width="4"
						stroke-linecap="round"
					/>
					<!-- LED -->
					<circle cx="120" cy="34" r="9" fill="url(#helmet-light)" class="led" />
					<circle cx="120" cy="34" r="3" fill="#fffae0" />
				</g>
			</g>

			<!-- ARMS — both arms grip the pump handle and push down together -->
			<g class="arm arm-left" class:down={armDown}>
				<!-- left arm reaches across to the handle -->
				<path
					d="M92 178 Q120 168 156 156 Q168 156 170 164 Q166 174 156 176 Q120 184 102 196 Q94 192 92 178 Z"
					fill="url(#body-shade)"
				/>
				<!-- left fist gripping the handle -->
				<circle cx="168" cy="160" r="7" fill="#06080d" />
			</g>

			<g class="arm arm-right" class:down={armDown}>
				<!-- right arm reaches to the handle -->
				<path
					d="M148 178 Q166 168 188 158 Q198 160 198 168 Q194 176 186 178 Q170 186 158 196 Q150 192 148 178 Z"
					fill="url(#body-shade)"
				/>
				<!-- right fist on the other side of the handle -->
				<circle cx="194" cy="164" r="7" fill="#06080d" />
			</g>
		</g>

		<!-- PUMP (separate from body, in front of mascot) -->
		<g class="pump" class:compressed={armDown}>
			<!-- handle rod -->
			<g class="handle">
				<rect x="175" y="150" width="6" height="50" rx="2" fill="#1a2230" />
				<rect
					x="160"
					y="146"
					width="36"
					height="10"
					rx="3"
					fill="url(#pump-grad)"
				/>
				<rect
					x="160"
					y="146"
					width="36"
					height="3"
					rx="1.5"
					fill="rgba(255,255,255,0.18)"
				/>
			</g>
			<!-- cylinder -->
			<rect
				x="158"
				y="200"
				width="40"
				height="60"
				rx="6"
				fill="url(#pump-grad)"
				stroke="rgba(255,255,255,0.06)"
			/>
			<!-- cap on top of cylinder -->
			<rect x="154" y="196" width="48" height="8" rx="3" fill="#0e131c" />
			<!-- vent stripes -->
			<line x1="166" y1="210" x2="190" y2="210" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
			<line x1="166" y1="216" x2="190" y2="216" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
			<!-- pressure gauge -->
			<g class="gauge">
				<circle cx="178" cy="232" r="10" fill="#06080d" stroke="#2a3142" stroke-width="1.5" />
				<circle cx="178" cy="232" r="9" fill="url(#gauge-grad)" style:opacity={gaugeGlow} />
				<line
					class="needle"
					x1="178"
					y1="232"
					x2="178"
					y2="225"
					stroke="#ff5a3c"
					stroke-width="2"
					stroke-linecap="round"
					style:transform-origin="178px 232px"
				/>
			</g>
			<!-- nozzle exiting top-right toward hose -->
			<rect x="195" y="200" width="8" height="6" rx="1.5" fill="#0e131c" />
		</g>
	</svg>
</div>

<style>
	.mascot-root {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: clamp(180px, 24vw, 360px);
		height: clamp(220px, 30vw, 420px);
		/* park behind & below the button until awake */
		transform: translate(80%, 110%);
		opacity: 0;
		pointer-events: none;
		/* sits above the (inflating) button skin so the user can see the mascot
		   working even after the button balloons over its origin position */
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

	.hose {
		position: absolute;
		left: -42%;
		bottom: 36%;
		width: 70%;
		height: 22%;
		transform-origin: right center;
		/* scale x with button so the hose visually reaches the (growing) button */
		transform: scaleX(calc(0.6 + 0.4 * var(--hose-x, 1)));
		opacity: 0;
		transition:
			opacity 380ms ease 240ms,
			transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
		z-index: 3;
		overflow: visible;
	}
	.mascot-root.on-stage .hose {
		opacity: 1;
	}
	.mascot-root.panic .hose {
		opacity: 0;
		transition: opacity 200ms ease;
	}
	.hose-tube {
		stroke-width: calc(12 + 4 * var(--pulse, 0));
		transition: stroke-width 160ms ease;
	}

	/* ground shadow squashes when arm pushes down */
	.ground-shadow {
		transform-origin: 120px 300px;
		transform: scaleX(1);
		transition: transform 220ms ease;
	}

	/* BODY: subtle breathing + squash on pump */
	.body {
		transform-origin: 120px 248px;
		animation: breathe 3.6s ease-in-out infinite;
	}
	@keyframes breathe {
		0%, 100% { transform: scaleY(1) scaleX(1); }
		50% { transform: scaleY(1.018) scaleX(0.992); }
	}

	/* HEAD bobs subtly */
	.head {
		transform-origin: 120px 168px;
		animation: head-bob 3.6s ease-in-out infinite;
	}
	@keyframes head-bob {
		0%, 100% { transform: translateY(0) rotate(-0.6deg); }
		50% { transform: translateY(-1.2px) rotate(0.6deg); }
	}

	/* HELMET wobble (follow-through) */
	.helmet {
		transform-origin: 120px 96px;
		animation: helmet-wobble 3.6s ease-in-out infinite;
	}
	@keyframes helmet-wobble {
		0%, 100% { transform: rotate(-1.2deg); }
		50% { transform: rotate(1.2deg); }
	}

	/* EYES: glance side to side */
	.pupil {
		transform-origin: center;
		animation: pupil-glance 4.2s ease-in-out infinite;
	}
	@keyframes pupil-glance {
		0%, 30% { transform: translate(0, 0); }
		38% { transform: translate(-2.5px, 0); }
		55% { transform: translate(-2.5px, 0); }
		60% { transform: translate(0, 0); }
		70% { transform: translate(2px, 0); }
		85% { transform: translate(2px, 0); }
		100% { transform: translate(0, 0); }
	}

	/* MOUTH swap based on phase */
	.mouth { transition: opacity 280ms ease; }
	.mouth-strain { opacity: 0; }
	.mascot-root .mascot :global(.mouth-smirk) { opacity: 1; }
	/* when pump count is high, switch to a strained face */
	.mascot[style*='--pump-count: 3'] .mouth-strain,
	.mascot[style*='--pump-count: 4'] .mouth-strain {
		opacity: 1;
	}
	.mascot[style*='--pump-count: 3'] .mouth-smirk,
	.mascot[style*='--pump-count: 4'] .mouth-smirk {
		opacity: 0;
	}

	/* LED pulse */
	.led { animation: led-pulse 2.4s ease-in-out infinite; }
	@keyframes led-pulse {
		0%, 100% { opacity: 0.65; }
		50% { opacity: 1; }
	}

	/* ARMS — both arms grip the handle and push down together */
	.arm-left {
		transform-origin: 96px 182px;
		transform: rotate(0deg);
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-left.down {
		transform: rotate(8deg) translate(2px, 14px);
	}
	.arm-right {
		transform-origin: 152px 182px;
		transform: rotate(0deg);
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-right.down {
		transform: rotate(-6deg) translate(-2px, 14px);
	}

	/* PUMP handle pushes down on stroke */
	.handle {
		transform-origin: 178px 200px;
		transform: translateY(0);
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.pump.compressed .handle {
		transform: translateY(18px);
	}
	/* the cylinder squashes very slightly on stroke (squash & stretch) */
	.pump {
		transform-origin: 178px 260px;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.pump.compressed {
		transform: scaleY(0.97) scaleX(1.02);
	}

	/* gauge needle swings with pressure */
	.needle {
		transform: rotate(calc(-80deg + var(--pump-count, 0) * 35deg));
		transition: transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* PANIC: body leans away, helmet flies a bit */
	.mascot-root.panic .body {
		animation: panic-shake 420ms ease both;
	}
	@keyframes panic-shake {
		0% { transform: translate(0, 0) rotate(0); }
		25% { transform: translate(-3px, -2px) rotate(-2deg); }
		60% { transform: translate(8px, 3px) rotate(6deg); }
		100% { transform: translate(14px, 14px) rotate(10deg); }
	}
	.mascot-root.panic .helmet {
		animation: helmet-fly 600ms ease-out forwards;
	}
	@keyframes helmet-fly {
		0% { transform: translate(0,0) rotate(0); }
		100% { transform: translate(40px, -60px) rotate(140deg); }
	}
	.mascot-root.panic .pump {
		animation: pump-drop 500ms ease-in forwards;
	}
	@keyframes pump-drop {
		0% { transform: translate(0,0) rotate(0); }
		100% { transform: translate(-18px, 30px) rotate(-22deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.body, .head, .helmet, .pupil, .led { animation: none; }
	}
</style>
