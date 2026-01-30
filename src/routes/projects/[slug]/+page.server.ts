import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return { project: null };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const [project] = await db
			.select()
			.from(projects)
			.where(eq(projects.slug, params.slug))
			.limit(1);

		return { project: project ?? null };
	} catch {
		return { project: null };
	}
};
