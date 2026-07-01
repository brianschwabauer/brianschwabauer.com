<script lang="ts">
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { pushState, replaceState } from '$app/navigation';
	import {
		Gallery,
		type GalleryItem,
		type GalleryDisplay,
	} from '@delightstack/components/media';

	/**
	 * A deep-linkable wrapper around the delightstack lightbox `Gallery`.
	 *
	 * Each instance owns a stable `key`. When the URL carries `?media=<key>` (with
	 * an optional `&i=<index>`) this gallery opens to that item — so the modal
	 * survives a refresh and can be shared, and (because the param is read in a
	 * `$derived`) the matching gallery server-renders already open over the page
	 * behind it. Opening pushes a history entry, so Back closes the modal; the `i`
	 * index marks only the *entry* slide and is not updated as the user swipes.
	 *
	 * Drop-in replacement for `<Gallery … display="lightbox">`: triggers still
	 * call `gallery.open(index, fromElement)` on the bound instance.
	 */
	let {
		key,
		items,
		display = 'lightbox',
		...rest
	}: {
		/** Stable identifier used in the `?media=<key>` deep-link param. */
		key: string;
		items: GalleryItem[];
		/**
		 * Gallery display mode. Defaults to the headless `'lightbox'` (opened by
		 * external trigger elements via `open()`), but any modal-opening mode works
		 * — e.g. `'masonry'`/`'grid'` render their own thumbnails and open the modal
		 * on click, and the slide↔URL sync deep-links them all the same.
		 */
		display?: GalleryDisplay;
		/** Forwarded to the underlying Gallery (e.g. `size`, `autoplay_video`). */
		[prop: string]: unknown;
	} = $props();

	let inner = $state<ReturnType<typeof Gallery>>();

	/** Slide index the URL says this gallery should show, or -1 when closed. */
	const urlIndex = $derived.by(() => {
		const params = page.url.searchParams;
		if (params.get('media') !== key || !items.length) return -1;
		const i = Number.parseInt(params.get('i') ?? '0', 10);
		if (!Number.isInteger(i) || i < 0) return 0;
		// Clamp so a stale/out-of-range `?i=` can't open a non-existent slide.
		return Math.min(i, items.length - 1);
	});

	// Seed from the URL so a deep-linked modal renders open on the server.
	let slide = $state(untrack(() => urlIndex));

	// Build the target URL from the *live* address (`location`), never from
	// `page.url`: SvelteKit's `page.url` does NOT reliably reflect a shallow-
	// routing `pushState`/`replaceState` we just made, so reading it back to
	// build the next URL drops params (or the section hash) intermittently.
	function urlFor(open: boolean, index = 0) {
		const u = new URL(location.href);
		if (open) {
			u.searchParams.set('media', key);
			if (index > 0) u.searchParams.set('i', String(index));
			else u.searchParams.delete('i');
		} else {
			u.searchParams.delete('media');
			u.searchParams.delete('i');
		}
		return u.pathname + u.search + u.hash;
	}

	// `pushState`/`replaceState` throw before SvelteKit's router is initialised;
	// the reconciliation below only writes on genuine open/close transitions
	// (never on the initial mount), but guard anyway so a pre-init write can't
	// crash the effect flush.
	function writeUrl(push: boolean, url: string) {
		try {
			(push ? pushState : replaceState)(url, page.state);
		} catch {
			history[push ? 'pushState' : 'replaceState'](history.state, '', url);
		}
	}

	/** Open the modal at `index`, anchoring the zoom animation to `from`. */
	export function open(index: number, from?: HTMLElement) {
		if (!items[index]) return;
		if (inner) inner.open(index, from);
		else slide = index;
		// The URL is written by the reconciliation effect below, keyed off `slide`.
	}

	export function close() {
		inner?.close();
	}

	// `slide` (the Gallery's open state) is the source of truth: when it flips
	// open/closed we write the URL to match — push on open (so Back closes),
	// replace on close. We deliberately do NOT gate that write on the current URL,
	// because `page.url` can be stale right after our own writes and gating there
	// silently dropped the param on reopen. `page.url` (via `urlIndex`) is only
	// consulted to seed the initial slide and to react to real Back/Forward
	// navigation, both of which update it reliably. `slide` moving while the modal
	// stays open (carousel next/prev) is ignored — the URL records the entry
	// index, not every swipe. `lastOpen`/`lastUrlIndex` track what we last synced
	// so each change propagates one way exactly once and never bounces back.
	let lastOpen = untrack(() => slide >= 0);
	let lastUrlIndex = untrack(() => urlIndex);

	$effect(() => {
		const isOpen = slide >= 0;
		const target = urlIndex;
		untrack(() => {
			if (isOpen !== lastOpen) {
				// The modal opened or closed (our open(), or its own Esc/backdrop/×).
				lastOpen = isOpen;
				writeUrl(isOpen, urlFor(isOpen, slide));
				lastUrlIndex = urlIndex;
			} else if (target !== lastUrlIndex) {
				// The URL changed on its own (deep-link load, Back/Forward).
				lastUrlIndex = target;
				if (target >= 0 && !isOpen) {
					if (inner) inner.open(target);
					else slide = target;
				} else if (target < 0 && isOpen) {
					slide = -1;
				}
				lastOpen = slide >= 0;
			}
		});
	});
</script>

<Gallery bind:this={inner} bind:slide {items} {display} {...rest} />
