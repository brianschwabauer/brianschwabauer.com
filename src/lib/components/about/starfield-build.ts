// Server-side construction of the seeded opening starfield. Runs in
// +page.server.ts so the 503-name pool never has to ship to the client just
// to deal the 24 opening tiles — the client receives the finished stars in
// the load data and hydrates from them byte-identically.
import { createStarField, mulberry32, STAR_COUNT, type Star } from './starfield-core';
import { STARFIELD_POOL } from './starfield-pool';

export type SeededField = { stars: Star[]; u: number[] };

export function buildSeededField(seed: number, is_mobile: boolean): SeededField {
	// Centre exclusion half-extents (% from centre): an anchor landing inside
	// this box is re-rolled, keeping tiles off the headline. Mobile widens the
	// box — the hero text is proportionally far larger there. These MUST match
	// the buffers Hero.svelte uses for click-conjured tiles.
	const anchor_buf_x = is_mobile ? 38 : 23;
	const anchor_buf_y = is_mobile ? 36 : 34;
	const field = createStarField(STARFIELD_POOL, anchor_buf_x, anchor_buf_y);
	const rand = mulberry32(seed);
	const stars: Star[] = [];
	const u: number[] = [];
	for (let i = 0; i < STAR_COUNT; i++) {
		stars.push(field.makeStar(rand, stars));
		u.push(rand());
	}
	return { stars, u };
}
