import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rebuildIndex, rebuildVectorIndex } from '$lib/server/searchIndex';
import { invalidateFuzzyCache } from '$lib/server/fuzzyRedirect';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const POST: RequestHandler = async ({ platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	await Promise.all([rebuildIndex(platform.env.KV), rebuildVectorIndex(platform.env.KV)]);
	// Drop the cached in-worker Orama instance used for 404 fuzzy redirects so
	// the next miss reads the freshly rebuilt index.
	invalidateFuzzyCache();
	return json({ success: true });
};
