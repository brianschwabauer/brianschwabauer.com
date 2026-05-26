<script lang="ts" module>
	export interface NotifyOptions {
		title?: string;
		message: string;
		dismissText?: string;
		tone?: 'info' | 'error';
	}

	/**
	 * Programmatic replacement for native window.alert(). Mounts a single-button
	 * acknowledgement modal and resolves when dismissed. Mirrors the pattern
	 * used by @delightstack/components Alert.alert().
	 */
	export async function notify(options: NotifyOptions): Promise<void> {
		const { mount, unmount } = await import('svelte');
		const mod = await import('./NotifyDialog.svelte');
		const NotifyComponent = mod.default;

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
				title: options.title ?? 'Notice',
				message: options.message,
				dismissText: options.dismissText ?? 'OK',
				tone: options.tone ?? 'info',
				ondismiss: () => cleanup(),
			});

			function cleanup() {
				resolve();
				try {
					unmount(instance);
				} catch {
					// already unmounted
				}
				wrapper.remove();
			}

			instance = mount(NotifyComponent, { target: wrapper, props });

			requestAnimationFrame(() => {
				props.open = true;
			});
		});
	}
</script>

<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';

	let {
		open = $bindable(false) as boolean,
		title = 'Notice',
		message = '',
		dismissText = 'OK',
		tone = 'info' as 'info' | 'error',
		ondismiss = undefined as (() => void) | undefined,
	} = $props();

	function handleDismiss() {
		open = false;
		ondismiss?.();
	}
</script>

<Modal
	bind:open
	title=""
	closable
	disableCloseIcon
	width="400px"
	maxWidth="calc(100vw - 2rem)"
	onclose={() => {
		handleDismiss();
		return true;
	}}
	onbackdropclick={handleDismiss}
	class="notify-modal">
	<div class="notify" class:error={tone === 'error'}>
		{#if title}
			<h3 class="notify-title">{title}</h3>
		{/if}
		<p class="notify-message">{message}</p>
		<div class="notify-actions">
			<Button
				accent={tone !== 'error'}
				error={tone === 'error'}
				fullWidth
				onclick={handleDismiss}>
				{dismissText}
			</Button>
		</div>
	</div>
</Modal>

<style>
	.notify {
		text-align: center;
		padding: 0.5rem 0;
	}

	.notify-title {
		font-size: var(--text-lg, 1.125rem);
		font-weight: 600;
		color: var(--color-text);
		margin: 0 0 0.5rem;
	}

	.notify.error .notify-title {
		color: var(--color-error);
	}

	.notify-message {
		font-size: var(--text-base, 1rem);
		color: var(--color-text-muted);
		line-height: 1.5;
		margin: 0;
	}

	.notify-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 1.5rem;
	}
</style>
