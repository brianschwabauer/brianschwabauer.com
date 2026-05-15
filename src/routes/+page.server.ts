import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const signedIn = Boolean(locals.session?.user);
	return { signedIn };
};
