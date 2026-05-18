<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor, textblockTypeInputRule, type JSONContent } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Heading from '@tiptap/extension-heading';
	import Link from '@tiptap/extension-link';
	import { BlogImage } from './extensions/BlogImage';
	import { imageDropHandler, recordToBlogImageAttrs } from './extensions/imageDropHandler';
	import MediaLibrary from '$lib/components/media/MediaLibrary.svelte';
	import type { ImageRecord } from '$lib/client/images';

	/**
	 * Heading with shifted markdown shortcuts: `#` → H2, `##` → H3, … `#####` → H6.
	 *
	 * The post page already renders the post title as the document's <h1>, so
	 * reserving H1 for that keeps the heading outline clean for screen readers
	 * and SEO. Authors who type `#` get the largest in-content heading (H2).
	 *
	 * The schema still allows H1 so any pre-existing H1 content keeps round-
	 * tripping cleanly — the shift only governs the markdown input rules.
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
	}

	let { content = null, placeholder = 'Start writing...', onUpdate }: Props = $props();

	let editorElement: HTMLElement;
	let editor: Editor | null = $state(null);
	let libraryOpen = $state(false);

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				// StarterKit's other extensions already register input rules
				// for **bold**, *italic*, ~~strike~~, `code`, > blockquote,
				// - / * / + bullet lists, 1. ordered lists, ``` code blocks,
				// and --- horizontal rules. Heading is supplied separately
				// below so we can shift `#` markdown shortcuts down by one
				// level (reserving H1 for the post title).
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
				attributes: { class: 'prose' },
			},
			onUpdate: ({ editor }) => {
				// Strip in-flight upload placeholders (blob URLs + transient ids) so
				// callers / save flows never see them — they're purely UI state.
				onUpdate?.(stripUploadingPlaceholders(editor.getJSON()), editor.getText());
			},
		});
	});

	/** Remove blogImage nodes that are still uploading from the doc JSON. */
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

	function toggleBold() { editor?.chain().focus().toggleBold().run(); }
	function toggleItalic() { editor?.chain().focus().toggleItalic().run(); }
	function toggleStrike() { editor?.chain().focus().toggleStrike().run(); }
	function toggleCode() { editor?.chain().focus().toggleCode().run(); }
	function toggleHeading(level: 2 | 3 | 4) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}
	function toggleBulletList() { editor?.chain().focus().toggleBulletList().run(); }
	function toggleOrderedList() { editor?.chain().focus().toggleOrderedList().run(); }
	function toggleCodeBlock() { editor?.chain().focus().toggleCodeBlock().run(); }
	function toggleBlockquote() { editor?.chain().focus().toggleBlockquote().run(); }
	function undo() { editor?.chain().focus().undo().run(); }
	function redo() { editor?.chain().focus().redo().run(); }

	function setLink() {
		const url = prompt('Enter URL:');
		if (url) editor?.chain().focus().setLink({ href: url }).run();
	}

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
</script>

<div class="editor-wrapper">
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('bold')} onclick={toggleBold} title="Bold"><strong>B</strong></button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('italic')} onclick={toggleItalic} title="Italic"><em>I</em></button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('strike')} onclick={toggleStrike} title="Strikethrough"><s>S</s></button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('code')} onclick={toggleCode} title="Inline Code"><code>&lt;/&gt;</code></button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<!-- Display labels are the author-facing heading rank ("H1" = biggest
			     in-content heading). The actual node level is shifted by one
			     because the post title owns the document's real <h1>. -->
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('heading', { level: 2 })} onclick={() => toggleHeading(2)} title="Heading 1">H1</button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('heading', { level: 3 })} onclick={() => toggleHeading(3)} title="Heading 2">H2</button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('heading', { level: 4 })} onclick={() => toggleHeading(4)} title="Heading 3">H3</button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('bulletList')} onclick={toggleBulletList} title="Bullet List">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" y1="6" x2="21" y2="6" />
					<line x1="8" y1="12" x2="21" y2="12" />
					<line x1="8" y1="18" x2="21" y2="18" />
					<circle cx="4" cy="6" r="1" fill="currentColor" />
					<circle cx="4" cy="12" r="1" fill="currentColor" />
					<circle cx="4" cy="18" r="1" fill="currentColor" />
				</svg>
			</button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('orderedList')} onclick={toggleOrderedList} title="Numbered List">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="10" y1="6" x2="21" y2="6" />
					<line x1="10" y1="12" x2="21" y2="12" />
					<line x1="10" y1="18" x2="21" y2="18" />
					<text x="2" y="8" font-size="8" fill="currentColor">1</text>
					<text x="2" y="14" font-size="8" fill="currentColor">2</text>
					<text x="2" y="20" font-size="8" fill="currentColor">3</text>
				</svg>
			</button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('blockquote')} onclick={toggleBlockquote} title="Quote">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
					<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4" />
				</svg>
			</button>
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('codeBlock')} onclick={toggleCodeBlock} title="Code Block">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="16 18 22 12 16 6" />
					<polyline points="8 6 2 12 8 18" />
				</svg>
			</button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<button type="button" class="toolbar-btn" class:active={editor?.isActive('link')} onclick={setLink} title="Add Link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</button>
			<button type="button" class="toolbar-btn" onclick={openMediaLibrary} title="Insert Image from Media Library">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
			</button>
		</div>

		<div class="toolbar-spacer"></div>

		<div class="toolbar-group">
			<button type="button" class="toolbar-btn" onclick={undo} title="Undo">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 7v6h6" />
					<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
				</svg>
			</button>
			<button type="button" class="toolbar-btn" onclick={redo} title="Redo">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 7v6h-6" />
					<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
				</svg>
			</button>
		</div>
	</div>

	<div class="editor-content" bind:this={editorElement} data-placeholder={placeholder}></div>
