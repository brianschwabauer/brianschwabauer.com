import type { KVNamespace } from '@cloudflare/workers-types';
import { create, insertMultiple } from '@orama/orama';
import { persist, restore } from '@orama/plugin-data-persistence';
import { listAllPublished, type BlogPost, type BlogPostMeta } from './blog';
import { EMBEDDING_DIM } from './embeddings';

const INDEX_KEY = '/index.json';
const VECTOR_INDEX_KEY = '/index-vectors.json';

export const indexSchema = {
	id: 'string',
	type: 'string',
	title: 'string',
	summary: 'string',
	body: 'string',
	category: 'string',
	tags: 'string[]',
	date: 'number',
	url: 'string'
} as const;

export const vectorIndexSchema = {
	id: 'string',
	type: 'string',
	title: 'string',
	summary: 'string',
	category: 'string',
	tags: 'string[]',
	date: 'number',
	url: 'string',
	embedding: `vector[${EMBEDDING_DIM}]`
} as const;

export interface SearchEntry {
	id: string;
	type: 'blog' | 'home';
	title: string;
	summary: string;
	body: string;
	category: string;
	tags: string[];
	date: number;
	url: string;
}

export interface VectorSearchEntry {
	id: string;
	type: 'blog';
	title: string;
	summary: string;
	category: string;
	tags: string[];
	date: number;
	url: string;
	embedding: number[];
}

