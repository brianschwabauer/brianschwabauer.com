import type { ImageRecord } from '$lib/types/images';

export const EMBEDDING_DIM = 768;

export const indexSchema = {
	id: 'string',
	type: 'string',
	title: 'string',
	summary: 'string',
	body: 'string',
	tags: 'string[]',
	date: 'number',
	url: 'string',
} as const;

export const vectorIndexSchema = {
	id: 'string',
	type: 'string',
	title: 'string',
	summary: 'string',
	tags: 'string[]',
	date: 'number',
	url: 'string',
	embedding: `vector[${EMBEDDING_DIM}]`,
} as const;

export type SearchEntryType = 'blog' | 'home';

export interface SearchEntry {
	id: string;
	type: SearchEntryType;
	title: string;
	summary: string;
	body: string;
	tags: string[];
	date: number;
	url: string;
	featuredImage?: ImageRecord | null;
	/** Plain image URL — used by home sections that aren't backed by an ImageRecord. */
	imageUrl?: string;
}

export interface VectorSearchEntry {
	id: string;
	type: 'blog';
	title: string;
	summary: string;
	tags: string[];
	date: number;
	url: string;
	embedding: number[];
	featuredImage?: ImageRecord | null;
}

/** Short label shown above the title in a search result. */
export function entryLabel(entry: { type: SearchEntryType; tags?: string[] }): string {
	if (entry.type === 'blog') return 'Blog Post';
	if (entry.tags && entry.tags.length > 0) return entry.tags[0];
	return 'Page';
}
