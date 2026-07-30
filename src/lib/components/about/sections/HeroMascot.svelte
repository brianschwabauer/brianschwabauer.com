<script lang="ts">
	type Phase = 'idle' | 'awake' | 'pumping' | 'boom' | 'aftermath';
	/** what KIND of beat the current stroke index is — picks which curve plays */
	type Kind = 'light' | 'fail' | 'reset' | 'heavy';

	let {
		phase = 'idle',
		pumpCount = 0,
		pumpStroke = 0,
		strokeMs = 800,
		strokeKind = 'light',
		buttonScale = 1,
	}: {
		phase?: Phase;
		/** how many strokes have LANDED (0–4) — drives the acting escalation */
		pumpCount?: number;
		/** which beat of the pump sequence is in flight (1–6), 0 between beats */
		pumpStroke?: number;
		/** duration of the beat currently in flight, ms */
		strokeMs?: number;
		strokeKind?: Kind;
		buttonScale?: number;
	} = $props();

	const on_stage = $derived(phase === 'awake' || phase === 'pumping' || phase === 'boom');

	/**
	 * The beat currently playing. The rig is re-keyed whenever it changes, so
	 * every part's keyframes restart together and the baked-in per-part lag
	 * stays phase-locked.
	 *
	 *   prep   — lands on stage EMPTY-HANDED, plays cocky, then reaches and grips
	 *   stroke — one pump. `strokeKind` picks the curve:
	 *              light — quick, he is showing off
	 *              fail  — he commits just as hard and the handle barely moves
	 *              reset — the puzzled hold: checks the gauge, re-plants his feet
	 *              heavy — long grinding drive, fast release
	 *   alarm  — the held breath before it blows (anticipation for the flee)
	 *   panic  — hands welded, one release frame, then he scrambles out
	 */
	const beat = $derived(
		phase === 'awake'
			? 'prep'
			: phase === 'pumping' && pumpStroke > 0
				? 'stroke'
				: phase === 'pumping'
					? 'alarm'
					: phase === 'boom'
						? 'panic'
						: 'none',
	);

	/** Acting ladder. Brows, mouth, eyes and breath all read off this. */
	const mood = $derived(
		phase === 'boom'
			? 'panic'
			: phase !== 'pumping'
				? 'cocky'
				: strokeKind === 'fail'
					? 'effort'
					: strokeKind === 'reset'
						? 'puzzled'
						: pumpCount === 0
							? 'cocky'
							: pumpCount === 1
								? 'work'
								: pumpCount === 2
									? 'effort'
									: pumpCount === 3
										? 'strain'
										: 'alarm',
	);

	const rig_key = $derived(`${beat}:${pumpStroke}`);
	const gauge_glow = $derived(Math.min(1, pumpCount / 4));
	/** the needle must never leave its own dial arc — clamp, don't wrap */
	const needle_deg = $derived(-88 + Math.min(4, pumpCount) * 43);

	/**
	 * The pump is a PLANTED SET PIECE. While he is working it, the T-bar and the
	 * piston are parented to `.figure` alongside his hands, so the three form one
	 * rigid chain. The instant he lets go (`panic`) they are re-parented into
	 * `.rigging`, which never leaves the frame — so the pump gets knocked over and
	 * stays knocked over instead of running away with him.
	 */
	const planted = $derived(beat === 'panic');

	/* ===================== CONTINUOUS LIMBS ==============================
	 * Segment shapes pushed around by nested transforms ALWAYS pop at the
	 * joint: the elbow the upper arm implies and the elbow the forearm
	 * implies are two different points, and they drift apart as soon as the
	 * two curves disagree. So the limbs are no longer drawn as segments.
	 *
	 * Each limb is now ONE path — `M proximal L joint L distal` — stroked
	 * with `stroke-linecap: round` and `stroke-linejoin: round`. A single
	 * shape has no seam to open, and the round join gives a continuous
	 * elbow/knee for free at every angle.
	 *
	 * The `d` is recomputed every frame from the RIG'S OWN transforms, so
	 * none of the animation work is thrown away: the `.upper`, `.fore`,
	 * `.thigh`, `.shin` and `.boot` groups survive untouched as pure JOINT
	 * DRIVERS. Every keyframe still targets them; they just no longer carry
	 * any drawing. A joint that two groups both drive (the elbow — the upper
	 * arm swings it about the shoulder, the forearm swings it about the
	 * wrist) is the MIDPOINT of what the two imply, so both curves read and
	 * the joint is still exactly one point.
	 *
	 * Points are read with `getCTM()` and expressed in the limb container's
	 * own space, so every transform shared with the container cancels
	 * exactly — a wrist point that is also its group's transform-origin is
	 * therefore pixel-exact, which is what keeps the fists welded to the bar.
	 */
	type LimbSpec = {
		/** the group the visible path lives in — the coordinate space we solve in */
		host: string;
		/** group carrying the proximal joint (null = static in `host`) */
		a: string | null;
		A: [number, number];
		/** the driver(s) of the middle joint; two drivers are averaged */
		m: string[];
		M: [number, number];
		/** group carrying the distal joint */
		d: string;
		D: [number, number];
		/**
		 * Solve the middle joint as a REAL TWO-BONE CHAIN instead of trusting a
		 * driver. Only the arms need it. Their elbow has two drivers (the upper
		 * arm swings it about the shoulder, the forearm swings it about the
		 * wrist) and the old code AVERAGED the two — but two points on two
		 * different circles average to a point at a varying distance from both
		 * centres, so bone length is not conserved. Because the wrist is the
		 * forearm's own transform-origin it is exact, which dumped the whole
		 * error into the upper arm: it telescoped 40 → 70 u inside one beat.
		 * With IK both bones are length-locked to the rest pose and the elbow is
		 * the circle-circle intersection, so the joint can only rotate.
		 * The legs keep the driver path — their chain is genuinely nested, one
		 * driver per joint, and it measures rigid to 0.1 px.
		 */
		ik?: boolean;
	};

	const LIMB_SPECS: LimbSpec[] = [
		// shoulder → elbow → wrist (the fist on the T-bar). The shoulder is
		// inboard of the vest contour so the round tube-end stays buried.
		{
			host: '.arm.near',
			// THE SHOULDER BELONGS TO THE TORSO, NOT TO THE ARM GROUP. It used
			// to be a static point inside `.arm.near`, and `.arms` translates
			// with the T-bar — so the drawn shoulder slid down the chest with
			// the hands (which is why it measured outside the torso fill on
			// essentially every frame) and, worse, the shoulder-to-wrist
			// distance never changed, so the elbow could not fold at all. Read
			// from an empty driver parented in `.torso` it does both jobs: the
			// joint stays welded to the body, and the reach really does shorten
			// as the hands drive past the shoulders, which is what makes the
			// elbow articulate.
			// moved outboard and down with the wider shoulder line (round 6):
			// (57,159) → (53,163). |A→M| goes 57.8 → 55.9 u, so the near chain
			// still carries 115.8 u of bone against a measured max reach of 96.
			a: '.shoulder.near',
			A: [53, 163],
			m: ['.upper.near', '.fore.near'],
			M: [80, 212],
			d: '.fore.near',
			D: [134, 186],
			ik: true,
		},
		{
			host: '.arm.far',
			// (124,154) → (137,157) with the wider shoulder line. The rest elbow
			// moved out with it (180,134 → 188,128) so the far chain KEEPS its
			// bone budget: 58.7 + 52.6 = 111.3 u against round 5's measured peak
			// reach of 106.9 u during the alarm. Shortening A→M without moving M
			// would have bottomed the chain out straight on that beat.
			a: '.shoulder.far',
			A: [137, 157],
			// the far elbow is deliberately RAISED where the near one is dropped
			// (ASK p. 324 — never twin two limbs), and the bones are long enough
			// that the chain never bottoms out straight
			m: ['.upper.far', '.fore.far'],
			M: [188, 128],
			d: '.fore.far',
			D: [201, 179],
			ik: true,
		},
		// the leg chain is already nested, so the knee has a single driver;
		// the ankle is read 4 u short of the boot's pivot so the round cap
		// always stays buried inside the boot
		{
			host: '.leg.near',
			a: '.thigh',
			A: [72, 212],
			m: ['.shin'],
			M: [86, 258],
			d: '.boot',
			D: [64, 300],
		},
		{
			host: '.leg.far',
			a: '.thigh',
			A: [112, 208],
			m: ['.shin'],
			M: [140, 250],
			d: '.boot',
			D: [128, 294],
		},
	];

	/** The rest-pose `d`, derived from the same joint table the solver uses, so a
	 * limb's two stacked paths can never be authored out of sync with each other
	 * or with the rig. Only ever painted for the first frame — `drawLimbs` owns it
	 * from then on. */
	const REST_A: Record<string, string> = Object.fromEntries(
		LIMB_SPECS.map((l) => [l.host, `M${l.A[0]} ${l.A[1]}L${l.M[0]} ${l.M[1]}`]),
	);
	const REST_B: Record<string, string> = Object.fromEntries(
		LIMB_SPECS.map((l) => [l.host, `M${l.M[0]} ${l.M[1]}L${l.D[0]} ${l.D[1]}`]),
	);
	const REST_S: Record<string, string> = Object.fromEntries(
		LIMB_SPECS.map((l) => [
			l.host,
			`M${l.A[0]} ${l.A[1]}L${l.A[0] + (l.M[0] - l.A[0]) * 0.42} ${l.A[1] + (l.M[1] - l.A[1]) * 0.42}`,
		]),
	);

	type Limb = {
		host: SVGGraphicsElement;
		a: SVGGraphicsElement | null;
		A: [number, number];
		m: SVGGraphicsElement[];
		M: [number, number];
		d: SVGGraphicsElement;
		D: [number, number];
		ik: boolean;
		/** rest-pose bone lengths — the two invariants IK conserves */
		l1: number;
		l2: number;
		/** which side of the chord the joint bends to, taken from the rest pose */
		bend: number;
		/** proximal bone, drawn thick */
		seg_a: SVGPathElement[];
		/** distal bone, drawn thinner — this is where the taper lives */
		seg_b: SVGPathElement[];
		/** the deltoid: the first 42 % of the proximal bone, drawn WIDER still */
		seg_s: SVGPathElement[];
	};

	let rig_el = $state<SVGGElement | null>(null);

	function resolve(root: SVGGElement): Limb[] {
		const out: Limb[] = [];
		for (const spec of LIMB_SPECS) {
			const host = root.querySelector<SVGGraphicsElement>(spec.host);
			if (!host) continue;
			const m = spec.m
				.map((sel) => host.querySelector<SVGGraphicsElement>(sel))
				.filter((el): el is SVGGraphicsElement => !!el);
			const d = host.querySelector<SVGGraphicsElement>(spec.d);
			if (!m.length || !d) continue;
			const l1 = Math.hypot(spec.M[0] - spec.A[0], spec.M[1] - spec.A[1]);
			const l2 = Math.hypot(spec.D[0] - spec.M[0], spec.D[1] - spec.M[1]);
			const cross =
				(spec.D[0] - spec.A[0]) * (spec.M[1] - spec.A[1]) -
				(spec.D[1] - spec.A[1]) * (spec.M[0] - spec.A[0]);
			// a joint driver normally lives inside the limb; the shoulders
			// deliberately do not — they are parented to the torso
			const a = spec.a
				? host.querySelector<SVGGraphicsElement>(spec.a) ||
					root.querySelector<SVGGraphicsElement>(spec.a)
				: null;
			out.push({
				host,
				a,
				A: spec.A,
				m,
				M: spec.M,
				d,
				D: spec.D,
				ik: !!spec.ik,
				l1,
				l2,
				bend: cross < 0 ? -1 : 1,
				seg_a: [...host.querySelectorAll<SVGPathElement>(':scope > path.limb.seg-a')],
				seg_b: [...host.querySelectorAll<SVGPathElement>(':scope > path.limb.seg-b')],
				seg_s: [...host.querySelectorAll<SVGPathElement>(':scope > path.limb.seg-s')],
			});
		}
		return out;
	}

	/** a point in `el`'s local space, expressed in the host's space */
	function locate(
		inv: DOMMatrix,
		el: SVGGraphicsElement,
		[x, y]: [number, number],
	): [number, number] {
		const ctm = el.getCTM();
		if (!ctm) return [x, y];
		const m = inv.multiply(ctm);
		return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f];
	}

	/**
	 * Two-bone IK. Both ends are given — the shoulder rides the body, the wrist
	 * is welded to the T-bar — so the elbow is the intersection of a circle of
	 * radius `l1` about the shoulder with a circle of radius `l2` about the
	 * wrist. `bend` picks which of the two intersections is the elbow, and it
	 * never changes, so the arm cannot invert. Out of reach the chain simply
	 * straightens rather than snapping.
	 */
	function solveJoint(
		[ax, ay]: [number, number],
		[dx, dy]: [number, number],
		l1: number,
		l2: number,
		bend: number,
	): [number, number] {
		const vx = dx - ax;
		const vy = dy - ay;
		const r = Math.hypot(vx, vy) || 0.0001;
		const ux = vx / r;
		const uy = vy / r;
		const reach = Math.min(l1 + l2, Math.max(Math.abs(l1 - l2), r));
		const a = (reach * reach + l1 * l1 - l2 * l2) / (2 * reach);
		const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
		return [ax + a * ux - bend * h * uy, ay + a * uy + bend * h * ux];
	}

	function drawLimbs(limbs: Limb[]) {
		// TWO PHASES, NEVER INTERLEAVED. getCTM() is a geometry READ and
		// setAttribute('d') is a geometry WRITE — doing limb 1's writes before
		// limb 2's reads forced the browser to re-resolve SVG geometry once per
		// limb per frame. All four limbs are read first, then all are written,
		// so a frame costs at most one geometry flush.
		type Job = { limb: Limb; da: string; db: string; ds: string };
		const jobs: Job[] = [];
		for (const limb of limbs) {
			const ctm = limb.host.getCTM();
			if (!ctm) continue;
			const inv = ctm.inverse();
			const p0 = limb.a ? locate(inv, limb.a, limb.A) : limb.A;
			const p2 = locate(inv, limb.d, limb.D);
			let p1: [number, number];
			if (limb.ik) {
				p1 = solveJoint(p0, p2, limb.l1, limb.l2, limb.bend);
			} else {
				let jx = 0;
				let jy = 0;
				for (const driver of limb.m) {
					const [x, y] = locate(inv, driver, limb.M);
					jx += x;
					jy += y;
				}
				p1 = [jx / limb.m.length, jy / limb.m.length];
			}
			const j = `${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
			const da = `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}L${j}`;
			const db = `M${j}L${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
			let ds = '';
			if (limb.seg_s.length) {
				const sx = p0[0] + (p1[0] - p0[0]) * 0.42;
				const sy = p0[1] + (p1[1] - p0[1]) * 0.42;
				ds = `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}L${sx.toFixed(2)} ${sy.toFixed(2)}`;
			}
			jobs.push({ limb, da, db, ds });
		}
		for (const { limb, da, db, ds } of jobs) {
			for (const path of limb.seg_a) {
				if (path.getAttribute('d') !== da) path.setAttribute('d', da);
			}
			for (const path of limb.seg_b) {
				if (path.getAttribute('d') !== db) path.setAttribute('d', db);
			}
			if (ds) {
				for (const path of limb.seg_s) {
					if (path.getAttribute('d') !== ds) path.setAttribute('d', ds);
				}
			}
		}
	}

	$effect(() => {
		// re-resolve whenever the rig remounts or he leaves the stage
		rig_key;
		const root = rig_el;
		if (!root || !on_stage) return;
		const limbs = resolve(root);
		if (!limbs.length) return;
		let frame = 0;
		const tick = () => {
			drawLimbs(limbs);
			frame = requestAnimationFrame(tick);
		};
		// pause the solve while the hero is scrolled out of sight — the show
		// keeps playing (CSS animations are the browser's problem), only the
		// per-frame limb IK stops paying rent. On re-entry the first frame
		// re-solves before paint, so nothing can be seen mid-correction.
		const io = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				if (!frame) tick();
			} else if (frame) {
				cancelAnimationFrame(frame);
				frame = 0;
			}
		});
		io.observe(root);
		tick();
		return () => {
			io.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<!-- The tool is rendered from these two snippets so it can be re-parented at the
     release without ever being duplicated in the DOM. -->
{#snippet piston()}
	<!-- The piston rod paints BETWEEN the pump's back and front layers, so it
	     genuinely slides into the cylinder instead of over it.

	     ITS LENGTH IS A BUDGET, NOT A DRAWING CHOICE. The barrel's floor is at
	     y = 306 and the rod rides `st-arms` inside `st-figure`, which together
	     drive it 35 u down at the deepest contact (--e 1.4: figure 16 × 1.4 =
	     22.4, arms 9.2 × 1.4 = 12.9). A 128-tall rod bottoming at 306 therefore
	     punched ~31 u out through the bottom of the pump box on every heavy
	     stroke. At 92 tall it bottoms at 270 and its deepest contact lands
	     EXACTLY on the barrel floor — so instead of overshooting the box, the
	     rod now visibly bottoms out in it, which is the pose the fail beat and
	     the two heavy strokes are supposed to be selling. -->
	<g class="hold">
		<g class="rod">
			<rect
				x="160"
				y="178"
				width="12"
				height="92"
				rx="6"
				fill="var(--steel-2)"
				stroke="var(--ink)"
				stroke-width="2.6" />
			<rect x="163" y="184" width="3.4" height="80" rx="1.7" fill="var(--steel-hi)" />
		</g>
	</g>
{/snippet}

{#snippet tbar()}
	<g class="handle">
		<!-- the bar is TILTED, so the two fists sit at different heights on it and
		     the pose stops being bilaterally symmetrical -->
		<g class="bar">
			<rect
				x="124"
				y="174"
				width="84"
				height="17"
				rx="8.5"
				fill="var(--steel)"
				stroke="var(--ink)"
				stroke-width="3" />
			<rect x="132" y="178" width="68" height="4.5" rx="2.25" fill="var(--steel-hi)" />
		</g>
	</g>
{/snippet}

<div
	class="root"
	class:on-stage={on_stage}
	class:gone={phase === 'aftermath'}
	data-phase={phase}
	aria-hidden="true">
	<svg class="mascot" viewBox="0 0 240 340" aria-hidden="true" data-mood={mood}>
		{#key rig_key}
			<g
				bind:this={rig_el}
				class="rig"
				data-beat={beat}
				data-stroke={pumpStroke}
				data-kind={strokeKind}
				style:--stroke-ms="{strokeMs}ms">
				<!-- contact shadow: SNAPS wide and dark on the strike frame -->
				<ellipse class="shadow" cx="104" cy="316" rx="82" ry="8" />

				<!-- ================= PUMP (planted set piece) =================
				     The hose exits frame RIGHT at the button's height, because the
				     CTA is staged to the mascot's right. Pump → hose → nozzle →
				     button has to be one unbroken read or the gag has no cause.

				     Split into a BACK layer (hose, foot plate) and a FRONT layer
				     (barrel, gauge). The piston rod is parented to the FIGURE — the
				     hands are what drive it — and paints between the two layers, so
				     it slides into the cylinder rather than over it. Neither rigging
				     layer is inside `.exit`, so the pump stays where it was put. -->
				<g class="rigging back">
					<g class="hose-a">
						<path
							class="hose-line"
							d="M190 268 C200 272 210 268 218 266"
							stroke-width="13" />
						<path
							class="hose-core"
							d="M190 268 C200 272 210 268 218 266"
							stroke-width="3.5" />
						<g class="hose-b">
							<path
								class="hose-line"
								d="M218 266 C228 262 236 268 248 273"
								stroke-width="13" />
							<path
								class="hose-core"
								d="M218 266 C228 262 236 268 248 273"
								stroke-width="3.5" />
							<!-- THE PLUG. A cap the exact radius of the tube, sitting on the
							     tube's last point and riding the hose's own animation. Hero
							     measures THIS circle every frame and stretches the DOM link
							     onto it, so the two halves of the hose stay one object
							     whatever the viewport does to the SVG's letterboxing. -->
							<circle class="hose-end" cx="248" cy="273" r="6.5" />
						</g>
					</g>

					<!-- once he lets go, the rod belongs to the pump again -->
					{#if planted}{@render piston()}{/if}

					<!-- foot plate — his far boot really does stand on this -->
					<path
						d="M100 298 L204 296 L209 314 L95 314 Z"
						fill="var(--steel)"
						stroke="var(--ink)"
						stroke-width="3"
						stroke-linejoin="round" />
					<path d="M104 303 L202 301" stroke="var(--steel-hi)" stroke-width="3" />
				</g>

				<!-- ================= FIGURE ================= -->
				<!-- Everything that RUNS AWAY lives in .exit. The pump does not. -->
				<g class="exit">
					<!-- LEGS. Two-bone with a real knee. Each leg is ONE continuous
					     round-capped path — `M hip L knee L ankle` — whose `d` is
					     recomputed every frame from the rig's own joint transforms
					     (see `drawLimbs`). The joint is a single point on a single
					     shape, so a thigh can never separate from a shin. The
					     `.thigh` / `.shin` groups survive as pure JOINT DRIVERS:
					     every keyframe still targets them, they simply no longer
					     carry any drawing. -->
					<g class="legs">
						<g class="leg far">
							<path class="limb ink seg-a" d={REST_A['.leg.far']} />
							<path class="limb ink seg-b" d={REST_B['.leg.far']} />
							<path class="limb pants far seg-a" d={REST_A['.leg.far']} />
							<path class="limb pants far seg-b" d={REST_B['.leg.far']} />
							<g class="thigh">
								<g class="shin">
									<g class="boot">
										<path
											class="boot-shape far"
											d="M106 280 L138 279 C142 288 145 296 145 301 C145 306 140 308 132 308 L104 308 C97 308 94 302 96 295 C98 287 101 282 106 280 Z"
											stroke="var(--ink)"
											stroke-width="3"
											stroke-linejoin="round" />
										<path
											d="M96 301 L145 300"
											stroke="var(--ink)"
											stroke-width="2.4"
											opacity="0.45" />
									</g>
								</g>
							</g>
						</g>

						<g class="leg near">
							<path class="limb ink seg-a" d={REST_A['.leg.near']} />
							<path class="limb ink seg-b" d={REST_B['.leg.near']} />
							<path class="limb pants near seg-a" d={REST_A['.leg.near']} />
							<path class="limb pants near seg-b" d={REST_B['.leg.near']} />
							<g class="thigh">
								<g class="shin">
									<g class="boot">
										<path
											class="boot-shape near"
											d="M42 284 L80 283 C84 293 86 302 86 308 C86 315 79 319 68 319 L36 319 C26 319 23 312 25 303 C27 292 33 285 42 284 Z"
											stroke="var(--ink)"
											stroke-width="3.6"
											stroke-linejoin="round" />
										<path
											d="M25 310 L86 309"
											stroke="var(--ink)"
											stroke-width="2.8"
											opacity="0.5" />
										<path
											d="M44 290 C56 287 72 287 82 290"
											fill="none"
											stroke="var(--boot-hi)"
											stroke-width="2.6"
											stroke-linecap="round" />
									</g>
								</g>
							</g>
						</g>
					</g>

					<g class="figure">
						{#if !planted}{@render piston()}{/if}

						<!-- FAR ARM — painted BEHIND the body, which is where a far arm
						     belongs in a 3/4 view. Same continuous-path construction as
						     the legs. -->
						<g class="hold">
							<g class="arms back">
								<g class="arm far">
									<path class="limb ink seg-s" d={REST_S['.arm.far']} />
									<path class="limb ink seg-a" d={REST_A['.arm.far']} />
									<path class="limb ink seg-b" d={REST_B['.arm.far']} />
									<path class="limb sleeve far seg-s" d={REST_S['.arm.far']} />
									<path class="limb sleeve far seg-a" d={REST_A['.arm.far']} />
									<path class="limb sleeve far seg-b" d={REST_B['.arm.far']} />
									<g class="upper far"></g>
									<g class="fore far">
										<!-- FAR GLOVE. Same four-part construction as the near one,
										     one step smaller and one step darker; its cuff runs up
										     the far forearm's own axis (elbow 180,134 → wrist
										     201,179, i.e. 65° from horizontal). -->
										<g class="hand far">
											<rect
												class="cuff far"
												x="-7.5"
												y="-11"
												width="15"
												height="22"
												rx="4.5"
												transform="translate(196 166) rotate(65)" />
											<path
												class="glove far"
												d="M189 175 C188 166.5 194.5 160 202.5 159.6 C211 159.2 216.5 165.5 216.5 174 L216.5 181 C216.5 186.6 214.4 190.4 211.4 190.4 C208.8 190.4 207.8 187 207.8 183.8 C207.2 189 204.4 193 201 192.8 C198 192.6 196.8 188.8 196.6 185.4 C195.8 189.4 193.6 191.4 191.4 190.4 C189.6 189.4 189 182.6 189 175 Z" />
											<path
												class="glove far thumb"
												d="M191 172 C186.5 171.4 184 167.6 185.6 164 C187.2 160.6 191.6 159.6 194.4 162 C196.8 164 197 168 195.4 170.4 Z" />
											<path
												class="crease"
												d="M207.8 183.8 C208.4 180.6 208.6 178 208.2 175.4" />
											<path
												class="crease"
												d="M196.6 185.4 C197.2 182.2 197.4 179.6 197 177" />
										</g>
									</g>
								</g>
							</g>
						</g>

						<!-- .lean wraps ONLY THE SPINE. The legs are outside it, so
						     backing away from the swelling button cannot skate his
						     planted boots sideways; the arms and the tool are outside
						     it too, so his hands stay welded to a bar that does not
						     lean. What moves is his shoulders — the arms stretch, which
						     is what leaning away from something you cannot let go of
						     actually looks like. -->
						<g class="lean" style:--btn={buttonScale}>
							<!-- SPINE reverses against the hips: arched back on the
						     wind-up, curled forward over the pump on the drive. -->
							<g class="spine">
								<g class="torso">
									<!-- NECK. It was always in the markup and it was 100 %
									     occluded: the chin reached y 164, six units BELOW the
									     neck's own bottom edge, so the head sat straight on the
									     collar. The head is lifted and reduced by `.skull` now
									     (see below) and the collar has come down, so 10–12 u of
									     this actually shows — which is the single cheapest thing
									     that separates refs 2/3/5 from a bobblehead. -->
									<path
										d="M80 128 L107 126 L109 152 C101 159 87 159 79 152 Z"
										fill="var(--skin-2)"
										stroke="var(--ink)"
										stroke-width="3"
										stroke-linejoin="round" />

									<!-- SHIRT — the base body shape; the sleeves are arm strokes.
									     HE HAS SHOULDERS NOW. The old chest was a barrel: 84 u
									     wide top and bottom, i.e. NARROWER than his own 87 u head.
									     In every reference the shoulders are clearly the widest
									     thing below the hat, and that is what makes a figure read
									     as a person taking a load. This one is 107 u across the
									     shoulder line at y ≈ 150 and tapers to 87 u at the waist,
									     against a head that is now 77 u. The waist, the hips and
									     the belt line are unchanged, so nothing the legs are
									     parented to has moved. -->
									<path
										class="chest"
										d="M40 178 C38 160 50 149 70 146 L112 144 C133 147 147 158 147 178 L137 208 C114 216 70 216 50 208 Z"
										fill="var(--shirt)"
										stroke="var(--ink)"
										stroke-width="3.4"
										stroke-linejoin="round" />

									<!-- shirt collar — opened up to sit on the wider shoulder line -->
									<path
										d="M69 147 L92 166 L62 157 Z"
										fill="var(--shirt-hi)"
										stroke="var(--ink)"
										stroke-width="2.2"
										stroke-linejoin="round" />
									<path
										d="M113 145 L92 166 L119 156 Z"
										fill="var(--shirt-hi)"
										stroke="var(--ink)"
										stroke-width="2.2"
										stroke-linejoin="round" />

									<!-- hi-vis vest, open in a V over the shirt -->
									<path
										d="M68 148 L92 167 L114 146 C133 149 146 159 146 178 L136 207 C114 215 70 215 51 207 L41 178 C39 160 51 150 68 148 Z"
										fill="var(--vest)"
										stroke="var(--ink)"
										stroke-width="3"
										stroke-linejoin="round" />
									<!-- one flat shade on the far half of the vest -->
									<path
										d="M114 146 C133 149 146 159 146 178 L136 207 C129 210 121 212 113 213 L113 166 Z"
										fill="var(--vest-2)" />
									<!-- reflective bands -->
									<path
										d="M45 176 C74 187 114 187 143 176"
										fill="none"
										stroke="var(--hi-tape)"
										stroke-width="5.5"
										stroke-linecap="round" />
									<!-- vest pocket -->
									<path
										d="M52 157 L70 153 L72 169 L54 173 Z"
										fill="var(--vest-2)"
										stroke="var(--ink)"
										stroke-width="2.2"
										stroke-linejoin="round" />

									<!-- belt -->
									<path
										d="M48 202 C74 212 114 212 138 202 L138 216 C113 226 71 226 47 216 Z"
										fill="var(--leather)"
										stroke="var(--ink)"
										stroke-width="2.8"
										stroke-linejoin="round" />
									<rect
										x="85"
										y="209"
										width="17"
										height="13"
										rx="3"
										fill="var(--hat)"
										stroke="var(--ink)"
										stroke-width="2.2" />

									<!-- SHOULDER DRIVERS. Empty, drawn nothing, purely so the
								     limb solver can read where each shoulder actually is
								     on the body this frame — they inherit the lean, the
								     spine curl and the torso squash. See LIMB_SPECS. -->
									<g class="shoulder near"></g>
									<g class="shoulder far"></g>
								</g>

								<!-- HEAD travels on its own arc and lands late -->
								<g class="head">
									<!-- .lookat is the AIM. The button is down-RIGHT of him
								     and rises toward his eyeline as it inflates. -->
									<g class="lookat" style:--btn={buttonScale}>
										<!-- THE HEAD IS SMALLER AND HIGHER, AND NOTHING INSIDE IT
										     MOVED. Round 5 measured the head at 87 u wide and 142 u
										     tall against an 84 u torso — his head was wider than
										     his body and 1.9× its height, which is the last thing
										     separating him from refs 2 and 5.

										     Rather than re-author forty face coordinates (and with
										     them the `.eye.*` / `.brow.*` / `.helmet` transform
										     origins, the seven mouths, the lids and the blink
										     rig), the whole head is reduced and lifted ONCE, here,
										     about the chin. Every child keeps its authored
										     coordinates, so every transform-origin in the CSS is
										     still correct — an ancestor scale does not touch a
										     descendant's local space.

										       scale 0.88 about (92,164) then lift 24 u
										       → head 87 u → 77 u wide, 142 u → 125 u tall
										       → hat  105 u → 92 u
										       → chin y 164 → 140, which finally clears the collar
										         at y 146 and lets the neck show.
										     Do not put a keyframe on `.skull`; it is a static
										     proportion fix and `.head` / `.lookat` above it own all
										     the acting. -->
										<g class="skull">
											<!-- ear -->
											<path
												d="M55 106 C46 103 42 116 47 125 C51 131 58 129 58 121 Z"
												fill="var(--skin)"
												stroke="var(--ink)"
												stroke-width="3"
												stroke-linejoin="round" />

											<path
												class="face"
												d="M51 88 C49 60 67 44 92 44 C119 44 137 61 134 88 C136 106 134 116 132 126 C131.5 137 128 145.5 122.5 151.5 C110 162.5 88 165 71 151 C50 140 45 113 51 88 Z"
												fill="var(--skin)"
												stroke="var(--ink)"
												stroke-width="3.6"
												stroke-linejoin="round" />

											<!-- ONE flat shade on the far side of the face -->
											<path
												d="M118 52 C126 62 130 74 130 88 C132 108 126 133 114 149 C122 149 129 140 132 126 C136 106 134 100 134 88 C136 70 129 58 118 52 Z"
												fill="var(--skin-2)" />

											<!-- hair, just the temples: enough to read as a person
									     under a hat without crowding the brow line -->
											<path
												d="M51 90 C49 61 68 45 92 45 C118 45 137 62 134 90 C129 76 117 67 103 66 C88 65 74 71 64 81 C58 87 54 92 51 90 Z"
												fill="var(--hair)" />
											<path
												d="M53 88 C49 96 49 106 52 113 C57 108 58 97 59 88 Z"
												fill="var(--hair)" />
											<path
												d="M128 88 C132 95 132 103 129 109 C125 104 124 96 124 88 Z"
												fill="var(--hair)" />

											<!-- the brim's cast shadow stops ABOVE the brow line -->
											<path
												class="brim-shadow"
												d="M51 81 C72 90 116 90 133 79 L134 88 C116 97 72 97 50 89 Z"
												fill="var(--skin-2)"
												opacity="0.75" />

											<g class="brows">
												<path class="brow near" d="M66 104 C74 97 86 97 93 103" />
												<path class="brow far" d="M103 101 C110 96 119 97 123 102" />
											</g>

											<g class="eyes">
												<g class="eye near">
													<ellipse
														cx="80"
														cy="118"
														rx="12"
														ry="13"
														fill="var(--white)"
														stroke="var(--ink)"
														stroke-width="3" />
												</g>
												<g class="eye far">
													<ellipse
														cx="108"
														cy="116"
														rx="9.5"
														ry="11.5"
														fill="var(--white)"
														stroke="var(--ink)"
														stroke-width="2.8" />
												</g>
												<!-- both pupils in one group so an eye dart is a
										     single snap, not two circles drifting apart -->
												<g class="pupils">
													<circle
														class="pupil"
														cx="80"
														cy="118"
														r="6.4"
														fill="var(--ink)" />
													<circle
														class="glint"
														cx="82.6"
														cy="114.2"
														r="2.5"
														fill="#fff" />
													<circle
														class="pupil"
														cx="108"
														cy="116"
														r="5.4"
														fill="var(--ink)" />
													<circle
														class="glint"
														cx="110.2"
														cy="112.6"
														r="2.1"
														fill="#fff" />
												</g>
												<!-- lids span the FULL eye height, and a lash line
										     keeps them from reading as a skin blob -->
												<g class="lids">
													<g class="lid near">
														<path
															d="M68 118 A12 13 0 0 1 92 118 L92 132 L68 132 Z"
															fill="var(--skin)" />
														<path
															d="M68 130.5 C76 135 85 135 92 130.5"
															fill="none"
															stroke="var(--ink)"
															stroke-width="3"
															stroke-linecap="round" />
													</g>
													<g class="lid far">
														<path
															d="M98.5 116 A9.5 11.5 0 0 1 117.5 116 L117.5 128 L98.5 128 Z"
															fill="var(--skin)" />
														<path
															d="M98.5 126.5 C104 130.5 112 130.5 117.5 126.5"
															fill="none"
															stroke="var(--ink)"
															stroke-width="2.7"
															stroke-linecap="round" />
													</g>
												</g>
											</g>

											<!-- A SMALL nose ON THE CENTRELINE. The eyes sit at
									     cx 80 / 108 and every mouth is built about x 94, so
									     a nose at x 99.5 had the head asserting a 3/4 turn
									     and a frontal view at once. It is also the only
									     feature that carried no contour, which made it read
									     as a bruise at shipping size — it is outlined now,
									     like ref 2's. -->
											<path
												class="nose"
												d="M94 125.8 C97.4 125.8 98.9 128.4 98.9 130.9 C98.9 133.7 96.8 135.4 94 135.4 C91.2 135.4 89.1 133.7 89.1 130.9 C89.1 128.4 90.6 125.8 94 125.8 Z"
												fill="var(--skin-3)"
												stroke="var(--ink)"
												stroke-width="2.2"
												stroke-linejoin="round" />

											<g class="mouths">
												<!-- `cocky` is on screen for the whole 2100 ms entrance
										     AND stroke 1 — the first 2.7 s the audience ever
										     sees — so it cannot be the weakest mouth in the
										     set. It is a filled grin with a tooth band now,
										     not a hairline arc. Same for the puzzled hold. -->
												<g class="mouth cocky">
													<path
														d="M74 140 C84 147.5 104 147.5 112 139 C111 148.5 99 153.5 87 151.5 C80 150.4 75 145.6 74 140 Z" />
													<path
														class="teeth-fill"
														d="M76.5 141.5 C85 147.4 103 147.4 110 140.6 C109.6 146.6 103 150.6 93.5 150.7 C84.5 150.8 79 146.5 76.5 141.5 Z" />
												</g>
												<path
													class="mouth work"
													d="M77 140 C87 135.5 103 135.5 111 141 C104 154 84 154 77 140 Z" />
												<path
													class="mouth puzzled"
													d="M76 146 C84 140 92 150 106 141 C107 148.5 100 156 90 155 C82 154 77 151 76 146 Z" />
												<!-- EFFORT and STRAIN cover strokes 3–6, i.e. most of the
												     performance, and both were a filled dark quad with white bars
												     laid across it — a barcode at 4×, not a mouth. Both are built
												     properly now, the way ref 4 draws an open mouth: a soft
												     cavity, a SHAPED white tooth block that follows the lip
												     curve, and a lip line on top. `strain` grits (the tooth block
												     nearly fills the cavity, with one division line); `effort` is
												     open with a tongue behind the upper teeth. -->
												<g class="mouth effort">
													<path
														d="M74 138 C85 132.5 103 132.5 112 136.5 C111 151 103 156.5 92.5 156.5 C80.5 156.5 74.8 149 74 138 Z" />
													<path
														class="tongue"
														d="M81.5 149 C85 144.5 99 144.5 102.5 149 C100 154 84 154 81.5 149 Z" />
													<path
														class="teeth-fill"
														d="M77.5 139 C86 135 101 135 108.5 138.6 C108 143.4 104.6 145.6 92.6 145.6 C80 145.6 78 143.4 77.5 139 Z" />
													<path class="lip" d="M74 138 C85 132.5 103 132.5 112 136.5" />
												</g>
												<g class="mouth strain">
													<path
														d="M70 137.5 C82 131 104.5 130.4 115 135.6 C114 152 106 158.5 92 158.5 C77.6 158.5 70.8 150 70 137.5 Z" />
													<path
														class="teeth-fill"
														d="M74 139.4 C84 134.6 102.5 134 111 137.8 C110.2 146.6 103 151 92 151 C81 151 74.8 146.4 74 139.4 Z" />
													<path class="tooth-line" d="M92.5 135 L92.5 151" />
													<path class="lip" d="M70 137.5 C82 131 104.5 130.4 115 135.6" />
												</g>
												<path
													class="mouth alarm"
													d="M88 141 C95 139 101 143 100 150 C99 157 90 158 87 152 C85 148 85 142 88 141 Z" />
												<path
													class="mouth panic"
													d="M79 135 C91 130 106 133 109 142 C112 154 102 164 90 162 C79 160 74 145 79 135 Z" />
											</g>

											<ellipse class="flush" cx="66" cy="132" rx="9.5" ry="6" />
											<ellipse class="flush" cx="118" cy="126" rx="7.5" ry="5" />

											<!-- HARD HAT — ONE MERGED SILHOUETTE.
									     What makes a hard hat a hard hat is a DOMINANT DEEP
									     CROWN with a SHORT INTEGRAL PEAK, not a flat brim.
									     The old one drew the peak as a separate capsule laid
									     across the dome, so a full-weight ink line ran over
									     the crown and the outline read as a small dome on a
									     long bar — a preacher hat at 75 px. Crown and peak
									     are now a single closed path: 91 u of crown against
									     106 u overall (1.16×, was 1.46×), 56 u deep, and no
									     line anywhere across the shell. Refs 2, 4 and 5. -->
											<g class="helmet">
												<path
													class="shell"
													d="M43 78 C41 48 60 22 90 22 C119 22 137 45 134 75 C141 75 147 78 147 83 C147 88 142 90 134 90 L52 90 C46 90 43 86 43 78 Z"
													fill="var(--hat)"
													stroke="var(--ink)"
													stroke-width="3.6"
													stroke-linejoin="round" />
												<!-- moulded centre ridge — a DETAIL on the shell, not
										     a seam through it -->
												<path
													d="M79 33 C79 26 84 22.5 91 22.5 C98 22.5 104 26 104 33 L105 45 C98 42 85 42 78 45 Z"
													fill="var(--hat-hi)"
													stroke="var(--ink)"
													stroke-width="2.6"
													stroke-linejoin="round" />
												<!-- one flat highlight, one flat shade -->
												<path
													d="M57 74 C55 50 64 33 77 27"
													fill="none"
													stroke="var(--hat-hi)"
													stroke-width="6"
													stroke-linecap="round" />
												<path
													d="M124 34 C133 46 136 60 134 74"
													fill="none"
													stroke="var(--hat-2)"
													stroke-width="6.5"
													stroke-linecap="round" />
												<!-- the brim's own thickness, INSIDE the silhouette -->
												<path
													d="M54 85 L140 83"
													fill="none"
													stroke="var(--hat-2)"
													stroke-width="3.4"
													stroke-linecap="round" />
											</g>

											<g class="sweat">
												<path
													class="drop a"
													d="M128 96 C132 102 134 106 131 109 C128 112 124 110 124 106 C124 103 126 99 128 96 Z" />
												<path
													class="drop b"
													d="M52 98 C56 104 58 108 55 111 C52 114 48 112 48 108 C48 105 50 101 52 98 Z" />
												<path
													class="drop c"
													d="M58 120 C62 126 64 130 61 133 C58 136 54 134 54 130 C54 127 56 123 58 120 Z" />
											</g>
										</g>
									</g>
								</g>
							</g>
						</g>

						<!-- NEAR ARM + TOOL. The whole HANDS + TOOL chain sits inside
						     one .hold, so it inherits his drive but not his body
						     rotation: the fists cannot rotate away from a bar that is
						     bolted into a fixed cylinder.

						     `.upper.near` and `.fore.near` are JOINT DRIVERS only — the
						     visible arm is the single `.limb` path below them, and its
						     elbow is the MIDPOINT of the elbow the two drivers imply,
						     so both curves still read and the joint is one point. -->
						<g class="hold">
							{#if !planted}{@render tbar()}{/if}

							<g class="arms front">
								<g class="arm near">
									<!-- THREE strokes, not one: deltoid → upper arm → forearm,
									     each narrower than the last. A single stroke cannot
									     taper, and a constant-width tube shoulder-to-wrist is
									     the one thing every flat-vector limb guide tells you
									     not to draw. The deltoid also solves the exposed
									     shoulder: it is 6 u wider than the upper arm, so the
									     upper arm's round ink cap is buried inside it and what
									     lands on the vest is a shaped, outlined sleeve head
									     instead of a tube end. -->
									<path class="limb ink seg-s" d={REST_S['.arm.near']} />
									<path class="limb ink seg-a" d={REST_A['.arm.near']} />
									<path class="limb ink seg-b" d={REST_B['.arm.near']} />
									<path class="limb sleeve near seg-s" d={REST_S['.arm.near']} />
									<path class="limb sleeve near seg-a" d={REST_A['.arm.near']} />
									<path class="limb sleeve near seg-b" d={REST_B['.arm.near']} />
									<g class="upper near"></g>
									<g class="fore near">
										<!-- NEAR GLOVE — FOUR PARTS, NOT A DISC.
										     The client's note was that the hands read as circles.
										     They did: one closed near-circular path plus two
										     hairlines. A work glove gripping a bar has four things
										     you can actually see, and all four are drawn now:
										       CUFF   — a gauntlet band on the FOREARM's own axis
										                (elbow 80,212 → wrist 134,186 ≈ −26°), in
										                leather rather than glove, so the wrist is a
										                material change and not a smooth continuation
										       MITT   — a pear, wide at the knuckles and tucked at
										                the heel; its bottom edge is scalloped into
										                three finger rolls, which is what breaks the
										                silhouette out of a circle
										       THUMB  — its own outlined lobe, laid ALONG the top of
										                the bar and reaching 17 u past the mitt onto
										                the bar's exposed run (refs 2 and 5 both draw
										                the thumb as a separate form, and both draw
										                the held object passing behind the hand)
										       CREASE — knuckle breaks that CONTINUE the scallop
										                notches up into the mitt, so they read as the
										                gaps between fingers, not as scratches
										     THE SCALLOPS ARE 8–11 u DEEP, not the ~2 u they were:
										     on a 35 u mitt at ship size a 2 u scallop is a smooth
										     curve and the hand reads as a potato. Roll tips sit at
										     y 199 / 202 / 199 against notches at y 191 / 193.
										     THE GRIP IS REAL. The T-bar's near cap is centred on
										     (132.6, 186.6) r 8.5 once `.bar`'s −7° about (166,182.5)
										     is applied, so the mitt covers the bar from its end to
										     x 152 and the thumb carries on ACROSS it to x 169, with
										     the bar still visible under the thumb and re-emerging
										     at 169 — object behind hand, hand in front of object.
										     `.arms.front` paints after the tbar, which is what
										     makes that overlap possible. The FAR hand is in
										     `.arms.back` and is correctly BEHIND the bar, which is
										     the same read from the other side.
										     The wrist point the limb solver drives (134,186) sits
										     well inside the mitt fill, so the arm still lands
										     buried in the glove at every angle. -->
										<g class="hand near">
											<rect
												class="cuff near"
												x="-9"
												y="-13.5"
												width="18"
												height="27"
												rx="5.5"
												transform="translate(125 193) rotate(-25.7)" />
											<path
												class="glove near"
												d="M117 181 C116 170 123 162.5 133.5 162 C145 161.5 152 168.5 152 179 L152 187 C152 194 149.5 198.5 146 198.8 C143 199 142 195 142 191 C141.6 197.6 138.4 202 134.6 201.8 C131.4 201.6 130.2 197 130 193 C129.4 197.6 127 200 124.4 199 C120.8 197.6 117.6 190 117 181 Z" />
											<path
												class="crease"
												d="M142 191 C142.8 187 143.2 183.8 142.6 180.4" />
											<path
												class="crease"
												d="M130 193 C130.8 189 131.2 185.8 130.6 182.4" />
											<path
												class="glove near thumb"
												d="M140.5 171 C142.5 164 150.5 161.5 156 165 C162.5 169 168.5 174 169.5 179 C170.5 183.6 167 187.6 162.4 186.4 C156.2 184.8 149 180.6 143.5 176.5 C140.6 174.4 139.8 173.2 140.5 171 Z" />
										</g>
									</g>
								</g>
							</g>
						</g>

						<g class="dust">
							<ellipse cx="22" cy="312" rx="10" ry="5.5" />
							<ellipse cx="92" cy="316" rx="8" ry="4.5" />
							<ellipse cx="12" cy="302" rx="6" ry="4" />
						</g>
					</g>
				</g>

				<!-- PUMP, front layer. Drawn AFTER the figure so the piston (which is
				     parented to his hands) disappears into the cylinder, and so the
				     barrel reads as being between the viewer and his far boot. -->
				<g class="rigging front">
					<g class="barrel">
						<rect
							x="142"
							y="246"
							width="48"
							height="60"
							rx="9"
							fill="var(--steel)"
							stroke="var(--ink)"
							stroke-width="3"
							stroke-linejoin="round" />
						<path
							d="M149 254 L149 300"
							stroke="var(--steel-hi)"
							stroke-width="4"
							fill="none"
							stroke-linecap="round" />
						<path
							d="M185 254 L185 300"
							stroke="var(--steel-2)"
							stroke-width="5"
							fill="none"
							stroke-linecap="round" />
						<rect
							x="134"
							y="236"
							width="64"
							height="15"
							rx="6"
							fill="var(--steel)"
							stroke="var(--ink)"
							stroke-width="2.8" />

						<!-- gauge, enlarged so the needle is legible, with a dial arc
						     that actually spans the needle's whole travel -->
						<g class="gauge">
							<circle
								cx="166"
								cy="274"
								r="18"
								fill="var(--white)"
								stroke="var(--ink)"
								stroke-width="3" />
							<circle
								cx="166"
								cy="274"
								r="15"
								fill="var(--hat)"
								style:opacity={gauge_glow} />
							<path
								d="M152 264 A14 14 0 0 1 180 264"
								fill="none"
								stroke="var(--ink)"
								stroke-width="2"
								opacity="0.45" />
							<path
								d="M176 262 A14 14 0 0 1 180 274"
								fill="none"
								stroke="var(--danger)"
								stroke-width="3" />
							<line
								class="needle"
								x1="166"
								y1="274"
								x2="166"
								y2="259"
								stroke="var(--danger)"
								stroke-width="3.4"
								stroke-linecap="round"
								style:--needle="{needle_deg}deg" />
							<circle cx="166" cy="274" r="2.8" fill="var(--ink)" />
						</g>
					</g>
					{#if planted}{@render tbar()}{/if}
				</g>
			</g>
		{/key}
	</svg>
</div>

<style>
	/* FLAT VECTOR PALETTE — SIX SEPARATED FAMILIES.
	   One flat fill per form, at most one flat shade beside it, one bold
	   contour. No radial form-shading, no rim light — the far-side variants are
	   the same hue a step darker and that is the only depth cue the style
	   allows itself.

	   The last pass ran three neighbouring blues (shirt 232, pants 252, steel
	   250) across both sleeves, both legs and the whole pump — inside 22° of
	   hue over most of the figure, which is why nothing on him read as a
	   different material. The references never do that: they anchor a large
	   high-chroma yellow/orange mass against neutral trousers and brown
	   leather. So the families are now yellow (hat), orange (vest), CREAM
	   (shirt + sleeves), blue (trousers only), brown (belt, boots, gloves) and
	   a genuinely neutral grey (the pump). The cream sleeves do double duty:
	   they are the lightest value on the figure, so the arms read against both
	   the orange vest and the near-black stage.

	   THE OUTLINE PROBLEM. Flat-vector cartoon is an idiom built on a bold dark
	   contour, and all four references sit on WHITE, where near-black ink is
	   the strongest line on the page. This hero stage is rgb(13,15,28): the old
	   --ink measured 1.12:1 against it, so the outer contour did literally
	   nothing and every dark form dissolved into the page. The fix is two-part
	   and deliberate:
	     1. --ink is lifted to 0.30 L. It still reads as the dark contour
	        against every fill on the figure (the lightest fill is 0.96, the
	        darkest 0.38), which is the only job an interior line has.
	     2. The OUTER contour is carried by a light keyline instead — a
	        double-pass 1.4 px halo on the whole SVG's alpha (see .mascot). It
	        hugs the silhouette only, so the flat-vector read is untouched: from
	        a metre away he is still flat fills and a dark line, he just sits on
	        the stage instead of sinking into it. This is the same device a
	        vinyl sticker uses, and it is the honest answer to "the client picked
	        an idiom that assumes a white page". */
	.root {
		--ink: oklch(0.3 0.04 264);
		--keyline: oklch(0.96 0.02 92);
		--white: oklch(0.985 0.005 90);
		--mouth: oklch(0.42 0.14 25);
		--tongue: oklch(0.6 0.16 22);
		/* a coloured iris instead of two near-black discs — every reference
		   uses one, and it is most of the excess black on the face */
		--iris: oklch(0.36 0.075 58);

		--skin: oklch(0.86 0.055 62);
		--skin-2: oklch(0.79 0.07 54);
		--skin-3: oklch(0.74 0.085 50);
		--hair: oklch(0.42 0.06 52);

		--hat: oklch(0.85 0.17 88);
		--hat-hi: oklch(0.93 0.14 94);
		--hat-2: oklch(0.72 0.16 74);

		--shirt: oklch(0.94 0.022 88);
		--shirt-hi: oklch(0.99 0.01 90);
		--shirt-2: oklch(0.85 0.03 84);

		--vest: oklch(0.73 0.17 48);
		--vest-2: oklch(0.64 0.16 44);
		--hi-tape: oklch(0.95 0.03 96);

		--pants: oklch(0.55 0.095 250);
		--pants-2: oklch(0.46 0.085 252);

		--leather: oklch(0.5 0.08 55);
		--leather-2: oklch(0.42 0.07 52);
		--boot-hi: oklch(0.7 0.075 60);

		--glove: oklch(0.6 0.095 58);
		--glove-2: oklch(0.52 0.085 54);

		--steel: oklch(0.52 0.006 250);
		--steel-2: oklch(0.38 0.006 250);
		--steel-hi: oklch(0.68 0.008 250);
		--danger: oklch(0.66 0.21 28);

		position: absolute;
		bottom: 0;
		left: 10%;
		width: clamp(150px, 20vw, 300px);
		height: clamp(190px, 27vw, 366px);
		/* Staged to the LEFT of the CTA so he faces it, the pump sits between
		   them, and the hose runs off-frame right straight into the button's
		   nozzle. The gag only reads if pump → hose → button is one line. */
		translate: -126% 20%;
		rotate: -12deg;
		opacity: 0;
		pointer-events: none;
		z-index: 6;
		filter: drop-shadow(0 18px 30px oklch(0 0 0 / 0.55));
	}

	/* ===================== ENTRANCE — HE FALLS ==========================
	   He used to leap on from off-stage low-left and land through a big
	   scale-squash bounce on the ROOT. Two things were wrong with that: he
	   arrived from the wings rather than from the sky, and the weight was
	   absorbed by his bounding box rather than by his body — a scale bounce,
	   not a landing.

	   This curve now carries the TRAJECTORY and almost nothing else: he
	   accelerates in from ~2 frame-heights above his mark under a single
	   ease-in (gravity), arrives at the mark at 20 % STILL TRAVELLING, and
	   from there the root moves at most 2.6 % of its own height. The
	   absorption is entirely in `pr-thigh` / `pr-shin` / `pr-figure` — the
	   knees fold to ~85° and eat 24 u of drop while the ankles stay planted.
	   20 % of 2100 ms = 420 ms of fall, i.e. ~10 frames at 24 fps: enough to
	   read the air pose, the tuck and the reach for the ground.

	   The only scale here is the airborne stretch and a 3 % contact squash,
	   and both pairs multiply to 1.000 like every other scale pair in the rig
	   (0.91 × 1.099, 1.03 × 0.971). */
	.root.on-stage {
		animation: arrive 2100ms both;
	}
	@keyframes arrive {
		0% {
			translate: -122% -196%;
			rotate: 7deg;
			scale: 0.91 1.099;
			opacity: 0;
			animation-timing-function: linear;
		}
		/* in frame and already moving */
		4% {
			translate: -122.4% -168%;
			rotate: 6.2deg;
			scale: 0.91 1.099;
			opacity: 1;
			animation-timing-function: cubic-bezier(0.52, 0, 0.88, 0.4);
		}
		/* he squares up over his mark on the way down */
		14% {
			translate: -124.6% -62%;
			rotate: 2deg;
			scale: 0.94 1.064;
			animation-timing-function: cubic-bezier(0.62, 0, 0.92, 0.44);
		}
		/* CONTACT — no ease into the floor */
		20% {
			translate: -126% 20%;
			rotate: -1.4deg;
			scale: 1 1;
			animation-timing-function: cubic-bezier(0.1, 0.85, 0.35, 1);
		}
		/* the only squash the root is allowed: two frames, 3 %, and it is gone
		   before the knees reach the bottom of their fold at 27 % */
		24% {
			translate: -126% 22.6%;
			rotate: 0.9deg;
			scale: 1.03 0.971;
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		34% {
			translate: -126% 19.4%;
			rotate: -0.5deg;
			scale: 0.994 1.006;
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		44% {
			translate: -126% 20.5%;
			rotate: 0.2deg;
			scale: 1 1;
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		56%,
		100% {
			translate: -126% 20%;
			rotate: 0deg;
			scale: 1;
			opacity: 1;
		}
	}
	.root[data-phase='pumping'] {
		animation: none;
		translate: -126% 20%;
		rotate: 0deg;
		opacity: 1;
	}

	/* PANIC exit — he leaves the frame at FULL SCALE with no fade. A
	   shrink-and-dissolve is not how a character exits a shot.

	   The exit now lives on `.exit` INSIDE the svg rather than on `.root`,
	   because `.rigging` must not travel with him: the pump is a planted set
	   piece and stays where it fell. Distances are the old root percentages
	   converted to viewBox units (240 × 340): −208 % of width = −499 u,
	   +22 % of height = +75 u. */
	.root[data-phase='boom'] {
		animation: none;
		translate: -126% 20%;
		rotate: 0deg;
		scale: 1;
		opacity: 1;
	}
	.rig[data-beat='panic'] .exit {
		animation: flee 820ms both;
	}
	.exit {
		transform-origin: 120px 170px;
	}
	@keyframes flee {
		0% {
			transform: translate(0, 0) rotate(0deg) scale(1);
			animation-timing-function: cubic-bezier(0.3, 0, 0.7, 0.4);
		}
		/* thrown back by the blast before he can run */
		10% {
			transform: translate(-28.8px, -27.2px) rotate(-10deg) scale(0.94, 1.09);
			animation-timing-function: cubic-bezier(0.9, 0, 1, 0.5);
		}
		/* gets a foot down and pushes off */
		20% {
			transform: translate(-19.2px, 13.6px) rotate(6deg) scale(1.14, 0.87);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.6);
		}
		100% {
			transform: translate(-499px, 74.8px) rotate(-6deg) scale(1);
		}
	}
	/* his contact shadow leaves with him; the pump keeps its own */
	@keyframes pa-shadow {
		0% {
			opacity: 1;
		}
		26%,
		100% {
			opacity: 0;
		}
	}
	.root.gone {
		opacity: 0;
		animation: none;
	}

	@media (max-width: 767px) {
		.root,
		.root[data-phase='pumping'] {
			translate: -74% 20%;
		}
	}

	.mascot {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
	/* THE KEYLINE — ON THE CHARACTER ONLY.
	   It was on `.mascot`, so it haloed the SVG's whole alpha: the barrel, the
	   foot plate, the gauge and the hose all got the same die-cut edge as the
	   figure and the result read as a vinyl sticker laid on the hero rather than
	   a man standing on it. `.exit` is exactly the character (legs + figure);
	   the pump, the hose and his contact shadow are outside it and are now
	   un-haloed, so the props sit BEHIND him in the stage instead of being
	   stickered onto it with him.

	   Also retuned for value. Two 1.4 px passes at 0.92 alpha measured
	   rgb(115,116,119) — mid grey, nowhere near the declared 0.96 L cream,
	   because a wide blurred semi-transparent shadow over rgb(12,16,30) simply
	   cannot reach its nominal colour. Three TIGHT (0.9 px) passes at full alpha
	   converge much closer to the token and give a firmer contour; the extra
	   pass is paid for by the much smaller filtered region. */
	.exit {
		filter: drop-shadow(0 0 0.9px var(--keyline)) drop-shadow(0 0 0.9px var(--keyline))
			drop-shadow(0 0 0.9px var(--keyline));
	}

	/* ===================== PER-BEAT CONSTANTS ==========================
	   --e scales amplitude. The stretch / squash / secondary-squash scale
	   pairs each MULTIPLY TO 1.000, so the character keeps the same amount
	   of meat through a take (Kahl's rule; the flour sack never changes
	   volume). */
	.rig {
		--e: 1;
		/* the leg fold is solved exactly at --e:1.4; --k rescales it so no
		   stroke can ever over-extend the two-bone chain */
		--k: calc(var(--e) / 1.4);
		--st-x: 1;
		--st-y: 1;
		--sq-x: 1;
		--sq-y: 1;
		--s2-x: 1;
		--s2-y: 1;
	}
	.rig[data-stroke='1'] {
		--e: 0.62;
		--st-x: 0.957;
		--st-y: 1.045;
		--sq-x: 1.066;
		--sq-y: 0.938;
		--s2-x: 1.04;
		--s2-y: 0.962;
	}
	.rig[data-stroke='2'] {
		--e: 0.8;
		--st-x: 0.945;
		--st-y: 1.058;
		--sq-x: 1.087;
		--sq-y: 0.92;
		--s2-x: 1.052;
		--s2-y: 0.951;
	}
	.rig[data-stroke='3'] {
		--e: 0.95;
		--st-x: 0.936;
		--st-y: 1.068;
		--sq-x: 1.104;
		--sq-y: 0.906;
		--s2-x: 1.06;
		--s2-y: 0.943;
	}
	.rig[data-stroke='5'] {
		--e: 1.15;
		--st-x: 0.924;
		--st-y: 1.082;
		--sq-x: 1.126;
		--sq-y: 0.888;
		--s2-x: 1.073;
		--s2-y: 0.932;
	}
	.rig[data-stroke='6'] {
		--e: 1.4;
		--st-x: 0.907;
		--st-y: 1.103;
		--sq-x: 1.166;
		--sq-y: 0.858;
		--s2-x: 1.089;
		--s2-y: 0.918;
	}

	/* ===================== CONTINUOUS LIMBS ============================
	   One path per limb, stroked twice: the ink pass is the outline, the
	   colour pass sits inside it. Round cap + round join means the elbow and
	   the knee are continuous at every angle, and because it is a SINGLE
	   shape there is no seam that can open. The `d` is written per frame by
	   `drawLimbs()` in the script. */
	.limb {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.limb.ink {
		stroke: var(--ink);
	}
	/* TAPER. Each limb is drawn as TWO round-capped strokes sharing the joint
	   point, the distal one narrower than the proximal one. A single stroke
	   cannot taper, and a constant-width tube from shoulder to wrist is the
	   thing every flat-vector limb guide tells you not to draw. The joint stays
	   continuous for free: the thinner segment's round cap is strictly inside
	   the thicker one's, on both the ink pass and the colour pass, at every
	   angle. */
	.arm.near .limb.ink.seg-s {
		stroke-width: 34;
	}
	.arm.far .limb.ink.seg-s {
		stroke-width: 27;
	}
	.arm.near .limb.ink.seg-a {
		stroke-width: 28;
	}
	.arm.near .limb.ink.seg-b {
		stroke-width: 22.5;
	}
	.arm.far .limb.ink.seg-a {
		stroke-width: 22;
	}
	.arm.far .limb.ink.seg-b {
		stroke-width: 18;
	}
	.leg.near .limb.ink.seg-a {
		stroke-width: 33;
	}
	.leg.near .limb.ink.seg-b {
		stroke-width: 27;
	}
	.leg.far .limb.ink.seg-a {
		stroke-width: 27;
	}
	.leg.far .limb.ink.seg-b {
		stroke-width: 22.5;
	}
	/* SHORT SLEEVES. Now that a limb is two segments the sleeve can stop at the
	   elbow and the forearm can be skin, which is what refs 2, 4 and 5 all do —
	   and it is the cheapest way to stop the near arm reading as one undivided
	   cream tube laid across the vest. The hem needs no line: the forearm's
	   round cap at the elbow is strictly inside the sleeve's, so the skin lands
	   inside a cream ring and reads as a cuff. */
	.sleeve {
		stroke: var(--shirt);
	}
	.sleeve.far {
		stroke: var(--shirt-2);
	}
	.arm.near .sleeve.seg-b {
		stroke: var(--skin);
	}
	.arm.far .sleeve.seg-b {
		stroke: var(--skin-2);
	}
	.arm.near .sleeve.seg-s {
		stroke-width: 30;
	}
	.arm.far .sleeve.seg-s {
		stroke-width: 22.5;
	}
	.arm.near .sleeve.seg-a {
		stroke-width: 22;
	}
	.arm.near .sleeve.seg-b {
		stroke-width: 16.5;
	}
	.arm.far .sleeve.seg-a {
		stroke-width: 16.5;
	}
	.arm.far .sleeve.seg-b {
		stroke-width: 12.5;
	}
	.pants {
		stroke: var(--pants);
	}
	.pants.far {
		stroke: var(--pants-2);
	}
	.leg.near .pants.seg-a {
		stroke-width: 27;
	}
	.leg.near .pants.seg-b {
		stroke-width: 21;
	}
	.leg.far .pants.seg-a {
		stroke-width: 21;
	}
	.leg.far .pants.seg-b {
		stroke-width: 16.5;
	}
	.boot-shape.near {
		fill: var(--leather);
	}
	.boot-shape.far {
		fill: var(--leather-2);
	}
	/* GLOVE CONSTRUCTION. Mitt and thumb carry the silhouette weight, the cuff
	   is a darker material, and the creases are interior line only — the same
	   three-tier line hierarchy the rest of the figure uses. */
	.glove {
		stroke: var(--ink);
		stroke-linejoin: round;
	}
	.glove.near {
		fill: var(--glove);
		stroke-width: 3.4;
	}
	.glove.far {
		fill: var(--glove-2);
		stroke-width: 2.8;
	}
	.glove.thumb {
		fill: var(--glove);
	}
	.glove.far.thumb {
		fill: var(--glove-2);
	}
	.cuff {
		fill: var(--leather);
		stroke: var(--ink);
		stroke-linejoin: round;
	}
	.cuff.near {
		stroke-width: 3;
	}
	.cuff.far {
		fill: var(--leather-2);
		stroke-width: 2.5;
	}
	/* Knuckle STRUCTURE, not surface scratches. Each crease starts exactly at a
	   scallop notch in the mitt's contour and runs up into the mass, so the eye
	   reads it as the same division the silhouette already shows — a gap between
	   two fingers — rather than as a mark drawn on a potato. That is also why it
	   carries near-contour weight and near-full opacity: a 0.6-alpha hairline
	   crossing a form reads as damage, a 2.8 line continuing a contour reads as
	   construction. */
	.crease {
		fill: none;
		stroke: var(--ink);
		stroke-width: 2.8;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.hand.far .crease {
		stroke-width: 2.3;
	}

	/* ===================== TRANSFORM ORIGINS =========================== */
	.shadow {
		fill: oklch(0 0 0 / 0.55);
		transform-origin: 104px 316px;
	}
	.hose-line {
		fill: none;
		stroke: var(--steel-2);
		stroke-linecap: round;
	}
	.hose-core {
		fill: none;
		stroke: oklch(from var(--steel-hi) l c h / 0.5);
		stroke-linecap: round;
	}
	.hose-end {
		fill: var(--steel-2);
	}
	.hose-a {
		transform-origin: 190px 268px;
	}
	.hose-b {
		transform-origin: 218px 266px;
	}
	.needle {
		transform-origin: 166px 274px;
		transform: rotate(var(--needle, -88deg));
		transition: transform 420ms cubic-bezier(0.2, 1.5, 0.4, 1);
	}
	.figure {
		transform-origin: 94px 214px;
	}
	.spine {
		transform-origin: 92px 208px;
	}
	.torso {
		transform-origin: 92px 214px;
	}
	.head {
		transform-origin: 92px 152px;
	}
	.lookat {
		transform-origin: 92px 152px;
	}
	/* PROPORTION, NOT ACTING. A static reduce-and-lift about the chin so the
	   head stops being wider than the torso and the neck gets somewhere to
	   exist. Every descendant keeps its authored coordinates — which is why the
	   eye, brow, helmet, lid and mouth origins below did not have to move.
	   NOTHING may animate this group. */
	.skull {
		transform-origin: 92px 164px;
		transform: translateY(-24px) scale(0.88);
	}
	.helmet {
		transform-origin: 90px 88px;
	}
	/* each arm pivots on ITS OWN shoulder, so a swing never pulls the sleeve
	   cap off the joint — and the two can be animated independently */
	.arms.front {
		transform-origin: 53px 163px;
	}
	.arms.back {
		transform-origin: 137px 157px;
	}
	/* The tool pivots on the piston axis, not on the shoulders — it is a prop,
	   not a limb. Both halves share this origin so they can never shear apart. */
	.handle,
	.rod {
		transform-origin: 166px 190px;
	}
	/* THE PISTON IS VERTICAL. `.hold` sits between `.figure` and the tool and
	   runs the EXACT negation of the figure's rotation about the same origin,
	   so the tool inherits his drive (translation) but not his body rotation.
	   Without it a 5° torso rotation sheared the rod ~6 px sideways inside a
	   cylinder that does not move — the same class of error as the old
	   composed-transform bug, one order of magnitude smaller. */
	.hold {
		transform-origin: 94px 214px;
	}
	.rig[data-beat='stroke'][data-kind='light'] .hold,
	.rig[data-beat='stroke'][data-kind='heavy'] .hold {
		animation: st-unrot var(--stroke-ms) both;
	}
	.rig[data-beat='stroke'][data-kind='fail'] .hold {
		animation: fl-unrot var(--stroke-ms) both;
	}
	.rig[data-beat='stroke'][data-kind='reset'] .hold {
		animation: rs-unrot var(--stroke-ms) both;
	}
	.rig[data-beat='prep'] .hold {
		animation: pr-unrot 2100ms both;
	}
	@keyframes st-unrot {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.5, 1);
		}
		8% {
			transform: rotate(calc(0.3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.18, 0.82, 0.3, 1);
		}
		18% {
			transform: rotate(calc(2.2deg * var(--e)));
			animation-timing-function: linear;
		}
		24% {
			transform: rotate(calc(1.9deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.4);
		}
		26% {
			transform: rotate(calc(2.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.25, 0.55, 0.6, 0.86);
		}
		34% {
			transform: rotate(calc(-0.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.32, 0.5, 0.62, 0.88);
		}
		42% {
			transform: rotate(calc(-1.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.65, 0.9);
		}
		48% {
			transform: rotate(calc(-2.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		54% {
			transform: rotate(calc(-3.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0, 0.9, 0.2, 1);
		}
		57% {
			transform: rotate(calc(-2.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		61% {
			transform: rotate(calc(-3.3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		74% {
			transform: rotate(calc(-0.5deg * var(--e)));
			animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
		}
		84% {
			transform: rotate(calc(0.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		93% {
			transform: rotate(calc(-0.2deg * var(--e)));
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes fl-unrot {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.18, 0.82, 0.3, 1);
		}
		18% {
			transform: rotate(calc(2.2deg * var(--e)));
			animation-timing-function: linear;
		}
		26% {
			transform: rotate(calc(2.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.25, 0.55, 0.6, 0.86);
		}
		38% {
			transform: rotate(calc(-1.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0.3, 0.8, 0.9);
		}
		52% {
			transform: rotate(calc(-3.4deg * var(--e)));
			animation-timing-function: linear;
		}
		62% {
			transform: rotate(calc(-3.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		82% {
			transform: rotate(calc(0.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-unrot {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		22% {
			transform: rotate(2.4deg);
			animation-timing-function: linear;
		}
		48% {
			transform: rotate(2.8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		62% {
			transform: rotate(1deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		70% {
			transform: rotate(-1.6deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		78% {
			transform: rotate(-0.6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes pr-unrot {
		0% {
			transform: rotate(8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: rotate(-3deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: rotate(-3.4deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: rotate(-7deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: rotate(2deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: rotate(-1.6deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: rotate(1deg);
			animation-timing-function: linear;
		}
		62% {
			transform: rotate(1.3deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		84% {
			transform: rotate(-0.8deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	.bar {
		/* the drawn tilt of the T-bar; kept off `.handle` so the animation on
		   `.handle` composes with it instead of overwriting it */
		transform-origin: 166px 182.5px;
		transform: rotate(-7deg);
	}
	.fore.near {
		transform-origin: 134px 186px; /* the wrist — so the fist never leaves the bar */
	}
	/* The upper arm tracks the moving elbow: it rotates toward it and takes up
	   the change in reach with a scaleY, which the tee sleeve hides. Without
	   this the forearm folds and the shoulder just stays where it was. */
	.upper.near {
		transform-origin: 53px 163px;
	}
	.upper.far {
		transform-origin: 137px 157px;
	}
	.fore.far {
		transform-origin: 201px 179px;
	}
	.barrel {
		transform-origin: 166px 306px;
	}
	/* both pump layers topple about the same point — the base of the barrel —
	   so they stay one rigid object when the blast knocks it over */
	.rigging {
		transform-origin: 166px 306px;
	}
	.leg.near .thigh {
		transform-origin: 72px 212px;
	}
	.leg.near .shin {
		transform-origin: 86px 258px;
	}
	.leg.near .boot {
		transform-origin: 64px 304px;
	}
	.leg.far .thigh {
		transform-origin: 112px 208px;
	}
	.leg.far .shin {
		transform-origin: 140px 250px;
	}
	.leg.far .boot {
		transform-origin: 128px 300px;
	}

	/* He backs AWAY from the swelling button (it is to his right, so away is
	   negative X) and cranes up as it grows over him.

	   `.lean` wraps the UPPER BODY ONLY and pivots on the hips. The legs are
	   outside it, so the lean arches him at the waist — which is what actually
	   happens — instead of dragging both planted boots 22 px across the floor.
	   A weight shift you cannot take with a step has to be taken at the hips. */
	.lean {
		transform-origin: 94px 214px;
		transform: rotate(calc((var(--btn, 1) - 1) * -2.4deg));
		transition: transform 520ms cubic-bezier(0.25, 1, 0.5, 1);
	}

	/* ===================== THE PUMP STROKE =============================
	   Contact is at 54%, and the DRIVE runs 26%→54% — 28% of the beat, i.e.
	   ~5 frames on the quickest stroke and ~8 on the heaviest, with spacing
	   that TIGHTENS as the back-pressure rises. Effort lives in the slow
	   push; the snap lives in the release (74% is already near neutral).

	   Extremes are staggered so nothing stops on one frame:
	     figure 54 → thigh/arms 56 → torso 57 → fore 58 → head 59
	     → helmet 62 → hose 60/66 (still moving at 100). */

	.rig[data-beat='stroke'][data-kind='light'],
	.rig[data-beat='stroke'][data-kind='heavy'] {
		.figure {
			animation: st-figure var(--stroke-ms) both;
		}
		.spine {
			animation: st-spine var(--stroke-ms) both;
		}
		.torso {
			animation: st-torso var(--stroke-ms) both;
		}
		.head {
			animation: st-head var(--stroke-ms) both;
		}
		.helmet {
			animation: st-helmet var(--stroke-ms) both;
		}
		.arms {
			animation: st-arms var(--stroke-ms) both;
		}
		/* THE TOOL LAG. The T-bar and the piston run the fists' OWN curve, one
		   frame later (W&H's pitchfork: the tool travels the same path a drawing
		   or two after the body). A delay is an offset; a second animation on a
		   child would be a composition, which is what tore the pump apart. */
		.handle,
		.rod {
			animation: st-arms var(--stroke-ms) both;
			animation-delay: 42ms;
		}
		.shoulder.near {
			animation: st-shoulder var(--stroke-ms) both;
		}
		.fore.near {
			animation: st-fore var(--stroke-ms) both;
		}
		.fore.far {
			animation: st-fore-far var(--stroke-ms) both;
		}
		.upper.near {
			animation: st-upper var(--stroke-ms) both;
		}
		.upper.far {
			animation: st-upper-far var(--stroke-ms) both;
		}
		.leg.near .thigh {
			animation: st-thigh var(--stroke-ms) both;
		}
		.leg.near .shin {
			animation: st-shin var(--stroke-ms) both;
		}
		.leg.near .boot {
			animation: st-boot var(--stroke-ms) both;
		}
		.leg.far .thigh {
			animation: st-thigh-far var(--stroke-ms) both;
		}
		.leg.far .shin {
			animation: st-shin-far var(--stroke-ms) both;
		}
		.leg.far .boot {
			animation: st-boot-far var(--stroke-ms) both;
		}
		.hose-a {
			animation: st-hose-a var(--stroke-ms) both;
		}
		.hose-b {
			animation: st-hose-b var(--stroke-ms) both;
		}
		.shadow {
			animation: st-shadow var(--stroke-ms) both;
		}
		.barrel {
			animation: st-barrel var(--stroke-ms) both;
		}
	}

	@keyframes st-figure {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.5, 1);
		}
		8% {
			transform: translate(-1px, -1.5px) rotate(-0.3deg);
			animation-timing-function: cubic-bezier(0.18, 0.82, 0.3, 1);
		}
		/* ANTICIPATION — the weight shifts back onto his heels and he unloads up */
		18% {
			transform: translate(calc(-2.6px * var(--e)), calc(-4.3px * var(--e)))
				rotate(calc(-2.2deg * var(--e)));
			animation-timing-function: linear;
		}
		24% {
			transform: translate(calc(-2.4px * var(--e)), calc(-3.9px * var(--e)))
				rotate(calc(-1.9deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.4);
		}
		26% {
			transform: translate(calc(-3px * var(--e)), calc(-4.5px * var(--e)))
				rotate(calc(-2.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.25, 0.55, 0.6, 0.86);
		}
		/* ---- THE DRIVE: his weight goes forward FIRST, spacing tightens ---- */
		34% {
			transform: translate(0, calc(3px * var(--e))) rotate(calc(0.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.32, 0.5, 0.62, 0.88);
		}
		42% {
			transform: translate(calc(2.6px * var(--e)), calc(9px * var(--e)))
				rotate(calc(1.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.65, 0.9);
		}
		48% {
			transform: translate(calc(4px * var(--e)), calc(13px * var(--e)))
				rotate(calc(2.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		/* CONTACT — still travelling into it; no easing into the bottom */
		54% {
			transform: translate(calc(5.2px * var(--e)), calc(16px * var(--e)))
				rotate(calc(3.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0, 0.9, 0.2, 1);
		}
		/* RECOIL — one frame of rebound */
		57% {
			transform: translate(calc(4.2px * var(--e)), calc(12.6px * var(--e)))
				rotate(calc(2.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		/* RE-PLANT — the weight settles onto it (Kahl: DO something with a landing) */
		61% {
			transform: translate(calc(4.8px * var(--e)), calc(15.2px * var(--e)))
				rotate(calc(3.3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		/* the release is fast */
		74% {
			transform: translate(calc(1px * var(--e)), calc(2px * var(--e)))
				rotate(calc(0.5deg * var(--e)));
			animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
		}
		84% {
			transform: translate(calc(-0.6px * var(--e)), calc(-2.4px * var(--e)))
				rotate(calc(-0.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		93% {
			transform: translate(calc(0.2px * var(--e)), calc(0.7px * var(--e)))
				rotate(calc(0.2deg * var(--e)));
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}

	/* SPINE REVERSAL: the chest counter-rotates against the hips — arched
	   back on the wind-up, curled over the pump on the drive. */
	@keyframes st-spine {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		18% {
			transform: rotate(calc(-3.4deg * var(--e)));
			animation-timing-function: linear;
		}
		26% {
			transform: rotate(calc(-4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		54% {
			transform: rotate(calc(4.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0, 0.9, 0.2, 1);
		}
		58% {
			transform: rotate(calc(3.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		63% {
			transform: rotate(calc(4.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.35, 1);
		}
		78% {
			transform: rotate(calc(-1.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	@keyframes st-torso {
		0% {
			transform: scale(1, 1);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		20% {
			transform: scale(var(--st-x), var(--st-y));
			animation-timing-function: linear;
		}
		28% {
			transform: scale(var(--st-x), var(--st-y));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		/* the squash lands AFTER the contact (Ken Harris: touch, then flatten) */
		57% {
			transform: scale(var(--sq-x), var(--sq-y));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		63% {
			transform: scale(var(--s2-x), var(--s2-y));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		80%,
		100% {
			transform: scale(1, 1);
		}
	}

	@keyframes st-head {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.78, 0.3, 1);
		}
		20% {
			transform: translate(calc(-2px * var(--e)), calc(-4.2px * var(--e)))
				rotate(calc(-3.2deg * var(--e)));
			animation-timing-function: linear;
		}
		28% {
			transform: translate(calc(-1px * var(--e)), calc(-5.2px * var(--e)))
				rotate(calc(-3.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		/* the head arcs down AND forward, landing 5 frames after the hands */
		59% {
			transform: translate(calc(3.4px * var(--e)), calc(5.2px * var(--e)))
				rotate(calc(4.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		66% {
			transform: translate(calc(1.4px * var(--e)), calc(3px * var(--e)))
				rotate(calc(2.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.45, 0, 0.6, 1);
		}
		73% {
			transform: translate(calc(2.2px * var(--e)), calc(5px * var(--e)))
				rotate(calc(3.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		86% {
			transform: translate(calc(-0.4px * var(--e)), calc(-1.4px * var(--e)))
				rotate(calc(-0.9deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}

	@keyframes st-helmet {
		/* drag: opposite rotation sign to the head at every extreme, and every
		   extreme three frames later */
		0% {
			transform: translateY(0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.25, 0.8, 0.3, 1);
		}
		23% {
			transform: translateY(calc(-1.2px * var(--e))) rotate(calc(2.6deg * var(--e)));
			animation-timing-function: linear;
		}
		32% {
			transform: translateY(calc(-1.6px * var(--e))) rotate(calc(3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.45, 0.4, 0.7, 0.9);
		}
		62% {
			transform: translateY(calc(2.6px * var(--e))) rotate(calc(-5.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.15, 0.85, 0.35, 1);
		}
		71% {
			transform: translateY(calc(0.6px * var(--e))) rotate(calc(-1.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.5, 1);
		}
		80% {
			transform: translateY(calc(-0.8px * var(--e))) rotate(calc(2.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.5, 1);
		}
		90% {
			transform: rotate(calc(-1deg * var(--e)));
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}

	/* the hands lag the body into the drive (W&H: the body weight moves
	   forward before the arm straightens) and bottom out 2 frames after it */
	/* THE HANDS' OWN TRAVEL, RELATIVE TO HIS BODY.
	   Round 5 measured the near elbow articulating 3.4°–7.7° on the four money
	   beats — the least movement in the whole performance, on the beats that
	   have to read as effort. The diagnosis was right: it is `st-arms` against
	   the torso, not the drawing. The numbers say why. The figure squatted
	   20.5 u (× --e) while the hands only moved 10.7 u relative to it, so most
	   of the "stroke" was his knees, the shoulder-to-wrist distance barely
	   changed, and a two-bone chain whose ends keep their separation cannot
	   fold. Relative travel is now 15.7 u (−6.5 → +9.2), i.e. 47 % more hand
	   against body — the rest of the fold comes from `st-shoulder` below.
	   The T-bar and the piston still run THIS curve at a 42 ms delay, so the
	   pump is still one rigid body; the rod was shortened to 92 u to keep its
	   deepest contact inside the barrel now that it travels further. */
	@keyframes st-arms {
		0% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0.16, 0.84, 0.3, 1);
		}
		16% {
			transform: translateY(calc(-5.2px * var(--e)));
			animation-timing-function: linear;
		}
		24% {
			transform: translateY(calc(-4.6px * var(--e)));
			animation-timing-function: cubic-bezier(0.42, 0, 0.9, 0.28);
		}
		28% {
			transform: translateY(calc(-6.5px * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		38% {
			transform: translateY(calc(0.8px * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		46% {
			transform: translateY(calc(4.6px * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		56% {
			transform: translateY(calc(8.8px * var(--e)));
			animation-timing-function: cubic-bezier(0, 0.9, 0.25, 1);
		}
		59% {
			transform: translateY(calc(7.5px * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		63% {
			transform: translateY(calc(9.2px * var(--e)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		76% {
			transform: translateY(calc(1.9px * var(--e)));
			animation-timing-function: cubic-bezier(0.22, 0.74, 0.4, 1);
		}
		87% {
			transform: translateY(calc(-1.1px * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0);
		}
	}

	/* THE SHOULDER SHRUG — the other half of the elbow fix.
	   `.shoulder.near` is an empty driver group inside `.torso`; the limb solver
	   reads it for the proximal end of the near arm, so translating it is a pure
	   IK input. It moves ALONG THE ARM'S OWN AXIS (shoulder 53,163 → wrist
	   134,186 ≈ 16° below horizontal, unit 0.962/0.273), because that is the
	   only direction that changes |shoulder → wrist| — and |shoulder → wrist| is
	   the only thing a two-bone chain with both ends pinned can respond to.

	   It only ever travels INBOARD (up and to the right, onto the chest) at the
	   top of the stroke, where the elbow has to fold, and returns through rest
	   at the contact, where it has to extend. Never outboard: at rest the
	   34 u-wide deltoid cap is already only ~10 u inside the vest contour, and
	   pushing the joint the other way would hang the sleeve head off his body
	   (round 4 finding 4, which round 5 closed and this must not reopen).
	   Measured live at --e 1.4 (heavy stroke 6): the near elbow travels
	   84°–104°. It was 7.7° before this round. */
	@keyframes st-shoulder {
		0% {
			transform: translate(0, 0);
			animation-timing-function: cubic-bezier(0.16, 0.84, 0.3, 1);
		}
		18% {
			transform: translate(calc(8px * var(--e)), calc(-1px * var(--e)));
			animation-timing-function: linear;
		}
		26% {
			transform: translate(calc(12.5px * var(--e)), calc(-1.5px * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		40% {
			transform: translate(calc(6.6px * var(--e)), calc(-0.7px * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		/* full extension lands one frame AFTER the figure's contact, so the arm
		   is still straightening as the body stops — overlap, not a stack */
		56% {
			transform: translate(calc(-2px * var(--e)), calc(0.6px * var(--e)));
			animation-timing-function: cubic-bezier(0, 0.9, 0.25, 1);
		}
		59% {
			transform: translate(calc(0.8px * var(--e)), 0);
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		63% {
			transform: translate(calc(-0.9px * var(--e)), calc(0.3px * var(--e)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		78% {
			transform: translate(calc(3.4px * var(--e)), calc(-0.4px * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0);
		}
	}

	/* THE ELBOW. Rotating the forearm about the WRIST folds the elbow up and
	   out at the top of the stroke and straightens it into the contact,
	   without the fist ever leaving the bar. */
	@keyframes st-fore {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		18% {
			transform: rotate(calc(7deg * var(--e)));
			animation-timing-function: linear;
		}
		28% {
			transform: rotate(calc(8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		46% {
			transform: rotate(calc(1deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		/* the contact break is deep on purpose: rotating the forearm about the
		   wrist this far drives the elbow well below and left of the belt, which
		   is the only way the forearm clears the belt line by more than 10–15° */
		58% {
			transform: rotate(calc(-14deg * var(--e)));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		64% {
			transform: rotate(calc(-10deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		80% {
			transform: rotate(calc(1.3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	/* the far arm runs 5% (≈2 frames) behind the near one — never twinned */
	@keyframes st-fore-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		23% {
			transform: rotate(calc(5deg * var(--e)));
			animation-timing-function: linear;
		}
		33% {
			transform: rotate(calc(5.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		51% {
			transform: rotate(calc(0.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		63% {
			transform: rotate(calc(-4.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		70% {
			transform: rotate(calc(-3deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		86% {
			transform: rotate(calc(1deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* the upper arm follows the elbow the forearm is swinging: it aims at it
	   and absorbs the change in reach with a scaleY the sleeve conceals */
	@keyframes st-upper {
		0% {
			transform: rotate(0deg) scaleY(1);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		18% {
			transform: rotate(calc(1.6deg * var(--e))) scaleY(calc(1 - 0.16 * var(--e)));
			animation-timing-function: linear;
		}
		28% {
			transform: rotate(calc(1.9deg * var(--e))) scaleY(calc(1 - 0.185 * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		46% {
			transform: rotate(calc(0.2deg * var(--e))) scaleY(calc(1 - 0.02 * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		58% {
			transform: rotate(calc(-1.5deg * var(--e))) scaleY(calc(1 + 0.14 * var(--e)));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		64% {
			transform: rotate(calc(-1deg * var(--e))) scaleY(calc(1 + 0.09 * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		80% {
			transform: rotate(calc(0.3deg * var(--e))) scaleY(calc(1 - 0.03 * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg) scaleY(1);
		}
	}
	@keyframes st-upper-far {
		0% {
			transform: rotate(0deg) scaleY(1);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		23% {
			transform: rotate(calc(-5.3deg * var(--e))) scaleY(calc(1 - 0.015 * var(--e)));
			animation-timing-function: linear;
		}
		33% {
			transform: rotate(calc(-6.1deg * var(--e))) scaleY(calc(1 - 0.02 * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		51% {
			transform: rotate(calc(-0.9deg * var(--e))) scaleY(1);
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		63% {
			transform: rotate(calc(4.8deg * var(--e))) scaleY(calc(1 + 0.036 * var(--e)));
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		70% {
			transform: rotate(calc(3.2deg * var(--e))) scaleY(calc(1 + 0.024 * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		86% {
			transform: rotate(calc(-1deg * var(--e))) scaleY(1);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg) scaleY(1);
		}
	}

	/* THE KNEE. Solved so the ankle stays put while the hips travel: the
	   thigh translates with the hips and rotates about them, the shin
	   counter-rotates about the knee, and the boot counter-rotates again so
	   the sole never leaves the floor. This is what carries the weight — a
	   scaleY cannot do it. */
	@keyframes st-thigh {
		0% {
			transform: translateY(0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		20% {
			transform: translateY(calc(-3.6px * var(--k))) rotate(calc(14.2deg * var(--k)));
			animation-timing-function: linear;
		}
		28% {
			transform: translateY(calc(-4px * var(--k))) rotate(calc(15.8deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		36% {
			transform: translateY(calc(4.4px * var(--k))) rotate(calc(-4.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		44% {
			transform: translateY(calc(12.6px * var(--k))) rotate(calc(-13deg * var(--k)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		50% {
			transform: translateY(calc(18.2px * var(--k))) rotate(calc(-18.8deg * var(--k)));
			animation-timing-function: cubic-bezier(0.45, 0.38, 0.72, 0.94);
		}
		56% {
			transform: translateY(calc(22.4px * var(--k))) rotate(calc(-23.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		59% {
			transform: translateY(calc(18px * var(--k))) rotate(calc(-18.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		63% {
			transform: translateY(calc(20.5px * var(--k))) rotate(calc(-21.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		76% {
			transform: translateY(calc(2.7px * var(--k))) rotate(calc(-2.8deg * var(--k)));
			animation-timing-function: cubic-bezier(0.22, 0.74, 0.4, 1);
		}
		86% {
			transform: translateY(calc(-1.7px * var(--k))) rotate(calc(5.7deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}
	@keyframes st-shin {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		20% {
			transform: rotate(calc(-28deg * var(--k)));
			animation-timing-function: linear;
		}
		28% {
			transform: rotate(calc(-31.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		36% {
			transform: rotate(calc(9.5deg * var(--k)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		44% {
			transform: rotate(calc(26.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		50% {
			transform: rotate(calc(38.5deg * var(--k)));
			animation-timing-function: cubic-bezier(0.45, 0.38, 0.72, 0.94);
		}
		56% {
			transform: rotate(calc(47.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		59% {
			transform: rotate(calc(38.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.5, 1);
		}
		63% {
			transform: rotate(calc(43.5deg * var(--k)));
			animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
		}
		76% {
			transform: rotate(calc(5.7deg * var(--k)));
			animation-timing-function: cubic-bezier(0.22, 0.74, 0.4, 1);
		}
		86% {
			transform: rotate(calc(-11.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes st-boot {
		/* counter-rotates the accumulated leg rotation so the sole stays flat,
		   plus a one-frame splay on the strike */
		0% {
			transform: rotate(0deg) scale(1, 1);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		20% {
			transform: rotate(calc(13.8deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: linear;
		}
		28% {
			transform: rotate(calc(15.4deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		44% {
			transform: rotate(calc(-13.6deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		56% {
			transform: rotate(calc(-24.4deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		61% {
			transform: rotate(calc(-19.6deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		78% {
			transform: rotate(calc(-2.9deg * var(--k)))
				scale(calc(1 + 0.07 * var(--e)), calc(1 - 0.065 * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg) scale(1, 1);
		}
	}
	/* the braced far leg takes a different share of the load — 62% of the near
	   leg's fold, and one frame behind it */
	@keyframes st-thigh-far {
		0% {
			transform: translateY(0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		21% {
			transform: translateY(calc(-2.2px * var(--k))) rotate(calc(5.7deg * var(--k)));
			animation-timing-function: linear;
		}
		29% {
			transform: translateY(calc(-2.5px * var(--k))) rotate(calc(6.4deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		45% {
			transform: translateY(calc(7.6px * var(--k))) rotate(calc(-9.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		57% {
			transform: translateY(calc(13.9px * var(--k))) rotate(calc(-16.8deg * var(--k)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		61% {
			transform: translateY(calc(11.3px * var(--k))) rotate(calc(-13.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.35, 1);
		}
		77% {
			transform: translateY(calc(1.7px * var(--k))) rotate(calc(-2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}
	@keyframes st-shin-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		21% {
			transform: rotate(calc(-10.6deg * var(--k)));
			animation-timing-function: linear;
		}
		29% {
			transform: rotate(calc(-11.9deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		45% {
			transform: rotate(calc(16.3deg * var(--k)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		57% {
			transform: rotate(calc(29.9deg * var(--k)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		61% {
			transform: rotate(calc(24.3deg * var(--k)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.35, 1);
		}
		77% {
			transform: rotate(calc(3.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes st-boot-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		21% {
			transform: rotate(calc(4.9deg * var(--k)));
			animation-timing-function: linear;
		}
		29% {
			transform: rotate(calc(5.5deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		45% {
			transform: rotate(calc(-7.2deg * var(--k)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		57% {
			transform: rotate(calc(-13.1deg * var(--k)));
			animation-timing-function: cubic-bezier(0.05, 0.9, 0.3, 1);
		}
		61% {
			transform: rotate(calc(-10.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.35, 1);
		}
		77% {
			transform: rotate(calc(-1.6deg * var(--k)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* THE HOSE JOINT. The far end of `.hose-b` is butted against a fixed DOM
	   capsule at the nozzle, so its excursion is a hard budget, not a taste
	   call: `.hose-a` swings its end through 58 u and `.hose-b` through 30 u,
	   so ±2°/±3.5° keeps the terminal wander under 4 u ≈ 5 px on a 17 px hose.
	   The whip that used to live here has moved to `.hose-b`'s SHAPE, where it
	   costs nothing at the joint. */
	@keyframes st-hose-a {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.3, 0.75, 0.4, 1);
		}
		30% {
			transform: rotate(calc(0.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
		}
		60% {
			transform: rotate(calc(-2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		74% {
			transform: rotate(calc(1.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		88% {
			transform: rotate(calc(-0.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: rotate(calc(0.2deg * var(--e)));
		}
	}
	@keyframes st-hose-b {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.3, 0.75, 0.4, 1);
		}
		35% {
			transform: rotate(calc(1.2deg * var(--e)));
			animation-timing-function: cubic-bezier(0.6, 0, 0.4, 1);
		}
		66% {
			transform: rotate(calc(-3.5deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		80% {
			transform: rotate(calc(2.1deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		93% {
			transform: rotate(calc(-1deg * var(--e)));
		}
		100% {
			transform: rotate(calc(0.4deg * var(--e)));
		}
	}

	@keyframes st-shadow {
		0% {
			transform: scale(1, 1);
			opacity: 1;
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		26% {
			transform: scale(calc(1 - 0.1 * var(--e)), 1);
			opacity: 0.66;
			animation-timing-function: cubic-bezier(0.5, 0.35, 0.75, 0.95);
		}
		/* the shadow SNAPS on the strike frame — the loudest weight cue there is */
		54% {
			transform: scale(calc(1 + 0.16 * var(--e)), calc(1 + 0.2 * var(--e)));
			opacity: 1;
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		62% {
			transform: scale(calc(1 + 0.06 * var(--e)), calc(1 + 0.07 * var(--e)));
			opacity: 0.95;
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: scale(1, 1);
			opacity: 1;
		}
	}

	@keyframes st-barrel {
		0% {
			transform: scale(1, 1);
			animation-timing-function: cubic-bezier(0.45, 0.4, 0.72, 0.94);
		}
		55% {
			transform: scale(calc(1 + 0.04 * var(--e)), calc(1 - 0.038 * var(--e)));
			animation-timing-function: cubic-bezier(0.12, 0.9, 0.3, 1);
		}
		64% {
			transform: scale(calc(1 - 0.014 * var(--e)), calc(1 + 0.013 * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0, 0.35, 1);
		}
		100% {
			transform: scale(1, 1);
		}
	}

	/* ===================== THE FAIL BEAT ===============================
	   He commits exactly as hard as last time and the handle barely moves.
	   The body still drives; the arms and the tool stall against the
	   pressure. This is what turns the escalation into a story rather than
	   a bigger number. */
	.rig[data-beat='stroke'][data-kind='fail'] {
		.figure {
			animation: fl-figure var(--stroke-ms) both;
		}
		.spine {
			animation: fl-spine var(--stroke-ms) both;
		}
		.torso {
			animation: st-torso var(--stroke-ms) both;
		}
		.head {
			animation: fl-head var(--stroke-ms) both;
		}
		.helmet {
			animation: st-helmet var(--stroke-ms) both;
		}
		.arms {
			animation: fl-arms var(--stroke-ms) both;
		}
		.handle,
		.rod {
			animation: fl-arms var(--stroke-ms) both;
			animation-delay: 42ms;
		}
		/* he commits exactly as hard, so the shoulder still shrugs and drives —
		   the arm folds and extends against a handle that will not move */
		.shoulder.near {
			animation: st-shoulder var(--stroke-ms) both;
		}
		.fore.near {
			animation: fl-fore var(--stroke-ms) both;
		}
		.fore.far {
			animation: fl-fore var(--stroke-ms) both;
			animation-delay: calc(var(--stroke-ms) * 0.04);
		}
		.leg.near .thigh {
			animation: st-thigh var(--stroke-ms) both;
		}
		.leg.near .shin {
			animation: st-shin var(--stroke-ms) both;
		}
		.leg.near .boot {
			animation: st-boot var(--stroke-ms) both;
		}
		.leg.far .thigh {
			animation: st-thigh-far var(--stroke-ms) both;
		}
		.leg.far .shin {
			animation: st-shin-far var(--stroke-ms) both;
		}
		.leg.far .boot {
			animation: st-boot-far var(--stroke-ms) both;
		}
		.shadow {
			animation: st-shadow var(--stroke-ms) both;
		}
	}
	@keyframes fl-figure {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.18, 0.82, 0.3, 1);
		}
		18% {
			transform: translate(calc(-2.6px * var(--e)), calc(-4.3px * var(--e)))
				rotate(calc(-2.2deg * var(--e)));
			animation-timing-function: linear;
		}
		26% {
			transform: translate(calc(-3px * var(--e)), calc(-4.5px * var(--e)))
				rotate(calc(-2.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.25, 0.55, 0.6, 0.86);
		}
		38% {
			transform: translate(calc(2px * var(--e)), calc(7px * var(--e)))
				rotate(calc(1.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.5, 0.3, 0.8, 0.9);
		}
		/* he keeps pushing and it just does not go */
		52% {
			transform: translate(calc(5px * var(--e)), calc(14px * var(--e)))
				rotate(calc(3.4deg * var(--e)));
			animation-timing-function: linear;
		}
		62% {
			transform: translate(calc(5.6px * var(--e)), calc(15.4px * var(--e)))
				rotate(calc(3.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		82% {
			transform: translate(calc(-0.6px * var(--e)), calc(-2px * var(--e)))
				rotate(calc(-0.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes fl-spine {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		26% {
			transform: rotate(calc(-4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		52% {
			transform: rotate(calc(5deg * var(--e)));
			animation-timing-function: linear;
		}
		64% {
			transform: rotate(calc(5.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		84% {
			transform: rotate(calc(-1.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes fl-head {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.78, 0.3, 1);
		}
		26% {
			transform: translate(calc(-1px * var(--e)), calc(-5px * var(--e)))
				rotate(calc(-3.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0.4, 0.7, 0.92);
		}
		56% {
			transform: translate(calc(3.4px * var(--e)), calc(7.6px * var(--e)))
				rotate(calc(5.2deg * var(--e)));
			animation-timing-function: linear;
		}
		68% {
			transform: translate(calc(3.8px * var(--e)), calc(8.4px * var(--e)))
				rotate(calc(5.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		88% {
			transform: translate(0, calc(-1px * var(--e))) rotate(calc(-0.8deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes fl-arms {
		/* Values are the body's travel SUBTRACTED OUT: the net world-space
		   handle movement is only ~2px, so he visibly sinks around a bar that
		   refuses to go down. */
		0% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0.16, 0.84, 0.3, 1);
		}
		18% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.65, 0.9);
		}
		26% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0.55, 0.2, 0.9, 0.55);
		}
		38% {
			transform: translateY(calc(-9px * var(--e)));
			animation-timing-function: cubic-bezier(0.6, 0.2, 0.9, 0.6);
		}
		52% {
			transform: translateY(calc(-12.8px * var(--e)));
			animation-timing-function: linear;
		}
		62% {
			transform: translateY(calc(-13.6px * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		82% {
			transform: translateY(calc(1px * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0);
		}
	}
	@keyframes fl-fore {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.8, 0.3, 1);
		}
		22% {
			transform: rotate(calc(14deg * var(--e)));
			animation-timing-function: cubic-bezier(0.35, 0.45, 0.66, 0.9);
		}
		46% {
			transform: rotate(calc(6deg * var(--e)));
			animation-timing-function: linear;
		}
		66% {
			transform: rotate(calc(4.4deg * var(--e)));
			animation-timing-function: cubic-bezier(0.4, 0, 0.3, 1);
		}
		86% {
			transform: rotate(calc(-1.6deg * var(--e)));
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* ===================== THE PUZZLED HOLD ============================
	   W&H's barbell beat: the longest pause in the sequence is the one where
	   he works out that this is harder than he thought.

	   THE HANDLE DOES NOT MOVE ON THIS BEAT. The audience has just been taught
	   "handle down = button up"; a big handle stroke here that inflates nothing
	   un-tells the fail. So `.handle` / `.rod` — and the far arm, which stays
	   gripped — run `rs-hold`, the exact negation of `rs-figure`'s travel, which
	   pins the bar in world space while his body rises off it.

	   And it is the NEAR hand that actually lets go: `.arms.front` gets its own
	   track, so the release is a thing you can see rather than a comment. */
	.rig[data-beat='stroke'][data-kind='reset'] {
		.figure {
			animation: rs-figure var(--stroke-ms) both;
		}
		.spine {
			animation: rs-spine var(--stroke-ms) both;
		}
		.head {
			animation: rs-head var(--stroke-ms) both;
		}
		.helmet {
			animation: rs-helmet var(--stroke-ms) both;
		}
		.handle,
		.rod,
		.arms.back {
			animation: rs-hold var(--stroke-ms) both;
		}
		.arms.front {
			animation: rs-arm-near var(--stroke-ms) both;
		}
		.fore.near {
			animation: rs-fore var(--stroke-ms) both;
		}
		.fore.far {
			animation: rs-fore-far var(--stroke-ms) both;
			animation-delay: calc(var(--stroke-ms) * 0.05);
		}
		.leg.near .thigh {
			animation: rs-thigh var(--stroke-ms) both;
		}
		.leg.near .shin {
			animation: rs-shin var(--stroke-ms) both;
		}
		.leg.near .boot {
			animation: rs-boot var(--stroke-ms) both;
		}
		/* the far leg is not a spectator: it takes ~55 % of the re-plant, a
		   frame later, so the hips do not float away from it */
		.leg.far .thigh {
			animation: rs-thigh-far var(--stroke-ms) both;
		}
		.leg.far .shin {
			animation: rs-shin-far var(--stroke-ms) both;
		}
		.leg.far .boot {
			animation: rs-boot-far var(--stroke-ms) both;
		}
	}
	@keyframes rs-figure {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		/* stands up off the handle */
		22% {
			transform: translate(-4px, -7px) rotate(-2.4deg);
			animation-timing-function: linear;
		}
		48% {
			transform: translate(-4.8px, -7.8px) rotate(-2.8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		/* re-plants: a small hop-and-set of the feet */
		62% {
			transform: translate(-1px, -10px) rotate(-1deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		70% {
			transform: translate(2px, 4px) rotate(1.6deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		78% {
			transform: translate(1px, 0) rotate(0.6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes rs-spine {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		24% {
			transform: rotate(-5deg);
			animation-timing-function: linear;
		}
		50% {
			transform: rotate(-5.8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		72% {
			transform: rotate(2.4deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-head {
		/* down to the gauge, a beat, then a slow take up at the button */
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.25, 1, 0.4, 1);
		}
		18% {
			transform: translate(4px, 5px) rotate(7deg);
			animation-timing-function: linear;
		}
		42% {
			transform: translate(4.6px, 5.6px) rotate(7.6deg);
			animation-timing-function: cubic-bezier(0.6, 0, 0.25, 1);
		}
		58% {
			transform: translate(2px, -6px) rotate(-6deg);
			animation-timing-function: linear;
		}
		76% {
			transform: translate(2.4px, -6.8px) rotate(-6.6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.35, 1);
		}
		92% {
			transform: translate(-0.6px, 1px) rotate(1deg);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes rs-helmet {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.25, 0.9, 0.4, 1);
		}
		24% {
			transform: rotate(-6deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		48% {
			transform: rotate(-4.4deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
		}
		66% {
			transform: rotate(5.4deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		84% {
			transform: rotate(-2.2deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	/* rs-hold is `rs-figure` INVERTED — same key percentages, same timing
	   functions, translation negated and the hip rotation's arc at the bar
	   (radius 82 u about 94,216) added back in. Net world motion of the T-bar
	   across the whole beat: under 1 px. He rises off a bar that stays put. */
	@keyframes rs-hold {
		0% {
			transform: translate(0, 0);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		22% {
			transform: translate(4px, 7px);
			animation-timing-function: linear;
		}
		48% {
			transform: translate(4.8px, 7.8px);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		62% {
			transform: translate(1px, 10px);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		70% {
			transform: translate(-2px, -4px);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		78% {
			transform: translate(-1px, 0);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(0, 0);
		}
	}
	/* THE RELEASE. The near arm holds the bar through the stand-up, peels off
	   at 22 %, drops to his hip for the think, then reaches back and re-grips
	   with an overshoot. It pivots on its own shoulder, so the sleeve cap never
	   separates from the joint. */
	@keyframes rs-arm-near {
		0% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		22% {
			transform: translate(4px, 7px) rotate(0deg);
			animation-timing-function: cubic-bezier(0.7, 0, 0.9, 0.5);
		}
		/* the hand peels UP off the bar */
		30% {
			transform: translate(3px, 6px) rotate(-11deg);
			animation-timing-function: cubic-bezier(0.15, 0.9, 0.35, 1);
		}
		/* the shrug: hand up and out, above the shoulder line — the one shape
		   none of the other key poses has */
		44% {
			transform: translate(-1px, -2px) rotate(-31deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		/* a moving hold that drifts FURTHER, never back (IoL) */
		60% {
			transform: translate(-1.6px, -3.4px) rotate(-34.5deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.25, 1);
		}
		86% {
			transform: translate(1.4px, -2.4px) rotate(-2.4deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	/* the far leg takes ~55 % of the re-plant, three frames behind the near */
	@keyframes rs-thigh-far {
		0% {
			transform: translateY(0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		27% {
			transform: translateY(-3.9px) rotate(8.8deg);
			animation-timing-function: linear;
		}
		53% {
			transform: translateY(-4.2px) rotate(9.6deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		67% {
			transform: translateY(-6px) rotate(13.2deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		75% {
			transform: translateY(2.8px) rotate(-3.1deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		86% {
			transform: translateY(0.6px) rotate(-0.7deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}
	@keyframes rs-shin-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		27% {
			transform: rotate(-17deg);
			animation-timing-function: linear;
		}
		53% {
			transform: rotate(-18.5deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		67% {
			transform: rotate(-25.3deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		75% {
			transform: rotate(6.1deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		86% {
			transform: rotate(1.3deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-boot-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		27% {
			transform: rotate(8.3deg);
			animation-timing-function: linear;
		}
		53% {
			transform: rotate(8.9deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		67% {
			transform: rotate(12.1deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		75% {
			transform: rotate(-3deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		86% {
			transform: rotate(-0.7deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	/* the far arm never lets go, so its forearm only breaks a little */
	@keyframes rs-fore-far {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.25, 0.9, 0.4, 1);
		}
		26% {
			transform: rotate(8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		62% {
			transform: rotate(6.4deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.35, 1);
		}
		80% {
			transform: rotate(9deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-fore {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.25, 0.9, 0.4, 1);
		}
		26% {
			transform: rotate(19deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		52% {
			transform: rotate(15deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.35, 1);
		}
		74% {
			transform: rotate(20deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-thigh {
		0% {
			transform: translateY(0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		24% {
			transform: translateY(-7px) rotate(16deg);
			animation-timing-function: linear;
		}
		50% {
			transform: translateY(-7.6px) rotate(17.4deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		64% {
			transform: translateY(-11px) rotate(24deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		72% {
			transform: translateY(5px) rotate(-5.6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		84% {
			transform: translateY(1px) rotate(-1.2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}
	@keyframes rs-shin {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		24% {
			transform: rotate(-31deg);
			animation-timing-function: linear;
		}
		50% {
			transform: rotate(-33.6deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		64% {
			transform: rotate(-46deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		72% {
			transform: rotate(11deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		84% {
			transform: rotate(2.4deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes rs-boot {
		0% {
			transform: rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.3, 1);
		}
		24% {
			transform: rotate(15deg);
			animation-timing-function: linear;
		}
		50% {
			transform: rotate(16.2deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.6);
		}
		64% {
			transform: rotate(22deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		72% {
			transform: rotate(-5.4deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		84% {
			transform: rotate(-1.2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* dust and sweat only fire on the beats that visibly cost him, and their
	   stagger is a FRACTION of the beat rather than a fixed millisecond count,
	   so it scales with the tempo */
	.dust ellipse {
		fill: oklch(0.78 0.02 80 / 0.32);
		opacity: 0;
		transform-origin: 30px 312px;
	}
	.rig[data-beat='stroke'][data-kind='heavy'] .dust ellipse,
	.rig[data-beat='stroke'][data-kind='fail'] .dust ellipse {
		animation: puff var(--stroke-ms) cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.dust ellipse:nth-child(2) {
		animation-delay: calc(var(--stroke-ms) * 0.05);
	}
	.dust ellipse:nth-child(3) {
		animation-delay: calc(var(--stroke-ms) * 0.09);
	}
	@keyframes puff {
		0%,
		52% {
			opacity: 0;
			transform: scale(0.3) translate(0, 6px);
		}
		57% {
			opacity: 0.9;
			transform: scale(1) translate(5px, 0);
		}
		88%,
		100% {
			opacity: 0;
			transform: scale(2.2) translate(18px, -13px);
		}
	}

	.sweat .drop {
		fill: oklch(0.88 0.08 220 / 0.9);
		stroke: oklch(0.45 0.08 240 / 0.5);
		stroke-width: 1;
		opacity: 0;
	}
	.sweat .a {
		transform-origin: 124px 104px;
	}
	.sweat .b {
		transform-origin: 56px 104px;
	}
	.sweat .c {
		transform-origin: 62px 126px;
	}
	.rig[data-beat='stroke'][data-kind='heavy'] .sweat .drop,
	.rig[data-beat='stroke'][data-kind='fail'] .sweat .drop {
		animation: fling var(--stroke-ms) cubic-bezier(0.3, 0.6, 0.5, 1) both;
	}
	.sweat .b {
		animation-delay: calc(var(--stroke-ms) * 0.04);
	}
	.sweat .c {
		animation-delay: calc(var(--stroke-ms) * 0.08);
	}
	@keyframes fling {
		0%,
		51% {
			opacity: 0;
			transform: translate(0, 0) scale(0.4);
		}
		58% {
			opacity: 1;
			transform: translate(4px, -3px) scale(1.05);
		}
		92%,
		100% {
			opacity: 0;
			transform: translate(20px, -26px) scale(0.7);
		}
	}

	/* ===================== PREP (the arrival beat) =====================
	   He lands with his hands EMPTY. Absorbs the landing, plays the cocky
	   beat (chest out, sizes the button up), THEN reaches out, overshoots
	   past the bar and settles onto the grip. No dead hold anywhere. */
	.rig[data-beat='prep'] {
		.figure {
			animation: pr-figure 2100ms both;
		}
		.spine {
			animation: pr-spine 2100ms both;
		}
		.torso {
			animation: pr-torso 2100ms both;
		}
		.head {
			animation: pr-head 2100ms both;
		}
		.helmet {
			animation: pr-helmet 2100ms both;
		}
		.arms {
			animation: pr-arms 2100ms both;
		}
		/* The near arm hangs at his SIDE through the swagger while the far arm
		   stays up. That asymmetry is what makes the cocky arrival read as a
		   different shape from any pumping pose — four extremes that are only
		   distinguishable by amplitude are one extreme. */
		.arms.front {
			animation: pr-arm-near 2100ms both;
		}
		.fore.near {
			animation: pr-fore 2100ms both;
		}
		.fore.far {
			animation: pr-fore 2100ms both;
			animation-delay: 70ms;
		}
		.handle,
		.rod {
			animation: pr-tool 2100ms both;
		}
		.leg.near .thigh {
			animation: pr-thigh 2100ms both;
		}
		.leg.near .shin {
			animation: pr-shin 2100ms both;
		}
		.leg.near .boot {
			animation: pr-boot 2100ms both;
		}
		.leg.far .thigh {
			animation: pr-thigh 2100ms both;
			animation-delay: 40ms;
		}
		.leg.far .shin {
			animation: pr-shin 2100ms both;
			animation-delay: 40ms;
		}
		.leg.far .boot {
			animation: pr-boot 2100ms both;
			animation-delay: 40ms;
		}
	}
	/* ===================== THE LANDING ================================
	   He FALLS. He does not spring on from the wings.

	   One timing vocabulary is shared by every `pr-*` curve below, so the
	   whole body is landing on the same frames:

	     0 %   apex — airborne, tucked, arms up, the hat trailing
	     13 %  he reaches for the ground: legs unfold, spine opens
	     20 %  CONTACT — arrives still travelling (no ease into the frame);
	           the near toe strikes first with the leg near-straight
	     27 %  DEEPEST COMPRESSION — the knees fold to ~85° and eat 24 u of
	           drop while the ankles stay planted. This is the beat the client
	           asked for and it is done with the two-bone IK legs, not with a
	           squash on the root: `arrive` only carries the trajectory and a
	           3 % contact squash, so what absorbs the weight is the KNEE.
	     31–33 % head and helmet keep going DOWN after the body has stopped —
	           the overlap that turns a stop into a weight
	     35 %  he pushes back up, overshooting
	     43 %  secondary dip, half the amplitude
	     50 %  upright, into the cocky beat
	     80–91 % the reach for the bar, unchanged

	   The hips are in TWO places (the torso rides `.figure`, the legs ride
	   `.thigh`, which is a sibling), so `pr-figure`'s translateY and
	   `pr-thigh`'s translateY are keyed to the SAME numbers on the SAME
	   percentages. If you retune one, retune the other or the pelvis
	   separates from the legs. Likewise `pr-unrot` is the exact negation of
	   `pr-figure`'s rotation and `pr-tool` the exact negation of its
	   translation — same keys, same easing (see the round-3 rig notes). */
	@keyframes pr-figure {
		0% {
			transform: translate(0, -14px) rotate(-8deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translate(1px, -9px) rotate(3deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translate(2px, 0) rotate(3.4deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: translate(3px, 24px) rotate(7deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: translate(0, 2px) rotate(-2deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: translate(-1px, 8px) rotate(1.6deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: translate(-2px, 1px) rotate(-1deg);
			animation-timing-function: linear;
		}
		62% {
			transform: translate(-3.6px, -5px) rotate(-1.3deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		84% {
			transform: translate(1.4px, 2.6px) rotate(0.8deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes pr-spine {
		0% {
			transform: rotate(-12deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: rotate(-2deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: rotate(2deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: rotate(11deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: rotate(-4deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: rotate(2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: rotate(-6.4deg);
			animation-timing-function: linear;
		}
		64% {
			transform: rotate(-7deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		88% {
			transform: rotate(1.2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes pr-torso {
		0% {
			transform: scale(0.9, 1.111);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		20% {
			transform: scale(0.96, 1.042);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: scale(1.16, 0.862);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		36% {
			transform: scale(0.955, 1.047);
			animation-timing-function: cubic-bezier(0.35, 0, 0.35, 1);
		}
		46% {
			transform: scale(1.03, 0.971);
			animation-timing-function: linear;
		}
		70% {
			transform: scale(1.02, 0.98);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: scale(1, 1);
		}
	}
	@keyframes pr-head {
		0% {
			transform: translate(-4px, -12px) rotate(-14deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translate(-2px, -7px) rotate(-6deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translate(0, -2px) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.5, 0.5, 0.9);
		}
		31% {
			transform: translate(2px, 10px) rotate(10deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		40% {
			transform: translate(0, -3px) rotate(-4deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		47% {
			transform: translate(1px, 2px) rotate(2deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		58% {
			transform: translate(4px, 5px) rotate(6.5deg);
			animation-timing-function: linear;
		}
		72% {
			transform: translate(4.6px, 5.8px) rotate(7.2deg);
			animation-timing-function: cubic-bezier(0.55, 0, 0.3, 1);
		}
		86% {
			transform: translate(1px, 2.4px) rotate(2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes pr-helmet {
		0% {
			transform: translateY(-9px) rotate(16deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translateY(-5px) rotate(8deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translateY(-3px) rotate(2deg);
			animation-timing-function: cubic-bezier(0.2, 0.5, 0.5, 0.9);
		}
		33% {
			transform: translateY(7px) rotate(-14deg);
			animation-timing-function: cubic-bezier(0.15, 0.88, 0.3, 1);
		}
		42% {
			transform: translateY(-1.5px) rotate(6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		50% {
			transform: rotate(-5.4deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.4, 1);
		}
		72% {
			transform: rotate(-3deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		88% {
			transform: rotate(2deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes pr-arms {
		0% {
			transform: translate(-30px, -30px) rotate(-26deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translate(-28px, -18px) rotate(-16deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translate(-26px, -6px) rotate(-4deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		29% {
			transform: translate(-23px, 26px) rotate(14deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		38% {
			transform: translate(-27px, 8px) rotate(3deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		46% {
			transform: translate(-21px, 16px) rotate(9deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		56% {
			transform: translate(-26px, 11px) rotate(5deg);
			animation-timing-function: cubic-bezier(0.55, 0, 0.25, 1);
		}
		80% {
			transform: translate(2.6px, -3.4px) rotate(-1.8deg);
			animation-timing-function: cubic-bezier(0.25, 1, 0.4, 1);
		}
		91% {
			transform: translate(-0.8px, 1.2px) rotate(0.6deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes pr-arm-near {
		0% {
			transform: translate(-14px, -24px) rotate(30deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translate(-8px, -14px) rotate(52deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translate(-4px, -2px) rotate(70deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		29% {
			transform: translate(-3px, 10px) rotate(90deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		38% {
			transform: translate(-2px, 3px) rotate(66deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		48% {
			transform: translate(1px, 3px) rotate(76deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		62% {
			transform: translate(0, 1px) rotate(70deg);
			animation-timing-function: cubic-bezier(0.55, 0, 0.25, 1);
		}
		80% {
			transform: translate(2.6px, -3.4px) rotate(-6deg);
			animation-timing-function: cubic-bezier(0.25, 1, 0.4, 1);
		}
		91% {
			transform: translate(-0.8px, 1.2px) rotate(2.2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}
	@keyframes pr-fore {
		0% {
			transform: rotate(-40deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: rotate(-16deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		22% {
			transform: rotate(10deg);
			animation-timing-function: cubic-bezier(0.3, 0.5, 0.5, 0.9);
		}
		30% {
			transform: rotate(34deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		40% {
			transform: rotate(28deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		56% {
			transform: rotate(26deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.3, 1);
		}
		82% {
			transform: rotate(-5deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes pr-tool {
		0% {
			transform: translate(0, 14px);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translate(-1px, 9px);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translate(-2px, 0);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: translate(-3px, -24px);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: translate(0, -2px);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: translate(1px, -8px);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: translate(2px, -1px);
			animation-timing-function: linear;
		}
		62% {
			transform: translate(3.6px, 5px);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		76% {
			transform: translate(0, -0.5px);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.35, 1);
		}
		84% {
			transform: translate(-2px, 2.6px);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		92% {
			transform: translate(-0.6px, -2.2px);
		}
		100% {
			transform: translate(0, 0);
		}
	}
	/* THE KNEE IS THE SHOCK ABSORBER.
	   Every rotation below is SOLVED, not eyeballed: the thigh's translateY is
	   pinned to `pr-figure`'s (the pelvis is in two groups), and the thigh and
	   shin angles are the two-bone solution that keeps the ankle on (64,300) —
	   the floor — at each of those hip heights. At the 27 % key the hip is
	   24 u down and the solved chain puts the interior knee angle at ~85°,
	   which is a real deep-squat landing; at 20 % the leg is near-straight with
	   the ankle ~3 u proud of the floor, so the toe strikes first. The foot
	   therefore never slides and never sinks: what changes is the knee. */
	@keyframes pr-thigh {
		0% {
			transform: translateY(-14px) rotate(34deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: translateY(-9px) rotate(4deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: translateY(0) rotate(-4deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: translateY(24px) rotate(-23deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: translateY(2px) rotate(-3deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: translateY(8px) rotate(-12deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: translateY(1px) rotate(-4deg);
			animation-timing-function: linear;
		}
		62% {
			transform: translateY(-5px) rotate(10.4deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		84% {
			transform: translateY(2.6px) rotate(-5deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: translateY(0) rotate(0deg);
		}
	}
	@keyframes pr-shin {
		0% {
			transform: rotate(-66deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: rotate(-18deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: rotate(9deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: rotate(50deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: rotate(6deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: rotate(25deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: rotate(9deg);
			animation-timing-function: linear;
		}
		62% {
			transform: rotate(-20.6deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		84% {
			transform: rotate(11deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}
	@keyframes pr-boot {
		0% {
			transform: rotate(32deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.42);
		}
		13% {
			transform: rotate(-6deg);
			animation-timing-function: cubic-bezier(0.42, 0, 0.86, 0.5);
		}
		20% {
			transform: rotate(-16deg);
			animation-timing-function: cubic-bezier(0.22, 0.42, 0.5, 0.9);
		}
		27% {
			transform: rotate(-4deg);
			animation-timing-function: cubic-bezier(0, 0.9, 0.3, 1);
		}
		35% {
			transform: rotate(4deg);
			animation-timing-function: cubic-bezier(0.35, 0, 0.4, 1);
		}
		43% {
			transform: rotate(-2deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.35, 1);
		}
		50% {
			transform: rotate(3deg);
			animation-timing-function: linear;
		}
		62% {
			transform: rotate(10.2deg);
			animation-timing-function: cubic-bezier(0.5, 0, 0.35, 1);
		}
		84% {
			transform: rotate(-3deg);
			animation-timing-function: cubic-bezier(0.3, 0, 0.3, 1);
		}
		100% {
			transform: rotate(0deg);
		}
	}

	/* ===================== ALARM (held breath) =========================
	   A moving hold, not a dead one: the vibration RISES, the pose drifts
	   BEYOND itself instead of settling back, and the breath accelerates
	   (IoL: two drawings, the second stronger — everything goes further). */
	.rig[data-beat='alarm'] {
		.figure {
			animation: al-figure 900ms cubic-bezier(0.3, 0, 0.4, 1) both;
		}
		.torso {
			animation: al-breath 900ms linear both;
		}
		.spine {
			animation: al-spine 900ms cubic-bezier(0.35, 0, 0.3, 1) both;
		}
		.head {
			animation: al-head 900ms cubic-bezier(0.3, 0, 0.25, 1) both;
		}
		.helmet {
			animation: al-helmet 900ms cubic-bezier(0.25, 0, 0.3, 1) both;
		}
		.arms {
			animation: al-arms 900ms cubic-bezier(0.25, 0, 0.3, 1) both;
		}
		.handle,
		.rod {
			animation: al-arms 900ms cubic-bezier(0.25, 0, 0.3, 1) both;
			animation-delay: 42ms;
		}
		.fore.near,
		.fore.far {
			animation: al-fore 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.leg.near .thigh {
			animation: al-thigh 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.leg.near .shin {
			animation: al-shin 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.leg.near .boot {
			animation: al-boot 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		/* the braced far leg is not frozen while the figure swings 30 px */
		.leg.far .thigh {
			animation: al-thigh-far 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.leg.far .shin {
			animation: al-shin-far 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.leg.far .boot {
			animation: al-boot-far 900ms cubic-bezier(0.3, 0, 0.3, 1) both;
		}
		.sweat .drop {
			animation: bead 900ms cubic-bezier(0.4, 0, 0.5, 1) both;
		}
	}
	@keyframes al-figure {
		/* the quiver AMPLIFIES across the beat instead of damping out */
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		14% {
			transform: translate(-1.14px, 0.57px) rotate(-0.38deg);
		}
		26% {
			transform: translate(1.52px, -0.76px) rotate(0.57deg);
		}
		38% {
			transform: translate(-2.66px, 1.14px) rotate(-0.95deg);
		}
		48% {
			transform: translate(3.42px, -1.33px) rotate(1.33deg);
		}
		58% {
			transform: translate(-4.56px, 1.9px) rotate(-1.71deg);
		}
		68% {
			transform: translate(4.94px, -2.09px) rotate(1.9deg);
		}
		77% {
			transform: translate(-6.08px, 2.47px) rotate(-2.47deg);
		}
		85% {
			transform: translate(6.46px, -2.66px) rotate(2.66deg);
		}
		93% {
			transform: translate(-7.6px, 3.04px) rotate(-3.04deg);
		}
		100% {
			transform: translate(7.98px, -3.23px) rotate(3.23deg);
		}
	}
	@keyframes al-breath {
		/* the breath speeds up: four cycles, each shorter and deeper */
		0% {
			transform: scale(1, 1);
		}
		16% {
			transform: scale(0.972, 1.029);
		}
		32% {
			transform: scale(1, 1);
		}
		46% {
			transform: scale(0.966, 1.035);
		}
		60% {
			transform: scale(1, 1);
		}
		72% {
			transform: scale(0.958, 1.044);
		}
		82% {
			transform: scale(1, 1);
		}
		92% {
			transform: scale(0.95, 1.053);
		}
		100% {
			transform: scale(0.984, 1.016);
		}
	}
	@keyframes al-spine {
		0% {
			transform: rotate(0deg);
		}
		40% {
			transform: rotate(-7deg);
		}
		70% {
			transform: rotate(-8.6deg);
		}
		100% {
			transform: rotate(-10.4deg);
		}
	}
	@keyframes al-head {
		/* pulls back and away — and keeps going; it never settles */
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		34% {
			transform: translate(-7px, -3px) rotate(-9deg);
		}
		66% {
			transform: translate(-8.6px, -4.2px) rotate(-11deg);
		}
		100% {
			transform: translate(-10.4px, -5.4px) rotate(-13.2deg);
		}
	}
	@keyframes al-helmet {
		0% {
			transform: rotate(0deg) translateY(0);
		}
		40% {
			transform: rotate(9deg) translateY(-3px);
		}
		72% {
			transform: rotate(11deg) translateY(-4px);
		}
		100% {
			transform: rotate(13.4deg) translateY(-5.2px);
		}
	}
	@keyframes al-arms {
		/* the hands cannot let go — the body pulls back and the arms stretch */
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		38% {
			transform: translate(5px, -3px) rotate(2.6deg);
		}
		70% {
			transform: translate(6.2px, -3.8px) rotate(3.2deg);
		}
		100% {
			transform: translate(7.6px, -4.6px) rotate(4deg);
		}
	}
	@keyframes al-fore {
		0% {
			transform: rotate(0deg);
		}
		40% {
			transform: rotate(-6deg);
		}
		100% {
			transform: rotate(-9.4deg);
		}
	}
	@keyframes al-thigh {
		0% {
			transform: translateY(0) rotate(0deg);
		}
		40% {
			transform: translateY(3px) rotate(-3.4deg);
		}
		100% {
			transform: translateY(5.4px) rotate(-6.1deg);
		}
	}
	@keyframes al-shin {
		0% {
			transform: rotate(0deg);
		}
		40% {
			transform: rotate(6.9deg);
		}
		100% {
			transform: rotate(12.3deg);
		}
	}
	@keyframes al-boot {
		0% {
			transform: rotate(0deg);
		}
		40% {
			transform: rotate(-3.5deg);
		}
		100% {
			transform: rotate(-6.2deg);
		}
	}
	/* the braced leg takes ~60 % of the near leg's share, a beat behind */
	@keyframes al-thigh-far {
		0%,
		12% {
			transform: translateY(0) rotate(0deg);
		}
		46% {
			transform: translateY(1.8px) rotate(-2deg);
		}
		100% {
			transform: translateY(3.2px) rotate(-3.7deg);
		}
	}
	@keyframes al-shin-far {
		0%,
		12% {
			transform: rotate(0deg);
		}
		46% {
			transform: rotate(4.1deg);
		}
		100% {
			transform: rotate(7.4deg);
		}
	}
	@keyframes al-boot-far {
		0%,
		12% {
			transform: rotate(0deg);
		}
		46% {
			transform: rotate(-2.1deg);
		}
		100% {
			transform: rotate(-3.7deg);
		}
	}
	@keyframes bead {
		0% {
			opacity: 0;
			transform: translate(0, -3px) scale(0.5);
		}
		24% {
			opacity: 1;
			transform: translate(0, 0) scale(1);
		}
		100% {
			opacity: 0.9;
			transform: translate(-1px, 13px) scale(1.15);
		}
	}

	/* ===================== PANIC =======================================
	   Hands stay WELDED to the handle for the first ~3 frames — he physically
	   cannot let go — then one clear release frame, then a scramble: legs
	   lead, body drags behind. Nothing detaches from the character; the whole
	   figure leaves with the root. */
	.rig[data-beat='panic'] {
		.helmet {
			animation: pa-helmet 820ms cubic-bezier(0.2, 0.7, 0.5, 1) both;
		}
		.head {
			animation: pa-head 820ms cubic-bezier(0.16, 1, 0.3, 1) both;
		}
		.spine {
			animation: pa-spine 820ms cubic-bezier(0.3, 0.8, 0.4, 1) both;
		}
		.arms {
			animation: pa-arms 820ms both;
		}
		.fore.near {
			animation: pa-fore 820ms both;
		}
		.fore.far {
			animation: pa-fore 820ms both;
			animation-delay: 45ms;
		}
		.figure {
			animation: pa-figure 820ms both;
		}
		.leg.near .thigh {
			animation: pa-thigh 300ms cubic-bezier(0.4, 0, 0.6, 1) 130ms infinite;
		}
		.leg.near .shin {
			animation: pa-shin 300ms cubic-bezier(0.4, 0, 0.6, 1) 130ms infinite;
		}
		.leg.far .thigh {
			animation: pa-thigh 300ms cubic-bezier(0.4, 0, 0.6, 1) 250ms infinite;
		}
		.leg.far .shin {
			animation: pa-shin 300ms cubic-bezier(0.4, 0, 0.6, 1) 250ms infinite;
		}
		/* the boots counter the accumulated leg swing, so the soles point at the
		   floor through the cycle instead of holding identity while the shins
		   scissor ±32° underneath them */
		.leg.near .boot {
			animation: pa-boot 300ms cubic-bezier(0.4, 0, 0.6, 1) 130ms infinite;
		}
		.leg.far .boot {
			animation: pa-boot 300ms cubic-bezier(0.4, 0, 0.6, 1) 250ms infinite;
		}
		/* the pump is knocked over — the blast comes back down the hose — and it
		   STAYS knocked over, because `.rigging` is outside `.exit`. The T-bar and
		   the piston are re-parented into these layers the moment he lets go, so
		   the whole prop topples as one object about the base of the barrel. */
		.rigging {
			animation: pa-rig 820ms cubic-bezier(0.25, 0.9, 0.4, 1) both;
		}
		/* his contact shadow goes with him */
		.shadow {
			animation: pa-shadow 820ms linear both;
		}
		/* the tool starts where the alarm left it, so re-parenting is silent */
		.handle,
		.rod {
			animation: pa-tool 820ms cubic-bezier(0.3, 0.8, 0.4, 1) both;
		}
		.hose-a {
			animation: pa-hose 820ms cubic-bezier(0.25, 0.9, 0.4, 1) both;
		}
		.hose-b {
			animation: pa-hose-b 820ms cubic-bezier(0.25, 0.9, 0.4, 1) both;
		}
	}
	@keyframes pa-helmet {
		0% {
			transform: rotate(13.4deg) translate(0, -5.2px);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		12% {
			transform: rotate(-8deg) translate(2px, 7px);
			animation-timing-function: cubic-bezier(0.15, 0.85, 0.4, 1);
		}
		100% {
			transform: rotate(-300deg) translate(30px, -108px);
			opacity: 0;
		}
	}
	@keyframes pa-head {
		0% {
			transform: translate(-10.4px, -5.4px) rotate(-13.2deg);
			animation-timing-function: cubic-bezier(0.7, 0, 1, 0.6);
		}
		16% {
			transform: translate(2px, 5px) rotate(7deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.3, 1);
		}
		/* one look back at what he has done */
		46% {
			transform: translate(9px, -1px) rotate(13deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(-8px, -3px) rotate(-11deg);
		}
	}
	@keyframes pa-spine {
		0% {
			transform: rotate(-10.4deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.5);
		}
		16% {
			transform: rotate(6deg);
			animation-timing-function: cubic-bezier(0.2, 0.85, 0.4, 1);
		}
		100% {
			transform: rotate(-16deg);
		}
	}
	@keyframes pa-arms {
		/* 0–12%: still welded. 12–18%: the release. Then they fly UP, not away
		   from the body — panic arms, still attached to their shoulders. */
		0% {
			transform: translate(7.6px, -4.6px) rotate(4deg);
			animation-timing-function: linear;
		}
		12% {
			transform: translate(8.4px, -5px) rotate(4.4deg);
			animation-timing-function: cubic-bezier(0.9, 0, 1, 0.4);
		}
		18% {
			transform: translate(4px, 2px) rotate(-2deg);
			animation-timing-function: cubic-bezier(0.1, 0.9, 0.35, 1);
		}
		34% {
			transform: translate(-10px, -26px) rotate(-16deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		62% {
			transform: translate(-16px, -32px) rotate(-22deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(-12px, -28px) rotate(-18deg);
		}
	}
	@keyframes pa-fore {
		0% {
			transform: rotate(-9.4deg);
			animation-timing-function: linear;
		}
		14% {
			transform: rotate(-10deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.4, 1);
		}
		38% {
			transform: rotate(34deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		70% {
			transform: rotate(42deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: rotate(36deg);
		}
	}
	@keyframes pa-figure {
		/* the body DRAGS behind the legs — that is what running away looks
		   like. It never translates away from the rest of the character. */
		0% {
			transform: translate(4.2px, -1.7px) rotate(1.7deg);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 0.5);
		}
		14% {
			transform: translate(11px, -5px) rotate(8deg);
			animation-timing-function: cubic-bezier(0.15, 0.85, 0.4, 1);
		}
		30% {
			transform: translate(2px, 4px) rotate(-6deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(6px, 1px) rotate(-13deg);
		}
	}
	@keyframes pa-thigh {
		0%,
		100% {
			transform: translateY(4px) rotate(-22deg);
		}
		50% {
			transform: translateY(4px) rotate(18deg);
		}
	}
	@keyframes pa-shin {
		0%,
		100% {
			transform: rotate(38deg);
		}
		/* the PASSING position — without it a run cycle is a scissor, not a run */
		25% {
			transform: rotate(4deg);
		}
		50% {
			transform: rotate(-26deg);
		}
		75% {
			transform: rotate(9deg);
		}
	}
	@keyframes pa-boot {
		0%,
		100% {
			transform: rotate(-16deg);
		}
		25% {
			transform: rotate(-2deg);
		}
		50% {
			transform: rotate(8deg);
		}
		75% {
			transform: rotate(-4deg);
		}
	}
	/* At the release the tool jumps parents, from `.figure` to `.rigging`. This
	   absorbs the difference: it starts at the offset the alarm beat had it at
	   (figure + al-arms), rides the topple, then settles. */
	@keyframes pa-tool {
		0% {
			transform: translate(11.8px, -6.3px) rotate(4deg);
			animation-timing-function: linear;
		}
		12% {
			transform: translate(12.6px, -6.7px) rotate(4.4deg);
			animation-timing-function: cubic-bezier(0.9, 0, 1, 0.4);
		}
		/* he lets go and the pressure throws the bar back up */
		20% {
			transform: translate(4px, -12px) rotate(-3deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.35, 1);
		}
		48% {
			transform: translate(-1px, 3px) rotate(2deg);
			animation-timing-function: cubic-bezier(0.4, 0, 0.4, 1);
		}
		100% {
			transform: translate(0, 1px) rotate(0deg);
		}
	}
	@keyframes pa-rig {
		0%,
		18% {
			transform: translate(0, 0) rotate(0deg);
			animation-timing-function: cubic-bezier(0.2, 0.9, 0.4, 1);
		}
		100% {
			transform: translate(-14px, 10px) rotate(-26deg);
		}
	}
	@keyframes pa-hose {
		0% {
			transform: rotate(0.5deg);
		}
		26% {
			transform: rotate(-22deg);
		}
		58% {
			transform: rotate(14deg);
		}
		100% {
			transform: rotate(-8deg);
		}
	}
	@keyframes pa-hose-b {
		0% {
			transform: rotate(1.2deg);
		}
		34% {
			transform: rotate(-34deg);
		}
		66% {
			transform: rotate(22deg);
		}
		100% {
			transform: rotate(-12deg);
		}
	}

	/* ===================== EYELINE =====================================
	   The audience looks where the character looks. The button is DOWN and to
	   his RIGHT, and it rises toward his eyeline as it inflates; the gauge is
	   down-right and steeper. The EYES lead and the head follows about three
	   frames later — which is what the per-beat `*-head` curves above do. */
	.lookat {
		transform: rotate(calc((var(--btn, 1) - 1) * 1.1deg));
		transition: transform 520ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	.pupils {
		/* the resting aim already favours the button, biased upward as the
		   button grows up toward his eye level */
		transform: translate(2.4px, calc(2.6px - (var(--btn, 1) - 1) * 1.1px));
		transition: transform 90ms cubic-bezier(0.2, 0.9, 0.3, 1);
	}
	/* Eye darts: 2–3 frames with most of the travel in ONE frame, keyed to
	   the beat rather than a wall clock. Every dart is aimed at something. */
	@keyframes eyes-prep {
		0%,
		16% {
			transform: translate(-1px, 4px);
		}
		/* snaps to the button as he lands — the beat that tells the audience
		   what he is about to do */
		18%,
		62% {
			transform: translate(4.2px, 3.6px);
		}
		64%,
		74% {
			transform: translate(3px, 4.4px);
		}
		76%,
		100% {
			transform: translate(2.4px, 2.6px);
		}
	}
	@keyframes eyes-work {
		0%,
		48% {
			transform: translate(2.8px, 3.4px);
		}
		/* the eyes get there BEFORE the head does */
		50%,
		66% {
			transform: translate(3.6px, 4.6px);
		}
		68%,
		82% {
			transform: translate(3.2px, 4.8px);
		}
		84%,
		100% {
			transform: translate(2.4px, 2.6px);
		}
	}
	@keyframes eyes-fail {
		0%,
		44% {
			transform: translate(3.2px, 4.6px);
		}
		46%,
		74% {
			transform: translate(4.2px, 5.4px);
		}
		76%,
		100% {
			transform: translate(3.6px, 5px);
		}
	}
	@keyframes eyes-reset {
		0%,
		12% {
			transform: translate(3.8px, 5.2px);
		}
		14%,
		50% {
			transform: translate(4.4px, 5.4px);
		}
		/* THE TAKE — snaps up to the button, which is now enormous */
		52%,
		84% {
			transform: translate(4.6px, -1.4px);
		}
		86%,
		100% {
			transform: translate(2.4px, 2.6px);
		}
	}
	@keyframes eyes-heavy {
		0%,
		30% {
			transform: translate(3px, 4.4px);
		}
		32%,
		56% {
			transform: translate(3.6px, 5.2px);
		}
		/* on the contact he checks what it did to the button */
		58%,
		88% {
			transform: translate(4.6px, -0.6px);
		}
		90%,
		100% {
			transform: translate(3px, 3.4px);
		}
	}
	@keyframes eyes-alarm {
		0% {
			transform: translate(3px, 2px);
		}
		/* locked on the button, and the lock tightens */
		8%,
		100% {
			transform: translate(4.8px, -1.8px);
		}
	}
	@keyframes eyes-panic {
		0%,
		14% {
			transform: translate(4.8px, -1.8px);
		}
		/* looks where he is going, then back at the blast */
		16%,
		40% {
			transform: translate(-4.6px, 1px);
		}
		42%,
		68% {
			transform: translate(5px, 0);
		}
		70%,
		100% {
			transform: translate(-4.8px, 1.4px);
		}
	}

	/* ===================== BLINKS ======================================
	   Blinks are MOTIVATED — they land on a change of thought, not on a
	   wall-clock loop. Close ≈ 66 ms, open ≈ 117 ms: the open is always the
	   slower of the two. The lid spans the FULL eye height and carries the
	   pupils down with it (ASK p.456). */
	.lid {
		transform-box: fill-box;
		transform-origin: 50% 0%;
		transform: scaleY(0);
	}
	@keyframes blink-prep {
		0%,
		20.5% {
			transform: scaleY(0);
		}
		24% {
			transform: scaleY(1.04);
		}
		30%,
		42.5% {
			transform: scaleY(0);
		}
		46% {
			transform: scaleY(1.04);
		}
		52%,
		100% {
			transform: scaleY(0);
		}
	}
	@keyframes blink-beat {
		/* one blink, on the recovery — never on the contact, where the audience
		   is reading the hit */
		0%,
		74% {
			transform: scaleY(0);
		}
		79% {
			transform: scaleY(1.04);
		}
		88%,
		100% {
			transform: scaleY(0);
		}
	}
	@keyframes blink-double {
		/* the fail beat earns a double blink — the classic "wait, what?" */
		0%,
		64% {
			transform: scaleY(0);
		}
		68% {
			transform: scaleY(1.04);
		}
		74%,
		79% {
			transform: scaleY(0);
		}
		83% {
			transform: scaleY(1.04);
		}
		90%,
		100% {
			transform: scaleY(0);
		}
	}
	@keyframes lid-drag {
		0%,
		74% {
			translate: 0 0;
		}
		79% {
			translate: 0 3px;
		}
		88%,
		100% {
			translate: 0 0;
		}
	}
	@keyframes lid-drag-double {
		0%,
		64% {
			translate: 0 0;
		}
		68% {
			translate: 0 3px;
		}
		74%,
		79% {
			translate: 0 0;
		}
		83% {
			translate: 0 3px;
		}
		90%,
		100% {
			translate: 0 0;
		}
	}
	@keyframes lid-drag-prep {
		0%,
		20.5% {
			translate: 0 0;
		}
		24% {
			translate: 0 3px;
		}
		30%,
		42.5% {
			translate: 0 0;
		}
		46% {
			translate: 0 3px;
		}
		52%,
		100% {
			translate: 0 0;
		}
	}

	/* --- one place where every eyeline + blink pairing is declared, so the
	       shorthands never fight each other --- */
	.rig[data-beat='prep'] {
		.pupils {
			animation:
				eyes-prep 2100ms both,
				lid-drag-prep 2100ms linear both;
		}
		.lid {
			animation: blink-prep 2100ms linear both;
		}
	}
	.rig[data-beat='stroke'][data-kind='light'],
	.rig[data-beat='stroke'][data-kind='heavy'] {
		.lid {
			animation: blink-beat var(--stroke-ms) linear both;
		}
	}
	.rig[data-beat='stroke'][data-kind='light'] .pupils {
		animation:
			eyes-work var(--stroke-ms) both,
			lid-drag var(--stroke-ms) linear both;
	}
	.rig[data-beat='stroke'][data-kind='heavy'] .pupils {
		animation:
			eyes-heavy var(--stroke-ms) both,
			lid-drag var(--stroke-ms) linear both;
	}
	.rig[data-beat='stroke'][data-kind='fail'] {
		.pupils {
			animation:
				eyes-fail var(--stroke-ms) both,
				lid-drag-double var(--stroke-ms) linear both;
		}
		.lid {
			animation: blink-double var(--stroke-ms) linear both;
		}
	}
	.rig[data-beat='alarm'] .pupils {
		animation: eyes-alarm 900ms both;
	}
	.rig[data-beat='panic'] .pupils {
		animation: eyes-panic 820ms both;
	}
	/* THE CHANGE OF THOUGHT. `effort → puzzled` at the fail/reset boundary is
	   the biggest reversal in the performance, and a blink is how you punctuate
	   one (Shawn Kelly). It lands on the first frames of the reset — i.e. on the
	   boundary itself — and holds two frames longer than a working blink, which
	   is what "wait, what?" looks like. */
	@keyframes blink-reset {
		0% {
			transform: scaleY(0);
		}
		4% {
			transform: scaleY(1.04);
		}
		10% {
			transform: scaleY(1.04);
		}
		18%,
		100% {
			transform: scaleY(0);
		}
	}
	@keyframes lid-drag-reset {
		0% {
			translate: 0 0;
		}
		4%,
		10% {
			translate: 0 3px;
		}
		18%,
		100% {
			translate: 0 0;
		}
	}
	.rig[data-beat='stroke'][data-kind='reset'] {
		.lid {
			animation: blink-reset var(--stroke-ms) linear both;
		}
		.pupils {
			animation:
				eyes-reset var(--stroke-ms) both,
				lid-drag-reset var(--stroke-ms) linear both;
		}
	}
	/* he does not blink once he is frightened (ASK p.87) */
	.rig[data-beat='alarm'] .lid,
	.rig[data-beat='panic'] .lid {
		animation: none;
		transform: scaleY(0);
	}
	/* the far lid is a frame behind the near one — declared last so the
	   shorthands above cannot reset it */
	.rig .lid.far {
		animation-delay: 42ms;
	}

	/* ===================== ACTING ======================================
	   The brows now sit BELOW the brim, so the ladder is actually visible.
	   The mouth HARD-CUTS (real 2D changes an expression on one frame); the
	   brows move, because that is what sells the transition. */
	/* Line-weight hierarchy on the face: the brows used to be 1.7× the weight of
	   the mouth, so the mouth lost every read. They are level now — the brows
	   still carry the acting, the mouth carries the mood. */
	/* Brows in HAIR, not ink. Two 6.4 u --ink strokes were the heaviest black on
	   a light skin field and read as one dark bar under the brim; every
	   reference draws the brow in the hair's colour, a step lighter than the
	   contour. */
	.brow {
		fill: none;
		stroke: var(--hair);
		stroke-width: 6.6;
		stroke-linecap: round;
		transition: transform 150ms cubic-bezier(0.3, 0.9, 0.4, 1);
	}
	.brow.near {
		transform-origin: 93px 103px;
	}
	.brow.far {
		transform-origin: 103px 101px;
	}
	[data-mood='cocky'] .brow.near {
		transform: rotate(-5deg) translateY(-2px);
	}
	[data-mood='cocky'] .brow.far {
		transform: rotate(10deg) translateY(-5px);
	}
	[data-mood='work'] .brow.near {
		transform: rotate(5deg) translateY(1px);
	}
	[data-mood='work'] .brow.far {
		transform: rotate(-4deg);
	}
	[data-mood='puzzled'] .brow.near {
		transform: rotate(-9deg) translateY(-4px);
	}
	[data-mood='puzzled'] .brow.far {
		transform: rotate(-11deg) translateY(3px);
	}
	[data-mood='effort'] .brow.near {
		transform: rotate(12deg) translateY(3px);
	}
	[data-mood='effort'] .brow.far {
		transform: rotate(-10deg) translateY(3px);
	}
	[data-mood='strain'] .brow.near {
		transform: rotate(18deg) translateY(5px) scaleX(1.08);
	}
	[data-mood='strain'] .brow.far {
		transform: rotate(-16deg) translateY(5px) scaleX(1.08);
	}
	[data-mood='alarm'] .brow.near,
	[data-mood='panic'] .brow.near {
		transform: rotate(-17deg) translateY(-7px);
	}
	[data-mood='alarm'] .brow.far,
	[data-mood='panic'] .brow.far {
		transform: rotate(16deg) translateY(-8px);
	}

	.mouth,
	.mouth path {
		fill: none;
		stroke: var(--ink);
		stroke-width: 5.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.mouth {
		opacity: 0;
	}
	.mouth.work,
	.mouth.alarm,
	.mouth.panic,
	.mouth.puzzled,
	.mouth.cocky path:first-child,
	.mouth.effort path:first-child,
	.mouth.strain path:first-child {
		fill: var(--mouth);
	}
	.mouth .teeth-fill {
		fill: var(--white);
		stroke: none;
	}
	.mouth .tongue {
		fill: var(--tongue);
		stroke: none;
	}
	/* the division between two teeth: a line ON the white block, in the mouth's
	   own colour, not a white bar across a dark one */
	.mouth .tooth-line {
		fill: none;
		stroke: var(--mouth);
		stroke-width: 2;
		stroke-linecap: round;
		opacity: 0.55;
	}
	/* the upper lip. Redrawing the cavity's top edge in ink at full weight is
	   what gives the open mouths a defined lip rather than a hole. */
	.mouth .lip {
		fill: none;
		stroke: var(--ink);
		stroke-width: 4.6;
		stroke-linecap: round;
	}
	[data-mood='cocky'] .mouth.cocky,
	[data-mood='work'] .mouth.work,
	[data-mood='puzzled'] .mouth.puzzled,
	[data-mood='effort'] .mouth.effort,
	[data-mood='strain'] .mouth.strain,
	[data-mood='alarm'] .mouth.alarm,
	[data-mood='panic'] .mouth.panic {
		opacity: 1;
	}

	/* Cheek blush is the cheapest appeal cue there is and refs 2 and 5 both keep
	   it on in repose — it should not appear only when he is straining. */
	.flush {
		fill: oklch(0.7 0.16 28 / 0.45);
		opacity: 0;
		transition: opacity 260ms ease;
	}
	[data-mood='cocky'] .flush,
	[data-mood='work'] .flush,
	[data-mood='puzzled'] .flush {
		opacity: 0.4;
	}
	[data-mood='effort'] .flush {
		opacity: 0.55;
	}
	[data-mood='strain'] .flush {
		opacity: 1;
	}
	[data-mood='alarm'] .flush,
	[data-mood='panic'] .flush {
		opacity: 0.35;
	}

	.eye {
		transition: transform 160ms cubic-bezier(0.2, 1.3, 0.4, 1);
	}
	.eye.near {
		transform-origin: 80px 118px;
	}
	.eye.far {
		transform-origin: 108px 116px;
	}
	.pupil {
		fill: var(--iris);
	}
	.pupil,
	.glint {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 120ms cubic-bezier(0.3, 1.4, 0.5, 1);
	}
	[data-mood='alarm'] .pupil,
	[data-mood='panic'] .pupil {
		transform: scale(0.42);
	}
	[data-mood='alarm'] .eye,
	[data-mood='panic'] .eye {
		transform: scale(1.26);
	}
	[data-mood='strain'] .eye.far {
		transform: scale(0.9, 0.64);
	}
	[data-mood='strain'] .eye.near {
		transform: scale(0.96, 0.76);
	}
	[data-mood='puzzled'] .eye.far {
		transform: scale(0.92, 0.82);
	}
	[data-mood='alarm'] .glint,
	[data-mood='panic'] .glint {
		opacity: 0;
	}

	/* the idle breath only runs when no beat owns the torso */
	.rig[data-beat='none'] .chest {
		transform-box: fill-box;
		transform-origin: 50% 100%;
		animation: breathe 3.4s cubic-bezier(0.4, 0, 0.4, 1) infinite;
	}
	@keyframes breathe {
		0%,
		100% {
			transform: scale(1, 1);
		}
		42% {
			transform: scale(0.988, 1.022);
		}
		68% {
			transform: scale(1.004, 0.996);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.root,
		.root.on-stage,
		.root[data-phase='pumping'],
		.root[data-phase='boom'] {
			animation: none;
			translate: -126% 20%;
			rotate: 0deg;
			scale: 1;
			transition: opacity 200ms ease;
		}
		.root.on-stage {
			opacity: 1;
		}
		.rig :is(g, path, ellipse, rect, circle, line) {
			animation: none !important;
			transition: none !important;
		}
		.lid {
			transform: scaleY(0);
		}
	}
</style>
