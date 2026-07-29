<script lang="ts">
	// A strip of celluloid that runs continuously past the viewport.
	//
	// The whole strip — sprocket holes and frames together — is one transformed
	// element, so the perforations travel with the pictures and the thing reads as
	// a single piece of film rather than photos sliding behind a static border.
	// Position is driven from rAF rather than a CSS keyframe because the reader
	// can also grab it: a drag adds to the same offset, and the flick that ends it
	// bleeds back into the base drift instead of snapping.
	let {
		images,
		height = 200,
		speed = 60,
		direction = 'left',
		onframeclick = undefined as
			| ((detail: { index: number; element: HTMLButtonElement }) => void)
			| undefined,
	}: {
		images: Array<
			string | { src: string; caption?: string; width?: number; height?: number }
		>;
		/** Height of one frame, in px. */
		height?: number;
		/** Seconds for one full pass of the image set. */
		speed?: number;
		direction?: 'left' | 'right';
		onframeclick?: (detail: { index: number; element: HTMLButtonElement }) => void;
	} = $props();

	const normalized = $derived(
		images.map((i) => (typeof i === 'string' ? { src: i } : i)),
	);
	// Reserve each frame's width up front (from the item's intrinsic dimensions)
	// so the looping track doesn't change length — and visibly jump — as lazy
	// images load in.
	const ratioOf = (i: { width?: number; height?: number }) =>
		i.width && i.height ? `${i.width} / ${i.height}` : '4 / 3';
	const clickable = $derived(typeof onframeclick === 'function');

	/**
	 * Three passes of the set. The strip only ever travels one pass before it
	 * wraps, so two would be exactly enough *if* a single pass were always wider
	 * than the viewport — three means a short set on a wide screen can't expose
	 * the end of the strip.
	 */
	const COPIES = [0, 1, 2];

	/** Gap between frames, in px. Must match the `gap` on `.frames`/`.copy`. */
	const GAP = 4;
	/** Nominal sprocket spacing. Snapped below so the hole pattern survives a wrap. */
	const PERF_PITCH = 46;

	let reel_el = $state<HTMLDivElement>();
	let copy_els = $state<HTMLDivElement[]>([]);

	/** Width of one pass *including* its trailing gap — i.e. the loop period. */
	let unit = $state(0);
	/** How far the strip has travelled, wrapped into [0, unit). */
	let offset = $state(0);
	let hovering = $state(false);
	let dragging = $state(false);
	/** Momentum from the last flick, in px/s, on top of the base drift. */
	let fling = 0;

	/*
	 * The holes are a repeating gradient painted from the strip's left edge, so
	 * wrapping the offset by `unit` also jumps the pattern by `unit`. Snapping the
	 * pitch to a whole division of the loop is what makes that jump invisible.
	 */
	const perf_pitch = $derived(
		unit > 0 ? unit / Math.max(1, Math.round(unit / PERF_PITCH)) : PERF_PITCH,
	);

	$effect(() => {
		const el = copy_els[0];
		if (!el) return;
		const measure = () => {
			const w = el.getBoundingClientRect().width;
			if (w > 0) unit = w + GAP;
		};
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	});

	$effect(() => {
		if (!reel_el) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			// Clamp dt so a backgrounded tab doesn't come back having "scrolled"
			// through half the reel in one frame.
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (unit <= 0 || dragging) return;
			const idle = hovering || reduce.matches;
			const drift = idle
				? 0
				: ((direction === 'right' ? -1 : 1) * unit) / Math.max(1, speed);
			if (!drift && !fling) return;
			offset = wrap(offset + (drift + fling) * dt);
			if (fling) {
				// ~a third of a second of coast, then hand back to the drift.
				fling *= Math.exp(-dt / 0.32);
				if (Math.abs(fling) < 12) fling = 0;
			}
		};
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			// Unmounting mid-drag would otherwise leave the window listeners behind.
			window.removeEventListener('pointermove', onpointermove);
			window.removeEventListener('pointerup', endDrag);
			window.removeEventListener('pointercancel', endDrag);
		};
	});

	const wrap = (n: number) => (unit > 0 ? ((n % unit) + unit) % unit : n);

	let start_x = 0;
	let last_x = 0;
	let last_t = 0;
	/** True once this gesture has moved far enough to be a drag, not a click. */
	let dragged = false;

	function onpointerdown(event: PointerEvent) {
		if (event.button !== 0) return;
		dragging = true;
		dragged = false;
		fling = 0;
		start_x = last_x = event.clientX;
		last_t = performance.now();
		/*
		 * The rest of the gesture lives on the window, not on the reel. Pointer
		 * capture is only taken once we know it's a drag (below), so up to that
		 * point a pointer that leaves the strip would otherwise never deliver its
		 * move or its release — and the reel would sit frozen mid-drag forever.
		 */
		window.addEventListener('pointermove', onpointermove);
		window.addEventListener('pointerup', endDrag);
		window.addEventListener('pointercancel', endDrag);
	}

	function onpointermove(event: PointerEvent) {
		if (!dragging || unit <= 0) return;
		const dx = event.clientX - last_x;
		if (!dx) return;
		if (!dragged && Math.abs(event.clientX - start_x) > 4) {
			dragged = true;
			// Capture only once we know it's a drag: capturing on pointerdown would
			// also redirect the `click` that a plain tap on a frame should produce.
			reel_el?.setPointerCapture(event.pointerId);
		}
		const now = performance.now();
		const dt = Math.max(0.008, (now - last_t) / 1000);
		// Tail-weighted, so a flick reads as a flick but a drag that coasts to a
		// stop before you let go doesn't launch.
		fling = fling * 0.7 + (-dx / dt) * 0.3;
		last_x = event.clientX;
		last_t = now;
		offset = wrap(offset - dx);
	}

	function endDrag(event: PointerEvent) {
		window.removeEventListener('pointermove', onpointermove);
		window.removeEventListener('pointerup', endDrag);
		window.removeEventListener('pointercancel', endDrag);
		if (!dragging) return;
		dragging = false;
		if (reel_el?.hasPointerCapture(event.pointerId)) {
			reel_el.releasePointerCapture(event.pointerId);
		}
		// A stale velocity is a held finger, not a throw.
		if (performance.now() - last_t > 90) fling = 0;
	}

	function onclickcapture(event: MouseEvent) {
		if (!dragged) return;
		event.preventDefault();
		event.stopPropagation();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={reel_el}
	class="film-reel"
	class:dragging
	style:--reel-height="{height}px"
	style:--perf-pitch="{perf_pitch}px"
	{onpointerdown}
	{onclickcapture}
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}>
	<div class="strip" style:transform="translate3d({-offset}px, 0, 0)">
		<div class="perforations" aria-hidden="true"></div>
		<div class="frames">
			{#each COPIES as copy (copy)}
				<div class="copy" bind:this={copy_els[copy]} aria-hidden={copy > 0 || undefined}>
					{#each normalized as item, index (index)}
						{#if clickable}
							<button
								class="frame frame-button"
								type="button"
								tabindex={copy > 0 ? -1 : 0}
								aria-label={item.caption ?? 'Open image'}
								onclick={(e) => onframeclick?.({ index, element: e.currentTarget })}>
								<img
									src={item.src}
									alt={item.caption ?? ''}
									style:aspect-ratio={ratioOf(item)}
									draggable="false"
									loading="lazy"
									decoding="async" />
								{#if item.caption}<span class="caption">{item.caption}</span>{/if}
							</button>
						{:else}
							<figure class="frame">
								<img
									src={item.src}
									alt={item.caption ?? ''}
									style:aspect-ratio={ratioOf(item)}
									draggable="false"
									loading="lazy"
									decoding="async" />
								{#if item.caption}<figcaption>{item.caption}</figcaption>{/if}
							</figure>
						{/if}
					{/each}
				</div>
			{/each}
		</div>
		<div class="perforations" aria-hidden="true"></div>
	</div>
</div>

<style>
	.film-reel {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 4px;
		/*
		 * The stock used to be near-black on a near-black section, which made the
		 * strip read as "photos floating in a void" — the film itself was the part
		 * you couldn't see. This is a lit grey with a warm top edge, so there is a
		 * physical object under the pictures.
		 */
		background: linear-gradient(
			180deg,
			#4a4a55 0%,
			#33333d 12%,
			#3d3d48 50%,
			#33333d 88%,
			#4a4a55 100%
		);
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.1),
			0 10px 40px rgba(0, 0, 0, 0.55);
		cursor: grab;
		/* Horizontal drags are ours; vertical ones still scroll the page. */
		touch-action: pan-y;
	}
	.film-reel.dragging {
		cursor: grabbing;
		user-select: none;
	}

	.strip {
		display: flex;
		flex-direction: column;
		gap: 6px;
		/* Sized by its content, so the perforation rows span the full strip and
		   the whole assembly translates as one piece. */
		width: max-content;
		padding: 8px 0;
		will-change: transform;
	}

	/*
	 * Sprocket holes, as a repeating gradient rather than elements: the pattern is
	 * painted from the strip's own left edge, so it travels with the frames for
	 * free and there is no per-hole DOM to keep in sync. The wider, darker layer
	 * underneath gives each hole a punched edge.
	 */
	.perforations {
		height: 11px;
		background:
			repeating-linear-gradient(
				90deg,
				#efece2 1px,
				#efece2 23px,
				transparent 23px,
				transparent var(--perf-pitch)
			),
			repeating-linear-gradient(
				90deg,
				rgba(0, 0, 0, 0.6) 0,
				rgba(0, 0, 0, 0.6) 1px,
				transparent 1px,
				transparent 23px,
				rgba(0, 0, 0, 0.6) 23px,
				rgba(0, 0, 0, 0.6) 24px,
				transparent 24px,
				transparent var(--perf-pitch)
			);
	}

	.frames,
	.copy {
		display: flex;
		/* Both gaps must stay 4px — the loop period is measured as one copy plus
		   one gap, which only holds if the seam matches the interior spacing. */
		gap: 4px;
	}

	.frame {
		flex: 0 0 auto;
		margin: 0;
		height: var(--reel-height);
		background: #05050a;
		border: 0;
		padding: 0;
		position: relative;
		overflow: hidden;
		/* The bright hairline is the cut between frames; on the lighter stock it's
		   what makes each picture look seated in the film rather than beside it. */
		box-shadow:
			inset 0 0 0 1px rgba(0, 0, 0, 0.85),
			0 0 0 1px rgba(255, 255, 255, 0.16);
	}
	.frame img {
		height: 100%;
		width: auto;
		display: block;
		/* The inline aspect-ratio (from item dimensions) sizes `width: auto`
		   before the image loads, keeping the loop period stable. */
		object-fit: cover;
		-webkit-user-drag: none;
	}
	.frame-button {
		appearance: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: transform 200ms ease;
	}
	.film-reel.dragging .frame-button {
		cursor: grabbing;
	}
	.frame-button:hover {
		transition-duration: 0s;
		transform: scale(1.04);
		z-index: 2;
	}
	.frame-button:focus-visible {
		outline: 2px solid #00e0ff;
		outline-offset: 2px;
	}
	figcaption,
	.frame .caption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.2rem 0.5rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		opacity: 0;
		transition: opacity 200ms ease;
	}
	.frame:hover figcaption,
	.frame:hover .caption {
		transition-duration: 0s;
		opacity: 1;
	}
	/* No hover on touch devices — captions would be unreachable; show them. */
	@media (hover: none) {
		figcaption,
		.frame .caption {
			opacity: 1;
		}
	}
</style>
