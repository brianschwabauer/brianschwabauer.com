<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@delightstack/components/actions';
	import { Input, Select } from '@delightstack/components/form';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';
	import DraftGenerator from '$lib/components/editor/DraftGenerator.svelte';

	let { data } = $props();

	const initialPost = data.post;
	let title = $state(initialPost?.title ?? '');
	let summary = $state(initialPost?.summary ?? initialPost?.aiSummary ?? '');
	let category = $state(initialPost?.category ?? '');
	let tags = $state(initialPost?.tags?.join(', ') ?? '');
	let status = $state<'draft' | 'published'>(initialPost?.status === 'published' ? 'published' : 'draft');
	let contentHtml = $state(initialPost?.contentHtml ?? '');

	let saving = $state(false);
	let deleting = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);

	let editor: TipTapEditor;

	function handleEditorUpdate(html: string) {
		contentHtml = html;
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
			const res = await fetch(`/api/blog/${data.post?.slug}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					summary: summary.trim() || null,
					category: category.trim() || null,
					tags: tags
						.split(',')
						.map((t: string) => t.trim())
						.filter(Boolean),
					content: editor?.getText() || '',
					contentHtml,
					status
				})
			});

			if (!res.ok) {
				const resData = await res.json();
				throw new Error(resData.message || 'Failed to save');
			}

			error = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;

		deleting = true;
		try {
			const res = await fetch(`/api/blog/${data.post?.slug}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete');
			goto('/admin');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete';
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Post - Admin</title>
</svelte:head>

{#if data.post}
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
				<h1>Edit Post</h1>
			</div>
			<div class="header-actions">
				<Button error onclick={handleDelete} loading={deleting}>Delete</Button>
				<Button outline onclick={() => (generatorOpen = true)}>AI Generate</Button>
				<Button onclick={handleSave} loading={saving}>Save Changes</Button>
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
					<Input
						label="Tags (comma-separated)"
						bind:value={tags}
						placeholder="svelte, typescript, web"
					/>
				</div>
				<div class="field">
					<Select
						label="Status"
						bind:value={status}
						options={[
							{ value: 'draft', label: 'Draft' },
							{ value: 'published', label: 'Published' }
						]}
					/>
				</div>
			</div>

			<div class="form-row">
				<div class="field full">
					<label>Content</label>
					<TipTapEditor
						bind:this={editor}
						content={data.post.contentHtml || ''}
						onUpdate={handleEditorUpdate}
					/>
				</div>
			</div>
		</div>
	</div>

	<DraftGenerator bind:open={generatorOpen} type="blog" onGenerate={handleGenerated} />
{:else}
	<div class="not-found">
		<h1>Post Not Found</h1>
		<p>The post you're looking for doesn't exist.</p>
		<Button href="/admin">Back to Posts</Button>
	</div>
{/if}

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
		flex-wrap: wrap;
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
		flex-wrap: wrap;
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
	}

	.field {
		flex: 1;
		min-width: 150px;
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

	.not-found {
		text-align: center;
		padding: var(--space-16);
	}

	.not-found h1 {
		margin-bottom: var(--space-4);
	}

	.not-found p {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-8);
	}
</style>
