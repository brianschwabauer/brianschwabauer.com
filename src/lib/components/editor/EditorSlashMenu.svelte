<script lang="ts">
	import type { Editor } from '@tiptap/core';

	interface SlashItem {
		id: string;
		label: string;
		description: string;
		aliases: string[];
		iconKind:
			| 'image'
			| 'video'
			| 'audio'
			| 'h1'
			| 'h2'
			| 'h3'
			| 'bullet'
			| 'ordered'
			| 'quote'
			| 'code'
			| 'divider';
		run: (editor: Editor) => void;
	}

	interface Props {
		editor: Editor | null;
		/**
		 * Mutable ref the SlashCommand extension calls into. We assign our
		 * keydown handler onto `.onKeyDown` so ProseMirror routes Arrow /
		 * Enter / Tab / Escape through us first when the menu is open.
		 */
		slashRef: { onKeyDown: (event: KeyboardEvent) => boolean };
		/** Called when the user picks "/image" — opens the media library. */
		onPickImage?: () => void;
	}

	let { editor, slashRef, onPickImage }: Props = $props();

	let visible = $state(false);
	let top = $state(0);
	let left = $state(0);
	let query = $state('');
	let activeIndex = $state(0);
	let listEl: HTMLDivElement | undefined = $state();
	let itemEls: HTMLButtonElement[] = $state([]);
	// Range of the "/query" text within the doc — used to clear it before
	// running the command so the menu doesn't leave junk text behind.
	let triggerRange: { from: number; to: number } | null = null;
	// Set true on Escape (or on selecting an item that opens an async picker)
	// so re-typing in the same "/…" string doesn't reopen the menu. Reset
	// when the leading "/" is removed or the selection leaves the paragraph.
	let dismissed = $state(false);
	let dismissedParagraphPos: number | null = null;

	const COMMANDS: SlashItem[] = [
		{
			id: 'image',
			label: 'Image',
			description: 'Upload or pick from library',
			aliases: ['img', 'picture', 'photo', 'media'],
			iconKind: 'image',
			run: () => onPickImage?.(),
		},
		{
			id: 'video',
			label: 'Video',
			description: 'Embed a video from the media library',
			aliases: ['video', 'film', 'movie', 'hls', 'clip'],
			iconKind: 'video',
			run: (ed) => {
				const slug = window.prompt('Media video slug (e.g. 2015-04-22_legacy):');
				if (slug?.trim())
					ed.chain().focus().setBlogVideo({ videoSlug: slug.trim() }).run();
			},
		},
		{
			id: 'audio',
			label: 'Audio',
			description: 'Embed an audio clip',
			aliases: ['audio', 'sound', 'music', 'podcast', 'mp3'],
			iconKind: 'audio',
			run: (ed) => {
				const url = window.prompt('Audio file URL:');
				if (url?.trim()) ed.chain().focus().setBlogAudio({ src: url.trim() }).run();
			},
		},
		{
			id: 'h1',
			label: 'Heading 1',
			description: 'Large section heading',
			aliases: ['heading 1', 'heading1', 'title'],
			iconKind: 'h1',
			run: (ed) => ed.chain().focus().setHeading({ level: 2 }).run(),
		},
		{
			id: 'h2',
			label: 'Heading 2',
			description: 'Medium heading',
			aliases: ['heading 2', 'heading2', 'subtitle'],
			iconKind: 'h2',
			run: (ed) => ed.chain().focus().setHeading({ level: 3 }).run(),
		},
		{
			id: 'h3',
			label: 'Heading 3',
			description: 'Small heading',
			aliases: ['heading 3', 'heading3'],
			iconKind: 'h3',
			run: (ed) => ed.chain().focus().setHeading({ level: 4 }).run(),
		},
		{
			id: 'bullet',
			label: 'Bullet list',
			description: 'A simple bulleted list',
			aliases: ['bullet list', 'unordered', 'ul', 'list'],
			iconKind: 'bullet',
			run: (ed) => ed.chain().focus().toggleBulletList().run(),
		},
		{
			id: 'ordered',
			label: 'Numbered list',
			description: 'A list with numbers',
			aliases: ['numbered', 'ordered', 'ol', 'number'],
			iconKind: 'ordered',
			run: (ed) => ed.chain().focus().toggleOrderedList().run(),
		},
		{
			id: 'quote',
			label: 'Quote',
			description: 'Capture a quote',
			aliases: ['blockquote', 'quotation'],
			iconKind: 'quote',
			run: (ed) => ed.chain().focus().toggleBlockquote().run(),
		},
		{
			id: 'code',
			label: 'Code block',
			description: 'A formatted code snippet',
			aliases: ['code block', 'snippet', 'pre'],
			iconKind: 'code',
			run: (ed) => ed.chain().focus().toggleCodeBlock().run(),
		},
		{
			id: 'divider',
			label: 'Divider',
			description: 'A horizontal break',
			aliases: ['hr', 'horizontal rule', 'separator', 'line', 'break'],
			iconKind: 'divider',
			run: (ed) => ed.chain().focus().setHorizontalRule().run(),
		},
	];

	const filtered = $derived.by(() => {
		const q = query.toLowerCase().trim();
		if (!q) return COMMANDS;
		const matched: { cmd: SlashItem; score: number }[] = [];
		for (const cmd of COMMANDS) {
			const candidates = [cmd.label.toLowerCase(), cmd.id, ...cmd.aliases];
			let best = -1;
			for (const c of candidates) {
				const cLower = c.toLowerCase();
				if (cLower === q) best = Math.max(best, 3);
				else if (cLower.startsWith(q)) best = Math.max(best, 2);
				else if (cLower.includes(q)) best = Math.max(best, 1);
			}
			if (best >= 0) matched.push({ cmd, score: best });
		}
		matched.sort((a, b) => b.score - a.score);
		return matched.map((m) => m.cmd);
	});

	function update() {
		const ed = editor;
		if (!ed) {
			visible = false;
			return;
		}
		if (!ed.isFocused) {
			visible = false;
			return;
		}
		const { selection } = ed.state;
		if (!selection.empty) {
			visible = false;
			return;
		}
		const resolved = selection.$from;
		const parent = resolved.parent;
		if (parent.type.name !== 'paragraph') {
			visible = false;
			return;
		}
		const text = parent.textContent;
		// Reset the dismissed flag when the user moves to a new paragraph,
		// or when the leading "/" has been removed from the current one.
		const paragraphPos = resolved.before();
		if (dismissed) {
			if (dismissedParagraphPos !== paragraphPos || !text.startsWith('/')) {
				dismissed = false;
				dismissedParagraphPos = null;
			} else {
				visible = false;
				return;
			}
		}
		if (!text.startsWith('/')) {
			visible = false;
			return;
		}
		// Disallow trigger if there's a newline (paragraphs normally can't
		// contain hard \n, but be defensive about pasted content).
		if (text.includes('\n')) {
			visible = false;
			return;
		}
		// The slash text spans the whole paragraph; compute its document range.
		const from = paragraphPos + 1;
		const to = from + text.length;
		if (resolved.pos < from || resolved.pos > to) {
			visible = false;
			return;
		}
		triggerRange = { from, to };
		const nextQuery = text.slice(1);
		if (query !== nextQuery) {
			query = nextQuery;
			activeIndex = 0;
		}
		const coords = ed.view.coordsAtPos(resolved.pos);
		const scrollX = window.scrollX;
		const scrollY = window.scrollY;
		const menuHeight = listEl?.offsetHeight ?? 300;
		const menuWidth = listEl?.offsetWidth ?? 260;
		// Default below the cursor — flip above if there's no room.
		let nextTop = coords.bottom + scrollY + 6;
		if (coords.bottom + menuHeight + 12 > window.innerHeight) {
			nextTop = coords.top + scrollY - menuHeight - 6;
		}
		let nextLeft = coords.left + scrollX;
		if (nextLeft + menuWidth + 8 > scrollX + window.innerWidth) {
			nextLeft = scrollX + window.innerWidth - menuWidth - 8;
		}
		top = Math.max(scrollY + 4, nextTop);
		left = Math.max(scrollX + 4, nextLeft);
		visible = true;
	}

	$effect(() => {
		const ed = editor;
		if (!ed) return;
		const handler = () => requestAnimationFrame(update);
		ed.on('selectionUpdate', handler);
		ed.on('transaction', handler);
		ed.on('focus', handler);
		const blurHandler = () => {
			// Defer hide so click in the menu can still register.
			setTimeout(() => {
				visible = false;
			}, 150);
		};
		ed.on('blur', blurHandler);
		window.addEventListener('resize', handler);
		window.addEventListener('scroll', handler, true);
		return () => {
			ed.off('selectionUpdate', handler);
			ed.off('transaction', handler);
			ed.off('focus', handler);
			ed.off('blur', blurHandler);
			window.removeEventListener('resize', handler);
			window.removeEventListener('scroll', handler, true);
		};
	});

	// Keep activeIndex within bounds when filtered list changes.
	$effect(() => {
		if (filtered.length === 0) {
			activeIndex = 0;
		} else if (activeIndex >= filtered.length) {
			activeIndex = filtered.length - 1;
		}
	});

	// Scroll the highlighted item into view inside the popover when
	// keyboard navigation moves past the visible window.
	$effect(() => {
		if (!visible) return;
		const el = itemEls[activeIndex];
		el?.scrollIntoView({ block: 'nearest' });
	});

	// Register the keydown handler with the SlashCommand extension. We do
	// this with $effect so the latest reactive state is captured.
	$effect(() => {
		slashRef.onKeyDown = (event: KeyboardEvent) => handleKeyDown(event);
		return () => {
			slashRef.onKeyDown = () => false;
		};
	});

	function handleKeyDown(event: KeyboardEvent): boolean {
		if (!visible) return false;
		const list = filtered;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			if (list.length === 0) return true;
			activeIndex = (activeIndex + 1) % list.length;
			return true;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			if (list.length === 0) return true;
			activeIndex = (activeIndex - 1 + list.length) % list.length;
			return true;
		}
		if (event.key === 'Enter' || event.key === 'Tab') {
			if (list.length === 0) {
				// Let Enter create a paragraph normally if no matches.
				if (event.key === 'Tab') return true;
				return false;
			}
			event.preventDefault();
			executeCommand(list[activeIndex]);
			return true;
		}
		if (event.key === 'Escape') {
			event.preventDefault();
			dismissed = true;
			dismissedParagraphPos = currentParagraphPos();
			visible = false;
			return true;
		}
		return false;
	}

	function currentParagraphPos(): number | null {
		const ed = editor;
		if (!ed) return null;
		const resolved = ed.state.selection.$from;
		if (resolved.parent.type.name !== 'paragraph') return null;
		return resolved.before();
	}

	function executeCommand(cmd: SlashItem) {
		const ed = editor;
		if (!ed || !triggerRange) return;
		const range = triggerRange;
		// Clear the "/query" text so the inserted block starts clean. Use a
		// single chain so the deletion + command land as one undoable step.
		ed.chain().focus().deleteRange(range).run();
		triggerRange = null;
		visible = false;
		cmd.run(ed);
	}

	function selectByMouse(cmd: SlashItem) {
		executeCommand(cmd);
	}
