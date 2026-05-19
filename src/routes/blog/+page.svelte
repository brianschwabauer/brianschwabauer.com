<script lang="ts">
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import FeaturedPostCard from '$lib/components/blog/FeaturedPostCard.svelte';
	import PostFilters from '$lib/components/blog/PostFilters.svelte';

	let { data } = $props();

	let activeTag = $state<string | null>(null);

	const filteredPosts = $derived(
		activeTag
			? data.posts.filter((p) => p.tags?.some((t) => t.toLowerCase() === activeTag!.toLowerCase()))
			: data.posts
	);

	const pinnedPosts = $derived(
		[...filteredPosts]
			.filter((p) => p.pinned)
			.sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt))
	);

	const regularPosts = $derived(filteredPosts.filter((p) => !p.pinned));

	const allTags = $derived.by(() => {
		const seen = new Map<string, string>();
		for (const p of data.posts) {
			for (const t of p.tags ?? []) {
				const key = t.toLowerCase();
				if (!seen.has(key)) seen.set(key, t);
			}
		}
		return [...seen.values()].sort((a, b) => a.localeCompare(b));
	});
</script>

<svelte:head>
	<title>Blog - Brian Schwabauer</title>
	<meta
		name="description"
		content="Thoughts on development, creativity, and the journey of building things."
	/>
</svelte:head>

<div class="blog-page">
	<div class="blog-header">
		<h1 class="blog-title">Blog</h1>
		<p class="blog-subtitle">Thoughts on development, creativity, and the journey of building things.</p>
	</div>

	{#if allTags.length > 0}
		<div class="blog-filters">
			<PostFilters tags={allTags} {activeTag} onChange={(t) => (activeTag = t)} />
		</div>
	{/if}

	{#if pinnedPosts.length > 0}
		<section class="featured-section" aria-label="Featured posts">
			<div class="featured-grid" class:single={pinnedPosts.length === 1}>
				{#each pinnedPosts as post (post.slug)}
					<FeaturedPostCard {post} />
				{/each}
			</div>
		</section>
	{/if}

	{#if regularPosts.length > 0}
		<div class="posts-grid">
			{#each regularPosts as post (post.slug)}
				<PostCard {post} />
			{/each}
		</div>
	{:else if pinnedPosts.length === 0}
		<div class="empty-state">
			<p>No posts yet. Check back soon!</p>
		</div>
	{/if}
</div>

<style>
	.blog-page {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.blog-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.blog-header {
		text-align: center;
		margin-bottom: var(--space-12);
	}

	.blog-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
	}

	@media (min-width: 768px) {
		.blog-title {
			font-size: var(--text-5xl);
		}
	}

	.blog-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		max-width: 500px;
		margin: 0 auto;
	}

	.blog-filters {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-12);
	}

	.featured-section {
		margin-bottom: var(--space-12);
	}

	.featured-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 1024px) {
		.featured-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-8);
		}

		.featured-grid.single {
			grid-template-columns: 1fr;
		}
	}

	.posts-grid {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 768px) {
		.posts-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-8);
		}
	}

	@media (min-width: 1024px) {
		.posts-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16);
		color: var(--color-text-muted);
	}
</style>
