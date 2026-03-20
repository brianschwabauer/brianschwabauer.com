<script lang="ts">
	const creeds = [
		{
			title: 'Simplicity over complexity',
			description:
				"The best solutions are often the simplest ones. I've learned to resist over-engineering and focus on what truly matters."
		},
		{
			title: 'Ship early, iterate often',
			description:
				"Perfect is the enemy of good. Getting something into users' hands quickly and improving based on feedback beats endless planning."
		},
		{
			title: 'Code is communication',
			description:
				'Every line of code tells a story. Writing clean, readable code means respecting the next person who will maintain it—including future me.'
		},
		{
			title: 'Learn by building',
			description:
				'Tutorials only take you so far. Real learning happens when you tackle problems you don\'t know how to solve yet.'
		},
		{
			title: 'Embrace the uncomfortable',
			description:
				"Growth happens at the edge of your comfort zone. The projects that scare you a little are usually the ones worth doing."
		}
	];
</script>

<section class="creed">
	<div class="creed-inner">
		<h2 class="creed-heading scroll-reveal">
			How I approach<br />
			<i class="accent">every project</i>
			<!-- <span class="accent">I've learned a few things</span> -->
		</h2>

		<div class="creed-list">
			{#each creeds as creed, i}
				<article
					class="creed-item scroll-reveal"
					style="--delay: {i * 100}ms"
				>
					<span class="creed-number">{String(i + 1).padStart(2, '0')}</span>
					<div class="creed-content">
						<h3 class="creed-title">{creed.title}</h3>
						<p class="creed-description">{creed.description}</p>
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.creed {
		padding: var(--space-24) 0;
		background: var(--color-bg-secondary);
	}

	.creed-inner {
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	@media (min-width: 768px) {
		.creed-inner {
			padding: 0 var(--space-8);
		}
	}

	.creed-heading {
		font-size: var(--text-3xl);
		font-weight: 700;
		text-align: center;
		margin-bottom: var(--space-16);
		line-height: var(--leading-tight);
	}

	@media (min-width: 768px) {
		.creed-heading {
			font-size: var(--text-4xl);
		}
	}

	.accent {
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.creed-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
	}

	.creed-item {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-6);
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
	}

	.creed-item:hover {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 4px var(--color-accent-light);
	}

	@media (min-width: 768px) {
		.creed-item {
			gap: var(--space-6);
			padding: var(--space-8);
		}
	}

	.creed-number {
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-accent);
		opacity: 0.5;
		line-height: 1;
		flex-shrink: 0;
	}

	.creed-content {
		flex: 1;
	}

	.creed-title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.creed-description {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin: 0;
	}

	/* Fallback for browsers without scroll-driven animations */
	@supports not (animation-timeline: view()) {
		.creed-item {
			opacity: 1;
			transform: none;
		}
	}
</style>
