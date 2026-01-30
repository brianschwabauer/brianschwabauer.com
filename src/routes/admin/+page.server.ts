import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts, timelineEntries, projects, contactSubmissions } from '$lib/server/db/schema';
import { count, eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return {
			blogCount: 0,
			timelineCount: 0,
			projectCount: 0,
			messageCount: 0
		};
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);

		const [blogResult] = await db.select({ count: count() }).from(blogPosts);
		const [timelineResult] = await db.select({ count: count() }).from(timelineEntries);
		const [projectResult] = await db.select({ count: count() }).from(projects);
		const [messageResult] = await db
			.select({ count: count() })
			.from(contactSubmissions)
			.where(eq(contactSubmissions.status, 'new'));

		return {
			blogCount: blogResult?.count ?? 0,
			timelineCount: timelineResult?.count ?? 0,
			projectCount: projectResult?.count ?? 0,
			messageCount: messageResult?.count ?? 0
		};
	} catch {
		return {
			blogCount: 0,
			timelineCount: 0,
			projectCount: 0,
			messageCount: 0
		};
	}
};
