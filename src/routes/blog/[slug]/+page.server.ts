import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		return { post: null };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const [post] = await db
			.select()
			.from(blogPosts)
			.where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.status, 'published')))
			.limit(1);

		return { post: post ?? null };
	} catch {
		return { post: null };
	}
};
