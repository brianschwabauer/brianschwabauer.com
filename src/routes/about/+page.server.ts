import type { PageServerLoad } from './$types';
import { getDb, type TimelineEntry } from '$lib/server/db';
import { timelineEntries } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env?.DB) {
		// Return sample data for development/preview
		const sampleEntries: TimelineEntry[] = [
			{
				id: '1',
				year: 2024,
				month: 1,
				title: 'Started Building This Portfolio',
				description: 'Began work on a new portfolio site with SvelteKit, featuring a space-themed about page with reverse scroll navigation.',
				descriptionHtml: null,
				category: 'development',
				mediaType: 'none',
				mediaUrl: null,
				featured: true,
				sortOrder: 1,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: '2',
				year: 2023,
				month: 6,
				title: 'Learned SvelteKit',
				description: 'Dove deep into the Svelte ecosystem, building several projects to understand the framework.',
				descriptionHtml: null,
				category: 'development',
				mediaType: 'none',
				mediaUrl: null,
				featured: false,
				sortOrder: 1,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: '3',
				year: 2022,
				month: 3,
				title: 'First Video Project',
				description: 'Created my first professional video project, learning the fundamentals of storytelling through motion.',
				descriptionHtml: null,
				category: 'videography',
				mediaType: 'none',
				mediaUrl: null,
				featured: false,
				sortOrder: 1,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		];
		return { entries: sampleEntries };
	}

	try {
		const db = getDb(platform.env.DB as unknown as D1Database);
		const entries = await db
			.select()
			.from(timelineEntries)
			.orderBy(desc(timelineEntries.year), desc(timelineEntries.month));

		return { entries };
	} catch {
		return { entries: [] };
	}
};
