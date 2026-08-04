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
		// Nothing to drift while the reel is off screen. Fail open without IO.
		let io: IntersectionObserver | null = null;
		if (typeof IntersectionObserver === 'undefined') {
			start();
		} else {
			io = new IntersectionObserver(
				(entries) => (entries.some((e) => e.isIntersecting) ? start() : stop()),
				{ rootMargin: '20%' },
			);
			io.observe(reel_el);
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
		 * Film stock is dark — the near-black original was right about that and
		 * wrong about everything else: with no lighting it read as "photos
		 * floating in a void". The flat lit-grey replacement was visible but
		 * looked like clip art. This is dark charcoal base made visible by
		 * LIGHT, not lightness: rolled highlights where the strip curves toward
		 * the light at its edges, a static specular sheen the film travels
		 * under (::after), and grain in the emulsion (::before).
		 */
		--stock: oklch(0.29 0.012 300);
		background: linear-gradient(
			180deg,
			oklch(from var(--stock) calc(l + 0.09) c h) 0%,
			oklch(from var(--stock) calc(l - 0.03) c h) 9%,
			var(--stock) 50%,
			oklch(from var(--stock) calc(l - 0.04) c h) 91%,
			oklch(from var(--stock) calc(l + 0.07) c h) 100%
		);
		box-shadow:
			inset 0 1px 0 oklch(1 0 0 / 0.12),
			inset 0 -1px 0 oklch(1 0 0 / 0.07),
			0 10px 40px oklch(0 0 0 / 0.55);
		cursor: grab;
		/* Horizontal drags are ours; vertical ones still scroll the page. */
		touch-action: pan-y;
	}
	/*
	 * The two overlays that sell the strip as a physical object. Both sit above
	 * the moving frames — the sheen is the room's light reflecting off the
	 * base, so it stays put while the film slides beneath it, and the grain is
	 * in the emulsion, so it belongs on the pictures too.
	 */
	.film-reel::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E");
		opacity: 0.05;
	}
	.film-reel::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(
			115deg,
			transparent 32%,
			oklch(1 0 0 / 0.055) 46%,
			oklch(1 0 0 / 0.015) 54%,
			transparent 68%
		);
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
	 * Sprocket holes, as a repeating background rather than elements: the tile is
	 * painted from the strip's own left edge, so it travels with the frames for
	 * free and there is no per-hole DOM to keep in sync.
	 *
	 * One SVG tile per pitch instead of hard-edged gradient bars — the flat
	 * sharp-cornered rectangles were most of the clip-art look. Each hole is a
	 * rounded rect (real perforations are die-cut with rounded corners), lit
	 * through from behind — dimmer at the top, brighter at the bottom — with a
	 * punched shadow riding its top edge and a sliver of bevel highlight under
	 * its bottom lip. The tile is drawn at 46px and stretched to --perf-pitch;
	 * the pitch only ever snaps within a few percent of 46, so the stretch is
	 * invisible.
	 */
	.perforations {
		height: 12px;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='12'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23cbc6b6'/%3E%3Cstop offset='1' stop-color='%23f6f1e2'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='11.5' y='1.4' width='23' height='9.2' rx='3.1' fill='rgb(0 0 0 / 0.5)'/%3E%3Crect x='12' y='2.2' width='22' height='8' rx='2.6' fill='url(%23g)'/%3E%3Crect x='13' y='10.7' width='20' height='0.9' rx='0.45' fill='rgb(255 255 255 / 0.16)'/%3E%3C/svg%3E");
		background-size: var(--perf-pitch) 12px;
		background-repeat: repeat-x;
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
		border-radius: 1.5px;
		/* Seat each picture IN the stock instead of outlining it on top: a dark
		   inner edge where the image meets its aperture, and only the faintest
		   catch-light around the cut. The old bright hairline read as a sticker
		   border. */
		box-shadow:
			inset 0 0 0 1px oklch(0 0 0 / 0.85),
			0 0 0 1px oklch(1 0 0 / 0.06);
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
		outline: 2px solid #00d6ff;
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
