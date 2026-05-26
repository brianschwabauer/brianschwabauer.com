import { create, load, search, type AnyOrama, type Results } from '@orama/orama';
import type { KVNamespace } from '@cloudflare/workers-types';
import { indexSchema, type SearchEntry } from '$lib/search';
import { readPersistedIndex, rebuildIndex } from './searchIndex';

/**
 * Smart 404 fallback: take the unmatched pathname, treat its slug as a search
 * query, and surface the best Orama match — but only redirect when the top
 * hit is clearly the right answer. Anything ambiguous falls through to the
 * 404 page (which itself shows these same hits as suggestions).
 *
 * Threshold rule of thumb:
 *   - Need at least one hit.
 *   - If there's a runner-up, the top must beat it by `RELATIVE_GAP`× —
 *     otherwise the redirect would feel arbitrary ("why this post and not
 *     that one?").
 *   - An absolute floor on the top score guards against weak-signal matches
 *     on very short queries.
 *
 * The redirect issued is always 302 (temporary): the public slug we're
 * matching might one day legitimately exist as a real route.
 */

// Module-scoped cache. Persists for the V8 isolate lifetime (minutes to
// hours). The persisted Orama JSON in KV is itself edge-cached, so even a
// cache miss here is cheap.
let cachedDb: AnyOrama | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Force a cache invalidation — call after the search index is rebuilt. */
export function invalidateFuzzyCache(): void {
	cachedDb = null;
	cachedAt = 0;
}

async function getIndex(kv: KVNamespace): Promise<AnyOrama | null> {
	const now = Date.now();
	if (cachedDb && now - cachedAt < CACHE_TTL_MS) return cachedDb;
	let persisted = await readPersistedIndex(kv);
	if (!persisted) {
		await rebuildIndex(kv);
		persisted = await readPersistedIndex(kv);
	}
	if (!persisted) return null;
	const db = create({ schema: indexSchema });
	load(db, JSON.parse(persisted));
	cachedDb = db;
	cachedAt = now;
	return db;
}

/**
 * Turn `/blog/some_old-post.html` into the search query "blog some old post".
 * Lowercases, splits on slashes/dashes/underscores, drops any file extension.
 */
export function pathToQuery(pathname: string): string {
	const stripped = pathname.replace(/^\/+|\/+$/g, '');
	if (!stripped) return '';
	return stripped
		.replace(/\.[a-z0-9]{2,5}$/i, '')
		.replace(/[\/\-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

export interface FuzzyResult {
	/** Target URL — only set if the top hit cleared the confidence threshold. */
	url: string | null;
	/** Top matches, regardless of confidence. Used by the 404 page as suggestions. */
	suggestions: SearchEntry[];
}

const ABSOLUTE_MIN_SCORE = 1.5;
const RELATIVE_GAP = 1.5;

export async function fuzzyMatch(
	kv: KVNamespace,
	pathname: string,
): Promise<FuzzyResult> {
	const term = pathToQuery(pathname);
	if (!term) return { url: null, suggestions: [] };
	const db = await getIndex(kv);
	if (!db) return { url: null, suggestions: [] };

	let hits: { doc: SearchEntry; score: number }[] = [];
	try {
		const r = (await search(db, {
			term,
			properties: ['title', 'summary', 'body', 'tags'],
			limit: 5,
			tolerance: 1,
		})) as Results<SearchEntry>;
		hits = r.hits.map((h) => ({ doc: h.document, score: h.score }));
	} catch (err) {
		console.error('Fuzzy Orama search failed:', err);
		return { url: null, suggestions: [] };
	}
	if (hits.length === 0) return { url: null, suggestions: [] };

	const top = hits[0];
	const second = hits[1];
	const beatsRunnerUp = !second || top.score >= second.score * RELATIVE_GAP;
	const clearsFloor = top.score >= ABSOLUTE_MIN_SCORE;
	// Never redirect onto the same path the user requested — that's a loop.
	const sameAsRequest = normalizePathLoose(top.doc.url) === normalizePathLoose(pathname);

	const isConfident = beatsRunnerUp && clearsFloor && !sameAsRequest;

	return {
		url: isConfident ? top.doc.url : null,
		suggestions: hits.map((h) => h.doc),
	};
}

function normalizePathLoose(path: string): string {
	const noHash = path.split('#')[0];
	const noQuery = noHash.split('?')[0];
	if (noQuery.length > 1 && noQuery.endsWith('/')) return noQuery.slice(0, -1);
	return noQuery;
}

/**
 * Used by the 404 page to surface suggestions without making a redirect
 * decision. Returns up to `limit` top hits — empty if there's nothing
 * remotely relevant in the index.
 */
export async function fuzzySuggestions(
	kv: KVNamespace,
	pathname: string,
	limit = 5,
): Promise<SearchEntry[]> {
	const term = pathToQuery(pathname);
	if (!term) return [];
	const db = await getIndex(kv);
	if (!db) return [];
	try {
		const r = (await search(db, {
			term,
			properties: ['title', 'summary', 'body', 'tags'],
			limit,
			tolerance: 1,
		})) as Results<SearchEntry>;
		return r.hits.map((h) => h.document);
	} catch (err) {
		console.error('Fuzzy suggestions search failed:', err);
		return [];
	}
}
