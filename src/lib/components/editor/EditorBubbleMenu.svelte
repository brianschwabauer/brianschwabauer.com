<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import { NodeSelection } from '@tiptap/pm/state';

	interface Props {
		editor: Editor | null;
		/** Optional AI button — receives the currently selected text. */
		onAiAction?: (selectedText: string) => void;
	}

	let { editor, onAiAction }: Props = $props();

	let menuEl: HTMLDivElement | undefined = $state();
	let visible = $state(false);
	let top = $state(0);
	let left = $state(0);
	let linkOpen = $state(false);
	let linkValue = $state('');

	function isTextSelection(ed: Editor): boolean {
		const { selection } = ed.state;
		const { from, to, empty } = selection;
		if (empty || from === to) return false;
		// NodeSelection (image, hr, blogImage, etc.) → those use their own
		// in-place toolbar. The text bubble menu is for inline marks only.
		if (selection instanceof NodeSelection) return false;
		return true;
	}

	function update() {
		const ed = editor;
		if (!ed || !menuEl) {
			visible = false;
			return;
		}
		if (linkOpen) return; // pin the menu while editing a link
		if (!ed.isFocused && !linkOpen) {
			visible = false;
			return;
		}
		if (!isTextSelection(ed)) {
			visible = false;
			return;
		}
		const { from, to } = ed.state.selection;
		const start = ed.view.coordsAtPos(from);
		const end = ed.view.coordsAtPos(to);
		const centerX = (start.left + end.right) / 2;
		const topY = Math.min(start.top, end.top);
		// Position absolutely relative to the document body.
		const menuRect = menuEl.getBoundingClientRect();
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		const gap = 10;
		left =
			Math.max(
				8,
				Math.min(window.innerWidth - menuRect.width - 8, centerX - menuRect.width / 2),
			) + scrollX;
		top = topY - menuRect.height - gap + scrollY;
		// If there's no room above, drop it below the selection.
		if (top < scrollY + 8) {
			top = Math.max(start.bottom, end.bottom) + gap + scrollY;
		}
		visible = true;
	}

	$effect(() => {
		const ed = editor;
		if (!ed) return;
		const handler = () => requestAnimationFrame(update);
		ed.on('selectionUpdate', handler);
		ed.on('transaction', handler);
		ed.on('focus', handler);
		ed.on('blur', handler);
		window.addEventListener('resize', handler);
		window.addEventListener('scroll', handler, true);
		return () => {
			ed.off('selectionUpdate', handler);
			ed.off('transaction', handler);
			ed.off('focus', handler);
			ed.off('blur', handler);
			window.removeEventListener('resize', handler);
			window.removeEventListener('scroll', handler, true);
		};
	});

	onMount(() => requestAnimationFrame(update));
	onDestroy(() => {});

	function run(fn: () => void) {
		fn();
		requestAnimationFrame(update);
	}

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
	function toggleH1() {
		editor?.chain().focus().toggleHeading({ level: 2 }).run();
	}
	function toggleH2() {
		editor?.chain().focus().toggleHeading({ level: 3 }).run();
	}
	function toggleH3() {
		editor?.chain().focus().toggleHeading({ level: 4 }).run();
	}
	function toggleQuote() {
		editor?.chain().focus().toggleBlockquote().run();
	}

	function openLink() {
		const ed = editor;
		if (!ed) return;
		const current = ed.getAttributes('link').href as string | undefined;
		linkValue = current ?? '';
		linkOpen = true;
		setTimeout(() => {
			const input = menuEl?.querySelector<HTMLInputElement>('input.link-input');
			input?.focus();
			input?.select();
		}, 0);
	}

	function applyLink() {
		const ed = editor;
		if (!ed) return;
		const url = linkValue.trim();
		if (!url) {
			ed.chain().focus().unsetLink().run();
		} else {
			ed.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
		}
		linkOpen = false;
		requestAnimationFrame(update);
	}

	function removeLink() {
		editor?.chain().focus().unsetLink().run();
		linkOpen = false;
		requestAnimationFrame(update);
	}

	function ai() {
		const ed = editor;
		if (!ed || !onAiAction) return;
		const { from, to } = ed.state.selection;
		const selectedText = ed.state.doc.textBetween(from, to, '\n');
		onAiAction(selectedText);
	}
</script>

