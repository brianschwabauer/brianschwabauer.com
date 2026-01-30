import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { contactSubmissions } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { messages: [] };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const messages = await db
			.select()
			.from(contactSubmissions)
			.orderBy(desc(contactSubmissions.createdAt));

		return { messages };
	} catch {
		return { messages: [] };
	}
};
