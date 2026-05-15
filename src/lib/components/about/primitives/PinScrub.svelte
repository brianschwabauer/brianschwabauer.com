<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		height = '300vh',
		class: klass = ''
	}: {
		children: Snippet<[{ progress: number }]>;
		height?: string;
		class?: string;
	} = $props();

	let outer = $state<HTMLElement | null>(null);
	let progress = $state(0);

	$effect(() => {
		if (!outer) return;
		const update = () => {
			const rect = outer!.getBoundingClientRect();
			const vh = window.innerHeight || 1;
			const total = rect.height - vh;
			const traversed = -rect.top;
			progress = Math.max(0, Math.min(1, traversed / Math.max(1, total)));
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

<div bind:this={outer} class="pin-outer {klass}" style:height={height}>
	<div class="pin-inner">
		{@render children({ progress })}
	</div>
</div>

<style>
	.pin-outer {
		position: relative;
		width: 100%;
	}
	.pin-inner {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
