<script lang="ts">
	// ---- eager: everything the first viewport needs -------------------------
	// The hero (and the fixed chrome that frames the whole page) hydrates with
	// the page. Rewind stays eager too: it is the first thing under the fold
	// and a flick of the wheel reaches it before any lazy chunk could land.
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Hero from '$lib/components/about/sections/Hero.svelte';
	import Rewind from '$lib/components/about/sections/Rewind.svelte';
	import YearScrubber from '$lib/components/about/primitives/YearScrubber.svelte';
	import ChapterCard from '$lib/components/about/primitives/ChapterCard.svelte';
	import EmptyYearMark from '$lib/components/about/primitives/EmptyYearMark.svelte';
	import YearCycler from '$lib/components/about/primitives/YearCycler.svelte';
	import RootNavDropdown from '$lib/components/layout/RootNavDropdown.svelte';

	// ---- lazy: every section below the first fold ---------------------------
	// Each loader is awaited inside a <svelte:boundary> below. With the
	// experimental async compiler (already on in svelte.config.js) the server
	// AWAITS these during SSR and renders the full HTML — the crawler sees
	// everything — while the client ships each section as its own chunk.
	// During hydration Svelte leaves the server-rendered DOM in place until a
	// chunk resolves, then hydrates over the very same nodes: no teardown, no
	// flicker, no layout shift. SvelteKit also emits the CSS of SSR-executed
	// dynamic imports as eager <link>s, so the HTML never paints unstyled.
	//
	// THREE RULES, all load-bearing:
	// 1. NO `pending` snippet on these boundaries — with one, the SERVER
	//    renders the pending snippet instead of the section and the SSR HTML
	//    (and SEO) is gone.
	// 2. Loaders stay stable arrows whose awaited promise is memoized, so the
	//    awaited expression is referentially stable and never re-runs.
	// 3. Hydration is STAGGERED: with 17 chunks resolving at once, Svelte
	//    hydrates them in one burst of long tasks right as the visitor starts
	//    their first scroll through the (eager, scroll-driven) Hero/Rewind.
	//    The SSR DOM is already painted, so nothing visual waits on these —
	//    each gated loader just takes its turn in an idle-callback queue.
	//    SSR and hash deep-links bypass the queue: the server must await
	//    everything inline, and the curtain lift wants every chunk ASAP.
	const sectionGate = (() => {
		if (!browser || location.hash) return () => Promise.resolve();
		const idle: (cb: () => void) => void =
			typeof requestIdleCallback === 'function'
				? (cb) => requestIdleCallback(cb, { timeout: 300 })
				: (cb) => setTimeout(cb, 50);
		const queue: (() => void)[] = [];
		let pumping = false;
		const pump = () => {
			const release = queue.shift();
			if (!release) {
				pumping = false;
				return;
			}
			release();
			idle(pump);
		};
		return () =>
			new Promise<void>((resolve) => {
				queue.push(resolve);
				if (!pumping) {
					pumping = true;
					idle(pump);
				}
			});
	})();
	function lazySection<T>(load: () => Promise<T>): () => Promise<T> {
		let chunk: Promise<T> | undefined;
		return () => (chunk ??= sectionGate().then(load));
	}
	// The first two stay ungated: they sit directly under the fold, and a
	// single flick of the wheel reaches them before the idle queue would.
	const humbleBeginnings = () =>
		import('$lib/components/about/sections/HumbleBeginnings.svelte');
	const greenScreen = () => import('$lib/components/about/sections/GreenScreen.svelte');
	const featureLength = lazySection(
		() => import('$lib/components/about/sections/FeatureLength.svelte'),
	);
	const takingItSeriously = lazySection(
		() => import('$lib/components/about/sections/TakingItSeriously.svelte'),
	);
	const musicVideos = lazySection(
		() => import('$lib/components/about/sections/MusicVideos.svelte'),
	);
	const animation = lazySection(
		() => import('$lib/components/about/sections/Animation.svelte'),
	);
	const festivals = lazySection(
		() => import('$lib/components/about/sections/Festivals.svelte'),
	);
	const college = lazySection(
		() => import('$lib/components/about/sections/College.svelte'),
	);
	const spunksters = lazySection(
		() => import('$lib/components/about/sections/Spunksters.svelte'),
	);
	const whatMakesUsHuman = lazySection(
		() => import('$lib/components/about/sections/WhatMakesUsHuman.svelte'),
	);
	const freelancer = lazySection(
		() => import('$lib/components/about/sections/Freelancer.svelte'),
	);
	const entrepreneurship = lazySection(
		() => import('$lib/components/about/sections/Entrepreneurship.svelte'),
	);
	const showAndTour = lazySection(
		() => import('$lib/components/about/sections/ShowAndTour.svelte'),
	);
	const now = lazySection(() => import('$lib/components/about/sections/Now.svelte'));
	const creed = lazySection(() => import('$lib/components/about/sections/Creed.svelte'));
	const theEnd = lazySection(
		() => import('$lib/components/about/sections/TheEnd.svelte'),
	);
	const credits = lazySection(
		() => import('$lib/components/about/sections/Credits.svelte'),
	);

	let { data } = $props();

	// Lift the deep-link curtain (raised by the inline hash-pin script in
	// app.html) once every lazy section chunk has resolved. The loaders are the
	// same module-scope promises the boundaries above await, so this settles
	// exactly when the last boundary hydrates; the double rAF gives that final
	// hydration a painted frame before the fade starts. On loads with no
	// curtain (no hash, or client-side navigation) this is a no-op.
	onMount(() => {
		const loaders = [
			humbleBeginnings,
			greenScreen,
			featureLength,
			takingItSeriously,
			musicVideos,
			animation,
			festivals,
			college,
			spunksters,
			whatMakesUsHuman,
			freelancer,
			entrepreneurship,
			showAndTour,
			now,
			creed,
			theEnd,
			credits,
		];
		Promise.all(loaders.map((load) => load())).then(() => {
			requestAnimationFrame(() =>
				requestAnimationFrame(() =>
					(window as { __hashCurtainLift?: () => void }).__hashCurtainLift?.(),
				),
			);
		});
	});

	const stops = [
		{ id: 'hero', year: 'Start', label: 'Delivering Delight' },
		{ id: 'humble-beginnings', year: '2006', label: 'Humble Beginnings' },
		{ id: 'green-screen', year: '2007', label: 'Green Screen' },
		{ id: 'feature-length', year: '2008', label: 'Feature Length' },
		{ id: 'taking-it-seriously', year: '2009', label: 'First Websites' },
		{ id: 'music-videos', year: '2009', label: 'Music Videos' },
		{ id: 'animation', year: '2010', label: 'Animation & VFX' },
		{ id: 'festivals-ksms', year: '2011', label: 'Festivals & KSMS' },
		{ id: 'college', year: '2012', label: 'College' },
		{ id: 'spunksters', year: '2013', label: 'The Spunksters' },
		{ id: 'what-makes-us-human', year: '2015', label: 'Senior Thesis' },
		{ id: 'freelancer', year: '2016', label: 'Freelancer' },
		{ id: 'entrepreneurship', year: '2017', label: 'Entrepreneurship' },
		{ id: 'showandtour', year: '2019', label: 'Show&Tour' },
		{ id: 'now', year: new Date().getFullYear().toString(), label: 'Now' },
		{ id: 'creed', year: 'Always', label: 'The Creed' },
		{ id: 'credits', year: 'Fin', label: 'Credits' },
	];
