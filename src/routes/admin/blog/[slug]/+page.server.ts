import type { PageServerLoad } from './$types';
import { getPost } from '$lib/server/blog';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.KV) return { post: null };
	const post = await getPost(platform.env.KV, params.slug);
	return { post: post ?? null };
};
