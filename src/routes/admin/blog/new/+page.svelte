<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@delightstack/components/actions';
	import { Expand } from '@delightstack/components/display';
	import { Input, Select } from '@delightstack/components/form';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';
	import DraftGenerator from '$lib/components/editor/DraftGenerator.svelte';

	let title = $state('');
	let summary = $state('');
	let category = $state('');
	let tags = $state('');
	let status = $state<'draft' | 'published'>('draft');
	let content = $state('');
	let contentHtml = $state('');
	let slug = $state('');

	let saving = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);
	let advancedOpen = $state(false);

	let editor: TipTapEditor;

	$effect(() => {
		const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
		if (cleaned !== slug) slug = cleaned;
	});

	function handleEditorUpdate(html: string, text: string) {
		contentHtml = html;
		content = text;
	}

	function handleGenerated(generatedContent: string) {
		editor?.setContent(generatedContent);
		contentHtml = generatedContent;
	}

	async function handleSave() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch('/api/blog', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					summary: summary.trim() || null,
					category: category.trim() || null,
					tags: tags
						.split(',')
						.map((t) => t.trim())
						.filter(Boolean),
					content: content || '',
					contentHtml: contentHtml || '',
					status,
					slug: slug.trim() || undefined
				})
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || 'Failed to create post');
			}

			const { post } = await res.json();
			goto(`/admin/blog/${post.slug}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>New Post - Admin</title>
</svelte:head>

<div class="edit-post">
	<div class="page-header">
		<div>
			<a href="/admin" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				Back to Posts
			</a>
			<h1>New Post</h1>
		</div>
		<div class="header-actions">
			<Button
				icon
				transparent
				size="00"
				tooltip="More actions"
				aria-label="More actions"
				popoverCloseOnInsideClick>
				<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
					<circle cx="12" cy="5" r="2" />
					<circle cx="12" cy="12" r="2" />
					<circle cx="12" cy="19" r="2" />
				</svg>
				{#snippet menu()}
					<div class="action-menu">
						<Button transparent fullWidth onclick={() => (generatorOpen = true)}>
							AI Generate
						</Button>
					</div>
				{/snippet}
			</Button>
			<Button onclick={handleSave} loading={saving}>Save Post</Button>
		</div>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="edit-form">
		<div class="title-row">
			<div class="field title-field">
				<Input label="Title" bind:value={title} placeholder="Post title" />
			</div>
			<div class="field status-field">
				<Select
					label="Status"
					bind:value={status}
					options={[
						{ value: 'draft', label: 'Draft' },
						{ value: 'published', label: 'Published' }
					]} />
			</div>
		</div>

		<div class="advanced-toggle">
			<button
				type="button"
				class="advanced-button"
				aria-expanded={advancedOpen}
				onclick={() => (advancedOpen = !advancedOpen)}>
				<svg
					viewBox="0 0 24 24"
					fill="currentColor"
					class="chevron"
					class:open={advancedOpen}
					aria-hidden="true">
					<path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
				</svg>
				Advanced Settings
			</button>
		</div>

		<Expand show={advancedOpen}>
			<div class="advanced-panel">
				<div class="form-row">
					<div class="field full">
						<Input
							label="Slug / Path / URL"
							bind:value={slug}
							placeholder="auto-generated from title"
							prefix="/blog/" />
					</div>
				</div>

				<div class="form-row">
					<div class="field full">
						<Input
							type="textarea"
							label="Summary"
							bind:value={summary}
							placeholder="Brief summary (leave blank to auto-generate)..." />
					</div>
				</div>

				<div class="form-row">
					<div class="field">
						<Input label="Category" bind:value={category} placeholder="e.g., Development" />
					</div>
					<div class="field">
						<Input
							label="Tags (comma-separated)"
							bind:value={tags}
							placeholder="svelte, typescript, web" />
					</div>
				</div>
			</div>
		</Expand>

		<div class="form-row">
			<div class="field full">
				<TipTapEditor bind:this={editor} content="" onUpdate={handleEditorUpdate} />
			</div>
		</div>
	</div>
</div>

<DraftGenerator bind:open={generatorOpen} type="blog" onGenerate={handleGenerated} />

<style>
	.edit-post {
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
		gap: var(--space-2);
		align-items: center;
	}

	.action-menu {
		display: flex;
		flex-direction: column;
		min-width: 180px;
		padding: var(--space-1);
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

	.title-row {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.field.title-field {
		flex: 1 1 240px;
		min-width: 240px;
	}

	.field.status-field {
		flex: 0 0 140px;
		min-width: 140px;
		width: 140px;
	}

	.advanced-toggle {
		margin: var(--space-2) 0 var(--space-4);
	}

	.advanced-button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: none;
		border: none;
		padding: var(--space-2) 0;
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
	}

	.advanced-button:hover {
		color: var(--color-accent);
	}

	.advanced-button .chevron {
		width: 16px;
		height: 16px;
		transform: rotate(-90deg);
		transition: transform 200ms ease;
	}

	.advanced-button .chevron.open {
		transform: rotate(0deg);
	}

	.advanced-panel {
		padding: var(--space-4);
		margin-bottom: var(--space-6);
		border: 1px solid var(--color-border, rgba(127, 127, 127, 0.2));
		border-radius: var(--radius-md);
		background: rgba(127, 127, 127, 0.04);
		min-width: 0;
	}

	.form-row {
		display: flex;
		gap: var(--space-4);
		margin-bottom: var(--space-6);
		flex-wrap: wrap;
	}

	.advanced-panel .form-row:last-child {
		margin-bottom: 0;
	}

	.field {
		flex: 1;
	}

	.field.full {
		flex: none;
		width: 100%;
	}
</style>
