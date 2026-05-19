<script lang="ts">
	import { flushSync, onMount, onDestroy, untrack } from 'svelte';
	import { Editor, Extension } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	interface Props {
		value: string;
		placeholder?: string;
		onChange?: (value: string) => void;
		/** Fired when the user presses Enter at the end of the title (to advance focus). */
		onEnter?: () => void;
	}

	let {
		value = $bindable(''),
		placeholder = 'Enter post title…',
		onChange,
		onEnter,
	}: Props = $props();

	let element: HTMLElement;
	let editor: Editor | null = $state(null);
	// Snapshot the value at construction so the SSR fallback paints the right
	// title text even if `value` changes before TipTap mounts.
	const initialValue = untrack(() => value);
	// Flipped right before TipTap mounts so the {#if !mounted} SSR fallback is
	// removed synchronously and the swap doesn't double-paint the title.
	let mounted = $state(false);
	let isEmpty = $state(value.trim().length === 0);

	// A title is a single paragraph: pressing Enter (or Shift-Enter) never
	// inserts a node — it just fires onEnter so the parent advances focus.
	const SingleLine = Extension.create({
		name: 'singleLine',
		addKeyboardShortcuts() {
			return {
				Enter: () => {
					onEnter?.();
					return true;
				},
				'Shift-Enter': () => {
					onEnter?.();
					return true;
				},
				'Mod-Enter': () => {
					onEnter?.();
					return true;
				},
			};
		},
	});

	onMount(() => {
		// Flip `mounted` first and flush so Svelte removes the SSR fallback
		// before TipTap claims the same host.
		mounted = true;
		flushSync();
		// Defensive: clear any stray content in case the host wasn't empty.
		element.innerHTML = '';
		editor = new Editor({
			element,
			extensions: [
				// Strip out every block / mark / nodeview we don't want in a title.
				// What remains: Document, Paragraph, Text, History.
				StarterKit.configure({
					heading: false,
					bulletList: false,
					orderedList: false,
					listItem: false,
					blockquote: false,
					codeBlock: false,
					horizontalRule: false,
					hardBreak: false,
					bold: false,
					italic: false,
					strike: false,
					code: false,
				}),
				SingleLine,
			],
			content: value
				? {
						type: 'doc',
						content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }],
					}
				: '',
			editorProps: {
				attributes: { class: 'title-pm' },
				handlePaste: (view, event) => {
					// Collapse any pasted whitespace/newlines into a single line — the
					// title is intentionally one paragraph only.
					const text = event.clipboardData?.getData('text/plain') ?? '';
					if (!text) return false;
					event.preventDefault();
					const cleaned = text.replace(/\s+/g, ' ').trim();
					view.dispatch(view.state.tr.insertText(cleaned));
					return true;
				},
			},
			onUpdate: ({ editor }) => {
				const next = editor.getText();
				isEmpty = next.trim().length === 0;
				value = next;
				onChange?.(next);
			},
		});
	});

	onDestroy(() => editor?.destroy());

	export function focus() {
		editor?.commands.focus('end');
	}
</script>

<div class="title-editor" class:is-empty={isEmpty}>
	<div bind:this={element} class="title-host">
		{#if !mounted && initialValue}
			<div class="title-pm" aria-hidden="true"><p>{initialValue}</p></div>
		{/if}
	</div>
	{#if isEmpty}
		<div class="title-placeholder" aria-hidden="true">{placeholder}</div>
	{/if}
</div>

<style>
	.title-editor {
		position: relative;
		max-width: var(--measure);
		margin: 0 auto var(--space-4);
	}

	/* Typography lives by itself so it isn't shadowed by the focus reset's
	   higher specificity — without this split, the :focus rule's font-size
	   would override the desktop media query and the title would shrink the
	   moment the user clicks into it. */
	.title-host :global(.title-pm),
	.title-host :global(.ProseMirror) {
		min-height: 1.2em;
		color: var(--color-text);
		/* Match the public post title styling so this is true WYSIWYG. */
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		font-family: var(--font-sans);
		word-break: break-word;
		background: transparent;
	}

	@media (min-width: 768px) {
		.title-host :global(.title-pm),
		.title-host :global(.ProseMirror) {
			font-size: 3rem;
		}
	}

	/* Focus reset only — never touches sizing. */
	.title-host :global(.title-pm),
	.title-host :global(.title-pm:focus),
	.title-host :global(.title-pm:focus-visible),
	.title-host :global(.ProseMirror),
	.title-host :global(.ProseMirror:focus),
	.title-host :global(.ProseMirror:focus-visible) {
		outline: none;
		box-shadow: none;
		border: none;
	}

	.title-host :global(.title-pm p) {
		margin: 0;
	}

	.title-placeholder {
		position: absolute;
		inset: 0;
		pointer-events: none;
		color: var(--color-text-muted);
		font-size: 2.5rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		font-family: var(--font-sans);
	}

	@media (min-width: 768px) {
		.title-placeholder {
			font-size: 3rem;
		}
	}
</style>
