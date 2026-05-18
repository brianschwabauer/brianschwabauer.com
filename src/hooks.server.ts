import { createAuth } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// IMAGE_PROCESSOR is a service binding to the brianschwabauer-images worker
// (see wrangler.toml + wrangler.images.toml). The actual ImageProcessorContainer
// DO lives in that separate worker, so the main worker never imports the
// `cloudflare:workers` module — keeping Vite's SSR build clean.

const authHandle: Handle = async ({ event, resolve }) => {
	if (
		event.url.pathname.startsWith('/_app') ||
		event.url.pathname.startsWith('/favicon') ||
		event.url.pathname.startsWith('/brandmark') ||
		event.url.pathname.startsWith('/logo')
	) {
		return resolve(event);
	}

	try {
		const { handle } = createAuth(event.platform);
		return handle({ event, resolve });
	} catch (error) {
		console.error('Auth initialization failed:', error);
		event.locals.session = null;
		return resolve(event);
	}
};

const sessionHandle: Handle = async ({ event, resolve }) => {
	try {
		event.locals.session = (await event.locals.auth?.()) ?? null;
	} catch {
		event.locals.session = null;
	}
	return resolve(event);
};

export const handle = sequence(authHandle, sessionHandle);
