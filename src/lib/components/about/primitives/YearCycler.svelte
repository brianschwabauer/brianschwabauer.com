<script lang="ts">
	import BuildField from './BuildField.svelte';
	import { onScrollProgress } from './scrollProgress';

	let {
		years,
		color = '#ffffff',
		caption = '',
		pinHeight = '100vh',
	}: {
		years: number[];
		color?: string;
		caption?: string;
		pinHeight?: string;
	} = $props();

	let el = $state<HTMLElement | null>(null);
	let stickyEl = $state<HTMLElement | null>(null);
	let stageEl = $state<HTMLElement | null>(null);
	let stage_h = $state(0);
	let progress = $state(0);

	// The shared scroll bus does the listener/rAF/IO bookkeeping (and the rect
	// read) once for the whole page — this just maps the rect to progress.
	$effect(() => {
		if (!el) return;
		return onScrollProgress(el, (rect) => {
			// The numerals' type size, for the field's clearing. Taken here rather
			// than with `bind:clientHeight` because that binding is delivered by a
			// ResizeObserver, and the field draws nothing at all until this arrives.
			if (stageEl) stage_h = stageEl.offsetHeight;
			// Measure the sticky window itself (100svh) instead of
			// window.innerHeight, which changes when the mobile URL bar collapses
			// and would make the progress mapping jump mid-scrub.
			const vh = stickyEl?.offsetHeight || window.innerHeight || 1;
			// rect.height = sticky window + pinHeight (extra scroll room).
			// Track progress from when the section's top hits viewport top (start of pin)
			// to when the sticky reaches the bottom of its container (end of pin).
			const t = -rect.top;
			const span = rect.height - vh;
			progress = span > 0 ? Math.max(0, Math.min(1, t / span)) : 0;
		});
	});

	const virtualIndex = $derived(years.length > 1 ? progress * (years.length - 1) : 0);
</script>

<div
	bind:this={el}
	class="year-cycler"
	style:--c={color}
	style:--pin-height={pinHeight}
	aria-hidden="true">
	<div class="sticky" bind:this={stickyEl}>
		<!-- Fills the frame around the numerals. `gate` is the stage's own height —
		     i.e. the type size, since `.stage` is exactly one line tall — which is
		     what the field measures its clearing in. -->
		<BuildField {progress} blocks={years.length} {color} gate={stage_h} />
		<div class="stage" bind:this={stageEl}>
			{#each years as y, i (y)}
				{@const offset = i - virtualIndex}
				{@const opacity = Math.max(0, 1 - Math.min(1, Math.abs(offset)))}
				<span class="year" style:transform="translateY({offset * 100}%)" style:opacity>
					{y}
				</span>
			{/each}
		</div>
		<div class="rail">
			<div class="fill" style:transform="scaleX({progress})"></div>
		</div>
		{#if caption}
			<div class="caption">{caption}</div>
		{/if}
	</div>
</div>

<style>
	.year-cycler {
		position: relative;
		/* The numerals' type size, hoisted: the stage box, the glyphs and the clearing
		   the build field leaves for them are all measured from this one value, so
		   they cannot drift apart. */
		--gate: clamp(7rem, 22vw, 25rem);
		width: 100%;
		/* sticky window (100svh) + scroll distance (pinHeight) */
		height: calc(100svh + var(--pin-height));
		pointer-events: none;
		user-select: none;
		/* Mounted directly in the page root, outside every SectionShell. Skipping
		   while far away drops the six will-change'd stroked numerals' layers.
		   The height is explicit, so skipping costs no layout shift; sticky
		   children inside content-visibility subtrees already work elsewhere on
		   this page (see WhatMakesUsHuman's echoes). */
		content-visibility: auto;
	}
	.sticky {
		position: sticky;
		top: 0;
		height: 100svh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
	}
	/* The field is absolutely positioned, so it would paint over these in-flow
	   siblings without a stacking order of their own. */
	.stage,
	.rail,
	.caption {
		position: relative;
		z-index: 1;
	}
	.stage {
		width: 100%;
		height: var(--gate);
		overflow: hidden;
	}
	.year {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: var(--gate);
		line-height: 1;
		letter-spacing: -0.04em;
		color: transparent;
		-webkit-text-stroke: 2px var(--c);
		font-variant-numeric: tabular-nums;
		transition:
			transform 120ms linear,
			opacity 120ms linear;
		will-change: transform, opacity;
	}
	.rail {
		width: min(50vw, 24rem);
		height: 2px;
		background: rgba(255, 255, 255, 0.12);
		border-radius: 2px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		width: 100%;
		background: var(--c);
		transform-origin: left;
		transition: transform 80ms linear;
	}
	.caption {
		font-family: var(--font-mono);
		font-size: 0.74rem;
		letter-spacing: 0.32em;
		text-transform: uppercase;
		opacity: 0.5;
		color: #fff;
	}
	@media (max-width: 640px) {
		.year {
			-webkit-text-stroke-width: 1.5px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.year {
			transition: none;
		}
	}
</style>
