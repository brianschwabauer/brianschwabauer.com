import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { loadAdminData } from '$lib/server/adminData';

export const load: LayoutServerLoad = async ({ locals, url, platform }) => {
	if (!locals.session) {
		const target = `${url.pathname}${url.search}`;
		throw redirect(303, `/signin?redirect=${encodeURIComponent(target)}`);
	}
	const adminData = platform?.env?.KV
		? await loadAdminData(platform.env.KV)
		: { tags: [] };
	return { adminData };
};
