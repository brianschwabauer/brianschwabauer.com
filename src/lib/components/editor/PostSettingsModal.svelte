<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';

	interface Props {
		open: boolean;
		slug: string;
		summary: string;
		teaser: string;
		canDelete: boolean;
		/** Archived posts get a real (permanent) delete; everything else archives. */
		archived?: boolean;
		deleting?: boolean;
		onSlugChange?: (s: string) => void;
		onSummaryChange?: (s: string) => void;
		onDelete?: () => void;
	}

	let {
		open = $bindable(false),
		slug = $bindable(''),
		summary = $bindable(''),
		teaser = $bindable(''),
		canDelete,
		archived = false,
		deleting = false,
		onSlugChange,
		onSummaryChange,
		onDelete,
	}: Props = $props();

	// Keep the slug URL-safe as the user types.
	$effect(() => {
		const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
		if (cleaned !== slug) {
			slug = cleaned;
		}
	});
</script>

<Modal bind:open title="Post Settings" width="min(640px, 100vw - 2rem)">
	{#snippet headerEnd()}
		{#if canDelete}
			<Button
				size="0"
				error={archived}
				transparent
				loading={deleting}
				tooltip={archived
					? 'Permanently delete this archived post'
					: 'Archive the post — it can be restored later'}
				onclick={() => onDelete?.()}>
				{archived ? 'Delete Permanently' : 'Archive Post'}
			</Button>
		{/if}
	{/snippet}

	<div class="settings">
		<div class="field">
			<Input
				label="URL slug"
				bind:value={slug}
				placeholder="my-post-slug"
				prefix="/blog/"
				description="Changing the slug also changes the public URL." />
		</div>
		<div class="field">
			<Input
				type="textarea"
				label="Summary"
				bind:value={summary}
				placeholder="Brief summary (leave blank to auto-generate from content)…"
				description="Used for SEO, social previews, and the post listings." />
		</div>
		<div class="field">
			<Input
				type="textarea"
				label="Teaser"
				bind:value={teaser}
				placeholder="Optional hook shown under the title (leave blank to show nothing)…"
				description="A one-liner that pulls readers in without giving away the point. Never used for SEO or listings." />
		</div>
		<div class="actions">
			<Button onclick={() => (open = false)}>Done</Button>
		</div>
	</div>
</Modal>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-2) 0;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
</style>
