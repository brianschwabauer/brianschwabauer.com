<script lang="ts">
	import ProjectCard from '$lib/components/projects/ProjectCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Projects - Brian Schwabauer</title>
	<meta name="description" content="A showcase of my best work, from web apps to creative projects." />
</svelte:head>

<div class="projects-page">
	<header class="projects-header">
		<h1 class="projects-title">Projects</h1>
		<p class="projects-subtitle">
			A curated selection of my best work. Each project represents a unique challenge and learning experience.
		</p>
	</header>

	{#if data.projects.length > 0}
		<div class="projects-grid">
			{#each data.projects as project (project.id)}
				<ProjectCard {project} />
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<div class="empty-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<rect x="3" y="3" width="18" height="18" rx="2" />
					<path d="M3 9h18" />
					<path d="M9 21V9" />
				</svg>
			</div>
			<h2>Projects Coming Soon</h2>
			<p>I'm currently working on documenting my projects. Check back soon!</p>
		</div>
	{/if}
</div>

<style>
	.projects-page {
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.projects-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.projects-header {
		text-align: center;
		margin-bottom: var(--space-12);
	}

	.projects-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
	}

	@media (min-width: 768px) {
		.projects-title {
			font-size: var(--text-5xl);
		}
	}

	.projects-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		max-width: 600px;
		margin: 0 auto;
	}

	.projects-grid {
		display: grid;
		gap: var(--space-8);
	}

	@media (min-width: 768px) {
		.projects-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.projects-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-24) var(--space-4);
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto var(--space-6);
		color: var(--color-text-muted);
	}

	.empty-icon svg {
		width: 100%;
		height: 100%;
	}

	.empty-state h2 {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-4);
	}

	.empty-state p {
		color: var(--color-text-secondary);
	}
</style>
