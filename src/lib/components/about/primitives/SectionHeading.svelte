<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		eyebrow = '',
		title,
		subtitle = '',
		align = 'left',
		accent = 'currentColor',
		decoration = null
	}: {
		eyebrow?: string;
		title: string;
		subtitle?: string;
		align?: 'left' | 'center';
		accent?: string;
		decoration?: Snippet | null;
	} = $props();
</script>

<header class="heading" data-align={align} style:--accent={accent}>
	{#if eyebrow}
		<div class="eyebrow"><span class="dot"></span><span>{eyebrow}</span></div>
	{/if}
	<h2>{title}</h2>
	{#if subtitle}
		<p class="subtitle">{subtitle}</p>
	{/if}
	{#if decoration}
		<div class="decoration">{@render decoration()}</div>
	{/if}
</header>

<style>
	.heading {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		max-width: 64rem;
		margin: 0 auto 2.5rem;
	}
	.heading[data-align='center'] {
		text-align: center;
		align-items: center;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.32em;
		font-size: 0.72rem;
		opacity: 0.85;
		color: var(--accent);
	}
	.dot {
		display: inline-block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--accent);
		box-shadow: 0 0 14px var(--accent);
	}
	h2 {
		font-size: clamp(2.2rem, 5vw, 4rem);
		line-height: 1.05;
		font-weight: 800;
		letter-spacing: -0.02em;
		margin: 0;
	}
	.subtitle {
		font-size: clamp(1.1rem, 1.6vw, 1.35rem);
		line-height: 1.45;
		opacity: 0.8;
		max-width: 52rem;
		margin: 0.4rem 0 0;
	}
</style>
