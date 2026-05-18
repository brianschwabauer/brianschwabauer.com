<script lang="ts">
	import type { Editor } from '@tiptap/core';

	interface Props {
		editor: Editor | null;
		/** Trigger to open the media library so the user can pick an image. */
		onPickImage?: () => void;
	}

	let { editor, onPickImage }: Props = $props();

	let visible = $state(false);
	let top = $state(0);
	let left = $state(0);
	let menuOpen = $state(false);

	function update() {
		const ed = editor;
		if (!ed) {
			visible = false;
			return;
		}
		// Only show the "+" on an empty paragraph block in the current selection.
		const { selection } = ed.state;
		if (!ed.isFocused && !menuOpen) {
			visible = false;
			return;
		}
		const resolved = selection.$from;
		const parent = resolved.parent;
		// Only show for empty paragraphs (matches the public's flow of inserting blocks).
		if (parent.type.name !== 'paragraph' || parent.content.size !== 0) {
			if (!menuOpen) visible = false;
			return;
		}
		const coords = ed.view.coordsAtPos(resolved.pos);
		const editorRect = ed.view.dom.getBoundingClientRect();
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		// Park the button to the LEFT of the text column, vertically aligned to the line.
		top = coords.top + scrollY - 2;
		left = editorRect.left + scrollX - 40;
		// If there's not enough room on the left (small screens), tuck it inside.
		if (left < scrollX + 4) {
			left = editorRect.left + scrollX + 4;
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
		ed.on('blur', () => {
			// Defer hide so the click on the + button still registers.
			setTimeout(() => {
				if (!menuOpen) visible = false;
			}, 150);
		});
		window.addEventListener('resize', handler);
		window.addEventListener('scroll', handler, true);
		return () => {
			ed.off('selectionUpdate', handler);
			ed.off('transaction', handler);
			ed.off('focus', handler);
			window.removeEventListener('resize', handler);
			window.removeEventListener('scroll', handler, true);
		};
	});

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function close() {
		menuOpen = false;
		requestAnimationFrame(update);
	}

	function insertImage() {
		close();
		onPickImage?.();
	}

	function insertHeading(level: 2 | 3 | 4) {
		editor?.chain().focus().setHeading({ level }).run();
		close();
	}
	function insertBulletList() { editor?.chain().focus().toggleBulletList().run(); close(); }
	function insertOrderedList() { editor?.chain().focus().toggleOrderedList().run(); close(); }
	function insertCodeBlock() { editor?.chain().focus().toggleCodeBlock().run(); close(); }
	function insertQuote() { editor?.chain().focus().toggleBlockquote().run(); close(); }
	function insertDivider() { editor?.chain().focus().setHorizontalRule().run(); close(); }
</script>

<svelte:window
	onclick={(e) => {
		if (!menuOpen) return;
		const target = e.target as HTMLElement;
		if (target.closest('.plus-menu-root')) return;
		close();
	}} />

