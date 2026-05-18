<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import { page } from '$app/stores';

	let { data, children } = $props();

	const isAdmin = $derived((data.session?.user as { role?: string })?.role === 'admin');
	// The post editor manages its own chrome and full-bleed layout, so the
	// shared admin wrapper opts out of its padding/max-width on that route.
	const isPostEditor = $derived($page.url.pathname.startsWith('/admin/blog/'));
</script>

{#if !isAdmin}
	<div class="auth-required">
		<h1>Access Denied</h1>
		<p>You don't have permission to access the admin area.</p>
		<Button href="/">Go Home</Button>
	</div>
{:else}
	<div class="admin-main" class:full-bleed={isPostEditor}>
		{@render children()}
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

	.admin-main {
		max-width: var(--prose-wide);
		margin: 0 auto;
		padding: var(--space-8) var(--space-6);
	}

	.admin-main.full-bleed {
		max-width: none;
		padding: 0;
	}
</style>
