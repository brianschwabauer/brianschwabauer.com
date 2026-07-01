<script lang="ts">
	import '@delightstack/styles/global.css';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { theme } from '$lib/stores/theme';
	import { page } from '$app/state';
	import { beforeNavigate, onNavigate } from '$app/navigation';

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

	// Progressive-enhancement view transition for /blog ↔ /blog/[slug]
	// navigations. The blog cards and the individual post page both stamp a
	// slug-scoped `view-transition-name` on the cover image + title, so the
	// browser morphs the clicked card's hero/title into the post-page hero/
	// title. Other cards on the listing just cross-fade out with the rest of
	// the page — which is the correct visual outcome since they don't have a
	// matching named element on the destination. Bails out cleanly on
	// browsers without the API and when the user prefers reduced motion.
	onNavigate((navigation) => {
		if (typeof document === 'undefined') return;
		if (!('startViewTransition' in document)) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const from = navigation.from?.url.pathname ?? '';
		const to = navigation.to?.url.pathname ?? '';
		const isBlogListToPost =
			from === '/blog' && to.startsWith('/blog/') && to !== '/blog/rss.xml';
		const isPostToBlogList = from.startsWith('/blog/') && to === '/blog';
		if (!isBlogListToPost && !isPostToBlogList) return;

		return new Promise((resolve) => {
			(
				document as Document & {
					startViewTransition: (cb: () => Promise<void>) => unknown;
				}
			).startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<meta
		name="description"
		content="Brian Schwabauer — Delivering Delight. Two decades of making things on screens, and the platform I'm building now." />
</svelte:head>

<div class="app">
	{#if !isAdminPage}
		<Header invertLogo={isRootPage} />
	{/if}
	<main class:flush={isRootPage} class:admin={isAdminPage}>
		{@render children()}
	</main>
	{#if !isAdminPage}
		<Footer invertLogo={isRootPage} />
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
