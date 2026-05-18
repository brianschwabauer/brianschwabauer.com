<script lang="ts" module>
	export interface PromptOptions {
		title?: string;
		message?: string;
		value?: string;
		placeholder?: string;
		multiline?: boolean;
		confirmText?: string;
		cancelText?: string;
	}

	/**
	 * Programmatic replacement for native window.prompt(). Mounts a modal with a
	 * single text field and resolves to the entered string (or `null` if cancelled).
	 * Mirrors the pattern used by @delightstack/components Alert.alert().
	 */
	export async function prompt(options: PromptOptions = {}): Promise<string | null> {
		const { mount, unmount } = await import('svelte');
		const mod = await import('./PromptDialog.svelte');
		const PromptComponent = mod.default;

		return new Promise((resolve) => {
			let container = document.querySelector('.portals');
			if (!container) {
				container = document.createElement('div');
				container.classList.add('portals');
				document.body.appendChild(container);
			}
			const wrapper = document.createElement('div');
			container.appendChild(wrapper);

			let instance: Record<string, unknown>;

			const props = $state({
				open: false,
				title: options.title ?? 'Edit',
				message: options.message ?? '',
				value: options.value ?? '',
				placeholder: options.placeholder ?? '',
				multiline: options.multiline ?? false,
				confirmText: options.confirmText ?? 'Save',
				cancelText: options.cancelText ?? 'Cancel',
				oncancel: () => cleanup(null),
				onconfirm: (next: string) => cleanup(next),
			});

			function cleanup(result: string | null) {
				resolve(result);
				try {
					unmount(instance);
				} catch {
					// already unmounted
				}
				wrapper.remove();
			}

			instance = mount(PromptComponent, { target: wrapper, props });

			requestAnimationFrame(() => {
				props.open = true;
			});
		});
	}
</script>

<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';

	let {
		open = $bindable(false) as boolean,
		title = 'Edit',
		message = '',
		value = $bindable(''),
		placeholder = '',
		multiline = false,
		confirmText = 'Save',
		cancelText = 'Cancel',
		oncancel = undefined as (() => void) | undefined,
		onconfirm = undefined as ((value: string) => void) | undefined,
	} = $props();

	let inputEl: HTMLElement | undefined = $state();

	// Focus + select the input on open so the user can start typing immediately
	// (matching native prompt() ergonomics).
	$effect(() => {
		if (!open || !inputEl) return;
		// Modal mounts on the next frame; wait one tick so the field exists.
		queueMicrotask(() => {
			const field = inputEl?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
				'input, textarea',
			);
			if (!field) return;
			field.focus();
			field.select();
		});
	});

	function handleCancel() {
		open = false;
		oncancel?.();
	}

	function handleConfirm() {
		open = false;
		onconfirm?.(value);
	}

	function handleKey(event: KeyboardEvent) {
		// In single-line mode, Enter confirms. In multiline, only Cmd/Ctrl+Enter
		// confirms so newlines are still typeable.
		if (event.key !== 'Enter') return;
		if (multiline && !(event.metaKey || event.ctrlKey)) return;
		event.preventDefault();
		handleConfirm();
	}
</script>

<Modal
	bind:open
	title=""
	closable
	disableCloseIcon
	width="440px"
	maxWidth="calc(100vw - 2rem)"
	onclose={() => {
		handleCancel();
		return true;
	}}
	onbackdropclick={handleCancel}
	class="prompt-modal">
	<div class="prompt">
		<h3 class="prompt-title">{title}</h3>
		{#if message}
			<p class="prompt-message">{message}</p>
		{/if}
		<div class="prompt-field" bind:this={inputEl} onkeydown={handleKey} role="presentation">
			<Input
				type={multiline ? 'textarea' : 'text'}
				bind:value
				{placeholder} />
		</div>
		<div class="prompt-actions">
			<Button translucent onclick={handleCancel}>{cancelText}</Button>
			<Button accent onclick={handleConfirm}>{confirmText}</Button>
		</div>
	</div>
</Modal>

<style>
	.prompt {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-2) 0;
	}

	.prompt-title {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.prompt-message {
		font-size: var(--text-sm, 0.9375rem);
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}

	.prompt-field :global(textarea) {
		min-height: 6rem;
	}

	.prompt-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-top: var(--space-2);
	}
</style>
