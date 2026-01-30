import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { blogPosts } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { D1Database } from '@cloudflare/workers-types';

export const GET: RequestHandler = async ({ platform, url }) => {
	const siteUrl = url.origin;

	let posts: typeof blogPosts.$inferSelect[] = [];

	if (platform?.env?.DB) {
		try {
			const db = getDb(platform.env.DB as unknown as D1Database);
			posts = await db
				.select()
				.from(blogPosts)
				.where(eq(blogPosts.status, 'published'))
				.orderBy(desc(blogPosts.publishedAt))
				.limit(20);
		} catch {
			// Continue with empty posts
		}
	}

	const items = posts
		.map((post) => {
			const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : '';
			return `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>${siteUrl}/blog/${post.slug}</link>
			<guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
			${post.excerpt ? `<description><![CDATA[${post.excerpt}]]></description>` : ''}
			${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
			${post.category ? `<category>${post.category}</category>` : ''}
		</item>`;
		})
		.join('\n');

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Brian Schwabauer's Blog</title>
		<description>Thoughts on development, creativity, and the journey of building things.</description>
		<link>${siteUrl}/blog</link>
		<atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
		<language>en-us</language>
		<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
		${items}
	</channel>
</rss>`;

	return new Response(rss.trim(), {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
};
