import type { PageServerLoad } from './$types';
import { loadRedirects } from '$lib/server/redirects';

export const load: PageServerLoad = async ({ platform, locals }) => {
	// Defense in depth: the +layout.server.ts guard already blocks non-admins,
	// but server load runs in parallel with the layout, so guard here too.
	const role = (locals.session?.user as { role?: string } | undefined)?.role;
	if (role !== 'admin') return { redirects: {}, updatedAt: 0 };
	if (!platform?.env?.KV) return { redirects: {}, updatedAt: 0 };
	const file = await loadRedirects(platform.env.KV);
	return { redirects: file.redirects, updatedAt: file.updatedAt };
};
