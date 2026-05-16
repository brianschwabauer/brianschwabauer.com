import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { rebuildIndex, rebuildVectorIndex } from '$lib/server/searchIndex';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const POST: RequestHandler = async ({ platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	await Promise.all([rebuildIndex(platform.env.KV), rebuildVectorIndex(platform.env.KV)]);
	return json({ success: true });
};
