<script lang="ts">
	import Button from '$lib/components/shared/Button.svelte';

	let { data } = $props();

	const categoryLabels = {
		development: 'Development',
		videography: 'Videography',
		life: 'Life'
	} as const;
</script>

<svelte:head>
	<title>Timeline - Admin</title>
</svelte:head>

<div class="timeline-admin">
	<div class="page-header">
		<h1>Timeline Entries</h1>
		<Button href="/admin/timeline/new">New Entry</Button>
	</div>

	{#if data.entries.length > 0}
		<div class="entries-list">
			{#each data.entries as entry (entry.id)}
				<a href="/admin/timeline/{entry.id}" class="entry-item">
					<div class="entry-info">
						<div class="entry-header">
							<span class="entry-year">{entry.year}</span>
							{#if entry.month}
								<span class="entry-month">/ {entry.month}</span>
							{/if}
							<span class="entry-category {entry.category}">
								{categoryLabels[entry.category as keyof typeof categoryLabels] || entry.category}
							</span>
						</div>
						<h3 class="entry-title">{entry.title}</h3>
					</div>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</a>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>No timeline entries yet.</p>
			<Button href="/admin/timeline/new">Create Your First Entry</Button>
		</div>
	{/if}
</div>

<style>
	.timeline-admin {
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

	.entries-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.entry-item {
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

	.entry-item:hover {
		border-color: var(--color-accent);
		background: var(--color-bg-secondary);
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
		font-size: var(--text-sm);
	}

	.entry-year {
		font-weight: 600;
		color: var(--color-text);
	}

	.entry-month {
		color: var(--color-text-muted);
	}

	.entry-category {
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-sm);
		font-size: var(--text-xs);
		font-weight: 500;
	}

	.entry-category.development {
		background: rgba(0, 180, 160, 0.1);
		color: var(--color-accent);
	}

	.entry-category.videography {
		background: rgba(139, 92, 246, 0.1);
		color: #8b5cf6;
	}

	.entry-category.life {
		background: rgba(245, 158, 11, 0.1);
		color: #f59e0b;
	}

	.entry-title {
		font-size: var(--text-lg);
		font-weight: 600;
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
