<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, textblockTypeInputRule, type JSONContent } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Heading from '@tiptap/extension-heading';
	import Link from '@tiptap/extension-link';
	import { BlogImage } from './extensions/BlogImage';
	import { imageDropHandler, recordToBlogImageAttrs } from './extensions/imageDropHandler';
	import MediaLibrary from '$lib/components/media/MediaLibrary.svelte';
	import EditorBubbleMenu from './EditorBubbleMenu.svelte';
	import EditorPlusMenu from './EditorPlusMenu.svelte';
	import EditorMobileBar from './EditorMobileBar.svelte';
	import type { ImageRecord } from '$lib/client/images';

	/**
	 * Heading shortcuts: `#` → H2, `##` → H3, … `#####` → H6.
	 * H1 is reserved for the post title (rendered as the page <h1>).
	 */
	const SHIFTED_HEADING_LEVELS = [2, 3, 4, 5, 6] as const;
	const ShiftedHeading = Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }).extend({
		addInputRules() {
			return SHIFTED_HEADING_LEVELS.map((level) => {
				const hashes = level - 1;
				return textblockTypeInputRule({
					find: new RegExp(`^(#{${hashes}})\\s$`),
					type: this.type,
					getAttributes: { level },
				});
			});
		},
	});

	interface Props {
		content?: JSONContent | null;
		placeholder?: string;
		onUpdate?: (json: JSONContent, text: string) => void;
		onAiAction?: (selectedText: string) => void;
	}

	let {
		content = null,
		placeholder = 'Tell your story…',
		onUpdate,
		onAiAction,
	}: Props = $props();

	let editorElement: HTMLElement;
	let editor: Editor | null = $state(null);
	let libraryOpen = $state(false);
	let isDocEmpty = $state(true);

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({ heading: false }),
				ShiftedHeading,
				Link.configure({ openOnClick: false }),
				BlogImage,
				imageDropHandler.configure({
					onUploadError: (err, file) => {
						console.error(`Failed to upload ${file.name}:`, err);
						alert(`Failed to upload ${file.name}: ${err.message}`);
					},
				}),
			],
			content: content ?? '',
			editorProps: {
				attributes: { class: 'prose body-pm' },
			},
			onUpdate: ({ editor }) => {
				const stripped = stripUploadingPlaceholders(editor.getJSON());
				onUpdate?.(stripped, editor.getText());
				updateEmptyState(editor);
			},
			onCreate: ({ editor }) => updateEmptyState(editor),
		});
	});

	function updateEmptyState(ed: Editor) {
		const doc = ed.state.doc;
		// Empty == doc has one paragraph with no content.
		let empty = false;
		if (doc.childCount === 1) {
			const only = doc.firstChild;
			if (only && only.type.name === 'paragraph' && only.content.size === 0) {
				empty = true;
			}
		}
		isDocEmpty = empty;
	}

	function stripUploadingPlaceholders(doc: JSONContent): JSONContent {
		function walk(node: JSONContent): JSONContent | null {
			if (node.type === 'blogImage' && node.attrs?.uploading) return null;
			if (!node.content) return node;
			const next: JSONContent[] = [];
			for (const child of node.content) {
				const kept = walk(child);
				if (kept) next.push(kept);
			}
			return { ...node, content: next };
		}
		return walk(doc) ?? { type: 'doc', content: [] };
	}

	onDestroy(() => editor?.destroy());

	function openMediaLibrary() {
		libraryOpen = true;
	}

	function insertFromLibrary(image: ImageRecord) {
		editor?.chain().focus().setBlogImage(recordToBlogImageAttrs(image)).run();
	}

	export function getJSON(): JSONContent {
		const raw = editor?.getJSON() ?? { type: 'doc', content: [] };
		return stripUploadingPlaceholders(raw);
	}

	export function getText(): string {
		return editor?.getText() ?? '';
	}

	export function setContent(next: JSONContent | string) {
		editor?.commands.setContent(next);
	}

	export function focus() {
		editor?.commands.focus('end');
	}
</script>

<div class="body-editor">
	<div class="body-host" class:is-empty={isDocEmpty} data-placeholder={placeholder}>
		<div bind:this={editorElement}></div>
	</div>
</div>

<EditorBubbleMenu {editor} {onAiAction} />
<EditorPlusMenu {editor} onPickImage={openMediaLibrary} />
<EditorMobileBar {editor} onPickImage={openMediaLibrary} />

<MediaLibrary bind:open={libraryOpen} onSelect={insertFromLibrary} title="Insert Image" />

