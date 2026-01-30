<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		title?: string;
		onClose?: () => void;
		children: Snippet;
	}

	let { open = $bindable(), title, onClose, children }: Props = $props();

	function handleClose() {
		open = false;
		onClose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			handleClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}

	$effect(() => {
		if (typeof document !== 'undefined') {
			if (open) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
		<div class="modal" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
			{#if title}
				<div class="modal-header">
					<h2 id="modal-title" class="modal-title">{title}</h2>
					<button class="modal-close" onclick={handleClose} aria-label="Close modal">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
			{:else}
				<button class="modal-close absolute" onclick={handleClose} aria-label="Close modal">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			{/if}
			<div class="modal-content">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(4px);
		z-index: var(--z-modal-backdrop);
		animation: fade-in 200ms ease;
	}

	.modal {
		position: relative;
		width: 100%;
		max-width: 500px;
		max-height: calc(100vh - var(--space-8));
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		overflow: hidden;
		animation: scale-in 250ms ease;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-6);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0;
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.modal-close:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.modal-close svg {
		width: 20px;
		height: 20px;
	}

	.modal-close.absolute {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		z-index: 1;
	}

	.modal-content {
		padding: var(--space-6);
		overflow-y: auto;
		max-height: calc(100vh - var(--space-8) - 60px);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
