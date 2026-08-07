/**
 * Per-post OpenGraph card: /cdn/og/blog/<slug>.jpg
 *
 * This route owns the KV lookup and hands the resolved post to the image
 * worker, which does the actual rendering (see image-worker/src/lib/og.ts) and
 * caches the PNG in R2. Splitting it that way keeps ~2.6MB of satori/resvg
 * WASM out of the main site's bundle.
 *
 * Sits under /cdn/ deliberately: hooks.server.ts skips auth for that prefix,
 * so no session refresh can attach a Set-Cookie and make the card uncacheable.
 *
 * The `.jpg` extension is part of the route name rather than a content-type
 * detail — several scrapers and preview tools still key off it.
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPost } from '$lib/server/blog';
import { formatPostDate } from '$lib/utils/date';

/**
 * Bumped by hand when the card design changes. It is part of the R2 cache key,
 * so incrementing it re-renders every post's card; without it a design tweak
 * would only reach posts that happen to be edited afterwards.
 */
const CARD_VERSION = 4;

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env?.KV || !platform.env.IMAGE_PROCESSOR) {
		throw error(500, 'Bindings not available');
	}

	const post = await getPost(platform.env.KV, params.slug);
	// Drafts get no card. The post page 404s for non-admins anyway, and a
	// reachable card would leak an unpublished title to anyone guessing slugs.
	if (!post || post.status !== 'published') throw error(404, 'Not found');

	const body = {
		slug: post.slug,
		title: post.title,
		date_label: formatPostDate(post.publishedAt ?? post.createdAt).toUpperCase(),
		cover_key: post.featuredImage ? `${post.featuredImage.path}/default` : null,
		// updatedAt moves on every save, so any edit to the title or cover
		// misses the cache and renders a fresh card.
		version: `v${CARD_VERSION}-${post.updatedAt}`,
	};

	// Called as fetch(url, init), NOT fetch(new Request(...)). Both are legal
	// against a real service binding, but in `vite dev` the binding is a
	// miniflare proxy whose fetch only understands the (url, init) form — hand
	// it a Request and it stringifies it into the URL slot and dies with
	// "Failed to parse URL from [object Request]".
	const upstream = await (
		platform.env.IMAGE_PROCESSOR.fetch as unknown as (
			input: string,
			init?: RequestInit,
		) => Promise<Response>
	)('https://images.internal/api/og', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	// Re-wrap: a service binding's Response has immutable headers, and anything
	// SvelteKit appends downstream would throw on it.
	return new Response(upstream.body, {
		status: upstream.status,
		headers: new Headers(upstream.headers),
	});
};