<div
	class="plus-menu-root"
	class:visible
	style:top="{top}px"
	style:left="{left}px">
	<button
		type="button"
		class="plus-btn"
		class:open={menuOpen}
		title="Add content"
		aria-label="Add content"
		onmousedown={(e) => e.preventDefault()}
		onclick={toggleMenu}>
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
			<line x1="12" y1="5" x2="12" y2="19" />
			<line x1="5" y1="12" x2="19" y2="12" />
		</svg>
	</button>

	{#if menuOpen}
		<div class="plus-menu" role="menu" tabindex="-1" onmousedown={(e) => e.preventDefault()}>
			<button type="button" class="pm-item" onclick={insertImage}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<polyline points="21 15 16 10 5 21" />
				</svg>
				<span class="pm-label">Image</span>
				<span class="pm-desc">Upload or pick from library</span>
			</button>
			<button type="button" class="pm-item" onclick={() => insertHeading(2)}>
				<span class="pm-icon">H1</span>
				<span class="pm-label">Heading 1</span>
				<span class="pm-desc">Large section heading</span>
			</button>
			<button type="button" class="pm-item" onclick={() => insertHeading(3)}>
				<span class="pm-icon">H2</span>
				<span class="pm-label">Heading 2</span>
				<span class="pm-desc">Medium heading</span>
			</button>
			<button type="button" class="pm-item" onclick={() => insertHeading(4)}>
				<span class="pm-icon">H3</span>
				<span class="pm-label">Heading 3</span>
				<span class="pm-desc">Small heading</span>
			</button>
			<button type="button" class="pm-item" onclick={insertBulletList}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<line x1="8" y1="6" x2="21" y2="6" />
					<line x1="8" y1="12" x2="21" y2="12" />
					<line x1="8" y1="18" x2="21" y2="18" />
					<circle cx="4" cy="6" r="1" fill="currentColor" />
					<circle cx="4" cy="12" r="1" fill="currentColor" />
					<circle cx="4" cy="18" r="1" fill="currentColor" />
				</svg>
				<span class="pm-label">Bullet list</span>
				<span class="pm-desc">A simple bulleted list</span>
			</button>
			<button type="button" class="pm-item" onclick={insertOrderedList}>
				<span class="pm-icon">1.</span>
				<span class="pm-label">Numbered list</span>
				<span class="pm-desc">A list with numbers</span>
			</button>
			<button type="button" class="pm-item" onclick={insertQuote}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21" />
					<path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4" />
				</svg>
				<span class="pm-label">Quote</span>
				<span class="pm-desc">Capture a quote</span>
			</button>
			<button type="button" class="pm-item" onclick={insertCodeBlock}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<polyline points="16 18 22 12 16 6" />
					<polyline points="8 6 2 12 8 18" />
				</svg>
				<span class="pm-label">Code block</span>
				<span class="pm-desc">A formatted code snippet</span>
			</button>
			<button type="button" class="pm-item" onclick={insertDivider}>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<line x1="3" y1="12" x2="21" y2="12" />
				</svg>
				<span class="pm-label">Divider</span>
				<span class="pm-desc">A horizontal break</span>
			</button>
		</div>
	{/if}
</div>

<style>
	.plus-menu-root {
		position: absolute;
		z-index: 4;
		opacity: 0;
		transition: opacity 100ms ease;
		pointer-events: none;
	}
	.plus-menu-root.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.plus-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: color 120ms ease, transform 120ms ease, border-color 120ms ease, background 120ms ease;
	}
	.plus-btn:hover,
	.plus-btn.open {
		color: var(--color-accent);
		border-color: var(--color-accent);
		background: var(--color-accent-light);
	}
	.plus-btn.open {
		transform: rotate(45deg);
	}

	.plus-menu {
		position: absolute;
		top: 34px;
		left: 0;
		min-width: 260px;
		max-height: 360px;
		overflow-y: auto;
		padding: var(--space-1);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		z-index: 4;
	}

	.pm-item {
		display: grid;
		grid-template-columns: 28px 1fr;
		grid-template-rows: auto auto;
		grid-template-areas: 'icon label' 'icon desc';
		align-items: center;
		gap: 0 var(--space-2);
		width: 100%;
		padding: var(--space-2);
		border: none;
		background: transparent;
		text-align: left;
		border-radius: var(--radius-sm);
		color: var(--color-text);
		cursor: pointer;
	}
	.pm-item:hover { background: var(--color-bg-secondary); }
	.pm-item svg,
	.pm-item .pm-icon {
		grid-area: icon;
		justify-self: center;
		font-weight: 700;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
	}
	.pm-label {
		grid-area: label;
		font-weight: 500;
		font-size: var(--text-sm);
	}
	.pm-desc {
		grid-area: desc;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.plus-menu {
			min-width: 220px;
		}
	}
</style>
