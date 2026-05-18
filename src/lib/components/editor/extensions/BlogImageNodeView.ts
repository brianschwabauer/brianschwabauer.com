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

		const handleLeft = document.createElement('span');
		handleLeft.className = 'blog-img-handle blog-img-handle-left';
		handleLeft.setAttribute('aria-hidden', 'true');
		inner.appendChild(handleLeft);

		const handleRight = document.createElement('span');
		handleRight.className = 'blog-img-handle blog-img-handle-right';
		handleRight.setAttribute('aria-hidden', 'true');
		inner.appendChild(handleRight);

		const toolbar = document.createElement('div');
		toolbar.className = 'blog-img-toolbar';
		toolbar.setAttribute('contenteditable', 'false');
		toolbar.innerHTML = `
			<button type="button" data-mode="normal" title="Normal width">N</button>
			<button type="button" data-mode="wide" title="Wide">W</button>
			<button type="button" data-mode="full" title="Full bleed">F</button>
			<span class="blog-img-sep"></span>
			<button type="button" data-action="alt" title="Edit alt text">Alt</button>
		`;
		inner.appendChild(toolbar);

		dom.appendChild(inner);

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