</script>

<svelte:head>
	<title>Brian Schwabauer — Delivering Delight</title>
	<meta
		name="description"
		content="Two decades of making things on screens — short films, music videos, motion graphics, weird Flash games, websites, products, and the platform I'm building now. The long version." />
	<meta property="og:title" content="Brian Schwabauer — Delivering Delight" />
	<meta
		property="og:description"
		content="For as long as I can remember, I've loved to make things — short films, Flash games, websites, products. I live to create. I work to delight." />
</svelte:head>

<RootNavDropdown />

<div class="root">
	<YearScrubber {stops} />

	<Hero isMobile={data.isMobile} field={data.starField} />
	<Rewind />
	<ChapterCard act={1} />
	<svelte:boundary>
		{@const HumbleBeginnings = (await humbleBeginnings()).default}
		<HumbleBeginnings />
	</svelte:boundary>
	<svelte:boundary>
		{@const GreenScreen = (await greenScreen()).default}
		<GreenScreen />
	</svelte:boundary>
	<svelte:boundary>
		{@const FeatureLength = (await featureLength()).default}
		<FeatureLength />
	</svelte:boundary>
	<svelte:boundary>
		{@const TakingItSeriously = (await takingItSeriously()).default}
		<TakingItSeriously />
	</svelte:boundary>
	<svelte:boundary>
		{@const MusicVideos = (await musicVideos()).default}
		<MusicVideos />
	</svelte:boundary>
	<svelte:boundary>
		{@const Animation = (await animation()).default}
		<Animation />
	</svelte:boundary>
	<svelte:boundary>
		{@const Festivals = (await festivals()).default}
		<Festivals />
	</svelte:boundary>
	<ChapterCard act={2} />
	<svelte:boundary>
		{@const College = (await college()).default}
		<College />
	</svelte:boundary>
	<svelte:boundary>
		{@const Spunksters = (await spunksters()).default}
		<Spunksters />
	</svelte:boundary>
	<EmptyYearMark
		year="2014"
		color="#ffd934"
		note="Nothing big shipped this year — just film sets, coursework, and a growing pile of notes, all quietly pointed at one thing: the senior thesis." />
	<svelte:boundary>
		{@const WhatMakesUsHuman = (await whatMakesUsHuman()).default}
		<WhatMakesUsHuman />
	</svelte:boundary>
	<ChapterCard act={3} />
	<svelte:boundary>
		{@const Freelancer = (await freelancer()).default}
		<Freelancer />
	</svelte:boundary>
	<svelte:boundary>
		{@const Entrepreneurship = (await entrepreneurship()).default}
		<Entrepreneurship />
	</svelte:boundary>
	<EmptyYearMark
		year="2018"
		color="#00d6ff"
		note="Heads-down year: client work paying the bills while the idea that became Show&Tour kept getting sketched and re-sketched." />
	<svelte:boundary>
		{@const ShowAndTour = (await showAndTour()).default}
		<ShowAndTour />
	</svelte:boundary>
	<YearCycler
		years={[2020, 2021, 2022, 2023, 2024, 2025]}
		color="#00f2c3"
		caption="Building Show&Tour" />
	<svelte:boundary>
		{@const Now = (await now()).default}
		<Now />
	</svelte:boundary>
	<svelte:boundary>
		{@const Creed = (await creed()).default}
		<Creed />
	</svelte:boundary>
	<svelte:boundary>
		{@const TheEnd = (await theEnd()).default}
		<TheEnd />
	</svelte:boundary>
	<svelte:boundary>
		{@const Credits = (await credits()).default}
		<Credits />
	</svelte:boundary>
</div>

<style>
	.root {
		background: #06060a;
		color: #fff;
		position: relative;
		isolation: isolate;
		/* Full-bleed elements are 100vw wide, which overshoots by the scrollbar
		   width on platforms with classic scrollbars — clip instead of letting
		   the page scroll sideways. */
		overflow-x: clip;
	}
	:global(html) {
		scroll-padding-top: 80px;
	}
</style>
