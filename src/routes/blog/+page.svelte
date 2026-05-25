<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import FeaturedPostCard from '$lib/components/blog/FeaturedPostCard.svelte';
	import PostFilters from '$lib/components/blog/PostFilters.svelte';

	let { data } = $props();

	/**
	 * The URL's `?tag=` is the source of truth for the active filter — that
	 * way refresh, bookmark, and back/forward all just work. We canonicalize
	 * the URL value's casing against whatever a post actually uses so the
	 * chip label matches post-side spelling (e.g. `?tag=vfx` → "Vfx" chip).
	 * If no post uses the tag at all (e.g. bookmarked URL pointing to a
	 * deleted tag), we keep the raw URL value as the label so the active
	 * chip is still visible — clicking "All Posts" clears it.
	 */
	const activeTagParam = $derived(page.url.searchParams.get('tag') || null);
	const activeTag = $derived.by(() => {
		if (!activeTagParam) return null;
		const key = activeTagParam.toLowerCase();
		for (const p of data.posts) {
			for (const t of p.tags ?? []) {
				if (t.toLowerCase() === key) return t;
			}
		}
		return activeTagParam;
	});

	function setActiveTag(tag: string | null) {
		const url = new URL(page.url);
		if (tag) url.searchParams.set('tag', tag);
		else url.searchParams.delete('tag');
		goto(url, { keepFocus: true, noScroll: true });
	}

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

	/**
	 * Surface the top filter chips by usage: tags must be used on at least
	 * 2 posts to clear the noise floor (kills WordPress-import long-tail),
	 * then we keep the top 5 by count. Ties break alphabetically so the
	 * order is stable as you write new posts. Tags themselves still live
	 * on each post — this only trims the filter row.
	 *
	 * `FILTER_HIDDEN_TAGS` are tags that should never appear in the filter
	 * row regardless of popularity (e.g. "Archive" — it's a bookkeeping
	 * label, not a topic worth slicing the list by). The tag still renders
	 * on individual post cards; it just isn't an option here.
	 */
	const POPULAR_TAG_LIMIT = 5;
	const POPULAR_TAG_MIN_POSTS = 2;
	const FILTER_HIDDEN_TAGS = new Set(['archive']);
	const popularTags = $derived.by(() => {
		const counts = new Map<string, { display: string; count: number }>();
		for (const p of data.posts) {
			for (const t of p.tags ?? []) {
				const key = t.toLowerCase();
				if (FILTER_HIDDEN_TAGS.has(key)) continue;
				const entry = counts.get(key);
				if (entry) entry.count += 1;
				else counts.set(key, { display: t, count: 1 });
			}
		}
		return [...counts.values()]
			.filter((t) => t.count >= POPULAR_TAG_MIN_POSTS)
			.sort((a, b) => b.count - a.count || a.display.localeCompare(b.display))
			.slice(0, POPULAR_TAG_LIMIT)
			.map((t) => t.display);
	});

	/**
	 * The chip row is the popular tags plus, if needed, the currently-active
	 * tag so a deep-linked filter is always visible as a selected chip.
	 * Appended at the end so the popularity ordering of the top 5 stays put.
	 */
	const displayTags = $derived.by(() => {
		if (!activeTag) return popularTags;
		const key = activeTag.toLowerCase();
		if (popularTags.some((t) => t.toLowerCase() === key)) return popularTags;
		return [...popularTags, activeTag];
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

	{#if displayTags.length > 0}
		<div class="blog-filters">
			<PostFilters tags={displayTags} {activeTag} onChange={setActiveTag} />
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
