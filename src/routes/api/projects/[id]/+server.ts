import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { projects, users } from '$lib/server/db/schema';
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
		const [project] = await db.select().from(projects).where(eq(projects.id, params.id)).limit(1);

		if (!project) {
			throw error(404, 'Project not found');
		}

		return json({ project });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch project');
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

		const updates: Partial<typeof projects.$inferInsert> = {
			updatedAt: new Date()
		};

		if (data.title !== undefined) updates.title = data.title;
		if (data.tagline !== undefined) updates.tagline = data.tagline;
		if (data.description !== undefined) updates.description = data.description;
		if (data.descriptionHtml !== undefined) updates.descriptionHtml = data.descriptionHtml;
		if (data.coverImage !== undefined) updates.coverImage = data.coverImage;
		if (data.images !== undefined) updates.images = JSON.stringify(data.images);
		if (data.technologies !== undefined) updates.technologies = JSON.stringify(data.technologies);
		if (data.externalUrl !== undefined) updates.externalUrl = data.externalUrl;
		if (data.githubUrl !== undefined) updates.githubUrl = data.githubUrl;
		if (data.featured !== undefined) updates.featured = data.featured;
		if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

		const [project] = await db
			.update(projects)
			.set(updates)
			.where(eq(projects.id, params.id))
			.returning();

		if (!project) {
			throw error(404, 'Project not found');
		}

		return json({ project });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Failed to update project:', err);
		throw error(500, 'Failed to update project');
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
		await db.delete(projects).where(eq(projects.id, params.id));

		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete project:', err);
		throw error(500, 'Failed to delete project');
	}
};
