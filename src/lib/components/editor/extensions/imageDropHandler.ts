/**
 * TipTap extension that intercepts image-file drops and paste events.
 *
 * Inserts an optimistic placeholder BlogImage node immediately (with a blob
 * URL + dimensions read from the file) so the user sees their image right
 * away. The actual upload runs in the background; when it completes the
 * placeholder is found by `uploadId` and swapped for the real CDN-backed
 * node attrs. On failure the placeholder is removed.
 */
import { Extension, type Editor } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { uploadImage, type ImageRecord } from '$lib/client/images';

interface ImageDropOptions {
	/** Called when an upload starts. Useful for global toasts / save-button gating. */
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

async function handleFiles(
	editor: Editor,
	files: File[],
	pos: number,
	opts: ImageDropOptions,
) {
	// Insert placeholders sequentially so multi-drops land in source order.
	for (const file of files) {
		const uploadId = generateUploadId();
		const blobUrl = URL.createObjectURL(file);
		const dims = await readImageDimensions(blobUrl).catch(() => ({
			width: 0,
			height: 0,
		}));

		// Insert the placeholder right away — drag-drop is supposed to feel
		// instant, even if the container takes 5–15s to spin up on first use.
		editor
			.chain()
			.focus()
			.setTextSelection(pos)
			.setBlogImage({
				src: blobUrl,
				path: '',
				width: dims.width,
				height: dims.height,
				fileName: file.name,
				uploading: true,
				uploadId,
			})
			.run();

		opts.onUploadStart?.(file);

		// Upload in the background. We intentionally do NOT await before
		// inserting the next placeholder, so simultaneous drops feel snappy.
		void (async () => {
			try {
				const record = await uploadImage(file);
				opts.onUploadSuccess?.(record);
				replaceUploadingNode(editor, uploadId, recordToBlogImageAttrs(record));
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				opts.onUploadError?.(error, file);
				removeUploadingNode(editor, uploadId);
			} finally {
				// Browser may still be painting the new src; release blob memory next tick.
				setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
			}
		})();
	}
}

/** Find a placeholder BlogImage by uploadId and replace its attrs in one tx. */
function replaceUploadingNode(
	editor: Editor,
	uploadId: string,
	newAttrs: ReturnType<typeof recordToBlogImageAttrs>,
) {
	const { state } = editor;
	let foundPos: number | null = null;
	let foundNode: ReturnType<typeof state.doc.nodeAt> = null;
	state.doc.descendants((node, p) => {
		if (foundPos !== null) return false;
		if (node.type.name === 'blogImage' && node.attrs.uploadId === uploadId) {
			foundPos = p;
			foundNode = node;
			return false;
		}
		return true;
	});
	if (foundPos === null || !foundNode) return; // user deleted the placeholder
	// Preserve user-tweaked widthMode/widthPct if they resized during upload.
	editor
		.chain()
		.command(({ tr }) => {
			tr.setNodeMarkup(foundPos!, undefined, {
				...foundNode!.attrs,
				...newAttrs,
				uploading: false,
				uploadId: null,
			});
			return true;
		})
		.run();
}

function removeUploadingNode(editor: Editor, uploadId: string) {
	const { state } = editor;
	let foundPos: number | null = null;
	let foundSize = 0;
	state.doc.descendants((node, p) => {
		if (foundPos !== null) return false;
		if (node.type.name === 'blogImage' && node.attrs.uploadId === uploadId) {
			foundPos = p;
			foundSize = node.nodeSize;
			return false;
		}
		return true;
	});
	if (foundPos === null) return;
	editor
		.chain()
		.command(({ tr }) => {
			tr.delete(foundPos!, foundPos! + foundSize);
			return true;
		})
		.run();
}

function readImageDimensions(url: string): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const probe = new Image();
		probe.onload = () =>
			resolve({ width: probe.naturalWidth, height: probe.naturalHeight });
		probe.onerror = () => reject(new Error('Could not read image dimensions'));
		probe.src = url;
	});
}

function generateUploadId(): string {
	// Short, collision-resistant enough for in-flight uploads in a single doc.
	return `up_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function recordToBlogImageAttrs(record: ImageRecord) {
	return {
		src: `/cdn/image/${record.path}/default`,
		path: record.path,
		alt: record.alt_text ?? null,
		// Snapshot the caption onto the node so it travels with this post.
		// Later edits to the image's caption in the Media Library don't
		// retroactively change posts that already embed it.
		caption: record.caption ?? null,
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
