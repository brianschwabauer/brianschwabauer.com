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
	const focalX = $derived(typeof post.coverFocalX === 'number' ? post.coverFocalX : 50);
	const focalY = $derived(typeof post.coverFocalY === 'number' ? post.coverFocalY : 50);
</script>

<article class="featured-card">
	<a href="/blog/{post.slug}" class="featured-link" {@attach ripple({ zIndex: 1 })}>
		{#if post.featuredImage}
			<div
				class="featured-image"
				style={bgStyle(post.featuredImage)}
				style:view-transition-name="post-image-{post.slug}"
				style:view-transition-class="blog-cover">
				<img
					src={thumbnailURL(post.featuredImage)}
					alt={post.featuredImage.alt_text ?? ''}
					style:object-position="{focalX}% {focalY}%"
					loading="eager"
					fetchpriority="high" />
			</div>
		{/if}
		<div class="featured-body">
			<div class="featured-meta">
				<time class="featured-date" datetime={isoPostDate(post.publishedAt)}>
					{formatPostDate(post.publishedAt)}
				</time>
			</div>

			<h2 class="featured-title" style:view-transition-name="post-title-{post.slug}">
				{post.title}
			</h2>

			{#if summary}
				<p class="featured-excerpt">{summary}</p>
			{/if}

			{#if post.tags.length > 0}
				<div class="featured-tags">
					{#each post.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</div>
	</a>
</article>

<style>
	/* See PostCard.svelte — same animated-press recipe: --press has its
	   own transition entry so the depress stays smooth while the hover
	   rule zeroes the other durations. */
	@property --press {
		syntax: '<number>';
		inherits: false;
		initial-value: 0;
	}

	.featured-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		transform: translateY(var(--lift, 0px)) perspective(100px)
			translate3d(
				0,
				calc(var(--press) * 1px),
				calc(var(--press) * clamp(-10px, 0.2em - 12px, -2px))
			);
		transition:
			border-color var(--duration-fast),
			transform var(--duration-fast),
			box-shadow var(--duration-fast),
			--press var(--duration-fast);
		@supports (corner-shape: squircle) {
			corner-shape: squircle;
			border-radius: calc(var(--radius-xl) * 2);
		}
	}

	.featured-card:hover {
		transition-duration: 0s, 0s, 0s, var(--duration-fast);
		border-color: var(--color-action);
		--lift: -4px;
		box-shadow: var(--shadow-lg);
	}

	.featured-card:has(:active) {
		--press: 1;
	}

	.featured-link {
		/* Anchors the ripple inside the card. */
		position: relative;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: inherit;
		height: 100%;
	}

	.featured-image {
		width: 100%;
		aspect-ratio: 2.35 / 1;
		overflow: hidden;
		border-bottom: 1px solid var(--color-border);
	}

	.featured-image img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.featured-body {
		display: flex;
		flex-direction: column;
		padding: var(--space-6);
		flex: 1;
	}

	@media (min-width: 768px) {
		.featured-body {
			padding: var(--space-7);
		}
	}

	.featured-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-1);
		font-size: var(--text-sm);
	}

	.featured-date {
		color: var(--color-text-muted);
	}

	.featured-title {
		font-size: var(--text-2xl);
		font-weight: 700;
		line-height: var(--leading-tight);
		margin-bottom: var(--space-3);
		color: var(--color-text);
	}

	@media (min-width: 768px) {
		.featured-title {
			font-size: var(--text-3xl);
		}
	}

	@media (min-width: 1024px) {
		.featured-title {
			font-size: var(--text-4xl);
		}
	}

	.featured-excerpt {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-4);
		flex: 1;
	}

	.featured-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		margin-top: auto;
	}

	/* Purely decorative here — the whole card is the link, so these stay
	   filled pills rather than the outlined, interactive tag treatment. */
	.tag {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-muted);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
	}
</style>
