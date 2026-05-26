<script lang="ts">
	import { onMount, mount, unmount } from 'svelte';
	import { Button } from '@delightstack/components/actions';
	import { page } from '$app/state';
	import { bgStyle } from '$lib/client/images';
	import { formatPostDate, isoPostDate } from '$lib/utils/date';
	import VideoPlayer from '$lib/components/about/primitives/VideoPlayer.svelte';

	let { data } = $props();

	// The post body is server-rendered HTML ({@html} below). renderDoc emits
	// `<figure class="blog-video">` placeholders for embedded HLS videos; here
	// we find them after mount and hydrate each into a video.js player.
	let contentEl = $state<HTMLElement | undefined>();

	onMount(() => {
		const root = contentEl;
		if (!root) return;
		const players: Array<Record<string, unknown>> = [];
		for (const fig of root.querySelectorAll<HTMLElement>('figure.blog-video')) {
			const slug = fig.dataset.videoSlug;
			const target = fig.querySelector<HTMLElement>('.blog-video-mount');
			if (!slug || !target) continue;
			target.replaceChildren();
			players.push(
				mount(VideoPlayer, {
					target,
					props: { slug, title: fig.dataset.videoTitle || '', ratio: '16 / 9' },
				}),
			);
		}
		return () => {
			for (const player of players) unmount(player);
		};
	});

	const summary = $derived(data.post?.summary ?? data.post?.aiSummary ?? '');
	const tags = $derived(data.post?.tags ?? []);
	const featured = $derived(data.post?.featuredImage ?? null);
	const focalX = $derived(data.post?.coverFocalX ?? 50);
	const focalY = $derived(data.post?.coverFocalY ?? 50);
	const ogImage = $derived(featured ? `/cdn/image/${featured.path}/default` : null);
	const isAdmin = $derived(
		(page.data.session?.user as { role?: string } | undefined)?.role === 'admin',
	);
</script>

