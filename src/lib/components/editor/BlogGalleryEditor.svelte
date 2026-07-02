<script lang="ts">
	/**
	 * In-editor UI for the BlogGallery node. Mounted into the ProseMirror node
	 * view by BlogGalleryNodeView.svelte.ts.
	 *
	 * - A compact floating toolbar (absolute, so it never shifts page flow) sits
	 *   above the gallery when selected.
	 * - Settings live in a delightstack Popover (opened from the gear button).
	 *   The Popover portals its content to <body>, which keeps the Range sliders
	 *   out of the ProseMirror DOM so TipTap can't hijack their drag gestures.
	 * - Choosing, removing and reordering images all happen in the media modal
	 *   ("Edit images"), which lives outside the editor — so there's no conflict
	 *   between ProseMirror's block drag and a per-thumbnail drag. The inline UI
	 *   is just the live preview plus this toolbar.
	 */
	import { Gallery, type GalleryItem } from '@delightstack/components/media';
	import { Button, ButtonGroup } from '@delightstack/components/actions';
	import { Range } from '@delightstack/components/form';
	import {
		parseGalleryItems,
		entryToGalleryItem,
		type BlogGalleryAttrs,
		type GalleryScale,
		type GalleryDisplay,
		type GalleryFit,
		type WidthMode,
	} from './extensions/BlogGallery';

	interface Props {
		view: { attrs: BlogGalleryAttrs; selected: boolean };
		onUpdateAttrs: (partial: Partial<BlogGalleryAttrs>) => void;
		/** Opens the media modal to add / remove / reorder the gallery's images. */
		onEditImages: () => void;
		onSelect: () => void;
		onDelete: () => void;
	}

	let { view, onUpdateAttrs, onEditImages, onSelect, onDelete }: Props = $props();

	const entries = $derived(parseGalleryItems(view.attrs.items));
	const galleryItems = $derived<GalleryItem[]>(entries.map(entryToGalleryItem));

	const LAYOUTS: { value: GalleryDisplay; label: string }[] = [
		{ value: 'grid', label: 'Grid' },
		{ value: 'masonry', label: 'Masonry' },
		{ value: 'masonry-row', label: 'Masonry rows' },
		{ value: 'slider', label: 'Slider' },
		{ value: 'slideshow', label: 'Slideshow' },
	];
	const WIDTHS: { value: WidthMode; label: string }[] = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'wide', label: 'Wide' },
		{ value: 'full', label: 'Full' },
	];
	const SIZE_LABELS = ['S', 'M', 'L', 'XL'];
	const STEP_LABELS = ['None', 'S', 'M', 'L'];

	function setScale(key: 'size' | 'spacing' | 'radius', value: number) {
		onUpdateAttrs({ [key]: String(value) as GalleryScale });
	}
</script>

