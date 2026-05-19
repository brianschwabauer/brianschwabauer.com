<script lang="ts">
	interface Props {
		tags: string[];
		activeTag: string | null;
		onChange: (tag: string | null) => void;
	}

	let { tags, activeTag, onChange }: Props = $props();
</script>

<div class="filters">
	<button class="filter-btn" class:active={activeTag === null} onclick={() => onChange(null)}>
		All Posts
	</button>
	{#each tags as tag (tag)}
		<button
			class="filter-btn"
			class:active={activeTag === tag}
			onclick={() => onChange(tag)}
		>
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
