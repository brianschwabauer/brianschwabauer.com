<script lang="ts">
	import '../../delightstack/packages/styles/global.css';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { theme } from '$lib/stores/theme';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	const isRootPage = $derived($page.url.pathname === '/');
	const isAdminPage = $derived($page.url.pathname.startsWith('/admin'));

	// Force theme based on page:
	// - Admin pages: respect user preference (no force)
	// - Root page (long scrolly page): force dark
	// - Other public pages: force light
	$effect(() => {
		if (isAdminPage) {
			theme.forceTheme(null);
		} else if (isRootPage) {
			theme.forceTheme('dark');
		} else {
			theme.forceTheme('light');
		}
	});

	onMount(() => {
		if (isAdminPage) {
			const stored = localStorage.getItem('theme');
			if (stored === 'light' || stored === 'dark') {
				document.documentElement.dataset.theme = stored;
			}
		}
	});
</script>

<svelte:head>
	<meta name="description" content="Brian Schwabauer — Delivering Delight. Two decades of making things on screens, and the platform I'm building now." />
</svelte:head>

<div class="app">
	<Header showThemeToggle={isAdminPage} invertLogo={isRootPage} />
	<main class:flush={isRootPage}>
		{@render children()}
	</main>
	<Footer />
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
</style>
