<script lang="ts">
	// A turntable that actually works as a control: the record is this section's
	// track list, and dropping the needle on a band cues that song and takes you
	// to it.
	//
	// The graphic this replaced was decoration that didn't survive a second look
	// — the tonearm floated in space beside the disc rather than resting on it,
	// the "grooves" were a repeating-radial-gradient that turned to moiré at any
	// real size, and the platter span forever regardless of whether anything was
	// happening. Everything here is driven by one number instead: `radius`, the
	// distance from the spindle the stylus is sitting at. The arm angle is
	// solved from it, the platter spins only while it's over a band, and the
	// readout names whatever the needle is on.

	import { scrollToSection } from '$lib/sectionNav';

	export type Track = {
		/** Two-digit numeral, matching the track's own heading. */
		num: string;
		title: string;
		year: string;
		/** `id` of the element to scroll to when the track is cued. */
		target: string;
	};

	let {
		tracks,
		color = '#ff66cc',
		/** Label copy — the record's own identity, not the cued track's. */
		label_top = '33⅓',
		label_bottom = '2007—2010',
	}: {
		tracks: Track[];
		color?: string;
		label_top?: string;
		label_bottom?: string;
	} = $props();

	/*
	 * Geometry, in the SVG's own 200×200 units.
	 *
	 * The record sits left-of-centre and low, which leaves the top-right corner
	 * for the pivot — the same place it is on a real deck, and the only
	 * arrangement where an arm long enough to reach the inner groove doesn't
	 * swing off the edge of the box.
	 */
	const CX = 88;
	const CY = 104;
	const R_DISC = 76;
	const R_LABEL = 24;

	/** Lead-in and lead-out: the playable band of the record. */
	const R_FIRST = 70;
	const R_LAST = 30;

	const PIVOT_X = 176;
	const PIVOT_Y = 46;
	const ARM_LEN = 96;
	/** Where the arm parks — just outside the disc, on its rest. */
	const R_REST = 84;

	const DEG = 180 / Math.PI;
	/** Pivot-to-spindle distance, the fixed side of the arm triangle. */
	const PIVOT_DIST = Math.hypot(PIVOT_X - CX, PIVOT_Y - CY);
	/** Bearing from the pivot to the spindle, which every arm angle is measured off. */
	const BASE_ANGLE = Math.atan2(CY - PIVOT_Y, CX - PIVOT_X) * DEG;

	/**
	 * The arm's rotation for a stylus sitting `r` from the spindle.
	 *
	 * Pivot, spindle and stylus make a triangle with two fixed sides — the
	 * pivot-to-spindle distance and the arm's own length — so the groove radius
	 * is the third side and the angle at the pivot falls out of the law of
	 * cosines. Solving it rather than eyeballing keyframes is what keeps the
	 * stylus *on* the record at every position instead of near it.
	 */
	function armAngle(r: number): number {
		const cos =
			(PIVOT_DIST * PIVOT_DIST + ARM_LEN * ARM_LEN - r * r) / (2 * PIVOT_DIST * ARM_LEN);
		const theta = Math.acos(Math.min(1, Math.max(-1, cos))) * DEG;
		// The arm is drawn hanging straight down from the pivot, so subtract the
		// quarter turn that puts it there.
		return BASE_ANGLE - theta - 90;
	}

	/** The inverse: which groove radius an arm rotated to `angle` is sitting in. */
	function radiusForAngle(angle: number): number {
		const theta = ((BASE_ANGLE - 90 - angle) * Math.PI) / 180;
		const sq =
			PIVOT_DIST * PIVOT_DIST +
			ARM_LEN * ARM_LEN -
			2 * PIVOT_DIST * ARM_LEN * Math.cos(theta);
		return Math.sqrt(Math.max(0, sq));
	}

	/** Each track owns an equal share of the playable band, outermost first. */
	const BAND = $derived((R_FIRST - R_LAST) / tracks.length);
	const bandOuter = (i: number) => R_FIRST - i * BAND;
	const bandCentre = (i: number) => R_FIRST - (i + 0.5) * BAND;

	/** Which band a given radius falls in, or -1 when the needle is off the record. */
	function bandAt(r: number): number {
		if (r > R_FIRST || r < R_LAST) return -1;
		return Math.min(tracks.length - 1, Math.floor((R_FIRST - r) / BAND));
	}

	// Concentric rings rather than a repeating gradient: at this size a gradient
	// beats against the pixel grid and turns to mush, while ~26 discrete circles
	// stay crisp at any scale and let the band edges be drawn deliberately.
	const GROOVES = Array.from({ length: 26 }, (_, i) => R_FIRST + 1.5 - i * 1.68);

	let cued = $state<number | null>(null);
	let hovered = $state<number | null>(null);
	let dragging = $state(false);
	let drag_radius = $state(R_REST);
	let svg_el = $state<SVGSVGElement>();
	/** Roving tabindex for the band radio group. */
	let focus_index = $state(0);

	const radius = $derived(
		dragging ? drag_radius : cued === null ? R_REST : bandCentre(cued),
	);
	const angle = $derived(armAngle(radius));
	const playing = $derived(cued !== null && !dragging);

	/** What the readout names: the drag in progress, then hover, then the cue. */
	const shown = $derived(dragging ? bandAt(drag_radius) : (hovered ?? cued ?? -1));
	const shown_track = $derived(shown >= 0 ? tracks[shown] : undefined);

	function goto(i: number) {
		const el = document.getElementById(tracks[i].target);
		if (el) scrollToSection(el);
	}

	/** Cue a band, or lift the needle if it's already the one playing. */
	function cue(i: number, scroll = true) {
		if (cued === i && scroll) {
			cued = null;
			return;
		}
		cued = i;
		focus_index = i;
		if (scroll) goto(i);
	}

	/** Pointer position in the SVG's own units. */
	function toLocal(event: PointerEvent) {
		const rect = svg_el!.getBoundingClientRect();
		// The viewBox is square and so is the element, so one uniform scale.
		const scale = rect.width / 200;
		return {
			x: (event.clientX - rect.left) / scale,
			y: (event.clientY - rect.top) / scale,
		};
	}

	function onArmDown(event: PointerEvent) {
		event.preventDefault();
		(event.currentTarget as Element).setPointerCapture(event.pointerId);
		dragging = true;
		drag_radius = radius;
	}

	function onArmMove(event: PointerEvent) {
		if (!dragging) return;
		const { x, y } = toLocal(event);
		const a = Math.atan2(y - PIVOT_Y, x - PIVOT_X) * DEG - 90;
		// Clamp to the playable band so the needle can't be dragged into the
		// label or off the edge of the record.
		drag_radius = Math.min(R_FIRST, Math.max(R_LAST, radiusForAngle(a)));
	}

	function onArmUp(event: PointerEvent) {
		if (!dragging) return;
		(event.currentTarget as Element).releasePointerCapture(event.pointerId);
		dragging = false;
		// Land in the nearest band rather than between two of them — a needle
		// sits in a groove, and a half-cued track means nothing.
		const i = bandAt(drag_radius);
		if (i < 0) return;
		// `scroll: false` then an explicit goto, so this never toggles: dragging
		// onto the band that's already playing is a re-cue, not a request to
		// lift the needle off it.
		cue(i, false);
		goto(i);
	}

	function onKey(event: KeyboardEvent, i: number) {
		const last = tracks.length - 1;
		let next = i;
		if (event.key === 'ArrowDown' || event.key === 'ArrowRight')
			next = Math.min(last, i + 1);
		else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft')
			next = Math.max(0, i - 1);
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = last;
		else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			cue(i);
			return;
		} else return;
		event.preventDefault();
		// Arrows walk the needle across the record; they don't move the page
		// under someone who is still choosing. Enter commits and scrolls.
		cue(next, false);
		focus_index = next;
		(svg_el?.querySelector(`[data-band="${next}"]`) as SVGElement | null)?.focus();
	}
