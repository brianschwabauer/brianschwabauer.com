/**
 * TipTap extension that intercepts image-file drops and paste events,
 * uploads the file via /api/images, and inserts a BlogImage node at the
 * drop position once processing completes.
 */
import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { uploadImage, type ImageRecord } from '$lib/client/images';

interface ImageDropOptions {
	/** Called when an upload starts (filename) — for showing a global toast/status */
	onUploadStart?: (file: File) => void;
	/** Called when an upload finishes successfully */
	onUploadSuccess?: (record: ImageRecord) => void;
	/** Called when an upload fails */
	onUploadError?: (err: Error, file: File) => void;
}

export const imageDropHandler = Extension.create<ImageDropOptions>({
	name: 'imageDropHandler',

	addOptions() {
		return {};
	},

	addProseMirrorPlugins() {
		const ext = this;
		return [
			new Plugin({
				key: new PluginKey('imageDropHandler'),
				props: {
					handleDrop(view, event) {
						const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
							f.type.startsWith('image/'),
						);
						if (files.length === 0) return false;
						event.preventDefault();
						const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
						const pos = coords?.pos ?? view.state.selection.from;
						void handleFiles(ext.editor, files, pos, ext.options);
						return true;
					},
					handlePaste(view, event) {
						const items = Array.from(event.clipboardData?.items ?? []);
						const files = items
							.filter((it) => it.kind === 'file' && it.type.startsWith('image/'))
							.map((it) => it.getAsFile())
							.filter((f): f is File => Boolean(f));
						if (files.length === 0) return false;
						event.preventDefault();
						void handleFiles(ext.editor, files, view.state.selection.from, ext.options);
						return true;
					},
				},
			}),
		];
	},
});

async function handleFiles(editor: Editor, files: File[], pos: number, opts: ImageDropOptions) {
	for (const file of files) {
		opts.onUploadStart?.(file);
		try {
			const record = await uploadImage(file);
			opts.onUploadSuccess?.(record);
			editor
				.chain()
				.focus()
				.setTextSelection(pos)
				.setBlogImage(recordToBlogImageAttrs(record))
				.run();
		} catch (err) {
			opts.onUploadError?.(err instanceof Error ? err : new Error(String(err)), file);
		}
	}
}

export function recordToBlogImageAttrs(record: ImageRecord) {
	return {
		src: `/cdn/image/${record.path}/default`,
		path: record.path,
		alt: record.alt_text ?? null,
		width: record.width,
		height: record.height,
		thumbhash: record.thumbhash,
		bgColor: record.background_color
			? `oklch(${record.background_color.l} ${record.background_color.c} ${record.background_color.h})`
			: null,
		fileName: record.file_name,
		variants: JSON.stringify(record.variants),
		widthMode: 'normal' as const,
		widthPct: 100,
	};
}
