<script lang="ts">
	import { onMount } from 'svelte';
	import TimelineEntry from './TimelineEntry.svelte';
	import YearMarker from './YearMarker.svelte';
	import TimelineFilter from './TimelineFilter.svelte';
	import type { TimelineEntry as TimelineEntryType } from '$lib/server/db/schema';

	interface Props {
		entries: TimelineEntryType[];
	}

	let { entries }: Props = $props();

	let activeFilter = $state<'all' | 'development' | 'videography' | 'life'>('all');
	let entryElements: HTMLElement[] = [];

	// Group entries by year (descending - present to past)
	const entriesByYear = $derived(() => {
		const filtered =
			activeFilter === 'all' ? entries : entries.filter((e) => e.category === activeFilter);

		const grouped: Record<number, TimelineEntryType[]> = {};

		for (const entry of filtered) {
			if (!grouped[entry.year]) {
				grouped[entry.year] = [];
			}
			grouped[entry.year].push(entry);
		}

		// Sort years descending (newest first)
		const years = Object.keys(grouped)
			.map(Number)
			.sort((a, b) => b - a);

		return years.map((year) => ({
			year,
			entries: grouped[year].sort((a, b) => {
				// Sort by month descending within year
				if (a.month && b.month) return b.month - a.month;
				if (a.month) return -1;
				if (b.month) return 1;
				return b.sortOrder - a.sortOrder;
			})
		}));
	});

	onMount(() => {
		// Set up intersection observer for reveal animations
		const observer = new IntersectionObserver(
			(observedEntries) => {
				for (const entry of observedEntries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				}
			},
			{
				threshold: 0.2,
				rootMargin: '0px 0px -10% 0px'
			}
		);

		// Observe all timeline entries
		for (const el of entryElements) {
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	});
</script>

<div class="timeline-container">
	<div class="filter-sticky">
		<TimelineFilter {activeFilter} onChange={(f) => (activeFilter = f)} />
	</div>

	<div class="timeline">
		<div class="timeline-line"></div>

		{#each entriesByYear() as yearGroup, yearIndex}
			<YearMarker year={yearGroup.year} />

			{#each yearGroup.entries as entry, entryIndex}
				{@const globalIndex =
					entriesByYear()
						.slice(0, yearIndex)
						.reduce((acc, g) => acc + g.entries.length, 0) + entryIndex}
				<div bind:this={entryElements[globalIndex]}>
					<TimelineEntry {entry} side={entryIndex % 2 === 0 ? 'left' : 'right'} />
				</div>
			{/each}
		{/each}

		{#if entriesByYear().length === 0}
			<div class="empty-state">
				<p>No entries found for this filter.</p>
			</div>
		{/if}

		<div class="timeline-end">
			<div class="end-marker">The Journey Continues...</div>
		</div>
	</div>
</div>

<style>
	.timeline-container {
		position: relative;
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	@media (min-width: 768px) {
		.timeline-container {
			padding: 0 var(--space-8);
		}
	}

	.filter-sticky {
		position: sticky;
		top: 100px;
		z-index: 10;
		display: flex;
		justify-content: center;
		margin-bottom: var(--space-12);
	}

	.timeline {
		position: relative;
		padding: var(--space-8) 0 var(--space-24);
	}

	.timeline-line {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 2px;
		transform: translateX(-50%);
		background: linear-gradient(
			180deg,
			transparent 0%,
			rgba(0, 180, 160, 0.5) 10%,
			rgba(0, 180, 160, 0.5) 90%,
			transparent 100%
		);
	}

	@media (max-width: 768px) {
		.timeline-line {
			left: 20px;
			transform: none;
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-16);
		color: var(--color-text-muted);
	}

	.timeline-end {
		display: flex;
		justify-content: center;
		padding-top: var(--space-12);
	}

	.end-marker {
		padding: var(--space-4) var(--space-8);
		background: rgba(26, 26, 26, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 180, 160, 0.3);
		border-radius: var(--radius-full);
		color: var(--color-accent);
		font-weight: 500;
	}
</style>
