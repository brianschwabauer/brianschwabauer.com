<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';

	interface Props {
		open: boolean;
		type?: 'blog' | 'timeline';
		onGenerate: (content: string) => void;
	}

	let { open = $bindable(), type = 'blog', onGenerate }: Props = $props();

	let outline = $state('');
	let generating = $state(false);
	let error = $state('');

	async function handleGenerate() {
		if (!outline.trim()) return;

		generating = true;
		error = '';

		try {
			const res = await fetch('/api/ai/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ outline, type }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to generate');
			}

			const { content } = await res.json();
			onGenerate(content);
			open = false;
			outline = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			generating = false;
		}
	}
</script>

<Modal bind:open title="AI Draft Generator">
	<div class="generator">
		<p class="description">
			Enter an outline or key points, and AI will generate a draft for you to edit.
		</p>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		<Input
			type="textarea"
			label="Outline"
			bind:value={outline}
			placeholder={type === 'blog'
				? 'e.g., - Introduction to SvelteKit\n- Why I chose it for my portfolio\n- Key features I love\n- Challenges I faced\n- Conclusion'
				: 'e.g., Started learning Svelte, built first project, deployed to Cloudflare'} />

		<div class="actions">
			<Button outline onclick={() => (open = false)}>Cancel</Button>
			<Button onclick={handleGenerate} loading={generating} disabled={!outline.trim()}>
				Generate Draft
			</Button>
		</div>
	</div>
</Modal>

<style>
	.description {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.error {
		padding: var(--space-3) var(--space-4);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.field {
		margin-bottom: var(--space-6);
	}

	.field label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		margin-bottom: var(--space-2);
	}

	.field textarea {
		width: 100%;
		resize: vertical;
		min-height: 150px;
	}

	.actions {
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
	}
</style>
