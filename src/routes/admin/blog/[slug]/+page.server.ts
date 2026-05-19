import type { PageServerLoad } from './$types';
import { getPost } from '$lib/server/blog';
import { renderDoc } from '$lib/server/renderDoc';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.KV) return { post: null, contentHtml: '' };
	const post = await getPost(platform.env.KV, params.slug);
	if (!post) return { post: null, contentHtml: '' };
	// Pre-render the TipTap doc to HTML so the editor mount point isn't blank
	// before TipTap hydrates — the static markup is replaced when the editor
	// initializes in onMount.
	const contentHtml = renderDoc(post.content);
	return { post, contentHtml };
};
