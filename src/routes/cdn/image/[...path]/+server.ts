/**
 * Proxy /cdn/image/* to the brianschwabauer-images worker via the
 * IMAGE_PROCESSOR service binding. The image worker reads R2 and returns
 * the correct headers (Content-Type, Cache-Control, ETag).
 *
 * This route is public and skips auth (see hooks.server.ts) so responses
 * stay cacheable — no Set-Cookie from a session refresh.
 */
import type { RequestHandler } from './$types';
import { forwardToImageWorker } from '$lib/server/imageProxy';

export const GET: RequestHandler = async ({ request, platform }) => {
	return forwardToImageWorker(request, platform);
};