function stripHtml(html: string): string {
	return html
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function blogEntry(post: BlogPost | (BlogPostMeta & { content?: string; contentHtml?: string })): SearchEntry {
	const body =
		'contentHtml' in post && post.contentHtml
			? stripHtml(post.contentHtml)
			: 'content' in post && post.content
				? post.content
				: '';
	return {
		id: `blog:${post.slug}`,
		type: 'blog',
		title: post.title,
		summary: post.summary ?? post.aiSummary ?? '',
		body,
		category: post.category ?? '',
		tags: post.tags,
		date: post.publishedAt ?? post.createdAt,
		url: `/blog/${post.slug}`
	};
}

const HOME_SECTIONS: SearchEntry[] = [
	{ id: 'home:hero', type: 'home', title: 'Today', summary: 'The current chapter — what I am working on right now.', body: '', category: 'About', tags: ['intro', 'today'], date: Date.now(), url: '/#hero' },
	{ id: 'home:what-im-up-to', type: 'home', title: "What I'm up to", summary: "What I'm building, learning, and shipping right now.", body: '', category: 'About', tags: ['current'], date: Date.now(), url: '/#what-im-up-to' },
	{ id: 'home:humble-beginnings', type: 'home', title: 'Humble Beginnings', summary: 'A miniDV camera, a bedroom green screen, and a friend named Kevin.', body: '', category: 'Film', tags: ['film', '2006'], date: new Date('2006-01-01').getTime(), url: '/#humble-beginnings' },
	{ id: 'home:green-screen', type: 'home', title: 'Green Screen', summary: 'Painting a wall green and learning compositing.', body: '', category: 'Film', tags: ['film', 'vfx', '2007'], date: new Date('2007-01-01').getTime(), url: '/#green-screen' },
	{ id: 'home:power-rangers', type: 'home', title: 'Power Rangers', summary: 'Backyard fight choreography, costumes, and the Power Rangers fan film phase.', body: '', category: 'Film', tags: ['film', 'fan-film', '2008'], date: new Date('2008-01-01').getTime(), url: '/#power-rangers' },
	{ id: 'home:taking-it-seriously', type: 'home', title: 'First Websites', summary: 'The first websites — taking the work seriously.', body: '', category: 'Web', tags: ['web', '2009'], date: new Date('2009-01-01').getTime(), url: '/#taking-it-seriously' },
	{ id: 'home:music-videos', type: 'home', title: 'Music Videos', summary: 'Shooting and editing music videos.', body: '', category: 'Film', tags: ['film', 'music-video', '2010'], date: new Date('2010-01-01').getTime(), url: '/#music-videos' },
	{ id: 'home:animation', type: 'home', title: 'Animation & VFX', summary: 'Compositing, motion graphics, and visual effects.', body: '', category: 'Film', tags: ['animation', 'vfx', '2011'], date: new Date('2011-01-01').getTime(), url: '/#animation' },
	{ id: 'home:festivals-ksms', type: 'home', title: 'Festivals & KSMS', summary: 'Film festivals and Kalamazoo School for the Arts.', body: '', category: 'Film', tags: ['film', 'festival', '2011'], date: new Date('2011-06-01').getTime(), url: '/#festivals-ksms' },
	{ id: 'home:spunksters', type: 'home', title: 'The Spunksters', summary: 'The Spunksters — short films and creative experiments.', body: '', category: 'Film', tags: ['film', '2013'], date: new Date('2013-01-01').getTime(), url: '/#spunksters' },
	{ id: 'home:college', type: 'home', title: 'College', summary: 'College years — film school and finding my voice.', body: '', category: 'About', tags: ['college', '2014'], date: new Date('2014-01-01').getTime(), url: '/#college' },
	{ id: 'home:what-makes-us-human', type: 'home', title: 'Senior Thesis: What Makes Us Human', summary: 'Senior thesis film — what makes us human.', body: '', category: 'Film', tags: ['film', 'thesis', '2015'], date: new Date('2015-01-01').getTime(), url: '/#what-makes-us-human' },
	{ id: 'home:freelancer', type: 'home', title: 'Freelancer', summary: 'Freelance work — film, web, and design.', body: '', category: 'Work', tags: ['freelance', '2017'], date: new Date('2017-01-01').getTime(), url: '/#freelancer' },
	{ id: 'home:entrepreneurship', type: 'home', title: 'Entrepreneurship', summary: 'Starting things — the entrepreneurial chapter.', body: '', category: 'Work', tags: ['startup', '2019'], date: new Date('2019-01-01').getTime(), url: '/#entrepreneurship' },
	{ id: 'home:showandtour', type: 'home', title: 'Show&Tour', summary: 'Building Show&Tour — the company.', body: '', category: 'Work', tags: ['showandtour', 'startup', '2024'], date: new Date('2024-01-01').getTime(), url: '/#showandtour' },
	{ id: 'home:side-projects', type: 'home', title: 'Side Projects', summary: 'Side projects and personal experiments.', body: '', category: 'Work', tags: ['side-projects', '2026'], date: new Date('2026-01-01').getTime(), url: '/#side-projects' }
];

async function loadFullPosts(kv: KVNamespace): Promise<BlogPost[]> {
	const metas = await listAllPublished(kv);
	const fulls = await Promise.all(
		metas.map((m) => kv.get(`/blog/${m.slug}.json`, 'json') as Promise<BlogPost | null>)
	);
	return fulls.filter((p): p is BlogPost => p !== null);
}

export async function rebuildIndex(kv: KVNamespace): Promise<void> {
	const db = create({ schema: indexSchema });
	const posts = await loadFullPosts(kv);
	const entries: SearchEntry[] = [...posts.map(blogEntry), ...HOME_SECTIONS];
	if (entries.length > 0) {
		await insertMultiple(db, entries as unknown as Record<string, unknown>[]);
	}
	const persisted = await persist(db, 'json');
	await kv.put(INDEX_KEY, persisted as string);
}

export async function rebuildVectorIndex(kv: KVNamespace): Promise<void> {
	const db = create({ schema: vectorIndexSchema });
	const posts = await loadFullPosts(kv);
	const entries: VectorSearchEntry[] = posts
		.filter((p) => p.embedding && p.embedding.length === EMBEDDING_DIM)
		.map((p) => ({
			id: `blog:${p.slug}`,
			type: 'blog',
			title: p.title,
			summary: p.summary ?? p.aiSummary ?? '',
			category: p.category ?? '',
			tags: p.tags,
			date: p.publishedAt ?? p.createdAt,
			url: `/blog/${p.slug}`,
			embedding: p.embedding as number[]
		}));
	if (entries.length > 0) {
		await insertMultiple(db, entries as unknown as Record<string, unknown>[]);
	}
	const persisted = await persist(db, 'json');
	await kv.put(VECTOR_INDEX_KEY, persisted as string);
}

export async function readPersistedIndex(kv: KVNamespace): Promise<string | null> {
	return kv.get(INDEX_KEY);
}

export async function readPersistedVectorIndex(kv: KVNamespace): Promise<string | null> {
	return kv.get(VECTOR_INDEX_KEY);
}

export { restore };
