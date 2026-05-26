/**
 * Vanilla NodeView for BlogImage.
 * - Renders a <figure> with image + side resize handles + bottom crop handle.
 * - Shows a small width-mode toolbar (Normal / Wide / Full) when selected.
 * - Dragging a side handle scales the figure's pixel width in real time.
 *   As the cursor approaches a discrete breakpoint (column-width / wide /
 *   full), magnetic gravity pulls the visual width toward that snap point;
 *   moving past the escape radius releases it back to following the cursor.
 *   Releasing commits the closest discrete state and a short CSS transition
 *   animates from the drag-time pixel width to the mode's natural width.
 * - Dragging the bottom handle shortens the figure (creates a wider display
 *   aspect ratio). The image's natural aspect ratio is the hard ceiling —
 *   the handle won't let you grow taller than that. Releasing at natural
 *   clears the crop entirely so the image goes back to height:auto.
 * - The reposition button (only visible when a crop is active) enters a
 *   drag-pan mode for setting the focal point inside the cropped frame,
 *   mirroring the cover-image picker's UX.
 *
 * Uses ProseMirror's NodeView contract (instead of an extra svelte adapter dep).
 */
import type { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { WidthMode } from './BlogImage';
import { editImageDetails } from '$lib/components/dialogs';

interface ViewState {
	mode: WidthMode;
	pct: number;
}

interface SnapPoint {
	px: number;
	mode: WidthMode;
	pct: number;
}

const WIDE_PX = 1100;
// Cursor distance from a snap point at which magnetic pull engages. Once
// snapped, the user must drag past ESCAPE_RADIUS to break out — gives the
// snaps a sticky-but-escapable feel without flickering near boundaries.
const SNAP_RADIUS = 60;
const ESCAPE_RADIUS = 100;
// Lower bound for the cropped-frame height in pixels. Anything smaller turns
// the figure into a sliver that's hard to interact with or evaluate visually.
const MIN_CROP_HEIGHT_PX = 80;
// Tolerance when checking whether a drag-released crop matches the image's
// natural aspect ratio — within this, the crop attr is cleared (height:auto).
const CROP_RELEASE_EPSILON = 0.005;

export function createBlogImageNodeView(): NodeViewRenderer {
	return (props: NodeViewRendererProps) => {
		const { node, editor, getPos } = props;

		const dom = document.createElement('figure');
		dom.className = 'blog-img';
		dom.setAttribute('contenteditable', 'false');

		const inner = document.createElement('div');
		inner.className = 'blog-img-inner';

		const img = document.createElement('img');
		img.draggable = false;
		img.loading = 'lazy';
		inner.appendChild(img);

		// Caption overlay — lives inside .blog-img-inner so it clips to the
		// image's rounded corners. Hidden via CSS when there's no caption.
		const captionEl = document.createElement('figcaption');
		captionEl.className = 'blog-img-caption';
		inner.appendChild(captionEl);

		const handleLeft = document.createElement('span');
		handleLeft.className = 'blog-img-handle blog-img-handle-left';
		handleLeft.setAttribute('aria-hidden', 'true');
		inner.appendChild(handleLeft);

		const handleRight = document.createElement('span');
		handleRight.className = 'blog-img-handle blog-img-handle-right';
		handleRight.setAttribute('aria-hidden', 'true');
		inner.appendChild(handleRight);

		const handleBottom = document.createElement('span');
		handleBottom.className = 'blog-img-handle blog-img-handle-bottom';
		handleBottom.setAttribute('aria-hidden', 'true');
		inner.appendChild(handleBottom);

		// Reposition overlay (focal-point pan). Hidden via CSS unless the
		// figure carries `.is-repositioning`. Pointer events on the inner
		// drive the focal point during a drag; the nested toolbar lives on
		// the outer figure so its buttons don't trigger a pan.
		const reposOverlay = document.createElement('div');
		reposOverlay.className = 'blog-img-repos-overlay';
		reposOverlay.setAttribute('aria-hidden', 'true');
		const reposHint = document.createElement('div');
		reposHint.className = 'blog-img-repos-hint';
		reposHint.textContent = 'Drag to choose the focus point';
		const reposReadout = document.createElement('div');
		reposReadout.className = 'blog-img-repos-readout';
		reposOverlay.appendChild(reposHint);
		reposOverlay.appendChild(reposReadout);
		inner.appendChild(reposOverlay);

		// Spinner overlay shown only while attrs.uploading === true.
		const spinner = document.createElement('div');
		spinner.className = 'blog-img-spinner';
		spinner.setAttribute('aria-hidden', 'true');
		spinner.innerHTML =
			'<div class="blog-img-spinner-ring"></div><div class="blog-img-spinner-label">Uploading…</div>';
		inner.appendChild(spinner);

		const toolbar = document.createElement('div');
		toolbar.className = 'blog-img-toolbar';
		toolbar.setAttribute('contenteditable', 'false');
		// Width-mode icons: an outer "page" frame with a filled "image" rect
		// inside that grows narrow → wider → full bleed. Native title attrs
		// surface the human label on hover.
		toolbar.innerHTML = `
			<button type="button" data-mode="normal" title="Inline (text column width)" aria-label="Inline (text column width)">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<rect x="3" y="6" width="18" height="12" rx="1.5" />
					<rect x="9" y="9.5" width="6" height="5" rx="0.75" fill="currentColor" stroke="none" />
				</svg>
			</button>
			<button type="button" data-mode="wide" title="Wide (break out past text column)" aria-label="Wide">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<rect x="3" y="6" width="18" height="12" rx="1.5" />
					<rect x="6" y="9.5" width="12" height="5" rx="0.75" fill="currentColor" stroke="none" />
				</svg>
			</button>
			<button type="button" data-mode="full" title="Full bleed (edge-to-edge)" aria-label="Full bleed">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
					<rect x="3" y="6" width="18" height="12" rx="1.5" />
					<rect x="3" y="9.5" width="18" height="5" fill="currentColor" stroke="none" />
				</svg>
			</button>
			<span class="blog-img-sep"></span>
			<button type="button" class="blog-img-repos-btn" data-action="reposition" title="Reposition (set focal point)" aria-label="Reposition">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="5 9 2 12 5 15" />
					<polyline points="9 5 12 2 15 5" />
					<polyline points="15 19 12 22 9 19" />
					<polyline points="19 9 22 12 19 15" />
					<line x1="2" y1="12" x2="22" y2="12" />
					<line x1="12" y1="2" x2="12" y2="22" />
				</svg>
			</button>
			<button type="button" data-action="settings" title="Image settings" aria-label="Image settings">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<circle cx="12" cy="12" r="3" />
					<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.18.41.5.74.91.91l.09.03a2 2 0 0 1 0 4l-.09.03a1.65 1.65 0 0 0-1 1.03z" />
				</svg>
			</button>
		`;

		// Repos-mode toolbar (Center / Cancel / Done). Mirrors FeaturedImagePicker's
		// repo-toolbar — only visible while the figure is in `.is-repositioning`.
		const reposToolbar = document.createElement('div');
		reposToolbar.className = 'blog-img-repos-toolbar';
		reposToolbar.setAttribute('contenteditable', 'false');
		reposToolbar.innerHTML = `
			<button type="button" data-action="center" title="Center">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="12" cy="12" r="9" />
					<circle cx="12" cy="12" r="1.5" fill="currentColor" />
				</svg>
				<span>Center</span>
			</button>
			<button type="button" data-action="cancel" title="Cancel (Esc)">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
				<span>Cancel</span>
			</button>
			<button type="button" class="primary" data-action="done" title="Save focus (Enter)">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<polyline points="20 6 9 17 4 12" />
				</svg>
				<span>Done</span>
			</button>
		`;

		dom.appendChild(inner);
		// Toolbar must sit on the outer figure, not inside .blog-img-inner —
		// the inner has overflow:hidden so the image clips to its border-radius,
		// which would also clip a toolbar placed at top: -Xpx.
		dom.appendChild(toolbar);
		dom.appendChild(reposToolbar);

		// Latest attrs as of the most recent applyAttrs() call. The `node` closure
		// captured by this NodeView is FROZEN at creation time — ProseMirror calls
		// `update(newNode)` with fresh attrs but never reassigns the closure var.
		// Anything that reads "current" attrs after a possible update (toolbar
		// clicks, drag handlers, reposition mode) must read from here, not from
		// `node.attrs`. Intrinsic values that never change (src/width/height) are
		// fine to read from `node.attrs` directly.
		let latestAttrs: Record<string, unknown> = { ...node.attrs };

		// ── render attrs onto the DOM ───────────────────────────────────────
		function applyAttrs(attrs: Record<string, unknown>) {
			latestAttrs = attrs;
			img.src = String(attrs.src ?? '');
			img.alt = (attrs.alt as string | null) ?? '';
			if (attrs.width) img.setAttribute('width', String(attrs.width));
			if (attrs.height) img.setAttribute('height', String(attrs.height));
			dom.dataset.widthMode = (attrs.widthMode as string) || 'normal';
			dom.dataset.widthPct = String(attrs.widthPct ?? 100);
			if (attrs.bgColor) {
				dom.style.setProperty('--blog-img-bg', attrs.bgColor as string);
			} else {
				dom.style.removeProperty('--blog-img-bg');
			}
			dom.style.setProperty('--blog-img-pct', `${attrs.widthPct ?? 100}%`);
			// Hint the figure's aspect-ratio while uploading so the page doesn't reflow
			// when the real image swaps in. Without this, a tall image looks square.
			if (attrs.width && attrs.height) {
				dom.style.setProperty('--blog-img-aspect', `${attrs.width} / ${attrs.height}`);
			} else {
				dom.style.removeProperty('--blog-img-aspect');
			}
			dom.classList.toggle('is-uploading', Boolean(attrs.uploading));

			// Crop + focal point. is-cropped switches the inner to a forced
			// aspect-ratio with object-fit:cover on the img; without it the
			// img falls back to height:auto (original behavior).
			const cropAspect =
				typeof attrs.cropAspect === 'number' && attrs.cropAspect > 0
					? attrs.cropAspect
					: null;
			if (cropAspect) {
				dom.style.setProperty('--blog-img-crop-aspect', String(cropAspect));
				dom.classList.add('is-cropped');
			} else {
				dom.style.removeProperty('--blog-img-crop-aspect');
				dom.classList.remove('is-cropped');
			}
			const fx = typeof attrs.focalX === 'number' ? attrs.focalX : 50;
			const fy = typeof attrs.focalY === 'number' ? attrs.focalY : 50;
			dom.style.setProperty('--blog-img-focal-x', `${fx}%`);
			dom.style.setProperty('--blog-img-focal-y', `${fy}%`);

			const caption = (attrs.caption as string | null) ?? '';
			captionEl.textContent = caption;
			dom.classList.toggle('has-caption', Boolean(caption));

			// Toolbar active state
			for (const btn of toolbar.querySelectorAll<HTMLButtonElement>('[data-mode]')) {
				btn.classList.toggle('is-active', btn.dataset.mode === attrs.widthMode);
			}
		}
		applyAttrs(node.attrs);

		// ── toolbar wiring ──────────────────────────────────────────────────
		toolbar.addEventListener('mousedown', (e) => e.preventDefault());
		toolbar.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const btn = target.closest('button');
			if (!btn) return;
			e.preventDefault();
			e.stopPropagation();
			const mode = btn.dataset.mode as WidthMode | undefined;
			if (mode) {
				updateAttrs({ widthMode: mode, widthPct: mode === 'normal' ? 100 : 100 });
				return;
			}
			if (btn.dataset.action === 'reposition') {
				enterReposition();
				return;
			}
			if (btn.dataset.action === 'settings') {
				void editImageDetails({
					title: 'Image settings',
					previewSrc: (latestAttrs.src as string) ?? '',
					previewAlt: (latestAttrs.alt as string | null) ?? '',
					previewStyle: latestAttrs.bgColor
						? `background-color:${latestAttrs.bgColor};`
						: '',
					alt: (latestAttrs.alt as string) ?? '',
					caption: (latestAttrs.caption as string) ?? '',
				}).then((result) => {
					if (!result) return;
					updateAttrs({
						alt: result.alt || null,
						caption: result.caption || null,
					});
				});
			}
		});

		// ── reposition-toolbar wiring ───────────────────────────────────────
		reposToolbar.addEventListener('mousedown', (e) => e.preventDefault());
		reposToolbar.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const btn = target.closest('button');
			if (!btn) return;
			e.preventDefault();
			e.stopPropagation();
			const action = btn.dataset.action;
			if (action === 'center') centerReposition();
			else if (action === 'cancel') cancelReposition();
			else if (action === 'done') commitReposition();
		});

		// ── resize handles ──────────────────────────────────────────────────
		setupResize(handleLeft, -1);
		setupResize(handleRight, 1);
		setupBottomResize(handleBottom);
		setupReposition();

		function setupResize(handle: HTMLSpanElement, direction: 1 | -1) {
			handle.addEventListener('pointerdown', (e) => {
				e.preventDefault();
				e.stopPropagation();

				const startX = e.clientX;
				const startWidthPx = dom.getBoundingClientRect().width;
				const parent = dom.parentElement;
				const colWidth = parent ? parent.getBoundingClientRect().width : 720;
				const viewport = window.innerWidth;
				const minWidthPx = Math.max(120, 0.3 * colWidth);

				const snapPoints: SnapPoint[] = [
					{ px: colWidth, mode: 'normal', pct: 100 },
					{ px: WIDE_PX, mode: 'wide', pct: 100 },
					{ px: viewport, mode: 'full', pct: 100 },
				];

				let snappedTo: SnapPoint | null = null;

				// Seed the drag-time width to the current rendered width BEFORE
				// flipping is-dragging — otherwise the figure paints one frame
				// with width:auto (invalid-var fallback) and visibly jumps.
				dom.style.setProperty('--blog-img-drag-px', `${startWidthPx}px`);
				dom.classList.add('is-dragging');
				handle.setPointerCapture(e.pointerId);

				const onMove = (ev: PointerEvent) => {
					ev.preventDefault();
					// Two handles mirrored: dragging outward on either side widens
					// the figure by 2 * deltaPx (one handle's contribution per side).
					const deltaPx = (ev.clientX - startX) * direction;
					const targetPx = clamp(startWidthPx + deltaPx * 2, minWidthPx, viewport);

					const radius = snappedTo ? ESCAPE_RADIUS : SNAP_RADIUS;
					let nearest: SnapPoint | null = null;
					let minDist = Infinity;
					for (const sp of snapPoints) {
						const d = Math.abs(targetPx - sp.px);
						if (d < minDist && d <= radius) {
							minDist = d;
							nearest = sp;
						}
					}

					let displayedPx: number;
					if (nearest) {
						snappedTo = nearest;
						// Magnetic gravity: zero follow at the snap point, full
						// follow at the escape boundary — keeps the visual width
						// continuous when the user breaks out of the snap zone.
						const pull = targetPx - nearest.px;
						const t = Math.min(1, Math.abs(pull) / ESCAPE_RADIUS);
						const gravity = 0.35;
						const eased = gravity * t + (1 - gravity) * t * t;
						displayedPx = nearest.px + Math.sign(pull) * eased * ESCAPE_RADIUS;
					} else {
						snappedTo = null;
						displayedPx = targetPx;
					}

					dom.style.setProperty('--blog-img-drag-px', `${displayedPx}px`);
				};

				const onUp = (ev: PointerEvent) => {
					ev.preventDefault();
					handle.removeEventListener('pointermove', onMove);
					handle.removeEventListener('pointerup', onUp);
					handle.removeEventListener('pointercancel', onUp);
					handle.releasePointerCapture(e.pointerId);

					const deltaPx = (ev.clientX - startX) * direction;
					const targetPx = clamp(startWidthPx + deltaPx * 2, minWidthPx, viewport);

					let finalState: ViewState;
					if (snappedTo) {
						finalState = { mode: snappedTo.mode, pct: snappedTo.pct };
					} else if (targetPx <= colWidth) {
						const pct = clamp(Math.round((targetPx / colWidth) * 100), 30, 100);
						finalState = { mode: 'normal', pct };
					} else {
						// Released outside any snap zone between snap points — pick
						// the nearest mode by midpoint so release direction matches
						// the user's intent.
						const mid1 = (colWidth + WIDE_PX) / 2;
						const mid2 = (WIDE_PX + viewport) / 2;
						if (targetPx <= mid1) finalState = { mode: 'normal', pct: 100 };
						else if (targetPx <= mid2) finalState = { mode: 'wide', pct: 100 };
						else finalState = { mode: 'full', pct: 100 };
					}

					// Enable the transition first (with the drag-time pixel width
					// still applied), then commit the discrete state and drop
					// is-dragging in the next frame — width animates from the
					// pixel value to the committed mode's natural width.
					dom.classList.add('is-snapping');
					applyAttrs({
						...latestAttrs,
						widthMode: finalState.mode,
						widthPct: finalState.pct,
					});
					updateAttrs({ widthMode: finalState.mode, widthPct: finalState.pct });
					requestAnimationFrame(() => {
						dom.classList.remove('is-dragging');
						dom.style.removeProperty('--blog-img-drag-px');
					});
					setTimeout(() => dom.classList.remove('is-snapping'), 360);
				};

				handle.addEventListener('pointermove', onMove);
				handle.addEventListener('pointerup', onUp);
				handle.addEventListener('pointercancel', onUp);
			});
		}

		function setupBottomResize(handle: HTMLSpanElement) {
			handle.addEventListener('pointerdown', (e) => {
				e.preventDefault();
				e.stopPropagation();

				const natW = Number(node.attrs.width) || 0;
				const natH = Number(node.attrs.height) || 0;
				const innerRect = inner.getBoundingClientRect();
				const currentWidth = innerRect.width;
				const startHeight = innerRect.height;
				if (!natW || !natH || !currentWidth) return;

				const naturalAspect = natW / natH;
				// Max height = the natural ratio at the current rendered width.
				// User can't drag taller than that.
				const maxHeight = currentWidth / naturalAspect;
				const minHeight = Math.min(MIN_CROP_HEIGHT_PX, maxHeight);
				const startY = e.clientY;

				dom.classList.add('is-dragging-bottom');
				handle.setPointerCapture(e.pointerId);

				const onMove = (ev: PointerEvent) => {
					ev.preventDefault();
					const deltaY = ev.clientY - startY;
					const newHeight = clamp(startHeight + deltaY, minHeight, maxHeight);
					const newAspect = currentWidth / newHeight;
					dom.style.setProperty('--blog-img-crop-aspect', String(newAspect));
					dom.classList.add('is-cropped');
				};

				const onUp = (ev: PointerEvent) => {
					ev.preventDefault();
					handle.removeEventListener('pointermove', onMove);
					handle.removeEventListener('pointerup', onUp);
					handle.removeEventListener('pointercancel', onUp);
					try {
						handle.releasePointerCapture(e.pointerId);
					} catch {
						// already released
					}

					const deltaY = ev.clientY - startY;
					const newHeight = clamp(startHeight + deltaY, minHeight, maxHeight);
					const newAspect = currentWidth / newHeight;

					dom.classList.remove('is-dragging-bottom');

					// Released at (or very close to) natural ratio → clear the
					// crop entirely so the image renders at its native size with
					// height:auto. Also reset focal so a future re-crop starts
					// centered rather than carrying a now-meaningless offset.
					const atNatural =
						Math.abs(newAspect - naturalAspect) / naturalAspect < CROP_RELEASE_EPSILON;
					if (atNatural) {
						updateAttrs({ cropAspect: null, focalX: 50, focalY: 50 });
					} else {
						updateAttrs({ cropAspect: newAspect });
					}
				};

				handle.addEventListener('pointermove', onMove);
				handle.addEventListener('pointerup', onUp);
				handle.addEventListener('pointercancel', onUp);
			});
		}

		// ── reposition mode (focal-point pan) ───────────────────────────────
		let repositioning = false;
		let savedFocalX = 50;
		let savedFocalY = 50;
		let panDragging = false;
		let panPointerId: number | null = null;
		let panStartPx = { x: 0, y: 0 };
		let panStartFocal = { x: 50, y: 50 };
		let panOverflow = { x: 0, y: 0 };

		function setupReposition() {
			inner.addEventListener('pointerdown', onPanDown);
			inner.addEventListener('pointermove', onPanMove);
			inner.addEventListener('pointerup', onPanUp);
			inner.addEventListener('pointercancel', onPanUp);
		}

		function enterReposition() {
			if (!latestAttrs.cropAspect) return; // Button is gated by CSS too.
			savedFocalX = Number(latestAttrs.focalX) || 50;
			savedFocalY = Number(latestAttrs.focalY) || 50;
			repositioning = true;
			dom.classList.add('is-repositioning');
			updateReposReadout(savedFocalX, savedFocalY);
		}

		function cancelReposition() {
			if (!repositioning) return;
			repositioning = false;
			dom.classList.remove('is-repositioning');
			dom.style.setProperty('--blog-img-focal-x', `${savedFocalX}%`);
			dom.style.setProperty('--blog-img-focal-y', `${savedFocalY}%`);
		}

		function commitReposition() {
			if (!repositioning) return;
			const fx = Number(getCssVarPct('--blog-img-focal-x'));
			const fy = Number(getCssVarPct('--blog-img-focal-y'));
			repositioning = false;
			dom.classList.remove('is-repositioning');
			updateAttrs({ focalX: fx, focalY: fy });
		}

		function centerReposition() {
			if (!repositioning) return;
			dom.style.setProperty('--blog-img-focal-x', '50%');
			dom.style.setProperty('--blog-img-focal-y', '50%');
			updateReposReadout(50, 50);
		}

		function computePanOverflow(): { x: number; y: number } {
			const natW = Number(node.attrs.width) || 0;
			const natH = Number(node.attrs.height) || 0;
			if (!natW || !natH) return { x: 0, y: 0 };
			const rect = inner.getBoundingClientRect();
			const cW = rect.width;
			const cH = rect.height;
			if (!cW || !cH) return { x: 0, y: 0 };
			const imgR = natW / natH;
			const cR = cW / cH;
			if (imgR > cR) {
				const scale = cH / natH;
				return { x: Math.max(0, natW * scale - cW), y: 0 };
			}
			const scale = cW / natW;
			return { x: 0, y: Math.max(0, natH * scale - cH) };
		}

		function onPanDown(e: PointerEvent) {
			if (!repositioning) return;
			if (e.button !== 0 && e.pointerType === 'mouse') return;
			// Buttons inside the reposToolbar handle their own clicks and stop
			// propagation, but pointerdown bubbles — bail if the press started
			// on a control rather than the image surface.
			const target = e.target as HTMLElement | null;
			if (target?.closest('.blog-img-repos-toolbar')) return;
			panOverflow = computePanOverflow();
			if (!panOverflow.x && !panOverflow.y) return;
			e.preventDefault();
			e.stopPropagation();
			panDragging = true;
			panPointerId = e.pointerId;
			panStartPx = { x: e.clientX, y: e.clientY };
			panStartFocal = {
				x: Number(getCssVarPct('--blog-img-focal-x')),
				y: Number(getCssVarPct('--blog-img-focal-y')),
			};
			try {
				inner.setPointerCapture(e.pointerId);
			} catch {
				// no-op
			}
		}

		function onPanMove(e: PointerEvent) {
			if (!panDragging || e.pointerId !== panPointerId) return;
			const dx = e.clientX - panStartPx.x;
			const dy = e.clientY - panStartPx.y;
			let nextX = panStartFocal.x;
			let nextY = panStartFocal.y;
			// Dragging the image one direction reveals more of the OTHER side
			// of the original — same sign-flip as FeaturedImagePicker.
			if (panOverflow.x > 0) {
				nextX = clamp(panStartFocal.x - (dx / panOverflow.x) * 100, 0, 100);
			}
			if (panOverflow.y > 0) {
				nextY = clamp(panStartFocal.y - (dy / panOverflow.y) * 100, 0, 100);
			}
			dom.style.setProperty('--blog-img-focal-x', `${nextX}%`);
			dom.style.setProperty('--blog-img-focal-y', `${nextY}%`);
			updateReposReadout(nextX, nextY);
		}

		function onPanUp(e: PointerEvent) {
			if (!panDragging || e.pointerId !== panPointerId) return;
			panDragging = false;
			panPointerId = null;
			try {
				inner.releasePointerCapture(e.pointerId);
			} catch {
				// no-op
			}
			// Don't commit here — Done button commits, Cancel reverts.
		}

		function updateReposReadout(x: number, y: number) {
			reposReadout.textContent = `focus ${Math.round(x)}% × ${Math.round(y)}%`;
		}

		function getCssVarPct(name: string): number {
			const raw = dom.style.getPropertyValue(name).trim();
			const num = parseFloat(raw);
			return Number.isFinite(num) ? num : 50;
		}

		function updateAttrs(patch: Partial<Record<string, unknown>>) {
			const pos = typeof getPos === 'function' ? getPos() : null;
			if (pos == null) return;
			editor
				.chain()
				.command(({ tr }) => {
					// Spread `latestAttrs` (not the stale closure-captured `node.attrs`)
					// so a sequence of edits — crop → reposition → caption — each
					// preserve the previous step's changes instead of clobbering them.
					tr.setNodeMarkup(pos, undefined, { ...latestAttrs, ...patch });
					return true;
				})
				.run();
		}

		return {
			dom,
			update(updatedNode: PMNode) {
				if (updatedNode.type.name !== node.type.name) return false;
				applyAttrs(updatedNode.attrs);
				return true;
			},
			selectNode() {
				dom.classList.add('is-selected');
			},
			deselectNode() {
				dom.classList.remove('is-selected');
			},
			destroy() {
				// listeners owned by the removed DOM
			},
			stopEvent(event: Event) {
				const target = event.target as HTMLElement | null;
				if (!target) return false;
				if (
					target.closest(
						'.blog-img-handle, .blog-img-toolbar, .blog-img-repos-toolbar, .blog-img-repos-overlay',
					)
				) {
					return true;
				}
				// Pan-drag in repos mode is rooted on .blog-img-inner; intercept
				// pointer events there so PM doesn't try to set a text selection.
				if (repositioning && target.closest('.blog-img-inner')) return true;
				return false;
			},
			ignoreMutation() {
				return true;
			},
		};
	};
}

function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}
