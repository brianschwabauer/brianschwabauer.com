import { createAuth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const authHandle: Handle = async ({ event, resolve }) => {
	// Skip auth for static assets
	if (event.url.pathname.startsWith('/_app') || event.url.pathname.startsWith('/favicon') || event.url.pathname.startsWith('/brandmark') || event.url.pathname.startsWith('/logo')) {
		return resolve(event);
	}

	try {
		const auth = createAuth(event.platform);
		const authHandler = auth.handle;
		return authHandler({ event, resolve });
	} catch (error) {
		// If auth fails (e.g., no DB), continue without auth
		console.error('Auth initialization failed:', error);
		event.locals.session = null;
		return resolve(event);
	}
};

const sessionHandle: Handle = async ({ event, resolve }) => {
	// Populate session in locals for easy access
	try {
		const auth = createAuth(event.platform);
		const session = await auth.auth();
		event.locals.session = session;
	} catch {
		event.locals.session = null;
	}
	return resolve(event);
};

export const handle = sequence(authHandle, sessionHandle);
