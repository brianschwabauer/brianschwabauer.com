<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@delightstack/components/actions';
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

	let saving = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);

	let editor: TipTapEditor;

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
					status
				})
			});

			if (!res.ok) {
				const data = await res.json();
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
			<a href="/admin/blog" class="back-link">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
				Back to Posts
			</a>
			<h1>New Post</h1>
		</div>
		<div class="header-actions">
			<Button outline onclick={() => (generatorOpen = true)}>AI Generate</Button>
			<Button onclick={handleSave} loading={saving}>Save Post</Button>
		</div>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="edit-form">
		<div class="form-row">
			<div class="field full">
				<Input label="Title" bind:value={title} placeholder="Post title" />
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<Input
					type="textarea"
					label="Summary"
					bind:value={summary}
					placeholder="Brief summary (leave blank to auto-generate)..."
				/>
			</div>
		</div>

		<div class="form-row">
			<div class="field">
				<Input label="Category" bind:value={category} placeholder="e.g., Development" />
			</div>
			<div class="field">
				<Input label="Tags (comma-separated)" bind:value={tags} placeholder="svelte, typescript, web" />
			</div>
			<div class="field">
				<Select label="Status" bind:value={status} options={[
					{ value: 'draft', label: 'Draft' },
					{ value: 'published', label: 'Published' }
				]} />
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label>Content</label>
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
	}

	.field {
		flex: 1;
	}

	.field.full {
		flex: none;
		width: 100%;
	}

	.field label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		margin-bottom: var(--space-2);
	}

	.field input,
	.field textarea,
	.field select {
		width: 100%;
	}

	.field select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		background-size: 16px;
		padding-right: 40px;
	}
</style>
