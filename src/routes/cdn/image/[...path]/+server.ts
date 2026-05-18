/**
 * Proxy /cdn/image/* to the brianschwabauer-images worker via the
 * IMAGE_PROCESSOR service binding. The image worker reads R2 and returns
 * the correct headers (Content-Type, Cache-Control, ETag).
 */
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, platform }) => {
	if (!platform?.env?.IMAGE_PROCESSOR) {
		throw error(500, 'IMAGE_PROCESSOR service binding not configured');
	}
	const res = await (platform.env.IMAGE_PROCESSOR.fetch as unknown as (req: Request) => Promise<Response>)(request);
	return res;
};
