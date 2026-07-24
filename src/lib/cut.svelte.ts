import { tick } from 'svelte';
import { page } from '$app/state';
import { replaceState } from '$app/navigation';

/**
 * The home page ships in two edits of the same story:
 *   • theatrical — the highlights; every optional aside is collapsed to a
 *     "deleted scene" marker (see `DirectorCut.svelte`).
 *   • director   — everything, expanded.
 *
 * The choice lives in one module-level rune so a marker anywhere on the page,
 * the ticket booth, and the scrubber chip all drive the same switch.
 */
export type Cut = 'theatrical' | 'director';

const STORAGE_KEY = 'bs_cut';
const DEFAULT_CUT: Cut = 'theatrical';
/** Matches the YearScrubber's scroll-spy probe, so the auto-anchor picks the
    same section the rest of the page considers "current". */
const PROBE_RATIO = 0.35;

let cut_state = $state<Cut>(DEFAULT_CUT);

/** Narrow an untrusted string (URL param, localStorage) to a Cut. */
export function parseCut(value: string | null | undefined): Cut | null {
	return value === 'director' || value === 'theatrical' ? value : null;
}

export const cut = {
	get value(): Cut {
		return cut_state;
	},
	get director(): boolean {
		return cut_state === 'director';
	},
};

/**
 * Seed the cut from the `?cut=` URL param during page-component init. Runs on
 * both server and client, and both see the same URL — so the hydrated tree
 * matches the SSR markup exactly. A stored preference is applied later, by
 * `hydrateCut`, once hydration has claimed the server's DOM.
 */
export function seedCut(from_url: string | null | undefined) {
	cut_state = parseCut(from_url) ?? DEFAULT_CUT;
}

/**
 * Client-only follow-up to `seedCut`: apply the remembered preference. Call it
 * from `$effect.pre` in the page component — that flushes before the browser
 * paints, so a returning director's-cut visitor never sees a frame of the
 * theatrical markup, but after hydration, so no nodes are mis-claimed.
 */
export function hydrateCut(from_url: string | null | undefined) {
	// An explicit link wins over the stored preference — and updates it, so a
	// shared `?cut=director` link changes what the visitor gets next time.
	if (parseCut(from_url)) {
		persist(cut_state);
		return;
	}
	const stored = parseCut(readStored());
	if (stored && stored !== cut_state) {
		cut_state = stored;
		// Only surface the param when it's carrying information — a default
		// visit keeps a clean URL.
		writeUrl(stored);
	}
}

export async function setCut(next: Cut, anchor_el?: HTMLElement | null) {
	if (next === cut_state) return;

	// Hold the reader's place. Dozens of markers expand or collapse at once, so
	// without this the page grows/shrinks by thousands of pixels underneath the
	// element they just clicked.
	const anchor = resolveAnchor(anchor_el);
	const old_top = anchor?.getBoundingClientRect().top ?? 0;

	cut_state = next;
	persist(next);
	writeUrl(next);

	if (!anchor) return;
	const correct = () => {
		const delta = anchor.getBoundingClientRect().top - old_top;
		if (Math.abs(delta) > 0.5) window.scrollBy({ top: delta, behavior: 'instant' });
	};
	await tick();
	correct();
	// SectionShell re-stamps `contain-intrinsic-size` from a ResizeObserver, so
	// the page can settle to a different length one frame after the swap.
	requestAnimationFrame(correct);
}

/**
 * The element to keep still. A marker or ticket stub anchors to itself; the
 * scrubber chip is `position: fixed`, so its rect never moves and anchoring to
 * it would do nothing — fall back to the section the reader is currently in.
 */
function resolveAnchor(anchor_el?: HTMLElement | null): HTMLElement | null {
	if (typeof window === 'undefined') return null;
	if (anchor_el?.isConnected && getComputedStyle(anchor_el).position !== 'fixed') {
		return anchor_el;
	}
	const sections = document.querySelectorAll<HTMLElement>('[data-section]');
	const probe = window.innerHeight * PROBE_RATIO;
	let current: HTMLElement | null = sections[0] ?? null;
	for (const section of sections) {
		if (section.getBoundingClientRect().top - probe <= 0) current = section;
	}
	return current;
}

function readStored(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		// Private-mode Safari and blocked third-party storage both throw here.
		return null;
	}
}

function persist(next: Cut) {
	try {
		localStorage.setItem(STORAGE_KEY, next);
	} catch {
		// Preference is a nicety — losing it is fine.
	}
}

/** Reflect the cut in the query string without adding a history entry. */
function writeUrl(next: Cut) {
	const url = new URL(page.url);
	if (url.searchParams.get('cut') === next) return;
	url.searchParams.set('cut', next);
	const target = url.pathname + url.search + url.hash;
	try {
		replaceState(target, page.state);
	} catch {
		// Mirrors sectionNav#setSectionHash: SvelteKit's replaceState throws if
		// the client router hasn't finished initializing yet.
		history.replaceState(history.state, '', target);
	}
}
