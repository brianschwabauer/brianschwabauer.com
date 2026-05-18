<script lang="ts">
	import MediaLibrary from '$lib/components/media/MediaLibrary.svelte';
	import { bgStyle, type ImageRecord } from '$lib/client/images';

	interface Props {
		image: ImageRecord | null;
		onChange?: (image: ImageRecord | null) => void;
	}

	let { image, onChange }: Props = $props();

	let libraryOpen = $state(false);
	let rootEl: HTMLDivElement | undefined = $state();
	let focused = $state(false);

	function openLibrary() {
		libraryOpen = true;
	}

	function handlePick(picked: ImageRecord) {
		onChange?.(picked);
	}

	function clearImage() {
		onChange?.(null);
	}

	function handleAltEdit() {
		if (!image) return;
		const next = prompt('Alt text for the cover image:', image.alt_text ?? '');
		if (next === null) return;
		const cleaned = next.trim();
		onChange?.({ ...image, alt_text: cleaned || null });
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!image) return;
		// Only handle delete / backspace when this picker has focus.
		if (!focused) return;
		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			clearImage();
		}
	}
</script>

<svelte:window onkeydown={onKeyDown} />

<div
	bind:this={rootEl}
	class="featured"
	class:has-image={!!image}
	class:focused
	tabindex="0"
	role="button"
	aria-label={image ? 'Cover image — delete or backspace to remove' : 'Add a cover image'}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	onclick={(e) => {
		// Don't reopen when clicking interactive children (e.g., the alt button).
		if ((e.target as HTMLElement).closest('button')) return;
		openLibrary();
	}}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openLibrary();
		}
	}}>
	{#if image}
		<figure
			class="featured-figure"
			style={bgStyle(image)}
			style:aspect-ratio={image.aspect_ratio || 16 / 9}>
			<img
				src={`/cdn/image/${image.path}/default`}
				alt={image.alt_text ?? ''}
				loading="eager"
				decoding="async" />
			<div class="featured-toolbar" role="toolbar" tabindex="-1" aria-label="Cover image controls" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
				<button type="button" class="ft-btn" onclick={openLibrary} title="Replace image">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<polyline points="23 4 23 10 17 10" />
						<polyline points="1 20 1 14 7 14" />
						<path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
					</svg>
					<span>Replace</span>
				</button>
				<button type="button" class="ft-btn" onclick={handleAltEdit} title="Edit alt text">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<path d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
					</svg>
					<span>Alt</span>
				</button>
				<button type="button" class="ft-btn danger" onclick={clearImage} title="Remove cover">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
						<polyline points="3 6 5 6 21 6" />
						<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
					</svg>
				</button>
			</div>
		</figure>
	{:else}
		<div class="placeholder">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="42" height="42" aria-hidden="true">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
			<div class="placeholder-text">
				<div class="placeholder-title">Add a cover image</div>
				<div class="placeholder-sub">Click to choose from your media library or upload a new one</div>
			</div>
		</div>
	{/if}
</div>

<MediaLibrary bind:open={libraryOpen} onSelect={handlePick} title="Choose Cover Image" />

<style>
	.featured {
		position: relative;
		display: block;
		width: 100%;
		max-width: var(--measure);
		margin: 0 auto var(--space-10);
		border-radius: var(--radius-lg);
		cursor: pointer;
		text-align: left;
		background: transparent;
		border: none;
		padding: 0;
		outline: none;
	}

	/* Use the inner placeholder's existing accent state for keyboard focus
	   instead of a heavy box-shadow halo around the whole element. */
	.featured:focus-visible {
		outline: none;
	}

	.placeholder {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-8);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-secondary);
		background: var(--color-bg-secondary);
		transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
		aspect-ratio: 16 / 7;
		justify-content: center;
	}

	.featured:hover .placeholder,
	.featured.focused .placeholder {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: var(--color-accent-light);
	}

	.placeholder-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.placeholder-title {
		font-size: var(--text-base);
		font-weight: 600;
	}

	.placeholder-sub {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.featured-figure {
		position: relative;
		display: block;
		margin: 0;
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: var(--color-bg-secondary);
	}

	.featured-figure img {
		display: block;
		width: 100%;
		height: auto;
	}

	.featured-toolbar {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		display: flex;
		gap: 2px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.55);
		border-radius: var(--radius-md);
		backdrop-filter: blur(8px);
		opacity: 0;
		transition: opacity 150ms ease;
	}

	.featured:hover .featured-toolbar,
	.featured.focused .featured-toolbar {
		opacity: 1;
	}

	.ft-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: white;
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease;
	}

	.ft-btn:hover { background: rgba(255, 255, 255, 0.18); }
	.ft-btn.danger:hover { background: var(--color-error); }
</style>
