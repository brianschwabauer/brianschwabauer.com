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
	galleryEntryToRecord,
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
	// `.selected` propagates into the component via $state deep reactivity.
	#view = $state<{ attrs: BlogGalleryAttrs; selected: boolean }>({
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
				onEditImages: () => this.#editImages(options),
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

	#editImages(options: BlogGalleryOptions) {
		// Hand the modal the gallery's current items (as records) and replace the
		// whole list with whatever it returns — add / remove / reorder all happen
		// in the modal, so the result is the final ordered selection.
		const current = parseGalleryItems(this.#view.attrs.items).map(galleryEntryToRecord);
		options.openImagePicker?.(current, (records: ImageRecord[]) => {
			this.#updateAttrs({ items: JSON.stringify(records.map(recordToGalleryEntry)) });
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
		this.dom.classList.remove('is-selected');
	}

	stopEvent(event: Event) {
		const isDrag = event.type.startsWith('drag') || event.type === 'drop';
		// Let ProseMirror handle drag/drop so the whole block can be reordered like
		// any other section (reordering individual images now lives in the modal).
		// Everything else (clicks, pointer, keys) is handled by our Svelte UI.
		return isDrag ? false : true;
	}

	ignoreMutation() {
		return true;
	}

	destroy() {
		void unmount(this.#app);
	}
}
