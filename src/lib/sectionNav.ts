import { page } from '$app/state';
import { replaceState } from '$app/navigation';

/**
 * Scroll so `el` sits just below the fixed header, re-correcting every frame
 * until the target's document position stabilises, then resolve.
 *
 * The home-page sections use `content-visibility: auto`, so off-screen sections
 * are laid out at their `contain-intrinsic-size` estimate rather than their real
 * height. A single `scrollTo` lands at a position computed from those wrong
 * heights; as we approach the target, each section between renders for real and
 * shifts everything below it. Measuring and re-snapping until the position holds
 * for a few frames converges on the correct spot. Cancels on user
 * wheel/touch/keydown so a deliberate scroll always wins.
 */
export function scrollToSection(el: HTMLElement, headerOffset = 80): Promise<void> {
	return new Promise((resolve) => {
		let lastTop = NaN;
		let stable = 0;
		let frames = 0;
		let cancelled = false;
		const cancel = () => (cancelled = true);
		window.addEventListener('wheel', cancel, { passive: true, once: true });
		window.addEventListener('touchstart', cancel, { passive: true, once: true });
		window.addEventListener('keydown', cancel, { once: true });
		const cleanup = () => {
			window.removeEventListener('wheel', cancel);
			window.removeEventListener('touchstart', cancel);
			window.removeEventListener('keydown', cancel);
			resolve();
		};
		const step = () => {
			if (cancelled) return cleanup();
			const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
			if (Math.abs(window.scrollY - top) > 1) window.scrollTo({ top });
			stable = Math.abs(top - lastTop) < 1 ? stable + 1 : 0;
			lastTop = top;
			// Stable for 3 frames, or give up after ~1s (60 frames) of churn.
			if (stable < 3 && frames++ < 60) requestAnimationFrame(step);
			else cleanup();
		};
		requestAnimationFrame(step);
	});
}

/**
 * Reflect the active section in the URL hash without adding a history entry.
 * Pass `null` (or '') to clear the hash — e.g. when at the top of the page.
 * Keeps the pathname and any query string (such as an open modal) intact.
 */
export function setSectionHash(id: string | null) {
	const current = page.url.hash.replace(/^#/, '');
	const next = id ?? '';
	if (current === next) return;
	const base = page.url.pathname + page.url.search;
	const url = next ? `${base}#${next}` : base;
	try {
		replaceState(url, page.state);
	} catch {
		// SvelteKit's replaceState throws if called before the client router has
		// finished initializing — e.g. on a hard reload the browser restores the
		// scroll position and fires the scroll-spy mid-hydration. The hash is
		// cosmetic at that instant, so fall back to native history (preserving
		// SvelteKit's own history state) rather than crash the effect flush.
		history.replaceState(history.state, '', url);
	}
}
