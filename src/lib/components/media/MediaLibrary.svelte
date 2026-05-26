<script lang="ts">
	import { Modal, Button, alert } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';
	import ImageDetailsForm, {
		type ImageDetailsValues,
	} from './ImageDetailsForm.svelte';
	import {
		listImages,
		uploadImage,
		updateImageMeta,
		deleteImage,
		thumbnailURL,
		bgStyle,
		type ImageRecord,
	} from '$lib/client/images';

	interface Props {
		open: boolean;
		onSelect?: (image: ImageRecord) => void;
		title?: string;
	}

	let { open = $bindable(false), onSelect, title = 'Media Library' }: Props = $props();

	const thisYear = String(new Date().getUTCFullYear());
	let year = $state(thisYear);
	let images = $state<ImageRecord[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let search = $state('');
	let uploading = $state<File[]>([]);
	let uploadError = $state<string | null>(null);
	let dragOver = $state(false);
	let editingImage = $state<ImageRecord | null>(null);
	let savingMeta = $state(false);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);

	const years = $derived.by(() => {
		const set = new Set<string>([thisYear, year]);
		const current = Number(thisYear);
		for (let y = current; y >= current - 4; y--) set.add(String(y));
		return Array.from(set).sort((a, b) => Number(b) - Number(a));
	});

	const filtered = $derived(
		search.trim()
			? images.filter((img) => {
					const q = search.trim().toLowerCase();
					return (
						(img.file_name?.toLowerCase().includes(q) ?? false) ||
						(img.alt_text?.toLowerCase().includes(q) ?? false) ||
						(img.caption?.toLowerCase().includes(q) ?? false) ||
						img.slug.toLowerCase().includes(q)
					);
				})
			: images,
	);

	$effect(() => {
		if (open) void refresh();
	});

	$effect(() => {
		if (open) {
			// year is reactive — re-fetch whenever it changes
			year;
			void refresh();
		}
	});

	async function refresh() {
		loading = true;
		loadError = null;
		try {
			const { images: list } = await listImages(year);
			images = list;
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Failed to load images';
		} finally {
			loading = false;
		}
	}

	async function handleFiles(files: FileList | File[]) {
		uploadError = null;
		const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
		if (list.length === 0) return;
		uploading = [...uploading, ...list];
		try {
			for (const file of list) {
				const record = await uploadImage(file);
				if (record.year === year) {
					images = [record, ...images.filter((i) => i.path !== record.path)];
				} else {
					// Uploaded into the current calendar year; switch view if needed
					year = record.year;
				}
				uploading = uploading.filter((f) => f !== file);
			}
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Upload failed';
		} finally {
			uploading = [];
		}
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		const files = event.dataTransfer?.files;
		if (files && files.length > 0) void handleFiles(files);
	}

	function onPickFiles() {
		fileInput?.click();
	}

	function onFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) void handleFiles(target.files);
		target.value = '';
	}

	function startEditMeta(image: ImageRecord) {
		editingImage = image;
	}

	function cancelEditMeta() {
		if (savingMeta) return;
		editingImage = null;
	}

	async function saveMeta(values: ImageDetailsValues) {
		if (!editingImage) return;
		const target = editingImage;
		savingMeta = true;
		try {
			const updated = await updateImageMeta(target.path, {
				alt: values.alt,
				caption: values.caption,
			});
			images = images.map((i) => (i.path === target.path ? updated : i));
			editingImage = null;
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Failed to update image';
		} finally {
			savingMeta = false;
		}
	}

	async function remove(image: ImageRecord) {
		const ok = await alert({
			title: 'Delete image?',
			message: `“${image.file_name ?? image.slug}” will be removed from your library. This can’t be undone.`,
			continueText: 'Delete',
			destructive: true,
		});
		if (!ok) return;
		try {
			await deleteImage(image.path);
			images = images.filter((i) => i.path !== image.path);
		} catch (err) {
			uploadError = err instanceof Error ? err.message : 'Delete failed';
		}
	}

	function pick(image: ImageRecord) {
		onSelect?.(image);
		open = false;
	}
</script>

