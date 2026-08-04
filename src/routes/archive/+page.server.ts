import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ARCHIVE_KEY, type ArchiveIndex } from '$lib/archive';

/**
 * The archive is admin-only, not merely signed-in: Google sign-in is open to
 * anyone, so `locals.session` alone gates nothing. Same policy as /admin,
 * but non-admins are bounced to the home page instead of a 403 — the page
 * should not advertise that there is something here to be denied access to.
 */
export const load: PageServerLoad = async ({ locals, url, platform }) => {
	if (!locals.session) {
		const target = `${url.pathname}${url.search}`;
		throw redirect(303, `/signin?redirect=${encodeURIComponent(target)}`);
	}
	const role = (locals.session.user as { role?: string } | undefined)?.role;
	if (role !== 'admin') {
		throw redirect(303, '/');
	}

	const index = ((await platform?.env?.KV?.get(ARCHIVE_KEY, 'json')) ??
		null) as ArchiveIndex | null;
	return {
		entries: index?.entries ?? [],
		updated_at: index?.updated_at ?? null,
	};
};
