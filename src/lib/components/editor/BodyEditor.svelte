<script lang="ts">
	import { flushSync, onMount, onDestroy, untrack } from 'svelte';
	import { Editor, textblockTypeInputRule, type JSONContent } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Heading from '@tiptap/extension-heading';
	import Link from '@tiptap/extension-link';
	import { BlogImage } from './extensions/BlogImage';
	import { imageDropHandler, recordToBlogImageAttrs } from './extensions/imageDropHandler';
	import { SlashCommand } from './extensions/slashCommand';
	import { TrailingParagraph } from './extensions/trailingParagraph';
	import MediaLibrary from '$lib/components/media/MediaLibrary.svelte';
	import { notify } from '$lib/components/dialogs';
	import EditorBubbleMenu from './EditorBubbleMenu.svelte';
	import EditorPlusMenu from './EditorPlusMenu.svelte';
	import EditorSlashMenu from './EditorSlashMenu.svelte';
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
		/** Server-rendered HTML of `content`. Painted into the editor mount
		    point so SSR shows real content immediately — TipTap clears it and
		    takes over on hydration. Captured once at construction; later
		    changes to the prop are ignored to avoid clobbering TipTap's DOM. */
		initialContentHtml?: string;
		placeholder?: string;
		onUpdate?: (json: JSONContent, text: string) => void;
		onAiAction?: (selectedText: string) => void;
	}

	let {
		content = null,
		initialContentHtml = '',
		placeholder = 'Tell your story…',
		onUpdate,
		onAiAction,
	}: Props = $props();

	// Snapshot at construction so reactive changes don't re-set innerHTML
	// after TipTap has mounted into the same element.
	const initialHtml = untrack(() => initialContentHtml);

	let editorElement: HTMLElement;
	let editor: Editor | null = $state(null);
	// Flipped right before TipTap mounts so the {#if !mounted} SSR preview is
	// removed synchronously (via flushSync) — keeps the swap from briefly
	// stacking both previews and shifting the page height.
	let mounted = $state(false);
	let libraryOpen = $state(false);
	// Seed from the initial content so the SSR'd output isn't covered by the
	// placeholder before TipTap mounts.
	let isDocEmpty = $state(untrack(() => isJsonDocEmpty(content)));

	function isJsonDocEmpty(doc: JSONContent | null | undefined): boolean {
		if (!doc) return true;
		const children = doc.content ?? [];
		if (children.length === 0) return true;
		if (children.length === 1) {
			const only = children[0];
			if (only.type === 'paragraph' && (!only.content || only.content.length === 0)) {
				return true;
			}
		}
		return false;
	}
	// Plain mutable ref shared with EditorSlashMenu — the SlashCommand
	// extension calls `.onKeyDown` to give the menu a chance to intercept
	// navigation keys before ProseMirror processes them.
	const slashRef: { onKeyDown: (event: KeyboardEvent) => boolean } = {
		onKeyDown: () => false,
	};

	onMount(() => {
		// Flip `mounted` first and flush so Svelte removes the SSR preview
		// before TipTap claims the same host — otherwise both previews would
		// briefly stack and the page would shift.
		mounted = true;
		flushSync();
		editor = createEditor();
	});

	function createEditor(): Editor {
		// Defensive: clear any stray content in case the host wasn't empty.
		editorElement.innerHTML = '';
		const next = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({ heading: false }),
				ShiftedHeading,
				Link.configure({ openOnClick: false }),
				BlogImage,
				TrailingParagraph,
				imageDropHandler.configure({
					onUploadError: (err, file) => {
						console.error(`Failed to upload ${file.name}:`, err);
						void notify({
							title: 'Upload failed',
							message: `Couldn’t upload ${file.name}: ${err.message}`,
							tone: 'error',
						});
					},
				}),
				SlashCommand.configure({
					onKeyDown: (event) => slashRef.onKeyDown(event),
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
		return next;
	}

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

	/**
	 * Catch clicks that land in the empty space below the editable surface
	 * (most often when the last block is an image and the user wants to add
	 * content after it) and bounce the cursor to the end of the document so
	 * they can immediately type or open the slash menu.
	 */
	function handleHostPointerDown(event: MouseEvent) {
		if (!editor) return;
		// Only act on primary mouse / touch — leave right-click etc. alone.
		if (event.button !== 0) return;
		const view = editor.view;
		const pmRect = view.dom.getBoundingClientRect();
		// Below the editable surface: always bounce to end.
		if (event.clientY <= pmRect.bottom) {
			// Inside PM: let ProseMirror handle hit-testing normally.
			if ((view.dom as HTMLElement).contains(event.target as Node)) return;
		}
		event.preventDefault();
		editor.chain().focus('end').run();
	}
</script>

<div class="body-editor">
	<div
		class="body-host"
		class:is-empty={isDocEmpty}
		data-placeholder={placeholder}
		onmousedown={handleHostPointerDown}
		role="presentation"
	>
		<div bind:this={editorElement}>
			{#if !mounted && initialHtml}
				<div class="body-pm prose body-ssr" aria-hidden="true">{@html initialHtml}</div>
			{/if}
		</div>
	</div>
</div>

<EditorBubbleMenu {editor} {onAiAction} />
<EditorPlusMenu {editor} onPickImage={openMediaLibrary} />
<EditorSlashMenu {editor} {slashRef} onPickImage={openMediaLibrary} />
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
		/* Generous clickable runway below the last block — the mousedown
		   handler on this element bounces clicks here to the document end so
		   the user can always extend the post by clicking under the content
		   (especially after an image). */
		padding-bottom: 30vh;
		cursor: text;
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

	/* While the user is dragging a side handle, drive the figure's width
	   from a pixel custom-property so it tracks the cursor continuously
	   (with magnetic-snap gravity applied in BlogImageNodeView). Universal
	   margin-50% / translate(-50%) centering matches the wide/full modes
	   and works for any width up to the viewport. */
	.body-host :global(figure.blog-img.is-dragging) {
		width: var(--blog-img-drag-px) !important;
		max-width: 100vw !important;
		margin-left: 50% !important;
		margin-right: 0 !important;
		transform: translateX(-50%) !important;
	}

	/* After release: animate from the drag-time pixel width to the
	   committed mode's natural width. Centering is held at 50%/translate
	   for the duration so a normal-mode landing doesn't jump horizontally
	   while shrinking from a wider intermediate. */
	.body-host :global(figure.blog-img.is-snapping) {
		transition: width 280ms cubic-bezier(0.34, 1.2, 0.64, 1);
		margin-left: 50% !important;
		margin-right: 0 !important;
		transform: translateX(-50%) !important;
	}

	.body-host :global(figure.blog-img .blog-img-inner) {
		position: relative;
		background: var(--blog-img-bg, var(--color-bg-secondary));
		border-radius: var(--radius-sm);
		overflow: hidden;
		aspect-ratio: var(--blog-img-aspect, auto);
	}

	/* Crop mode: inner takes a forced aspect-ratio (always wider/shorter than
	   natural) and the img fills it via object-fit:cover. Focal point drives
	   object-position so the user can pick what part of the original shows. */
	.body-host :global(figure.blog-img.is-cropped .blog-img-inner) {
		aspect-ratio: var(--blog-img-crop-aspect);
	}

	.body-host :global(figure.blog-img img) {
		display: block;
		width: 100%;
		height: auto;
	}

	.body-host :global(figure.blog-img.is-cropped img) {
		height: 100%;
		object-fit: cover;
		object-position: var(--blog-img-focal-x, 50%) var(--blog-img-focal-y, 50%);
	}

	/* SSR fallback: renderDoc emits <figure><img></figure> directly (matching
	   the public post page), so it has no .blog-img-inner wrapper to carry the
	   cropped aspect-ratio. Mirror that styling onto the figure itself — but
	   only inside .body-ssr — so the SSR'd post lays out at the right height
	   and the page doesn't reflow when TipTap hydrates and inserts the inner
	   wrapper. Scoping to .body-ssr keeps the editor's figure free of
	   overflow:hidden (which would clip the hover toolbar / resize handles
	   that sit outside the figure bounds). */
	.body-host :global(.body-ssr figure.blog-img.is-cropped) {
		aspect-ratio: var(--blog-img-crop-aspect);
		overflow: hidden;
		border-radius: var(--radius-sm);
	}
	.body-host :global(.body-ssr figure.blog-img.is-cropped[data-width-mode='full']) {
		border-radius: 0;
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

	/* Bottom handle: horizontal bar at the bottom-center for resizing height. */
	.body-host :global(figure.blog-img .blog-img-handle-bottom) {
		top: auto;
		bottom: 6px;
		left: 50%;
		width: 60px;
		height: 14px;
		transform: translateX(-50%);
		cursor: ns-resize;
	}
	.body-host :global(figure.blog-img .blog-img-handle-bottom::before) {
		width: 24px;
		height: 2px;
	}

	.body-host :global(figure.blog-img:hover .blog-img-handle),
	.body-host :global(figure.blog-img.is-selected .blog-img-handle) {
		opacity: 1;
	}

	/* Hide all handles while the user is panning the focal point. */
	.body-host :global(figure.blog-img.is-repositioning .blog-img-handle) {
		opacity: 0 !important;
		pointer-events: none;
	}

	/* While dragging the bottom handle, drive the inner's aspect-ratio from a
	   custom property so the figure tracks the cursor (the same var stays set
	   after release because applyAttrs writes it from cropAspect). */
	.body-host :global(figure.blog-img.is-dragging-bottom .blog-img-inner) {
		aspect-ratio: var(--blog-img-crop-aspect);
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

	/* Reposition button: hidden until a crop is active (no overflow to pan). */
	.body-host :global(figure.blog-img .blog-img-repos-btn) {
		display: none !important;
	}
	.body-host :global(figure.blog-img.is-cropped .blog-img-repos-btn) {
		display: inline-flex !important;
	}

	/* Hide the regular toolbar while in repos mode so it doesn't compete with
	   the repos-toolbar that takes over the same area. */
	.body-host :global(figure.blog-img.is-repositioning .blog-img-toolbar) {
		opacity: 0 !important;
		pointer-events: none !important;
	}

	/* Repos overlay (only visible while panning). Dark vignette + hint text +
	   focal % readout. pointer-events:none so the pan handlers on .blog-img-inner
	   still receive the drag. */
	.body-host :global(figure.blog-img .blog-img-repos-overlay) {
		position: absolute;
		inset: 0;
		display: none;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--space-3) var(--space-4);
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.35) 0%,
			rgba(0, 0, 0, 0) 25%,
			rgba(0, 0, 0, 0) 75%,
			rgba(0, 0, 0, 0.35) 100%
		);
		z-index: 4;
	}
	.body-host :global(figure.blog-img.is-repositioning .blog-img-repos-overlay) {
		display: flex;
	}
	.body-host :global(figure.blog-img .blog-img-repos-hint) {
		color: white;
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.02em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}
	.body-host :global(figure.blog-img .blog-img-repos-readout) {
		align-self: flex-end;
		color: white;
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		padding: 2px var(--space-2);
		background: rgba(0, 0, 0, 0.45);
		border-radius: var(--radius-full);
		backdrop-filter: blur(4px);
	}
	.body-host :global(figure.blog-img.is-repositioning .blog-img-inner) {
		cursor: grab;
		touch-action: none;
	}

	/* Repos toolbar (Center / Cancel / Done) — sits on top of the inner during
	   repos mode, replacing the width-mode toolbar. */
	.body-host :global(figure.blog-img .blog-img-repos-toolbar) {
		position: absolute;
		top: var(--space-3);
		right: var(--space-3);
		display: none;
		gap: 2px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.55);
		border-radius: var(--radius-md);
		backdrop-filter: blur(8px);
		z-index: 5;
	}
	.body-host :global(figure.blog-img.is-repositioning .blog-img-repos-toolbar) {
		display: flex;
	}
	.body-host :global(figure.blog-img .blog-img-repos-toolbar button) {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: white;
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
	}
	.body-host :global(figure.blog-img .blog-img-repos-toolbar button svg) {
		width: 14px;
		height: 14px;
	}
	.body-host :global(figure.blog-img .blog-img-repos-toolbar button:hover) {
		background: rgba(255, 255, 255, 0.18);
	}
	.body-host :global(figure.blog-img .blog-img-repos-toolbar button.primary) {
		background: var(--color-accent);
	}
	.body-host :global(figure.blog-img .blog-img-repos-toolbar button.primary:hover) {
		background: var(--color-accent);
		filter: brightness(1.1);
	}

	.body-host :global(figure.blog-img.is-selected) {
		outline: 2px solid var(--color-accent);
		outline-offset: 4px;
		border-radius: 4px;
	}
</style>
