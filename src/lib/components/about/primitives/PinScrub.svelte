<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		height = '300vh',
		class: klass = '',
	}: {
		children: Snippet<[{ progress: number }]>;
		height?: string;
		class?: string;
	} = $props();

	let outer = $state<HTMLElement | null>(null);
	let inner = $state<HTMLElement | null>(null);
	let progress = $state(0);

	$effect(() => {
		if (!outer) return;
		const update = () => {
			const rect = outer!.getBoundingClientRect();
			// Measure the sticky window itself rather than window.innerHeight —
			// the sticky is 100svh, which stays constant while the mobile URL bar
			// collapses, so the progress mapping doesn't lurch mid-scrub.
			const vh = inner?.offsetHeight || window.innerHeight || 1;
			const total = rect.height - vh;
			const traversed = -rect.top;
			progress = Math.max(0, Math.min(1, traversed / Math.max(1, total)));
		};
		// Only track scroll while the pin is anywhere near the viewport.
		let listening = false;
		const listen = (on: boolean) => {
			if (on === listening) return;
			listening = on;
			if (on) {
				update();
				window.addEventListener('scroll', update, { passive: true });
				window.addEventListener('resize', update);
			} else {
				window.removeEventListener('scroll', update);
				window.removeEventListener('resize', update);
			}
		};
		// Fail-open: start listening immediately; the observer only *pauses*
		// tracking once it has actually reported the pin as off-screen.
		listen(true);
		if (typeof IntersectionObserver === 'undefined') {
			return () => listen(false);
		}
		const io = new IntersectionObserver(
			(entries) => listen(entries.some((e) => e.isIntersecting)),
			{ rootMargin: '100% 0px' },
		);
		io.observe(outer);
		return () => {
			io.disconnect();
			listen(false);
		};
	});
</script>

<div bind:this={outer} class="pin-outer {klass}" style:height>
	<div bind:this={inner} class="pin-inner">
		{@render children({ progress })}
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
