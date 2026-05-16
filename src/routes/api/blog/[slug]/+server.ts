import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deletePost, getPost, savePost } from '$lib/server/blog';
import { rebuildIndex, rebuildVectorIndex } from '$lib/server/searchIndex';
import { augmentWithAi } from '$lib/server/blogAi';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const GET: RequestHandler = async ({ params, platform, locals }) => {
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	const post = await getPost(platform.env.KV, params.slug);
	if (!post) throw error(404, 'Post not found');

	if (post.status !== 'published' && !isAdmin(locals)) {
		throw error(404, 'Post not found');
	}

	return json({ post });
};

export const PATCH: RequestHandler = async ({ params, request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	const existing = await getPost(platform.env.KV, params.slug);
	if (!existing) throw error(404, 'Post not found');

	const data = await request.json();
	const env = platform.env;
	const nextTitle = data.title ?? existing.title;
	const nextContent = data.content ?? existing.content;
	const userSummary = data.summary !== undefined ? data.summary : existing.summary;

	const { aiSummary, embedding, contentHash } = await augmentWithAi(env, {
		title: nextTitle,
		content: nextContent,
		userSummary,
		existing
	});

	const updated = await savePost(env.KV, {
		slug: existing.slug,
		title: nextTitle,
		content: nextContent,
		contentHtml: data.contentHtml ?? existing.contentHtml,
		summary: userSummary,
		aiSummary,
		category: data.category !== undefined ? data.category : existing.category,
		tags: Array.isArray(data.tags) ? data.tags : existing.tags,
		status: data.status ?? existing.status,
		contentHash,
		embedding
	});
	await Promise.all([rebuildIndex(env.KV), rebuildVectorIndex(env.KV)]);

	return json({ post: updated });
};

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	await deletePost(platform.env.KV, params.slug);
	await Promise.all([rebuildIndex(platform.env.KV), rebuildVectorIndex(platform.env.KV)]);
	return json({ success: true });
};
