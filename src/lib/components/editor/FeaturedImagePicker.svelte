<script lang="ts">
	import MediaLibrary from '$lib/components/media/MediaLibrary.svelte';
	import { prompt } from '$lib/components/dialogs';
	import { bgStyle, type ImageRecord } from '$lib/client/images';

	interface Props {
		image: ImageRecord | null;
		/** Horizontal focal point (0–100 %) controlling `object-position`. */
		focalX?: number;
		/** Vertical focal point (0–100 %) controlling `object-position`. */
		focalY?: number;
		onChange?: (image: ImageRecord | null) => void;
		onFocalChange?: (x: number, y: number) => void;
	}

	let { image, focalX = 50, focalY = 50, onChange, onFocalChange }: Props = $props();

	let libraryOpen = $state(false);
	let focused = $state(false);
	let repositioning = $state(false);
	let figureEl: HTMLElement | undefined = $state();

	// Local copies during a drag so commit-on-Done feels stable. The $effect
	// below seeds these from the props whenever the parent's focal changes
	// (e.g. on image swap) and we're not mid-drag.
	let dragX = $state(50);
	let dragY = $state(50);

	$effect(() => {
		if (!repositioning) {
			dragX = focalX;
			dragY = focalY;
		}
	});

	const displayX = $derived(repositioning ? dragX : focalX);
	const displayY = $derived(repositioning ? dragY : focalY);
	const objectPos = $derived(`${displayX}% ${displayY}%`);

	function openLibrary() {
		libraryOpen = true;
	}

	function handlePick(picked: ImageRecord) {
		onChange?.(picked);
		// New image — reset focal to center so the saved offset doesn't carry over.
		onFocalChange?.(50, 50);
		dragX = 50;
		dragY = 50;
	}

	function clearImage() {
		onChange?.(null);
		repositioning = false;
	}

	async function handleAltEdit() {
		if (!image) return;
		const next = await prompt({
			title: 'Cover image alt text',
			message:
				'A short description used by screen readers and shown if the image fails to load.',
			value: image.alt_text ?? '',
			placeholder: 'Describe the image…',
		});
		if (next === null) return;
		const cleaned = next.trim();
		onChange?.({ ...image, alt_text: cleaned || null });
	}

	function toggleReposition() {
		if (!image) return;
		if (repositioning) {
			onFocalChange?.(dragX, dragY);
			repositioning = false;
		} else {
			dragX = focalX;
			dragY = focalY;
			repositioning = true;
		}
	}

	function cancelReposition() {
		dragX = focalX;
		dragY = focalY;
		repositioning = false;
	}

	function recenter() {
		dragX = 50;
		dragY = 50;
	}

	function clamp(n: number, lo: number, hi: number) {
		return Math.max(lo, Math.min(hi, n));
	}

	// Drag state — `dragging` is reactive because it drives the cursor class.
	let dragging = $state(false);
	let activePointerId: number | null = null;
	let startPx = { x: 0, y: 0 };
	let startFocal = { x: 50, y: 50 };
	let overflow = { x: 0, y: 0 };

	function computeOverflow(): { x: number; y: number } {
		if (!figureEl || !image || !image.width || !image.height) return { x: 0, y: 0 };
		const rect = figureEl.getBoundingClientRect();
		const cW = rect.width;
		const cH = rect.height;
		if (!cW || !cH) return { x: 0, y: 0 };
		const imgR = image.width / image.height;
		const cR = cW / cH;
		if (imgR > cR) {
			// Wider than container — horizontal overflow.
			const scale = cH / image.height;
			return { x: Math.max(0, image.width * scale - cW), y: 0 };
		}
		// Taller (or equal) — vertical overflow.
		const scale = cW / image.width;
		return { x: 0, y: Math.max(0, image.height * scale - cH) };
	}

	function onPointerDown(e: PointerEvent) {
		if (!repositioning || !image) return;
		// Only handle primary button.
		if (e.button !== 0 && e.pointerType === 'mouse') return;
		overflow = computeOverflow();
		if (!overflow.x && !overflow.y) return; // Image already fits — nothing to pan.
		e.preventDefault();
		e.stopPropagation();
		dragging = true;
		activePointerId = e.pointerId;
		startPx = { x: e.clientX, y: e.clientY };
		startFocal = { x: dragX, y: dragY };
		try {
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		} catch {
			// no-op
		}
	}

	function onPointerMove(e: PointerEvent) {
		if (!dragging || e.pointerId !== activePointerId) return;
		const dx = e.clientX - startPx.x;
		const dy = e.clientY - startPx.y;
		// Dragging the image right (positive dx) shifts the image right inside the
		// frame, which means we're revealing more of the LEFT side of the original —
		// object-position X% decreases. Same logic for Y.
		let nextX = startFocal.x;
		let nextY = startFocal.y;
		if (overflow.x > 0) nextX = clamp(startFocal.x - (dx / overflow.x) * 100, 0, 100);
		if (overflow.y > 0) nextY = clamp(startFocal.y - (dy / overflow.y) * 100, 0, 100);
		dragX = nextX;
		dragY = nextY;
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging || e.pointerId !== activePointerId) return;
		dragging = false;
		activePointerId = null;
		try {
			(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		} catch {
			// no-op
		}
		// Don't commit until the user clicks Done — keeps the gesture exploratory.
	}

	function onKeyDown(e: KeyboardEvent) {
		if (!image) return;
		if (repositioning) {
			if (e.key === 'Escape') {
				e.preventDefault();
				cancelReposition();
				return;
			}
			if (e.key === 'Enter') {
				e.preventDefault();
				toggleReposition();
				return;
			}
			return;
		}
		// Only handle delete / backspace when this picker has focus.
		if (!focused) return;
		if (e.key === 'Delete' || e.key === 'Backspace') {
			e.preventDefault();
			clearImage();
		}
	}

	// Image either has horizontal overflow, vertical, or neither (perfect fit).
	const overflowHint = $derived.by(() => {
		if (!image || !image.width || !image.height) return '';
		const COVER_RATIO = 2.35;
		const imgR = image.width / image.height;
		if (Math.abs(imgR - COVER_RATIO) < 0.01)
			return 'This image already fits the 2.35:1 frame.';
		if (imgR > COVER_RATIO) return 'Drag left or right to choose what to show.';
		return 'Drag up or down to choose what to show.';
	});
