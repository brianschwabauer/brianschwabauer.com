<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/shared/Button.svelte';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';
	import DraftGenerator from '$lib/components/editor/DraftGenerator.svelte';

	let year = $state(new Date().getFullYear());
	let month = $state<number | null>(null);
	let title = $state('');
	let category = $state<'development' | 'videography' | 'life'>('development');
	let mediaType = $state<'none' | 'image' | 'video'>('none');
	let mediaUrl = $state('');
	let featured = $state(false);
	let descriptionHtml = $state('');

	let saving = $state(false);
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
			const res = await fetch('/api/timeline', {
				method: 'POST',
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
				const data = await res.json();
				throw new Error(data.message || 'Failed to create entry');
			}

			const { entry } = await res.json();
			goto(`/admin/timeline/${entry.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>New Timeline Entry - Admin</title>
</svelte:head>

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
			<h1>New Timeline Entry</h1>
		</div>
		<div class="header-actions">
			<Button variant="secondary" onclick={() => (generatorOpen = true)}>AI Generate</Button>
			<Button onclick={handleSave} loading={saving}>Save Entry</Button>
		</div>
	</div>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	<div class="edit-form">
		<div class="form-row">
			<div class="field">
				<label for="year">Year</label>
				<input type="number" id="year" bind:value={year} min="1990" max="2100" />
			</div>
			<div class="field">
				<label for="month">Month (optional)</label>
				<select id="month" bind:value={month}>
					<option value={null}>No month</option>
					{#each Array(12) as _, i}
						<option value={i + 1}>
							{new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
						</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="category">Category</label>
				<select id="category" bind:value={category}>
					<option value="development">Development</option>
					<option value="videography">Videography</option>
					<option value="life">Life</option>
				</select>
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label for="title">Title</label>
				<input type="text" id="title" bind:value={title} placeholder="What happened?" />
			</div>
		</div>

		<div class="form-row">
			<div class="field">
				<label for="mediaType">Media Type</label>
				<select id="mediaType" bind:value={mediaType}>
					<option value="none">None</option>
					<option value="image">Image</option>
					<option value="video">Video</option>
				</select>
			</div>
			<div class="field" style="flex: 2">
				<label for="mediaUrl">Media URL</label>
				<input type="url" id="mediaUrl" bind:value={mediaUrl} placeholder="https://..." disabled={mediaType === 'none'} />
			</div>
			<div class="field checkbox">
				<label>
					<input type="checkbox" bind:checked={featured} />
					Featured
				</label>
			</div>
		</div>

		<div class="form-row">
			<div class="field full">
				<label>Description</label>
				<TipTapEditor bind:this={editor} content="" onUpdate={handleEditorUpdate} />
			</div>
		</div>
	</div>
</div>

<DraftGenerator bind:open={generatorOpen} type="timeline" onGenerate={handleGenerated} />

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
</style>
