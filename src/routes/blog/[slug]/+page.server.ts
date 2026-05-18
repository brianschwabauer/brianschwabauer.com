import type { PageServerLoad } from './$types';
import { getPost } from '$lib/server/blog';
import { renderDoc } from '$lib/server/renderDoc';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.KV) return { post: null, contentHtml: '' };
	const post = await getPost(platform.env.KV, params.slug);
	if (!post || post.status !== 'published') return { post: null, contentHtml: '' };
	// Pre-render the TipTap JSON to HTML on the server so the client just
	// {@html}s it. Cheap enough to run on every request (sub-ms for typical posts).
	const contentHtml = renderDoc(post.content);
	return { post, contentHtml };
};
