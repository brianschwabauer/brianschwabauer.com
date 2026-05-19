<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Button, alert } from '@delightstack/components/actions';
	import { create, insertMultiple, search, type AnyOrama, type Results } from '@orama/orama';
	import type { BlogPostMeta, BlogStatus } from '$lib/server/blog';

	let { data } = $props();

	type StatusFilter = 'all' | BlogStatus;
	type SortKey = 'updated-desc' | 'date-desc' | 'date-asc' | 'title-asc';

	const adminSchema = {
		id: 'string',
		title: 'string',
		summary: 'string',
		tags: 'string[]'
	} as const;

	interface AdminSearchDoc {
		id: string;
		title: string;
		summary: string;
		tags: string[];
	}

	let query = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let tagFilter = $state<string>('');
	let sortKey = $state<SortKey>('updated-desc');
	let busySlug = $state<string | null>(null);
	let actionError = $state<string | null>(null);

	let db = $state<AnyOrama | null>(null);
	let matchedIds = $state<Set<string> | null>(null);

	onMount(async () => {
		const next = create({ schema: adminSchema });
		const docs: AdminSearchDoc[] = data.posts.map((p: BlogPostMeta) => ({
			id: p.slug,
			title: p.title,
			summary: p.summary ?? p.aiSummary ?? '',
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
					properties: ['title', 'summary', 'tags'],
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

	const allTags = $derived(data.adminData?.tags ?? []);

	const visiblePosts = $derived.by(() => {
		let list: BlogPostMeta[] = data.posts;
		if (statusFilter !== 'all') {
			list = list.filter((p) => p.status === statusFilter);
		}
		if (tagFilter) {
			const key = tagFilter.toLowerCase();
			list = list.filter((p) => p.tags?.some((t) => t.toLowerCase() === key));
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

	async function togglePinned(post: BlogPostMeta) {
		if (busySlug) return;
		busySlug = post.slug;
		actionError = null;
		try {
			const res = await fetch(`/api/blog/${post.slug}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pinned: !post.pinned })
			});
			if (!res.ok) throw new Error(`Pin failed (${res.status})`);
			await invalidateAll();
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Failed to update pin state';
		} finally {
			busySlug = null;
		}
	}

	async function deletePost(post: BlogPostMeta) {
		if (busySlug) return;
		const ok = await alert({
			title: 'Delete this post?',
			message: `“${post.title}” will be removed permanently. This can’t be undone.`,
			continueText: 'Delete',
			destructive: true,
		});
		if (!ok) return;
		busySlug = post.slug;
		actionError = null;
		try {
			const res = await fetch(`/api/blog/${post.slug}`, { method: 'DELETE' });
			if (!res.ok) throw new Error(`Delete failed (${res.status})`);
			await invalidateAll();
		} catch (err) {
			actionError = err instanceof Error ? err.message : 'Failed to delete post';
		} finally {
			busySlug = null;
		}
	}
</script>

<svelte:head>
	<title>Admin — Blog Posts</title>
</svelte:head>

<div class="page-header">
	<a href="/" class="brand" aria-label="Brian Schwabauer — back to website">
		<img src="/logo.svg" alt="Brian Schwabauer" class="brand-img" />
	</a>
	<div class="page-actions">
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
			placeholder="Search title, summary, tags…"
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
		{#if allTags.length > 0}
			<label class="control">
				<span class="control-label">Tag</span>
				<select bind:value={tagFilter}>
					<option value="">All tags</option>
					{#each allTags as tag (tag)}
						<option value={tag}>{tag}</option>
					{/each}
				</select>
			</label>
		{/if}
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

{#if actionError}
	<div class="action-error" role="alert">{actionError}</div>
{/if}

{#if visiblePosts.length > 0}
	<div class="posts-list">
		{#each visiblePosts as post (post.slug)}
			<div class="post-item" class:pinned={post.pinned} class:busy={busySlug === post.slug}>
				<a href="/admin/blog/{post.slug}" class="post-link">
					<div class="post-info">
						<h3 class="post-title">
							{#if post.pinned}
								<span class="pin-badge" title="Pinned to top of blog" aria-label="Pinned">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
										<line x1="12" x2="12" y1="17" y2="22" />
										<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
									</svg>
								</span>
							{/if}
							{post.title}
						</h3>
						<div class="post-meta">
							<span class="post-status" class:published={post.status === 'published'} class:archived={post.status === 'archived'}>
								{post.status}
							</span>
							<span class="post-date">{formatDate(post.publishedAt ?? post.updatedAt)}</span>
							{#if post.tags && post.tags.length > 0}
								<span class="post-tags">
									{#each post.tags.slice(0, 3) as tag (tag)}
										<span class="post-tag">{tag}</span>
									{/each}
									{#if post.tags.length > 3}
										<span class="post-tag-more">+{post.tags.length - 3}</span>
									{/if}
								</span>
							{/if}
						</div>
					</div>
				</a>
				<div class="post-actions">
					<Button
						transparent
						icon
						popoverPlacement="bottom-end"
						popoverCloseOnInsideClick
						aria-label="More actions for {post.title}"
						disabled={busySlug === post.slug}
					>
						<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class="more-icon">
							<circle cx="5" cy="12" r="2" />
							<circle cx="12" cy="12" r="2" />
							<circle cx="19" cy="12" r="2" />
						</svg>
						{#snippet menu()}
							<div class="menu">
								<button type="button" class="menu-item" onclick={() => togglePinned(post)}>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="menu-icon">
										<line x1="12" x2="12" y1="17" y2="22" />
										<path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
									</svg>
									{post.pinned ? 'Unpin from top' : 'Pin to top'}
								</button>
								<button type="button" class="menu-item danger" onclick={() => deletePost(post)}>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" class="menu-icon">
										<polyline points="3 6 5 6 21 6" />
										<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
										<path d="M10 11v6" />
										<path d="M14 11v6" />
										<path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
									</svg>
									Delete post
								</button>
							</div>
						{/snippet}
					</Button>
				</div>
			</div>
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
	/* Constrain the admin index to the reading column so it doesn't sprawl
	   inside the (now wider) admin layout container. */
	.page-header,
	.controls,
	.posts-list,
	.empty-state,
	.action-error {
		max-width: var(--measure);
		margin-left: auto;
		margin-right: auto;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-6);
	}

	.brand {
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: opacity var(--transition-fast);
	}

	.brand:hover {
		opacity: 0.75;
	}

	.brand-img {
		height: 32px;
		width: auto;
		display: block;
	}

	:global([data-theme='dark']) .brand-img {
		filter: brightness(0) invert(1);
	}

	.page-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
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

	.action-error {
		padding: var(--space-3) var(--space-4);
		margin-bottom: var(--space-4);
		background: rgba(220, 60, 60, 0.08);
		border: 1px solid rgba(220, 60, 60, 0.35);
		color: #d33;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.post-item {
		display: flex;
		align-items: stretch;
		gap: var(--space-1);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast), background-color var(--transition-fast), opacity var(--transition-fast);
	}

	.post-item:hover {
		border-color: var(--color-accent);
		background: var(--color-bg-secondary);
	}

	.post-item.pinned {
		border-color: rgba(0, 180, 160, 0.45);
	}

	.post-item.busy {
		opacity: 0.6;
		pointer-events: none;
	}

	.post-link {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-2) var(--space-4) var(--space-5);
		text-decoration: none;
		color: inherit;
		min-width: 0;
	}

	.post-info {
		min-width: 0;
	}

	.post-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.pin-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-accent);
	}

	.pin-badge svg {
		width: 100%;
		height: 100%;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--text-sm);
		flex-wrap: wrap;
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

	.post-tags {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--space-1);
	}

	.post-tag {
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: 0.7rem;
	}

	.post-tag-more {
		color: var(--color-text-muted);
		font-size: 0.7rem;
	}

	.post-actions {
		display: flex;
		align-items: center;
		padding-right: var(--space-3);
	}

	.more-icon {
		width: 18px;
		height: 18px;
	}

	.menu {
		display: flex;
		flex-direction: column;
		min-width: 180px;
		padding: var(--space-1);
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: 0;
		border-radius: var(--radius-sm);
		color: var(--color-text);
		font-size: var(--text-sm);
		text-align: left;
		cursor: pointer;
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.menu-item:hover {
		background: var(--color-bg-secondary);
	}

	.menu-item.danger {
		color: #d33;
	}

	.menu-item.danger:hover {
		background: rgba(220, 60, 60, 0.08);
	}

	.menu-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.menu-item .menu-icon {
		color: currentColor;
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