</script>

<svelte:window
	onclick={(e) => {
		if (!visible) return;
		const target = e.target as HTMLElement;
		if (target.closest('.slash-menu-root')) return;
		visible = false;
	}} />

<div
	bind:this={listEl}
	class="slash-menu-root"
	class:visible
	style:top="{top}px"
	style:left="{left}px"
	role="listbox"
	tabindex="-1"
	aria-label="Insert content"
	onmousedown={(e) => e.preventDefault()}>
	{#if filtered.length === 0}
		<div class="sm-empty">No matches</div>
	{:else}
		{#each filtered as cmd, i (cmd.id)}
			<button
				bind:this={itemEls[i]}
				type="button"
				class="sm-item"
				class:active={i === activeIndex}
				role="option"
				aria-selected={i === activeIndex}
				onmousedown={(e) => e.preventDefault()}
				onmouseenter={() => (activeIndex = i)}
				onclick={() => selectByMouse(cmd)}>
				<span class="sm-icon">
					{#if cmd.iconKind === 'image'}
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
					{:else if cmd.iconKind === 'video'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16">
							<rect x="2" y="5" width="20" height="14" rx="2" />
							<polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
						</svg>
					{:else if cmd.iconKind === 'audio'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16">
							<path d="M9 18V5l12-2v13" />
							<circle cx="6" cy="18" r="3" />
							<circle cx="18" cy="16" r="3" />
						</svg>
					{:else if cmd.iconKind === 'h1'}
						<span class="sm-glyph">H1</span>
					{:else if cmd.iconKind === 'h2'}
						<span class="sm-glyph">H2</span>
					{:else if cmd.iconKind === 'h3'}
						<span class="sm-glyph">H3</span>
					{:else if cmd.iconKind === 'bullet'}
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
					{:else if cmd.iconKind === 'ordered'}
						<span class="sm-glyph">1.</span>
					{:else if cmd.iconKind === 'quote'}
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
					{:else if cmd.iconKind === 'code'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16">
							<polyline points="16 18 22 12 16 6" />
							<polyline points="8 6 2 12 8 18" />
						</svg>
					{:else if cmd.iconKind === 'divider'}
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="16"
							height="16">
							<line x1="3" y1="12" x2="21" y2="12" />
						</svg>
					{/if}
				</span>
				<span class="sm-label">{cmd.label}</span>
				<span class="sm-desc">{cmd.description}</span>
			</button>
		{/each}
	{/if}
</div>

<style>
	.slash-menu-root {
		position: absolute;
		z-index: 4;
		min-width: 260px;
		max-width: 320px;
		max-height: 320px;
		overflow-y: auto;
		padding: var(--space-1);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		opacity: 0;
		transform: translateY(2px);
		transition:
			opacity 100ms ease,
			transform 100ms ease;
		pointer-events: none;
		font-size: var(--text-sm);
	}
	.slash-menu-root.visible {
		opacity: 1;
		transform: translateY(0);
		pointer-events: auto;
	}

	.sm-empty {
		padding: var(--space-3);
		color: var(--color-text-muted);
		font-size: var(--text-xs);
		text-align: center;
	}

	.sm-item {
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
	.sm-item.active,
	.sm-item:hover {
		transition-duration: 0s;
		background: var(--color-bg-secondary);
	}

	.sm-icon {
		grid-area: icon;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-secondary);
	}
	.sm-glyph {
		font-weight: 700;
		font-size: var(--text-xs);
	}
	.sm-label {
		grid-area: label;
		font-weight: 500;
		font-size: var(--text-sm);
	}
	.sm-desc {
		grid-area: desc;
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.slash-menu-root {
			min-width: 220px;
		}
	}
</style>