</script>

<svelte:window onkeydown={onKeyDown} />

<div
	class="featured"
	class:has-image={!!image}
	class:focused
	class:repositioning
	tabindex="0"
	role="button"
	aria-label={image ? 'Cover image — delete or backspace to remove' : 'Add a cover image'}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
	onclick={(e) => {
		if (repositioning) return;
		if ((e.target as HTMLElement).closest('button')) return;
		openLibrary();
	}}
	onkeydown={(e) => {
		if (repositioning) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openLibrary();
		}
	}}>
	{#if image}
		<figure
			bind:this={figureEl}
			class="featured-figure"
			class:grab={repositioning}
			class:grabbing={dragging}
			style={bgStyle(image)}
			onpointerdown={onPointerDown}
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointercancel={onPointerUp}>
			<img
				src={`/cdn/image/${image.path}/default`}
				alt={image.alt_text ?? ''}
				draggable="false"
				loading="eager"
				decoding="async"
				style:object-position={objectPos} />

			{#if repositioning}
				<div class="reposition-overlay" aria-hidden="true">
					<div class="reposition-hint">{overflowHint}</div>
					<div class="reposition-readout">
						focus {Math.round(displayX)}% × {Math.round(displayY)}%
					</div>
				</div>
				<div
					class="featured-toolbar repo-toolbar"
					role="toolbar"
					tabindex="-1"
					aria-label="Adjust focus controls"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}
					onpointerdown={(e) => e.stopPropagation()}>
					<button type="button" class="ft-btn" onclick={recenter} title="Center">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<circle cx="12" cy="12" r="9" />
							<circle cx="12" cy="12" r="1.5" fill="currentColor" />
						</svg>
						<span>Center</span>
					</button>
					<button
						type="button"
						class="ft-btn"
						onclick={cancelReposition}
						title="Cancel (Esc)">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
						<span>Cancel</span>
					</button>
					<button
						type="button"
						class="ft-btn primary"
						onclick={toggleReposition}
						title="Save focus (Enter)">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<polyline points="20 6 9 17 4 12" />
						</svg>
						<span>Done</span>
					</button>
				</div>
			{:else}
				<div
					class="featured-toolbar"
					role="toolbar"
					tabindex="-1"
					aria-label="Cover image controls"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.stopPropagation()}>
					<button
						type="button"
						class="ft-btn"
						onclick={toggleReposition}
						title="Drag to choose what part of the image is shown">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<polyline points="5 9 2 12 5 15" />
							<polyline points="9 5 12 2 15 5" />
							<polyline points="15 19 12 22 9 19" />
							<polyline points="19 9 22 12 19 15" />
							<line x1="2" y1="12" x2="22" y2="12" />
							<line x1="12" y1="2" x2="12" y2="22" />
						</svg>
						<span>Reposition</span>
					</button>
					<button
						type="button"
						class="ft-btn"
						onclick={openLibrary}
						title="Replace image">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<polyline points="23 4 23 10 17 10" />
							<polyline points="1 20 1 14 7 14" />
							<path
								d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
						</svg>
						<span>Replace</span>
					</button>
					<button
						type="button"
						class="ft-btn"
						onclick={handleAltEdit}
						title="Edit alt text">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<path
								d="M12 20h9M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
						</svg>
						<span>Alt</span>
					</button>
					<button
						type="button"
						class="ft-btn danger"
						onclick={clearImage}
						title="Remove cover">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							width="14"
							height="14">
							<polyline points="3 6 5 6 21 6" />
							<path
								d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
						</svg>
					</button>
				</div>
			{/if}
		</figure>
	{:else}
		<div class="placeholder">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				width="42"
				height="42"
				aria-hidden="true">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<circle cx="8.5" cy="8.5" r="1.5" />
				<polyline points="21 15 16 10 5 21" />
			</svg>
			<div class="placeholder-text">
				<div class="placeholder-title">Add a cover image</div>
				<div class="placeholder-sub">
					Click to choose from your media library or upload a new one
				</div>
			</div>
		</div>
	{/if}
