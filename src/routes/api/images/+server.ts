/**
 * Proxy /api/images requests to the brianschwabauer-images worker via the
 * IMAGE_PROCESSOR service binding. All real logic (R2 reads/writes, container
 * invocation) lives in image-worker/src/index.ts. In local dev this endpoint
 * is bypassed by vite's HTTP proxy (see vite.config.ts).
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

async function forward(request: Request, platform: App.Platform | undefined): Promise<Response> {
	if (!platform?.env?.IMAGE_PROCESSOR) {
		throw error(500, 'IMAGE_PROCESSOR service binding not configured');
	}
	// Cloudflare's Fetcher exposes its own Response type that's runtime-compatible
	// with the global one but not assignable through TS. Cast through unknown.
	const res = await (platform.env.IMAGE_PROCESSOR.fetch as unknown as (req: Request) => Promise<Response>)(request);
	return res;
}

export const GET: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forward(request, platform);
};

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forward(request, platform);
};