{#snippet layoutIcon(key: GalleryDisplay)}
	<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
		{#if key === 'grid'}
			<rect x="3" y="3" width="8" height="8" rx="1.5" />
			<rect x="13" y="3" width="8" height="8" rx="1.5" />
			<rect x="3" y="13" width="8" height="8" rx="1.5" />
			<rect x="13" y="13" width="8" height="8" rx="1.5" />
		{:else if key === 'masonry'}
			<rect x="3" y="3" width="8" height="11" rx="1.5" />
			<rect x="3" y="16" width="8" height="5" rx="1.5" />
			<rect x="13" y="3" width="8" height="5" rx="1.5" />
			<rect x="13" y="10" width="8" height="11" rx="1.5" />
		{:else if key === 'masonry-row'}
			<rect x="3" y="3" width="7" height="8" rx="1.5" />
			<rect x="12" y="3" width="9" height="8" rx="1.5" />
			<rect x="3" y="13" width="11" height="8" rx="1.5" />
			<rect x="16" y="13" width="5" height="8" rx="1.5" />
		{:else if key === 'slider'}
			<rect x="6" y="5" width="12" height="14" rx="1.5" />
			<path d="M3 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			<path d="M21 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		{:else if key === 'slideshow'}
			<rect x="3" y="4" width="18" height="13" rx="1.5" />
			<polygon points="10 8 15 10.5 10 13" fill="var(--color-surface, #fff)" />
			<circle cx="9" cy="20" r="1" />
			<circle cx="12" cy="20" r="1" />
			<circle cx="15" cy="20" r="1" />
		{/if}
	</svg>
{/snippet}

{#snippet settingsMenu(_ctx: { close: () => void })}
	<div class="bg-settings">
		<div class="bg-field">
			<span class="bg-label">Layout</span>
			<ButtonGroup size="0">
				{#each LAYOUTS as l (l.value)}
					<Button
						icon
						size="0"
						translucent
						active={view.attrs.display === l.value}
						accent={view.attrs.display === l.value}
						tooltip={l.label}
						onclick={() => onUpdateAttrs({ display: l.value })}>
						{@render layoutIcon(l.value)}
					</Button>
				{/each}
			</ButtonGroup>
		</div>

		<div class="bg-grid2" style="grid-template-columns: 2fr 1fr;">
			<div class="bg-field">
				<span class="bg-label">Width</span>
				<ButtonGroup size="0">
					{#each WIDTHS as w (w.value)}
						<Button
							size="0"
							translucent
							active={view.attrs.widthMode === w.value}
							accent={view.attrs.widthMode === w.value}
							onclick={() => onUpdateAttrs({ widthMode: w.value })}>
							{w.label}
						</Button>
					{/each}
				</ButtonGroup>
			</div>
			<div class="bg-field">
				<span class="bg-label">Fit</span>
				<ButtonGroup size="0">
					<Button
						size="0"
						translucent
						active={view.attrs.fit === 'contain'}
						accent={view.attrs.fit === 'contain'}
						tooltip="Show the whole image"
						onclick={() => onUpdateAttrs({ fit: 'contain' as GalleryFit })}>
						Fit
					</Button>
					<Button
						size="0"
						translucent
						active={view.attrs.fit === 'cover'}
						accent={view.attrs.fit === 'cover'}
						tooltip="Fill the frame (cropped)"
						onclick={() => onUpdateAttrs({ fit: 'cover' as GalleryFit })}>
						Fill
					</Button>
				</ButtonGroup>
			</div>
		</div>

		<div class="bg-field">
			<span class="bg-label">Thumbnail size</span>
			<Range
				min={0}
				max={3}
				step={1}
				value={Number(view.attrs.size)}
				show_ticks
				tick_labels={SIZE_LABELS}
				aria_label="Thumbnail size"
				onchange={(d) => setScale('size', d.value as number)} />
		</div>
		<div class="bg-field">
			<span class="bg-label">Spacing</span>
			<Range
				min={0}
				max={3}
				step={1}
				value={Number(view.attrs.spacing)}
				show_ticks
				tick_labels={STEP_LABELS}
				aria_label="Spacing"
				onchange={(d) => setScale('spacing', d.value as number)} />
		</div>
		<div class="bg-field">
			<span class="bg-label">Corners</span>
			<Range
				min={0}
				max={3}
				step={1}
				value={Number(view.attrs.radius)}
				show_ticks
				tick_labels={STEP_LABELS}
				aria_label="Corner radius"
				onchange={(d) => setScale('radius', d.value as number)} />
		</div>
	</div>
{/snippet}

<!-- No wrapper element: the component renders directly into the node-view's
     `.blog-gallery` div so the editor's in-flow DOM is `.blog-gallery > .gallery`,
     identical to the SSR/public markup (no hydration shift). The toolbar is
     absolute; the selection outline is toggled on `.blog-gallery` by the node
     view. -->
{#if view.selected}
	<div class="bg-toolbar" role="toolbar" aria-label="Gallery">
		<Button
			icon
			size="0"
			transparent
			tooltip="Gallery settings"
			popoverPlacement="bottom-start"
			menu={settingsMenu}>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16"
				aria-hidden="true">
				<circle cx="12" cy="12" r="3" />
				<path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
			</svg>
		</Button>
		<Button
			icon
			size="0"
			transparent
			tooltip="Add, remove & reorder images"
			onclick={onEditImages}>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16"
				aria-hidden="true">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
		</Button>
		<Button icon size="0" transparent error tooltip="Delete gallery" onclick={onDelete}>
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16"
				aria-hidden="true">
				<polyline points="3 6 5 6 21 6" />
				<path
					d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
			</svg>
		</Button>
	</div>
{/if}

{#if entries.length === 0}
	<!-- Empty placeholder -->
	<button
		type="button"
		class="bg-empty"
		onclick={() => {
			onSelect();
			onEditImages();
		}}>
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			width="32"
			height="32">
			<rect x="3" y="3" width="18" height="18" rx="2" />
			<circle cx="8.5" cy="8.5" r="1.5" />
			<polyline points="21 15 16 10 5 21" />
		</svg>
		<span class="bg-empty-title">Add images to gallery</span>
		<span class="bg-empty-hint">Pick multiple from your media library</span>
	</button>
{:else}
	<!-- Live preview. Clicking a thumbnail selects the node; the gallery's own
		     lightbox is suppressed (onclick returns false) so editing stays in the
		     editor. The Gallery is a direct child of the node-view `.blog-gallery`
		     wrapper (which provides container-type for the @container/cqw layout),
		     so the editor's in-flow DOM matches the SSR/public markup exactly. -->
	<Gallery
		items={galleryItems}
		display={view.attrs.display}
		size={view.attrs.size}
		spacing={view.attrs.spacing}
		radius={view.attrs.radius}
		fit={view.attrs.fit}
		onclick={() => {
			onSelect();
			return false;
		}} />
{/if}

<style>
	/* ── Floating toolbar (absolute → no page-flow shift) ──────────────── */
	.bg-toolbar {
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 6;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
	}

	/* ── Settings popover content ───────────────────────────────────────── */
	.bg-settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 280px;
		max-width: 80vw;
		padding: var(--space-2);
		/* Bridge delightstack's form-token namespace (--c-*) to the app's accent
		   so the Range matches the green Buttons instead of falling back to blue. */
		--c-action: var(--color-action);
		--c-action-active: var(--color-action);
		--c-action-text: #fff;
		--c-bg-6: color-mix(in oklch, var(--color-text) 16%, transparent);
		--c-text-2: var(--color-text-muted);
	}

	.bg-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.bg-label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-muted);
	}

	.bg-grid2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2);
	}

	/* Stretch segmented groups to full width. The inner <button> must stretch
	   too (it defaults to width:fit-content) — otherwise attached buttons leave
	   a gap between the wrappers. */
	.bg-field :global(.button-group) {
		display: flex;
		width: 100%;
	}
	.bg-field :global(.button-group .button) {
		flex: 1;
	}
	.bg-field :global(.button-group .button button) {
		width: 100%;
	}

	/* ── Empty placeholder ─────────────────────────────────────────────── */
	.bg-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		width: 100%;
		min-height: 180px;
		padding: var(--space-7);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-muted);
		color: var(--color-text-muted);
		cursor: pointer;
	}
	.bg-empty:hover {
		transition-duration: 0s;
		border-color: var(--color-action);
		color: var(--color-action);
	}
	.bg-empty-title {
		font-weight: 600;
		font-size: var(--text-sm);
	}
	.bg-empty-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}
</style>
