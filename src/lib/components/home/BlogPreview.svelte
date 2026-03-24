<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import type { BlogPost } from '$lib/server/db/schema';

	interface Props {
		posts?: BlogPost[];
	}

	let { posts = [] }: Props = $props();

	// Placeholder posts if none provided
	const displayPosts = $derived(
		posts.length > 0
			? posts
			: [
					{
						id: '1',
						slug: 'coming-soon',
						title: 'Blog Coming Soon',
						excerpt:
							"I'm working on some thoughts about development, creativity, and the journey of building things. Stay tuned!",
						category: 'Thoughts',
						publishedAt: new Date()
					}
				]);

	function formatDate(date: Date | number | null | undefined) {
		if (!date) return '';
		const d = date instanceof Date ? date : new Date(date);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<section class="blog-preview">
	<div class="blog-preview-inner">
		<div class="section-header scroll-reveal">
			<h2 class="section-title">Latest Thoughts</h2>
			<Button href="/blog" transparent>View All Posts</Button>
		</div>

		<div class="posts-grid">
			{#each displayPosts.slice(0, 3) as post, i}
				<article class="post-card scroll-reveal" style="--delay: {i * 100}ms">
					<div class="post-meta">
						{#if post.category}
							<span class="post-category">{post.category}</span>
						{/if}
						<span class="post-date">{formatDate(post.publishedAt)}</span>
					</div>
					<h3 class="post-title">
						<a href="/blog/{post.slug}">{post.title}</a>
					</h3>
					{#if post.excerpt}
						<p class="post-excerpt">{post.excerpt}</p>
					{/if}
					<a href="/blog/{post.slug}" class="post-link">
						Read more
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="5" y1="12" x2="19" y2="12" />
							<polyline points="12 5 19 12 12 19" />
						</svg>
					</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.blog-preview {
		padding: var(--space-24) 0;
		background: var(--color-bg-secondary);
	}

	.blog-preview-inner {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	@media (min-width: 768px) {
		.blog-preview-inner {
			padding: 0 var(--space-8);
		}
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-12);
	}

	.section-title {
		font-size: var(--text-3xl);
		font-weight: 700;
	}

	.posts-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 768px) {
		.posts-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-8);
		}
	}

	.post-card {
		padding: var(--space-6);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		transition: border-color var(--transition-fast), transform var(--transition-fast);
	}

	.post-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-4px);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
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
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-3);
		line-height: var(--leading-tight);
	}

	.post-title a {
		color: var(--color-text);
		text-decoration: none;
	}

	.post-title a:hover {
		color: var(--color-accent);
	}

	.post-excerpt {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-4);
		flex: 1;
	}

	.post-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-accent);
	}

	.post-link svg {
		width: 16px;
		height: 16px;
		transition: transform var(--transition-fast);
	}

	.post-link:hover svg {
		transform: translateX(4px);
	}
</style>
