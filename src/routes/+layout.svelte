<script lang="ts">
	import '../../delightstack/packages/styles/global.css';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { theme } from '$lib/stores/theme';
	import { page } from '$app/state';
	import { beforeNavigate } from '$app/navigation';

	let { children } = $props();

	const isRootPage = $derived(page.url.pathname === '/');
	const isAdminPage = $derived(page.url.pathname.startsWith('/admin'));

	// Swap theme BEFORE the new page mounts so the first paint is correct.
	// Initial load is handled by the bootstrap script in app.html.
	beforeNavigate(({ to }) => {
		if (!to) return;
		const path = to.url.pathname;
		if (path === '/admin' || path.startsWith('/admin/')) {
			theme.forceTheme(null);
		} else if (path === '/') {
			theme.forceTheme('dark');
		} else {
			theme.forceTheme('light');
		}
	});
</script>

<svelte:head>
	<meta name="description" content="Brian Schwabauer — Delivering Delight. Two decades of making things on screens, and the platform I'm building now." />
</svelte:head>

<div class="app">
	{#if !isAdminPage}
		<Header invertLogo={isRootPage} />
	{/if}
	<main class:flush={isRootPage} class:admin={isAdminPage}>
		{@render children()}
	</main>
	{#if !isAdminPage}
		<Footer />
	{/if}
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		padding-top: 80px;
	}
	main.flush {
		padding-top: 0; /* root page hero handles its own top spacing */
	}
	main.admin {
		padding-top: 0; /* admin has its own chrome */
	}
</style>
