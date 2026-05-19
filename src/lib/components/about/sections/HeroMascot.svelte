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

	const onStage = $derived(phase === 'awake' || phase === 'pumping' || phase === 'boom');
	const panicking = $derived(phase === 'boom');
	const armDown = $derived(phase === 'pumping' && pumpStroke === 1);
	const gaugeGlow = $derived(Math.min(1, pumpCount / 4));
	const hosePulse = $derived(pumpStroke === 1 ? 1 : 0);
	void buttonScale;
</script>

<div
	class="mascot-root"
	class:on-stage={onStage}
	class:panic={panicking}
	class:gone={phase === 'aftermath'}
	aria-hidden="true"
>
	<svg class="hose" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true">
		<defs>
			<linearGradient id="hose-grad" x1="0" x2="1" y1="0" y2="0">
				<stop offset="0%" stop-color="#1a1a1a" />
				<stop offset="60%" stop-color="#2c2c2c" />
				<stop offset="100%" stop-color="#0e0e0e" />
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

		<!-- ground shadow -->
		<ellipse class="ground-shadow" cx="120" cy="328" rx="68" ry="7" fill="rgba(0,0,0,0.55)" />

		<g class="body">
			<!-- BOOTS -->
			<g class="boots">
				<!-- cuffs (light gray sock visible at the boot top) -->
				<rect x="80" y="282" width="32" height="10" rx="3" fill="#d5d5d5" stroke="#1a1a1a" stroke-width="2" />
				<rect x="128" y="282" width="32" height="10" rx="3" fill="#d5d5d5" stroke="#1a1a1a" stroke-width="2" />
				<!-- boots -->
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
				<!-- sole highlight -->
				<rect x="70" y="313" width="44" height="3" fill="rgba(255,255,255,0.15)" />
				<rect x="126" y="313" width="44" height="3" fill="rgba(255,255,255,0.15)" />
			</g>

			<!-- LEGS (overall pant legs) -->
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

			<!-- TORSO -->
			<g class="torso">
				<!-- yellow shirt visible at the neckline + sleeve caps -->
				<path
					d="M76 168 Q120 158 164 168 L168 200 Q120 196 72 200 Z"
					fill="url(#shirt-grad)"
					stroke="#1a1a1a"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
				<!-- blue overalls bib -->
				<path
					d="M74 192 Q120 184 166 192 L170 238 Q120 244 70 238 Z"
					fill="url(#overalls-grad)"
					stroke="#1a1a1a"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
				<!-- shoulder straps -->
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
				<!-- pocket buttons -->
				<circle cx="100" cy="200" r="3.5" fill="#ffd954" stroke="#1a1a1a" stroke-width="1.2" />
				<circle cx="140" cy="200" r="3.5" fill="#ffd954" stroke="#1a1a1a" stroke-width="1.2" />
				<!-- center seam -->
				<line
					x1="120"
					y1="208"
					x2="120"
					y2="238"
					stroke="#0a1c36"
					stroke-width="1.5"
					stroke-linecap="round"
					opacity="0.7"
				/>
				<!-- belt -->
				<rect
					x="74"
					y="236"
					width="92"
					height="8"
					fill="#1a1a1a"
					stroke="#1a1a1a"
					stroke-width="1"
				/>
				<!-- belt buckle -->
				<rect
					x="113"
					y="234"
					width="14"
					height="12"
					rx="1.5"
					fill="#c8c8c8"
					stroke="#1a1a1a"
					stroke-width="1.5"
				/>
				<rect x="116" y="237" width="8" height="6" fill="#9a9a9a" />
			</g>

			<!-- HEAD -->
			<g class="head">
				<!-- ears -->
				<ellipse cx="63" cy="118" rx="7" ry="11" fill="url(#skin-grad)" stroke="#1a1a1a" stroke-width="2" />
				<ellipse cx="177" cy="118" rx="7" ry="11" fill="url(#skin-grad)" stroke="#1a1a1a" stroke-width="2" />
				<!-- ear inner -->
				<ellipse cx="64" cy="118" rx="3" ry="6" fill="#b87a55" opacity="0.7" />
				<ellipse cx="176" cy="118" rx="3" ry="6" fill="#b87a55" opacity="0.7" />

				<!-- face (slightly squarish-round) -->
				<path
					class="face"
					d="M70 95 Q70 70 120 65 Q170 70 170 95 L170 138 Q170 168 120 172 Q70 168 70 138 Z"
					fill="url(#skin-grad)"
					stroke="#1a1a1a"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>

				<!-- hair tufts visible under helmet brim -->
				<path
					d="M70 90 Q80 78 92 84 L92 100 Q80 102 70 100 Z"
					fill="#1a1a1a"
				/>
				<path
					d="M170 90 Q160 78 148 84 L148 100 Q160 102 170 100 Z"
					fill="#1a1a1a"
				/>

				<!-- eyebrows -->
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

				<!-- eyes -->
				<g class="eye eye-left">
					<ellipse cx="96" cy="118" rx="10" ry="11" fill="#ffffff" stroke="#1a1a1a" stroke-width="2.2" />
					<circle class="pupil pupil-left" cx="98" cy="120" r="5" fill="#1a1a1a" />
					<circle cx="100" cy="117" r="2" fill="#ffffff" />
				</g>
				<g class="eye eye-right">
					<ellipse cx="144" cy="118" rx="10" ry="11" fill="#ffffff" stroke="#1a1a1a" stroke-width="2.2" />
					<circle class="pupil pupil-right" cx="146" cy="120" r="5" fill="#1a1a1a" />
					<circle cx="148" cy="117" r="2" fill="#ffffff" />
				</g>

				<!-- nose -->
				<path
					d="M114 132 Q120 142 126 132 Q124 138 120 138 Q116 138 114 132 Z"
					fill="#c89770"
					stroke="#1a1a1a"
					stroke-width="1.6"
					stroke-linejoin="round"
				/>

				<!-- mouth — smirk (default) -->
				<path
					class="mouth mouth-smirk"
					d="M106 152 Q120 162 134 152"
					fill="none"
					stroke="#1a1a1a"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<!-- mouth — strained (high-pressure pumping) -->
				<path
					class="mouth mouth-strain"
					d="M106 156 Q120 146 134 156 Q120 162 106 156 Z"
					fill="#5a1818"
					stroke="#1a1a1a"
					stroke-width="2"
					stroke-linejoin="round"
				/>

				<!-- HELMET -->
				<g class="helmet">
					<!-- main dome -->
					<path
						class="helmet-dome"
						d="M52 92 Q60 38 120 32 Q180 38 188 92 Q188 96 184 98 L56 98 Q52 96 52 92 Z"
						fill="url(#helmet-grad)"
						stroke="#1a1a1a"
						stroke-width="3"
						stroke-linejoin="round"
					/>
					<!-- inside-of-brim shadow strip (showing under the helmet) -->
					<path
						d="M58 92 Q70 84 120 84 Q170 84 182 92 L180 100 Q120 102 60 100 Z"
						fill="url(#helmet-shadow)"
					/>
					<!-- brim -->
					<ellipse
						cx="120"
						cy="98"
						rx="72"
						ry="10"
						fill="url(#helmet-grad)"
						stroke="#1a1a1a"
						stroke-width="3"
					/>
					<!-- glossy top highlight (rectangular like the reference) -->
					<path
						d="M108 44 Q120 38 132 44 L132 78 Q120 76 108 78 Z"
						fill="rgba(255,255,255,0.65)"
					/>
					<!-- side highlight -->
					<path
						d="M64 88 Q78 60 96 54"
						fill="none"
						stroke="rgba(255,255,255,0.45)"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<!-- LED -->
					<circle cx="120" cy="42" r="9" fill="url(#led-grad)" class="led" />
					<circle cx="120" cy="42" r="3" fill="#fffbe0" />
				</g>
			</g>

			<!-- ARMS — both reach toward the pump handle and push together -->
			<g class="arm arm-left" class:down={armDown}>
				<!-- yellow sleeve cap -->
				<path
					d="M78 178 Q86 168 100 170 L102 190 Q90 196 80 192 Z"
					fill="url(#shirt-grad)"
					stroke="#1a1a1a"
					stroke-width="2"
					stroke-linejoin="round"
				/>
				<!-- forearm extending toward the pump -->
				<path
					d="M84 188 Q104 192 134 178 Q150 174 158 178 L160 188 Q142 196 116 200 Q98 202 86 200 Z"
					fill="url(#skin-grad)"
					stroke="#1a1a1a"
					stroke-width="2.2"
					stroke-linejoin="round"
				/>
				<!-- left fist gripping the handle -->
				<circle cx="160" cy="182" r="8.5" fill="url(#skin-grad)" stroke="#1a1a1a" stroke-width="2" />
				<!-- thumb wrap -->
				<path
					d="M156 175 Q162 173 164 178"
					fill="none"
					stroke="#1a1a1a"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</g>

			<g class="arm arm-right" class:down={armDown}>
				<!-- yellow sleeve cap -->
				<path
					d="M140 170 Q156 168 162 178 L160 192 Q150 196 138 190 Z"
					fill="url(#shirt-grad)"
					stroke="#1a1a1a"
					stroke-width="2"
					stroke-linejoin="round"
				/>
				<!-- forearm reaching slightly higher to the other side of the handle -->
				<path
					d="M150 180 Q172 174 192 178 Q200 180 200 188 Q186 196 172 198 Q156 198 148 192 Z"
					fill="url(#skin-grad)"
					stroke="#1a1a1a"
					stroke-width="2.2"
					stroke-linejoin="round"
				/>
				<!-- right fist gripping the other side of the handle -->
				<circle cx="198" cy="186" r="8.5" fill="url(#skin-grad)" stroke="#1a1a1a" stroke-width="2" />
				<path
					d="M194 178 Q200 177 202 182"
					fill="none"
					stroke="#1a1a1a"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</g>
		</g>

		<!-- PUMP (in front of mascot, slightly to the right) -->
		<g class="pump" class:compressed={armDown}>
			<!-- handle bar (gripped by both fists) -->
			<g class="handle">
				<rect x="178" y="178" width="6" height="46" rx="2" fill="#1a2230" />
				<rect
					x="156"
					y="172"
					width="48"
					height="10"
					rx="3"
					fill="url(#pump-grad)"
					stroke="#1a1a1a"
					stroke-width="1.6"
				/>
				<rect
					x="158"
					y="173"
					width="44"
					height="3"
					rx="1.5"
					fill="rgba(255,255,255,0.22)"
				/>
			</g>
			<!-- cylinder -->
			<rect
				x="160"
				y="222"
				width="44"
				height="58"
				rx="6"
				fill="url(#pump-grad)"
				stroke="#1a1a1a"
				stroke-width="2"
			/>
			<rect x="156" y="218" width="52" height="8" rx="3" fill="#0a0e15" stroke="#1a1a1a" stroke-width="1.5" />
			<!-- vent stripes -->
			<line x1="168" y1="234" x2="196" y2="234" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
			<line x1="168" y1="240" x2="196" y2="240" stroke="rgba(255,255,255,0.08)" stroke-width="1" />
			<!-- pressure gauge -->
			<g class="gauge">
				<circle cx="182" cy="256" r="10" fill="#0a0e15" stroke="#1a1a1a" stroke-width="1.5" />
				<circle cx="182" cy="256" r="9" fill="url(#gauge-grad)" style:opacity={gaugeGlow} />
				<line
					class="needle"
					x1="182"
					y1="256"
					x2="182"
					y2="249"
					stroke="#ff5a3c"
					stroke-width="2"
					stroke-linecap="round"
					style:transform-origin="182px 256px"
				/>
			</g>
			<!-- nozzle exiting top-right toward the hose -->
			<rect x="200" y="224" width="10" height="6" rx="1.5" fill="#0a0e15" stroke="#1a1a1a" stroke-width="1.2" />
		</g>
	</svg>
