<script lang="ts">
	import { Modal, Button } from '@delightstack/components/actions';
	import { Input } from '@delightstack/components/form';
	import {
		listVideos,
		uploadVideoFile,
		videoPosterURL,
		humanizeVideoSlug,
		slugifyVideoFilename,
		type VideoRecord,
	} from '$lib/client/videos';
	import { encodeVideoToHls, type VideoEncodeProgress } from '$lib/client/videoEncode';

	interface Props {
		open: boolean;
		/** Called with the chosen video (existing or freshly uploaded). */
		onSelect?: (video: VideoRecord) => void;
		title?: string;
	}

	let { open = $bindable(false), onSelect, title = 'Video Library' }: Props = $props();

	let videos = $state<VideoRecord[]>([]);
	let loading = $state(false);
	let loadError = $state<string | null>(null);
	let search = $state('');
	let dragOver = $state(false);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	// Posters that failed to load (e.g. very short videos have none) fall back
	// to a film-strip glyph instead of a broken-image icon.
	let brokenPosters = $state<Set<string>>(new Set());

	// One encode at a time — HLS encoding saturates the machine anyway.
	let encoding = $state<{ fileName: string; slug: string } | null>(null);
	let encodeProgress = $state<VideoEncodeProgress | null>(null);
	let encodeError = $state<string | null>(null);

	const filtered = $derived(
		search.trim()
			? videos.filter((v) => {
					const q = search.trim().toLowerCase();
					return v.name.toLowerCase().includes(q) || v.slug.toLowerCase().includes(q);
				})
			: videos,
	);

	$effect(() => {
		if (open) void refresh();
	});

	async function refresh() {
		loading = true;
		loadError = null;
		try {
			videos = await listVideos();
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Failed to load videos';
		} finally {
			loading = false;
		}
	}

	function pick(video: VideoRecord) {
		onSelect?.(video);
		open = false;
	}

	function uniqueSlug(base: string): string {
		const taken = new Set(videos.map((v) => v.slug));
		if (!taken.has(base)) return base;
		for (let i = 2; i < 100; i++) {
			if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
		}
		return `${base}-${Date.now()}`;
	}

	async function handleFile(file: File) {
		if (encoding) return;
		encodeError = null;
		const slug = uniqueSlug(slugifyVideoFilename(file.name));
		encoding = { fileName: file.name, slug };
		encodeProgress = null;
		try {
			await encodeVideoToHls(file, {
				upload: (path, data) => uploadVideoFile(slug, path, data),
				onProgress: (p) => (encodeProgress = p),
			});
			const record: VideoRecord = { slug, name: humanizeVideoSlug(slug) };
			videos = [record, ...videos.filter((v) => v.slug !== slug)];
			// The upload was started with intent to insert — do it even if the
			// user closed the modal while the encode was running.
			onSelect?.(record);
			open = false;
		} catch (err) {
			encodeError = err instanceof Error ? err.message : 'Video encoding failed';
		} finally {
			encoding = null;
			encodeProgress = null;
		}
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		const file = Array.from(event.dataTransfer?.files ?? []).find(
			(f) => f.type.startsWith('video/') || /\.(mp4|mov|m4v|webm|mkv)$/i.test(f.name),
		);
		if (file) void handleFile(file);
	}

	function onFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) void handleFile(file);
		target.value = '';
	}

	function markBroken(slug: string) {
		brokenPosters = new Set(brokenPosters).add(slug);
	}

	const progressLabel = $derived.by(() => {
		const p = encodeProgress;
		if (!p) return 'Preparing…';
		switch (p.phase) {
			case 'preparing':
				return 'Analyzing video…';
			case 'stills':
				return 'Generating poster and thumbnails…';
			case 'encoding':
				return `Encoding ${Math.round(p.progress * 100)}%`;
			case 'finishing':
				return 'Finishing upload…';
		}
	});
</script>

