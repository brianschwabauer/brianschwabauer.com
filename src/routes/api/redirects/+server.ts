import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadRedirects, saveRedirects, type RedirectMap } from '$lib/server/redirects';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const GET: RequestHandler = async ({ platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');
	const file = await loadRedirects(platform.env.KV);
	return json(file);
};

/**
 * Replaces the redirect map wholesale. The admin UI always sends the full
 * desired map — the map is tiny so diffing/patching isn't worth the
 * complexity.
 */
export const PUT: RequestHandler = async ({ platform, request, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	let body: { redirects?: unknown };
	try {
		body = (await request.json()) as { redirects?: unknown };
	} catch {
		throw error(400, 'Invalid JSON body');
	}
	if (!body || typeof body.redirects !== 'object' || body.redirects === null) {
		throw error(400, 'Body must be { redirects: { ... } }');
	}

	const file = await saveRedirects(platform.env.KV, body.redirects as RedirectMap);
	return json(file);
};