</div>

<style>
	.mascot-root {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: clamp(180px, 24vw, 360px);
		height: clamp(230px, 32vw, 440px);
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

	.hose {
		position: absolute;
		left: -42%;
		bottom: 36%;
		width: 70%;
		height: 22%;
		transform-origin: right center;
		opacity: 0;
		transition:
			opacity 380ms ease 240ms,
			transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
		z-index: 3;
		overflow: visible;
	}
	.mascot-root.on-stage .hose { opacity: 1; }
	.mascot-root.panic .hose {
		opacity: 0;
		transition: opacity 200ms ease;
	}
	.hose-tube {
		stroke-width: calc(12 + 4 * var(--pulse, 0));
		transition: stroke-width 160ms ease;
	}

	.ground-shadow {
		transform-origin: 120px 328px;
		transition: transform 220ms ease;
	}

	/* BODY: subtle breathing + squash on pump */
	.body {
		transform-origin: 120px 290px;
		animation: breathe 3.6s ease-in-out infinite;
	}
	@keyframes breathe {
		0%, 100% { transform: scaleY(1) scaleX(1); }
		50% { transform: scaleY(1.012) scaleX(0.994); }
	}

	/* HEAD bobs subtly */
	.head {
		transform-origin: 120px 172px;
		animation: head-bob 3.6s ease-in-out infinite;
	}
	@keyframes head-bob {
		0%, 100% { transform: translateY(0) rotate(-0.6deg); }
		50% { transform: translateY(-1.4px) rotate(0.6deg); }
	}

	/* HELMET wobble (follow-through) */
	.helmet {
		transform-origin: 120px 98px;
		animation: helmet-wobble 3.6s ease-in-out infinite;
	}
	@keyframes helmet-wobble {
		0%, 100% { transform: rotate(-1.4deg); }
		50% { transform: rotate(1.4deg); }
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

	/* MOUTH swap based on pressure */
	.mouth { transition: opacity 280ms ease; }
	.mouth-strain { opacity: 0; }
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
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	/* ARMS — both grip the handle and push down together */
	.arm-left {
		transform-origin: 88px 186px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-left.down {
		transform: rotate(8deg) translate(2px, 12px);
	}
	.arm-right {
		transform-origin: 152px 186px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.arm-right.down {
		transform: rotate(-6deg) translate(-2px, 12px);
	}

	/* PUMP handle pushes down on stroke */
	.handle {
		transform-origin: 180px 220px;
		transition: transform 160ms cubic-bezier(0.7, 0, 0.3, 1);
	}
	.pump.compressed .handle {
		transform: translateY(16px);
	}
	.pump {
		transform-origin: 180px 280px;
		transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.pump.compressed {
		transform: scaleY(0.97) scaleX(1.02);
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
		100% { transform: translate(40px, -70px) rotate(140deg); }
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
