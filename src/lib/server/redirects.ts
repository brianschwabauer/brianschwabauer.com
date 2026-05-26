import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * KV-backed map of legacy URLs (and any other arbitrary path) to their new
 * homes. Stored as a single JSON blob at `/redirects.json` — looked up only
 * on 404s, so happy-path requests never read it. KV's edge cache (60s
 * default `cacheTtl`) absorbs the cost of repeated reads of the same blob.
 *
 * Why KV instead of a committed file:
 *   1. The list isn't visible in the public GitHub repo.
 *   2. Edits don't require a redeploy — the admin UI writes to KV directly.
 */

const REDIRECTS_KEY = '/redirects.json';

/** HTTP status codes we'll accept. 301 = permanent, 302 = temporary. */
export type RedirectStatus = 301 | 302 | 307 | 308;

export interface RedirectEntry {
	to: string;
	status?: RedirectStatus;
	/** Admin-only note about why this redirect exists. Never shown publicly. */
	note?: string;
}

export type RedirectMap = Record<string, RedirectEntry>;

export interface RedirectFile {
	updatedAt: number;
	redirects: RedirectMap;
}

/**
 * Strip trailing slash and query string, lowercase. WordPress URLs typically
 * include a trailing slash; the new SvelteKit routes don't — normalizing both
 * lets one entry cover both forms.
 */
export function normalizePath(path: string): string {
	if (!path) return '/';
	if (!path.startsWith('/')) path = '/' + path;
	const q = path.indexOf('?');
	if (q >= 0) path = path.slice(0, q);
	const h = path.indexOf('#');
	if (h >= 0) path = path.slice(0, h);
	if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
	return path.toLowerCase();
}

export async function loadRedirects(kv: KVNamespace): Promise<RedirectFile> {
	const raw = (await kv.get(REDIRECTS_KEY, {
		type: 'json',
		cacheTtl: 60,
	})) as RedirectFile | null;
	if (raw && raw.redirects && typeof raw.redirects === 'object') return raw;
	return { updatedAt: 0, redirects: {} };
}

/** Exact-match lookup. Returns null if no redirect is configured for `pathname`. */
export async function lookupRedirect(
	kv: KVNamespace,
	pathname: string,
): Promise<RedirectEntry | null> {
	const file = await loadRedirects(kv);
	return file.redirects[normalizePath(pathname)] ?? null;
}

function isValidStatus(n: unknown): n is RedirectStatus {
	return n === 301 || n === 302 || n === 307 || n === 308;
}

/**
 * Validate + persist the full redirect map (replaces the previous one). The
 * admin UI sends the entire map on each save — simple to reason about and
 * the map is small enough that diffing isn't worth it.
 */
export async function saveRedirects(
	kv: KVNamespace,
	input: RedirectMap,
): Promise<RedirectFile> {
	const normalized: RedirectMap = {};
	for (const [rawFrom, rawEntry] of Object.entries(input)) {
		const from = normalizePath(rawFrom);
		if (!from || from === '/') continue; // never redirect the root
		if (!rawEntry || typeof rawEntry.to !== 'string') continue;
		const to = rawEntry.to.trim();
		if (!to) continue;
		const status = isValidStatus(rawEntry.status) ? rawEntry.status : 301;
		const entry: RedirectEntry = { to, status };
		if (typeof rawEntry.note === 'string' && rawEntry.note.trim()) {
			entry.note = rawEntry.note.trim();
		}
		normalized[from] = entry;
	}
	const file: RedirectFile = { updatedAt: Date.now(), redirects: normalized };
	await kv.put(REDIRECTS_KEY, JSON.stringify(file));
	return file;
}
