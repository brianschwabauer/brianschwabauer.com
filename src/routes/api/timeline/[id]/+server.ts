import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { timelineEntries, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

export const GET: RequestHandler = async ({ params, platform }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const [entry] = await db
			.select()
			.from(timelineEntries)
			.where(eq(timelineEntries.id, params.id))
			.limit(1);

		if (!entry) {
			throw error(404, 'Entry not found');
		}

		return json({ entry });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch entry');
	}
};

export const PATCH: RequestHandler = async ({ params, request, platform, locals }) => {
	if (!(await isAdmin(platform, locals))) {
		throw error(403, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	const data = await request.json();

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);

		const updates: Partial<typeof timelineEntries.$inferInsert> = {
			updatedAt: new Date()
		};

		if (data.year !== undefined) updates.year = data.year;
		if (data.month !== undefined) updates.month = data.month;
		if (data.title !== undefined) updates.title = data.title;
		if (data.description !== undefined) updates.description = data.description;
		if (data.descriptionHtml !== undefined) updates.descriptionHtml = data.descriptionHtml;
		if (data.category !== undefined) updates.category = data.category;
		if (data.mediaType !== undefined) updates.mediaType = data.mediaType;
		if (data.mediaUrl !== undefined) updates.mediaUrl = data.mediaUrl;
		if (data.featured !== undefined) updates.featured = data.featured;
		if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

		const [entry] = await db
			.update(timelineEntries)
			.set(updates)
			.where(eq(timelineEntries.id, params.id))
			.returning();

		if (!entry) {
			throw error(404, 'Entry not found');
		}

		return json({ entry });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Failed to update entry:', err);
		throw error(500, 'Failed to update entry');
	}
};

export const DELETE: RequestHandler = async ({ params, platform, locals }) => {
	if (!(await isAdmin(platform, locals))) {
		throw error(403, 'Unauthorized');
	}

	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		await db.delete(timelineEntries).where(eq(timelineEntries.id, params.id));

		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete entry:', err);
		throw error(500, 'Failed to delete entry');
	}
};
