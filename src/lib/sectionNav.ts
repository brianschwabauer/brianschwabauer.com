import { page } from '$app/state';
import { replaceState } from '$app/navigation';

/**
 * Is `el` actually laid out, or is it a `content-visibility: auto` placeholder?
 * A skipped section still answers `querySelector`, but its children have no
 * geometry, so measuring inside one gives nonsense.
 */
const rendered = (el: HTMLElement) =>
	typeof el.checkVisibility !== 'function' ||
	el.checkVisibility({ contentVisibilityAuto: true });

/**
 * The document scroll position a jump to `el` should land on.
 *
 * Sections carry generous top padding — the air above the giant year is what
 * makes the chapter breathe while you *scroll* through it. Landing a *jump* at
 * the section's own top inherits all of that padding, so the year the reader
 * asked for opens hundreds of pixels down the screen under an empty gap.
 *
 * So a section may nominate the element a jump should actually put at the top,
 * with `data-scroll-anchor`, and tune the air left above it with a plain
 * `scroll-margin-top` on that element. Nothing else reads `scroll-margin` here
 * (the browser only applies it to its own scrolls, which
 * `content-visibility` estimates make useless on this page anyway), so it is
 * free to mean exactly this: how far below the header this thing should sit.
 *
 * Sections with no anchor — the pinned ones, whose effect starts at their very
 * top — keep landing at the section top, which is right for them.
 *
 * Exported for the rough, one-shot landings (a scrubber drag, a search hit)
 * that don't run the converging loop below but must still agree with it.
 */
export function sectionScrollTop(el: HTMLElement, headerOffset = 80) {
	const anchor = rendered(el)
		? el.querySelector<HTMLElement>('[data-scroll-anchor]')
		: null;
	const box = anchor ?? el;
	const gap = anchor ? parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0 : 0;
	return Math.max(
		0,
		box.getBoundingClientRect().top + window.scrollY - headerOffset - gap,
	);
}

/**
 * Scroll so `el`'s opening lands just below the fixed header, re-correcting
 * every frame until the target's document position stabilises, then resolve.
 *
 * The home-page sections use `content-visibility: auto`, so off-screen sections
 * are laid out at their `contain-intrinsic-size` estimate rather than their real
 * height. A single `scrollTo` lands at a position computed from those wrong
 * heights; as we approach the target, each section between renders for real and
 * shifts everything below it. Measuring and re-snapping until the position holds
 * for a few frames converges on the correct spot. That same loop is what lets
 * `targetTop` read geometry from inside the section: it is a placeholder on the
 * first frame and real by the time we arrive. Cancels on user
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
			const top = sectionScrollTop(el, headerOffset);
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
