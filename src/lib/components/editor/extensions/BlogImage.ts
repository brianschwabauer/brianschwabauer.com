/**
 * Custom TipTap node for blog images with width-mode breakout + resize handles.
 *
 * Attributes:
 *   src            CDN URL of the default variant
 *   path           R2 key prefix (e.g. "blog/2026/sunset"), used to rebuild variant URLs
 *   alt            alt text
 *   width          intrinsic pixel width
 *   height         intrinsic pixel height
 *   thumbhash      ~33-char base64 ThumbHash for placeholder
 *   bgColor        CSS oklch() string for background placeholder
 *   fileName       original filename
 *   widthMode      'normal' | 'wide' | 'full'
 *   widthPct       30-100 (percentage of text column, only meaningful in 'normal')
 *   cropAspect     displayed width/height ratio when the bottom handle has
 *                  shortened the figure (null = use the image's natural ratio).
 *                  Always >= natural aspect ratio — the bottom handle can only
 *                  shorten, never grow taller than native.
 *   focalX/focalY  0-100 % focal point inside a cropped frame (only meaningful
 *                  when cropAspect is set); drives object-position.
 *   variants       JSON-encoded array of {name,width,height,mime_type} for srcset
 *
 * The editor uses createBlogImageNodeView() for inline display + resize.
 * Storage HTML uses renderHTML below; the public page uses the JSON via
 * src/lib/server/renderDoc.ts to produce the final optimized markup.
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { createBlogImageNodeView } from './BlogImageNodeView';

export type WidthMode = 'normal' | 'wide' | 'full';

export interface BlogImageAttrs {
	src: string;
	path: string;
	alt: string | null;
	/**
	 * Caption shown over the bottom of the image on the public post. Stored on
	 * the node (not just R2) so each post can carry its own caption — the value
	 * is snapshotted from R2 at insertion time and editing it here doesn't
	 * affect other posts that use the same image.
	 */
	caption: string | null;
	width: number;
	height: number;
	thumbhash: string | null;
	bgColor: string | null;
	fileName: string | null;
	widthMode: WidthMode;
	widthPct: number;
	cropAspect: number | null;
	focalX: number;
	focalY: number;
	variants: string;
	/**
	 * Transient flag for the optimistic upload placeholder. Only ever true
	 * while a drop/paste upload is in flight. Stripped from saved JSON by
	 * TipTapEditor.svelte so storage never carries blob URLs.
	 */
	uploading: boolean;
	/**
	 * Transient correlation ID. Set on placeholder insertion so the drop
	 * handler can find the right node to replace once the upload resolves.
	 * Also stripped from saved JSON.
	 */
	uploadId: string | null;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blogImage: {
			/** Insert a BlogImage node from a record returned by the upload/media API. */
			setBlogImage: (attrs: Partial<BlogImageAttrs> & { src: string; path: string }) => ReturnType;
		};
	}
}

export const BlogImage = Node.create({
	name: 'blogImage',
	group: 'block',
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			src: { default: '' },
			path: { default: '' },
			alt: { default: null },
			caption: {
				default: null,
				parseHTML: (el) => {
					const fig = el.querySelector('figcaption');
					return fig?.textContent?.trim() || el.dataset.caption || null;
				},
				renderHTML: (attrs) => (attrs.caption ? { 'data-caption': attrs.caption } : {}),
			},
			width: {
				default: 0,
				parseHTML: (el) => Number(el.getAttribute('width')) || Number(el.dataset.width) || 0,
			},
			height: {
				default: 0,
				parseHTML: (el) => Number(el.getAttribute('height')) || Number(el.dataset.height) || 0,
			},
			thumbhash: {
				default: null,
				parseHTML: (el) => el.dataset.thumbhash || null,
				renderHTML: (attrs) => (attrs.thumbhash ? { 'data-thumbhash': attrs.thumbhash } : {}),
			},
			bgColor: {
				default: null,
				parseHTML: (el) => el.dataset.bg || null,
				renderHTML: (attrs) => (attrs.bgColor ? { 'data-bg': attrs.bgColor } : {}),
			},
			fileName: {
				default: null,
				parseHTML: (el) => el.dataset.fileName || null,
				renderHTML: (attrs) => (attrs.fileName ? { 'data-file-name': attrs.fileName } : {}),
			},
			widthMode: {
				default: 'normal',
				parseHTML: (el) => (el.dataset.widthMode as WidthMode) || 'normal',
				renderHTML: (attrs) => ({ 'data-width-mode': attrs.widthMode }),
			},
			widthPct: {
				default: 100,
				parseHTML: (el) => Number(el.dataset.widthPct) || 100,
				renderHTML: (attrs) => ({ 'data-width-pct': String(attrs.widthPct) }),
			},
			cropAspect: {
				default: null,
				parseHTML: (el) => {
					const v = Number(el.dataset.cropAspect);
					return Number.isFinite(v) && v > 0 ? v : null;
				},
				renderHTML: (attrs) =>
					attrs.cropAspect ? { 'data-crop-aspect': String(attrs.cropAspect) } : {},
			},
			focalX: {
				default: 50,
				parseHTML: (el) => {
					const v = Number(el.dataset.focalX);
					return Number.isFinite(v) ? v : 50;
				},
				renderHTML: (attrs) =>
					attrs.cropAspect ? { 'data-focal-x': String(attrs.focalX) } : {},
			},
			focalY: {
				default: 50,
				parseHTML: (el) => {
					const v = Number(el.dataset.focalY);
					return Number.isFinite(v) ? v : 50;
				},
				renderHTML: (attrs) =>
					attrs.cropAspect ? { 'data-focal-y': String(attrs.focalY) } : {},
			},
			variants: {
				default: '[]',
				parseHTML: (el) => el.dataset.variants || '[]',
				renderHTML: (attrs) => (attrs.variants ? { 'data-variants': attrs.variants } : {}),
			},
			// Transient placeholder state — never parsed from or rendered to HTML
			uploading: {
				default: false,
				parseHTML: () => false,
				renderHTML: () => ({}),
			},
			uploadId: {
				default: null,
				parseHTML: () => null,
				renderHTML: () => ({}),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'figure.blog-img',
				getAttrs: (el) => {
					if (!(el instanceof HTMLElement)) return false;
					const img = el.querySelector('img');
					if (!img) return false;
					return {
						src: img.getAttribute('src') || '',
						path: el.dataset.path || '',
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const attrs = node.attrs as BlogImageAttrs;
		const children: unknown[] = [
			[
				'img',
				{
					src: attrs.src,
					alt: attrs.alt ?? '',
					width: attrs.width || null,
					height: attrs.height || null,
				},
			],
		];
		if (attrs.caption) {
			children.push(['figcaption', {}, attrs.caption]);
		}
		return [
			'figure',
			mergeAttributes(HTMLAttributes, {
				class: 'blog-img',
				'data-path': attrs.path,
			}),
			...children,
		];
	},

	addCommands() {
		return {
			setBlogImage:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: {
							widthMode: 'normal',
							widthPct: 100,
							alt: null,
							caption: null,
							thumbhash: null,
							bgColor: null,
							fileName: null,
							cropAspect: null,
							focalX: 50,
							focalY: 50,
							variants: '[]',
							width: 0,
							height: 0,
							uploading: false,
							uploadId: null,
							...attrs,
						},
					}),
		};
	},

	addNodeView() {
		return createBlogImageNodeView();
	},
});
