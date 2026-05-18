/**
 * Vanilla NodeView for BlogImage.
 * - Renders a <figure> with image + side resize handles.
 * - Shows a small width-mode toolbar (Normal / Wide / Full) when selected.
 * - Dragging a side handle in 'normal' mode adjusts widthPct.
 *   Past column edges, it snaps to 'wide' then 'full'. Dragging back shrinks.
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

const WIDE_PX = 1100;

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
				const parent = dom.parentElement;
				const columnWidth = parent
					? parent.getBoundingClientRect().width
					: 720;
				const startState: ViewState = {
					mode: (node.attrs.widthMode as WidthMode) || 'normal',
					pct: Number(node.attrs.widthPct) || 100,
				};

				handle.setPointerCapture(e.pointerId);
				const onMove = (ev: PointerEvent) => {
					ev.preventDefault();
					// Two handles, mirrored: dragging outward on either side widens.
					const deltaPx = (ev.clientX - startX) * direction;
					const next = computeNextState(startState, deltaPx, columnWidth);
					applyAttrs({ ...node.attrs, widthMode: next.mode, widthPct: next.pct });
				};
				const onUp = (ev: PointerEvent) => {
					ev.preventDefault();
					handle.removeEventListener('pointermove', onMove);
					handle.removeEventListener('pointerup', onUp);
					handle.removeEventListener('pointercancel', onUp);
					handle.releasePointerCapture(e.pointerId);
					const deltaPx = (ev.clientX - startX) * direction;
					const next = computeNextState(startState, deltaPx, columnWidth);
					updateAttrs({ widthMode: next.mode, widthPct: next.pct });
				};
				handle.addEventListener('pointermove', onMove);
				handle.addEventListener('pointerup', onUp);
				handle.addEventListener('pointercancel', onUp);
			});
		}

		function computeNextState(start: ViewState, deltaPx: number, colWidth: number): ViewState {
			// Both handles' deltaPx is positive when dragging outward (wider).
			// Translate the total widening (left+right both move outward → multiply by 2).
			const widthChangePx = deltaPx * 2;
			const viewport = typeof window !== 'undefined' ? window.innerWidth : colWidth;

			if (start.mode === 'normal') {
				const startWidthPx = (start.pct / 100) * colWidth;
				const newWidthPx = startWidthPx + widthChangePx;
				// Past the column → wide
				if (newWidthPx > colWidth + 80) {
					if (newWidthPx > WIDE_PX + 80) return { mode: 'full', pct: 100 };
					return { mode: 'wide', pct: 100 };
				}
				const pct = clamp(Math.round((newWidthPx / colWidth) * 100), 30, 100);
				return { mode: 'normal', pct };
			}

			if (start.mode === 'wide') {
				const startWidthPx = WIDE_PX;
				const newWidthPx = startWidthPx + widthChangePx;
				if (newWidthPx < colWidth - 80) {
					const pct = clamp(Math.round((newWidthPx / colWidth) * 100), 30, 100);
					return { mode: 'normal', pct };
				}
				if (newWidthPx > viewport - 80) return { mode: 'full', pct: 100 };
				return { mode: 'wide', pct: 100 };
			}

			// start.mode === 'full'
			const newWidthPx = viewport + widthChangePx;
			if (newWidthPx < WIDE_PX - 80) {
				if (newWidthPx < colWidth - 80) {
					const pct = clamp(Math.round((newWidthPx / colWidth) * 100), 30, 100);
					return { mode: 'normal', pct };
				}
				return { mode: 'wide', pct: 100 };
			}
			return { mode: 'full', pct: 100 };
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