</div>

<MediaLibrary bind:open={libraryOpen} onSelect={handlePick} title="Choose Cover Image" />

<style>
	.featured {
		position: relative;
		display: block;
		width: 100%;
		max-width: var(--measure);
		margin: 0 auto var(--space-8);
		border-radius: var(--radius-lg);
		cursor: pointer;
		text-align: left;
		background: transparent;
		border: none;
		padding: 0;
		outline: none;
	}

	.featured.repositioning {
		cursor: default;
	}

	.featured:focus-visible {
		outline: none;
	}

	.placeholder {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-7);
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-muted);
		background: var(--color-bg-muted);
		transition:
			border-color 150ms ease,
			color 150ms ease,
			background 150ms ease;
		aspect-ratio: 2.35;
		justify-content: center;
	}

	.featured:hover .placeholder,
	.featured.focused .placeholder {
		transition-duration: 0s;
		border-color: var(--color-action);
		color: var(--color-action);
		background: var(--color-action-bg);
	}

	.placeholder-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.placeholder-title {
		font-size: var(--text-base);
		font-weight: 600;
	}

	.placeholder-sub {
		font-size: var(--text-sm);
		color: var(--color-text-muted);
	}

	.featured-figure {
		position: relative;
		display: block;
		margin: 0;
		overflow: hidden;
		border-radius: var(--radius-lg);
		background: var(--color-bg-muted);
		aspect-ratio: 2.35;
		touch-action: pan-y;
	}

	.featured-figure.grab {
		cursor: grab;
		touch-action: none;
	}
	.featured-figure.grabbing {
		cursor: grabbing;
	}

	.featured-figure img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		user-select: none;
		-webkit-user-drag: none;
	}

	.reposition-overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.35) 0%,
			rgba(0, 0, 0, 0) 25%,
			rgba(0, 0, 0, 0) 75%,
			rgba(0, 0, 0, 0.35) 100%
		);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: var(--space-2) var(--space-3);
	}

	.reposition-hint {
		color: white;
		font-size: var(--text-xs);
		font-weight: 600;
		letter-spacing: 0.02em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	.reposition-readout {
		align-self: flex-end;
		color: white;
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
		padding: 2px var(--space-2);
		background: rgba(0, 0, 0, 0.45);
		border-radius: var(--radius-full);
		backdrop-filter: blur(4px);
	}

	.featured-toolbar {
		position: absolute;
		top: var(--space-2);
		right: var(--space-2);
		display: flex;
		gap: 2px;
		padding: 4px;
		background: rgba(0, 0, 0, 0.55);
		border-radius: var(--radius-md);
		backdrop-filter: blur(8px);
		opacity: 0;
		transition: opacity 150ms ease;
	}

	.featured:hover .featured-toolbar,
	.featured.focused .featured-toolbar,
	.featured.repositioning .featured-toolbar {
		transition-duration: 0s;
		opacity: 1;
	}

	.repo-toolbar {
		opacity: 1;
	}

	.ft-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm);
		color: white;
		font-size: var(--text-xs);
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease;
	}

	.ft-btn:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.18);
	}
	.ft-btn.primary {
		background: var(--color-action);
	}
	.ft-btn.primary:hover {
		transition-duration: 0s;
		background: var(--color-action);
		filter: brightness(1.1);
	}
	.ft-btn.danger:hover {
		transition-duration: 0s;
		background: var(--color-error);
	}
</style>