<svelte:head>
	<title>{data.post?.title ?? 'Post Not Found'} - Brian Schwabauer</title>
	{#if summary}
		<meta name="description" content={summary} />
	{/if}
	{#if data.post}
		<meta property="og:title" content={data.post.title} />
		{#if summary}
			<meta property="og:description" content={summary} />
		{/if}
		<meta property="og:type" content="article" />
		{#if ogImage}
			<meta property="og:image" content={ogImage} />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:image" content={ogImage} />
		{/if}
	{/if}
</svelte:head>

<article class="post-page">
	{#if data.post}
		{#if isAdmin}
			<a
				class="edit-post-fab"
				href={`/admin/blog/${data.post.slug}`}
				title="Edit this post">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					width="16"
					height="16">
					<path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
				</svg>
				<span>Edit Post</span>
			</a>
		{/if}
		{#if data.isDraftPreview}
			<div class="draft-banner" role="status">
				Draft preview — only visible to admins until published
			</div>
		{/if}
		<header class="post-header">
			<div class="post-meta">
				<time class="post-date" datetime={isoPostDate(data.post.publishedAt)}>
					{formatPostDate(data.post.publishedAt)}
				</time>
			</div>

			<h1 class="post-title" style:view-transition-name="post-title-{data.post.slug}">
				{data.post.title}
			</h1>

			{#if summary}
				<p class="post-excerpt">{summary}</p>
			{/if}

			{#if tags.length > 0}
				<div class="post-tags">
					{#each tags as tag}
						<a
							class="tag"
							href="/blog?tag={encodeURIComponent(tag)}"
							title="Filter posts by {tag}">
							{tag}
						</a>
					{/each}
				</div>
			{/if}
		</header>

		{#if featured}
			<figure
				class="post-featured"
				style={bgStyle(featured)}
				style:view-transition-name="post-image-{data.post.slug}"
				style:view-transition-class="blog-cover">
				<img
					src={`/cdn/image/${featured.path}/default`}
					alt={featured.alt_text ?? ''}
					width={featured.width || undefined}
					height={featured.height || undefined}
					loading="eager"
					decoding="async"
					style:object-position={`${focalX}% ${focalY}%`} />
			</figure>
		{/if}

		<div class="post-content prose" bind:this={contentEl}>
			{@html data.contentHtml}
		</div>

		<footer class="post-footer">
			<Button href="/blog" outline>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					width="16"
					height="16">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				Back to Blog
			</Button>
		</footer>
	{:else}
		<div class="not-found">
			<h1>Post Not Found</h1>
			<p>The post you're looking for doesn't exist or has been removed.</p>
			<Button href="/blog">Back to Blog</Button>
		</div>
	{/if}
</article>

<style>
	/* ── Page shell — Medium-style two-tier width ────────────────────────
	   The page itself is bounded by --prose-wide so wide images can
	   actually appear at their natural size. Text is bounded by --measure
	   (~80ch) via the shared .prose rules in app.css; only block-level
	   figures opt out and span up to --prose-wide.
	*/
	.post-page {
		position: relative;
		max-width: var(--prose-wide);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-24);
	}

	.edit-post-fab {
		position: fixed;
		bottom: var(--space-4);
		right: var(--space-4);
		z-index: 30;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		font-size: var(--text-sm);
		font-weight: 500;
		box-shadow: var(--shadow-md);
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.edit-post-fab:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.draft-banner {
		max-width: var(--measure);
		margin: 0 auto var(--space-6);
		padding: var(--space-2) var(--space-4);
		text-align: center;
		font-size: var(--text-sm);
		color: var(--color-warning);
		background: color-mix(in oklch, var(--color-warning) 14%, transparent);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-md);
	}

	@media (min-width: 768px) {
		.post-page {
			padding: var(--space-8) var(--space-8) var(--space-24);
		}
	}

	.post-header {
		max-width: var(--measure);
		margin: 0 auto var(--space-10);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.post-date {
		color: var(--color-text-muted);
	}

	.post-title {
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--color-text);
		margin-bottom: var(--space-6);
	}

	@media (min-width: 768px) {
		.post-title {
			font-size: 3rem;
		}
	}

	.post-excerpt {
		font-size: 1.25rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
		margin-bottom: var(--space-6);
		font-weight: 400;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tag {
		display: inline-block;
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid transparent;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		text-decoration: none;
		-webkit-tap-highlight-color: transparent;
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			transform var(--transition-fast);
	}
	.tag:hover {
		color: var(--color-text);
		background: var(--color-surface);
		border-color: var(--color-accent);
	}
	.tag:focus {
		outline: none;
	}
	.tag:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	.tag:active {
		transform: scale(0.97);
	}

	@media (prefers-reduced-motion: reduce) {
		.tag {
			transition: none;
		}
		.tag:active {
			transform: none;
		}
	}

	.post-featured {
		margin: 0 auto var(--space-12);
		max-width: var(--measure);
		overflow: hidden;
		border-radius: var(--radius-lg);
		aspect-ratio: 2.35;
	}

	.post-featured img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* The .prose class (defined in app.css) handles the inner text-column
	   width and typography. We keep the wrapper full --prose-wide so any
	   wide/full-bleed figure inside can break out beyond --measure. */
	.post-content {
		margin: 0 auto var(--space-12);
	}

	.post-footer {
		max-width: var(--measure);
		margin: 0 auto;
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border);
	}

	.not-found {
		max-width: var(--measure);
		margin: 0 auto;
		text-align: center;
		padding: var(--space-24) 0;
	}

	.not-found h1 {
		font-size: var(--text-3xl);
		margin-bottom: var(--space-4);
	}

	.not-found p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}

	/* ── BlogImage rendering ──────────────────────────────────────────────
	   Three width modes set on the saved figure:
	     normal  — sits inside the text column (clamped to --measure)
	     wide    — breaks out up to --prose-wide (centered via 50% trick)
	     full    — full viewport bleed
	*/
	.post-content :global(figure.blog-img) {
		position: relative;
		margin: var(--space-10) auto;
		display: block;
	}

	.post-content :global(figure.blog-img[data-width-mode='normal']) {
		width: var(--blog-img-pct, 100%);
		max-width: var(--measure);
		margin-left: auto;
		margin-right: auto;
	}

	.post-content :global(figure.blog-img[data-width-mode='wide']) {
		width: var(--prose-wide);
		max-width: calc(100vw - 2rem);
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.post-content :global(figure.blog-img[data-width-mode='full']) {
		width: 100vw;
		max-width: 100vw;
		margin-left: 50%;
		transform: translateX(-50%);
		border-radius: 0;
	}

	.post-content :global(figure.blog-img img) {
		display: block;
		width: 100%;
		height: auto;
		background: var(--blog-img-bg, var(--color-bg-secondary));
		border-radius: var(--radius-md);
	}

	.post-content :global(figure.blog-img[data-width-mode='full'] img) {
		border-radius: 0;
	}

	/* Crop mode: the figure forces an aspect-ratio (always wider/shorter than
	   the image's natural ratio) and the img fills it via object-fit:cover
	   using the saved focal point. */
	.post-content :global(figure.blog-img.is-cropped) {
		aspect-ratio: var(--blog-img-crop-aspect);
		overflow: hidden;
		border-radius: var(--radius-md);
	}
	.post-content :global(figure.blog-img.is-cropped[data-width-mode='full']) {
		border-radius: 0;
	}
	.post-content :global(figure.blog-img.is-cropped img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--blog-img-focal-x, 50%) var(--blog-img-focal-y, 50%);
		border-radius: 0;
	}

	/* Caption overlay — only emitted when the figure has a caption. Sits over
	   the bottom of the image with a black gradient so light/dark images both
	   stay readable. The figure itself doesn't clip (so wide-mode breakouts
	   keep working); the figcaption uses the image's bounds via absolute
	   positioning at the figure root. */
	.post-content :global(figure.blog-img figcaption) {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--space-8) var(--space-4) var(--space-3);
		color: white;
		font-size: 0.9375rem;
		line-height: 1.4;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		background: linear-gradient(to top, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0));
		border-bottom-left-radius: var(--radius-md);
		border-bottom-right-radius: var(--radius-md);
		pointer-events: none;
	}

	.post-content :global(figure.blog-img[data-width-mode='full'] figcaption) {
		border-radius: 0;
	}

	/* ── BlogVideo (HLS embed) ────────────────────────────────────────────
	   Three width modes mirror BlogImage. `.blog-video-mount` is the poster
	   placeholder shown until blog/[slug] hydrates a video.js player into it. */
	.post-content :global(figure.blog-video) {
		margin: var(--space-10) auto;
		display: block;
	}

	.post-content :global(figure.blog-video[data-width-mode='normal']) {
		width: var(--blog-video-pct, 100%);
		max-width: var(--measure);
		margin-left: auto;
		margin-right: auto;
	}

	.post-content :global(figure.blog-video[data-width-mode='wide']) {
		width: var(--prose-wide);
		max-width: calc(100vw - 2rem);
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.post-content :global(figure.blog-video[data-width-mode='full']) {
		width: 100vw;
		max-width: 100vw;
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.post-content :global(figure.blog-video .blog-video-mount) {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #000;
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.post-content :global(figure.blog-video[data-width-mode='full'] .blog-video-mount) {
		border-radius: 0;
	}

	.post-content :global(figure.blog-video .blog-video-poster) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.post-content :global(figure.blog-video .blog-video-play) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 72px;
		height: 72px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.5);
		border: 1.5px solid rgba(255, 255, 255, 0.9);
	}

	.post-content :global(figure.blog-video .blog-video-play::before) {
		content: '';
		position: absolute;
		top: 50%;
		left: 54%;
		transform: translate(-50%, -50%);
		border-style: solid;
		border-width: 12px 0 12px 20px;
		border-color: transparent transparent transparent #fff;
	}

	.post-content :global(figure.blog-video figcaption),
	.post-content :global(figure.blog-audio figcaption) {
		margin-top: var(--space-3);
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--color-text-muted);
		text-align: center;
	}

	/* ── BlogAudio (native <audio>) ─────────────────────────────────────── */
	.post-content :global(figure.blog-audio) {
		max-width: var(--measure);
		margin: var(--space-10) auto;
		padding: var(--space-4);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.post-content :global(figure.blog-audio .blog-audio-title) {
		display: block;
		font-weight: 600;
		font-size: 0.9375rem;
		margin-bottom: var(--space-2);
		color: var(--color-text-secondary);
	}

	.post-content :global(figure.blog-audio audio) {
		width: 100%;
		display: block;
	}
</style>
