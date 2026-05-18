/**
 * Vanilla NodeView for BlogImage.
 * - Renders a <figure> with image + side resize handles.
 * - Shows a small width-mode toolbar (Normal / Wide / Full) when selected.
 * - Dragging a side handle scales the figure's pixel width in real time.
 *   As the cursor approaches a discrete breakpoint (column-width / wide /
 *   full), magnetic gravity pulls the visual width toward that snap point;
 *   moving past the escape radius releases it back to following the cursor.
 *   Releasing commits the closest discrete state and a short CSS transition
 *   animates from the drag-time pixel width to the mode's natural width.
 *
 * Uses ProseMirror's NodeView contract (instead of an extra svelte adapter dep).
 */
import type { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { WidthMode } from './BlogImage';

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

		// Spinner overlay shown only while attrs.uploading === true.
		const spinner = document.createElement('div');
		spinner.className = 'blog-img-spinner';
		spinner.setAttribute('aria-hidden', 'true');
		spinner.innerHTML = '<div class="blog-img-spinner-ring"></div><div class="blog-img-spinner-label">Uploading…</div>';
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
			<button type="button" data-action="alt" title="Edit alt text" aria-label="Edit alt text">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M5 18 9 7l4 11" />
					<path d="M6.5 14h5" />
					<path d="M15 18v-7" />
					<path d="M15 18h4" />
					<path d="M15 14h3" />
					<path d="M15 11h4" />
				</svg>
			</button>
			<button type="button" data-action="caption" title="Edit caption" aria-label="Edit caption">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect x="3" y="5" width="18" height="14" rx="2" />
					<line x1="7" y1="14" x2="17" y2="14" />
					<line x1="7" y1="17" x2="13" y2="17" />
				</svg>
			</button>
		`;

		dom.appendChild(inner);
		// Toolbar must sit on the outer figure, not inside .blog-img-inner —
		// the inner has overflow:hidden so the image clips to its border-radius,
		// which would also clip a toolbar placed at top: -Xpx.
		dom.appendChild(toolbar);

		// ── render attrs onto the DOM ───────────────────────────────────────
		function applyAttrs(attrs: Record<string, unknown>) {
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
			if (btn.dataset.action === 'alt') {
				const next = prompt('Alt text:', (node.attrs.alt as string) ?? '');
				if (next !== null) updateAttrs({ alt: next.trim() || null });
				return;
			}
			if (btn.dataset.action === 'caption') {
				const next = prompt('Caption:', (node.attrs.caption as string) ?? '');
				if (next !== null) updateAttrs({ caption: next.trim() || null });
			}
		});

		// ── resize handles ──────────────────────────────────────────────────
		setupResize(handleLeft, -1);
		setupResize(handleRight, 1);

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
					applyAttrs({ ...node.attrs, widthMode: finalState.mode, widthPct: finalState.pct });
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

		function updateAttrs(patch: Partial<Record<string, unknown>>) {
			const pos = typeof getPos === 'function' ? getPos() : null;
			if (pos == null) return;
			editor
				.chain()
				.command(({ tr }) => {
					tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...patch });
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
				return Boolean(target?.closest('.blog-img-handle, .blog-img-toolbar'));
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
