<script lang="ts">
	import { media } from '../media';

	let {
		src,
		alt = '',
		caption = '',
		ratio = '',
		fit = 'cover',
		rounded = true,
		shadow = true,
		eager = false,
		class: klass = '',
		style = ''
	}: {
		src: string;
		alt?: string;
		caption?: string;
		ratio?: string;
		fit?: 'cover' | 'contain';
		rounded?: boolean;
		shadow?: boolean;
		eager?: boolean;
		class?: string;
		style?: string;
	} = $props();

	const resolved = $derived(src.startsWith('http') ? src : media(src));
	let loaded = $state(false);
</script>

<figure class="lazy-media {klass}" class:rounded class:shadow style:aspect-ratio={ratio || undefined} {style}>
	<img
		src={resolved}
		{alt}
		loading={eager ? 'eager' : 'lazy'}
		decoding="async"
		class:loaded
		style:object-fit={fit}
		onload={() => (loaded = true)}
	/>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	.lazy-media {
		position: relative;
		display: block;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		margin: 0;
		content-visibility: auto;
		contain-intrinsic-size: 600px 400px;
	}
	.lazy-media.rounded {
		border-radius: 12px;
	}
	.lazy-media.shadow {
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.35),
			0 2px 6px rgba(0, 0, 0, 0.25);
	}
	img {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 500ms ease;
	}
	img.loaded {
		opacity: 1;
	}
	figcaption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.75rem 1rem;
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75), transparent);
		color: #fff;
		font-size: 0.85rem;
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
	}
</style>
