<script lang="ts">
	import type { BlogPostMeta } from "$lib/server/blog";
	import { bgStyle, thumbnailURL } from "$lib/client/images";
	import { formatPostDate, isoPostDate } from "$lib/utils/date";
	import { ripple } from "@delightstack/utilities";

	interface Props {
		post: BlogPostMeta;
	}

	let { post }: Props = $props();

	const summary = $derived(post.summary ?? post.aiSummary ?? "");
	const focalX = $derived(
		typeof post.coverFocalX === "number" ? post.coverFocalX : 50,
	);
	const focalY = $derived(
		typeof post.coverFocalY === "number" ? post.coverFocalY : 50,
	);
</script>

<article class="featured-card">
	<a
		href="/blog/{post.slug}"
		class="featured-link"
		{@attach ripple({ zIndex: 1 })}
	>
		{#if post.featuredImage}
			<div
				class="featured-image"
				style={bgStyle(post.featuredImage)}
				style:view-transition-name="post-image-{post.slug}"
				style:view-transition-class="blog-cover"
			>
				<img
					src={thumbnailURL(post.featuredImage)}
					alt={post.featuredImage.alt_text ?? ""}
					style:object-position="{focalX}% {focalY}%"
					loading="eager"
				/>
			</div>
		{/if}
		<div class="featured-body">
			<div class="featured-meta">
				<span class="featured-pin" aria-label="Pinned">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<line x1="12" x2="12" y1="17" y2="22" />
						<path
							d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"
						/>
					</svg>
					Featured
				</span>
				<time class="featured-date" datetime={isoPostDate(post.publishedAt)}
					>{formatPostDate(post.publishedAt)}</time
				>
			</div>

			<h2
				class="featured-title"
				style:view-transition-name="post-title-{post.slug}"
			>
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

			<span class="read-more">
				Read article
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="5" y1="12" x2="19" y2="12" />
					<polyline points="12 5 19 12 12 19" />
				</svg>
			</span>
		</div>
	</a>
</article>

<style>
	.featured-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition:
			border-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.featured-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	/* See PostCard.svelte — same press-down recipe. */
	.featured-card:has(:active) {
		transform: perspective(100px)
			translate3d(0, 1px, clamp(-10px, calc(0.2em - 12px), -2px));
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
		padding: var(--space-8);
		flex: 1;
	}

	@media (min-width: 768px) {
		.featured-body {
			padding: var(--space-10);
		}
	}

	.featured-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.featured-pin {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: rgba(0, 180, 160, 0.12);
		color: var(--color-accent);
		font-weight: 600;
		font-size: var(--text-xs);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.featured-pin svg {
		width: 12px;
		height: 12px;
	}

	.featured-date {
		color: var(--color-text-muted);
	}

	.featured-title {
		font-size: var(--text-2xl);
		font-weight: 700;
		line-height: var(--leading-tight);
		margin-bottom: var(--space-4);
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
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-5);
		flex: 1;
	}

	.featured-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-5);
	}

	.tag {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-accent);
		margin-top: auto;
	}

	.read-more svg {
		width: 18px;
		height: 18px;
		transition: transform var(--transition-fast);
	}

	.featured-card:hover .read-more svg {
		transform: translateX(4px);
	}
</style>
