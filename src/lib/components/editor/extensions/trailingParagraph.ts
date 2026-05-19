/**
 * Ensures the document always ends with an empty paragraph. Without this,
 * if the last block is an atomic node like a blogImage (or a heading the
 * user just inserted), there is no text position after it to receive a
 * click — the cursor has nowhere to land and inserting new content at the
 * very end becomes awkward.
 *
 * The trailing paragraph is enforced both on initial mount and after every
 * transaction. If the user types into it, the appended check no-ops on the
 * next pass because the last child is now a paragraph (possibly non-empty).
 */
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const TrailingParagraph = Extension.create({
	name: 'trailingParagraph',

	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey('trailingParagraph'),
				appendTransaction: (_transactions, _oldState, newState) => {
					const { doc, schema } = newState;
					const paragraph = schema.nodes.paragraph;
					if (!paragraph) return null;
					const last = doc.lastChild;
					if (last && last.type.name === 'paragraph') return null;
					return newState.tr.insert(doc.content.size, paragraph.create());
				},
			}),
		];
	},

	onCreate() {
		const { editor } = this;
		const last = editor.state.doc.lastChild;
		if (last && last.type.name === 'paragraph') return;
		const paragraph = editor.schema.nodes.paragraph;
		if (!paragraph) return;
		const pos = editor.state.doc.content.size;
		const tr = editor.state.tr.insert(pos, paragraph.create());
		tr.setMeta('addToHistory', false);
		editor.view.dispatch(tr);
	},
});
