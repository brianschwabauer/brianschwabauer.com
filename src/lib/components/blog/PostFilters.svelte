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

	/* Registered so the press depth interpolates on its own transition
	   entry — the hover rule's 0s durations can't touch it (see
	   PostCard.svelte for the full recipe). */
	@property --press {
		syntax: '<number>';
		inherits: false;
		initial-value: 0;
	}

	.filter-btn {
		/* position + overflow so the ripple overlay is anchored inside the chip
		   and clipped to the pill shape. */
		position: relative;
		overflow: hidden;
		padding: var(--space-2) var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		/* Same press-down recipe as delightstack <Button>, but using the
		   `perspective()` transform function so each chip is its own vanishing
		   point — otherwise a shared `perspective` on the parent makes edge
		   chips tip toward the row's center instead of pushing straight back. */
		transform: perspective(100px)
			translate3d(
				0,
				calc(var(--press) * 1px),
				calc(var(--press) * clamp(-10px, 0.2em - 12px, -2px))
			);
		transition:
			background-color var(--duration-slow),
			color var(--duration-slow),
			border-color var(--duration-slow),
			--press 200ms ease;
	}

	.filter-btn:hover {
		/* Instant hover-in for everything except --press, which keeps its
		   duration so the :active depress animates even while hovered. */
		transition-duration: 0s, 0s, 0s, 200ms;
		background: var(--color-bg-muted);
		color: var(--color-text);
	}

	.filter-btn:active:not(:disabled) {
		--press: 1;
	}

	.filter-btn.active {
		background: var(--color-action);
		border-color: var(--color-action);
		color: white;
	}
</style>
