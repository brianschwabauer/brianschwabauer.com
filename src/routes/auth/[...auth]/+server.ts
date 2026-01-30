import { createAuth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const auth = createAuth(event.platform);
	return auth.handle(event);
};

export const POST: RequestHandler = async (event) => {
	const auth = createAuth(event.platform);
	return auth.handle(event);
};
