export const EMBEDDING_DIM = 768;

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

export type SearchEntryType = 'blog' | 'home';

export interface SearchEntry {
	id: string;
	type: SearchEntryType;
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

export function categoryLabel(entry: { type: SearchEntryType; category: string }): string {
	if (entry.type === 'blog') return 'Blog Post';
	if (!entry.category) return 'Page';
	return entry.category;
}
