import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
	const signedIn = Boolean(locals.session?.user);
	// Detect a phone from the User-Agent so the starfield seed can be placed
	// with the mobile exclusion zone on the server itself — a client-side
	// viewport check would differ from the server and break hydration.
	const isMobile = /Mobi/i.test(request.headers.get('user-agent') ?? '');
	// A fresh starfield every visit. Rolled HERE, on the server, and shipped in
	// the load data so the client hydrates from the identical number — the whole
	// seeded field (placement, images, shapes, tilts, warp positions) is derived
	// from it, so a seed that differed by one between server and client would
	// rebuild all 24 tiles somewhere else the moment the page hydrated.
	const starSeed = Math.floor(Math.random() * 0x1_0000_0000);
	return { signedIn, isMobile, starSeed };
};
