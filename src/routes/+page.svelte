<script lang="ts">
	import Hero from '$lib/components/about/sections/Hero.svelte';
	import WhatImUpTo from '$lib/components/about/sections/WhatImUpTo.svelte';
	import Rewind from '$lib/components/about/sections/Rewind.svelte';
	import HumbleBeginnings from '$lib/components/about/sections/HumbleBeginnings.svelte';
	import GreenScreen from '$lib/components/about/sections/GreenScreen.svelte';
	import PowerRangers from '$lib/components/about/sections/PowerRangers.svelte';
	import TakingItSeriously from '$lib/components/about/sections/TakingItSeriously.svelte';
	import MusicVideos from '$lib/components/about/sections/MusicVideos.svelte';
	import Animation from '$lib/components/about/sections/Animation.svelte';
	import Festivals from '$lib/components/about/sections/Festivals.svelte';
	import Spunksters from '$lib/components/about/sections/Spunksters.svelte';
	import College from '$lib/components/about/sections/College.svelte';
	import WhatMakesUsHuman from '$lib/components/about/sections/WhatMakesUsHuman.svelte';
	import Freelancer from '$lib/components/about/sections/Freelancer.svelte';
	import Entrepreneurship from '$lib/components/about/sections/Entrepreneurship.svelte';
	import ShowAndTour from '$lib/components/about/sections/ShowAndTour.svelte';
	import SideProjects from '$lib/components/about/sections/SideProjects.svelte';
	import YearScrubber from '$lib/components/about/primitives/YearScrubber.svelte';
	import RootNavDropdown from '$lib/components/layout/RootNavDropdown.svelte';

	let { data } = $props();
	const signedIn = $derived(Boolean(data.signedIn));

	const currentYear = new Date().getFullYear();

	const stops = [
		{ id: 'hero', year: 'Today', label: 'Today' },
		{ id: 'what-im-up-to', year: String(currentYear), label: "What I'm up to" },
		{ id: 'rewind', year: '↻', label: 'Rewinding…' },
		{ id: 'humble-beginnings', year: '2006', label: 'Humble Beginnings' },
		{ id: 'green-screen', year: '2007', label: 'Green Screen' },
		{ id: 'power-rangers', year: '2008', label: 'Power Rangers' },
		{ id: 'taking-it-seriously', year: '2009', label: 'First Websites' },
		{ id: 'music-videos', year: '2010', label: 'Music Videos' },
		{ id: 'animation', year: '2011', label: 'Animation & VFX' },
		{ id: 'festivals-ksms', year: '2011', label: 'Festivals & KSMS' },
		{ id: 'spunksters', year: '2013', label: 'The Spunksters' },
		{ id: 'college', year: '2014', label: 'College' },
		{ id: 'what-makes-us-human', year: '2015', label: 'Senior Thesis' },
		{ id: 'freelancer', year: '2017', label: 'Freelancer' },
		{ id: 'entrepreneurship', year: '2019', label: 'Entrepreneurship' },
		{ id: 'showandtour', year: '2024', label: 'Show&Tour' },
		{ id: 'side-projects', year: '2026', label: 'Side Projects' }
	];
</script>

<svelte:head>
	<title>Brian Schwabauer — Delivering Delight</title>
	<meta
		name="description"
		content="Two decades of making things on screens — short films, music videos, motion graphics, weird Flash games, websites, products, and the platform I'm building now. The long version."
	/>
	<meta property="og:title" content="Brian Schwabauer — Delivering Delight" />
	<meta property="og:description" content="For as long as I have lived, I have loved to create. Startups, apps, videos. I live to create. I work to delight." />
</svelte:head>

<RootNavDropdown />

<div class="root">
	<YearScrubber {stops} />

	<Hero />
	<WhatImUpTo />
	<Rewind />
	<HumbleBeginnings {signedIn} />
	<GreenScreen {signedIn} />
	<PowerRangers />
	<TakingItSeriously />
	<MusicVideos />
	<Animation />
	<Festivals {signedIn} />
	<Spunksters />
	<College />
	<WhatMakesUsHuman />
	<Freelancer />
	<Entrepreneurship />
	<ShowAndTour />
	<SideProjects />
</div>

<style>
	.root {
		background: #06060a;
		color: #fff;
		position: relative;
		isolation: isolate;
	}
	:global(html) {
		scroll-padding-top: 80px;
	}
</style>
