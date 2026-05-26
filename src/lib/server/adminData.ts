import type { KVNamespace } from '@cloudflare/workers-types';
import { normalizeTagList } from '$lib/utils/tags';
import { listAllAdmin } from './blog';

const ADMIN_KEY = '/admin.json';

/**
 * Global admin-only state, stored as a single JSON blob in KV. Loaded by the
 * admin layout so every admin page has access to it. Add new fields here as
 * other shared settings show up.
 */
export interface AdminData {
	/** All tags ever used across all posts, normalized + deduped. */
	tags: string[];
}

const empty: AdminData = { tags: [] };

export async function loadAdminData(kv: KVNamespace): Promise<AdminData> {
	const raw = (await kv.get(ADMIN_KEY, 'json')) as Partial<AdminData> | null;
	if (!raw) return empty;
	return {
		tags: Array.isArray(raw.tags) ? normalizeTagList(raw.tags) : [],
	};
}

async function saveAdminData(kv: KVNamespace, data: AdminData): Promise<void> {
	await kv.put(ADMIN_KEY, JSON.stringify(data));
}

/**
 * Rebuild the global tag list from the union of tags currently in use across
 * all posts. Called after any post create/update/delete so the autocomplete
 * suggestions stay accurate.
 */
export async function refreshAdminTags(kv: KVNamespace): Promise<string[]> {
	const posts = await listAllAdmin(kv);
	const all: string[] = [];
	for (const p of posts) {
		if (Array.isArray(p.tags)) all.push(...p.tags);
	}
	const tags = normalizeTagList(all).sort((a, b) => a.localeCompare(b));
	const existing = await loadAdminData(kv);
	await saveAdminData(kv, { ...existing, tags });
	return tags;
}