<Modal
	bind:open
	{title}
	width="min(960px, 100vw - 2rem)"
	height="min(80vh, 760px)"
	maxWidth="100vw"
	maxHeight="100svh">
	<div class="library" class:has-side={!!editingImage}>
		<div class="library-main">
			<div class="toolbar">
			<div class="toolbar-left">
				<label class="year-label" for="media-year">Year</label>
				<select id="media-year" bind:value={year} class="year-select">
					{#each years as y}
						<option value={y}>{y}</option>
					{/each}
				</select>
				<div class="search">
					<Input placeholder="Search by name or alt..." bind:value={search} />
				</div>
			</div>
			<div class="toolbar-right">
				<Button onclick={onPickFiles}>Upload</Button>
				<input
					bind:this={fileInput}
					type="file"
					accept="image/*"
					multiple
					hidden
					onchange={onFileChange} />
			</div>
		</div>

		{#if uploadError}
			<div class="error">{uploadError}</div>
		{/if}

		<div
			class="dropzone"
			class:active={dragOver}
			role="region"
			aria-label="Drop images to upload"
			ondragenter={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragover={(e) => {
				e.preventDefault();
				dragOver = true;
			}}
			ondragleave={() => (dragOver = false)}
			ondrop={onDrop}>
			{#if loading}
				<div class="grid">
					{#each Array(8) as _}
						<div class="tile skeleton"></div>
					{/each}
				</div>
			{:else if loadError}
				<div class="empty">
					<p>{loadError}</p>
					<Button onclick={refresh}>Retry</Button>
				</div>
			{:else if images.length === 0 && uploading.length === 0}
				<div class="empty">
					<p>No images in {year} yet.</p>
					<p class="hint">Drop files here or click Upload to add the first.</p>
				</div>
			{:else}
				<div class="grid">
					{#each uploading as file}
						<div class="tile uploading">
							<div class="upload-status">Uploading {file.name}…</div>
						</div>
					{/each}
					{#each filtered as image (image.path)}
						<div
							class="tile"
							style={bgStyle(image)}
							style:aspect-ratio={image.aspect_ratio || 1}
							role="button"
							tabindex="0"
							onclick={() => pick(image)}
							ondblclick={() => pick(image)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									pick(image);
								}
							}}>
							<img src={thumbnailURL(image)} alt={image.alt_text ?? ''} loading="lazy" />
							<div class="tile-overlay">
								<div class="tile-name">{image.file_name ?? image.slug}</div>
								<div class="tile-actions">
									<button
										type="button"
										class="overlay-btn"
										title="Edit alt text and caption"
										onclick={(e) => {
											e.stopPropagation();
											startEditMeta(image);
										}}
										aria-label="Edit alt text and caption">
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											width="16"
											height="16">
											<path
												d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
										</svg>
									</button>
									<button
										type="button"
										class="overlay-btn danger"
										title="Delete image"
										onclick={(e) => {
											e.stopPropagation();
											remove(image);
										}}
										aria-label="Delete image">
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											width="16"
											height="16">
											<polyline points="3 6 5 6 21 6" />
											<path
												d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
										</svg>
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
				{#if dragOver}
					<div class="drop-hint" aria-hidden="true">Drop images to upload</div>
				{/if}
			{/if}
			</div>
		</div>

		{#if editingImage}
			<aside class="library-side" aria-label="Image details">
				<ImageDetailsForm
					previewSrc={thumbnailURL(editingImage)}
					previewAlt={editingImage.alt_text}
					previewStyle={bgStyle(editingImage)}
					alt={editingImage.alt_text ?? ''}
					caption={editingImage.caption ?? ''}
					saving={savingMeta}
					showBack
					onSave={saveMeta}
					onCancel={cancelEditMeta} />
			</aside>
		{/if}
	</div>
</Modal>

<style>
	.library {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 100%;
		height: 100%;
		min-height: 0;
		gap: var(--space-4);
	}

	.library-main {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-height: 0;
		min-width: 0;
	}

	.library-side {
		min-height: 0;
		min-width: 0;
		display: flex;
		flex-direction: column;
		padding-left: var(--space-4);
		border-left: 1px solid var(--color-border);
	}

	@media (min-width: 768px) {
		.library.has-side {
			grid-template-columns: minmax(0, 1fr) minmax(320px, 380px);
		}
	}

	@media (max-width: 767px) {
		.library.has-side .library-main {
			display: none;
		}
		.library-side {
			padding-left: 0;
			border-left: none;
		}
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.toolbar-left {
		display: flex;
		align-items: end;
		gap: var(--space-3);
		flex: 1;
		min-width: 0;
	}

	.toolbar-right {
		display: flex;
		gap: var(--space-2);
	}

	.year-label {
		display: block;
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		margin-bottom: var(--space-1);
	}

	.year-select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text);
		font-size: var(--text-sm);
	}

	.search {
		flex: 1;
		min-width: 180px;
	}

	.error {
		padding: var(--space-2) var(--space-3);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	.dropzone {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-2);
		border: 2px dashed transparent;
		border-radius: var(--radius-md);
		transition: border-color var(--transition-fast), background var(--transition-fast);
	}

	.dropzone.active {
		border-color: var(--color-accent);
		background: color-mix(in oklch, var(--color-accent) 8%, transparent);
	}

	.empty {
		text-align: center;
		padding: var(--space-12) var(--space-4);
		color: var(--color-text-secondary);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.empty .hint {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--space-3);
	}

	.tile {
		position: relative;
		display: block;
		width: 100%;
		border: none;
		padding: 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		background: var(--color-surface);
		text-align: left;
	}

	.tile.skeleton {
		aspect-ratio: 1;
		background: color-mix(in oklch, var(--color-text) 6%, transparent);
		animation: pulse 1.4s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	.tile.uploading {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-secondary);
		font-size: var(--text-xs);
		color: var(--color-text-secondary);
		padding: var(--space-2);
		text-align: center;
	}

	.tile img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.tile-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--space-2);
		background: linear-gradient(to top, rgba(0, 0, 0, 0.75), transparent);
		color: white;
		opacity: 0;
		transition: opacity var(--transition-fast);
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: var(--space-2);
	}

	.tile:hover .tile-overlay,
	.tile:focus-visible .tile-overlay {
		transition-duration: 0s;
		opacity: 1;
	}

	.tile-name {
		font-size: var(--text-xs);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
	}

	.tile-actions {
		display: flex;
		gap: var(--space-1);
	}

	.overlay-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		border: none;
		border-radius: var(--radius-sm);
		background: rgba(255, 255, 255, 0.16);
		color: white;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.overlay-btn:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.28);
	}

	.overlay-btn.danger:hover {
		transition-duration: 0s;
		background: var(--color-error);
	}

	.drop-hint {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-accent);
		pointer-events: none;
		background: color-mix(in oklch, var(--color-accent) 4%, transparent);
		border-radius: var(--radius-md);
	}
</style>
