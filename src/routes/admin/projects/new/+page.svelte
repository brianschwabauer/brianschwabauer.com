<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/shared/Button.svelte';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';

	let title = $state('');
	let tagline = $state('');
	let technologies = $state('');
	let externalUrl = $state('');
	let githubUrl = $state('');
	let coverImage = $state('');
	let featured = $state(false);
	let descriptionHtml = $state('');

	let saving = $state(false);
	let error = $state('');

	let editor: TipTapEditor;

	function handleEditorUpdate(html: string) {
		descriptionHtml = html;
	}

	async function handleSave() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch('/api/projects', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					tagline: tagline.trim() || null,
					description: editor?.getText() || '',
					descriptionHtml,
					coverImage: coverImage.trim() || null,
					technologies: technologies.split(',').map((t) => t.trim()).filter(Boolean),
					externalUrl: externalUrl.trim() || null,
					githubUrl: githubUrl.trim() || null,
					featured
				})
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to create project');
			}

			const { project } = await res.json();
			goto(`/admin/projects/${project.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>New Project - Admin</title>
</svelte:head>

<div class="edit-project">
	<div class="page-header">
		<div>
			<a href="/admin/projects" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				Back to Projects
			</a>
			<h1>New Project</h1>
		</div>
		<div class="header-actions">
			<Button onclick={handleSave} loading={saving}>Save Project</Button>
		</div>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="edit-form">
		<div class="form-row">
			<div class="field full">
				<label for="title">Title</label>
				<input type="text" id="title" bind:value={title} placeholder="Project name" />
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label for="tagline">Tagline</label>
				<input type="text" id="tagline" bind:value={tagline} placeholder="Short description" />
			</div>
		</div>

		<div class="form-row">
			<div class="field">
				<label for="technologies">Technologies (comma-separated)</label>
				<input type="text" id="technologies" bind:value={technologies} placeholder="React, Node.js, PostgreSQL" />
			</div>
			<div class="field checkbox">
				<label>
					<input type="checkbox" bind:checked={featured} />
					Featured
				</label>
			</div>
		</div>

		<div class="form-row">
			<div class="field">
				<label for="externalUrl">Live URL</label>
				<input type="url" id="externalUrl" bind:value={externalUrl} placeholder="https://example.com" />
			</div>
			<div class="field">
				<label for="githubUrl">GitHub URL</label>
				<input type="url" id="githubUrl" bind:value={githubUrl} placeholder="https://github.com/..." />
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label for="coverImage">Cover Image URL</label>
				<input type="url" id="coverImage" bind:value={coverImage} placeholder="https://..." />
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label for="description-editor">Description</label>
				<TipTapEditor bind:this={editor} content="" onUpdate={handleEditorUpdate} />
			</div>
		</div>
	</div>
</div>

<style>
	.edit-project {
		max-width: 1000px;
	}

	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--space-8);
		gap: var(--space-4);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-2);
	}

	.back-link svg {
		width: 16px;
		height: 16px;
	}

	.back-link:hover {
		color: var(--color-accent);
	}

	.page-header h1 {
		font-size: var(--text-2xl);
	}

	.header-actions {
		display: flex;
		gap: var(--space-3);
	}

	.error {
		padding: var(--space-3) var(--space-4);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		margin-bottom: var(--space-6);
		font-size: var(--text-sm);
	}

	.form-row {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.field {
		flex: 1;
		min-width: 200px;
	}

	.field.full {
		flex: none;
		width: 100%;
	}

	.field.checkbox {
		flex: 0;
		min-width: auto;
	}

	.field label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		margin-bottom: var(--space-2);
	}

	.field.checkbox label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
	}

	.field input {
		width: 100%;
	}

	.field input[type="checkbox"] {
		width: auto;
	}
</style>
