<script lang="ts">
	import type { TimelineEntry } from '$lib/server/db/schema';

	interface Props {
		entry: TimelineEntry;
		side: 'left' | 'right';
	}

	let { entry, side }: Props = $props();

	const categoryColors = {
		development: '#00b4a0',
		videography: '#8b5cf6',
		life: '#f59e0b'
	};

	const categoryLabels = {
		development: 'Development',
		videography: 'Videography',
		life: 'Life'
	};

	function formatMonth(month: number | null) {
		if (!month) return '';
		const months = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];
		return months[month - 1] || '';
	}
</script>

<article class="timeline-entry {side}" style="--category-color: {categoryColors[entry.category]}">
	<div class="entry-dot"></div>

	<div class="entry-content">
		<div class="entry-header">
			<span class="entry-category">{categoryLabels[entry.category]}</span>
			{#if entry.month}
				<span class="entry-month">{formatMonth(entry.month)}</span>
			{/if}
		</div>

		<h3 class="entry-title">{entry.title}</h3>

		{#if entry.descriptionHtml}
			<div class="entry-description">{@html entry.descriptionHtml}</div>
		{:else if entry.description}
			<p class="entry-description">{entry.description}</p>
		{/if}

		{#if entry.mediaUrl && entry.mediaType !== 'none'}
			<div class="entry-media">
				{#if entry.mediaType === 'image'}
					<img src={entry.mediaUrl} alt={entry.title} loading="lazy" />
				{:else if entry.mediaType === 'video'}
					<video src={entry.mediaUrl} controls preload="metadata"></video>
				{/if}
			</div>
		{/if}
	</div>
</article>

<style>
	.timeline-entry {
		position: relative;
		padding: var(--space-4) 0;
		width: calc(50% - 40px);
		opacity: 0;
		transform: translateY(30px);
		animation: reveal 0.6s ease forwards;
		animation-play-state: paused;
	}

	/* Trigger animation when visible */
	.timeline-entry:global(.visible) {
		animation-play-state: running;
	}

	.timeline-entry.left {
		margin-right: auto;
		text-align: right;
		padding-right: var(--space-8);
	}

	.timeline-entry.right {
		margin-left: auto;
		text-align: left;
		padding-left: var(--space-8);
	}

	@media (max-width: 768px) {
		.timeline-entry {
			width: calc(100% - 40px);
			margin-left: auto !important;
			text-align: left !important;
			padding-left: var(--space-8) !important;
			padding-right: 0 !important;
		}
	}

	.entry-dot {
		position: absolute;
		top: var(--space-6);
		width: 16px;
		height: 16px;
		background: var(--category-color);
		border-radius: 50%;
		border: 3px solid var(--color-bg);
		box-shadow: 0 0 0 2px var(--category-color);
	}

	.timeline-entry.left .entry-dot {
		right: -48px;
	}

	.timeline-entry.right .entry-dot {
		left: -48px;
	}

	@media (max-width: 768px) {
		.entry-dot {
			left: -48px !important;
			right: auto !important;
		}
	}

	.entry-content {
		background: rgba(26, 26, 26, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
		font-size: var(--text-sm);
	}

	.timeline-entry.left .entry-header {
		justify-content: flex-end;
	}

	@media (max-width: 768px) {
		.entry-header {
			justify-content: flex-start !important;
		}
	}

	.entry-category {
		padding: var(--space-1) var(--space-3);
		background: var(--category-color);
		border-radius: var(--radius-full);
		color: white;
		font-weight: 500;
	}

	.entry-month {
		color: var(--color-text-muted);
	}

	.entry-title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-3);
		color: var(--color-text);
	}

	.entry-description {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: 0;
	}

	.entry-description :global(p) {
		margin-bottom: var(--space-3);
	}

	.entry-description :global(p:last-child) {
		margin-bottom: 0;
	}

	.entry-media {
		margin-top: var(--space-4);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.entry-media img,
	.entry-media video {
		width: 100%;
		display: block;
	}

	@keyframes reveal {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
