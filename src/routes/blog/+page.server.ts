import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return { posts: [] };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const posts = await db
			.select()
			.from(blogPosts)
			.where(eq(blogPosts.status, 'published'))
			.orderBy(desc(blogPosts.publishedAt));

		return { posts };
	} catch {
		return { posts: [] };
	}
};
