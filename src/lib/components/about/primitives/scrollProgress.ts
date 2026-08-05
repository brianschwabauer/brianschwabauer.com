/**
 * One scroll listener for every scroll-progress effect on the page.
 *
 * The about page has a dozen-plus elements that each want "where am I in the
 * viewport?" on scroll. Giving each its own window listener meant every one of
 * them did a `getBoundingClientRect()` on every scroll event forever, even
 * when the element was twenty sections away. This module replaces all of that
 * with a single `{ passive: true }` scroll/resize listener and a single rAF,
 * so all callbacks run at most once per frame — and each subscribed element is
 * IntersectionObserver-gated, so an element that is nowhere near the viewport
 * costs nothing at all.
 *
 * The rootMargin is generous (25% of the viewport in each direction) so a
 * progress effect is already running by the time its element could possibly
 * be seen — nothing pops in. When an element re-enters the margin its
 * callback runs once immediately, so its state is correct before the next
 * scroll event. Without IntersectionObserver the gate fails open and every
 * subscriber runs every frame, which is exactly the old behaviour.
 *
 * Callbacks receive the element's fresh `getBoundingClientRect()`. All rects
 * are read before any callback runs, so a callback that writes styles can't
 * force the next subscriber's read into a fresh layout.
 */

type ProgressCallback = (rect: DOMRect) => void;

interface Subscriber {
	callback: ProgressCallback;
	visible: boolean;
}

const subscribers = new Map<Element, Subscriber>();
let raf = 0;
let io: IntersectionObserver | null = null;
let listening = false;

function flush() {
	raf = 0;
	// Read phase: every visible subscriber's rect, before anyone writes.
	const measured: [Subscriber, DOMRect][] = [];
	for (const [el, sub] of subscribers) {
		if (sub.visible) measured.push([sub, el.getBoundingClientRect()]);
	}
	// Write phase: the callbacks. Each is isolated: one subscriber throwing
	// must not silently freeze every subscriber after it in the map — on every
	// frame — which reads as "scroll effects stopped working" page-wide.
	for (const [sub, rect] of measured) {
		try {
			sub.callback(rect);
		} catch (err) {
			console.error('scroll-progress subscriber failed:', err);
		}
	}
}

function schedule() {
	if (!raf) raf = requestAnimationFrame(flush);
}

function setup() {
	if (listening) return;
	listening = true;
	window.addEventListener('scroll', schedule, { passive: true });
	window.addEventListener('resize', schedule);
	if (typeof IntersectionObserver !== 'undefined') {
		io = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const sub = subscribers.get(entry.target);
					if (!sub) continue;
					sub.visible = entry.isIntersecting;
					// Run once on entry so state is right before the next scroll.
					if (sub.visible) {
						try {
							sub.callback(entry.target.getBoundingClientRect());
						} catch (err) {
							console.error('scroll-progress subscriber failed:', err);
						}
					}
				}
			},
			{ rootMargin: '25% 0px' },
		);
	}
}

function teardown() {
	if (!listening) return;
	listening = false;
	window.removeEventListener('scroll', schedule);
	window.removeEventListener('resize', schedule);
	if (raf) cancelAnimationFrame(raf);
	raf = 0;
	io?.disconnect();
	io = null;
}

/**
 * Subscribe `el` to the shared scroll loop. `callback` runs with the element's
 * fresh rect at most once per frame while the element is within 25% of the
 * viewport, once immediately on subscribe, and once each time it re-enters.
 * One subscription per element — subscribing the same element again replaces
 * the previous callback. Returns an unsubscribe. SSR-safe (no-op on the
 * server).
 */
export function onScrollProgress(el: Element, callback: ProgressCallback): () => void {
	if (typeof window === 'undefined') return () => {};
	setup();
	// Fail open: without IO the subscriber is simply always "visible".
	const sub: Subscriber = { callback, visible: io === null };
	subscribers.set(el, sub);
	io?.observe(el);
	// Initial run, so state is correct before the first scroll.
	callback(el.getBoundingClientRect());
	return () => {
		subscribers.delete(el);
		io?.unobserve(el);
		if (subscribers.size === 0) teardown();
	};
}
