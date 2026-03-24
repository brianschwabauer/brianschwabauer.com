<script lang="ts">
	import { Button } from '@delightstack/components/actions';

	interface Props {
		project?: {
			title: string;
			tagline: string;
			description: string;
			technologies: string[];
			link?: string;
		};
	}

	let { project }: Props = $props();

	const defaultProject = {
		title: 'This Portfolio',
		tagline: 'Built with SvelteKit, Cloudflare, and AI',
		description:
			"You're looking at it! A space-themed personal site featuring reverse-scroll timelines, AI-powered content creation, and modern CSS animations. Built to showcase not just projects, but the journey of building them.",
		technologies: ['SvelteKit', 'Cloudflare D1', 'TipTap', 'Claude AI'],
		link: undefined
	};

	const displayProject = project ?? defaultProject;
</script>

<section class="current-project">
	<div class="current-project-inner">
		<div class="label scroll-reveal">What I'm Building Now</div>

		<div class="project-card scroll-scale">
			<div class="project-content">
				<h2 class="project-title">{displayProject.title}</h2>
				<p class="project-tagline">{displayProject.tagline}</p>
				<p class="project-description">{displayProject.description}</p>

				<div class="project-tech">
					{#each displayProject.technologies as tech}
						<span class="tech-tag">{tech}</span>
					{/each}
				</div>

				{#if displayProject.link}
					<div class="project-cta">
						<Button href={displayProject.link} outline>Learn More</Button>
					</div>
				{/if}
			</div>

			<div class="project-visual">
				<div class="visual-placeholder">
					<div class="code-lines">
						<div class="code-line" style="width: 60%"></div>
						<div class="code-line" style="width: 80%"></div>
						<div class="code-line" style="width: 45%"></div>
						<div class="code-line" style="width: 70%"></div>
						<div class="code-line" style="width: 55%"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.current-project {
		padding: var(--space-24) 0;
	}

	.current-project-inner {
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	@media (min-width: 768px) {
		.current-project-inner {
			padding: 0 var(--space-8);
		}
	}

	.label {
		font-size: var(--text-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-accent);
		margin-bottom: var(--space-6);
		text-align: center;
	}

	.project-card {
		display: grid;
		gap: var(--space-8);
		padding: var(--space-8);
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
	}

	@media (min-width: 768px) {
		.project-card {
			grid-template-columns: 1fr 1fr;
			padding: var(--space-12);
		}
	}

	.project-title {
		font-size: var(--text-3xl);
		font-weight: 700;
		margin-bottom: var(--space-2);
	}

	.project-tagline {
		font-size: var(--text-lg);
		color: var(--color-accent);
		margin-bottom: var(--space-4);
	}

	.project-description {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-6);
	}

	.tech-tag {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
	}

	.project-visual {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.visual-placeholder {
		width: 100%;
		aspect-ratio: 4/3;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.code-lines {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.code-line {
		height: 12px;
		background: var(--color-border);
		border-radius: var(--radius-sm);
		opacity: 0.5;
	}

	.code-line:nth-child(odd) {
		background: var(--color-accent);
		opacity: 0.3;
	}
</style>
