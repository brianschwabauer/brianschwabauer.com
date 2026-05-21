/**
 * Proxy /api/images requests to the brianschwabauer-images worker via the
 * IMAGE_PROCESSOR service binding. All real logic (R2 reads/writes, container
 * invocation) lives in image-worker/src/index.ts. In local dev this endpoint
 * is bypassed by vite's HTTP proxy (see vite.config.ts).
 */
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

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forwardToImageWorker(request, platform);
};
