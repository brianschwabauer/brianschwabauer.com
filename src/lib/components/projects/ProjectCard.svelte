<script lang="ts">
	import type { Project } from '$lib/server/db/schema';
	import Image from '@delightstack/components/media/Image.svelte';

	interface Props {
		project: Project;
	}

	let { project }: Props = $props();

	function getTechnologies(): string[] {
		if (!project.technologies) return [];
		try {
			return JSON.parse(project.technologies);
		} catch {
			return [];
		}
	}
</script>

<article class="project-card">
	<a href="/projects/{project.slug}" class="project-link">
		<div class="project-image">
			{#if project.coverImage}
				<Image src={project.coverImage} alt={project.title} fit="cover" />
			{:else}
				<div class="image-placeholder">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
						<rect x="3" y="3" width="18" height="18" rx="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<path d="M21 15l-5-5L5 21" />
					</svg>
				</div>
			{/if}
		</div>

		<div class="project-content">
			<h2 class="project-title">{project.title}</h2>

			{#if project.tagline}
				<p class="project-tagline">{project.tagline}</p>
			{/if}

			{#if getTechnologies().length > 0}
				<div class="project-tech">
					{#each getTechnologies().slice(0, 4) as tech}
						<span class="tech-tag">{tech}</span>
					{/each}
					{#if getTechnologies().length > 4}
						<span class="tech-tag">+{getTechnologies().length - 4}</span>
					{/if}
				</div>
			{/if}
		</div>
	</a>

	<div class="project-links">
		{#if project.externalUrl}
			<a
				href={project.externalUrl}
				class="external-link"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Visit project"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
			</a>
		{/if}
		{#if project.githubUrl}
			<a
				href={project.githubUrl}
				class="external-link"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="View source on GitHub"
			>
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
					/>
				</svg>
			</a>
		{/if}
	</div>
</article>

<style>
	.project-card {
		position: relative;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: border-color var(--transition-fast), transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.project-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.project-link {
		display: block;
		text-decoration: none;
		color: inherit;
	}

	.project-image {
		aspect-ratio: 16/9;
		background: var(--color-bg-secondary);
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-slow);
	}

	.project-card:hover .project-image img {
		transform: scale(1.05);
	}

	.image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.image-placeholder svg {
		width: 48px;
		height: 48px;
	}

	.project-content {
		padding: var(--space-6);
	}

	.project-title {
		font-size: var(--text-xl);
		font-weight: 600;
		margin-bottom: var(--space-2);
	}

	.project-tagline {
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		margin-bottom: var(--space-4);
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.tech-tag {
		font-size: var(--text-xs);
		padding: var(--space-1) var(--space-2);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
	}

	.project-links {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
		display: flex;
		gap: var(--space-2);
	}

	.external-link {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		box-shadow: var(--shadow-md);
		transition: background-color var(--transition-fast), color var(--transition-fast);
	}

	.external-link:hover {
		background: var(--color-accent);
		color: white;
	}

	.external-link svg {
		width: 18px;
		height: 18px;
	}
</style>
