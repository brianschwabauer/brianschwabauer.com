<script lang="ts">
	import type { Editor } from '@tiptap/core';

	interface Props {
		editor: Editor | null;
		onPickImage?: () => void;
		onInsertGallery?: () => void;
	}

	let { editor, onPickImage, onInsertGallery }: Props = $props();

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}
	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}
	function toggleH1() {
		editor?.chain().focus().toggleHeading({ level: 2 }).run();
	}
	function toggleH2() {
		editor?.chain().focus().toggleHeading({ level: 3 }).run();
	}
	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}
	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}
	function toggleQuote() {
		editor?.chain().focus().toggleBlockquote().run();
	}
	function toggleCode() {
		editor?.chain().focus().toggleCode().run();
	}
	function undo() {
		editor?.chain().focus().undo().run();
	}
	function redo() {
		editor?.chain().focus().redo().run();
	}
</script>

<div
	class="mobile-bar"
	role="toolbar"
	tabindex="-1"
	aria-label="Formatting"
	onmousedown={(e) => e.preventDefault()}>
	<div class="mobile-bar-inner">
		<button
			type="button"
			class:active={editor?.isActive('bold')}
			onclick={toggleBold}
			title="Bold">
			<strong>B</strong>
		</button>
		<button
			type="button"
			class:active={editor?.isActive('italic')}
			onclick={toggleItalic}
			title="Italic">
			<em>I</em>
		</button>
		<button
			type="button"
			class:active={editor?.isActive('heading', { level: 2 })}
			onclick={toggleH1}
			title="H1">
			H1
		</button>
		<button
			type="button"
			class:active={editor?.isActive('heading', { level: 3 })}
			onclick={toggleH2}
			title="H2">
			H2
		</button>
		<button
			type="button"
			class:active={editor?.isActive('bulletList')}
			onclick={toggleBulletList}
			title="Bullet list">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
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
			class:active={editor?.isActive('orderedList')}
			onclick={toggleOrderedList}
			title="Numbered list">
			1.
		</button>
		<button
			type="button"
			class:active={editor?.isActive('blockquote')}
			onclick={toggleQuote}
			title="Quote">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
				<path
					d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
				<path
					d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4" />
			</svg>
		</button>
		<button
			type="button"
			class:active={editor?.isActive('code')}
			onclick={toggleCode}
			title="Inline code">
			<code>&lt;/&gt;</code>
		</button>
		<button type="button" onclick={() => onPickImage?.()} title="Insert image">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
		</button>
		<button type="button" onclick={() => onInsertGallery?.()} title="Insert gallery">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
			</svg>
		</button>
		<span class="bar-sep"></span>
		<button type="button" onclick={undo} title="Undo">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
				<path d="M3 7v6h6" />
				<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
			</svg>
		</button>
		<button type="button" onclick={redo} title="Redo">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="16"
				height="16">
				<path d="M21 7v6h-6" />
				<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
			</svg>
		</button>
	</div>
</div>

<style>
	.mobile-bar {
		display: none;
	}

	@media (max-width: 767px) {
		.mobile-bar {
			display: block;
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 3;
			background: var(--color-surface);
			border-top: 1px solid var(--color-border);
			padding: var(--space-2);
			padding-bottom: max(var(--space-2), env(safe-area-inset-bottom));
		}
		.mobile-bar-inner {
			display: flex;
			align-items: center;
			gap: 2px;
			overflow-x: auto;
			-webkit-overflow-scrolling: touch;
		}
		.mobile-bar button {
			flex: 0 0 auto;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 36px;
			height: 36px;
			padding: 0 8px;
			background: transparent;
			border: none;
			border-radius: var(--radius-sm);
			color: var(--color-text);
			font-weight: 600;
			cursor: pointer;
		}
		.mobile-bar button.active {
			background: var(--color-accent);
			color: white;
		}
		.mobile-bar code {
			font-family: var(--font-mono);
			font-size: 0.75rem;
		}
		.bar-sep {
			width: 1px;
			height: 22px;
			background: var(--color-border);
			margin: 0 4px;
			flex: 0 0 auto;
		}
	}
</style>
