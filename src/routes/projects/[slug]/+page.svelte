<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import Image from '@delightstack/components/media/Image.svelte';

	let { data } = $props();

	function getTechnologies(): string[] {
		if (!data.project?.technologies) return [];
		try {
			return JSON.parse(data.project.technologies);
		} catch {
			return [];
		}
	}

	function getImages(): string[] {
		if (!data.project?.images) return [];
		try {
			return JSON.parse(data.project.images);
		} catch {
			return [];
		}
	}
</script>

<svelte:head>
	<title>{data.project?.title ?? 'Project Not Found'} - Brian Schwabauer</title>
	{#if data.project?.tagline}
		<meta name="description" content={data.project.tagline} />
	{/if}
</svelte:head>

<div class="project-page">
	{#if data.project}
		<header class="project-header">
			<a href="/projects" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				All Projects
			</a>

			<h1 class="project-title">{data.project.title}</h1>

			{#if data.project.tagline}
				<p class="project-tagline">{data.project.tagline}</p>
			{/if}

			{#if getTechnologies().length > 0}
				<div class="project-tech">
					{#each getTechnologies() as tech}
						<span class="tech-tag">{tech}</span>
					{/each}
				</div>
			{/if}

			<div class="project-links">
				{#if data.project.externalUrl}
					<Button href={data.project.externalUrl} size="2" accent>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							<polyline points="15 3 21 3 21 9" />
							<line x1="10" y1="14" x2="21" y2="3" />
						</svg>
						View Live
					</Button>
				{/if}
				{#if data.project.githubUrl}
					<Button href={data.project.githubUrl} outline size="2">
						<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
							<path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
						</svg>
						View Source
					</Button>
				{/if}
			</div>
		</header>

		{#if data.project.coverImage}
			<div class="project-cover">
				<Image src={data.project.coverImage} alt={data.project.title} />
			</div>
		{/if}

		{#if data.project.descriptionHtml}
			<div class="project-content prose">
				{@html data.project.descriptionHtml}
			</div>
		{:else if data.project.description}
			<div class="project-content prose">
				<p>{data.project.description}</p>
			</div>
		{/if}

		{#if getImages().length > 0}
			<div class="project-gallery">
				<h2>Gallery</h2>
				<div class="gallery-grid">
					{#each getImages() as image, i}
						<Image src={image} alt="{data.project.title} screenshot {i + 1}" />
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="not-found">
			<h1>Project Not Found</h1>
			<p>The project you're looking for doesn't exist or has been removed.</p>
			<Button href="/projects">Back to Projects</Button>
		</div>
	{/if}
</div>

<style>
	.project-page {
		max-width: var(--container-lg);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.project-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.back-link svg {
		width: 16px;
		height: 16px;
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	.project-header {
		margin-bottom: var(--space-12);
	}

	.project-title {
		font-size: var(--text-4xl);
		font-weight: 700;
		line-height: var(--leading-tight);
		margin-bottom: var(--space-4);
	}

	@media (min-width: 768px) {
		.project-title {
			font-size: var(--text-5xl);
		}
	}

	.project-tagline {
		font-size: var(--text-xl);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-bottom: var(--space-8);
	}

	.tech-tag {
		font-size: var(--text-sm);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
	}

	.project-links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.project-cover {
		margin-bottom: var(--space-12);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-xl);
	}

	.project-cover img {
		width: 100%;
		height: auto;
	}

	.project-content {
		margin-bottom: var(--space-12);
	}

	.project-gallery {
		margin-top: var(--space-12);
	}

	.project-gallery h2 {
		font-size: var(--text-2xl);
		margin-bottom: var(--space-6);
	}

	.gallery-grid {
		display: grid;
		gap: var(--space-4);
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}

	.gallery-grid img {
		width: 100%;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}

	.not-found {
		text-align: center;
		padding: var(--space-24) 0;
	}

	.not-found h1 {
		font-size: var(--text-3xl);
		margin-bottom: var(--space-4);
	}

	.not-found p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}
</style>
