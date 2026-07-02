<script lang="ts">
	import { page, navigating } from '$app/state';
	import { goto } from '$app/navigation';
	import { fly, scale, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { backIn, quintOut } from 'svelte/easing';
	import PostCard from '$lib/components/blog/PostCard.svelte';
	import FeaturedPostCard from '$lib/components/blog/FeaturedPostCard.svelte';
	import PostFilters from '$lib/components/blog/PostFilters.svelte';

	let { data } = $props();

	/**
	 * `mounted` gates the card entrance/exit transitions. It starts false so
	 * the initial SSR-hydrated list paints with no motion (anything else
	 * would jolt the already-rendered cards on hydration), then flips true
	 * in the post-mount effect. Because this page stays mounted across tag
	 * filter changes — only the keyed each block reconciles — `mounted`
	 * remains true for the rest of the session, so every subsequent filter
	 * switch animates the entering/leaving cards.
	 */
	let mounted = $state(false);
	$effect(() => {
		mounted = true;
	});

	/**
	 * Transitions are scoped to filter changes only. /blog ↔ /blog/[slug]
	 * navigation is already animated by the page-level view transition in
	 * +layout.svelte; letting Svelte's in/out also fire there made the
	 * outgoing card linger in the DOM at view-transition-snapshot time,
	 * which polluted the destination snapshot and broke the morph.
	 *
	 * A filter change is `/blog → /blog?tag=…` (same pathname, just a
	 * query change), so the pathname-vs-pathname check cleanly separates
	 * the two cases.
	 */
	const isCrossPageNav = $derived(
		!!(
			navigating.from &&
			navigating.to &&
			navigating.from.url.pathname !== navigating.to.url.pathname
		),
	);

	/**
	 * Stagger + slide-up entrance for cards added to a filtered list.
	 * No-ops on initial mount (`enabled` is false until `mounted` flips)
	 * and during cross-page navigation (the view transition handles it).
	 * Returning `{ duration: 0, css: () => '' }` means Svelte writes no
	 * inline style at all on the disabled path — important so the
	 * already-painted card doesn't jolt to a "from" state.
	 */
	function flyIn(
		node: Element,
		params: { enabled: boolean; crossPage: boolean; index: number },
	) {
		if (!params.enabled || params.crossPage) return { duration: 0, css: () => '' };
		return fly(node as HTMLElement, {
			y: 20,
			duration: 300,
			delay: params.index * 35,
			easing: quintOut,
		});
	}

	/**
	 * "Pops" out cards leaving the filtered list. Built on Svelte's `scale`
	 * transition with `backIn` easing: backIn dips below 0 around t≈0.42,
	 * which makes Svelte's `scale(1 - sd*u)` formula briefly exceed 1
	 * (~1.09 peak) before settling to 0 — i.e. the card swells slightly,
	 * then shrinks to nothing.
	 *
	 * `pin: true` lifts the card out of grid flow at its old geometry so
	 * the grid reflows to the new list immediately — otherwise the page
	 * briefly grows by several rows and snaps back as the animation
	 * completes (a very visible footer jump going from "All Posts" to a
	 * small filter). Used for the regular posts grid.
	 *
	 * `pin: false` leaves the card in flow. Used for the featured section
	 * which is animated by `transition:slide` on the section itself —
	 * pinning would empty the section's in-flow content and break slide's
	 * height measurement, so we let the card scale away in place inside
	 * the section's closing clip.
	 *
	 * Skipped entirely during cross-page navigation: the view transition
	 * is already animating the visual, and lingering cards here would
	 * pollute the destination page's view-transition snapshot.
	 */
	function popOut(
		node: Element,
		params: { enabled: boolean; crossPage: boolean; pin?: boolean },
	) {
		if (!params.enabled || params.crossPage) return { duration: 0, css: () => '' };
		const el = node as HTMLElement;
		el.style.pointerEvents = 'none';
		if (params.pin) {
			const parent = el.parentElement;
			if (parent) {
				const r = el.getBoundingClientRect();
				const pr = parent.getBoundingClientRect();
				el.style.position = 'absolute';
				el.style.top = `${r.top - pr.top}px`;
				el.style.left = `${r.left - pr.left}px`;
				el.style.width = `${r.width}px`;
				el.style.height = `${r.height}px`;
			}
		}
		return scale(el, {
			duration: 150,
			easing: backIn,
			start: 0.7,
			opacity: 0,
		});
	}

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
			? data.posts.filter((p) =>
					p.tags?.some((t) => t.toLowerCase() === activeTag!.toLowerCase()),
				)
			: data.posts,
	);

	const pinnedPosts = $derived(
		[...filteredPosts]
			.filter((p) => p.pinned)
			.sort((a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)),
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
		content="Thoughts on software development, creativity, and the journey of building things." />
</svelte:head>

<div class="blog-page">
	<div class="blog-header">
		<h1 class="blog-title">
			<span class="blog-title-line">Blog.</span>
		</h1>
		<p class="blog-subtitle">
			Thoughts on software development, creativity, and the journey of building things.
		</p>
	</div>

	{#if displayTags.length > 0}
		<div class="blog-filters">
			<PostFilters tags={displayTags} {activeTag} onChange={setActiveTag} />
		</div>
	{/if}

	{#if pinnedPosts.length > 0}
		<!-- transition:slide collapses the section's height/padding/margin
		     when pinnedPosts empties out (or expands it when posts come
		     back), so the .posts-grid below glides up smoothly instead of
		     snapping. Cards inside use pin:false so they stay in-flow for
		     slide's height measurement and scale away inside the closing
		     clip. Matching duration to popOut keeps the visuals in sync. -->
		<section
			class="featured-section"
			aria-label="Featured posts"
			transition:slide={{ duration: 200, easing: quintOut }}>
			<div class="featured-grid" class:single={pinnedPosts.length === 1}>
				{#each pinnedPosts as post, i (post.slug)}
					<div
						class="card-anim"
						animate:flip={{ duration: 250, easing: quintOut }}
						in:flyIn|global={{
							enabled: mounted,
							crossPage: isCrossPageNav,
							index: i,
						}}
						out:popOut|global={{
							enabled: mounted,
							crossPage: isCrossPageNav,
							pin: false,
						}}>
						<FeaturedPostCard {post} />
					</div>
				{/each}
			</div>
		</section>
	{/if}

	{#if regularPosts.length > 0}
		<div class="posts-grid">
			{#each regularPosts as post, i (post.slug)}
				<div
					class="card-anim"
					animate:flip={{ duration: 250, easing: quintOut }}
					in:flyIn|global={{
						enabled: mounted,
						crossPage: isCrossPageNav,
						index: i,
					}}
					out:popOut|global={{
						enabled: mounted,
						crossPage: isCrossPageNav,
						pin: true,
					}}>
					<PostCard {post} />
				</div>
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
		max-width: var(--breakpoint-xl);
		margin: 0 auto;
		padding: var(--space-8) var(--space-3) var(--space-10);
	}

	@media (min-width: 768px) {
		.blog-page {
			padding: var(--space-8) var(--space-7) var(--space-10);
		}
	}

	.blog-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	/* Sizing/weight/letter-spacing mirror /contact's .title so the two pages
	   line up visually when you flip between them. line-height 1.15 +
	   padding-bottom on the inner span keep the descender-less "Blog." from
	   collapsing its line box too tightly and let the gradient paint all the
	   way through any future glyph. */
	.blog-title {
		font-size: clamp(2.4rem, 7vw, 4rem);
		font-weight: 900;
		line-height: 1.15;
		letter-spacing: -0.03em;
		margin: 0 0 var(--space-3);
	}

	/* Gradient is identical to /contact's .title-line — the gradient lives on
	   an inline-block span (not the <h1>) because background-clip:text only
	   paints inside the element's content box; the span hugs the text so the
	   stops land at the same offsets they do on the contact page. */
	.blog-title-line {
		display: inline-block;
		padding-bottom: 0.1em;
		background: linear-gradient(95deg, var(--color-text) 0%, var(--color-action) 90%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		/* Same entrance as /contact's .title-line: rise + un-tilt + un-blur in
		   one motion. There's no cycling here, so it only plays once on load. */
		animation: blog-title-in 520ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes blog-title-in {
		from {
			opacity: 0;
			transform: translateY(0.4em) rotate(-1.2deg);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: none;
			filter: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.blog-title-line {
			animation: none;
		}
	}

	.blog-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: 32rem;
		margin: 0 auto;
		line-height: var(--leading-relaxed);
		text-wrap: pretty;
	}

	.blog-filters {
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-8);
	}

	.featured-section {
		margin-bottom: var(--space-8);
	}

	.featured-grid {
		display: grid;
		gap: var(--space-5);
		/* Anchor outgoing cards (position:absolute during their fade-out) so
		   they freeze at their previous grid spot — see FeaturedPostCard.svelte's
		   fadeOut. */
		position: relative;
	}

	@media (min-width: 1024px) {
		.featured-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-7);
		}

		.featured-grid.single {
			grid-template-columns: 1fr;
		}
	}

	/* When only one post is featured, the card stretches to the full grid
	   width and the default 2.35:1 cover ratio turns into a wall of image
	   that dwarfs the title/excerpt. Squash it to ~3:1 so the cover stays
	   a banner instead of a hero. Scoped via :global so the FeaturedPostCard
	   component keeps its taller default in the two-up layout. */
	.featured-grid.single :global(.featured-image) {
		aspect-ratio: 3 / 1;
	}

	.posts-grid {
		display: grid;
		gap: var(--space-5);
		/* See .featured-grid — anchors absolutely-positioned exiting cards. */
		position: relative;
	}

	@media (min-width: 768px) {
		.posts-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-7);
		}
	}

	@media (min-width: 1024px) {
		.posts-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-9);
		color: var(--color-text-muted);
	}

	/* Wraps each card so animate:flip + in:fly + out:fade can ride on a
	   real element that's a direct child of the keyed each. Flex column
	   with the card flex:1 makes the inner article fill the grid cell's
	   stretched height (which the wrapper picks up by being the grid item). */
	.card-anim {
		display: flex;
		flex-direction: column;
	}
	.card-anim > :global(.post-card),
	.card-anim > :global(.featured-card) {
		flex: 1;
	}
</style>
