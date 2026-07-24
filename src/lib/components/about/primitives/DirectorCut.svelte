<script lang="ts">
	// A stretch of the page that only exists in the director's cut. In the
	// theatrical cut it collapses to a `DeletedScenes` strip, which is itself the
	// switch back to the full version.
	//
	// The children are unmounted while collapsed, so don't put anything in here
	// that has to keep working from the outside — a deep-linkable
	// `LightboxGallery` belongs beside a bare `DeletedScenes` strip instead.
	import type { Snippet } from 'svelte';
	import { cut } from '$lib/cut.svelte';
	import DeletedScenes from './DeletedScenes.svelte';

	let {
		scenes = 1,
		label,
		children,
		class: klass = '',
	}: {
		children: Snippet;
		/** How many scenes the marker claims to be hiding. */
		scenes?: number;
		/** Overrides the "N deleted scenes" text entirely. */
		label?: string;
		/** Applied to the expanded content only — layout classes like
		    `.gallery-bleed` describe the content, not the collapsed marker. */
		class?: string;
	} = $props();
</script>

<!-- The wrapper outlives the swap, which is what makes it usable as the scroll
     anchor: the strip is torn out of the DOM the instant the cut changes, so
     measuring it after the fact would read a detached node. -->
<div class="director-cut">
	{#if cut.director}
		<div class="expanded {klass}">
			<p class="micro">Director's cut</p>
			{@render children()}
		</div>
	{:else}
		<DeletedScenes {scenes} {label} />
	{/if}
</div>

<style>
	.director-cut,
	.expanded {
		display: block;
	}
	.expanded {
		animation: swap-in 150ms ease;
	}
	.micro {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		opacity: 0.4;
		margin: 0 0 0.7rem;
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
