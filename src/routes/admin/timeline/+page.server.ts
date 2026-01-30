import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { timelineEntries } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { entries: [] };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const entries = await db
			.select()
			.from(timelineEntries)
			.orderBy(desc(timelineEntries.year), desc(timelineEntries.month));

		return { entries };
	} catch {
		return { entries: [] };
	}
};
