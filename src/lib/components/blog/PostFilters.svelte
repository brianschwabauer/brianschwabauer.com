<script lang="ts">
	import { ripple } from '@delightstack/utilities';

	interface Props {
		tags: string[];
		activeTag: string | null;
		onChange: (tag: string | null) => void;
	}

	let { tags, activeTag, onChange }: Props = $props();
</script>

<div class="filters">
	<button
		class="filter-btn"
		class:active={activeTag === null}
		onclick={() => onChange(null)}
		{@attach ripple({ zIndex: 1 })}>
		All Posts
	</button>
	{#each tags as tag (tag)}
		<button
			class="filter-btn"
			class:active={activeTag === tag}
			onclick={() => onChange(tag)}
			{@attach ripple({ zIndex: 1 })}>
			{tag}
		</button>
	{/each}
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		justify-content: center;
	}

	.filter-btn {
		/* position + overflow so the ripple overlay is anchored inside the chip
		   and clipped to the pill shape. */
		position: relative;
		overflow: hidden;
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast),
			border-color var(--transition-fast),
			transform 200ms ease;
	}

	.filter-btn:hover {
		transition-duration: 0s;
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	/* Same press-down recipe as delightstack <Button>, but using the
	   `perspective()` transform function so each chip is its own vanishing
	   point — otherwise a shared `perspective` on the parent makes edge
	   chips tip toward the row's center instead of pushing straight back. */
	.filter-btn:active:not(:disabled) {
		transform: perspective(100px)
			translate3d(0, 1px, clamp(-10px, calc(0.2em - 12px), -2px));
	}

	.filter-btn.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}
</style>
