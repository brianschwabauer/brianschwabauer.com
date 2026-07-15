<script lang="ts">
	// A horizontally scroll-snapped strip of photos — the page's single
	// horizontal moment. Items keep their natural aspect ratio at a shared
	// height, like frames on a contact sheet.
	let {
		items,
		height = 'clamp(240px, 40vh, 380px)',
		onitemclick = undefined as
			| ((detail: { index: number; element: HTMLButtonElement }) => void)
			| undefined,
	}: {
		items: Array<
			string | { src?: string; width?: number; height?: number; alt?: string }
		>;
		height?: string;
		onitemclick?: (detail: { index: number; element: HTMLButtonElement }) => void;
	} = $props();

	// Accept GalleryItem-shaped objects (src is optional there); render only
	// entries that actually have an image source.
	const normalized = $derived(
		items
			.map((i) => (typeof i === 'string' ? { src: i } : i))
			.filter((i): i is { src: string; width?: number; height?: number; alt?: string } =>
				Boolean(i.src),
			),
	);

	const ratioOf = (i: { width?: number; height?: number }) =>
		i.width && i.height ? `${i.width} / ${i.height}` : '3 / 2';
</script>

<div class="snap-strip" style:--strip-height={height}>
	<ul>
		{#each normalized as item, i (item.src)}
			<li>
				<button
					type="button"
					aria-label={item.alt ?? 'Open photo'}
					onclick={(e) => onitemclick?.({ index: i, element: e.currentTarget })}>
					<img
						src={item.src}
						alt={item.alt ?? ''}
						style:aspect-ratio={ratioOf(item)}
						loading="lazy"
						decoding="async" />
				</button>
			</li>
		{/each}
	</ul>
	<div class="hint" aria-hidden="true">scroll →</div>
</div>

<style>
	.snap-strip {
		position: relative;
		width: 100vw;
		margin-left: calc(50% - 50vw);
		margin-right: calc(50% - 50vw);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0.5rem clamp(1rem, 6vw, 5rem);
		display: flex;
		gap: 0.75rem;
		overflow-x: auto;
		scroll-snap-type: x proximity;
		scroll-padding-inline: clamp(1rem, 6vw, 5rem);
		scrollbar-width: none;
		/* Fade the strip's cut edges so it reads as a window onto more. */
		mask-image: linear-gradient(
			90deg,
			transparent,
			#000 clamp(0.75rem, 4vw, 3rem),
			#000 calc(100% - clamp(0.75rem, 4vw, 3rem)),
			transparent
		);
		-webkit-mask-image: linear-gradient(
			90deg,
			transparent,
			#000 clamp(0.75rem, 4vw, 3rem),
			#000 calc(100% - clamp(0.75rem, 4vw, 3rem)),
			transparent
		);
	}
	ul::-webkit-scrollbar {
		display: none;
	}
	li {
		flex: 0 0 auto;
		scroll-snap-align: center;
	}
	button {
		all: unset;
		display: block;
		cursor: zoom-in;
		border-radius: 10px;
		overflow: hidden;
		transition: transform 200ms ease;
	}
	button:hover {
		transition-duration: 0s;
		transform: translateY(-4px);
	}
	button:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
	}
	img {
		display: block;
		height: var(--strip-height);
		width: auto;
		object-fit: cover;
	}
	.hint {
		position: absolute;
		right: clamp(1rem, 6vw, 5rem);
		bottom: -1.4rem;
		font-family: var(--font-mono);
		font-size: 0.66rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		opacity: 0.4;
	}
	@media (prefers-reduced-motion: reduce) {
		button {
			transition: none;
		}
	}
</style>
