<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { Button, alert } from '@delightstack/components/actions';
	import TitleEditor from './TitleEditor.svelte';
	import BodyEditor from './BodyEditor.svelte';
	import FeaturedImagePicker from './FeaturedImagePicker.svelte';
	import PillsBar from './PillsBar.svelte';
	import PostSettingsModal from './PostSettingsModal.svelte';
	import DraftGenerator from './DraftGenerator.svelte';
	import type { JSONContent } from '@tiptap/core';
	import type { ImageRecord } from '$lib/client/images';
	import type { BlogPost } from '$lib/server/blog';

	interface Props {
		/** `new` defers the API write until the first Save click; `edit` PATCHes
		    on save and uses `initialPost.slug` for delete/preview links. */
		mode: 'new' | 'edit';
		initialPost?: BlogPost | null;
	}

	let { mode, initialPost = null }: Props = $props();

	// Snapshot the post at mount so the unsaved-changes diff has a stable
	// reference point (the prop itself stays reactive).
	const initial = untrack(() => initialPost);
	const emptyDoc: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };
	const initialContent: JSONContent =
		(initial?.content as JSONContent | undefined) ?? emptyDoc;

	let title = $state(initial?.title ?? '');
	let summary = $state(initial?.summary ?? initial?.aiSummary ?? '');
	let tags = $state<string[]>(initial?.tags ?? []);
	let status = $state<'draft' | 'published'>(
		initial?.status === 'published' ? 'published' : 'draft'
	);
	let content = $state<JSONContent>(initialContent);
	let contentText = $state(initial?.contentText ?? '');
	let featuredImage = $state<ImageRecord | null>(initial?.featuredImage ?? null);
	let coverFocalX = $state<number>(initial?.coverFocalX ?? 50);
	let coverFocalY = $state<number>(initial?.coverFocalY ?? 50);
	let slug = $state(initial?.slug ?? '');
	let publishedAt = $state<number | null>(initial?.publishedAt ?? null);

	let saving = $state(false);
	let deleting = $state(false);
	let error = $state('');
	let generatorOpen = $state(false);
	let settingsOpen = $state(false);

	let titleEditor: TitleEditor | undefined = $state();
	let bodyEditor: BodyEditor | undefined = $state();

	function snapshotOf(values: Record<string, unknown>): string {
		return JSON.stringify(values);
	}

	let savedSnapshot = $state(
		snapshotOf({
			title: initial?.title ?? '',
			summary: initial?.summary ?? initial?.aiSummary ?? '',
			tags: initial?.tags ?? [],
			status: initial?.status === 'published' ? 'published' : 'draft',
			content: initialContent,
			featuredImagePath: initial?.featuredImage?.path ?? null,
			featuredImageAlt: initial?.featuredImage?.alt_text ?? null,
			coverFocalX: initial?.coverFocalX ?? 50,
			coverFocalY: initial?.coverFocalY ?? 50,
			slug: initial?.slug ?? '',
			publishedAt: initial?.publishedAt ?? null,
		})
	);

	const currentSnapshot = $derived(
		snapshotOf({
			title,
			summary,
			tags,
			status,
			content,
			featuredImagePath: featuredImage?.path ?? null,
			featuredImageAlt: featuredImage?.alt_text ?? null,
			coverFocalX,
			coverFocalY,
			slug,
			publishedAt,
		})
	);

	// In `new` mode there's nothing persisted yet, so the first Save is always
	// available — `hasChanges` would otherwise be false for an empty draft.
	const hasChanges = $derived(mode === 'new' ? true : savedSnapshot !== currentSnapshot);

	const saveLabel = $derived.by(() => {
		const willPublish = status === 'published';
		if (mode === 'new') return willPublish ? 'Publish Post' : 'Create Draft';
		if (hasChanges) return willPublish ? 'Publish Changes' : 'Save Changes';
		return willPublish ? 'Published' : 'Saved';
	});

	function handleBodyUpdate(json: JSONContent, text: string) {
		content = json;
		contentText = text;
	}

	function handleGenerated(generatedHtml: string) {
		bodyEditor?.setContent(generatedHtml);
		content = bodyEditor?.getJSON() ?? emptyDoc;
		contentText = bodyEditor?.getText() ?? '';
	}

	function handleAiAction(_selected: string) {
		// AI lives in the bubble menu — for now it opens the same draft
		// generator modal so the author can describe what to do.
		generatorOpen = true;
	}

	async function handleSave() {
		if (!title.trim()) {
			error = 'A title is required before saving.';
			titleEditor?.focus();
			return;
		}
		// Slug is only required at save time in edit mode; in new mode the API
		// derives one from the title.
		if (mode === 'edit' && !slug.trim()) {
			error = 'A slug is required (open Settings to set one).';
			settingsOpen = true;
			return;
		}

		saving = true;
		error = '';

		try {
			if (mode === 'new') {
				const res = await fetch('/api/blog', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						title: title.trim(),
						summary: summary.trim() || null,
						tags,
						content,
						contentText,
						featuredImage,
						coverFocalX,
						coverFocalY,
						status,
						// Only send slug if the user explicitly set one; otherwise the
						// API derives it from the title.
						slug: slug.trim() || undefined,
						publishedAt,
					}),
				});
				if (!res.ok) {
					const body = (await res.json().catch(() => ({}))) as { message?: string };
					throw new Error(body.message || 'Failed to create post');
				}
				const { post } = (await res.json()) as { post: { slug: string } };
				// Replace the URL so Back doesn't return to /new with no content.
				await goto(`/admin/blog/${post.slug}`, { replaceState: true, invalidateAll: true });
				return;
			}

			// edit mode — PATCH the existing slug.
			const res = await fetch(`/api/blog/${initial?.slug}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					summary: summary.trim() || null,
					tags,
					content,
					contentText,
					featuredImage,
					coverFocalX,
					coverFocalY,
					status,
					slug,
					publishedAt,
				}),
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(body.message || 'Failed to save');
			}
			const { post } = await res.json();
			savedSnapshot = currentSnapshot;
			if (post?.slug && post.slug !== initial?.slug) {
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
		if (mode === 'new') {
			// No server-side row yet — just leave the page.
			goto('/admin');
			return;
		}
		const ok = await alert({
			title: 'Delete this post?',
			message: 'This can’t be undone — the post will be removed permanently.',
			continueText: 'Delete',
			destructive: true,
		});
		if (!ok) return;
		deleting = true;
		try {
			const res = await fetch(`/api/blog/${initial?.slug}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed to delete');
			goto('/admin');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to delete';
			deleting = false;
		}
	}

	function focusBody() {
		bodyEditor?.focus();
	}

	// The preview link only makes sense once a real slug exists.
	const previewHref = $derived(initial?.slug ? `/blog/${slug || initial.slug}` : null);
	const docTitle = $derived(
		mode === 'new' ? title || 'New Post' : title || 'Edit Post'
	);