</script>

<figure style:--accent={color}>
	<svg
		bind:this={svg_el}
		viewBox="0 0 200 200"
		class:playing
		class:dragging
		role="presentation">
		<defs>
			<radialGradient id="disc" cx="38%" cy="30%" r="78%">
				<stop offset="0%" stop-color="#26242a" />
				<stop offset="55%" stop-color="#131217" />
				<stop offset="100%" stop-color="#08070b" />
			</radialGradient>
			<radialGradient id="sheen" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stop-color="#fff" stop-opacity="0.16" />
				<stop offset="100%" stop-color="#fff" stop-opacity="0" />
			</radialGradient>
			<linearGradient id="tube" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0%" stop-color="#6c6f78" />
				<stop offset="42%" stop-color="#d9dce4" />
				<stop offset="100%" stop-color="#5a5d66" />
			</linearGradient>
			<radialGradient id="label" cx="42%" cy="34%" r="80%">
				<stop offset="0%" stop-color="oklch(from var(--accent) 0.78 c h)" />
				<stop offset="100%" stop-color="oklch(from var(--accent) 0.56 calc(c * 1.1) h)" />
			</radialGradient>
		</defs>

		<!-- The shadow, cast by its own static circle rather than by a filter on
		     the svg root: a root filter contains the spinning disc, so it was
		     re-evaluated on every frame of playback. This circle never moves, the
		     record covers it exactly, and its drop-shadow rasterizes once. -->
		<circle class="shadow" cx={CX} cy={CY} r={R_DISC} fill="#08070b" />

		<!-- The record. Everything in here turns together, so the sheen and the
		     label are what make the rotation legible — the grooves are concentric
		     and would look identical at any angle. -->
		<g class="disc">
			<circle cx={CX} cy={CY} r={R_DISC} fill="url(#disc)" />
			<circle
				cx={CX}
				cy={CY}
				r={R_DISC}
				fill="none"
				stroke="#ffffff"
				stroke-opacity="0.09"
				stroke-width="0.7" />

			{#each GROOVES as r (r)}
				<circle
					cx={CX}
					cy={CY}
					{r}
					fill="none"
					stroke="#ffffff"
					stroke-opacity="0.05"
					stroke-width="0.5" />
			{/each}

			<!-- The gaps a real pressing leaves between tracks, which is what makes
			     three songs legible as three bands rather than one field. -->
			{#each tracks as _, i (i)}
				{#if i > 0}
					<circle
						cx={CX}
						cy={CY}
						r={bandOuter(i)}
						fill="none"
						stroke="#040406"
						stroke-width="1.4" />
				{/if}
			{/each}

			<ellipse
				class="glint"
				cx={CX - 26}
				cy={CY - 30}
				rx="30"
				ry="46"
				fill="url(#sheen)"
				transform="rotate(-28 {CX - 26} {CY - 30})" />

			<circle cx={CX} cy={CY} r={R_LABEL} fill="url(#label)" />
			<circle
				cx={CX}
				cy={CY}
				r={R_LABEL}
				fill="none"
				stroke="#000"
				stroke-opacity="0.25"
				stroke-width="0.6" />
			<text class="label-top" x={CX} y={CY - 8}>{label_top}</text>
			<text class="label-bottom" x={CX} y={CY + 15}>{label_bottom}</text>
			<circle cx={CX} cy={CY} r="2.4" fill="#0a0910" />
		</g>

		<!-- The bands are UI over the record, not part of it, so they stay put
		     while it turns. Stroked rings the width of a band: the hit area is the
		     track itself, ~27px at the size this renders. -->
		<g role="radiogroup" aria-label="Cue a track" class="bands">
			{#each tracks as track, i (track.target)}
				<circle
					data-band={i}
					role="radio"
					tabindex={focus_index === i ? 0 : -1}
					aria-checked={cued === i}
					aria-label="{track.num} — {track.title}, {track.year}"
					cx={CX}
					cy={CY}
					r={bandCentre(i)}
					fill="none"
					stroke-width={BAND}
					class:on={cued === i}
					onpointerenter={() => (hovered = i)}
					onpointerleave={() => (hovered = null)}
					onclick={() => cue(i)}
					onfocus={() => (focus_index = i)}
					onkeydown={(e) => onKey(e, i)} />
			{/each}
		</g>

		<!-- The post the arm parks on. Drawn before the arm so the headshell sits
		     in the cradle rather than behind it — without something to rest on,
		     a parked arm just hangs in the air, which is the tell the graphic
		     this replaced never got past. -->
		<g class="rest">
			<rect x="161.5" y="150" width="4" height="12" rx="2" fill="#23252b" />
			<rect x="156.5" y="145.5" width="14" height="5.5" rx="2.75" fill="#33363e" />
		</g>

		<!-- The arm. Drawn hanging straight down from the pivot and rotated into
		     place, so the whole assembly is one transform off one number. -->
		<g class="arm" transform="rotate({angle} {PIVOT_X} {PIVOT_Y})">
			<rect
				x={PIVOT_X - 5.5}
				y={PIVOT_Y - 27}
				width="11"
				height="15"
				rx="3.5"
				fill="#3a3d45" />
			<rect x={PIVOT_X - 1.4} y={PIVOT_Y - 14} width="2.8" height="8" fill="#5a5d66" />
			<rect
				x={PIVOT_X - 1.5}
				y={PIVOT_Y}
				width="3"
				height={ARM_LEN - 9}
				fill="url(#tube)" />
			<g transform="rotate(-22 {PIVOT_X} {PIVOT_Y + ARM_LEN})">
				<rect
					x={PIVOT_X - 5}
					y={PIVOT_Y + ARM_LEN - 13}
					width="10"
					height="11"
					rx="1.6"
					fill="#c8ccd6" />
				<rect
					x={PIVOT_X - 3.4}
					y={PIVOT_Y + ARM_LEN - 4}
					width="6.8"
					height="3"
					fill="#2a2c33" />
			</g>
			<circle cx={PIVOT_X} cy={PIVOT_Y} r="8.5" fill="#2f323a" />
			<circle cx={PIVOT_X} cy={PIVOT_Y} r="4.5" fill="#585c66" />
			<!-- A thin tube is a 5px drag target; this is the 32px one.
			     Pointer-only on purpose: the bands above are the real control and
			     carry the radio semantics, so exposing the arm as a second one
			     would just put the same three choices in the tab order twice. -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<rect
				class="grip"
				aria-hidden="true"
				x={PIVOT_X - 8}
				y={PIVOT_Y - 4}
				width="16"
				height={ARM_LEN + 8}
				fill="transparent"
				onpointerdown={onArmDown}
				onpointermove={onArmMove}
				onpointerup={onArmUp}
				onpointercancel={onArmUp} />
		</g>
	</svg>

	<figcaption aria-live="polite">
		{#if shown_track}
			<span class="num">{shown_track.num}</span>
			<span class="title">{shown_track.title}</span>
			<span class="year">{shown_track.year}</span>
		{:else}
			<span class="hint">Drop the needle</span>
		{/if}
	</figcaption>
</figure>

<style>
	figure {
		margin: 0;
		display: grid;
		justify-items: center;
		gap: 1rem;
	}
	svg {
		width: 100%;
		max-width: 400px;
		aspect-ratio: 1;
		overflow: visible;
	}
	/* Neutral, not a coloured halo — the record is a black object on a dark
	   page and wants weight under it, not a glow around it. */
	.shadow {
		filter: drop-shadow(0 18px 26px rgba(0, 0, 0, 0.55));
	}

	.disc {
		transform-origin: 88px 104px;
	}
	svg.playing .disc {
		/* 33⅓ rpm is 1.8s a turn. Using the real number is why it reads as a
		   record rather than as something spinning. */
		animation: spin 1.8s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	/* No `mix-blend-mode` here. When the svg carried a drop-shadow filter, a
	   blended child inside the filtered group composited against the filter
	   region rather than the disc — which painted the group's whole bounding
	   box as a visible lighter rectangle the moment the spin animation promoted
	   a layer. The gradient is white-into-transparent anyway, so plain
	   source-over looks the same without the artefact. */
	.glint {
		pointer-events: none;
	}

	.label-top,
	.label-bottom {
		text-anchor: middle;
		font-family: var(--font-mono);
		fill: #1a0713;
	}
	.label-top {
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.label-bottom {
		font-size: 5.2px;
		letter-spacing: 0.14em;
		fill: oklch(from var(--accent) 0.3 calc(c * 0.6) h);
	}

	.bands circle {
		cursor: pointer;
		stroke: transparent;
		transition:
			stroke 280ms ease,
			stroke-opacity 280ms ease;
	}
	.bands circle:hover {
		transition-duration: 0s; /* instant on hover-in; animates on hover-out */
		stroke: oklch(from var(--accent) l c h / 0.16);
	}
	.bands circle.on {
		stroke: oklch(from var(--accent) l c h / 0.24);
	}
	/* Chrome rings a focused SVG shape with a rectangle around its *bounding
	   box*, which on a circle this size is a white box the width of the whole
	   record. Suppress it on both selectors — `:focus-visible` alone leaves the
	   click case drawing it — and let the band light up instead. */
	.bands circle:focus {
		outline: none;
	}
	.bands circle:focus-visible {
		stroke: oklch(from var(--accent) l c h / 0.45);
	}

	.arm {
		transition: transform 620ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	/* While the pointer is driving it, the arm goes where the pointer is —
	   a transition here would make it lag behind the hand holding it. */
	svg.dragging .arm {
		transition: none;
	}
	.grip {
		cursor: grab;
		touch-action: none;
	}
	svg.dragging .grip {
		cursor: grabbing;
	}

	figcaption {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.6rem;
		/* Held open so the readout swapping between "Drop the needle" and a long
		   title never shifts the copy underneath it. */
		min-height: 1.2rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}
	.num {
		color: var(--accent);
		font-weight: 700;
	}
	.year,
	.hint {
		color: oklch(from var(--accent) 0.78 calc(c * 0.3) h / 0.65);
	}

	@media (prefers-reduced-motion: reduce) {
		svg.playing .disc {
			animation: none;
		}
		.arm {
			transition: none;
		}
	}
</style>
