<script lang="ts">
	// A stretch of the page that starts collapsed behind a `FilmStrip`, and drops
	// into place when the reader asks for it.
	//
	// The state is per-instance and per-visit on purpose: opening one section's
	// scenes says nothing about the next section's, and a refresh puts every
	// strip back. Nothing is persisted.
	//
	// The children are unmounted while collapsed, so don't put anything in here
	// that has to keep working from the outside — a deep-linkable
	// `LightboxGallery` belongs beside a bare `FilmStrip` instead.
	import { tick, type Snippet } from 'svelte';
	import FilmStrip from './FilmStrip.svelte';

	let {
		scenes = 1,
		label,
		children,
	}: {
		children: Snippet;
		/** How many scenes the strip claims to be hiding. */
		scenes?: number;
		/** Overrides the "View N deleted scenes" text entirely. */
		label?: string;
	} = $props();

	let expanded = $state(false);
	let expanded_el = $state<HTMLElement>();

	async function reveal() {
		expanded = true;
		// The strip the reader just activated is torn out, so keyboard focus would
		// fall back to the body and the next Tab would restart from the top of the
		// page. Hand it to the scenes that replaced it instead.
		await tick();
		// `preventScroll` is the whole point: the revealed block runs thousands of
		// pixels past the fold, and a plain focus() scrolls it into view — which
		// yanks the page out from under the reader at the exact moment they're
		// looking at what just appeared. Nothing should move but the content
		// below.
		expanded_el?.focus({ preventScroll: true });
	}
</script>

{#if expanded}
	<div bind:this={expanded_el} class="expanded" tabindex="-1">
		{@render children()}
	</div>
{:else}
	<FilmStrip {scenes} {label} onclick={reveal} />
{/if}

<style>
	/* The block lands at full height in one frame rather than animating a
	   `grid-template-rows` open. A fold runs 2000px+, so unfolding it would drag
	   the whole page through that distance — the "animate the element, not the
	   page" line. The strip doesn't move, nothing above it moves, and the
	   staggered `Reveal`s inside carry the actual motion as they enter view. */
	.expanded {
		display: block;
		animation: swap-in 300ms cubic-bezier(0.25, 1, 0.5, 1);
	}
	.expanded:focus {
		outline: none;
	}
	.expanded:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 6px;
	}

	@keyframes swap-in {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.expanded {
			animation: none;
		}
	}
</style>
