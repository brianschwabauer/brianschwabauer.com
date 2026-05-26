<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		speed = 0.3,
		class: klass = '',
	}: { children: Snippet; speed?: number; class?: string } = $props();

	let el = $state<HTMLElement | null>(null);
	let y = $state(0);

	$effect(() => {
		if (!el) return;
		const update = () => {
			const rect = el!.getBoundingClientRect();
			const center = rect.top + rect.height / 2 - (window.innerHeight || 0) / 2;
			y = -center * speed;
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
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
