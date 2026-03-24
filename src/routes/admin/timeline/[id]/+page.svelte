<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@delightstack/components/actions';
	import { Input, Select, Checkbox } from '@delightstack/components/form';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';
	import DraftGenerator from '$lib/components/editor/DraftGenerator.svelte';

	let { data } = $props();

	const initialEntry = data.entry;
	let year = $state(initialEntry?.year ?? new Date().getFullYear());
	let month = $state<number | null>(initialEntry?.month ?? null);
	let title = $state(initialEntry?.title ?? '');
	let category = $state<'development' | 'videography' | 'life'>(initialEntry?.category ?? 'development');
	let mediaType = $state<'none' | 'image' | 'video'>(initialEntry?.mediaType ?? 'none');
	let mediaUrl = $state(initialEntry?.mediaUrl ?? '');
	let featured = $state(initialEntry?.featured ?? false);
	let descriptionHtml = $state(initialEntry?.descriptionHtml ?? '');

	let saving = $state(false);
	let deleting = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);

	let editor: TipTapEditor;

	function handleEditorUpdate(html: string) {
		descriptionHtml = html;
	}

	function handleGenerated(generatedContent: string) {
		editor?.setContent(generatedContent);
		descriptionHtml = generatedContent;
	}

	async function handleSave() {
		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		saving = true;
		error = '';

		try {
			const res = await fetch(`/api/timeline/${data.entry?.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					year,
					month: month || null,
					title: title.trim(),
					description: editor?.getText() || '',
					descriptionHtml,
					category,
					mediaType,
					mediaUrl: mediaUrl.trim() || null,
					featured
				})
			});

			if (!res.ok) {
				const resData = await res.json();
				throw new Error(resData.message || 'Failed to save');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
			return;
		}

		deleting = true;

		try {
			const res = await fetch(`/api/timeline/${data.entry?.id}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				throw new Error('Failed to delete');
			}

			goto('/admin/timeline');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete';
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>Edit Timeline Entry - Admin</title>
</svelte:head>

{#if data.entry}
	<div class="edit-entry">
		<div class="page-header">
			<div>
				<a href="/admin/timeline" class="back-link">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="19" y1="12" x2="5" y2="12" />
						<polyline points="12 19 5 12 12 5" />
					</svg>
					Back to Timeline
				</a>
				<h1>Edit Timeline Entry</h1>
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
				<div class="field">
					<Input type="number" label="Year" bind:value={year} min={1990} max={2100} />
				</div>
				<div class="field">
					<Select label="Month (optional)" bind:value={month} options={[
						{ value: null, label: 'No month' },
						...Array.from({ length: 12 }, (_, i) => ({
							value: i + 1,
							label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
						}))
					]} />
				</div>
				<div class="field">
					<Select label="Category" bind:value={category} options={[
						{ value: 'development', label: 'Development' },
						{ value: 'videography', label: 'Videography' },
						{ value: 'life', label: 'Life' }
					]} />
				</div>
			</div>

			<div class="form-row">
				<div class="field full">
					<Input label="Title" bind:value={title} placeholder="What happened?" />
				</div>
			</div>

			<div class="form-row">
				<div class="field">
					<Select label="Media Type" bind:value={mediaType} options={[
						{ value: 'none', label: 'None' },
						{ value: 'image', label: 'Image' },
						{ value: 'video', label: 'Video' }
					]} />
				</div>
				<div class="field" style="flex: 2">
					<Input type="url" label="Media URL" bind:value={mediaUrl} placeholder="https://..." disabled={mediaType === 'none'} />
				</div>
				<div class="field checkbox">
					<Checkbox bind:checked={featured} label="Featured" />
				</div>
			</div>

			<div class="form-row">
				<div class="field full">
					<label for="description-editor">Description</label>
					<TipTapEditor bind:this={editor} content={initialEntry?.descriptionHtml || ''} onUpdate={handleEditorUpdate} />
				</div>
			</div>
		</div>
	</div>

	<DraftGenerator bind:open={generatorOpen} type="timeline" onGenerate={handleGenerated} />
{:else}
	<div class="not-found">
		<h1>Entry Not Found</h1>
		<p>The timeline entry you're looking for doesn't exist.</p>
		<Button href="/admin/timeline">Back to Timeline</Button>
	</div>
{/if}

<style>
	.edit-entry {
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
		align-items: flex-end;
	}

	.field {
		flex: 1;
		min-width: 150px;
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

	.field input,
	.field select {
		width: 100%;
	}

	.field input[type="checkbox"] {
		width: auto;
	}

	.field select {
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		background-size: 16px;
		padding-right: 40px;
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