<style>
	.body-editor {
		position: relative;
		/* Match the public post wrapper width so wide/full images can break out. */
	}

	.body-host {
		position: relative;
		min-height: 200px;
	}

	/* Layout/typography on the editable surface — kept separate from the
	   focus reset below so focus-state specificity can't override sizing. */
	.body-host :global(.body-pm),
	.body-host :global(.ProseMirror) {
		min-height: 280px;
		background: transparent;
	}

	.body-host :global(.body-pm),
	.body-host :global(.body-pm:focus),
	.body-host :global(.body-pm:focus-visible),
	.body-host :global(.ProseMirror),
	.body-host :global(.ProseMirror:focus),
	.body-host :global(.ProseMirror:focus-visible) {
		outline: none;
		box-shadow: none;
		border: none;
	}

	/* Placeholder for the entire empty doc. */
	.body-host.is-empty::before {
		content: attr(data-placeholder);
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		max-width: var(--measure);
		padding: 0;
		color: var(--color-text-muted);
		font-size: var(--prose-text-size);
		line-height: var(--prose-leading);
		pointer-events: none;
	}

	@media (min-width: 768px) {
		.body-host.is-empty::before {
			font-size: 1.1875rem;
		}
	}

	/* Add bottom padding so the mobile bottom bar doesn't cover the last line. */
	@media (max-width: 767px) {
		.body-editor {
			padding-bottom: 64px;
		}
	}

	/* ── BlogImage in-editor styling (mirrors the public post) ─────────── */
	.body-host :global(figure.blog-img) {
		position: relative;
		margin: var(--space-8) auto;
		display: block;
	}

	.body-host :global(figure.blog-img[data-width-mode='normal']) {
		width: var(--blog-img-pct, 100%);
		max-width: var(--measure);
		margin-left: auto;
		margin-right: auto;
	}

	.body-host :global(figure.blog-img[data-width-mode='wide']) {
		width: var(--prose-wide);
		max-width: calc(100vw - 2rem);
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.body-host :global(figure.blog-img[data-width-mode='full']) {
		width: 100vw;
		max-width: 100vw;
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.body-host :global(figure.blog-img .blog-img-inner) {
		position: relative;
		background: var(--blog-img-bg, var(--color-bg-secondary));
		border-radius: var(--radius-sm);
		overflow: hidden;
		aspect-ratio: var(--blog-img-aspect, auto);
	}

	.body-host :global(figure.blog-img img) {
		display: block;
		width: 100%;
		height: auto;
	}

	/* Caption overlay — only visible when the figure carries a caption. The
	   .blog-img-inner wrapper already has overflow:hidden + border-radius so
	   the gradient clips to the image. */
	.body-host :global(figure.blog-img .blog-img-caption) {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--space-6) var(--space-4) var(--space-3);
		color: white;
		font-size: 0.875rem;
		line-height: 1.4;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		background: linear-gradient(to top, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0));
		pointer-events: none;
		display: none;
	}

	.body-host :global(figure.blog-img.has-caption .blog-img-caption) {
		display: block;
	}

	.body-host :global(figure.blog-img.is-uploading img) {
		filter: brightness(0.85);
	}

	.body-host :global(figure.blog-img .blog-img-spinner) {
		position: absolute;
		inset: 0;
		display: none;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		background: rgba(0, 0, 0, 0.18);
		color: white;
		font-size: var(--text-sm);
		font-weight: 500;
		pointer-events: none;
		z-index: 3;
	}

	.body-host :global(figure.blog-img.is-uploading .blog-img-spinner) {
		display: flex;
	}

	.body-host :global(figure.blog-img .blog-img-spinner-ring) {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: blog-img-spin 800ms linear infinite;
	}

	.body-host :global(figure.blog-img .blog-img-spinner-label) {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	@keyframes blog-img-spin {
		to { transform: rotate(360deg); }
	}

	.body-host :global(figure.blog-img .blog-img-handle) {
		position: absolute;
		top: 50%;
		width: 14px;
		height: 60px;
		transform: translateY(-50%);
		background: rgba(0, 0, 0, 0.5);
		border-radius: var(--radius-sm);
		cursor: ew-resize;
		opacity: 0;
		transition: opacity 150ms ease;
		display: flex;
		align-items: center;
		justify-content: center;
		touch-action: none;
	}

	.body-host :global(figure.blog-img .blog-img-handle::before) {
		content: '';
		width: 2px;
		height: 24px;
		background: white;
		border-radius: 1px;
	}

	.body-host :global(figure.blog-img .blog-img-handle-left) { left: 6px; }
	.body-host :global(figure.blog-img .blog-img-handle-right) { right: 6px; }

	.body-host :global(figure.blog-img:hover .blog-img-handle),
	.body-host :global(figure.blog-img.is-selected .blog-img-handle) {
		opacity: 1;
	}

	.body-host :global(figure.blog-img .blog-img-toolbar) {
		position: absolute;
		top: -40px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
		font-size: var(--text-xs);
		white-space: nowrap;
	}

	.body-host :global(figure.blog-img.is-selected .blog-img-toolbar) {
		opacity: 1;
		pointer-events: auto;
	}

	.body-host :global(figure.blog-img .blog-img-toolbar button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 26px;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
	}

	.body-host :global(figure.blog-img .blog-img-toolbar button svg) {
		width: 18px;
		height: 18px;
	}

	.body-host :global(figure.blog-img .blog-img-toolbar button:hover) {
		background: var(--color-bg-secondary);
	}

	.body-host :global(figure.blog-img .blog-img-toolbar button.is-active) {
		background: var(--color-accent);
		color: white;
	}

	.body-host :global(figure.blog-img .blog-img-sep) {
		width: 1px;
		height: 16px;
		background: var(--color-border);
		margin: 0 2px;
	}

	.body-host :global(figure.blog-img.is-selected) {
		outline: 2px solid var(--color-accent);
		outline-offset: 4px;
		border-radius: 4px;
	}
</style>
