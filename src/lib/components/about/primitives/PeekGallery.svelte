<script lang="ts">
	// A gallery that shows a taste of itself and lets the reader ask for the rest.
	//
	// It renders `peek` thumbnails and darkens the last one into a "+N more"
	// tile. Clicking it expands the grid in place; clicking any other thumbnail
	// opens the lightbox on the *full* set. Either way the whole item array is
	// mounted in a headless `LightboxGallery`, so `?media=` deep links always
	// resolve and the carousel can page through every photo.
	import {
		Gallery,
		type GalleryItem,
		type GalleryDisplay,
	} from '@delightstack/components/media';
	import LightboxGallery from './LightboxGallery.svelte';

	let {
		key,
		items,
		peek = 8,
		display = 'masonry',
		...rest
	}: {
		/** Stable identifier used in the `?media=<key>` deep-link param. */
		key: string;
		items: GalleryItem[];
		/** Thumbnails shown before the reader asks for more. Aim for 1–2 rows. */
		peek?: number;
		display?: GalleryDisplay;
		[prop: string]: unknown;
	} = $props();

	let expanded = $state(false);
	let lightbox = $state<ReturnType<typeof LightboxGallery>>();
	let grid_el = $state<HTMLElement>();

	/** Below this, hiding costs a whole tile to save almost nothing. */
	const WORTH_HIDING = 3;

	const visible = $derived(
		expanded || items.length <= peek + WORTH_HIDING ? items.length : peek,
	);
	const hidden = $derived(items.length - visible);
	// A quoted string, because it lands in `content:` on the overlay.
	const more_label = $derived(`"+${hidden} more"`);

	// Mirror `caption` into `name` so thumbnails carry the same text the
	// fullscreen carousel shows — same convention as LightboxGallery.
	const shown = $derived(
		items
			.slice(0, visible)
			.map((item) =>
				item && typeof item === 'object' && item.caption && !item.name
					? { ...item, name: item.caption }
					: item,
			),
	);

	// Masonry lays out with `grid-auto-flow: dense`, so the last DOM node isn't
	// reliably the last *visible* tile — a short item can backfill an earlier
	// gap. Find the tile that actually sits furthest down-and-right and mark it,
	// re-measuring whenever the grid reflows.
	$effect(() => {
		const root = grid_el;
		if (!root) return;
		void visible;
		const tilesIn = () => [...root.querySelectorAll<HTMLElement>('.gallery-item')];
		if (hidden <= 0) {
			// Nothing left to reveal. Clear the mark, or the tile that used to be
			// the "+N more" control would keep swallowing clicks instead of
			// opening its photo.
			for (const tile of tilesIn()) tile.removeAttribute('data-peek-more');
			return;
		}
		const mark = () => {
			const tiles = tilesIn();
			let last: HTMLElement | undefined;
			for (const tile of tiles) {
				if (
					!last ||
					tile.offsetTop > last.offsetTop ||
					(tile.offsetTop === last.offsetTop && tile.offsetLeft > last.offsetLeft)
				) {
					last = tile;
				}
			}
			for (const tile of tiles) tile.toggleAttribute('data-peek-more', tile === last);
		};
		mark();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(mark);
		ro.observe(root);
		return () => ro.disconnect();
	});

	function onTileClick(event: MouseEvent | KeyboardEvent, index: number) {
		const tile = (event.target as HTMLElement | null)?.closest?.('.gallery-item');
		if (tile?.hasAttribute('data-peek-more')) {
			expanded = true;
			return false as const;
		}
		lightbox?.open(index, (tile as HTMLElement) ?? undefined);
		return false as const;
	}
</script>

<div
	bind:this={grid_el}
	class="peek"
	class:more={hidden > 0}
	style:--more-label={more_label}>
	<Gallery items={shown} {display} disable_fullscreen onclick={onTileClick} {...rest} />
</div>

{#if hidden > 0}
	<!-- The tile overlay is the affordance for anyone who can see it; this is the
	     same action with a real accessible name, revealed on keyboard focus. -->
	<button type="button" class="show-all" onclick={() => (expanded = true)}>
		Show all {items.length} photos
	</button>
{/if}

<LightboxGallery bind:this={lightbox} {key} {items} display="lightbox" />

<style>
	.peek {
		display: block;
	}
	/* Darken the last tile into the "+N more" control. It's still a real gallery
	   item — role=button, focusable, Enter-activatable — so this is presentation
	   over an existing control rather than a new one. */
	.peek.more :global(.gallery-item[data-peek-more]) {
		position: relative;
	}
	.peek.more :global(.gallery-item[data-peek-more])::after {
		content: var(--more-label);
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: inherit;
		background: rgba(0, 0, 0, 0.62);
		color: #fff;
		font-family: var(--font-mono);
		font-size: clamp(0.72rem, 1.6vw, 0.9rem);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
		pointer-events: none;
		transition: background-color 250ms ease;
	}
	.peek.more :global(.gallery-item[data-peek-more]:hover)::after {
		transition-duration: 0s;
		background: rgba(0, 0, 0, 0.45);
	}

	.show-all {
		/* Off-screen until focused, so keyboard users get a labelled control
		   without duplicating the visible tile. */
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
	.show-all:focus-visible {
		position: static;
		width: auto;
		height: auto;
		margin: 1rem auto 0;
		padding: 0.55rem 1.1rem;
		overflow: visible;
		clip-path: none;
		display: block;
		font: inherit;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: inherit;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid currentColor;
		border-radius: 999px;
	}
</style>
