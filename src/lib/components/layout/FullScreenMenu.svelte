<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		open: boolean;
		links: { href: string; label: string }[];
	}

	let { open = $bindable(), links }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
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
	<div class="menu-backdrop" onclick={() => (open = false)} role="presentation"></div>
	<nav class="menu" role="navigation">
		<ul class="menu-list">
			{#each links as link, i}
				<li class="menu-item" style="--delay: {i * 50}ms">
					<a
						href={link.href}
						class="menu-link"
						class:active={page.url.pathname === link.href}
						onclick={() => (open = false)}>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.menu-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: var(--z-modal-backdrop);
		animation: fade-in 200ms ease;
	}

	.menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(320px, 80vw);
		background: var(--color-surface);
		z-index: var(--z-modal);
		padding: var(--space-20) var(--space-8);
		animation: slide-in 300ms ease;
	}

	.menu-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.menu-item {
		animation: fade-slide-in 300ms ease backwards;
		animation-delay: var(--delay);
	}

	.menu-link {
		display: block;
		font-size: var(--text-2xl);
		font-weight: 600;
		color: var(--color-text);
		padding: var(--space-3) 0;
		transition:
			color var(--transition-fast),
			transform var(--transition-fast);
	}

	.menu-link:hover,
	.menu-link.active {
		color: var(--color-accent);
		transform: translateX(var(--space-2));
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slide-in {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes fade-slide-in {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
