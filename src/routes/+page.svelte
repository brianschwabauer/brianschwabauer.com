<script lang="ts">
	import Hero from '$lib/components/home/Hero.svelte';
	import Creed from '$lib/components/home/Creed.svelte';
	import CurrentProject from '$lib/components/home/CurrentProject.svelte';
	import BlogPreview from '$lib/components/home/BlogPreview.svelte';
	import ContactCTA from '$lib/components/home/ContactCTA.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Brian Schwabauer - Developer, Creator, Problem Solver</title>
</svelte:head>

<Hero />
<Creed />
<CurrentProject />
<BlogPreview posts={data.posts} />
<ContactCTA />
