<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade' | 'tilt' | 'blur';

	let {
		children,
		variant = 'up',
		delay = 0,
		distance = 60,
		once = true,
		threshold = 0.15,
		class: klass = '',
	}: {
		children: Snippet;
		variant?: Variant;
		delay?: number;
		distance?: number;
		once?: boolean;
		threshold?: number;
		class?: string;
	} = $props();

	let el = $state<HTMLElement | null>(null);
	let visible = $state(false);

	$effect(() => {
		if (!el) return;
		if (typeof IntersectionObserver === 'undefined') {
			visible = true;
			return;
		}
		const obs = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible = true;
						if (once) obs.disconnect();
					} else if (!once) {
						visible = false;
					}
				}
			},
			{ threshold, rootMargin: '0px 0px -10% 0px' },
		);
		obs.observe(el);
		return () => obs.disconnect();
	});

	function initial(v: Variant, d: number): string {
		switch (v) {
			case 'up':
				return `translateY(${d}px)`;
			case 'down':
				return `translateY(-${d}px)`;
			case 'left':
				return `translateX(${d}px)`;
			case 'right':
				return `translateX(-${d}px)`;
			case 'scale':
				return 'scale(0.85)';
			case 'tilt':
				return 'perspective(800px) rotateX(15deg) translateY(40px)';
			case 'blur':
			case 'fade':
				return 'none';
		}
	}
</script>

<div
	bind:this={el}
	class="reveal {klass}"
	class:visible
	style:--reveal-initial-transform={initial(variant, distance)}
	style:--reveal-delay="{delay}ms"
	style:--reveal-blur={variant === 'blur' ? '8px' : '0'}>
	{@render children()}
</div>

<style>
	.reveal {
		opacity: 0;
		transform: var(--reveal-initial-transform);
		filter: blur(var(--reveal-blur));
		transition:
			opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
			transform 800ms cubic-bezier(0.16, 1, 0.3, 1) var(--reveal-delay),
			filter 800ms ease var(--reveal-delay);
		will-change: opacity, transform, filter;
	}
	.reveal.visible {
		opacity: 1;
		transform: none;
		filter: blur(0);
	}
	@media (prefers-reduced-motion: reduce) {
		.reveal {
			transition: none;
			transform: none;
			filter: none;
			opacity: 1;
		}
	}
</style>
