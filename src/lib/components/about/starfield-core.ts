// The starfield's star-making machinery, shared by the server (which builds
// the seeded opening field in +page.server.ts) and the client (which conjures
// clicked tiles and recycles drained ones). Deliberately free of any import of
// the 503-name image pool — the client pulls that in lazily, long after
// hydration, so 38KB of filenames stays out of the critical bundle.

export type Star = {
	id: number;
	src: string;
	x: number; // % across the hero — the tile's anchor / direction from centre
	y: number; // % down the hero
	w: number; // width factor (~0.7–1.5)
	ar: number; // the tile's own aspect ratio — see TILE_RATIOS
	rot: number; // flat in-plane rotation (deg) — no 3D skew
	drift: number; // seconds for one idle (unscrolled) pass through the tunnel
	spawned?: boolean; // conjured by a click rather than seeded
};

export const STAR_COUNT = 24;

/**
 * THE TILE OWNS ITS SHAPE — THE IMAGE DOES NOT.
 *
 * The box is declared up front and `object-fit: cover` fits the image to it.
 * The ratios are the three the pool is actually made of — a 502-image library
 * that is 4:3, 3:2 and 16:9 almost end to end (sampled: p25 1.47, median
 * 1.50, p75 1.78) — weighted the way the pool is, so most tiles get the ratio
 * their image already has and crop by nothing at all.
 */
const TILE_RATIOS = [4 / 3, 3 / 2, 3 / 2, 16 / 9] as const;

// deterministic PRNG (mulberry32) — the seeded field must be byte-identical
// on the server and in the hydrated client, and both sides get it from here.
export function mulberry32(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * A star factory bound to an image pool and the centre exclusion box (the
 * anchor buffers keep tiles off the headline — wider on mobile, where the
 * hero text is proportionally far larger).
 *
 * The pool is swappable: the client starts with just the two dozen names the
 * server dealt (so a tile recycled before the full pool arrives re-deals one
 * of those) and swaps in the full 503-name pool once its lazy chunk lands.
 */
export function createStarField(
	pool: readonly string[],
	anchor_buf_x: number,
	anchor_buf_y: number,
	first_id = 0,
) {
	let current_pool = pool;
	let star_id = first_id;

	// A shuffle-bag of image names: every image is dealt exactly once before
	// any repeat. When the bag empties it refills with the full pool minus
	// whatever is on screen, so no two tiles ever show the same image and
	// every image in the pool is guaranteed its turn.
	let bag: string[] = [];

	// A raw anchor that stays clear of the central column the headline owns.
	function randomAnchor(rand: () => number): { x: number; y: number } {
		let x = 4 + rand() * 92;
		let y = 6 + rand() * 88;
		for (let i = 0; i < 12; i++) {
			if (Math.abs(x - 50) > anchor_buf_x || Math.abs(y - 50) > anchor_buf_y) break;
			x = 4 + rand() * 92;
			y = 6 + rand() * 88;
		}
		return { x, y };
	}

	// Best-candidate sampling: try a handful of anchors and keep the one
	// sitting furthest from every other tile, so a new star drops into the
	// emptiest gap instead of piling onto its neighbours.
	function placeStar(rand: () => number, others: Star[]): { x: number; y: number } {
		let best = { x: 50, y: 50 };
		let best_dist = -1;
		for (let c = 0; c < 9; c++) {
			const cand = randomAnchor(rand);
			let nearest = Infinity;
			for (const o of others) {
				const dx = cand.x - o.x;
				const dy = cand.y - o.y;
				const d = dx * dx + dy * dy;
				if (d < nearest) nearest = d;
			}
			if (nearest > best_dist) {
				best_dist = nearest;
				best = cand;
			}
		}
		return best;
	}

	function drawImage(rand: () => number, on_screen: string[]): string {
		if (bag.length === 0) {
			bag = current_pool.filter((s) => !on_screen.includes(s));
			if (bag.length === 0) bag = current_pool.slice();
		}
		const idx = Math.floor(rand() * bag.length);
		return bag.splice(idx, 1)[0];
	}

	return {
		setPool(next: readonly string[]) {
			current_pool = next;
			bag = [];
		},
		makeStar(rand: () => number, others: Star[]): Star {
			const { x, y } = placeStar(rand, others);
			return {
				id: star_id++,
				src: drawImage(
					rand,
					others.map((o) => o.src),
				),
				x,
				y,
				w: 1.1 + rand() * 0.8,
				ar: TILE_RATIOS[Math.floor(rand() * TILE_RATIOS.length)],
				rot: (rand() - 0.5) * 22,
				drift: 15 + rand() * 13,
			};
		},
	};
}
