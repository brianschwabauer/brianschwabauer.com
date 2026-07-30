<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * An endless ladder of themed marks that travels up at *exactly* the reader's
	 * scroll rate — 1px of scroll, 1px of travel.
	 *
	 * A pinned scrub freezes the page: the scene animates but nothing on screen
	 * moves the way scrolling normally moves things, and the wheel starts to feel
	 * disconnected — like the page is stuck and something else is playing. Drop one
	 * of these into a pinned scene and the periphery keeps sliding at hand-speed,
	 * so the scroll still reads as scrolling while the set piece does its thing.
	 *
	 * It fills its nearest positioned ancestor, so a consumer places and sizes it by
	 * wrapping it — rather than by reaching in past Svelte's scoping to restyle it,
	 * which would come down to which component's rules happened to be bundled last.
	 *
	 * The rungs are laid out statically at multiples of `period` and the *whole*
	 * ladder is moved with a single `translate`, so a scroll frame costs one
	 * composited transform rather than a mark-by-mark restyle. Only `period` px of
	 * travel is ever real: past that the ladder has shifted by exactly one rung, so
	 * it resets to zero and hands each rung its neighbour's index — the marks pass
	 * continuously and the counter behind them keeps climbing forever.
	 */
	let {
		scrolled,
		period = 120,
		mark,
	}: {
		/** Px of scroll banked so far — `PinScrub` hands this to its children. */
		scrolled: number;
		/** Px between rungs. */
		period?: number;
		/** Draws one rung. `k` counts up forever, one per rung passed. */
		mark: Snippet<[{ k: number }]>;
	} = $props();

	let host = $state<HTMLElement | null>(null);
	let height = $state(0);

	$effect(() => {
		if (!host) return;
		// Measure up front rather than waiting to be told to. A ResizeObserver only
		// delivers during a rendering step, which a backgrounded tab skips entirely —
		// so a ladder that learned its height from the observer alone would sit at
		// its one-rung server height until the tab was next looked at.
		height = host.clientHeight;
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(() => (height = host!.clientHeight));
		ro.observe(host);
		return () => ro.disconnect();
	});

	// One rung of slack at each end so a mark is never seen popping into being.
	const rungs = $derived(
		Array.from({ length: Math.ceil(height / period) + 2 }, (_, i) => i),
	);
	const passed = $derived(Math.floor(scrolled / period));
	const offset = $derived(scrolled - passed * period);
</script>

<div bind:this={host} class="drift" aria-hidden="true">
	<div class="ladder" style:translate="0 {-offset}px">
		{#each rungs as i (i)}
			<div class="rung" style:top="{i * period}px">
				{@render mark({ k: passed + i })}
			</div>
		{/each}
	</div>
</div>

<style>
	.drift {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		/* Purely atmospheric — it must never be read out or land in a text search. */
		user-select: none;
	}
	.ladder {
		position: absolute;
		inset: 0;
		will-change: translate;
	}
	.rung {
		position: absolute;
		left: 0;
		right: 0;
	}
	/* The pin collapses to a single static scene under reduced motion, so there is
	   no scroll to carry — and a ladder keyed to scroll would be the exact kind of
	   motion being opted out of. */
	@media (prefers-reduced-motion: reduce) {
		.drift {
			display: none;
		}
	}
</style>
