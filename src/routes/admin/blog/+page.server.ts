import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { posts: [] };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const posts = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

		return { posts };
	} catch {
		return { posts: [] };
	}
};
