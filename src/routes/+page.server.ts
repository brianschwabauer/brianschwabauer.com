import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request, url }) => {
	const signedIn = Boolean(locals.session?.user);
	// A shared `?cut=director` link has to render expanded from the server, so
	// the choice is read here rather than only on the client.
	const cut = url.searchParams.get('cut');
	// Detect a phone from the User-Agent so the starfield seed can be placed
	// with the mobile exclusion zone on the server itself — a client-side
	// viewport check would differ from the server and break hydration.
	const isMobile = /Mobi/i.test(request.headers.get('user-agent') ?? '');
	return { signedIn, isMobile, cut };
};
