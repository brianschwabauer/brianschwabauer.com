<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		year,
		label,
		theme = 'default',
		children,
		class: klass = ''
	}: {
		id: string;
		year?: string;
		label: string;
		theme?: string;
		children: Snippet;
		class?: string;
	} = $props();
</script>

<section
	{id}
	data-section
	data-section-label={label}
	data-section-year={year ?? ''}
	data-theme={theme}
	class="section-shell {klass}"
>
	{@render children()}
</section>

<style>
	.section-shell {
		position: relative;
		width: 100%;
		padding: clamp(6rem, 14vw, 12rem) 0;
		content-visibility: auto;
		contain-intrinsic-size: 1px 1200px;
	}
</style>
