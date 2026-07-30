// A single, cached scroll-spy over the home page's `[data-section]` elements.
//
// RootNavDropdown and YearScrubber both need "where is every section and how
// far along is the reader" on every scroll frame — and each used to answer it
// alone, with ~17 getBoundingClientRect() calls apiece plus (in the
// scrubber's case) a per-frame document scrollHeight read that forces layout
// of the entire page across all its content-visibility sections. That is ~40
// forced layout reads per frame for numbers that only actually change on
// resize or when a section's stamped height settles.
//
// This module measures ONCE, caches, and invalidates on the things that can
// really move a section: viewport resize, and a ResizeObserver on each
// section + the body (content-visibility height stamping fires it). Scroll
// itself never re-measures — subscribers get cached document-space tops and
// convert with the current scrollY.
//
// All subscriber callbacks run from one passive scroll listener coalesced to
// one rAF: reads (the re-measure, if dirty) happen first, then callbacks
// write, so no subscriber can interleave a layout read into another's writes.

export type SectionMetrics = {
	ids: string[];
	/** absolute document Y of each section's top / bottom, in DOM order */
	tops: number[];
	bottoms: number[];
	scrollHeight: number;
};

type SpyCallback = (m: SectionMetrics) => void;

const subs = new Set<SpyCallback>();
let metrics: SectionMetrics = { ids: [], tops: [], bottoms: [], scrollHeight: 0 };
let sections: HTMLElement[] = [];
let dirty = true;
let raf = 0;
let ro: ResizeObserver | undefined;

function measure() {
	dirty = false;
	const y = window.scrollY;
	const ids: string[] = [];
	const tops: number[] = [];
	const bottoms: number[] = [];
	for (const el of sections) {
		const r = el.getBoundingClientRect();
		ids.push(el.id);
		tops.push(r.top + y);
		bottoms.push(r.bottom + y);
	}
	metrics = { ids, tops, bottoms, scrollHeight: document.documentElement.scrollHeight };
}

function flush() {
	raf = 0;
	if (dirty) measure();
	for (const cb of subs) cb(metrics);
}

function schedule() {
	if (!raf) raf = requestAnimationFrame(flush);
}

function invalidate() {
	dirty = true;
	schedule();
}

function setup() {
	sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).filter(
		(el) => el.id,
	);
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', invalidate);
	ro = new ResizeObserver(invalidate);
	ro.observe(document.body);
	for (const el of sections) ro.observe(el);
}

function teardown() {
	window.removeEventListener('scroll', schedule);
	window.removeEventListener('resize', invalidate);
	ro?.disconnect();
	ro = undefined;
	if (raf) cancelAnimationFrame(raf);
	raf = 0;
	sections = [];
	dirty = true;
}

/**
 * Subscribe to per-scroll-frame section metrics. The callback also runs once
 * immediately (with fresh measurements), so state is correct before the
 * first scroll. Returns an unsubscribe. Client-only — call from onMount.
 */
export function sectionSpy(cb: SpyCallback): () => void {
	if (subs.size === 0) setup();
	subs.add(cb);
	if (dirty) measure();
	cb(metrics);
	return () => {
		subs.delete(cb);
		if (subs.size === 0) teardown();
	};
}
