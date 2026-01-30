<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Link from '@tiptap/extension-link';
	import Image from '@tiptap/extension-image';

	interface Props {
		content?: string;
		placeholder?: string;
		onUpdate?: (html: string, text: string) => void;
	}

	let { content = '', placeholder = 'Start writing...', onUpdate }: Props = $props();

	let editorElement: HTMLElement;
	let editor: Editor | null = $state(null);

	onMount(() => {
		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit.configure({
					heading: {
						levels: [2, 3, 4]
					}
				}),
				Link.configure({
					openOnClick: false
				}),
				Image
			],
			content,
			editorProps: {
				attributes: {
					class: 'prose'
				}
			},
			onUpdate: ({ editor }) => {
				onUpdate?.(editor.getHTML(), editor.getText());
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleStrike() {
		editor?.chain().focus().toggleStrike().run();
	}

	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}

	function toggleHeading(level: 2 | 3 | 4) {
		editor?.chain().focus().toggleHeading({ level }).run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function toggleCodeBlock() {
		editor?.chain().focus().toggleCodeBlock().run();
	}

	function toggleBlockquote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function setLink() {
		const url = prompt('Enter URL:');
		if (url) {
			editor?.chain().focus().setLink({ href: url }).run();
		}
	}

	function addImage() {
		const url = prompt('Enter image URL:');
		if (url) {
			editor?.chain().focus().setImage({ src: url }).run();
		}
	}

	function undo() {
		editor?.chain().focus().undo().run();
	}

	function redo() {
		editor?.chain().focus().redo().run();
	}

	export function getHTML() {
		return editor?.getHTML() ?? '';
	}

	export function getText() {
		return editor?.getText() ?? '';
	}

	export function setContent(newContent: string) {
		editor?.commands.setContent(newContent);
	}
</script>

<div class="editor-wrapper">
	<div class="editor-toolbar">
		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('bold')}
				onclick={toggleBold}
				title="Bold"
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('italic')}
				onclick={toggleItalic}
				title="Italic"
			>
				<em>I</em>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('strike')}
				onclick={toggleStrike}
				title="Strikethrough"
			>
				<s>S</s>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('code')}
				onclick={toggleCode}
				title="Inline Code"
			>
				<code>&lt;/&gt;</code>
			</button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 2 })}
				onclick={() => toggleHeading(2)}
				title="Heading 2"
			>
				H2
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 3 })}
				onclick={() => toggleHeading(3)}
				title="Heading 3"
			>
				H3
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('heading', { level: 4 })}
				onclick={() => toggleHeading(4)}
				title="Heading 4"
			>
				H4
			</button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('bulletList')}
				onclick={toggleBulletList}
				title="Bullet List"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" y1="6" x2="21" y2="6" />
					<line x1="8" y1="12" x2="21" y2="12" />
					<line x1="8" y1="18" x2="21" y2="18" />
					<circle cx="4" cy="6" r="1" fill="currentColor" />
					<circle cx="4" cy="12" r="1" fill="currentColor" />
					<circle cx="4" cy="18" r="1" fill="currentColor" />
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('orderedList')}
				onclick={toggleOrderedList}
				title="Numbered List"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="10" y1="6" x2="21" y2="6" />
					<line x1="10" y1="12" x2="21" y2="12" />
					<line x1="10" y1="18" x2="21" y2="18" />
					<text x="2" y="8" font-size="8" fill="currentColor">1</text>
					<text x="2" y="14" font-size="8" fill="currentColor">2</text>
					<text x="2" y="20" font-size="8" fill="currentColor">3</text>
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('blockquote')}
				onclick={toggleBlockquote}
				title="Quote"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
					<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4" />
				</svg>
			</button>
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('codeBlock')}
				onclick={toggleCodeBlock}
				title="Code Block"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="16 18 22 12 16 6" />
					<polyline points="8 6 2 12 8 18" />
				</svg>
			</button>
		</div>

		<div class="toolbar-separator"></div>

		<div class="toolbar-group">
			<button
				type="button"
				class="toolbar-btn"
				class:active={editor?.isActive('link')}
				onclick={setLink}
				title="Add Link"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
			</button>
			<button type="button" class="toolbar-btn" onclick={addImage} title="Add Image">
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

	<div class="editor-content" bind:this={editorElement}></div>
</div>

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

	.editor-content {
		min-height: 300px;
		padding: var(--space-4);
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
</style>
