<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';

	interface Props {
		open: boolean;
		slug: string;
		summary: string;
		canDelete: boolean;
		deleting?: boolean;
		onSlugChange?: (s: string) => void;
		onSummaryChange?: (s: string) => void;
		onDelete?: () => void;
	}

	let {
		open = $bindable(false),
		slug = $bindable(''),
		summary = $bindable(''),
		canDelete,
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
			<Button size="0" error transparent loading={deleting} onclick={() => onDelete?.()}>
				Delete Post
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
		<div class="actions">
			<Button onclick={() => (open = false)}>Done</Button>
		</div>
	</div>
</Modal>

<style>
	.settings {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
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
