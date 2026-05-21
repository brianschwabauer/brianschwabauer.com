import type { KVNamespace } from '@cloudflare/workers-types';

export interface RateLimitResult {
	/** True when the request is within the allowed quota. */
	ok: boolean;
	/** Seconds the caller should wait before retrying (only meaningful when !ok). */
	retryAfter: number;
}

/**
 * Fixed-window rate limiter backed by Workers KV.
 *
 * Intended for low-volume, abuse-prone endpoints (e.g. the contact form). KV
 * is eventually consistent and writes are not atomic, so this is a *soft*
 * limit — it stops casual flooding/scripted abuse, not a determined attacker
 * racing concurrent requests. For hard guarantees use a Durable Object.
 *
 * The window's TTL is refreshed on every counted request, so a blocked caller
 * must stay quiet for a full `windowSeconds` before the counter clears.
 */
export async function rateLimit(
	kv: KVNamespace,
	key: string,
	limit: number,
	windowSeconds: number
): Promise<RateLimitResult> {
	const bucketKey = `ratelimit:${key}`;
	const raw = await kv.get(bucketKey);
	const count = raw ? Number.parseInt(raw, 10) || 0 : 0;

	if (count >= limit) {
		return { ok: false, retryAfter: windowSeconds };
	}

	// KV requires expirationTtl >= 60.
	await kv.put(bucketKey, String(count + 1), {
		expirationTtl: Math.max(windowSeconds, 60)
	});
	return { ok: true, retryAfter: 0 };
}
