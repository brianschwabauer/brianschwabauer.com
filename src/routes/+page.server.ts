import type { PageServerLoad } from './$types';
import { buildSeededField } from '$lib/components/about/starfield-build';

export const load: PageServerLoad = async ({ locals, request }) => {
	const signedIn = Boolean(locals.session?.user);
	// Detect a phone from the User-Agent so the starfield seed can be placed
	// with the mobile exclusion zone on the server itself — a client-side
	// viewport check would differ from the server and break hydration.
	const isMobile = /Mobi/i.test(request.headers.get('user-agent') ?? '');
	// The starfield seed. Derived from the CLOCK, not Math.random(): a random
	// per-request seed made every HTML response unique, which is exactly the
	// thing that keeps a page out of any cache. Bucketing to the hour keeps the
	// photos rotating visit-to-visit while letting identical HTML be served
	// within the window. (Hashed so consecutive buckets don't deal similar
	// fields — mulberry32 downstream is sensitive to low-entropy seeds.)
	const bucket = Math.floor(Date.now() / 3_600_000);
	const starSeed = (Math.imul(bucket ^ 0x5742_2026, 0x9e3779b9) ^ (bucket >>> 3)) >>> 0;
	// The whole seeded field (placement, images, shapes, tilts, warp positions)
	// is built HERE and shipped in the load data. The client hydrates from the
	// finished stars — it never re-derives them, so the 503-name image pool
	// stays out of the initial client bundle entirely.
	const starField = buildSeededField(starSeed, isMobile);
	return { signedIn, isMobile, starField };
};
