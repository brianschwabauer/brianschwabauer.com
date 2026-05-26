<script lang="ts">
	import LazyMedia from './LazyMedia.svelte';

	let {
		items,
		columns = 'auto-fill',
		min = 220,
		gap = 12,
		ratio = '4 / 3',
		captions = false,
	}: {
		items: Array<string | { src: string; caption?: string }>;
		columns?: 'auto-fill' | 'auto-fit' | number;
		min?: number;
		gap?: number;
		ratio?: string;
		captions?: boolean;
	} = $props();

	const cols = $derived(
		typeof columns === 'number'
			? `repeat(${columns}, minmax(0, 1fr))`
			: `repeat(${columns}, minmax(${min}px, 1fr))`,
	);
</script>

<div class="media-grid" style:grid-template-columns={cols} style:gap="{gap}px">
	{#each items as item, i (i)}
		{@const obj = typeof item === 'string' ? { src: item } : item}
		<LazyMedia
			src={obj.src}
			alt={obj.caption ?? ''}
			caption={captions ? (obj.caption ?? '') : ''}
			{ratio} />
	{/each}
</div>

<style>
	.media-grid {
		display: grid;
		width: 100%;
	}
</style>
