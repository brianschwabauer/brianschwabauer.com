import type { RequestHandler } from './$types';
import { listLatest } from '$lib/server/blog';

export const GET: RequestHandler = async ({ platform, url }) => {
	const siteUrl = url.origin;
	const posts = platform?.env?.KV ? (await listLatest(platform.env.KV)).slice(0, 20) : [];

	const items = posts
		.map((post) => {
			const pubDate = post.publishedAt ? new Date(post.publishedAt).toUTCString() : '';
			const desc = post.summary ?? post.aiSummary;
			// Thumbnail for the reader. This points at the generated share card,
			// NOT at the cover's stored variant, for two reasons: covers are only
			// ever stored as AVIF, which most feed readers cannot decode; and the
			// `type` here used to advertise the ORIGINAL upload's mime (usually
			// image/jpeg) while the URL served AVIF bytes, so a reader that
			// trusted the declared type got a decode error rather than simply no
			// image. The card is JPEG by construction.
			//
			// It also exists for every published post, including those with no
			// cover, so every item now carries a thumbnail instead of only the
			// ones with a featured image.
			//
			// `length` is required by RSS 2.0, but knowing it would mean fetching
			// all 20 cards on every feed build. 0 is the conventional stand-in for
			// unknown and readers ignore it.
			const enclosure = `<enclosure url="${siteUrl}/cdn/og/blog/${post.slug}.jpg" type="image/jpeg" length="0" />`;
			const categories = (post.tags ?? [])
				.map((t) => `<category><![CDATA[${t}]]></category>`)
				.join('\n\t\t\t');
			return `
		<item>
			<title><![CDATA[${post.title}]]></title>
			<link>${siteUrl}/blog/${post.slug}</link>
			<guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
			${desc ? `<description><![CDATA[${desc}]]></description>` : ''}
			${pubDate ? `<pubDate>${pubDate}</pubDate>` : ''}
			${categories}
			${enclosure}
		</item>`;
		})
		.join('\n');

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Brian Schwabauer's Blog</title>
		<description>Thoughts on software development, creativity, and the journey of building things.</description>
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
			'Cache-Control': 'max-age=0, s-maxage=3600',
		},
	});
};
