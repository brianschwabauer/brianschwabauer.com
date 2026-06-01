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
		style = '',
		onclick = undefined as
			| undefined
			| ((event: MouseEvent & { currentTarget: HTMLButtonElement }) => void),
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
		onclick?: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
	} = $props();

	const resolved = $derived(src.startsWith('http') ? src : media(src));
	let loaded = $state(false);
	const interactive = $derived(typeof onclick === 'function');
</script>

{#if interactive}
	<button
		type="button"
		class="lazy-media lazy-media-button {klass}"
		class:rounded
		class:shadow
		style:aspect-ratio={ratio || undefined}
		{style}
		aria-label={alt || 'Open image'}
		onclick={(e) => onclick?.(e)}>
		<img
			src={resolved}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class:loaded
			style:object-fit={fit}
			onload={() => (loaded = true)} />
		{#if caption}
			<span class="caption">{caption}</span>
		{/if}
	</button>
{:else}
	<figure
		class="lazy-media {klass}"
		class:rounded
		class:shadow
		style:aspect-ratio={ratio || undefined}
		{style}>
		<img
			src={resolved}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class:loaded
			style:object-fit={fit}
			onload={() => (loaded = true)} />
		{#if caption}
			<figcaption>{caption}</figcaption>
		{/if}
	</figure>
{/if}

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
	.lazy-media-button {
		appearance: none;
		border: 0;
		padding: 0;
		width: 100%;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition: transform 200ms ease;
	}
	.lazy-media-button:hover img {
		transition-duration: 0s;
		transform: scale(1.02);
	}
	.lazy-media-button img {
		transition: transform 250ms ease;
	}
	.lazy-media-button:focus-visible {
		outline: 2px solid #00e0ff;
		outline-offset: 2px;
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
	figcaption,
	.lazy-media .caption {
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