</div>

<MediaLibrary bind:open={libraryOpen} onSelect={insertFromLibrary} title="Insert Image" />

<style>
	.editor-wrapper {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		background: var(--color-surface);
	}

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		background: var(--color-bg-secondary);
		border-bottom: 1px solid var(--color-border);
	}

	.toolbar-group {
		display: flex;
		gap: var(--space-1);
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.toolbar-btn:hover {
		background: var(--color-surface);
		color: var(--color-text);
	}

	.toolbar-btn.active {
		background: var(--color-accent);
		color: white;
	}

	.toolbar-btn svg {
		width: 16px;
		height: 16px;
	}

	.toolbar-btn code {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
	}

	.toolbar-separator {
		width: 1px;
		height: 24px;
		background: var(--color-border);
		margin: 0 var(--space-2);
	}

	.toolbar-spacer {
		flex: 1;
	}

	/* The editor wrapper is sized by its parent (the admin page sets
	   max-width: var(--prose-wide)). overflow: visible lets wide images
	   inside ProseMirror visually escape the editor's border to mirror the
	   public post page's wide breakouts. */
	.editor-wrapper {
		overflow: visible;
	}

	.editor-content {
		min-height: 300px;
		padding: var(--space-8) var(--space-4);
	}

	.editor-content :global(.ProseMirror) {
		outline: none;
		min-height: 280px;
	}

	.editor-content :global(.ProseMirror p.is-editor-empty:first-child::before) {
		content: attr(data-placeholder);
		color: var(--color-text-muted);
		pointer-events: none;
		float: left;
		height: 0;
	}

	/* ── BlogImage node view (in-editor) ────────────────────────────────────
	   Mirrors the public blog page so the editor is a true WYSIWYG.
	   normal — clamped to --measure inside the text column
	   wide   — breaks out up to --prose-wide (escapes the editor border)
	   full   — full viewport bleed
	*/
	.editor-content :global(figure.blog-img) {
		position: relative;
		margin: var(--space-8) auto;
		display: block;
	}

	.editor-content :global(figure.blog-img[data-width-mode='normal']) {
		width: var(--blog-img-pct, 100%);
		max-width: var(--measure);
		margin-left: auto;
		margin-right: auto;
	}

	.editor-content :global(figure.blog-img[data-width-mode='wide']) {
		width: var(--prose-wide);
		max-width: calc(100vw - 2rem);
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.editor-content :global(figure.blog-img[data-width-mode='full']) {
		width: 100vw;
		max-width: 100vw;
		margin-left: 50%;
		transform: translateX(-50%);
	}

	.editor-content :global(figure.blog-img .blog-img-inner) {
		position: relative;
		background: var(--blog-img-bg, var(--color-bg-secondary));
		border-radius: var(--radius-sm);
		overflow: hidden;
		aspect-ratio: var(--blog-img-aspect, auto);
	}

	.editor-content :global(figure.blog-img img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.editor-content :global(figure.blog-img .blog-img-caption) {
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

	.editor-content :global(figure.blog-img.has-caption .blog-img-caption) {
		display: block;
	}

	/* While an upload is in flight: dim the local preview and show a spinner. */
	.editor-content :global(figure.blog-img.is-uploading img) {
		filter: brightness(0.85);
	}

	.editor-content :global(figure.blog-img .blog-img-spinner) {
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

	.editor-content :global(figure.blog-img.is-uploading .blog-img-spinner) {
		display: flex;
	}

	.editor-content :global(figure.blog-img .blog-img-spinner-ring) {
		width: 36px;
		height: 36px;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: blog-img-spin 800ms linear infinite;
	}

	.editor-content :global(figure.blog-img .blog-img-spinner-label) {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	@keyframes blog-img-spin {
		to { transform: rotate(360deg); }
	}

	.editor-content :global(figure.blog-img .blog-img-handle) {
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

	.editor-content :global(figure.blog-img .blog-img-handle::before) {
		content: '';
		width: 2px;
		height: 24px;
		background: white;
		border-radius: 1px;
	}

	.editor-content :global(figure.blog-img .blog-img-handle-left) {
		left: 6px;
	}

	.editor-content :global(figure.blog-img .blog-img-handle-right) {
		right: 6px;
	}

	.editor-content :global(figure.blog-img:hover .blog-img-handle),
	.editor-content :global(figure.blog-img.is-selected .blog-img-handle) {
		opacity: 1;
	}

	.editor-content :global(figure.blog-img .blog-img-toolbar) {
		position: absolute;
		top: -36px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		opacity: 0;
		pointer-events: none;
		transition: opacity 150ms ease;
		font-size: var(--text-xs);
	}

	.editor-content :global(figure.blog-img.is-selected .blog-img-toolbar) {
		opacity: 1;
		pointer-events: auto;
	}

	.editor-content :global(figure.blog-img .blog-img-toolbar button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 26px;
		height: 24px;
		padding: 0 6px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
	}

	.editor-content :global(figure.blog-img .blog-img-toolbar button:hover) {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.editor-content :global(figure.blog-img .blog-img-toolbar button.is-active) {
		background: var(--color-accent);
		color: white;
	}

	.editor-content :global(figure.blog-img .blog-img-sep) {
		width: 1px;
		height: 16px;
		background: var(--color-border);
		margin: 0 2px;
	}

	.editor-content :global(figure.blog-img.is-selected) {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
</style>
