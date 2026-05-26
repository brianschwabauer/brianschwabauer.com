import type { KVNamespace } from '@cloudflare/workers-types';
import type { TipTapDoc } from './renderDoc';
import type { ImageRecord } from '$lib/types/images';
import { normalizeTagList } from '$lib/utils/tags';

const LATEST_INDEX_KEY = '/blog.json';
const ALL_INDEX_KEY = '/blog/all.json';
const LATEST_LIMIT = 100;

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface BlogPost {
	slug: string;
	title: string;
	summary: string | null;
	aiSummary: string | null;
	/** Plain-text extract of `content` — used by search + AI summary. */
	contentText: string;
	/** TipTap JSON document — the source of truth for the post body. */
	content: TipTapDoc;
	tags: string[];
	status: BlogStatus;
	featuredImage: ImageRecord | null;
	/** Horizontal focal point (0–100 %) for the 2.35:1 cover crop. Default 50. */
	coverFocalX: number;
	/** Vertical focal point (0–100 %) for the 2.35:1 cover crop. Default 50. */
	coverFocalY: number;
	pinned: boolean;
	publishedAt: number | null;
	createdAt: number;
	updatedAt: number;
	contentHash: string | null;
	embedding: number[] | null;
}

export interface BlogPostMeta {
	slug: string;
	title: string;
	summary: string | null;
	aiSummary: string | null;
	tags: string[];
	status: BlogStatus;
	featuredImage: ImageRecord | null;
	coverFocalX: number;
	coverFocalY: number;
	pinned: boolean;
	publishedAt: number | null;
	createdAt: number;
	updatedAt: number;
}

export interface BlogIndex {
	updatedAt: number;
	posts: BlogPostMeta[];
}

const postKey = (slug: string) => `/blog/${slug}.json`;

export function slugify(input: string): string {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.substring(0, 100);
}

function toMeta(post: BlogPost): BlogPostMeta {
	return {
		slug: post.slug,
		title: post.title,
		summary: post.summary ?? post.aiSummary,
		aiSummary: post.aiSummary,
		tags: post.tags,
		status: post.status,
		featuredImage: post.featuredImage,
		coverFocalX: post.coverFocalX,
		coverFocalY: post.coverFocalY,
		pinned: post.pinned ?? false,
		publishedAt: post.publishedAt,
		createdAt: post.createdAt,
		updatedAt: post.updatedAt,
	};
}

function clampFocal(value: unknown, fallback: number): number {
	const n = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
	return Math.min(100, Math.max(0, n));
}

export async function getPost(kv: KVNamespace, slug: string): Promise<BlogPost | null> {
	const raw = await kv.get(postKey(slug), 'json');
	return (raw as BlogPost | null) ?? null;
}

async function readIndex(kv: KVNamespace, key: string): Promise<BlogIndex> {
	const raw = (await kv.get(key, 'json')) as BlogIndex | null;
	if (raw && Array.isArray(raw.posts)) return raw;
	return { updatedAt: 0, posts: [] };
}

export async function listLatest(kv: KVNamespace): Promise<BlogPostMeta[]> {
	const index = await readIndex(kv, LATEST_INDEX_KEY);
	return index.posts.filter((p) => p.status === 'published');
}

export async function listAllAdmin(kv: KVNamespace): Promise<BlogPostMeta[]> {
	const index = await readIndex(kv, ALL_INDEX_KEY);
	return index.posts;
}

export async function listAllPublished(kv: KVNamespace): Promise<BlogPostMeta[]> {
	const index = await readIndex(kv, ALL_INDEX_KEY);
	return index.posts.filter((p) => p.status === 'published');
}

function sortPosts(posts: BlogPostMeta[]): BlogPostMeta[] {
	return [...posts].sort((a, b) => {
		const aDate = a.publishedAt ?? a.createdAt;
		const bDate = b.publishedAt ?? b.createdAt;
		return bDate - aDate;
	});
}