<Modal
	bind:open
	{title}
	class="video-modal"
	width="min(1000px, 100vw - 2rem)"
	height="min(80vh, 760px)"
	maxWidth="100vw"
	maxHeight="calc(100svh - 1.5rem)">
	<div class="library">
		<div class="toolbar">
			<div class="search">
				<Input placeholder="Search videos..." bind:value={search} />
			</div>
			<Button transparent onclick={() => fileInput?.click()} disabled={!!encoding}>
				<svg
					class="upload-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
					<polyline points="17 8 12 3 7 8" />
					<line x1="12" y1="3" x2="12" y2="15" />
				</svg>
				Upload
			</Button>
			<input
				bind:this={fileInput}
				type="file"
				accept="video/*,.mp4,.mov,.m4v,.webm,.mkv"
				hidden
				onchange={onFileChange} />
		</div>

		{#if encoding}
			<div class="encode-panel">
				<div class="encode-spinner" aria-hidden="true"></div>
				<div class="encode-info">
					<div class="encode-title">Encoding “{encoding.fileName}” → {encoding.slug}</div>
					<div class="encode-status">
						{progressLabel}
						{#if encodeProgress && encodeProgress.filesUploaded > 0}
							· {encodeProgress.filesUploaded} file{encodeProgress.filesUploaded === 1
								? ''
								: 's'} uploaded
						{/if}
					</div>
					<div class="encode-bar">
						<div
							class="encode-bar-fill"
							style:width="{Math.round((encodeProgress?.progress ?? 0) * 100)}%">
						</div>
					</div>
					<div class="encode-hint">
						Keep this page open — the video is encoded in your browser.
					</div>
				</div>
			</div>
		{/if}

		{#if encodeError}
			<div class="error">{encodeError}</div>
		{/if}

		<div
			class="dropzone"
			class:active={dragOver}
			role="region"
			aria-label="Drop a video to upload"
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
					{#each Array(6) as _}
						<div class="tile skeleton"></div>
					{/each}
				</div>
			{:else if loadError}
				<div class="empty">
					<p>{loadError}</p>
					<Button onclick={refresh}>Retry</Button>
				</div>
			{:else if videos.length === 0}
				<div class="empty">
					<p>No videos yet.</p>
					<p class="hint">Drop a video file here or click Upload to encode the first.</p>
				</div>
			{:else}
				<div class="grid">
					{#each filtered as video (video.slug)}
						<div
							class="tile"
							role="button"
							tabindex="0"
							title={video.slug}
							onclick={() => pick(video)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									pick(video);
								}
							}}>
							{#if brokenPosters.has(video.slug)}
								<div class="poster-fallback" aria-hidden="true">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										width="36"
										height="36">
										<rect x="2" y="5" width="20" height="14" rx="2" />
										<polygon points="10 9 15 12 10 15" fill="currentColor" stroke="none" />
									</svg>
								</div>
							{:else}
								<img
									src={videoPosterURL(video.slug)}
									alt={video.name}
									loading="lazy"
									onerror={() => markBroken(video.slug)} />
							{/if}
							<span class="tile-play" aria-hidden="true"></span>
							<div class="tile-overlay">
								<div class="tile-name">{video.name}</div>
							</div>
						</div>
					{/each}
				</div>
				{#if dragOver}
					<div class="drop-hint" aria-hidden="true">Drop a video to upload</div>
				{/if}
			{/if}
		</div>
	</div>
</Modal>

<style>
	:global(.modal.video-modal .modal-body) {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.library {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-height: 0;
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: var(--space-2);
	}

	.search {
		flex: 1;
		min-width: 180px;
		max-width: 380px;
	}

	.upload-icon {
		width: 1.15em;
		height: 1.15em;
		flex-shrink: 0;
	}

	.error {
		padding: var(--space-2);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--text-sm);
	}

	/* ── Encoding progress ─────────────────────────────────────────────── */
	.encode-panel {
		display: flex;
		gap: var(--space-3);
		align-items: center;
		padding: var(--space-3);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-muted);
	}

	.encode-spinner {
		width: 32px;
		height: 32px;
		flex-shrink: 0;
		border: 3px solid color-mix(in oklch, var(--color-action) 25%, transparent);
		border-top-color: var(--color-action);
		border-radius: 50%;
		animation: vl-spin 800ms linear infinite;
	}

	@keyframes vl-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.encode-info {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.encode-title {
		font-size: var(--text-sm);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.encode-status {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.encode-bar {
		height: 6px;
		border-radius: var(--radius-full);
		background: color-mix(in oklch, var(--color-text) 12%, transparent);
		overflow: hidden;
	}

	.encode-bar-fill {
		height: 100%;
		background: var(--color-action);
		border-radius: inherit;
		transition: width 300ms ease;
	}

	.encode-hint {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	/* ── Grid ───────────────────────────────────────────────────────────── */
	.dropzone {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: var(--space-2);
		border: 2px dashed transparent;
		border-radius: var(--radius-md);
		transition: border-color var(--duration-fast), background var(--duration-fast);
	}

	.dropzone.active {
		border-color: var(--color-action);
		background: color-mix(in oklch, var(--color-action) 8%, transparent);
	}

	.empty {
		text-align: center;
		padding: var(--space-8) var(--space-3);
		color: var(--color-text-muted);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
	}

	.empty .hint {
		font-size: var(--text-sm);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--space-2);
	}

	.tile {
		position: relative;
		aspect-ratio: 16 / 9;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		background: color-mix(in oklch, var(--color-text) 9%, var(--color-bg-muted));
	}

	.tile.skeleton {
		background: color-mix(in oklch, var(--color-text) 6%, transparent);
		animation: vl-pulse 1.4s ease-in-out infinite;
	}

	@keyframes vl-pulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	.tile img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.poster-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.tile-play {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 40px;
		height: 40px;
		transform: translate(-50%, -50%);
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		border: 1.5px solid rgba(255, 255, 255, 0.9);
		pointer-events: none;
		opacity: 0;
		transition: opacity var(--duration-fast);
	}

	.tile-play::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 55%;
		transform: translate(-50%, -50%);
		border-style: solid;
		border-width: 7px 0 7px 11px;
		border-color: transparent transparent transparent #fff;
	}

	.tile:hover .tile-play,
	.tile:focus-visible .tile-play {
		opacity: 1;
	}

	.tile-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: var(--space-2);
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.75);
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
	}

	.tile-name {
		font-size: var(--text-xs);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-transform: capitalize;
	}

	.drop-hint {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--color-action);
		pointer-events: none;
		background: color-mix(in oklch, var(--color-action) 4%, transparent);
		border-radius: var(--radius-md);
	}

	:global(.modal.video-modal header h2) {
		font-size: var(--text-base, 1rem);
		font-weight: 600;
		white-space: nowrap;
	}
</style>
