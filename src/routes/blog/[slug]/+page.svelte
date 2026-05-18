<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import { bgStyle } from '$lib/client/images';

	let { data } = $props();

	function formatDate(date: number | null | undefined) {
		if (!date) return '';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	const summary = $derived(data.post?.summary ?? data.post?.aiSummary ?? '');
	const tags = $derived(data.post?.tags ?? []);
	const featured = $derived(data.post?.featuredImage ?? null);
	const ogImage = $derived(featured ? `/cdn/image/${featured.path}/default` : null);
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
		<header class="post-header">
			<div class="post-meta">
				{#if data.post.category}
					<span class="post-category">{data.post.category}</span>
				{/if}
				<time class="post-date">{formatDate(data.post.publishedAt)}</time>
			</div>

			<h1 class="post-title">{data.post.title}</h1>

			{#if summary}
				<p class="post-excerpt">{summary}</p>
			{/if}

			{#if tags.length > 0}
				<div class="post-tags">
					{#each tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</header>

		{#if featured}
			<figure
				class="post-featured"
				style={bgStyle(featured)}
				style:aspect-ratio={featured.aspect_ratio || 16 / 9}>
				<img
					src={`/cdn/image/${featured.path}/default`}
					alt={featured.alt_text ?? ''}
					width={featured.width || undefined}
					height={featured.height || undefined}
					loading="eager"
					decoding="async" />
			</figure>
		{/if}

		<div class="post-content prose">
			{@html data.contentHtml}
		</div>

		<footer class="post-footer">
			<Button href="/blog" outline>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
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
	/* ── Page shell + Medium-style layout ────────────────────────────────
	   The page uses a "text column" CSS variable that's wider on desktop
	   (~80ch) but reflows on mobile. Inline images can break out of this
	   column via their own data-width-mode attributes.
	*/
	.post-page {
		--text-col-width: min(80ch, calc(100vw - 2rem));
		--wide-width: min(1100px, calc(100vw - 2rem));
		max-width: var(--wide-width);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.post-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.post-header {
		max-width: var(--text-col-width);
		margin: 0 auto var(--space-8);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.post-category {
		color: var(--color-accent);
		font-weight: 500;
	}

	.post-date {
		color: var(--color-text-muted);
	}

	.post-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		line-height: var(--leading-tight);
		margin-bottom: var(--space-6);
	}

	@media (min-width: 768px) {
		.post-title {
			font-size: var(--text-5xl);
		}
	}

	.post-excerpt {
		font-size: var(--text-xl);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tag {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
	}

	.post-featured {
		margin: 0 auto var(--space-12);
		max-width: var(--wide-width);
		overflow: hidden;
		border-radius: var(--radius-lg);
	}

	.post-featured img {
		display: block;
		width: 100%;
		height: auto;
	}

	.post-content {
		max-width: var(--text-col-width);
		margin: 0 auto var(--space-12);
	}

	.post-footer {
		max-width: var(--text-col-width);
		margin: 0 auto;
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border);
	}

	.not-found {
		max-width: var(--text-col-width);
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

	/* ── BlogImage rendering ────────────────────────────────────────────── */

	.post-content :global(figure.blog-img) {
		margin: var(--space-8) auto;
		display: block;
	}

	.post-content :global(figure.blog-img[data-width-mode='normal']) {
		width: var(--blog-img-pct, 100%);
		margin-left: auto;
		margin-right: auto;
	}

	.post-content :global(figure.blog-img[data-width-mode='wide']) {
		/* Break out beyond the 80ch text column up to the page's wide width */
		width: var(--wide-width, min(1100px, calc(100vw - 2rem)));
		max-width: calc(100vw - 2rem);
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.post-content :global(figure.blog-img[data-width-mode='full']) {
		/* Full viewport bleed */
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

	.post-content :global(figure.blog-img figcaption) {
		text-align: center;
		font-size: var(--text-sm);
		color: var(--color-text-muted);
		margin-top: var(--space-2);
	}
</style>
