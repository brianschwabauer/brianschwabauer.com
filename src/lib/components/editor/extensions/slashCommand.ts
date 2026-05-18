/**
 * Thin TipTap extension that hands key events to a callback so the
 * Svelte-side EditorSlashMenu can intercept ArrowUp/Down/Enter/Tab/Escape
 * before ProseMirror processes them. The Svelte component owns all of the
 * menu state and command execution — this extension only opens a keyhole.
 */
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface SlashCommandOptions {
	onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
	name: 'slashCommand',

	addOptions() {
		return { onKeyDown: () => false };
	},

	addProseMirrorPlugins() {
		const ext = this;
		return [
			new Plugin({
				key: new PluginKey('slashCommand'),
				props: {
					handleKeyDown(_view, event) {
						return ext.options.onKeyDown(event);
					},
				},
			}),
		];
	},
});
