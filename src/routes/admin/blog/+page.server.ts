import type { PageServerLoad } from './$types';
import { listAllAdmin } from '$lib/server/blog';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.KV) return { posts: [] };
	const posts = await listAllAdmin(platform.env.KV);
	return { posts };
};
