<script lang="ts">
	import { onMount } from 'svelte';
	import Starfield from '$lib/components/about/Starfield.svelte';
	import Timeline from '$lib/components/about/Timeline.svelte';

	let { data } = $props();

	let container: HTMLElement;

	onMount(() => {
		// Scroll to bottom on page load (reverse chronology - start at "present")
		if (container) {
			// Wait for content to render
			setTimeout(() => {
				container.scrollTo({
					top: container.scrollHeight,
					behavior: 'instant'
				});
			}, 100);
		}
	});
</script>

<svelte:head>
	<title>About - Brian Schwabauer</title>
	<meta
		name="description"
		content="My journey through development, videography, and life. A reverse-chronological timeline of experiences and projects."
	/>
</svelte:head>

<div class="about-page" bind:this={container}>
	<Starfield />

	<div class="about-content">
		<header class="about-header">
			<h1 class="about-title">My Journey</h1>
			<p class="about-subtitle">
				Scroll up to travel back through time. From today back to the beginning.
			</p>
			<div class="scroll-hint">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="18 15 12 9 6 15" />
				</svg>
				<span>Scroll up</span>
			</div>
		</header>

		<Timeline entries={data.entries} />
	</div>
</div>

<style>
	.about-page {
		min-height: 100vh;
		background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
		position: relative;
		overflow-x: hidden;
	}

	.about-content {
		position: relative;
		z-index: 1;
	}

	.about-header {
		text-align: center;
		padding: var(--space-24) var(--space-4) var(--space-16);
		max-width: var(--container-md);
		margin: 0 auto;
	}

	.about-title {
		font-size: var(--text-5xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
		background: linear-gradient(135deg, #ffffff, var(--color-accent));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	@media (min-width: 768px) {
		.about-title {
			font-size: var(--text-6xl);
		}
	}

	.about-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}

	.scroll-hint {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-accent);
		animation: bounce 2s ease-in-out infinite;
	}

	.scroll-hint svg {
		width: 24px;
		height: 24px;
	}

	.scroll-hint span {
		font-size: var(--text-sm);
		font-weight: 500;
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
