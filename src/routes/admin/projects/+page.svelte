<script lang="ts">
	import { Button } from '@delightstack/components/actions';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects - Admin</title>
</svelte:head>

<div class="projects-admin">
	<div class="page-header">
		<h1>Projects</h1>
		<Button href="/admin/projects/new">New Project</Button>
	</div>

	{#if data.projects.length > 0}
		<div class="projects-list">
			{#each data.projects as project (project.id)}
				<a href="/admin/projects/{project.id}" class="project-item">
					<div class="project-info">
						<h3 class="project-title">{project.title}</h3>
						{#if project.tagline}
							<p class="project-tagline">{project.tagline}</p>
						{/if}
					</div>
					{#if project.featured}
						<span class="featured-badge">Featured</span>
					{/if}
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="chevron">
						<polyline points="9 18 15 12 9 6" />
					</svg>
				</a>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<p>No projects yet.</p>
			<Button href="/admin/projects/new">Create Your First Project</Button>
		</div>
	{/if}
</div>

<style>
	.projects-admin {
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

	.projects-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.project-item {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4) var(--space-5);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		transition: border-color var(--transition-fast), background-color var(--transition-fast);
	}

	.project-item:hover {
		border-color: var(--color-accent);
		background: var(--color-bg-secondary);
	}

	.project-info {
		flex: 1;
	}

	.project-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-1);
	}

	.project-tagline {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.featured-badge {
		font-size: var(--text-xs);
		font-weight: 500;
		padding: var(--space-1) var(--space-2);
		background: rgba(0, 180, 160, 0.1);
		color: var(--color-accent);
		border-radius: var(--radius-sm);
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
