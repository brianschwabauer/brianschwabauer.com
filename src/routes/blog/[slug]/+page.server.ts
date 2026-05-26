import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPost } from '$lib/server/blog';
import { renderDoc } from '$lib/server/renderDoc';

export const load: PageServerLoad = async ({ params, platform, locals }) => {
	if (!platform?.env?.KV) return { post: null, contentHtml: '', isDraftPreview: false };
	const post = await getPost(platform.env.KV, params.slug);
	const isAdmin =
		(locals.session?.user as { role?: string } | undefined)?.role === 'admin';
	// Admins can preview drafts on the public page (the Edit Post button is
	// always reachable that way). For everyone else, a missing or unpublished
	// post is a 404 — that lets the smart-redirect hook in hooks.server.ts try
	// to map it to a legacy URL or fuzzy-match it to another post before the
	// 404 page renders.
	if (!post || (post.status !== 'published' && !isAdmin)) {
		throw error(404, 'Post Not Found');
	}
	// Pre-render the TipTap JSON to HTML on the server so the client just
	// {@html}s it. Cheap enough to run on every request (sub-ms for typical posts).
	const contentHtml = renderDoc(post.content);
	return { post, contentHtml, isDraftPreview: post.status !== 'published' };
};
