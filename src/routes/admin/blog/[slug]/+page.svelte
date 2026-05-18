<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@delightstack/components/actions';
	import { Expand } from '@delightstack/components/display';
	import { Input, Select } from '@delightstack/components/form';
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte';
	import DraftGenerator from '$lib/components/editor/DraftGenerator.svelte';

	let { data } = $props();

	const initialPost = data.post;
	let title = $state(initialPost?.title ?? '');
	let summary = $state(initialPost?.summary ?? initialPost?.aiSummary ?? '');
	let category = $state(initialPost?.category ?? '');
	let tags = $state(initialPost?.tags?.join(', ') ?? '');
	let status = $state<'draft' | 'published'>(
		initialPost?.status === 'published' ? 'published' : 'draft'
	);
	let contentHtml = $state(initialPost?.contentHtml ?? '');
	let slug = $state(initialPost?.slug ?? '');
	let publishedAtInput = $state(toLocalDateTimeInput(initialPost?.publishedAt ?? null));

	let saving = $state(false);
	let deleting = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);
	let advancedOpen = $state(false);

	let editor: TipTapEditor;

	function toLocalDateTimeInput(ts: number | null): string {
		if (ts == null) return '';
		const d = new Date(ts);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}

	function fromLocalDateTimeInput(value: string): number | null {
		if (!value) return null;
		const ts = new Date(value).getTime();
		return Number.isFinite(ts) ? ts : null;
	}

	$effect(() => {
		const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
		if (cleaned !== slug) slug = cleaned;
	});

	const normalizedTags = $derived(
		tags
			.split(',')
			.map((t: string) => t.trim())
			.filter(Boolean)
	);

	function snapshotOf(values: {
		title: string;
		summary: string;
		category: string;
		tags: string[];
		status: string;
		contentHtml: string;
		slug: string;
		publishedAt: number | null;
	}): string {
		return JSON.stringify(values);
	}

	let savedSnapshot = $state(
		snapshotOf({
			title: initialPost?.title ?? '',
			summary: initialPost?.summary ?? initialPost?.aiSummary ?? '',
			category: initialPost?.category ?? '',
			tags: initialPost?.tags ?? [],
			status: initialPost?.status === 'published' ? 'published' : 'draft',
			contentHtml: initialPost?.contentHtml ?? '',
			slug: initialPost?.slug ?? '',
			publishedAt: initialPost?.publishedAt ?? null
		})
	);

	const currentSnapshot = $derived(
		snapshotOf({
			title,
			summary,
			category,
			tags: normalizedTags,
			status,
			contentHtml,
			slug,
			publishedAt: fromLocalDateTimeInput(publishedAtInput)
		})
	);

	const hasChanges = $derived(savedSnapshot !== currentSnapshot);

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
		if (!slug.trim()) {
			error = 'Slug is required';
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
					tags: normalizedTags,
					content: editor?.getText() || '',
					contentHtml,
					status,
					slug,
					publishedAt: fromLocalDateTimeInput(publishedAtInput)
				})
			});

			if (!res.ok) {
				const resData = await res.json().catch(() => ({}));
				throw new Error(resData.message || 'Failed to save');
			}

			const { post } = await res.json();
			savedSnapshot = currentSnapshot;
			if (post?.slug && post.slug !== data.post?.slug) {
				goto(`/admin/blog/${post.slug}`, { invalidateAll: true });
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
							<Button transparent fullWidth error loading={deleting} onclick={handleDelete}>
								Delete
							</Button>
						</div>
					{/snippet}
				</Button>
				<Button onclick={handleSave} loading={saving} disabled={!hasChanges}>Save Changes</Button>
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
								placeholder="my-post-slug"
								prefix="/blog/" />
						</div>
					</div>

					<div class="form-row">
						<div class="field full">
							<Input
								type="datetime-local"
								label="Publish Date"
								bind:value={publishedAtInput}
								helper="Leave blank to clear. Set when publishing if empty." />
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
					<TipTapEditor
						bind:this={editor}
						content={data.post.contentHtml || ''}
						onUpdate={handleEditorUpdate} />
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
		gap: var(--space-2);
		align-items: center;
		flex-wrap: wrap;
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
		min-width: 150px;
	}

	.field.full {
		flex: none;
		width: 100%;
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
