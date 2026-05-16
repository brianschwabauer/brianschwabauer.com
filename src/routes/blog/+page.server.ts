import type { PageServerLoad } from './$types';
import { listLatest } from '$lib/server/blog';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.KV) return { posts: [] };
	const posts = await listLatest(platform.env.KV);
	return { posts };
};
