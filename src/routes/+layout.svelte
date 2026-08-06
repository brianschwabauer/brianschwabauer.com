<script lang="ts">
	import '@delightstack/styles/global.css';
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
	import { theme } from '$lib/stores/theme';
	import { page } from '$app/state';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	// Stale-deploy recovery. Chunk URLs are content-hashed and old ones vanish
	// from Cloudflare the moment a new version deploys, so a page loaded just
	// before a deploy 404s on every dynamic import it hasn't fetched yet —
	// lazy-loaded home sections just never appear. Vite reports exactly this via
	// `vite:preloadError`; one reload gets fresh HTML with live chunk URLs (the
	// home page's scroll pin restores the reader's place). Guarded per-session
	// so a genuinely broken deploy degrades to the normal failure instead of a
	// reload loop.
	$effect(() => {
		const RELOADED_KEY = 'preload-error-reloaded';
		const onPreloadError = () => {
			if (sessionStorage.getItem(RELOADED_KEY)) return;
			sessionStorage.setItem(RELOADED_KEY, '1');
			location.reload();
		};
		window.addEventListener('vite:preloadError', onPreloadError);
		return () => window.removeEventListener('vite:preloadError', onPreloadError);
	});

	const isRootPage = $derived(page.url.pathname === '/');
	const isAdminPage = $derived(page.url.pathname.startsWith('/admin'));

	// Routes that must never reach a search index: the admin surface, the
	// sign-in page, and the archive (admin-gated, and its URLs shouldn't
	// advertise that there's something here to be denied access to).
	const isPrivatePage = $derived(
		isAdminPage ||
			page.url.pathname === '/signin' ||
			page.url.pathname.startsWith('/archive'),
	);

	// The theme follows the CURRENT page, reactively — not a navigation hook.
	// Hooks all fire too early: with preloaded data, even onNavigate runs the
	// moment you click, and the OLD page then sits on screen for as long as the
	// destination's chunks take to load, wearing the NEW page's theme (a very
	// visible flash of mixed styles). An effect on page.url runs in the same
	// flush as the DOM swap itself, so the theme flip and the new page commit
	// in one painted frame. Initial load is handled by app.html's bootstrap.
	$effect(() => {
		const path = page.url.pathname;
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
	<!-- Per-page metadata (title, description, canonical, OG, JSON-LD) is emitted
	     by $lib/components/Seo.svelte, once per public page. Nothing meta-ish
	     belongs here: <svelte:head> does not de-duplicate, so a description in
	     the layout AND one on the page renders BOTH and search engines pick
	     between them arbitrarily.

	     The private routes are already disallowed in robots.txt, but that only
	     asks a crawler not to fetch them — a URL discovered elsewhere can still
	     be indexed. noindex is what actually keeps them out of results. -->
	{#if isPrivatePage}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
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
