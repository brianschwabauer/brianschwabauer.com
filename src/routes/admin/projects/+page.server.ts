import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { projects } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { projects: [] };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const projectList = await db.select().from(projects).orderBy(asc(projects.sortOrder));

		return { projects: projectList };
	} catch {
		return { projects: [] };
	}
};
