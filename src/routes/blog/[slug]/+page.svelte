<script lang="ts">
	import { Button } from '@delightstack/components/actions';

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
</script>

<svelte:head>
	<title>{data.post?.title ?? 'Post Not Found'} - Brian Schwabauer</title>
	{#if summary}
		<meta name="description" content={summary} />
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

		<div class="post-content prose">
			{#if data.post.contentHtml}
				{@html data.post.contentHtml}
			{:else}
				<p>{data.post.content}</p>
			{/if}
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
	.post-page {
		max-width: var(--container-md);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.post-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.post-header {
		margin-bottom: var(--space-12);
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

	.post-content {
		margin-bottom: var(--space-12);
	}

	.post-footer {
		padding-top: var(--space-8);
		border-top: 1px solid var(--color-border);
	}

	.not-found {
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
</style>
