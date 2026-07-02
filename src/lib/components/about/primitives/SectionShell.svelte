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

	let el = $state<HTMLElement | null>(null);

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
		let stamped = 0;
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
