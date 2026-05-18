import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listLatest, listAllAdmin, savePost, getPost, slugify } from '$lib/server/blog';
import { rebuildIndex, rebuildVectorIndex } from '$lib/server/searchIndex';
import { augmentWithAi } from '$lib/server/blogAi';
import type { TipTapDoc } from '$lib/server/renderDoc';
import type { ImageRecord } from '$lib/types/images';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const GET: RequestHandler = async ({ platform, locals, url }) => {
	if (!platform?.env?.KV) return json({ posts: [] });

	const includeUnpublished = url.searchParams.get('all') === 'true';
	if (includeUnpublished && !isAdmin(locals)) throw error(403, 'Unauthorized');

	const posts = includeUnpublished
		? await listAllAdmin(platform.env.KV)
		: await listLatest(platform.env.KV);
	return json({ posts });
};

interface CreateBody {
	title?: string;
	content?: TipTapDoc;
	contentText?: string;
	summary?: string | null;
	category?: string | null;
	tags?: unknown;
	status?: 'draft' | 'published';
	slug?: string;
	publishedAt?: number | null;
	featuredImage?: ImageRecord | null;
}

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	const data = (await request.json()) as CreateBody;
	const { title, content, contentText, summary, category, tags, status, slug, publishedAt } = data;

	if (!title || typeof title !== 'string') throw error(400, 'Title is required');
	if (!content || typeof content !== 'object') throw error(400, 'Content (JSON doc) is required');
	if (typeof contentText !== 'string') throw error(400, 'contentText is required');

	const env = platform.env;

	let explicitSlug: string | undefined;
	if (typeof slug === 'string' && slug.trim()) {
		explicitSlug = slugify(slug);
		if (!explicitSlug) throw error(400, 'Invalid slug');
		const conflict = await getPost(env.KV, explicitSlug);
		if (conflict) throw error(409, 'A post with this slug already exists');
	}

	const targetSlug = explicitSlug ?? slugify(title);
	const existing = targetSlug ? await getPost(env.KV, targetSlug) : null;

	try {
		const { aiSummary, embedding, contentHash } = await augmentWithAi(env, {
			title,
			content: contentText,
			userSummary: summary ?? null,
			existing
		});

		const post = await savePost(env.KV, {
			slug: explicitSlug,
			title,
			content,
			contentText,
			summary: summary || null,
			aiSummary,
			category: category || null,
			tags: Array.isArray(tags) ? tags.filter((t): t is string => typeof t === 'string') : [],
			status: status || 'draft',
			featuredImage: data.featuredImage ?? null,
			publishedAt:
				typeof publishedAt === 'number'
					? publishedAt
					: publishedAt === null
						? null
						: undefined,
			contentHash,
			embedding
		});
		await Promise.all([rebuildIndex(env.KV), rebuildVectorIndex(env.KV)]);
		return json({ post });
	} catch (err) {
		console.error('Failed to create blog post:', err);
		throw error(500, 'Failed to create post');
	}
};
