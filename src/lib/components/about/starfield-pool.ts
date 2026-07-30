// The full starfield image pool with oversized originals swapped for their
// 640px '-thumb.avif' siblings (tiles render at ≤ ~250px + perspective, so
// the thumb is visually identical and up to 60× smaller — the 4MB screen
// recordings were arriving in full for a 130px tile).
//
// This module is ONLY imported dynamically: the server pulls it in for the
// seeded build (server bundles don't mind), and the client fetches it during
// idle time for tile recycling — it must never end up in the initial chunk.
import { STARFIELD_IMAGES } from './starfield-images';
import { STARFIELD_THUMBS } from './starfield-thumbs';

export function thumbSrc(name: string): string {
	// the thumb replaces whatever extension the original has (.avif, .jpg,
	// .png, .webp) — it is always an avif
	return STARFIELD_THUMBS.has(name) ? name.replace(/\.[a-z0-9]+$/i, '-thumb.avif') : name;
}

export const STARFIELD_POOL: readonly string[] = STARFIELD_IMAGES.map(thumbSrc);
