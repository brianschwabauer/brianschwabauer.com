<script lang="ts">
	/**
	 * The single source of per-page metadata: title, description, canonical,
	 * OpenGraph, Twitter card and JSON-LD.
	 *
	 * `<svelte:head>` does NOT de-duplicate tags — two components each emitting
	 * `<meta name="description">` produce two of them in the document, and
	 * search engines then pick one arbitrarily. So every public page renders
	 * this component exactly once and passes everything in; the layout emits
	 * only tags no page ever overrides (the RSS link, and noindex on the
	 * private routes).
	 */
	import { page } from '$app/state';
	import {
		SITE_NAME,
		SITE_URL,
		AUTHOR_NAME,
		DEFAULT_OG_IMAGE,
		absoluteUrl,
		jsonLdScript,
	} from '$lib/seo';

	interface Props {
		/** Full <title>. Rendered verbatim — include the site name if you want it. */
		title: string;
		description: string;
		/**
		 * Share-card copy, when it should differ from the search-result copy.
		 * `description` is written for someone scanning Google; this is written
		 * for someone seeing a card in a feed. Defaults to `description`.
		 */
		og_description?: string;
		/** OG image, relative or absolute. Falls back to the site-wide card. */
		image?: string | null;
		og_type?: 'website' | 'article';
		/**
		 * Canonical path. Defaults to the current pathname WITHOUT the query
		 * string: the home page's `?media=…` lightbox links and the blog's
		 * `?tag=…` filters are view state over the same content, and left
		 * un-canonicalized each one is a duplicate page in the index.
		 */
		canonical?: string;
		/** ISO 8601 timestamps — articles only. */
		published_time?: string | null;
		modified_time?: string | null;
		tags?: string[];
		/** schema.org object, injected as JSON-LD. */
		json_ld?: unknown;
		/** Keep this page out of search results (e.g. an admin draft preview). */
		noindex?: boolean;
	}

	let {
		title,
		description,
		og_description,
		image = null,
		og_type = 'website',
		canonical,
		published_time = null,
		modified_time = null,
		tags = [],
		json_ld,
		noindex = false,
	}: Props = $props();

	const canonical_url = $derived(absoluteUrl(canonical ?? page.url.pathname));
	const image_url = $derived(image ? absoluteUrl(image) : DEFAULT_OG_IMAGE);
	const share_description = $derived(og_description ?? description);
	// Derived rather than fixed: the site-wide card is a static PNG, while the
	// per-post cards are JPEG (grain does not compress in PNG — see
	// image-worker/src/lib/og.ts). The Content-Type header is what scrapers
	// actually honour; this tag is a hint, so the extension is a good enough
	// source of truth.
	const image_type = $derived(/\.jpe?g$/i.test(image_url) ? 'image/jpeg' : 'image/png');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical_url} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:type" content={og_type} />
	<meta property="og:url" content={canonical_url} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={share_description} />
	<meta property="og:image" content={image_url} />
	<!-- Unconditional because every og:image this site emits is a 1200x630
	     card: either the static site-wide one or a per-post card generated at
	     /cdn/og/blog/*.jpg. Raw covers are never linked here — they are stored
	     as AVIF, which the major scrapers cannot decode. -->
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content={image_type} />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={share_description} />
	<meta name="twitter:image" content={image_url} />

	{#if og_type === 'article'}
		<meta property="article:author" content={AUTHOR_NAME} />
		{#if published_time}
			<meta property="article:published_time" content={published_time} />
		{/if}
		{#if modified_time}
			<meta property="article:modified_time" content={modified_time} />
		{/if}
		{#each tags as tag (tag)}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<link
		rel="alternate"
		type="application/rss+xml"
		title="{SITE_NAME} — Blog"
		href="{SITE_URL}/blog/rss.xml" />

	{#if json_ld}
		{@html jsonLdScript(json_ld)}
	{/if}
</svelte:head>
