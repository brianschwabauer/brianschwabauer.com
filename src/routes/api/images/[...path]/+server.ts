import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { forwardToImageWorker } from '$lib/server/imageProxy';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const GET: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forwardToImageWorker(request, platform);
};

export const PATCH: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forwardToImageWorker(request, platform);
};

export const DELETE: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forwardToImageWorker(request, platform);
};
