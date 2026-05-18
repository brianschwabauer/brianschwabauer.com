import type { RequestHandler } from './$types';
import { listLatest } from '$lib/server/blog';

export const GET: RequestHandler = async ({ platform, url }) => {
	const siteUrl = url.origin;
	const posts = platform?.env?.KV ? (await listLatest(platform.env.KV)).slice(0, 20) : [];

	const items = posts
		.map((post) => {
			const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : '';
			const desc = post.summary ?? post.aiSummary;
			const img = post.featuredImage;
			// RSS enclosure for the featured image — readers display it as a thumbnail
			const enclosure = img
				? `<enclosure url="${siteUrl}/cdn/image/${img.path}/default" type="${escapeAttr(img.mime_type)}" length="0" />`
				: '';
			return `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>${siteUrl}/blog/${post.slug}</link>
			<guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
			${desc ? `<description><![CDATA[${desc}]]></description>` : ''}
			${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
			${post.category ? `<category>${post.category}</category>` : ''}
			${enclosure}
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

function escapeAttr(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}
