<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { theme } from '$lib/stores/theme';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let { children } = $props();

	const isAboutPage = $derived($page.url.pathname === '/about');
	const isAdminPage = $derived($page.url.pathname.startsWith('/admin'));

	// Force theme based on page:
	// - Admin pages: respect user preference (no force)
	// - About page: force dark (space theme)
	// - Other public pages: force light
	$effect(() => {
		if (isAdminPage) {
			theme.forceTheme(null); // Respect user's stored preference
		} else if (isAboutPage) {
			theme.forceTheme('dark');
		} else {
			theme.forceTheme('light');
		}
	});

	// Ensure theme is applied on mount (only matters for admin pages now)
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
	<meta name="description" content="Brian Schwabauer - Developer, Creator, Problem Solver. Building digital experiences that make a difference." />
</svelte:head>

<div class="app">
	<Header showThemeToggle={isAdminPage} invertLogo={isAboutPage} />
	<main>
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
		padding-top: 80px; /* Account for fixed header */
	}
</style>
