import { error } from '@sveltejs/kit';

/**
 * Forward a request to the brianschwabauer-images worker through the
 * IMAGE_PROCESSOR service binding, returning a response with *mutable*
 * headers.
 *
 * A service binding's `fetch()` returns a Response whose headers are
 * immutable. After an endpoint returns, SvelteKit appends `Set-Cookie`
 * headers to the response — Auth.js refreshes the session JWT cookie on
 * every authenticated request — which throws "Can't modify immutable
 * headers" when the response is immutable. Re-wrapping with a fresh
 * `Headers` object gives SvelteKit a mutable response to work with.
 */
export async function forwardToImageWorker(
	request: Request,
	platform: App.Platform | undefined,
): Promise<Response> {
	if (!platform?.env?.IMAGE_PROCESSOR) {
		throw error(500, 'IMAGE_PROCESSOR service binding not configured');
	}
	// Call .fetch inline as a method so `this` stays bound to the service
	// binding. Assigning it to a variable first detaches `this` and throws
	// "Illegal invocation" at runtime. Cloudflare's Fetcher Response type is
	// not TS-assignable to the global one, so cast through unknown.
	const upstream = await (
		platform.env.IMAGE_PROCESSOR.fetch as unknown as (req: Request) => Promise<Response>
	)(request);
	return new Response(upstream.body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: new Headers(upstream.headers),
	});
}
