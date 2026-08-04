<script lang="ts">
	import { untrack } from 'svelte';

	/**
	 * The field around the year cycler: a grid of small cells filling the whole
	 * sticky frame. Each one pops up to size as the build front reaches it, on a
	 * back-out ease, and they don't all arrive together — every cell carries its
	 * own small delay, so the front is a ragged band rather than a clean line
	 * wiping across. Density rises year by year across the width and thins at the
	 * right, where the last year hasn't finished happening.
	 *
	 * It draws to a canvas, not to elements. The DOM version of this was ~1700
	 * spans and dropped frames: a scroll frame meant style recalc, paint
	 * invalidation and compositing across seventeen hundred boxes.
	 *
	 * What keeps it cheap is the shape of the draw loop. Every cell now has its own
	 * geometry each frame, so the cells can't be pre-rendered — but the expensive
	 * part was never the rectangles, it was the canvas state changes. Setting
	 * `globalAlpha` per cell costs ~8.5ms a frame; sorting the cells into a few
	 * dozen alpha buckets and filling each bucket as one batched path costs ~0.7ms
	 * for the identical picture. So: one pass to ease and bucket, one counting sort,
	 * one batched fill per bucket.
	 */
	let {
		progress = 0,
		blocks = 6,
		gate = 0,
		color = '#00f2c3',
	}: {
		/** 0 → 1 scrub position. Cells to the left of it are built. */
		progress?: number;
		/** Year blocks across the width — they set the density ramp, not a layout. */
		blocks?: number;
		/**
		 * Type size of the numerals, in CSS px. Sets the size of the clearing kept
		 * open in the middle of the field, so it tracks the glyphs at every
		 * viewport. Nothing is drawn until this arrives.
		 */
		gate?: number;
		color?: string;
	} = $props();

	/** Target cell pitch in CSS px, and the ceiling on how many cells that may
	 *  produce — past it the pitch grows instead of the count, so a 4K frame gets
	 *  larger cells rather than twelve thousand of them. */
	const PITCH = 26;
	const BUDGET = 2600;

	/**
	 * How busy each year was, roughly honestly: a slow first year fitting it around
	 * client work, two heads-down years, the heaviest stretch after that, and a
	 * last year that hasn't finished happening yet.
	 */
	const YEAR_WEIGHT = [0.34, 0.54, 0.76, 0.68, 0.9, 0.72];

	/** What an unbuilt cell is worth against a built one, in brightness and in
	 *  size. Neither is near zero: the shape of the years still to come is part of
	 *  the picture, and cells that vanish until the front arrives read as an empty
	 *  frame filling in rather than as work accumulating across a field. */
	const FLOOR = 0.42;
	const SMALL = 0.52;

	/** How fast one cell completes its pop, in reciprocal scrub-units: 14 is about
	 *  a fourteenth of the scrub, ~55px of scroll. */
	const RATE = 14;
	/** The most a cell's arrival can be pushed back, in scrub-units. Roughly the
	 *  width of one cell's own animation, which is enough to break the line up
	 *  without the front smearing into a general fade. */
	const SCATTER = 0.15;
	/**
	 * How much of the scrub the front itself travels across. The scatter and one
	 * cell's own pop both happen *after* a cell's column is reached, so the front
	 * has to finish early enough to leave room for them — otherwise the last
	 * columns run past the end of the scrub and never finish growing.
	 */
	const SPAN = 1 - 1 / RATE - SCATTER;

	/** Back-out overshoot. `C3 = C1 + 1`; these peak at ~1.2, so a cell swells
	 *  about 8% past its final size before settling. */
	const C1 = 3.6;
	const C3 = C1 + 1;

	/** Alpha levels the cells are quantised into before drawing. Enough that the
	 *  banding is well under a perceptible step at these opacities. */
	const LEVELS = 32;

	/** Deterministic 0 → 1 from an integer, so the same field is drawn every time
	 *  rather than reshuffling on every resize. */
	function noise(n: number) {
		let h = Math.imul(n + 1, 374761393);
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
	}

	let canvas = $state<HTMLCanvasElement | null>(null);
	let box = $state({ w: 0, h: 0 });
	let still = $state(false);

	/*
	 * Deliberately plain variables, not `$state`: these are the drawing's own
	 * scratch, written and read inside effects. Making them reactive would only
	 * invite an effect to re-run on its own output.
	 */
	let count = 0;
	/** Cell centres, in device pixels. */
	let cellX = new Float32Array(0);
	let cellY = new Float32Array(0);
	/** Alpha with nothing built — the cell's own weight times the clearing. */
	let cellA = new Float32Array(0);
	/** Scrub position at which this cell starts to pop: its column's place across
	 *  the field plus its own scatter. */
	let cellAt = new Float32Array(0);
	let cellW = 0;
	let cellH = 0;
	let cellR = 0;
	let peak = 1;
	/** Counting-sort scratch, sized with the field. */
	let level = new Int32Array(0);
	let scale = new Float32Array(0);
	let order = new Int32Array(0);
	const tally = new Int32Array(LEVELS + 1);

	/**
	 * The clearing kept open in the middle. Returns how much of a cell survives at
	 * that point: 0 where the numerals, the rail and the caption live, 1 out at the
	 * frame's edges, with a long soft falloff between.
	 *
	 * The radii are multiples of the numerals' own type size, and the 2.4 : 1.3
	 * proportion is the numerals' own, so the clearing hugs their shape instead of
	 * cutting a circle out of a wide frame.
	 */
	function clearing(px: number, py: number, cx: number, cy: number, g: number) {
		const r = Math.hypot((px - cx) / (g * 2.4), (py - cy) / (g * 1.3));
		if (r <= 0.52) return 0;
		if (r >= 1) return 1;
		return r <= 0.8 ? (0.5 * (r - 0.52)) / 0.28 : 0.5 + (0.5 * (r - 0.8)) / 0.2;
	}

	/** Lay out the field: one entry per cell that will ever be visible. Cells
	 *  inside the clearing are dropped here rather than skipped every frame. */
	function build(w: number, h: number, g: number, dpr: number) {
		const over = Math.sqrt(Math.max(1, (w / PITCH) * (h / PITCH)) / BUDGET);
		const pitch = PITCH * Math.max(1, over);
		const cols = Math.max(blocks, Math.round(w / pitch));
		const rows = Math.max(4, Math.round(h / pitch));

		const W = Math.round(w * dpr);
		const H = Math.round(h * dpr);
		const cw = W / cols;
		const ch = H / rows;
		// A gap proportional to the cell, so the grid reads the same at every size.
		const gap = Math.max(2 * dpr, Math.min(cw, ch) * 0.22);
		cellW = cw - gap;
		cellH = ch - gap;
		cellR = 2 * dpr;
		const cx = W / 2;
		const cy = H / 2;

		const max = cols * rows;
		cellX = new Float32Array(max);
		cellY = new Float32Array(max);
		cellA = new Float32Array(max);
		cellAt = new Float32Array(max);
		let n = 0;
		peak = 0.001;

		for (let c = 0; c < cols; c++) {
			// Where this column falls across the years — the blocks are a density
			// ramp, not a layout, so there is no seam between them.
			const across = (c / cols) * blocks;
			const year = Math.min(blocks - 1, Math.floor(across));
			const base = YEAR_WEIGHT[year % YEAR_WEIGHT.length];
			// The final year runs out partway through: months that haven't happened
			// have no work in them.
			const taper =
				year === blocks - 1
					? Math.max(0, Math.min(1, (0.72 - (across - year)) / 0.2))
					: 1;
			const x = (c + 0.5) / cols;

			for (let r = 0; r < rows; r++) {
				const px = c * cw + cellW / 2;
				const py = r * ch + cellH / 2;
				const open = clearing(px, py, cx, cy, g * dpr);
				if (open <= 0.004) continue;

				const seed = c * rows + r;
				// Roughly one cell in seven is a stretch where nothing shipped. The
				// gaps are what keep this from reading as a printed pattern.
				const quiet = noise(seed + 9001) < 0.14 ? 0.12 : 1;
				const weight = Math.min(1, base * (0.3 + 1.15 * noise(seed)) * taper * quiet);
				const alpha = open * (0.18 + weight * 0.34);
				if (alpha <= 0.004) continue;

				cellX[n] = px;
				cellY[n] = py;
				cellA[n] = alpha;
				// Scatter is per cell, not per column — a column-wide delay would just
				// make the line wobble rather than break up.
				cellAt[n] = x * SPAN + noise(seed + 4711) * SCATTER;
				if (alpha > peak) peak = alpha;
				n++;
			}
		}
		count = n;
		level = new Int32Array(n);
		scale = new Float32Array(n);
		order = new Int32Array(n);
	}

	/**
	 * One frame: ease every cell, bucket it by the alpha it landed on, counting-sort
	 * the buckets, then fill each as a single path. Three linear passes and
	 * `LEVELS` fills, whatever the cell count.
	 */
	function paint(p: number) {
		const el = canvas;
		if (!el || !count) return;
		const ctx = el.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, el.width, el.height);
		ctx.fillStyle = color;
		tally.fill(0);

		const flat = still;
		for (let i = 0; i < count; i++) {
			const t = (p - cellAt[i]) * RATE;
			let bright: number;
			if (t <= 0) {
				bright = FLOOR;
				scale[i] = flat ? 1 : SMALL;
			} else if (t >= 1) {
				bright = 1;
				scale[i] = 1;
			} else {
				const u = t - 1;
				// Brightness eases out without overshooting — only the size pops, so a
				// cell swells into place rather than flashing.
				bright = FLOOR + (1 - FLOOR) * (1 - u * u);
				scale[i] = flat ? 1 : SMALL + (1 - SMALL) * (1 + C3 * u * u * u + C1 * u * u);
			}
			const a = cellA[i] * bright;
			// Quantise against the brightest cell in the field rather than against 1,
			// so all `LEVELS` steps land inside the range actually in use.
			const q = Math.min(LEVELS - 1, ((a / peak) * LEVELS) | 0);
			level[i] = q;
			tally[q]++;
		}

		// Prefix sums over the tally give each level its slot in `order`.
		let at = 0;
		for (let q = 0; q < LEVELS; q++) {
			const n = tally[q];
			tally[q] = at;
			at += n;
		}
		for (let i = 0; i < count; i++) order[tally[level[i]]++] = i;

		let from = 0;
		for (let q = 0; q < LEVELS; q++) {
			const to = tally[q];
			if (to === from) continue;
			const alpha = ((q + 0.5) / LEVELS) * peak;
			if (alpha > 0.004) {
				ctx.globalAlpha = alpha;
				ctx.beginPath();
				for (let k = from; k < to; k++) {
					const i = order[k];
					const s = scale[i];
					const w = cellW * s;
					const h = cellH * s;
					// Grown about the cell's own centre, so the grid stays on its pitch.
					ctx.roundRect(cellX[i] - w / 2, cellY[i] - h / 2, w, h, cellR * s);
				}
				ctx.fill();
			}
			from = to;
		}
	}

	/*
	 * Measure now, and again on anything that could change it. The synchronous
	 * first read matters: a `ResizeObserver` is the right instrument for this, but
	 * it delivers on the rendering steps, and nothing at all is drawn until a size
	 * arrives — so a delayed or dropped first delivery is an empty frame rather
	 * than a slightly stale one. Belt and braces, and all three paths are idempotent.
	 */
	$effect(() => {
		const el = canvas;
		if (!el) return;
		const measure = () => {
			const r = el.getBoundingClientRect();
			if (r.width > 0 && r.height > 0) {
				box = { w: Math.round(r.width), h: Math.round(r.height) };
			}
		};
		measure();
		window.addEventListener('resize', measure);
		const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
		ro?.observe(el);
		return () => {
			window.removeEventListener('resize', measure);
			ro?.disconnect();
		};
	});

	/* Cells springing past their own size is exactly the kind of thing reduced
	   motion is asking us to drop. The scrub itself stays — it is the reader's own
	   scrolling — but the pop flattens to a plain brightness change. */
	$effect(() => {
		if (typeof matchMedia !== 'function') return;
		const q = matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (still = q.matches);
		sync();
		q.addEventListener('change', sync);
		return () => q.removeEventListener('change', sync);
	});

	// Rebuild whenever the frame or the clearing changes — and only then. The
	// scrub position is read untracked so a scroll can't drag the whole field
	// through a rebuild.
	$effect(() => {
		const el = canvas;
		const { w, h } = box;
		const g = gate;
		if (!el || !w || !h || !g) return;
		// Past 2 the extra resolution is invisible on a field of flat rectangles and
		// only costs fill rate.
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		el.width = Math.round(w * dpr);
		el.height = Math.round(h * dpr);
		build(w, h, g, dpr);
		untrack(() => paint(progress));
	});

	$effect(() => paint(progress));
</script>

<canvas bind:this={canvas} aria-hidden="true"></canvas>

<style>
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}

	/* A field of small cells is a lot of detail to resolve; drop its contrast
	   rather than its presence for anyone who'd rather have less. */
	@media (prefers-reduced-motion: reduce) {
		canvas {
			opacity: 0.6;
		}
	}
</style>
