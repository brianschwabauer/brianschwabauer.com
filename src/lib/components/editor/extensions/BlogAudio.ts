/**
 * Custom TipTap node for embedded audio clips served from the media/ R2 prefix
 * (e.g. the legacy "Split Life" SATO-48 voice-planning tracks and soundtrack).
 *
 * Attributes:
 *   src      full URL of the audio file (cdn.brianschwabauer.com/media/…)
 *   title    optional label shown above the player
 *   caption  optional caption shown beneath the player
 *
 * Native <audio controls> needs no hydration, so renderDoc emits the real
 * player markup directly and the editor renders the same atom from renderHTML.
 */
import { Node, mergeAttributes } from '@tiptap/core';

export interface BlogAudioAttrs {
	src: string;
	title: string | null;
	caption: string | null;
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		blogAudio: {
			/** Insert a BlogAudio node for the given audio file URL. */
			setBlogAudio: (attrs: Partial<BlogAudioAttrs> & { src: string }) => ReturnType;
		};
	}
}

export const BlogAudio = Node.create({
	name: 'blogAudio',
	group: 'block',
	atom: true,
	draggable: true,
	selectable: true,

	addAttributes() {
		return {
			src: { default: '' },
			title: { default: null },
			caption: { default: null },
		};
	},

	parseHTML() {
		return [
			{
				tag: 'figure.blog-audio',
				getAttrs: (el) => {
					if (!(el instanceof HTMLElement)) return false;
					const audio = el.querySelector('audio');
					return {
						src: audio?.getAttribute('src') || '',
						title: el.dataset.audioTitle || null,
						caption: el.querySelector('figcaption')?.textContent?.trim() || null,
					};
				},
			},
		];
	},

	renderHTML({ HTMLAttributes, node }) {
		const attrs = node.attrs as BlogAudioAttrs;
		const children: unknown[] = [];
		if (attrs.title) children.push(['span', { class: 'blog-audio-title' }, attrs.title]);
		children.push(['audio', { controls: 'controls', preload: 'metadata', src: attrs.src }]);
		if (attrs.caption) children.push(['figcaption', {}, attrs.caption]);
		return [
			'figure',
			mergeAttributes(HTMLAttributes, {
				class: 'blog-audio',
				'data-audio-title': attrs.title ?? '',
			}),
			...children,
		];
	},

	addCommands() {
		return {
			setBlogAudio:
				(attrs) =>
				({ commands }) =>
					commands.insertContent({
						type: this.name,
						attrs: { title: null, caption: null, ...attrs },
					}),
		};
	},
});
