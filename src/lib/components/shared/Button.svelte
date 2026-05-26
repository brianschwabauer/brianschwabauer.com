<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	interface BaseProps {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		children: Snippet;
	}

	type ButtonProps = BaseProps &
		HTMLButtonAttributes & {
			href?: never;
		};

	type AnchorProps = BaseProps &
		HTMLAnchorAttributes & {
			href: string;
		};

	type Props = ButtonProps | AnchorProps;

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		children,
		href,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a {href} class="btn {variant} {size}" class:loading {...rest}>
		{#if loading}
			<span class="spinner"></span>
		{/if}
		<span class="btn-content" class:invisible={loading}>
			{@render children()}
		</span>
	</a>
{:else}
	<button
		class="btn {variant} {size}"
		class:loading
		disabled={loading || rest.disabled}
		{...rest}>
		{#if loading}
			<span class="spinner"></span>
		{/if}
		<span class="btn-content" class:invisible={loading}>
			{@render children()}
		</span>
	</button>
{/if}

<style>
	.btn {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		font-weight: 500;
		border-radius: var(--radius-md);
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		cursor: pointer;
		text-decoration: none;
	}

	.btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	/* Sizes */
	.btn.sm {
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
	}

	.btn.md {
		padding: var(--space-3) var(--space-5);
		font-size: var(--text-base);
	}

	.btn.lg {
		padding: var(--space-4) var(--space-8);
		font-size: var(--text-lg);
	}

	/* Variants */
	.btn.primary {
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		color: white;
		box-shadow: 0 2px 8px rgba(0, 180, 160, 0.3);
	}

	.btn.primary:hover:not(:disabled) {
		box-shadow: 0 4px 16px rgba(0, 180, 160, 0.4);
		transform: translateY(-1px);
	}

	.btn.secondary {
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
	}

	.btn.secondary:hover:not(:disabled) {
		background: var(--color-bg-secondary);
		border-color: var(--color-accent);
	}

	.btn.ghost {
		background: transparent;
		color: var(--color-text);
	}

	.btn.ghost:hover:not(:disabled) {
		background: var(--color-accent-light);
		color: var(--color-accent);
	}

	.btn.danger {
		background: var(--color-error);
		color: white;
	}

	.btn.danger:hover:not(:disabled) {
		background: #dc2626;
	}

	/* Loading state */
	.btn.loading {
		cursor: not-allowed;
	}

	.btn-content {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.btn-content.invisible {
		visibility: hidden;
	}

	.spinner {
		position: absolute;
		width: 16px;
		height: 16px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.75s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Disabled state */
	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
