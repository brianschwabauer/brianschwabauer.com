<script lang="ts">
	// A row of photos that drifts continuously past the viewport and can be
	// grabbed.
	//
	// The same motion as `FilmReel` — rAF-driven offset, a drag that adds to it,
	// a flick that bleeds back into the base drift — with none of the celluloid.
	// Reach for this when the photos are the object and a strip of film around
	// them would be a costume: contact-sheet height, real aspect ratios, nothing
	// between the pictures but a gap.
	let {
		items,
		height = 'clamp(240px, 40vh, 380px)',
		speed = 60,
		direction = 'left',
		onitemclick = undefined as
			| ((detail: { index: number; element: HTMLButtonElement }) => void)
			| undefined,
	}: {
		items: Array<
			string | { src?: string; width?: number; height?: number; alt?: string }
		>;
		/** Height of every photo, as a CSS length. */
		height?: string;
		/** Seconds for one full pass of the image set. */
		speed?: number;
		direction?: 'left' | 'right';
		onitemclick?: (detail: { index: number; element: HTMLButtonElement }) => void;
	} = $props();

	// Accept GalleryItem-shaped objects (src is optional there); render only
	// entries that actually have an image source.
	const normalized = $derived(
		items
			.map((i) => (typeof i === 'string' ? { src: i } : i))
			.filter((i): i is { src: string; width?: number; height?: number; alt?: string } =>
				Boolean(i.src),
			),
	);
	// Reserve each photo's width up front (from its intrinsic dimensions) so the
	// looping track doesn't change length — and visibly jump — as lazy images
	// load in.
	const ratioOf = (i: { width?: number; height?: number }) =>
		i.width && i.height ? `${i.width} / ${i.height}` : '3 / 2';

	/**
	 * Three passes of the set. The strip only ever travels one pass before it
	 * wraps, so two would be exactly enough *if* a single pass were always wider
	 * than the viewport — three means a short set on a wide screen can't expose
	 * the end of the strip.
	 */
	const COPIES = [0, 1, 2];

	/** Gap between photos, in px. Must match the `gap` on `.track`/`.copy`. */
	const GAP = 12;

	let strip_el = $state<HTMLDivElement>();
	let copy_els = $state<HTMLDivElement[]>([]);

	/** Width of one pass *including* its trailing gap — i.e. the loop period. */
	let unit = $state(0);
	/** How far the strip has travelled, wrapped into [0, unit). */
	let offset = $state(0);
	let hovering = $state(false);
	let dragging = $state(false);
	/** Momentum from the last flick, in px/s, on top of the base drift. */
	let fling = 0;

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
		if (!strip_el) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		let raf = 0;
		let last = performance.now();
		const tick = (now: number) => {
			raf = requestAnimationFrame(tick);
			// Clamp dt so a backgrounded tab doesn't come back having "scrolled"
			// through half the strip in one frame.
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
		const start = () => {
			if (raf) return;
			// Reset the clock so the first resumed frame doesn't swallow the whole
			// off-screen stretch as one giant dt.
			last = performance.now();
			raf = requestAnimationFrame(tick);
		};
		const stop = () => {
			cancelAnimationFrame(raf);
			raf = 0;
		};
		// Nothing to drift while the strip is off screen. Fail open without IO.
		let io: IntersectionObserver | null = null;
		if (typeof IntersectionObserver === 'undefined') {
			start();
		} else {
			io = new IntersectionObserver(
				(entries) => (entries.some((e) => e.isIntersecting) ? start() : stop()),
				{ rootMargin: '20%' },
			);
			io.observe(strip_el);
		}
		return () => {
			stop();
			io?.disconnect();
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
		 * The rest of the gesture lives on the window, not on the strip. Pointer
		 * capture is only taken once we know it's a drag (below), so up to that
		 * point a pointer that leaves the strip would otherwise never deliver its
		 * move or its release — and the strip would sit frozen mid-drag forever.
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
			// also redirect the `click` that a plain tap on a photo should produce.
			strip_el?.setPointerCapture(event.pointerId);
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
		if (strip_el?.hasPointerCapture(event.pointerId)) {
			strip_el.releasePointerCapture(event.pointerId);
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
	bind:this={strip_el}
	class="drift-strip"
	class:dragging
	style:--strip-height={height}
	{onpointerdown}
	{onclickcapture}
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}>
	<div class="viewport">
		<div class="track" style:transform="translate3d({-offset}px, 0, 0)">
			{#each COPIES as copy (copy)}
				<div class="copy" bind:this={copy_els[copy]} aria-hidden={copy > 0 || undefined}>
					{#each normalized as item, index (index)}
						<button
							type="button"
							class="photo"
							tabindex={copy > 0 ? -1 : 0}
							aria-label={item.alt ?? 'Open photo'}
							onclick={(e) => onitemclick?.({ index, element: e.currentTarget })}>
							<img
								src={item.src}
								alt={item.alt ?? ''}
								style:aspect-ratio={ratioOf(item)}
								draggable="false"
								loading="lazy"
								decoding="async" />
						</button>
					{/each}
				</div>
			{/each}
		</div>
	</div>
	<div class="hint" aria-hidden="true">drag →</div>
</div>

<style>
	.drift-strip {
		position: relative;
		/* Full bleed: the strip is a window onto more, and a window with page
		   margins either side isn't one. */
		width: 100vw;
		margin-inline: calc(50% - 50vw);
		cursor: grab;
		/* Horizontal drags are ours; vertical ones still scroll the page. */
		touch-action: pan-y;
	}
	/* The clip lives one level in so the hint below can sit outside it. */
	.viewport {
		overflow: hidden;
		/* Fade the cut edges so photos enter and leave rather than popping. */
		mask-image: linear-gradient(
			90deg,
			transparent,
			#000 clamp(0.75rem, 4vw, 3rem),
			#000 calc(100% - clamp(0.75rem, 4vw, 3rem)),
			transparent
		);
	}
	.drift-strip.dragging {
		cursor: grabbing;
		user-select: none;
	}

	.track {
		display: flex;
		/* Sized by its content so the whole run translates as one piece. */
		width: max-content;
		/* Room for the hover lift, which would otherwise be clipped. */
		padding-block: 0.5rem;
		gap: 12px;
		will-change: transform;
	}
	.copy {
		display: flex;
		/* Both gaps must stay 12px — the loop period is measured as one copy plus
		   one gap, which only holds if the seam matches the interior spacing. */
		gap: 12px;
	}

	.photo {
		all: unset;
		flex: 0 0 auto;
		display: block;
		cursor: zoom-in;
		border-radius: 10px;
		overflow: hidden;
		transition: transform 200ms ease;
	}
	.drift-strip.dragging .photo {
		cursor: grabbing;
	}
	.photo:hover {
		transition-duration: 0s;
		transform: translateY(-4px);
	}
	.photo:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
	}
	img {
		display: block;
		height: var(--strip-height);
		width: auto;
		/* The inline aspect-ratio (from item dimensions) sizes `width: auto` before
		   the image loads, keeping the loop period stable. */
		object-fit: cover;
		-webkit-user-drag: none;
	}

	.hint {
		position: absolute;
		right: clamp(1rem, 6vw, 5rem);
		bottom: -1.4rem;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		opacity: 0.4;
		pointer-events: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.photo {
			transition: none;
		}
	}
</style>
