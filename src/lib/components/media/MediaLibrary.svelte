<script lang="ts">
	import { Modal, Button, ButtonGroup, alert } from '@delightstack/components/actions';
	import { Input, Select } from '@delightstack/components/form';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';
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
		/** When set, the library runs in multi-select mode. */
		multiple?: boolean;
		/** Called with all chosen images when the user confirms a multi-select. */
		onSelectMany?: (images: ImageRecord[]) => void;
		/** Label for the multi-select confirm button (default "Add"). */
		confirmLabel?: string;
		/** Preload the multi-select with these records (order preserved). Used when
		 *  editing an existing gallery so you start from its current images. */
		initialSelection?: ImageRecord[];
		title?: string;
	}

	let {
		open = $bindable(false),
		onSelect,
		multiple = false,
		onSelectMany,
		confirmLabel = 'Add',
		initialSelection,
		title = 'Media Library',
	}: Props = $props();

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
	// Multi-select state (order preserved). Records are kept (not just paths) so
	// the selection survives switching the year filter mid-pick. In multi-select
	// the modal has two modes: 'select' (browse the library, toggle membership)
	// and 'reorder' (drag to reorder + remove the chosen images).
	let selected = $state<ImageRecord[]>([]);
	let mode = $state<'select' | 'reorder'>('select');

	function isSelected(path: string): boolean {
		return selected.some((i) => i.path === path);
	}

	function toggleSelect(image: ImageRecord) {
		selected = isSelected(image.path)
			? selected.filter((i) => i.path !== image.path)
			: [...selected, image];
	}

	function confirmMany() {
		onSelectMany?.(selected);
		open = false;
	}

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

	// Initialise on the rising edge of `open` (preload the selection for galleries)
	// and tear down on close. Tracking a manual edge avoids clobbering the live
	// selection whenever some other dependency of this effect changes.
	let wasOpen = false;
	$effect(() => {
		if (open && !wasOpen) {
			selected = initialSelection ? [...initialSelection] : [];
			mode = 'select';
			marked = new Set();
		} else if (!open && wasOpen) {
			selected = [];
			marked = new Set();
		}
		wasOpen = open;
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

	// ── Reorder mode: pointer-driven drag (lift / FLIP neighbours / velocity
	//    tilt / multi-select block move) operating directly on `selected` ──────
	// This lives in the modal, which is portaled outside ProseMirror, so nothing
	// fights the gesture (unlike an inline editor drag, which ProseMirror's own
	// block-drag preempts). Tiles are keyed by record identity, so reordering the
	// `selected` array animates via Svelte's FLIP.
	let marked = $state<Set<ImageRecord>>(new Set());
	let lastMarked: ImageRecord | null = null;

	type DragPending = {
		rec: ImageRecord;
		el: HTMLElement;
		x: number;
		y: number;
		id: number;
		shift: boolean;
		ctrl: boolean;
	};
	type DragState = {
		items: ImageRecord[]; // dragged block, in visual order
		id: number;
		offX: number;
		offY: number;
		cellW: number;
		cellH: number;
		px: number;
		py: number;
		rot: number;
		targetRot: number;
		lastX: number;
		lastT: number;
		dropping: boolean;
	};

	let dragPending: DragPending | null = null;
	let drag = $state<DragState | null>(null);
	let pressRec = $state<ImageRecord | null>(null);
	let reorderGridEl = $state<HTMLDivElement | undefined>(undefined);
	let raf = 0;
	let lastFrame = 0;
	// Right after a drop the pointer is still resting on the just-dropped tile, so
	// the hover-actions (✕) would snap in the instant the lifted card retires — a
	// jarring flash. Keep actions suppressed until the user actually moves again.
	let suppressActions = $state(false);

	const LIFT = 1.12;
	const ROT_GAIN = 6;
	const ROT_MAX = 14;
	const THRESH = 5;
	const FLIP_MS = 240;
	const DROP_MS = 210;
	const clampN = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

	const dragRecs = $derived(drag ? drag.items : []);

	function gridGeom() {
		const rect = reorderGridEl!.getBoundingClientRect();
		const s = getComputedStyle(reorderGridEl!);
		const tracks = s.gridTemplateColumns.split(' ').filter(Boolean);
		const cols = Math.max(1, tracks.length);
		const cellW = parseFloat(tracks[0]) || rect.width;
		const colGap = parseFloat(s.columnGap || s.gap) || 0;
		const rowGap = parseFloat(s.rowGap || s.gap) || 0;
		const padL = parseFloat(s.paddingLeft) || 0;
		const padT = parseFloat(s.paddingTop) || 0;
		return { rect, cols, cellW, cellH: cellW, colGap, rowGap, padL, padT };
	}

	/** Insertion index in [0, selected.length] — count of tiles before the pointer. */
	function pointerToInsert(x: number, y: number) {
		const g = gridGeom();
		const pRow = Math.max(0, Math.floor((y - g.rect.top - g.padT) / (g.cellH + g.rowGap)));
		let count = 0;
		for (let i = 0; i < selected.length; i++) {
			const tileRow = Math.floor(i / g.cols);
			if (tileRow < pRow) {
				count++;
				continue;
			}
			if (tileRow === pRow) {
				const tileCol = i % g.cols;
				const cx = g.rect.left + g.padL + tileCol * (g.cellW + g.colGap) + g.cellW / 2;
				if (x > cx) count++;
			}
		}
		return clampN(count, 0, selected.length);
	}

	function slotRect(idx: number) {
		const g = gridGeom();
		const col = idx % g.cols;
		const row = Math.floor(idx / g.cols);
		return {
			left: g.rect.left + g.padL + col * (g.cellW + g.colGap),
			top: g.rect.top + g.padT + row * (g.cellH + g.rowGap),
		};
	}

	function reorderTo(ins: number) {
		if (!drag) return;
		const items = drag.items;
		const block = selected.filter((r) => items.includes(r));
		const rest = selected.filter((r) => !items.includes(r));
		let bBefore = 0;
		selected.forEach((r, idx) => {
			if (idx < ins && items.includes(r)) bBefore++;
		});
		const insertIdx = clampN(ins - bBefore, 0, rest.length);
		const next = [...rest.slice(0, insertIdx), ...block, ...rest.slice(insertIdx)];
		for (let i = 0; i < next.length; i++) {
			if (next[i] !== selected[i]) {
				selected = next;
				return;
			}
		}
	}

	// Capture the pointer so every pointermove/up for the gesture is delivered to
	// one element — regardless of what's under the cursor, how the grid reorders
	// beneath the drag, or anything stopping event propagation on the way to
	// `window`. CRUCIAL: we capture on the *grid container*, not the pressed
	// tile. The tile's DOM node gets moved as the list reorders mid-drag, and
	// moving a capturing element fires `lostpointercapture` — which would abort
	// the drag the instant it reached a valid slot. The grid never moves, so
	// capture holds for the whole gesture.
	let captureEl: HTMLElement | null = null;

	function onTileDown(e: PointerEvent, rec: ImageRecord) {
		if (e.button !== 0 || drag) return;
		if ((e.target as HTMLElement).closest('.rtile-actions')) return;
		const tileEl = (e.target as HTMLElement).closest('.rtile') as HTMLElement | null;
		if (!tileEl) return;
		e.preventDefault();
		// Prefer the stable grid; fall back to the tile only if the ref is missing.
		const el = reorderGridEl ?? tileEl;
		try {
			el.setPointerCapture(e.pointerId);
		} catch {
			/* pointer already released — nothing to capture */
		}
		captureEl = el;
		el.addEventListener('pointermove', onCapMove);
		el.addEventListener('pointerup', onCapUp);
		el.addEventListener('pointercancel', onCapEnd);
		el.addEventListener('lostpointercapture', onLostCapture);
		pressRec = rec;
		dragPending = {
			rec,
			el: tileEl,
			x: e.clientX,
			y: e.clientY,
			id: e.pointerId,
			shift: e.shiftKey,
			ctrl: e.ctrlKey || e.metaKey,
		};
	}

	function onCapMove(e: PointerEvent) {
		if (drag) {
			if (e.pointerId !== drag.id) return;
			updateDrag(e);
			return;
		}
		if (!dragPending || e.pointerId !== dragPending.id) return;
		if (Math.hypot(e.clientX - dragPending.x, e.clientY - dragPending.y) < THRESH) return;
		startDrag(e);
	}

	function onCapUp(e: PointerEvent) {
		if (drag) {
			if (e.pointerId !== drag.id) return;
			endDrag();
			detachCapture();
			return;
		}
		if (dragPending && e.pointerId === dragPending.id) applyMark(dragPending);
		pressRec = null;
		dragPending = null;
		detachCapture();
	}

	function onCapEnd(e: PointerEvent) {
		// pointercancel — the browser truly abandoned the pointer (system gesture,
		// touch cancel). End the gesture safely.
		if (drag && e.pointerId === drag.id) endDrag();
		pressRec = null;
		dragPending = null;
		detachCapture();
	}

	function onLostCapture(e: PointerEvent) {
		// A normal pointerup releases capture too, but onCapUp has already detached
		// these listeners by the time `lostpointercapture` fires — so reaching here
		// while a drag is still live means capture was lost *spuriously* (e.g. a
		// browser quirk when the captured element's subtree mutates). Re-acquire it
		// so the drag keeps going instead of dropping mid-gesture. Only give up if
		// re-capture fails (pointer genuinely gone / element detached).
		if (!drag || e.pointerId !== drag.id || !captureEl) return;
		try {
			captureEl.setPointerCapture(e.pointerId);
		} catch {
			endDrag();
			pressRec = null;
			dragPending = null;
			detachCapture();
		}
	}

	function detachCapture() {
		const el = captureEl;
		if (!el) return;
		el.removeEventListener('pointermove', onCapMove);
		el.removeEventListener('pointerup', onCapUp);
		el.removeEventListener('pointercancel', onCapEnd);
		el.removeEventListener('lostpointercapture', onLostCapture);
		captureEl = null;
	}

	function startDrag(e: PointerEvent) {
		if (!dragPending) return;
		const rec = dragPending.rec;
		let items: ImageRecord[];
		if (marked.has(rec) && marked.size > 1) {
			items = selected.filter((r) => marked.has(r));
		} else {
			marked = new Set([rec]);
			lastMarked = rec;
			items = [rec];
		}
		const r = dragPending.el.getBoundingClientRect();
		const offX = dragPending.x - r.left;
		const offY = dragPending.y - r.top;
		drag = {
			items,
			id: dragPending.id,
			offX,
			offY,
			cellW: r.width,
			cellH: r.height,
			px: e.clientX - offX,
			py: e.clientY - offY,
			rot: 0,
			targetRot: 0,
			lastX: e.clientX,
			lastT: performance.now(),
			dropping: false,
		};
		pressRec = null;
		dragPending = null;
		reorderTo(pointerToInsert(e.clientX, e.clientY));
		lastFrame = performance.now();
		raf = requestAnimationFrame(frame);
	}

	function updateDrag(e: PointerEvent) {
		if (!drag) return;
		drag.px = e.clientX - drag.offX;
		drag.py = e.clientY - drag.offY;
		const now = performance.now();
		const dt = Math.max(1, now - drag.lastT);
		const vx = (e.clientX - drag.lastX) / dt;
		drag.targetRot = clampN(vx * ROT_GAIN, -ROT_MAX, ROT_MAX);
		drag.lastX = e.clientX;
		drag.lastT = now;
		reorderTo(pointerToInsert(e.clientX, e.clientY));
	}

	// Pendulum: swing toward the velocity target, decay it to 0 when the pointer
	// stops so the card settles level.
	function frame(now: number) {
		if (!drag) {
			raf = 0;
			return;
		}
		const dt = Math.min(64, now - lastFrame);
		lastFrame = now;
		if (!drag.dropping) {
			drag.targetRot *= Math.exp(-dt / 140);
			drag.rot += (drag.targetRot - drag.rot) * (1 - Math.exp(-dt / 45));
		}
		raf = requestAnimationFrame(frame);
	}

	function endDrag() {
		if (!drag) return;
		if (raf) {
			cancelAnimationFrame(raf);
			raf = 0;
		}
		const firstIdx = selected.findIndex((r) => drag!.items.includes(r));
		const tr = slotRect(Math.max(0, firstIdx));
		drag.dropping = true;
		drag.px = tr.left;
		drag.py = tr.top;
		drag.rot = 0;
		// `selected` already holds the final order (we reorder live), so there's
		// nothing to commit — just retire the overlay after it flies home. Suppress
		// the hover-actions in the same tick the card disappears so the ✕ doesn't
		// flash in on the tile the pointer is resting on; cleared on next move.
		window.setTimeout(() => {
			drag = null;
			suppressActions = true;
		}, DROP_MS);
	}

	function applyMark(p: DragPending) {
		const rec = p.rec;
		if (p.shift && lastMarked) {
			const a = selected.indexOf(lastMarked);
			const b = selected.indexOf(rec);
			if (a >= 0 && b >= 0) {
				const [lo, hi] = a < b ? [a, b] : [b, a];
				const ns = p.ctrl ? new Set(marked) : new Set<ImageRecord>();
				for (let i = lo; i <= hi; i++) ns.add(selected[i]);
				marked = ns;
			}
		} else if (p.ctrl) {
			const ns = new Set(marked);
			if (ns.has(rec)) ns.delete(rec);
			else ns.add(rec);
			marked = ns;
			lastMarked = rec;
		} else {
			marked = new Set([rec]);
			lastMarked = rec;
		}
	}

	function clearMarks() {
		if (marked.size) marked = new Set();
		lastMarked = null;
	}

	function removeRec(rec: ImageRecord) {
		selected = selected.filter((r) => r !== rec);
		if (marked.has(rec)) {
			const ns = new Set(marked);
			ns.delete(rec);
			marked = ns;
		}
	}

	// ── Marquee (rubber-band) selection ─────────────────────────────────────
	// Drag on empty space to sweep a rectangle. In "Choose images" it grows the
	// gallery selection (`selected`); in "Arrange" it marks tiles for a block
	// move (`marked`). Plain drag adds; holding Ctrl/⌘/Shift removes. The result
	// is always (snapshot ± swept), so prior picks are preserved and shrinking
	// the box restores them. In-house, no Selecto dependency; coords are
	// viewport-true (clientX/Y) and the rect is portaled to <body>.
	let marquee = $state<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
	let marqueePending: { x: number; y: number; id: number } | null = null;
	let marqueeMode: 'select' | 'reorder' = 'select';
	let marqueeSnapSelected: ImageRecord[] = [];
	let marqueeSnapMarked: Set<ImageRecord> = new Set();
	let marqueeEl: HTMLElement | null = null;
	const MARQUEE_THRESH = 6;

	function onGridDown(e: PointerEvent) {
		if (!multiple || e.button !== 0 || drag) return;
		const t = e.target as HTMLElement;
		// A press on a tile (or any control) is a click/drag, not a marquee.
		if (t.closest('.tile') || t.closest('.rtile') || t.closest('button') || t.closest('input'))
			return;
		// Stop the mouse press from starting a text selection on the sweep (touch
		// is left alone so the grid can still be scrolled with a finger).
		if (e.pointerType === 'mouse') e.preventDefault();
		marqueeEl = e.currentTarget as HTMLElement;
		marqueePending = { x: e.clientX, y: e.clientY, id: e.pointerId };
		marqueeEl.addEventListener('pointermove', onGridMove);
		marqueeEl.addEventListener('pointerup', onGridUp);
		marqueeEl.addEventListener('pointercancel', onGridUp);
		marqueeEl.addEventListener('lostpointercapture', onGridUp);
	}

	function onGridMove(e: PointerEvent) {
		if (!marqueePending || e.pointerId !== marqueePending.id) return;
		if (!marquee) {
			if (Math.hypot(e.clientX - marqueePending.x, e.clientY - marqueePending.y) < MARQUEE_THRESH)
				return;
			try {
				marqueeEl?.setPointerCapture(e.pointerId);
			} catch {
				/* pointer already released */
			}
			marqueeMode = mode;
			marqueeSnapSelected = [...selected];
			marqueeSnapMarked = new Set(marked);
			marquee = { x0: marqueePending.x, y0: marqueePending.y, x1: e.clientX, y1: e.clientY };
		} else {
			marquee = { ...marquee, x1: e.clientX, y1: e.clientY };
		}
		recomputeMarqueeSelection(e.ctrlKey || e.metaKey || e.shiftKey);
	}

	function onGridUp(e: PointerEvent) {
		if (marqueePending && e.pointerId !== marqueePending.id) return;
		const wasMarquee = !!marquee;
		marquee = null;
		marqueePending = null;
		detachMarquee();
		// A plain tap on empty space (no sweep) clears the reorder marks.
		if (!wasMarquee && mode === 'reorder') clearMarks();
	}

	function detachMarquee() {
		const el = marqueeEl;
		if (!el) return;
		el.removeEventListener('pointermove', onGridMove);
		el.removeEventListener('pointerup', onGridUp);
		el.removeEventListener('pointercancel', onGridUp);
		el.removeEventListener('lostpointercapture', onGridUp);
		marqueeEl = null;
	}

	function recomputeMarqueeSelection(subtract: boolean) {
		if (!marquee || !marqueeEl) return;
		const lx = Math.min(marquee.x0, marquee.x1);
		const rx = Math.max(marquee.x0, marquee.x1);
		const ty = Math.min(marquee.y0, marquee.y1);
		const by = Math.max(marquee.y0, marquee.y1);
		const sel = marqueeMode === 'reorder' ? '.rtile[data-path]' : '.tile[data-path]';
		const hit = new Set<string>();
		marqueeEl.querySelectorAll<HTMLElement>(sel).forEach((tile) => {
			const r = tile.getBoundingClientRect();
			if (r.left < rx && r.right > lx && r.top < by && r.bottom > ty) {
				if (tile.dataset.path) hit.add(tile.dataset.path);
			}
		});
		if (marqueeMode === 'reorder') {
			// Mark/unmark tiles (records live in `selected`) for a block move.
			const next = new Set(marqueeSnapMarked);
			for (const rec of selected) {
				if (!hit.has(rec.path)) continue;
				if (subtract) next.delete(rec);
				else next.add(rec);
			}
			marked = next;
		} else {
			const snapPaths = new Set(marqueeSnapSelected.map((i) => i.path));
			if (subtract) {
				selected = marqueeSnapSelected.filter((i) => !hit.has(i.path));
			} else {
				const added = filtered.filter((img) => hit.has(img.path) && !snapPaths.has(img.path));
				selected = [...marqueeSnapSelected, ...added];
			}
		}
	}

	onDestroy(() => {
		detachCapture();
		detachMarquee();
		if (raf) cancelAnimationFrame(raf);
	});

	function portal(node: HTMLElement) {
		if (typeof document === 'undefined') return;
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}
</script>

<Modal
	bind:open
	{title}
	class="media-modal"
	width="min(960px, 100vw - 2rem)"
	height="min(80vh, 760px)"
	maxWidth="100vw"
	maxHeight="100svh">
	{#snippet headerStart()}
		{#if multiple}
			<!-- Mode toggle lives in the header (just after the title) so the body
			     is all canvas. Translucent buttons keep it light against the bar. -->
			<div class="mode-tabs">
				<ButtonGroup size="0">
					<Button
						size="0"
						translucent
						active={mode === 'select'}
						accent={mode === 'select'}
						onclick={() => (mode = 'select')}>
						Choose images
					</Button>
					<Button
						size="0"
						translucent
						active={mode === 'reorder'}
						accent={mode === 'reorder'}
						disabled={selected.length === 0}
						onclick={() => (mode = 'reorder')}>
						Arrange{selected.length ? ` (${selected.length})` : ''}
					</Button>
				</ButtonGroup>
			</div>
		{/if}
	{/snippet}
	{#snippet headerEnd()}
		{#if multiple}
			<div class="header-actions">
				{#if selected.length}
					<Button size="0" translucent onclick={() => (selected = [])}>Clear</Button>
				{/if}
				<Button size="0" accent onclick={confirmMany} disabled={selected.length === 0}>
					{confirmLabel}
				</Button>
			</div>
		{/if}
	{/snippet}
	<div class="library" class:has-side={!!editingImage}>
		<div class="library-main">
			{#if multiple && mode === 'reorder'}
				<div class="reorder-scroll">
					{#if selected.length === 0}
						<div class="empty">
							<p>No images chosen yet.</p>
							<p class="hint">Switch to “Choose images” to add some.</p>
						</div>
					{:else}
						<div
							class="reorder-grid"
							class:is-dragging={!!drag}
							class:suppress-actions={suppressActions}
							class:marquee-active={!!marquee}
							bind:this={reorderGridEl}
							role="list"
							onpointermove={() => {
								if (suppressActions) suppressActions = false;
							}}
							onpointerdown={onGridDown}>
							{#each selected as rec (rec)}
								<div
									class="rtile"
									class:marked={marked.has(rec)}
									class:pressing={pressRec === rec}
									class:source={!!drag && drag.items.includes(rec)}
									animate:flip={{ duration: FLIP_MS, easing: cubicOut }}
									role="listitem"
									data-path={rec.path}
									onpointerdown={(e) => onTileDown(e, rec)}>
									<img src={thumbnailURL(rec)} alt={rec.alt_text ?? ''} draggable="false" />
									{#if marked.has(rec)}
										<span class="rtile-check" aria-hidden="true">✓</span>
									{/if}
									<div class="rtile-actions">
										<Button
											icon
											size="00"
											translucent
											tooltip="Remove from gallery"
											onclick={() => removeRec(rec)}>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												stroke-width="2.5"
												aria-hidden="true">
												<path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" />
											</svg>
										</Button>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else}
				<div class="toolbar">
			<div class="toolbar-left">
				<div class="year">
					<Select
						size="1"
						placeholder="Year"
						value={year}
						options={years.map((y) => ({ value: y, label: y }))}
						onchange={(d) => (year = String(d.value))} />
				</div>
				<div class="search">
					<Input placeholder="Search by name or alt..." bind:value={search} />
				</div>
			</div>
			<div class="toolbar-right">
				<Button transparent onclick={onPickFiles}>
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
			class:marquee-active={!!marquee}
			role="region"
			aria-label="Drop images to upload"
			onpointerdown={onGridDown}
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
							class:selected={multiple && isSelected(image.path)}
							data-path={image.path}
							role="button"
							tabindex="0"
							onclick={() => (multiple ? toggleSelect(image) : pick(image))}
							ondblclick={() => {
								if (!multiple) pick(image);
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									if (multiple) toggleSelect(image);
									else pick(image);
								}
							}}>
							<img src={thumbnailURL(image)} alt={image.alt_text ?? ''} loading="lazy" />
							{#if multiple}
								<div class="tile-check" aria-hidden="true">
									<svg
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="3"
										width="14"
										height="14">
										<polyline points="20 6 9 17 4 12" />
									</svg>
								</div>
							{/if}
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
			{/if}
		</div>

		{#if marquee}
			<!-- Rubber-band selection rectangle, portaled to <body> so its fixed
			     coords are viewport-true and it paints above the grid. -->
			<div
				class="marquee"
				use:portal
				style:left="{Math.min(marquee.x0, marquee.x1)}px"
				style:top="{Math.min(marquee.y0, marquee.y1)}px"
				style:width="{Math.abs(marquee.x1 - marquee.x0)}px"
				style:height="{Math.abs(marquee.y1 - marquee.y0)}px">
			</div>
		{/if}

		{#if drag}
			<!-- Lifted drag card, portaled to <body> so its fixed coords are
			     viewport-true and it paints above the modal. Two layers: the outer
			     carries only the translate (cursor follow); the inner carries the
			     lift/tilt scale + rotation. Keeping scale off the translated node is
			     what stops the card from lurching toward the origin on pickup — a
			     `scale` applied over a large translate shrinks the translate too. -->
			<div
				class="rfloat"
				class:multi={drag.items.length > 1}
				use:portal
				style:width="{drag.cellW}px"
				style:height="{drag.cellH}px"
				style:transform={`translate3d(${drag.px}px, ${drag.py}px, 0)`}
				style:transition={drag.dropping
					? `transform ${DROP_MS}ms cubic-bezier(.2,.7,.2,1)`
					: 'none'}>
				<div
					class="rfloat-inner"
					style:transform={`rotate(${drag.rot}deg) scale(${drag.dropping ? 1 : LIFT})`}
					style:transition={drag.dropping
						? `transform ${DROP_MS}ms cubic-bezier(.2,.7,.2,1)`
						: 'none'}>
					{#if dragRecs[1]}
						<!-- Stacked card peeking behind, for a multi-image drag. -->
						<img class="rfloat-back" src={thumbnailURL(dragRecs[1])} alt="" draggable="false" />
					{/if}
					{#if dragRecs[0]}
						<!-- Same contain + background + border as the tiles, so the card
						     reads identically to the slot it lands in (seamless drop). -->
						<div class="rfloat-card">
							<img class="rfloat-main" src={thumbnailURL(dragRecs[0])} alt="" draggable="false" />
						</div>
					{/if}
					{#if drag.items.length > 1}
						<span class="rfloat-count">{drag.items.length}</span>
					{/if}
				</div>
			</div>
		{/if}

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
	.upload-icon {
		width: 1.15em;
		height: 1.15em;
		flex-shrink: 0;
	}

	.year {
		width: 7rem;
		flex-shrink: 0;
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
	/* While sweeping a marquee, don't let the gesture select text/images. */
	.dropzone.marquee-active,
	.reorder-grid.marquee-active {
		user-select: none;
		-webkit-user-select: none;
		cursor: crosshair;
	}

	/* Rubber-band selection rectangle (portaled to <body>). */
	:global(.marquee) {
		position: fixed;
		z-index: 99998;
		pointer-events: none;
		border: 1px solid var(--color-accent);
		background: color-mix(in oklch, var(--color-accent) 14%, transparent);
		border-radius: 2px;
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
		/* Square, contained image on a consistent neutral with a subtle border —
		   matches the reorder tiles so both modes look identical. */
		aspect-ratio: 1;
		border: 1px solid var(--color-border);
		padding: 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		/* A touch darker than --color-bg-secondary so the tile reads clearly
		   against the modal background and the letterbox is visible. */
		background: color-mix(in oklch, var(--color-text) 9%, var(--color-bg-secondary));
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
		object-fit: contain;
	}

	/* ── Multi-select ─────────────────────────────────────────────────── */
	.tile.selected {
		outline: 3px solid var(--color-accent);
		outline-offset: -3px;
	}

	.tile-check {
		position: absolute;
		top: var(--space-2);
		left: var(--space-2);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: var(--radius-full);
		background: var(--color-surface);
		border: 1.5px solid var(--color-border);
		color: transparent;
		box-shadow: var(--shadow-sm);
	}
	.tile.selected .tile-check {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: white;
	}

	/* Header Clear / Save buttons (moved out of a footer). */
	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
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

	/* ── Select / Reorder mode toggle (lives in the modal header) ───────── */
	.mode-tabs {
		display: flex;
		align-items: center;
	}

	/* Smaller, lighter modal title so the translucent toggle beside it reads as
	   the primary control. Global because the <h2> is rendered inside Modal. */
	:global(.modal.media-modal header h2) {
		font-size: var(--text-base, 1rem);
		font-weight: 600;
		white-space: nowrap;
	}

	/* ── Reorder mode ──────────────────────────────────────────────────── */
	.reorder-scroll {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-1);
	}

	.reorder-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		align-content: start;
		gap: var(--space-3);
		/* Fill the scroll area so there's empty space below the tiles to start a
		   marquee from (rows stay packed at the top via align-content). */
		flex: 1;
	}
	.reorder-grid.is-dragging {
		cursor: grabbing;
	}

	.rtile {
		position: relative;
		aspect-ratio: 1;
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: grab;
		background: color-mix(in oklch, var(--color-text) 9%, var(--color-bg-secondary));
		border: 1px solid var(--color-border);
		user-select: none;
		-webkit-user-select: none;
		touch-action: none;
		/* Powers the press release and the selection ring; FLIP drives position
		   changes via its own animation. Opacity (the source-placeholder dim) is
		   deliberately NOT transitioned — otherwise, when the dropped card retires,
		   the tile fades from dimmed back to full, which reads as the dropped image
		   fading in. Snapping is instant and seamless under the landed card. */
		transition:
			transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
			outline-color 140ms ease;
		outline: 3px solid transparent;
		outline-offset: -3px;
	}
	.rtile:active {
		cursor: grabbing;
	}
	.rtile.pressing {
		transform: scale(0.94);
	}
	.rtile.source {
		opacity: 0.28;
	}
	.rtile.source img {
		filter: grayscale(0.25);
	}
	.rtile.marked {
		outline-color: var(--color-accent);
	}
	.rtile img {
		width: 100%;
		height: 100%;
		/* contain so the real aspect ratio shows; the tile's neutral background
		   fills the letterbox so every square reads as a consistent container. */
		object-fit: contain;
		display: block;
		pointer-events: none;
	}

	.rtile-check {
		position: absolute;
		top: var(--space-2);
		left: var(--space-2);
		z-index: 2;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		box-shadow: var(--shadow-sm);
		pointer-events: none;
	}

	.rtile-actions {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-start;
		justify-content: flex-end;
		padding: var(--space-1);
		opacity: 0;
		transition: opacity var(--transition-fast);
		/* The overlay covers the whole tile (inset:0). Without this it would sit
		   on top of the tile and swallow every pointerdown — onTileDown bails when
		   the press lands on `.rtile-actions`, so the drag never starts. Let
		   presses fall through to the tile; only the action button itself is
		   interactive (re-enabled below). */
		pointer-events: none;
	}
	.rtile:hover .rtile-actions,
	.rtile:focus-within .rtile-actions {
		transition-duration: 0s;
		opacity: 1;
	}
	/* Hidden while dragging, and for a beat after a drop (until the pointer next
	   moves) so the ✕ doesn't flash in on the tile the cursor is resting on. */
	.reorder-grid.is-dragging .rtile-actions,
	.reorder-grid.suppress-actions .rtile-actions,
	.reorder-grid.marquee-active .rtile-actions {
		opacity: 0;
	}
	/* Re-enable interaction on the delightstack remove button only (the overlay
	   itself is pointer-events:none so it doesn't block dragging the tile). */
	.rtile-actions :global(.button) {
		pointer-events: auto;
		width: 2.25rem;
		height: 2.25rem;
		--color-bg-active: rgb(0 0 0 / 0.8);
	}
	.rtile-actions :global(.button button) {
		background-color: rgb(0 0 0 / 0.5);
	}

	/* ── Lifted drag overlay (portaled to <body>) ──────────────────────────
	   Outer = translate only (cursor follow). Inner = rotate + lift scale, and
	   the scale-in pop. Because the scale lives on a node with no translate, it
	   can never shrink the translate and yank the card off the cursor. */
	.rfloat {
		position: fixed;
		left: 0;
		top: 0;
		z-index: 99999;
		pointer-events: none;
		will-change: transform;
	}
	.rfloat-inner {
		position: relative;
		width: 100%;
		height: 100%;
		transform-origin: center center;
		will-change: transform;
		animation: rfloat-pop 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes rfloat-pop {
		from {
			scale: 0.92;
			opacity: 0.4;
		}
		to {
			scale: 1;
			opacity: 1;
		}
	}
	.rfloat-card {
		position: absolute;
		inset: 0;
		border-radius: var(--radius-md);
		overflow: hidden;
		background: color-mix(in oklch, var(--color-text) 9%, var(--color-bg-secondary));
		border: 1px solid var(--color-border);
		box-shadow:
			0 22px 44px rgba(0, 0, 0, 0.36),
			0 6px 14px rgba(0, 0, 0, 0.24);
	}
	.rfloat-main {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.rfloat-back {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: var(--radius-md);
		transform: rotate(-6deg) translate(-6%, 4%);
		filter: brightness(0.92);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
		display: block;
	}
	.rfloat-count {
		position: absolute;
		top: -8px;
		right: -8px;
		z-index: 1;
		min-width: 22px;
		height: 22px;
		padding: 0 6px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		background: var(--color-accent);
		color: #fff;
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	}
</style>