async function writeIndexes(kv: KVNamespace, allPosts: BlogPostMeta[]): Promise<void> {
	const sorted = sortPosts(allPosts);
	const updatedAt = Date.now();
	const allIndex: BlogIndex = { updatedAt, posts: sorted };
	const latestIndex: BlogIndex = {
		updatedAt,
		posts: sorted.filter((p) => p.status === 'published').slice(0, LATEST_LIMIT),
	};
	await Promise.all([
		kv.put(ALL_INDEX_KEY, JSON.stringify(allIndex)),
		kv.put(LATEST_INDEX_KEY, JSON.stringify(latestIndex)),
	]);
}

export interface SavePostInput {
	slug?: string;
	title: string;
	content: TipTapDoc;
	contentText: string;
	summary?: string | null;
	aiSummary?: string | null;
	tags?: string[];
	status?: BlogStatus;
	featuredImage?: ImageRecord | null;
	coverFocalX?: number;
	coverFocalY?: number;
	pinned?: boolean;
	publishedAt?: number | null;
	contentHash?: string | null;
	embedding?: number[] | null;
}

export async function savePost(kv: KVNamespace, input: SavePostInput): Promise<BlogPost> {
	const desiredSlug = input.slug ? slugify(input.slug) : slugify(input.title);
	if (!desiredSlug) throw new Error('Unable to derive slug from title');

	const existing = await getPost(kv, desiredSlug);
	let finalSlug = desiredSlug;
	if (!input.slug && existing) {
		finalSlug = `${desiredSlug}-${Date.now()}`;
	}

	const now = Date.now();
	const status = input.status ?? existing?.status ?? 'draft';
	const post: BlogPost = {
		slug: finalSlug,
		title: input.title,
		summary: input.summary ?? existing?.summary ?? null,
		aiSummary: input.aiSummary ?? existing?.aiSummary ?? null,
		contentText: input.contentText,
		content: input.content,
		tags: normalizeTagList(input.tags ?? existing?.tags ?? []),
		status,
		featuredImage:
			input.featuredImage === undefined
				? (existing?.featuredImage ?? null)
				: input.featuredImage,
		coverFocalX: clampFocal(input.coverFocalX, existing?.coverFocalX ?? 50),
		coverFocalY: clampFocal(input.coverFocalY, existing?.coverFocalY ?? 50),
		pinned: input.pinned ?? existing?.pinned ?? false,
		publishedAt:
			input.publishedAt !== undefined
				? input.publishedAt
				: status === 'published'
					? (existing?.publishedAt ?? now)
					: (existing?.publishedAt ?? null),
		createdAt: existing?.createdAt ?? now,
		updatedAt: now,
		contentHash: input.contentHash ?? existing?.contentHash ?? null,
		embedding: input.embedding ?? existing?.embedding ?? null,
	};

	await kv.put(postKey(finalSlug), JSON.stringify(post));

	const allIndex = await readIndex(kv, ALL_INDEX_KEY);
	const others = allIndex.posts.filter((p) => p.slug !== finalSlug);
	await writeIndexes(kv, [...others, toMeta(post)]);

	return post;
}

export async function deletePost(kv: KVNamespace, slug: string): Promise<void> {
	await kv.delete(postKey(slug));
	const allIndex = await readIndex(kv, ALL_INDEX_KEY);
	const remaining = allIndex.posts.filter((p) => p.slug !== slug);
	await writeIndexes(kv, remaining);
}

export class SlugConflictError extends Error {
	constructor(slug: string) {
		super(`A post with slug "${slug}" already exists`);
		this.name = 'SlugConflictError';
	}
}

export async function renamePost(
	kv: KVNamespace,
	oldSlug: string,
	newSlug: string,
): Promise<BlogPost | null> {
	if (oldSlug === newSlug) return getPost(kv, oldSlug);

	const post = await getPost(kv, oldSlug);
	if (!post) return null;

	const conflict = await getPost(kv, newSlug);
	if (conflict) throw new SlugConflictError(newSlug);

	const renamed: BlogPost = { ...post, slug: newSlug, updatedAt: Date.now() };
	await kv.put(postKey(newSlug), JSON.stringify(renamed));
	await kv.delete(postKey(oldSlug));

	const allIndex = await readIndex(kv, ALL_INDEX_KEY);
	const others = allIndex.posts.filter((p) => p.slug !== oldSlug && p.slug !== newSlug);
	await writeIndexes(kv, [...others, toMeta(renamed)]);

	return renamed;
}
