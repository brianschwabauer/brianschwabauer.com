<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import MediaLibrary from './MediaLibrary.svelte';
	import { bgStyle, thumbnailURL, type ImageRecord } from '$lib/client/images';

	interface Props {
		/** Currently selected image, or null if none */
		image?: ImageRecord | null;
		/** Called when the user picks (or clears) the image */
		onChange?: (image: ImageRecord | null) => void;
		/** Label shown above the picker */
		label?: string;
		/** Hint text shown when no image is selected */
		emptyLabel?: string;
	}

	let {
		image = null,
		onChange,
		label = 'Featured Image',
		emptyLabel = 'No featured image selected',
	}: Props = $props();

	let libraryOpen = $state(false);

	function pick(picked: ImageRecord) {
		onChange?.(picked);
	}

	function clear() {
		onChange?.(null);
	}
</script>

<div class="picker">
	{#if label}
		<div class="picker-label">{label}</div>
	{/if}
	{#if image}
		<div class="picker-current">
			<div
				class="thumb"
				style={bgStyle(image)}
				style:aspect-ratio={image.aspect_ratio || 16 / 9}>
				<img src={thumbnailURL(image)} alt={image.alt_text ?? ''} />
			</div>
			<div class="picker-info">
				<div class="picker-name">{image.file_name ?? image.slug}</div>
				{#if image.alt_text}
					<div class="picker-alt">{image.alt_text}</div>
				{:else}
					<div class="picker-alt picker-alt-missing">No alt text</div>
				{/if}
				<div class="picker-actions">
					<Button size="0" onclick={() => (libraryOpen = true)}>Change</Button>
					<Button size="0" transparent onclick={clear}>Remove</Button>
				</div>
			</div>
		</div>
	{:else}
		<div class="picker-empty">
			<p>{emptyLabel}</p>
			<Button size="0" onclick={() => (libraryOpen = true)}>Choose Image</Button>
		</div>
	{/if}
</div>

<MediaLibrary bind:open={libraryOpen} onSelect={pick} title="Choose Featured Image" />

<style>
	.picker {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.picker-label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.picker-current {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		padding: var(--space-2);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
	}

	.thumb {
		flex: 0 0 200px;
		max-width: 200px;
		border-radius: var(--radius-sm);
		overflow: hidden;
	}

	.thumb img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.picker-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-width: 0;
	}

	.picker-name {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.picker-alt {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.picker-alt-missing {
		font-style: italic;
		color: var(--color-text-muted);
	}

	.picker-actions {
		display: flex;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.picker-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-5);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
	}

	.picker-empty p {
		margin: 0;
		font-size: var(--text-sm);
	}
</style>
