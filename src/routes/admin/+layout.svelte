<script lang="ts">
	import { page } from '$app/stores';
	import Button from '$lib/components/shared/Button.svelte';

	let { data, children } = $props();

	const isAdmin = $derived((data.session?.user as { role?: string })?.role === 'admin');
</script>

{#if !data.session}
	<div class="auth-required">
		<h1>Sign In Required</h1>
		<p>You need to sign in to access the admin area.</p>
		<Button href="/auth/signin">Sign In</Button>
	</div>
{:else if !isAdmin}
	<div class="auth-required">
		<h1>Access Denied</h1>
		<p>You don't have permission to access the admin area.</p>
		<Button href="/">Go Home</Button>
	</div>
{:else}
	<div class="admin-layout">
		<aside class="admin-sidebar">
			<h2 class="sidebar-title">Admin</h2>
			<nav class="sidebar-nav">
				<a href="/admin" class:active={$page.url.pathname === '/admin'}>Dashboard</a>
				<a href="/admin/blog" class:active={$page.url.pathname.startsWith('/admin/blog')}>Blog Posts</a>
				<a href="/admin/timeline" class:active={$page.url.pathname.startsWith('/admin/timeline')}>Timeline</a>
				<a href="/admin/projects" class:active={$page.url.pathname.startsWith('/admin/projects')}>Projects</a>
				<a href="/admin/messages" class:active={$page.url.pathname.startsWith('/admin/messages')}>Messages</a>
			</nav>
		</aside>
		<main class="admin-main">
			{@render children()}
		</main>
	</div>
{/if}

<style>
	.auth-required {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		text-align: center;
		padding: var(--space-8);
	}

	.auth-required h1 {
		margin-bottom: var(--space-4);
	}

	.auth-required p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}

	.admin-layout {
		display: grid;
		grid-template-columns: 250px 1fr;
		min-height: calc(100vh - 80px);
	}

	@media (max-width: 768px) {
		.admin-layout {
			grid-template-columns: 1fr;
		}

		.admin-sidebar {
			display: none;
		}
	}

	.admin-sidebar {
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		padding: var(--space-6);
		position: sticky;
		top: 80px;
		height: calc(100vh - 80px);
		overflow-y: auto;
	}

	.sidebar-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin-bottom: var(--space-6);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--color-border);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.sidebar-nav a {
		display: block;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-weight: 500;
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.sidebar-nav a:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.sidebar-nav a.active {
		background: var(--color-accent);
		color: white;
	}

	.admin-main {
		padding: var(--space-8);
	}
</style>
