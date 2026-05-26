import { createAuth } from '$lib/server/auth';
import { lookupRedirect } from '$lib/server/redirects';
import { fuzzyMatch } from '$lib/server/fuzzyRedirect';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

// IMAGE_PROCESSOR is a service binding to the brianschwabauer-images worker
// (see wrangler.toml + wrangler.images.toml). The actual ImageProcessorContainer
// DO lives in that separate worker, so the main worker never imports the
// `cloudflare:workers` module — keeping Vite's SSR build clean.

const authHandle: Handle = async ({ event, resolve }) => {
	// Skip auth for public asset routes. /cdn/* in particular must not run
	// Auth.js: a session refresh would add Set-Cookie and make image
	// responses uncacheable (and previously 500'd on immutable headers).
	if (
		event.url.pathname.startsWith('/_app') ||
		event.url.pathname.startsWith('/cdn/') ||
		event.url.pathname.startsWith('/favicon') ||
		event.url.pathname.startsWith('/brandmark') ||
		event.url.pathname.startsWith('/logo')
	) {
		return resolve(event);
	}

	try {
		const { handle } = createAuth(event.platform);
		return handle({ event, resolve });
	} catch (error) {
		console.error('Auth initialization failed:', error);
		event.locals.session = null;
		return resolve(event);
	}
};

const sessionHandle: Handle = async ({ event, resolve }) => {
	try {
		event.locals.session = (await event.locals.auth?.()) ?? null;
	} catch {
		event.locals.session = null;
	}
	return resolve(event);
};

/** Paths that should never participate in smart-redirect logic. */
function isPublicContentPath(pathname: string): boolean {
	if (
		pathname.startsWith('/admin') ||
		pathname.startsWith('/api/') ||
		pathname.startsWith('/cdn/') ||
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/auth/') ||
		pathname.startsWith('/signin') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/brandmark') ||
		pathname.startsWith('/logo')
	) {
		return false;
	}
	// Static asset extensions — let SvelteKit / Cloudflare return its own 404.
	if (
		/\.(?:json|xml|txt|js|css|map|png|jpe?g|webp|avif|gif|svg|ico|webmanifest)$/i.test(
			pathname,
		)
	) {
		return false;
	}
	return true;
}

/**
 * Smart-redirect handler. After SvelteKit resolves the request, if the
 * response was a 404 for a public content path, try in order:
 *   1. Exact-match redirect from the KV /redirects.json map → 301 (or whatever
 *      status the entry specifies). For legacy WordPress URLs etc.
 *   2. Fuzzy match against the Orama search index → 302 (temporary; the
 *      slug might one day legitimately exist).
 *   3. Fall through, letting +error.svelte render the 404 page with
 *      suggestions.
 */
const redirectHandle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (response.status !== 404) return response;

	const pathname = event.url.pathname;
	if (!isPublicContentPath(pathname)) return response;

	// Built-in pattern: legacy WordPress blog posts at /blog/YYYY/MM/slug(/)
	// drop the date prefix. There's also a static/_redirects rule for this,
	// but that one is matched by Cloudflare's static asset layer and doesn't
	// catch the trailing-slash variant on every config, so handle it here as
	// a safety net.
	const legacyDate = /^\/blog\/(\d{4})\/(\d{1,2})\/([^\/]+)\/?$/.exec(pathname);
	if (legacyDate) {
		return new Response(null, {
			status: 301,
			headers: {
				location: `/blog/${legacyDate[3]}`,
				'cache-control': 'public, max-age=86400',
			},
		});
	}

	const kv = event.platform?.env?.KV;
	if (!kv) return response;

	try {
		const exact = await lookupRedirect(kv, pathname);
		if (exact) {
			const status = exact.status ?? 301;
			return new Response(null, {
				status,
				headers: {
					location: exact.to,
					// Long-cache permanent redirects; never cache temporaries.
					'cache-control':
						status === 301 || status === 308 ? 'public, max-age=86400' : 'no-store',
				},
			});
		}
	} catch (err) {
		console.error('Exact-redirect lookup failed:', err);
	}

	try {
		const { url } = await fuzzyMatch(kv, pathname);
		if (url) {
			return new Response(null, {
				status: 302,
				headers: { location: url, 'cache-control': 'no-store' },
			});
		}
	} catch (err) {
		console.error('Fuzzy redirect failed:', err);
	}

	return response;
};

export const handle = sequence(authHandle, sessionHandle, redirectHandle);
