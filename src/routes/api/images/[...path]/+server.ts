import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

async function forward(request: Request, platform: App.Platform | undefined): Promise<Response> {
	if (!platform?.env?.IMAGE_PROCESSOR) {
		throw error(500, 'IMAGE_PROCESSOR service binding not configured');
	}
	const res = await (platform.env.IMAGE_PROCESSOR.fetch as unknown as (req: Request) => Promise<Response>)(request);
	return res;
}

export const GET: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forward(request, platform);
};

export const PATCH: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forward(request, platform);
};

export const DELETE: RequestHandler = async ({ request, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	return forward(request, platform);
};
