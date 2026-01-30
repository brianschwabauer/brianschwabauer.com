<script lang="ts">
	interface Props {
		categories: string[];
		activeCategory: string | null;
		onChange: (category: string | null) => void;
	}

	let { categories, activeCategory, onChange }: Props = $props();
</script>

<div class="filters">
	<button class="filter-btn" class:active={activeCategory === null} onclick={() => onChange(null)}>
		All Posts
	</button>
	{#each categories as category}
		<button
			class="filter-btn"
			class:active={activeCategory === category}
			onclick={() => onChange(category)}
		>
			{category}
		</button>
	{/each}
</div>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.filter-btn {
		padding: var(--space-2) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		transition: background-color var(--transition-fast), color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.filter-btn:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.filter-btn.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}
</style>
