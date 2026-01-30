import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { projects, users } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
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

function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '')
		.substring(0, 100);
}

export const GET: RequestHandler = async ({ platform }) => {
	if (!platform?.env?.DB) {
		return json({ projects: [] });
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const projectList = await db.select().from(projects).orderBy(asc(projects.sortOrder));
		return json({ projects: projectList });
	} catch {
		return json({ projects: [] });
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
	const { title, tagline, description, descriptionHtml, coverImage, images, technologies, externalUrl, githubUrl, featured, sortOrder } = data;

	if (!title || typeof title !== 'string') {
		throw error(400, 'Title is required');
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const slug = generateSlug(title);

		const [existing] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
		const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

		const [project] = await db
			.insert(projects)
			.values({
				slug: finalSlug,
				title,
				tagline: tagline || null,
				description: description || null,
				descriptionHtml: descriptionHtml || null,
				coverImage: coverImage || null,
				images: images ? JSON.stringify(images) : null,
				technologies: technologies ? JSON.stringify(technologies) : null,
				externalUrl: externalUrl || null,
				githubUrl: githubUrl || null,
				featured: featured || false,
				sortOrder: sortOrder || 0
			})
			.returning();

		return json({ project });
	} catch (err) {
		console.error('Failed to create project:', err);
		throw error(500, 'Failed to create project');
	}
};
