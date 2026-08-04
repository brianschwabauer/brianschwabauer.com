<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onScrollProgress } from './scrollProgress';

	let {
		children,
		speed = 0.3,
		class: klass = '',
	}: { children: Snippet; speed?: number; class?: string } = $props();

	let el = $state<HTMLElement | null>(null);
	let y = $state(0);

	// The shared scroll bus does the listener/rAF/IO bookkeeping (and the rect
	// read) once for the whole page — this just maps the rect to an offset.
	$effect(() => {
		if (!el) return;
		return onScrollProgress(el, (rect) => {
			const center = rect.top + rect.height / 2 - (window.innerHeight || 0) / 2;
			y = -center * speed;
		});
	});
</script>

<div bind:this={el} class="parallax {klass}" style:transform="translate3d(0, {y}px, 0)">
	{@render children()}
</div>

<style>
	.parallax {
		will-change: transform;
	}
	@media (prefers-reduced-motion: reduce) {
		.parallax {
			transform: none !important;
		}
	}
</style>
