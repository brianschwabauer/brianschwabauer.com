import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts, users } from '$lib/server/db/schema';
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

export const GET: RequestHandler = async ({ params, platform, locals }) => {
	if (!platform?.env?.DB) {
		throw error(500, 'Database not available');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);

		if (!post) {
			throw error(404, 'Post not found');
		}

		// Non-admins can only see published posts
		if (post.status !== 'published' && !(await isAdmin(platform, locals))) {
			throw error(404, 'Post not found');
		}

		return json({ post });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		throw error(500, 'Failed to fetch post');
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

		// Get existing post
		const [existing] = await db
			.select()
			.from(blogPosts)
			.where(eq(blogPosts.id, params.id))
			.limit(1);

		if (!existing) {
			throw error(404, 'Post not found');
		}

		// Build update object
		const updates: Partial<typeof blogPosts.$inferInsert> = {
			updatedAt: new Date()
		};

		if (data.title !== undefined) updates.title = data.title;
		if (data.content !== undefined) updates.content = data.content;
		if (data.contentHtml !== undefined) updates.contentHtml = data.contentHtml;
		if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
		if (data.category !== undefined) updates.category = data.category;
		if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
		if (data.status !== undefined) {
			updates.status = data.status;
			// Set publishedAt when publishing for the first time
			if (data.status === 'published' && !existing.publishedAt) {
				updates.publishedAt = new Date();
			}
		}

		const [post] = await db
			.update(blogPosts)
			.set(updates)
			.where(eq(blogPosts.id, params.id))
			.returning();

		return json({ post });
	} catch (err) {
		if (err instanceof Error && 'status' in err) throw err;
		console.error('Failed to update post:', err);
		throw error(500, 'Failed to update post');
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
		await db.delete(blogPosts).where(eq(blogPosts.id, params.id));

		return json({ success: true });
	} catch (err) {
		console.error('Failed to delete post:', err);
		throw error(500, 'Failed to delete post');
	}
};
