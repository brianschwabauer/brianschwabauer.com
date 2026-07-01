<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		id,
		year,
		label,
		theme = 'default',
		children,
		class: klass = '',
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
	class="section-shell {klass}">
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
	/* Once a section has rendered, remember its real height instead of the 1200px
	   estimate, so a later jump to (or past) it lands accurately on the first
	   frame. Guarded so browsers that support `content-visibility` but not the
	   `auto` keyword keep the fixed estimate rather than dropping it entirely. */
	@supports (contain-intrinsic-size: auto 1px) {
		.section-shell {
			contain-intrinsic-size: auto 1px auto 1200px;
		}
	}
</style>