</script>

<svelte:head>
	<title>{docTitle} — Admin</title>
</svelte:head>

<header class="edit-topbar">
	<div class="topbar-left">
		<a href="/admin" class="back-link" title="Back to all posts" aria-label="Back to all posts">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
		</a>
		<div class="topbar-title">
			<span class="topbar-title-text">
				{title || (mode === 'new' ? 'New post' : 'Untitled post')}
			</span>
			{#if hasChanges && mode === 'edit'}
				<span class="unsaved" title="Unsaved changes">●</span>
			{:else if mode === 'new'}
				<span class="unsaved new-badge">draft</span>
			{/if}
		</div>
	</div>
	<div class="topbar-actions">
		{#if previewHref}
			<a class="preview-link" href={previewHref} target="_blank" rel="noopener" title="Open the public post in a new tab">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
					<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
					<polyline points="15 3 21 3 21 9" />
					<line x1="10" y1="14" x2="21" y2="3" />
				</svg>
				<span>Preview</span>
			</a>
		{/if}
		<button
			type="button"
			class="icon-btn"
			onclick={() => (settingsOpen = true)}
			title="Post settings"
			aria-label="Post settings">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
				<circle cx="12" cy="12" r="3" />
				<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.18.41.5.74.91.91l.09.03a2 2 0 0 1 0 4l-.09.03a1.65 1.65 0 0 0-1 1.03z" />
			</svg>
		</button>
		<Button onclick={handleSave} loading={saving} disabled={mode === 'edit' && !hasChanges}>
			{saveLabel}
		</Button>
	</div>
</header>

{#if error}
	<div class="error-banner">{error}</div>
{/if}

<article class="edit-canvas">
	<TitleEditor
		bind:this={titleEditor}
		bind:value={title}
		placeholder="Enter post title…"
		onEnter={focusBody} />

	<PillsBar
		bind:status
		bind:publishedAt
		bind:tags />

	<FeaturedImagePicker
		image={featuredImage}
		focalX={coverFocalX}
		focalY={coverFocalY}
		onChange={(img) => {
			featuredImage = img;
			// Reset focal when the underlying image changes.
			coverFocalX = 50;
			coverFocalY = 50;
		}}
		onFocalChange={(x, y) => {
			coverFocalX = x;
			coverFocalY = y;
		}} />

	<BodyEditor
		bind:this={bodyEditor}
		content={initialContent}
		onUpdate={handleBodyUpdate}
		onAiAction={handleAiAction} />
</article>

<PostSettingsModal
	bind:open={settingsOpen}
	bind:slug
	bind:summary
	canDelete={mode === 'edit'}
	{deleting}
	onDelete={handleDelete} />

<DraftGenerator bind:open={generatorOpen} type="blog" onGenerate={handleGenerated} />

<style>
	.edit-topbar {
		position: sticky;
		top: 0;
		/* Stay below the delightstack Modal (--layer-5 = z-index 5) so its
		   backdrop covers the topbar when it opens. */
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: color-mix(in oklch, var(--color-bg) 92%, transparent);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid var(--color-border);
	}

	.topbar-left {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		min-width: 0;
		flex: 1;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-sm);
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}
	.back-link:hover {
		background: var(--color-bg-secondary);
		color: var(--color-accent);
	}

	.topbar-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.topbar-title-text {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.unsaved {
		color: var(--color-accent);
		font-size: var(--text-xs);
		line-height: 1;
	}
	.new-badge {
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		background: color-mix(in oklch, var(--color-accent) 14%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-weight: 600;
	}

	.topbar-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-shrink: 0;
	}

	.preview-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-2) var(--space-3);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		border-radius: var(--radius-sm);
	}
	.preview-link:hover {
		background: var(--color-bg-secondary);
		color: var(--color-accent);
	}

	@media (max-width: 640px) {
		.preview-link span { display: none; }
	}

	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
	}
	.icon-btn:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.error-banner {
		max-width: var(--prose-wide);
		margin: var(--space-3) auto 0;
		padding: var(--space-3) var(--space-4);
		background: color-mix(in oklch, var(--color-error) 12%, transparent);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.edit-canvas {
		max-width: var(--prose-wide);
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}

	@media (min-width: 768px) {
		.edit-canvas {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}
</style>
