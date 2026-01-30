<script lang="ts">
	interface Props {
		activeFilter: 'all' | 'development' | 'videography' | 'life';
		onChange: (filter: 'all' | 'development' | 'videography' | 'life') => void;
	}

	let { activeFilter, onChange }: Props = $props();

	const filters = [
		{ value: 'all' as const, label: 'All' },
		{ value: 'development' as const, label: 'Development', color: '#00b4a0' },
		{ value: 'videography' as const, label: 'Videography', color: '#8b5cf6' },
		{ value: 'life' as const, label: 'Life', color: '#f59e0b' }
	];
</script>

<div class="timeline-filter">
	{#each filters as filter}
		<button
			class="filter-btn"
			class:active={activeFilter === filter.value}
			style={filter.color ? `--filter-color: ${filter.color}` : ''}
			onclick={() => onChange(filter.value)}
		>
			{#if filter.color}
				<span class="filter-dot"></span>
			{/if}
			{filter.label}
		</button>
	{/each}
</div>

<style>
	.timeline-filter {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-4);
		background: rgba(26, 26, 26, 0.8);
		backdrop-filter: blur(10px);
		border-radius: var(--radius-full);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.filter-btn {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		background: transparent;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.filter-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-text);
	}

	.filter-btn.active {
		background: rgba(255, 255, 255, 0.15);
		color: var(--color-text);
	}

	.filter-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--filter-color);
	}
</style>
