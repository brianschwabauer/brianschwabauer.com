<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { cut } from '$lib/cut.svelte';

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

	let el = $state<HTMLElement | null>(null);
	/** Last height written into contain-intrinsic-size (0 = nothing recorded). */
	let stamped = 0;

	// Stamp the section's real rendered height into contain-intrinsic-size.
	// Without this, every section far from the viewport is laid out at the
	// 1200px estimate, so document.scrollHeight keeps mutating as sections
	// render for real — which makes the YearScrubber's progress fill jump and
	// native hash scrolls land in the wrong place. Once stamped, the skipped
	// placeholder matches the real height and the page length is stable.
	$effect(() => {
		if (!el || typeof ResizeObserver === 'undefined') return;
		// Only measure while the section is actually rendered — a skipped
		// section's height IS the intrinsic-size placeholder, and stamping that
		// back (plus padding) would compound forever.
		const rendered = () =>
			typeof el!.checkVisibility !== 'function' ||
			el!.checkVisibility({ contentVisibilityAuto: true });
		const ro = new ResizeObserver((entries) => {
			if (!rendered()) return;
			for (const entry of entries) {
				// contentRect: contain-intrinsic-size stands in for the *content*
				// box when skipped, so that's the height to record — stamping the
				// border box would double-count the section padding.
				const h = Math.round(entry.contentRect.height);
				if (h > 0 && h !== stamped) {
					stamped = h;
					el!.style.containIntrinsicSize = `1px ${h}px`;
				}
			}
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	// Switching the theatrical/director cut changes almost every section's height
	// at once. A height remembered from the *other* cut is worse than no memory:
	// skipped sections keep standing in at a size they no longer have, so the
	// page carries screen-long phantom gaps and every hash jump lands nowhere
	// until the reader has scrolled past to force a re-measure. Drop the stamp
	// and let the observer re-record from scratch.
	$effect(() => {
		const active_cut = cut.value;
		untrack(() => {
			if (!active_cut) return;
			stamped = 0;
			if (el) el.style.containIntrinsicSize = '';
		});
	});
</script>

<section
	{id}
	bind:this={el}
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
