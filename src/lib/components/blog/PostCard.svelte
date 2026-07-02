<script lang="ts">
	import type { BlogPostMeta } from '$lib/server/blog';
	import { bgStyle, thumbnailURL } from '$lib/client/images';
	import { formatPostDate, isoPostDate } from '$lib/utils/date';
	import { ripple } from '@delightstack/utilities';

	interface Props {
		post: BlogPostMeta;
	}

	let { post }: Props = $props();

	const summary = $derived(post.summary ?? post.aiSummary ?? '');
</script>

<article class="post-card">
	<a href="/blog/{post.slug}" class="post-link" {@attach ripple({ zIndex: 1 })}>
		{#if post.featuredImage}
			<div
				class="post-image"
				style={bgStyle(post.featuredImage)}
				style:view-transition-name="post-image-{post.slug}"
				style:view-transition-class="blog-cover">
				<img
					src={thumbnailURL(post.featuredImage)}
					alt={post.featuredImage.alt_text ?? ''}
					loading="lazy" />
			</div>
		{/if}
		<div class="post-body">
			<div class="post-meta">
				<time class="post-date" datetime={isoPostDate(post.publishedAt)}>
					{formatPostDate(post.publishedAt)}
				</time>
			</div>

			<h2 class="post-title" style:view-transition-name="post-title-{post.slug}">
				{post.title}
			</h2>

			{#if summary}
				<p class="post-excerpt">{summary}</p>
			{/if}

			{#if post.tags.length > 0}
				<div class="post-tags">
					{#each post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}

			<span class="read-more">
				Read article
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="5" y1="12" x2="19" y2="12" />
					<polyline points="12 5 19 12 12 19" />
				</svg>
			</span>
		</div>
	</a>
</article>

<style>
	.post-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition:
			border-color var(--duration-fast),
			transform var(--duration-fast),
			box-shadow var(--duration-fast);
	}

	.post-card:hover {
		transition-duration: 0s;
		border-color: var(--color-action);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	/* Same press-down recipe as the tag chips and delightstack <Button>:
	   `perspective()` inside the transform so each card is its own
	   vanishing point. :has(:active) lets us read the active state of
	   the inner <a> from the article so the existing hover transform
	   on .post-card cleanly cascades into the press. */
	.post-card:has(:active) {
		transform: perspective(100px)
			translate3d(0, 1px, clamp(-10px, calc(0.2em - 12px), -2px));
	}

	.post-link {
		/* Anchors the ripple overlay inside the card. .post-card already
		   has overflow:hidden + border-radius, so the ripple is clipped
		   to the rounded card silhouette. */
		position: relative;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
		height: 100%;
	}

	.post-image {
		width: 100%;
		aspect-ratio: 2.35 / 1;
		overflow: hidden;
		border-bottom: 1px solid var(--color-border);
	}

	.post-image img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.post-body {
		display: flex;
		flex-direction: column;
		padding: var(--space-5);
		flex: 1;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
		font-size: var(--text-sm);
	}

	.post-date {
		color: var(--color-text-muted);
	}

	.post-title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-2);
		line-height: var(--leading-tight);
		color: var(--color-text);
	}

	.post-excerpt {
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-3);
		flex: 1;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-3);
	}

	.tag {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-muted);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-action);
		margin-top: auto;
	}

	.read-more svg {
		width: 16px;
		height: 16px;
		transition: transform var(--duration-fast);
	}

	.post-card:hover .read-more svg {
		transition-duration: 0s;
		transform: translateX(4px);
	}
</style>