<div
	bind:this={menuEl}
	class="bubble-menu"
	class:visible
	style:top="{top}px"
	style:left="{left}px"
	role="toolbar"
	tabindex="-1"
	aria-label="Formatting"
	onmousedown={(e) => e.preventDefault()}>
	{#if linkOpen}
		<div class="link-row">
			<input
				class="link-input"
				type="url"
				placeholder="https://example.com"
				bind:value={linkValue}
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						applyLink();
					} else if (e.key === 'Escape') {
						e.preventDefault();
						linkOpen = false;
						requestAnimationFrame(update);
					}
				}} />
			<button type="button" class="bm-btn" onclick={applyLink} title="Apply">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					width="14"
					height="14">
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</button>
			{#if editor?.isActive('link')}
				<button type="button" class="bm-btn" onclick={removeLink} title="Remove link">
					<svg
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						width="14"
						height="14">
						<path d="M18 6L6 18M6 6l12 12" />
					</svg>
				</button>
			{/if}
		</div>
	{:else}
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('bold')}
			onclick={() => run(toggleBold)}
			title="Bold (⌘B)">
			<strong>B</strong>
		</button>
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('italic')}
			onclick={() => run(toggleItalic)}
			title="Italic (⌘I)">
			<em>I</em>
		</button>
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('strike')}
			onclick={() => run(toggleStrike)}
			title="Strikethrough">
			<s>S</s>
		</button>
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('code')}
			onclick={() => run(toggleCode)}
			title="Inline code">
			<code>&lt;/&gt;</code>
		</button>
		<span class="bm-sep"></span>
		<button
			type="button"
			class="bm-btn small"
			class:active={editor?.isActive('heading', { level: 2 })}
			onclick={() => run(toggleH1)}
			title="Heading 1">
			H1
		</button>
		<button
			type="button"
			class="bm-btn small"
			class:active={editor?.isActive('heading', { level: 3 })}
			onclick={() => run(toggleH2)}
			title="Heading 2">
			H2
		</button>
		<button
			type="button"
			class="bm-btn small"
			class:active={editor?.isActive('heading', { level: 4 })}
			onclick={() => run(toggleH3)}
			title="Heading 3">
			H3
		</button>
		<span class="bm-sep"></span>
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('blockquote')}
			onclick={() => run(toggleQuote)}
			title="Quote">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="14"
				height="14">
				<path
					d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
				<path
					d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4" />
			</svg>
		</button>
		<button
			type="button"
			class="bm-btn"
			class:active={editor?.isActive('link')}
			onclick={openLink}
			title="Link">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				width="14"
				height="14">
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
			</svg>
		</button>
		{#if onAiAction}
			<span class="bm-sep"></span>
			<button type="button" class="bm-btn ai" onclick={ai} title="Ask AI about selection">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					width="14"
					height="14">
					<path d="M12 3l1.9 5.8L19 10l-5.1 1.2L12 17l-1.9-5.8L5 10l5.1-1.2z" />
					<path d="M19 16l.7 2.2L22 19l-2.3.8L19 22l-.7-2.2L16 19l2.3-.8z" />
				</svg>
				<span>AI</span>
			</button>
		{/if}
	{/if}
</div>

<style>
	.bubble-menu {
		position: absolute;
		/* Sit above the topbar (z-index 3) but below the delightstack Modal
		   (--layer-5 = 5) so opening a modal hides this menu visually. */
		z-index: 4;
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		opacity: 0;
		transform: translateY(2px);
		transition:
			opacity 120ms ease,
			transform 120ms ease;
		pointer-events: none;
		font-size: var(--text-sm);
	}
	.bubble-menu.visible {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.bm-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 28px;
		height: 28px;
		padding: 0 6px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text);
		cursor: pointer;
		font-weight: 600;
		transition: background-color 120ms ease;
	}
	.bm-btn:hover {
		transition-duration: 0s;
		background: var(--color-bg-secondary);
	}
	.bm-btn.active {
		background: var(--color-accent);
		color: white;
	}
	.bm-btn.small {
		font-size: var(--text-xs);
	}
	.bm-btn code {
		font-family: var(--font-mono);
		font-size: 0.7rem;
	}
	.bm-btn.ai {
		color: var(--color-accent);
	}
	.bm-btn.ai:hover {
		transition-duration: 0s;
		background: var(--color-accent-light);
	}

	.bm-sep {
		width: 1px;
		height: 18px;
		background: var(--color-border);
		margin: 0 2px;
	}

	.link-row {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 2px;
	}
	.link-input {
		min-width: 220px;
		height: 26px;
		padding: 0 8px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg);
		color: var(--color-text);
		font-size: var(--text-sm);
		outline: none;
	}
	.link-input:focus {
		border-color: var(--color-accent);
	}
</style>
