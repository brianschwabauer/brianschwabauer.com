<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onScrollProgress } from './scrollProgress';

	let {
		children,
		height = '300vh',
		class: klass = '',
	}: {
		children: Snippet<[{ progress: number; scrolled: number }]>;
		height?: string;
		class?: string;
	} = $props();

	let outer = $state<HTMLElement | null>(null);
	let inner = $state<HTMLElement | null>(null);
	let progress = $state(0);
	// How far the page has scrolled *into* the pin, in px. `progress` is the same
	// number normalised, but a drift layer that has to move 1:1 with the scroll
	// needs the raw pixels — a normalised value would tie its speed to the pin's
	// length instead of to the reader's actual scrolling.
	let scrolled = $state(0);

	// The shared scroll bus does the listener/rAF/IO bookkeeping (and the rect
	// read) once for the whole page — this just maps the rect to progress.
	$effect(() => {
		if (!outer) return;
		return onScrollProgress(outer, (rect) => {
			// Measure the sticky window itself rather than window.innerHeight —
			// the sticky is 100svh, which stays constant while the mobile URL bar
			// collapses, so the progress mapping doesn't lurch mid-scrub.
			const vh = inner?.offsetHeight || window.innerHeight || 1;
			const total = rect.height - vh;
			const traversed = -rect.top;
			scrolled = Math.max(0, Math.min(total, traversed));
			progress = Math.max(0, Math.min(1, traversed / Math.max(1, total)));
		});
	});
</script>

<div bind:this={outer} class="pin-outer {klass}" style:height>
	<div bind:this={inner} class="pin-inner">
		{@render children({ progress, scrolled })}
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
		height: 100svh;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	/* Under reduced motion the scroll-scrub is disorienting — collapse the pin
	   to a single static viewport-height scene instead of a long pinned scrub. */
	@media (prefers-reduced-motion: reduce) {
		.pin-outer {
			height: auto !important;
		}
		.pin-inner {
			position: relative;
		}
	}
</style>
