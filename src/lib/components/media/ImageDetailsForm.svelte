<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';

	export interface ImageDetailsValues {
		alt: string;
		caption: string;
	}

	interface Props {
		/** URL used for the preview thumbnail. */
		previewSrc?: string;
		/** Alt text on the preview image (purely cosmetic — has its own field below). */
		previewAlt?: string | null;
		/** Inline CSS string applied to the preview frame (e.g. a background-color). */
		previewStyle?: string;
		/** Initial alt text value. */
		alt?: string;
		/** Initial caption value. */
		caption?: string;
		/** Whether the save button should show a loading state. */
		saving?: boolean;
		/** Render a back button at the top — used in the mobile drill-down. */
		showBack?: boolean;
		/** Title shown at the top of the form. */
		title?: string;
		onSave: (values: ImageDetailsValues) => void;
		onCancel: () => void;
	}

	let {
		previewSrc,
		previewAlt = null,
		previewStyle,
		alt = '',
		caption = '',
		saving = false,
		showBack = false,
		title = 'Image details',
		onSave,
		onCancel,
	}: Props = $props();

	// Mirror props into local state so edits don't immediately mutate the
	// upstream values, and so the parent can re-seed by passing new props
	// (e.g. when the user opens the panel for a different image).
	let localAlt = $state('');
	let localCaption = $state('');
	$effect(() => {
		localAlt = alt;
	});
	$effect(() => {
		localCaption = caption;
	});

	function submit() {
		onSave({ alt: localAlt.trim(), caption: localCaption.trim() });
	}
</script>

<div class="form">
	<header class="form-header">
		{#if showBack}
			<button type="button" class="back-btn" onclick={onCancel} aria-label="Back">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
					<line x1="19" y1="12" x2="5" y2="12" />
					<polyline points="12 19 5 12 12 5" />
				</svg>
			</button>
		{/if}
		<h3 class="form-title">{title}</h3>
	</header>

	{#if previewSrc}
		<div class="preview" style={previewStyle ?? ''}>
			<img src={previewSrc} alt={previewAlt ?? ''} loading="lazy" />
		</div>
	{/if}

	<div class="fields">
		<div class="field">
			<span class="field-label">Alt text</span>
			<Input
				bind:value={localAlt}
				placeholder="Describe the image for screen readers" />
			<span class="field-hint">
				Shown when the image can’t load — also read aloud by screen readers.
			</span>
		</div>
		<div class="field">
			<span class="field-label">Caption</span>
			<Input
				type="textarea"
				bind:value={localCaption}
				placeholder="Optional caption shown over the image" />
		</div>
	</div>

	<div class="actions">
		<Button translucent disabled={saving} onclick={onCancel}>Cancel</Button>
		<Button accent loading={saving} onclick={submit}>Save</Button>
	</div>
</div>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
		min-height: 0;
	}

	.form-header {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.form-title {
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
	}
	.back-btn:hover {
		transition-duration: 0s;
		background: var(--color-bg-secondary);
		color: var(--color-text);
	}

	.preview {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		max-height: 220px;
		border-radius: var(--radius-md);
		overflow: hidden;
		background-color: var(--color-bg-secondary);
		flex-shrink: 0;
	}

	.preview img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.field-label {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.field-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-2);
		padding-top: var(--space-2);
		border-top: 1px solid var(--color-border);
		flex-shrink: 0;
	}
</style>
