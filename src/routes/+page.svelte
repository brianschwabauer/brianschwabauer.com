<script lang="ts">
	import { untrack } from 'svelte';
	import { seedCut, hydrateCut } from '$lib/cut.svelte';
	import Hero from '$lib/components/about/sections/Hero.svelte';
	import TicketBooth from '$lib/components/about/sections/TicketBooth.svelte';
	import WhatImUpTo from '$lib/components/about/sections/WhatImUpTo.svelte';
	import Rewind from '$lib/components/about/sections/Rewind.svelte';
	import HumbleBeginnings from '$lib/components/about/sections/HumbleBeginnings.svelte';
	import GreenScreen from '$lib/components/about/sections/GreenScreen.svelte';
	import PowerRangers from '$lib/components/about/sections/PowerRangers.svelte';
	import TakingItSeriously from '$lib/components/about/sections/TakingItSeriously.svelte';
	import MusicVideos from '$lib/components/about/sections/MusicVideos.svelte';
	import Animation from '$lib/components/about/sections/Animation.svelte';
	import Festivals from '$lib/components/about/sections/Festivals.svelte';
	import College from '$lib/components/about/sections/College.svelte';
	import Spunksters from '$lib/components/about/sections/Spunksters.svelte';
	import WhatMakesUsHuman from '$lib/components/about/sections/WhatMakesUsHuman.svelte';
	import Freelancer from '$lib/components/about/sections/Freelancer.svelte';
	import Entrepreneurship from '$lib/components/about/sections/Entrepreneurship.svelte';
	import ShippedWall from '$lib/components/about/sections/ShippedWall.svelte';
	import ShowAndTour from '$lib/components/about/sections/ShowAndTour.svelte';
	import SideProjects from '$lib/components/about/sections/SideProjects.svelte';
	import Creed from '$lib/components/about/sections/Creed.svelte';
	import TheEnd from '$lib/components/about/sections/TheEnd.svelte';
	import Credits from '$lib/components/about/sections/Credits.svelte';
	import YearScrubber from '$lib/components/about/primitives/YearScrubber.svelte';
	import ChapterCard from '$lib/components/about/primitives/ChapterCard.svelte';
	import EmptyYearMark from '$lib/components/about/primitives/EmptyYearMark.svelte';
	import YearCycler from '$lib/components/about/primitives/YearCycler.svelte';
	import RootNavDropdown from '$lib/components/layout/RootNavDropdown.svelte';

	let { data } = $props();
	const signedIn = $derived(Boolean(data.signedIn));

	// Seed the theatrical/director cut from `?cut=`. Server and client see the
	// same URL, so the hydrated tree matches the SSR markup exactly. The stored
	// preference is applied a beat later, in `$effect.pre` — after hydration has
	// claimed the server's DOM, but still before the browser paints, so a
	// returning director's-cut visitor never sees a theatrical frame.
	seedCut(untrack(() => data.cut));
	$effect.pre(() => {
		const from_url = data.cut;
		untrack(() => hydrateCut(from_url));
	});

	const stops = [
		{ id: 'hero', year: 'Start', label: 'Delivering Delight' },
		{ id: 'ticket-booth', year: 'Lobby', label: 'Choose Your Cut' },
		{ id: 'humble-beginnings', year: '2006', label: 'Humble Beginnings' },
		{ id: 'green-screen', year: '2007', label: 'Green Screen' },
		{ id: 'power-rangers', year: '2008', label: 'Feature Length' },
		{ id: 'taking-it-seriously', year: '2009', label: 'First Websites' },
		{ id: 'music-videos', year: '2009', label: 'Music Videos' },
		{ id: 'animation', year: '2010', label: 'Animation & VFX' },
		{ id: 'festivals-ksms', year: '2011', label: 'Festivals & KSMS' },
		{ id: 'college', year: '2012', label: 'College' },
		{ id: 'spunksters', year: '2013', label: 'The Spunksters' },
		{ id: 'what-makes-us-human', year: '2015', label: 'Senior Thesis' },
		{ id: 'freelancer', year: '2016', label: 'Freelancer' },
		{ id: 'entrepreneurship', year: '2017', label: 'Entrepreneurship' },
		{ id: 'shipped-wall', year: '2015–18', label: 'The Shipped Wall' },
		{ id: 'showandtour', year: '2019', label: 'Show&Tour' },
		{ id: 'side-projects', year: 'Today', label: 'Side Projects' },
		{ id: 'what-im-up-to', year: 'Now', label: 'Which Brings Us to Now' },
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
		content="For as long as I have lived, I have loved to create. Startups, apps, videos. I live to create. I work to delight." />
</svelte:head>

<RootNavDropdown />

<div class="root">
	<YearScrubber {stops} />

	<Hero isMobile={data.isMobile} />
	<TicketBooth />
	<Rewind />
	<ChapterCard act={1} />
	<HumbleBeginnings {signedIn} />
	<GreenScreen {signedIn} />
	<PowerRangers />
	<TakingItSeriously />
	<MusicVideos />
	<Animation />
	<Festivals {signedIn} />
	<ChapterCard act={2} />
	<College />
	<Spunksters />
	<EmptyYearMark
		year="2014"
		color="#ffd934"
		note="No releases this year — just film sets, coursework, and a growing pile of notes, all quietly pointed at one thing: the senior thesis." />
	<WhatMakesUsHuman />
	<ChapterCard act={3} />
	<Freelancer />
	<Entrepreneurship />
	<ShippedWall />
	<EmptyYearMark
		year="2018"
		color="#00d6ff"
		note="Heads-down year: client work paying the bills while the idea that became Show&Tour kept getting sketched and re-sketched." />
	<ShowAndTour />
	<YearCycler
		years={[2020, 2021, 2022, 2023, 2024, 2025]}
		color="#00f2c3"
		caption="Building Show&Tour" />
	<SideProjects />
	<WhatImUpTo />
	<Creed />
	<TheEnd />
	<Credits />
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
