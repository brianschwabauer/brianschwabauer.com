<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';

	let { data } = $props();

	function formatDate(date: Date | number | null | undefined) {
		if (!date) return 'Draft';
		const d = date instanceof Date ? date : new Date(date);
		return d.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog Posts - Admin</title>
</svelte:head>

<div class="blog-admin">
	<div class="page-header">
		<h1>Blog Posts</h1>
		<Button href="/admin/blog/new">New Post</Button>
	</div>

	{#if data.posts.length > 0}
		<div class="posts-list">
			{#each data.posts as post (post.id)}
				<a href="/admin/blog/{post.id}" class="post-item">
					<div class="post-info">
						<h3 class="post-title">{post.title}</h3>
						<div class="post-meta">
							<span class="post-status" class:published={post.status === 'published'}>
								{post.status}
							</span>
							<span class="post-date">{formatDate(post.publishedAt)}</span>
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
	{:else}
		<div class="empty-state">
			<p>No blog posts yet.</p>
			<Button href="/admin/blog/new">Create Your First Post</Button>
		</div>
	{/if}
</div>

<style>
	.blog-admin {
		max-width: 800px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
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
