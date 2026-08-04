import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	deletePost,
	getPost,
	renamePost,
	savePost,
	slugify,
	SlugConflictError,
} from '$lib/server/blog';
import { rebuildIndex, rebuildVectorIndex } from '$lib/server/searchIndex';
import { invalidateFuzzyCache } from '$lib/server/fuzzyRedirect';
import { refreshAdminTags } from '$lib/server/adminData';
import { finishSaveInBackground } from '$lib/server/blogAi';
import { addRedirect } from '$lib/server/redirects';
import type { TipTapDoc } from '$lib/server/renderDoc';
import type { ImageRecord } from '$lib/types/images';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

interface UpdateBody {
	title?: string;
	content?: TipTapDoc;
	contentText?: string;
	summary?: string | null;
	teaser?: string | null;
	tags?: unknown;
	status?: 'draft' | 'published' | 'archived';
	slug?: string;
	/** Optimistic-concurrency token: the `updatedAt` the client last saw.
	    A mismatch means the post changed elsewhere (another tab) → 409. */
	expectedUpdatedAt?: number;
	publishedAt?: number | null;
	featuredImage?: ImageRecord | null;
	coverFocalX?: number;
	coverFocalY?: number;
	pinned?: boolean;
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

	const data = (await request.json()) as UpdateBody;
	const env = platform.env;

	if (
		typeof data.expectedUpdatedAt === 'number' &&
		data.expectedUpdatedAt !== existing.updatedAt
	) {
		throw error(
			409,
			'This post was changed elsewhere (another tab?). Reload to get the latest version.',
		);
	}

	const nextTitle = data.title ?? existing.title;
	const nextContent = data.content ?? existing.content;
	const nextContentText = data.contentText ?? existing.contentText;
	const userSummary = data.summary !== undefined ? data.summary : existing.summary;

	let workingSlug = existing.slug;
	if (typeof data.slug === 'string') {
		const requested = slugify(data.slug);
		if (!requested) throw error(400, 'Invalid slug');
		if (requested !== existing.slug) {
			try {
				const renamed = await renamePost(env.KV, existing.slug, requested);
				if (!renamed) throw error(404, 'Post not found');
				workingSlug = requested;
				// The old URL is public once the post has been published — keep it
				// resolving instead of 404ing.
				if (existing.status === 'published') {
					await addRedirect(
						env.KV,
						`/blog/${existing.slug}`,
						`/blog/${requested}`,
						'auto: post slug renamed',
					);
				}
			} catch (err) {
				if (err instanceof SlugConflictError) {
					throw error(409, 'A post with this slug already exists');
				}
				throw err;
			}
		}
	}

	const updated = await savePost(env.KV, {
		slug: workingSlug,
		title: nextTitle,
		content: nextContent,
		contentText: nextContentText,
		summary: userSummary,
		teaser: data.teaser === undefined ? existing.teaser : data.teaser,
		tags: Array.isArray(data.tags)
			? data.tags.filter((t): t is string => typeof t === 'string')
			: existing.tags,
		status: data.status ?? existing.status,
		featuredImage:
			data.featuredImage === undefined ? existing.featuredImage : data.featuredImage,
		coverFocalX: data.coverFocalX === undefined ? existing.coverFocalX : data.coverFocalX,
		coverFocalY: data.coverFocalY === undefined ? existing.coverFocalY : data.coverFocalY,
		pinned: data.pinned === undefined ? existing.pinned : data.pinned,
		publishedAt:
			data.publishedAt === undefined
				? undefined
				: typeof data.publishedAt === 'number'
					? data.publishedAt
					: data.publishedAt === null
						? null
						: undefined,
	});
	finishSaveInBackground(platform, updated, userSummary);

	return json({ post: updated });
};

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	if (!platform?.env?.KV) throw error(500, 'KV not available');

	await deletePost(platform.env.KV, params.slug);
	const kv = platform.env.KV;
	platform.context?.waitUntil(
		(async () => {
			try {
				await Promise.all([
					rebuildIndex(kv),
					rebuildVectorIndex(kv),
					refreshAdminTags(kv),
				]);
				invalidateFuzzyCache();
			} catch (err) {
				console.error('Background post-delete work failed:', err);
			}
		})(),
	);
	return json({ success: true });
};
