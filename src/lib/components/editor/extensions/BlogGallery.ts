/**
 * Custom TipTap node for a multi-image gallery, backed by the delightstack
 * Gallery component.
 *
 * The node stores a snapshot of each image (path / alt / caption / dimensions /
 * thumbhash / bgColor / variants) plus the gallery's display settings. The
 * snapshot mirrors what `recordToBlogImageAttrs` does for single images — so a
 * gallery keeps working (and renders the right srcset) even if the underlying
 * Media Library record changes later.
 *
 * Attributes:
 *   items      JSON-encoded array of GalleryImageEntry
 *   display    'grid' | 'masonry' | 'masonry-row' | 'slider' | 'slideshow'
 *   size       '0' | '1' | '2' | '3'  (delightstack thumbnail size scale)
 *   spacing    '0' | '1' | '2' | '3'  (gap between items)
 *   radius     '0' | '1' | '2' | '3'  (corner radius of items)
 *   fit        'cover' | 'contain'    (object-fit in the lightbox/carousel)
 *   widthMode  'normal' | 'wide' | 'full'  (column breakout, mirrors BlogImage)
 *
 * The editor uses createBlogGalleryNodeView() for an interactive in-editor UI.
 * The public page renders the JSON via src/lib/server/renderDoc.ts.
 */
import { Node, mergeAttributes } from '@tiptap/core';
import type { GalleryItem } from '@delightstack/components/media';
import type { ImageRecord, ImageVariantInfo } from '$lib/types/images';
import { createBlogGalleryNodeView } from './BlogGalleryNodeView.svelte';

export type GalleryDisplay = 'grid' | 'masonry' | 'masonry-row' | 'slider' | 'slideshow';
export type GalleryScale = '0' | '1' | '2' | '3';
export type GalleryFit = 'cover' | 'contain';
export type WidthMode = 'normal' | 'wide' | 'full';

/** One image snapshot stored on the gallery node. */
export interface GalleryImageEntry {
	path: string;
	alt: string | null;
	caption: string | null;
	width: number;
	height: number;
	thumbhash: string | null;
	bgColor: string | null;
	variants: ImageVariantInfo[];
}

export interface BlogGalleryAttrs {
	/** JSON-encoded GalleryImageEntry[] */
	items: string;
	display: GalleryDisplay;
	size: GalleryScale;
	spacing: GalleryScale;
	radius: GalleryScale;
	fit: GalleryFit;
	widthMode: WidthMode;
}

export interface BlogGalleryOptions {
	/**
	 * Opens the multi-select Media Library and resolves with the chosen records.
	 * Wired up by BodyEditor so the node view can add images without owning a
	 * MediaLibrary instance itself.
	 */
	openImagePicker?: (onPick: (records: ImageRecord[]) => void) => void;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blogGallery: {
			/** Insert a BlogGallery node. */
			setBlogGallery: (attrs?: Partial<BlogGalleryAttrs>) => ReturnType;
		};
	}
}

const DEFAULTS: BlogGalleryAttrs = {
	items: '[]',
	display: 'masonry',
	size: '2',
	spacing: '1',
	radius: '1',
	fit: 'contain',
	widthMode: 'wide',
};

/** Parse the node's `items` attribute into a typed array (never throws). */
export function parseGalleryItems(json: unknown): GalleryImageEntry[] {
	try {
		if (typeof json === 'string') return JSON.parse(json) as GalleryImageEntry[];
		if (Array.isArray(json)) return json as GalleryImageEntry[];
	} catch {
		/* fall through */
	}
	return [];
}

/** Snapshot an ImageRecord into a gallery entry (mirrors recordToBlogImageAttrs). */
export function recordToGalleryEntry(record: ImageRecord): GalleryImageEntry {
	return {
		path: record.path,
		alt: record.alt_text ?? null,
		caption: record.caption ?? null,
		width: record.width,
		height: record.height,
		thumbhash: record.thumbhash,
		bgColor: record.background_color
			? `oklch(${record.background_color.l} ${record.background_color.c} ${record.background_color.h})`
			: null,
		variants: record.variants ?? [],
	};
}

/**
 * Build a delightstack GalleryItem from an entry. `src` is a responsive srcset
 * string built from the image variants so the Carousel can load an
 * appropriately-sized version; thumbnails use the largest as a fallback.
 */
export function entryToGalleryItem(entry: GalleryImageEntry): GalleryItem {
	const cdnBase = `/cdn/image/${entry.path}`;
	const srcset = (entry.variants ?? [])
		.slice()
		.sort((a, b) => a.width - b.width)
		.map((v) => `${cdnBase}/${v.name} ${v.width}w`)
		.join(', ');
	return {
		type: 'image',
		src: srcset || `${cdnBase}/default`,
		width: entry.width || undefined,
		height: entry.height || undefined,
		alt: entry.alt ?? undefined,
		caption: entry.caption ?? undefined,
		thumbhash: entry.thumbhash ?? undefined,
	};
}

export const BlogGallery = Node.create<BlogGalleryOptions>({
	name: 'blogGallery',
	group: 'block',
	atom: true,
	// Draggable so the whole block can be reordered like any other section. The
	// node view's stopEvent gives the gallery exclusive ownership of drag events
	// while in reorder mode (so dragging a thumbnail reorders images, not the
	// block); outside reorder mode it lets ProseMirror handle the section drag.
	draggable: true,
	selectable: true,

	addOptions() {
		return { openImagePicker: undefined };
	},

	addAttributes() {
		return {
			items: {
				default: DEFAULTS.items,
				parseHTML: (el) => el.dataset.items || '[]',
				renderHTML: (attrs) => ({ 'data-items': attrs.items }),
			},
			display: {
				default: DEFAULTS.display,
				parseHTML: (el) => (el.dataset.display as GalleryDisplay) || DEFAULTS.display,
				renderHTML: (attrs) => ({ 'data-display': attrs.display }),
			},
			size: {
				default: DEFAULTS.size,
				parseHTML: (el) => (el.dataset.size as GalleryScale) || DEFAULTS.size,
				renderHTML: (attrs) => ({ 'data-size': attrs.size }),
			},
			spacing: {
				default: DEFAULTS.spacing,
				parseHTML: (el) => (el.dataset.spacing as GalleryScale) || DEFAULTS.spacing,
				renderHTML: (attrs) => ({ 'data-spacing': attrs.spacing }),
			},
			radius: {
				default: DEFAULTS.radius,
				parseHTML: (el) => (el.dataset.radius as GalleryScale) || DEFAULTS.radius,
				renderHTML: (attrs) => ({ 'data-radius': attrs.radius }),
			},
			fit: {
				default: DEFAULTS.fit,
				parseHTML: (el) => (el.dataset.fit as GalleryFit) || DEFAULTS.fit,
				renderHTML: (attrs) => ({ 'data-fit': attrs.fit }),
			},
			widthMode: {
				default: DEFAULTS.widthMode,
				parseHTML: (el) => (el.dataset.widthMode as WidthMode) || DEFAULTS.widthMode,
				renderHTML: (attrs) => ({ 'data-width-mode': attrs.widthMode }),
			},
		};
	},

	parseHTML() {
		return [{ tag: 'div.blog-gallery' }];
	},

	renderHTML({ HTMLAttributes }) {
		return ['div', mergeAttributes(HTMLAttributes, { class: 'blog-gallery' })];
	},

	addCommands() {
		return {
			setBlogGallery:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: { ...DEFAULTS, ...attrs },
					}),
		};
	},

	addNodeView() {
		return createBlogGalleryNodeView(this.options);
	},
});
