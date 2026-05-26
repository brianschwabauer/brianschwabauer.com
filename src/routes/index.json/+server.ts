import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readPersistedIndex, rebuildIndex } from '$lib/server/searchIndex';

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	let persisted = await readPersistedIndex(platform.env.KV);
	if (!persisted) {
		await rebuildIndex(platform.env.KV);
		persisted = await readPersistedIndex(platform.env.KV);
	}

	return new Response(persisted ?? '{}', {
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=60, s-maxage=300',
		},
	});
};
