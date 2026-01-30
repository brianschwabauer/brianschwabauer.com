import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { timelineEntries, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

async function isAdmin(platform: App.Platform | undefined, locals: App.Locals): Promise<boolean> {
	if (!platform?.env?.DB || !locals.session?.user?.id) {
		return false;
	}

	const db = getDb(platform.env.DB as unknown as D1Database);
	const [user] = await db
		.select({ role: users.role })
		.from(users)
		.where(eq(users.id, locals.session.user.id))
		.limit(1);

	return user?.role === 'admin';
}

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return json({ entries: [] });
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const entries = await db
			.select()
			.from(timelineEntries)
			.orderBy(desc(timelineEntries.year), desc(timelineEntries.month));

		return json({ entries });
	} catch {
		return json({ entries: [] });
	}
};

export const POST: RequestHandler = async ({ request, platform, locals }) => {
	if (!(await isAdmin(platform, locals))) {
		throw error(403, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const data = await request.json();
	const { year, month, title, description, descriptionHtml, category, mediaType, mediaUrl, featured, sortOrder } =
		data;

	if (!year || typeof year !== 'number') {
		throw error(400, 'Year is required');
	}

	if (!title || typeof title !== 'string') {
		throw error(400, 'Title is required');
	}

	if (!category || !['development', 'videography', 'life'].includes(category)) {
		throw error(400, 'Valid category is required');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);

		const [entry] = await db
			.insert(timelineEntries)
			.values({
				year,
				month: month || null,
				title,
				description: description || null,
				descriptionHtml: descriptionHtml || null,
				category,
				mediaType: mediaType || 'none',
				mediaUrl: mediaUrl || null,
				featured: featured || false,
				sortOrder: sortOrder || 0
			})
			.returning();

		return json({ entry });
	} catch (err) {
		console.error('Failed to create timeline entry:', err);
		throw error(500, 'Failed to create entry');
	}
};
