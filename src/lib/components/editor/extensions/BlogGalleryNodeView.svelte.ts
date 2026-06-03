/**
 * ProseMirror NodeView for the BlogGallery node.
 *
 * Rather than build the rich editing UI imperatively, this mounts the
 * BlogGalleryEditor.svelte component into the node's DOM (the same mount/unmount
 * approach the public post page uses to hydrate videos). A small `$state` bridge
 * keeps the Svelte component in sync as the node's attributes change.
 */
import { mount, unmount } from 'svelte';
import { NodeSelection } from '@tiptap/pm/state';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/core';
import type { ImageRecord } from '$lib/types/images';
import BlogGalleryEditor from '../BlogGalleryEditor.svelte';
import {
	parseGalleryItems,
	recordToGalleryEntry,
	type BlogGalleryAttrs,
	type BlogGalleryOptions,
} from './BlogGallery';

interface NodeViewProps {
	editor: Editor;
	node: ProseMirrorNode;
	getPos: () => number | undefined;
}

export function createBlogGalleryNodeView(options: BlogGalleryOptions) {
	return (props: NodeViewProps) => new BlogGalleryNodeView(props, options);
}

class BlogGalleryNodeView {
	dom: HTMLElement;
	#editor: Editor;
	#getPos: () => number | undefined;
	#app: Record<string, unknown>;
	// Reactive bridge handed to the Svelte component. Mutating `.attrs` /
	// `.selected` / `.editing` propagates into the component via $state deep
	// reactivity. `editing` also gates stopEvent's drag ownership.
	#view = $state<{ attrs: BlogGalleryAttrs; selected: boolean; editing: boolean }>({
		attrs: {
			items: '[]',
			display: 'masonry',
			size: '2',
			spacing: '1',
			radius: '1',
			fit: 'contain',
			widthMode: 'wide',
		},
		selected: false,
		editing: false,
	});

	constructor(props: NodeViewProps, options: BlogGalleryOptions) {
		this.#editor = props.editor;
		this.#getPos = props.getPos;
		this.#view.attrs = props.node.attrs as BlogGalleryAttrs;

		this.dom = document.createElement('div');
		this.dom.className = 'blog-gallery';
		this.dom.contentEditable = 'false';
		this.dom.setAttribute('data-width-mode', this.#view.attrs.widthMode);

		this.#app = mount(BlogGalleryEditor, {
			target: this.dom,
			props: {
				view: this.#view,
				onUpdateAttrs: (partial: Partial<BlogGalleryAttrs>) => this.#updateAttrs(partial),
				onAddImages: () => this.#addImages(options),
				onSelect: () => this.#select(),
				onDelete: () => this.#delete(),
			},
		});
	}

	#updateAttrs(partial: Partial<BlogGalleryAttrs>) {
		const pos = this.#getPos();
		if (pos == null) return;
		const { state, dispatch } = this.#editor.view;
		const node = state.doc.nodeAt(pos);
		if (!node) return;
		dispatch(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...partial }));
	}

	#addImages(options: BlogGalleryOptions) {
		options.openImagePicker?.((records: ImageRecord[]) => {
			if (!records.length) return;
			const existing = parseGalleryItems(this.#view.attrs.items);
			const next = [...existing, ...records.map(recordToGalleryEntry)];
			this.#updateAttrs({ items: JSON.stringify(next) });
		});
	}

	#select() {
		const pos = this.#getPos();
		if (pos == null) return;
		const { state, dispatch } = this.#editor.view;
		dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
		this.#editor.view.focus();
	}

	#delete() {
		const pos = this.#getPos();
		if (pos == null) return;
		const { state, dispatch } = this.#editor.view;
		const node = state.doc.nodeAt(pos);
		if (!node) return;
		dispatch(state.tr.delete(pos, pos + node.nodeSize));
		this.#editor.view.focus();
	}

	// ── ProseMirror NodeView interface ──────────────────────────────────────
	update(node: ProseMirrorNode) {
		if (node.type.name !== 'blogGallery') return false;
		this.#view.attrs = node.attrs as BlogGalleryAttrs;
		this.dom.setAttribute('data-width-mode', this.#view.attrs.widthMode);
		return true;
	}

	selectNode() {
		this.#view.selected = true;
		this.dom.classList.add('is-selected');
	}

	deselectNode() {
		this.#view.selected = false;
		this.#view.editing = false;
		this.dom.classList.remove('is-selected');
	}

	stopEvent(event: Event) {
		const isDrag = event.type.startsWith('drag') || event.type === 'drop';
		if (isDrag) {
			// In reorder mode the gallery owns drag/drop (thumbnail reordering) so
			// ProseMirror's drop cursor / node-drag stay out of the way. Outside
			// reorder mode, let ProseMirror handle the drag so the whole block can
			// be reordered like any other section.
			return this.#view.editing;
		}
		// Everything else (clicks, pointer, keys) is handled by our Svelte UI.
		return true;
	}

	ignoreMutation() {
		return true;
	}

	destroy() {
		void unmount(this.#app);
	}
}
