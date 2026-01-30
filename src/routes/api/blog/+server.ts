import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts, users } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

// Helper to check if user is admin
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

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.substring(0, 100);
}

export const GET: RequestHandler = async ({ platform, locals, url }) => {
	if (!platform?.env?.DB) {
		return json({ posts: [] });
	}

	const includeUnpublished = url.searchParams.get('all') === 'true';

	// Only admins can see unpublished posts
	if (includeUnpublished && !(await isAdmin(platform, locals))) {
		throw error(403, 'Unauthorized');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);

		let query = db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));

		if (!includeUnpublished) {
			query = db
				.select()
				.from(blogPosts)
				.where(eq(blogPosts.status, 'published'))
				.orderBy(desc(blogPosts.publishedAt));
		}

		const posts = await query;
		return json({ posts });
	} catch {
		return json({ posts: [] });
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
	const { title, content, contentHtml, excerpt, category, tags, status } = data;

	if (!title || typeof title !== 'string') {
		throw error(400, 'Title is required');
	}

	if (!content || typeof content !== 'string') {
		throw error(400, 'Content is required');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const slug = generateSlug(title);

		// Check for duplicate slug
		const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);

		const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

		const [post] = await db
			.insert(blogPosts)
			.values({
				slug: finalSlug,
				title,
				content,
				contentHtml: contentHtml || null,
				excerpt: excerpt || null,
				category: category || null,
				tags: tags ? JSON.stringify(tags) : null,
				status: status || 'draft',
				publishedAt: status === 'published' ? new Date() : null
			})
			.returning();

		return json({ post });
	} catch (err) {
		console.error('Failed to create blog post:', err);
		throw error(500, 'Failed to create post');
	}
};
