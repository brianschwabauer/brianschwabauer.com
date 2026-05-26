<script lang="ts">
	import { media } from '../media';

	let {
		images,
		height = 200,
		speed = 60,
		direction = 'left',
	}: {
		images: Array<string | { src: string; caption?: string }>;
		height?: number;
		speed?: number;
		direction?: 'left' | 'right';
	} = $props();

	const normalized = $derived(
		images.map((i) => (typeof i === 'string' ? { src: i } : i)),
	);
	const doubled = $derived([...normalized, ...normalized]);
</script>

<div
	class="film-reel"
	style:--reel-height="{height}px"
	style:--reel-duration="{speed}s"
	style:--reel-direction={direction === 'right' ? 'reverse' : 'normal'}>
	<div class="perforations top" aria-hidden="true">
		{#each Array(40) as _}<span></span>{/each}
	</div>
	<div class="track">
		{#each doubled as item, i (i)}
			<figure class="frame">
				<img
					src={item.src.startsWith('http') ? item.src : media(item.src)}
					alt={item.caption ?? ''}
					loading="lazy"
					decoding="async" />
				{#if item.caption}<figcaption>{item.caption}</figcaption>{/if}
			</figure>
		{/each}
	</div>
	<div class="perforations bottom" aria-hidden="true">
		{#each Array(40) as _}<span></span>{/each}
	</div>
</div>

<style>
	.film-reel {
		position: relative;
		width: 100%;
		background: linear-gradient(180deg, #111 0%, #1a1a1a 50%, #111 100%);
		padding: 18px 0;
		overflow: hidden;
		border-radius: 4px;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
	}
	.perforations {
		display: flex;
		justify-content: space-around;
		padding: 0 8px;
		height: 14px;
	}
	.perforations span {
		display: block;
		width: 22px;
		height: 10px;
		background: #0a0a0a;
		border-radius: 1px;
		box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
	}
	.track {
		display: flex;
		gap: 4px;
		padding: 6px 0;
		animation: scroll var(--reel-duration) linear infinite;
		animation-direction: var(--reel-direction);
		will-change: transform;
	}
	.film-reel:hover .track {
		transition-duration: 0s;
		animation-play-state: paused;
	}
	@keyframes scroll {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	.frame {
		flex: 0 0 auto;
		margin: 0;
		height: var(--reel-height);
		background: #000;
		border: 2px solid #000;
		outline: 2px solid #1a1a1a;
		position: relative;
		overflow: hidden;
	}
	.frame img {
		height: 100%;
		width: auto;
		display: block;
		object-fit: cover;
	}
	figcaption {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.2rem 0.5rem;
		background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		opacity: 0;
		transition: opacity 200ms ease;
	}
	.frame:hover figcaption {
		transition-duration: 0s;
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}
	}
</style>
