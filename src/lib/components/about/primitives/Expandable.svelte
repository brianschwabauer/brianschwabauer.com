<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		label = 'Learn more',
		closeLabel = 'Show less',
		variant = 'subtle',
		class: klass = '',
	}: {
		children: Snippet;
		label?: string;
		closeLabel?: string;
		variant?: 'subtle' | 'bold' | 'ghost';
		class?: string;
	} = $props();

	let open = $state(false);
</script>

<div class="expandable {klass}" class:open>
	<button
		class="toggle {variant}"
		type="button"
		aria-expanded={open}
		onclick={() => (open = !open)}>
		<span>{open ? closeLabel : label}</span>
		<svg viewBox="0 0 24 24" aria-hidden="true" class="chev" class:rotated={open}>
			<path
				d="M6 9l6 6 6-6"
				fill="none"
				stroke="currentColor"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round" />
		</svg>
	</button>
	<div class="content" hidden={!open}>
		{@render children()}
	</div>
</div>

<style>
	.expandable {
		display: block;
	}
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.1rem;
		font: inherit;
		font-weight: 600;
		letter-spacing: 0.02em;
		border-radius: 999px;
		cursor: pointer;
		transition:
			background 200ms ease,
			transform 200ms ease,
			color 200ms ease;
	}
	.toggle.subtle {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.15);
	}
	.toggle.subtle:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.14);
		transform: translateY(-1px);
	}
	.toggle.bold {
		background: var(--color-accent, #00b4a0);
		color: #fff;
		border: 0;
	}
	.toggle.bold:hover {
		transition-duration: 0s;
		filter: brightness(1.1);
		transform: translateY(-1px);
	}
	.toggle.ghost {
		background: transparent;
		color: inherit;
		border: 1px dashed currentColor;
		opacity: 0.85;
	}
	.toggle.ghost:hover {
		transition-duration: 0s;
		opacity: 1;
	}
	.chev {
		width: 16px;
		height: 16px;
		transition: transform 250ms ease;
	}
	.chev.rotated {
		transform: rotate(180deg);
	}
	.content {
		margin-top: 1.25rem;
		animation: slide 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes slide {
		from {
			opacity: 0;
			transform: translateY(-12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
