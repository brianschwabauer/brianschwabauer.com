/**
 * Site-wide SEO constants and helpers.
 *
 * Canonical URLs, OpenGraph images and JSON-LD `@id`s must all be absolute and
 * must all point at the production origin — never at the request origin. A
 * preview deploy or a local dev server that emitted its own origin here would
 * publish canonicals pointing at a hostname Google can't reach (and, worse,
 * would let a preview deploy compete with production in the index).
 */
export const SITE_URL = 'https://brianschwabauer.com';
export const SITE_NAME = 'Brian Schwabauer';
export const AUTHOR_NAME = 'Brian Schwabauer';

/** Fallback OpenGraph card, used by every page without a more specific image. */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

/** Profile URLs for schema.org `sameAs` — how search engines link identities. */
export const SAME_AS = ['https://github.com/brianschwabauer'];

/** Resolve a site-relative path (or an already-absolute URL) to an absolute URL. */
export function absoluteUrl(path: string): string {
	if (/^https?:\/\//.test(path)) return path;
	return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Serialize a JSON-LD object for injection into a <script type="application/ld+json">.
 *
 * `<` is escaped so a value containing `</script>` cannot terminate the block
 * early and inject markup — the standard mitigation for JSON-in-HTML.
 */
export function jsonLdScript(data: unknown): string {
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
