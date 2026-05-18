<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { Button } from '@delightstack/components/actions';
	import { create, insertMultiple, search, type AnyOrama, type Results } from '@orama/orama';
	import type { BlogPostMeta, BlogStatus } from '$lib/server/blog';

	let { data } = $props();

	type StatusFilter = 'all' | BlogStatus;
	type SortKey = 'updated-desc' | 'date-desc' | 'date-asc' | 'title-asc';

	const adminSchema = {
		id: 'string',
		title: 'string',
		summary: 'string',
		category: 'string',
		tags: 'string[]'
	} as const;

	interface AdminSearchDoc {
		id: string;
		title: string;
		summary: string;
		category: string;
		tags: string[];
	}

	let query = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let sortKey = $state<SortKey>('updated-desc');

	let db = $state<AnyOrama | null>(null);
	let matchedIds = $state<Set<string> | null>(null);

	const postsBySlug = $derived(
		new Map(data.posts.map((p: BlogPostMeta) => [p.slug, p]))
	);

	onMount(async () => {
		const next = create({ schema: adminSchema });
		const docs: AdminSearchDoc[] = data.posts.map((p: BlogPostMeta) => ({
			id: p.slug,
			title: p.title,
			summary: p.summary ?? p.aiSummary ?? '',
			category: p.category ?? '',
			tags: p.tags ?? []
		}));
		if (docs.length > 0) {
			await insertMultiple(next, docs as unknown as Record<string, unknown>[]);
		}
		db = next;
	});

	$effect(() => {
		const term = query.trim();
		const local = db;
		if (!local) return;
		if (!term) {
			untrack(() => (matchedIds = null));
			return;
		}
		(async () => {
			try {
				const r = (await search(local, {
					term,
					properties: ['title', 'summary', 'category', 'tags'],
					limit: 200,
					tolerance: 1
				})) as Results<AdminSearchDoc>;
				const ids = new Set(r.hits.map((h) => h.document.id));
				matchedIds = ids;
			} catch (err) {
				console.error('Admin search failed:', err);
				matchedIds = new Set();
			}
		})();
	});

	const visiblePosts = $derived.by(() => {
		let list: BlogPostMeta[] = data.posts;
		if (statusFilter !== 'all') {
			list = list.filter((p) => p.status === statusFilter);
		}
		if (matchedIds) {
			list = list.filter((p) => matchedIds!.has(p.slug));
		}
		const sorted = [...list];
		switch (sortKey) {
			case 'updated-desc':
				sorted.sort((a, b) => b.updatedAt - a.updatedAt);
				break;
			case 'date-desc':
				sorted.sort(
					(a, b) => (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)
				);
				break;
			case 'date-asc':
				sorted.sort(
					(a, b) => (a.publishedAt ?? a.createdAt) - (b.publishedAt ?? b.createdAt)
				);
				break;
			case 'title-asc':
				sorted.sort((a, b) => a.title.localeCompare(b.title));
				break;
		}
		return sorted;
	});

	const counts = $derived.by(() => {
		const c = { all: data.posts.length, draft: 0, published: 0, archived: 0 };
		for (const p of data.posts as BlogPostMeta[]) c[p.status]++;
		return c;
	});

	function formatDate(date: number | null | undefined) {
		if (!date) return '—';
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Admin — Blog Posts</title>
</svelte:head>

<div class="page-header">
	<h1>Blog Posts</h1>
	<div class="page-actions">
		<Button href="/" transparent>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="back-icon">
				<polyline points="15 18 9 12 15 6" />
			</svg>
			Back to Website
		</Button>
		<Button href="/admin/blog/new">New Post</Button>
	</div>
</div>

<div class="controls">
	<div class="search">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
			<circle cx="11" cy="11" r="7" />
			<path d="m20 20-3.5-3.5" />
		</svg>
		<input
			type="search"
			bind:value={query}
			placeholder="Search title, summary, category, tags…"
			autocomplete="off"
			spellcheck="false"
			aria-label="Search posts"
		/>
	</div>
	<div class="filters">
		<label class="control">
			<span class="control-label">Status</span>
			<select bind:value={statusFilter}>
				<option value="all">All ({counts.all})</option>
				<option value="published">Published ({counts.published})</option>
				<option value="draft">Drafts ({counts.draft})</option>
				<option value="archived">Archived ({counts.archived})</option>
			</select>
		</label>
		<label class="control">
			<span class="control-label">Sort</span>
			<select bind:value={sortKey}>
				<option value="updated-desc">Recently updated</option>
				<option value="date-desc">Newest first</option>
				<option value="date-asc">Oldest first</option>
				<option value="title-asc">Title A–Z</option>
			</select>
		</label>
	</div>
</div>

{#if visiblePosts.length > 0}
	<div class="posts-list">
		{#each visiblePosts as post (post.slug)}
			<a href="/admin/blog/{post.slug}" class="post-item">
				<div class="post-info">
					<h3 class="post-title">{post.title}</h3>
					<div class="post-meta">
						<span class="post-status" class:published={post.status === 'published'} class:archived={post.status === 'archived'}>
							{post.status}
						</span>
						<span class="post-date">{formatDate(post.publishedAt ?? post.updatedAt)}</span>
						{#if post.category}
							<span class="post-category">{post.category}</span>
						{/if}
					</div>
				</div>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
					<polyline points="9 18 15 12 9 6" />
				</svg>
			</a>
		{/each}
	</div>
{:else if data.posts.length === 0}
	<div class="empty-state">
		<p>No blog posts yet.</p>
		<Button href="/admin/blog/new">Create Your First Post</Button>
	</div>
{:else}
	<div class="empty-state">
		<p>No posts match the current filters.</p>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
	}

	.page-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.back-icon {
		width: 16px;
		height: 16px;
		margin-right: var(--space-1);
		vertical-align: -2px;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		align-items: center;
		margin-bottom: var(--space-6);
	}

	.search {
		flex: 1 1 280px;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast);
	}

	.search:focus-within {
		border-color: var(--color-accent);
	}

	.search svg {
		width: 16px;
		height: 16px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.search input {
		flex: 1;
		border: 0;
		background: transparent;
		font-size: var(--text-base);
		color: var(--color-text);
		min-width: 0;
	}

	.search input:focus {
		outline: none;
		box-shadow: none;
	}

	.search input::-webkit-search-cancel-button {
		appearance: none;
	}

	.filters {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.control {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		font-size: var(--text-sm);
	}

	.control-label {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.control select {
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: var(--text-sm);
		min-width: 150px;
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.post-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--transition-fast), background-color var(--transition-fast);
	}

	.post-item:hover {
		border-color: var(--color-accent);
		background: var(--color-bg-secondary);
	}

	.post-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-sm);
	}

	.post-status {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
		font-weight: 500;
		text-transform: capitalize;
	}

	.post-status.published {
		background: rgba(0, 180, 160, 0.1);
		color: var(--color-accent);
	}

	.post-status.archived {
		background: rgba(120, 120, 120, 0.12);
		color: var(--color-text-muted);
	}

	.post-date {
		color: var(--color-text-muted);
	}

	.post-category {
		color: var(--color-text-secondary);
	}

	.chevron {
		width: 20px;
		height: 20px;
		color: var(--color-text-muted);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}
</style>
