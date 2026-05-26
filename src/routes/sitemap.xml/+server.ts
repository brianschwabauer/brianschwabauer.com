import type { RequestHandler } from './$types';
import { listLatest } from '$lib/server/blog';

// Dynamic sitemap — static pages plus every published blog post. Post slugs
// are slugified (safe characters only), so no XML escaping is required here.
export const GET: RequestHandler = async ({ platform, url }) => {
	const siteUrl = url.origin;
	const posts = platform?.env?.KV ? await listLatest(platform.env.KV) : [];

	const entries: string[] = [
		`\t<url>\n\t\t<loc>${siteUrl}/</loc>\n\t\t<priority>1.0</priority>\n\t</url>`,
		`\t<url>\n\t\t<loc>${siteUrl}/blog</loc>\n\t\t<priority>0.8</priority>\n\t</url>`,
		`\t<url>\n\t\t<loc>${siteUrl}/contact</loc>\n\t\t<priority>0.7</priority>\n\t</url>`,
		...posts.map((post) => {
			const lastmod = new Date(
				post.updatedAt || post.publishedAt || post.createdAt,
			).toISOString();
			return `\t<url>\n\t\t<loc>${siteUrl}/blog/${post.slug}</loc>\n\t\t<lastmod>${lastmod}</lastmod>\n\t\t<priority>0.6</priority>\n\t</url>`;
		}),
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=0, s-maxage=3600',
		},
	});
};
