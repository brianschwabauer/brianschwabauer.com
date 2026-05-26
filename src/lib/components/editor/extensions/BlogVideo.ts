/**
 * Custom TipTap node for embedded HLS videos hosted in the media/ R2 prefix.
 *
 * Attributes:
 *   videoSlug   media slug, e.g. "2015-04-22_legacy" — the HLS stream lives at
 *               cdn.brianschwabauer.com/media/{slug}/master.m3u8
 *   title       optional title shown on the player's poster overlay
 *   caption     optional caption shown beneath the video
 *   widthMode   'normal' | 'wide' | 'full' — mirrors BlogImage's breakout modes
 *
 * The TipTap JSON is the source of truth. The public post page (renderDoc)
 * emits a `<figure class="blog-video">` placeholder that blog/[slug]/+page.svelte
 * hydrates into a video.js player; the editor shows the static poster preview
 * straight from renderHTML below (no node view needed — the node is an atom).
 */
import { Node, mergeAttributes } from '@tiptap/core';
import { createBlogVideoNodeView } from './BlogVideoNodeView';

const MEDIA_BASE = 'https://cdn.brianschwabauer.com/media';

/** Public poster URL for a media slug. */
export const videoPosterURL = (slug: string): string =>
	`${MEDIA_BASE}/${slug}/poster.jpg`;

export type VideoWidthMode = 'normal' | 'wide' | 'full';

export interface BlogVideoAttrs {
	videoSlug: string;
	title: string | null;
	caption: string | null;
	widthMode: VideoWidthMode;
	/** 30–100 — percentage of the text column, only meaningful in 'normal' mode. */
	widthPct: number;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blogVideo: {
			/** Insert a BlogVideo node for the given media slug. */
			setBlogVideo: (
				attrs: Partial<BlogVideoAttrs> & { videoSlug: string },
			) => ReturnType;
		};
	}
}

export const BlogVideo = Node.create({
	name: 'blogVideo',
	group: 'block',
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			videoSlug: { default: '' },
			title: { default: null },
			caption: { default: null },
			widthMode: {
				default: 'wide',
				parseHTML: (el) => (el.dataset.widthMode as VideoWidthMode) || 'wide',
				renderHTML: (attrs) => ({ 'data-width-mode': attrs.widthMode }),
			},
			widthPct: {
				default: 100,
				parseHTML: (el) => Number(el.dataset.widthPct) || 100,
				renderHTML: (attrs) => ({ 'data-width-pct': String(attrs.widthPct ?? 100) }),
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: 'figure.blog-video',
				getAttrs: (el) => {
					if (!(el instanceof HTMLElement)) return false;
					return {
						videoSlug: el.dataset.videoSlug || '',
						title: el.dataset.videoTitle || null,
						caption: el.querySelector('figcaption')?.textContent?.trim() || null,
						widthMode: (el.dataset.widthMode as VideoWidthMode) || 'wide',
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const attrs = node.attrs as BlogVideoAttrs;
		const children: unknown[] = [
			[
				'div',
				{ class: 'blog-video-mount' },
				[
					'img',
					{
						class: 'blog-video-poster',
						src: videoPosterURL(attrs.videoSlug),
						alt: attrs.title ?? '',
					},
				],
				['span', { class: 'blog-video-play', 'aria-hidden': 'true' }],
			],
		];
		if (attrs.caption) children.push(['figcaption', {}, attrs.caption]);
		return [
			'figure',
			mergeAttributes(HTMLAttributes, {
				class: 'blog-video',
				'data-video-slug': attrs.videoSlug,
				'data-video-title': attrs.title ?? '',
			}),
			...children,
		];
	},

	addCommands() {
		return {
			setBlogVideo:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: {
							title: null,
							caption: null,
							widthMode: 'wide',
							widthPct: 100,
							...attrs,
						},
					}),
		};
	},

	addNodeView() {
		return createBlogVideoNodeView();
	},
});
