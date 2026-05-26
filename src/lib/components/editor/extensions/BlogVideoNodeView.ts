/**
 * NodeView for BlogVideo — a poster preview with horizontal resize handles and
 * a width-mode toolbar (Normal / Wide / Full), mirroring BlogImage's resize UX.
 *
 * Videos sit in a fixed 16:9 frame, so — unlike BlogImage — there is no bottom
 * (crop) handle and no focal-point repositioning: width is the only dimension
 * the author controls. Dragging a side handle scales the figure with the same
 * magnetic snap toward the column-width / wide / full breakpoints.
 */
import type { NodeViewRenderer, NodeViewRendererProps } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import type { VideoWidthMode } from './BlogVideo';
import { videoPosterURL } from './BlogVideo';

const WIDE_PX = 1100;
const SNAP_RADIUS = 60;
const ESCAPE_RADIUS = 100;

interface SnapPoint {
	px: number;
	mode: VideoWidthMode;
	pct: number;
}

export function createBlogVideoNodeView(): NodeViewRenderer {
	return (props: NodeViewRendererProps) => {
		const { node, editor, getPos } = props;

		const dom = document.createElement('figure');
		dom.className = 'blog-video';
		dom.setAttribute('contenteditable', 'false');

		const mount = document.createElement('div');
		mount.className = 'blog-video-mount';

		const poster = document.createElement('img');
		poster.className = 'blog-video-poster';
		poster.draggable = false;
		poster.loading = 'lazy';
		mount.appendChild(poster);

		const play = document.createElement('span');
		play.className = 'blog-video-play';
		play.setAttribute('aria-hidden', 'true');
		mount.appendChild(play);

		const handleLeft = document.createElement('span');
		handleLeft.className = 'blog-video-handle blog-video-handle-left';
		handleLeft.setAttribute('aria-hidden', 'true');
		mount.appendChild(handleLeft);

		const handleRight = document.createElement('span');
		handleRight.className = 'blog-video-handle blog-video-handle-right';
		handleRight.setAttribute('aria-hidden', 'true');
		mount.appendChild(handleRight);

		const captionEl = document.createElement('figcaption');

		const toolbar = document.createElement('div');
		toolbar.className = 'blog-video-toolbar';
		toolbar.setAttribute('contenteditable', 'false');
		toolbar.innerHTML = `
			<button type="button" data-mode="normal" title="Inline (text column width)" aria-label="Inline">
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
		`;

		dom.appendChild(mount);
		dom.appendChild(captionEl);
		dom.appendChild(toolbar);

		// ProseMirror freezes the `node` closure at creation; toolbar / drag
		// handlers read the latest attrs from here instead.
		let latestAttrs: Record<string, unknown> = { ...node.attrs };

		function applyAttrs(attrs: Record<string, unknown>) {
			latestAttrs = attrs;
			poster.src = videoPosterURL(String(attrs.videoSlug ?? ''));
			poster.alt = (attrs.title as string | null) ?? '';
			dom.dataset.widthMode = (attrs.widthMode as string) || 'wide';
			dom.dataset.widthPct = String(attrs.widthPct ?? 100);
			dom.style.setProperty('--blog-video-pct', `${attrs.widthPct ?? 100}%`);
			const caption = (attrs.caption as string | null) ?? '';
			captionEl.textContent = caption;
			dom.classList.toggle('has-caption', Boolean(caption));
			for (const btn of toolbar.querySelectorAll<HTMLButtonElement>('[data-mode]')) {
				btn.classList.toggle('is-active', btn.dataset.mode === attrs.widthMode);
			}
		}
		applyAttrs(node.attrs);

		// ── toolbar ─────────────────────────────────────────────────────────
		toolbar.addEventListener('mousedown', (e) => e.preventDefault());
		toolbar.addEventListener('click', (e) => {
			const btn = (e.target as HTMLElement).closest('button');
			if (!btn) return;
			e.preventDefault();
			e.stopPropagation();
			const mode = btn.dataset.mode as VideoWidthMode | undefined;
			if (mode) updateAttrs({ widthMode: mode, widthPct: 100 });
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
				const minWidthPx = Math.max(160, 0.3 * colWidth);

				const snapPoints: SnapPoint[] = [
					{ px: colWidth, mode: 'normal', pct: 100 },
					{ px: WIDE_PX, mode: 'wide', pct: 100 },
					{ px: viewport, mode: 'full', pct: 100 },
				];
				let snappedTo: SnapPoint | null = null;

				dom.style.setProperty('--blog-video-drag-px', `${startWidthPx}px`);
				dom.classList.add('is-dragging');
				handle.setPointerCapture(e.pointerId);

				const onMove = (ev: PointerEvent) => {
					ev.preventDefault();
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
						const pull = targetPx - nearest.px;
						const t = Math.min(1, Math.abs(pull) / ESCAPE_RADIUS);
						const gravity = 0.35;
						const eased = gravity * t + (1 - gravity) * t * t;
						displayedPx = nearest.px + Math.sign(pull) * eased * ESCAPE_RADIUS;
					} else {
						snappedTo = null;
						displayedPx = targetPx;
					}
					dom.style.setProperty('--blog-video-drag-px', `${displayedPx}px`);
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

					const deltaPx = (ev.clientX - startX) * direction;
					const targetPx = clamp(startWidthPx + deltaPx * 2, minWidthPx, viewport);

					let finalState: { mode: VideoWidthMode; pct: number };
					if (snappedTo) {
						finalState = { mode: snappedTo.mode, pct: snappedTo.pct };
					} else if (targetPx <= colWidth) {
						const pct = clamp(Math.round((targetPx / colWidth) * 100), 30, 100);
						finalState = { mode: 'normal', pct };
					} else {
						const mid1 = (colWidth + WIDE_PX) / 2;
						const mid2 = (WIDE_PX + viewport) / 2;
						if (targetPx <= mid1) finalState = { mode: 'normal', pct: 100 };
						else if (targetPx <= mid2) finalState = { mode: 'wide', pct: 100 };
						else finalState = { mode: 'full', pct: 100 };
					}

					dom.classList.add('is-snapping');
					applyAttrs({
						...latestAttrs,
						widthMode: finalState.mode,
						widthPct: finalState.pct,
					});
					updateAttrs({ widthMode: finalState.mode, widthPct: finalState.pct });
					requestAnimationFrame(() => {
						dom.classList.remove('is-dragging');
						dom.style.removeProperty('--blog-video-drag-px');
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
			stopEvent(event: Event) {
				const target = event.target as HTMLElement | null;
				return Boolean(target?.closest('.blog-video-handle, .blog-video-toolbar'));
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
