<script lang="ts">
	let {
		src,
		alt = '',
		caption = '',
		ratio = '',
		fit = 'cover',
		rounded = true,
		shadow = true,
		eager = false,
		video = false,
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
		/** Render a play-button overlay over the poster (use for clickable video thumbnails
		 *  that open a Gallery lightbox). */
		video?: boolean;
		class?: string;
		style?: string;
		onclick?: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
	} = $props();

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
			{src}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class:loaded
			style:object-fit={fit}
			onload={() => (loaded = true)} />
		{#if video}
			<span class="play" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
			</span>
		{/if}
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
			{src}
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
	/* Remember the real rendered size after first paint so sections above the
	   scroll target stop shifting height once they've been seen (see
	   SectionShell for the cross-browser guard rationale). */
	@supports (contain-intrinsic-size: auto 1px) {
		.lazy-media {
			contain-intrinsic-size: auto 600px auto 400px;
		}
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
	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
		width: clamp(44px, 9%, 72px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		backdrop-filter: blur(4px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
		transition:
			transform 200ms ease,
			background 200ms ease;
		pointer-events: none;
	}
	.play svg {
		width: 45%;
		height: 45%;
		margin-left: 6%;
	}
	.lazy-media-button:hover .play {
		transition-duration: 0s;
		transform: translate(-50%, -50%) scale(1.08);
		background: rgba(0, 0, 0, 0.7);
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
