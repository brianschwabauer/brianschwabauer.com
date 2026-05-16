<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Admin Dashboard - Brian Schwabauer</title>
</svelte:head>

<div class="dashboard">
	<h1>Dashboard</h1>
	<p class="welcome">Welcome back, {data.session?.user?.name || 'Admin'}!</p>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon blog">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 20h9" />
					<path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
				</svg>
			</div>
			<div class="stat-content">
				<span class="stat-value">{data.blogCount}</span>
				<span class="stat-label">Blog Posts</span>
			</div>
			<a href="/admin/blog" class="stat-link">Manage</a>
		</div>

	</div>
</div>

<style>
	.dashboard {
		max-width: 1000px;
	}

	h1 {
		font-size: var(--text-3xl);
		margin-bottom: var(--space-2);
	}

	.welcome {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}

	.stats-grid {
		display: grid;
		gap: var(--space-6);
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}

	.stat-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.stat-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.stat-icon svg {
		width: 24px;
		height: 24px;
	}

	.stat-icon.blog {
		background: rgba(0, 180, 160, 0.1);
		color: var(--color-accent);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: var(--text-3xl);
		font-weight: 700;
	}

	.stat-label {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
	}

	.stat-link {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--color-accent);
	}
</style>
