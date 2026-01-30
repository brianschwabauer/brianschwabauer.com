import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { timelineEntries } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return { entry: null };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const [entry] = await db
			.select()
			.from(timelineEntries)
			.where(eq(timelineEntries.id, params.id))
			.limit(1);

		return { entry: entry ?? null };
	} catch {
		return { entry: null };
	}
};
