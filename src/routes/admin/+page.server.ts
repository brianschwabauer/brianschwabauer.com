import type { PageServerLoad } from './$types';
import { listAllAdmin } from '$lib/server/blog';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Defense in depth: the +layout.server.ts guard already blocks non-admins,
	// but server load functions run in parallel, so guard here too rather than
	// run listAllAdmin (which returns drafts) for a non-admin request.
	const role = (locals.session?.user as { role?: string } | undefined)?.role;
	if (role !== 'admin') return { posts: [] };
	if (!platform?.env?.KV) return { posts: [] };
	const posts = await listAllAdmin(platform.env.KV);
	return { posts };
};
