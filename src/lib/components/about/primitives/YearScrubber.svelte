<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import {
		savedScrollWithin,
		saveScrollState,
		scrollToSection,
		sectionScrollTop,
		setSectionHash,
	} from '$lib/sectionNav';
	import { sectionSpy } from '$lib/sectionSpy';

	let {
		stops,
	}: {
		stops: Array<{ id: string; year: string; label: string }>;
	} = $props();

	let track_el = $state<HTMLElement>();

	let activeId = $state(stops[0]?.id ?? '');
	/** 0–1 along the rail, measured in stops rather than in scrolled pixels. */
	let railProgress = $state(0);
	let dragging = $state(false);

	/*
	 * The rail is drawn from the centre of the first dot to the centre of the
	 * last, measured rather than assumed: guessing the row pitch left the line
	 * overhanging the end dots and the fill landing slightly off every marker.
	 */
	let rail = $state({ top: 0, height: 0, right: 11 });

	function measureRail() {
		if (!track_el) return;
		const dots = [...track_el.querySelectorAll<HTMLElement>('li > button .dot')];
		if (dots.length < 2) return;
		const box = track_el.getBoundingClientRect();
		const first = dots[0].getBoundingClientRect();
		const last = dots[dots.length - 1].getBoundingClientRect();
		const centre = (r: DOMRect) => r.top + r.height / 2;
		rail = {
			top: centre(first) - box.top,
			height: centre(last) - centre(first),
			// 1px back off the dot's own centre line, since the rail is 2px wide.
			right: box.right - (first.left + first.width / 2) - 1,
		};
	}

	// True while a programmatic jump is animating. We suppress scroll-driven hash
	// writes during it so the URL reflects the *target* section, not every
	// section the converging scroll passes through on the way there.
	let jumping = false;

	/** Hash value for a stop id — null (cleared) for the first/top section. */
	const hashFor = (id: string) => (id === stops[0]?.id ? null : id);

	async function jump(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		activeId = id;
		jumping = true;
		setSectionHash(hashFor(id));
		await scrollToSection(el);
		jumping = false;
	}

	/**
	 * Drag the rail like a transport scrubber: the page follows the pointer
	 * through the timeline instead of making you click one stop at a time.
	 *
	 * Row centres are measured once, on press — the rail is `position: fixed`, so
	 * they don't move while the page scrolls underneath, and re-measuring twenty
	 * rows on every pointermove would be layout thrash for nothing.
	 */
	let rows: Array<{ id: string; centre: number }> = [];
	/** Set once the pointer actually travels within a press. */
	let dragged = false;
	/**
	 * Releasing a drag also fires a click on whichever row is under the pointer.
	 * Swallow exactly that one, on a timeout rather than a flag we clear by
	 * hand — a keyboard Enter arrives as a click with no press before it, and
	 * must never be caught by a stale drag.
	 */
	let swallowClick = false;

	function nearest(clientY: number) {
		let best = rows[0];
		for (const row of rows) {
			if (Math.abs(row.centre - clientY) < Math.abs(best.centre - clientY)) best = row;
		}
		return best;
	}

	/** Rough landing, one scroll per move. Accuracy comes on release. */
	function seek(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		activeId = id;
		window.scrollTo({ top: sectionScrollTop(el) });
	}

	/** The row the press landed on. It captures the pointer, so every later move
	 *  is delivered here even once the cursor has left the rail entirely. */
	let capture_el: HTMLElement | null = null;

	function onpointerdown(event: PointerEvent) {
		if (event.button !== 0 || !track_el) return;
		const buttons = [...track_el.querySelectorAll<HTMLElement>('li > button')];
		rows = buttons.map((el, i) => {
			const rect = el.getBoundingClientRect();
			return { id: stops[i].id, centre: rect.top + rect.height / 2 };
		});
		if (!rows.length) return;
		dragging = true;
		dragged = false;
		// Everything the page does from here is a programmatic jump, so the scroll
		// spy must not write a hash for every section the drag sweeps past.
		jumping = true;
		capture_el = event.currentTarget as HTMLElement;
		// Throws NotFoundError if the pointer is already gone by the time we get
		// here. Losing capture costs us a drag that leaves the rail, not the
		// feature — don't let it take the handler down with it.
		try {
			capture_el.setPointerCapture(event.pointerId);
		} catch {
			/* no capture; the drag still works while the pointer stays on the rail */
		}
	}

	function onpointermove(event: PointerEvent) {
		if (!dragging) return;
		dragged = true;
		const row = nearest(event.clientY);
		if (row.id !== activeId) seek(row.id);
	}

	async function endDrag(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		try {
			capture_el?.releasePointerCapture(event.pointerId);
		} catch {
			/* already released */
		}
		capture_el = null;
		// The rough seeks above land on `contain-intrinsic-size` estimates. One
		// converging jump at the end puts the section where it belongs.
		jumping = false;
		if (!dragged) return;
		swallowClick = true;
		setTimeout(() => (swallowClick = false), 0);
		await jump(nearest(event.clientY).id);
	}

	onMount(() => {
		// Debounce scroll-driven hash writes: Safari rate-limits history API
		// calls, and fast scrubbing through 16 sections can exceed the quota.
		// The URL only needs to be right once scrolling settles.
		let hashTimer = 0;
		const queueHash = (id: string) => {
			window.clearTimeout(hashTimer);
			hashTimer = window.setTimeout(() => {
				if (!jumping) setSectionHash(hashFor(id));
			}, 200);
		};

		// Debounced alongside the hash: remember the exact spot within the active
		// section, so a reload restores the line the reader was on rather than
		// the top of the chapter.
		let save_timer = 0;
		const queueSave = () => {
			window.clearTimeout(save_timer);
			save_timer = window.setTimeout(() => {
				if (!jumping && activeId) saveScrollState(activeId);
			}, 250);
		};

		// Section geometry comes from the shared spy's CACHE — the old per-frame
		// version re-measured 17 sections plus document scrollHeight on every
		// scroll frame, and that scrollHeight read forces layout of the whole
		// page across its content-visibility sections. The spy re-measures only
		// on resize / section-height changes and hands everyone the same rAF-
		// coalesced numbers.
		const unsubscribeSpy = sectionSpy((m) => {
			// this scrubber's stops are the spy's sections in the same DOM order;
			// index by id so a missing section can never shift the rail
			const probe = window.innerHeight * 0.35;
			const y = window.scrollY + probe;
			const tops = stops.map((s) => {
				const idx = m.ids.indexOf(s.id);
				return idx === -1 ? Infinity : m.tops[idx];
			});

			// Index of the section being read, and how far through it we are.
			let i = 0;
			for (let n = 0; n < tops.length; n++) if (tops[n] <= y) i = n;
			// Past the last stop there is no next top to interpolate towards, so the
			// end of the scrollable range stands in — that way the fill reaches the
			// final dot exactly at the bottom of the page.
			const maxY = m.scrollHeight - window.innerHeight + probe;
			const next = i + 1 < tops.length && tops[i + 1] !== Infinity ? tops[i + 1] : maxY;
			const span = next - tops[i];
			const within = span > 0 ? Math.min(1, Math.max(0, (y - tops[i]) / span)) : 0;

			/*
			 * The fill is measured in *stops*, not in scrolled pixels. Sections are
			 * nowhere near equal in height — the shipped wall is several times the
			 * length of a chapter card — so a straight scrollY/scrollHeight fill
			 * drifted away from the dots and read as broken. Interpolating between
			 * stop indices instead lands the fill on the active dot and walks it to
			 * the next one as you read.
			 *
			 * Clamped, because there is no stop after the last one to walk towards:
			 * without it the final section carries the fill to 20/19 of the rail and
			 * it hangs off the end.
			 */
			railProgress = tops.length > 1 ? Math.min(1, (i + within) / (tops.length - 1)) : 0;

			const current = tops[i] === Infinity ? '' : (stops[i]?.id ?? '');
			if (current && current !== activeId) {
				activeId = current;
				if (!jumping) queueHash(current);
			}
			queueSave();
		});
		const onResize = () => measureRail();
		// After the first paint, so the rows have a height to measure.
		tick().then(measureRail);
		window.addEventListener('resize', onResize);

		// Restore a deep-linked section on load. The browser's native hash scroll
		// lands on content-visibility estimates, and every lazy section chunk that
		// hydrates afterwards shifts the page again — so a one-shot jump isn't
		// enough. The inline script in app.html has been pinning the target since
		// the HTML parsed; take over from it here with the module version of the
		// same pin, which keeps holding the spot (plus the saved within-section
		// offset on reloads) until layout stops moving or the reader scrolls.
		const hashId = page.url.hash.replace(/^#/, '');
		const restore_el =
			hashId && stops.some((s) => s.id === hashId)
				? document.getElementById(hashId)
				: null;
		(window as { __hashPinStop?: () => void }).__hashPinStop?.();
		if (restore_el) {
			activeId = hashId;
			jumping = true;
			scrollToSection(restore_el, 80, {
				within: savedScrollWithin(hashId),
				pin: true,
			}).then(() => (jumping = false));
		}

		// Editing the hash on an already-loaded page (address bar, an in-page
		// #link, back/forward across hash entries) never reloads the document, so
		// neither the app.html pin nor the restore above runs — only the browser's
		// native scroll, which knows nothing about data-scroll-anchor and parks
		// the year too far down the screen. Route it through the same converging
		// jump a scrubber click uses. Our own scroll-spy hash writes go through
		// replaceState, which never fires hashchange, so this can't loop.
		const onHashChange = () => {
			const id = location.hash.replace(/^#/, '');
			if (id && stops.some((s) => s.id === id)) void jump(id);
		};
		window.addEventListener('hashchange', onHashChange);

		return () => {
			window.clearTimeout(hashTimer);
			window.clearTimeout(save_timer);
			unsubscribeSpy();
			window.removeEventListener('resize', onResize);
			window.removeEventListener('hashchange', onHashChange);
		};
	});
</script>

<aside class="year-scrubber" aria-label="Page navigation">
	<!-- Press anywhere on the rail and drag to run the page through the timeline;
	     a plain click still jumps to one stop. -->
	<div bind:this={track_el} class="track" class:dragging>
		<div
			class="rail"
			style:top="{rail.top}px"
			style:height="{rail.height}px"
			style:right="{rail.right}px">
			<div class="fill" style:transform="scaleY({railProgress})"></div>
		</div>
		<ul>
			{#each stops as stop}
				<li>
					<button
						type="button"
						class:active={activeId === stop.id}
						onclick={() => !swallowClick && jump(stop.id)}
						{onpointerdown}
						{onpointermove}
						onpointerup={endDrag}
						onpointercancel={endDrag}>
						<span class="year">{stop.year}</span>
						<span class="label">{stop.label}</span>
						<span class="dot" aria-hidden="true"></span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</aside>

<style>
	.year-scrubber {
		position: fixed;
		top: 50%;
		right: 1.25rem;
		transform: translateY(-50%);
		z-index: 50;
		/* The aside's box is as wide as its widest row, and a transparent box
		   still swallows clicks. Only the controls themselves take the pointer,
		   so the strip of page behind the rail stays usable. */
		pointer-events: none;
		font-family: var(--font-mono);
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.7rem;
	}
	.track {
		position: relative;
		/* Own the gesture: without this a pointer drag on a touchscreen scrolls
		   the page instead of scrubbing it. */
		touch-action: none;
	}
	.track.dragging {
		user-select: none;
	}
	/* The whole rail is being held, so the grabbing cursor belongs to all of it —
	   including the rows, which are `pointer` at rest. */
	.track.dragging,
	.track.dragging button {
		cursor: grabbing;
	}

	/* top / height / right come from `measureRail` — dot centre to dot centre. */
	.rail {
		position: absolute;
		width: 2px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.fill {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, #00f2c3, #00a893);
		border-radius: 2px;
		transform-origin: top;
		transition: transform 80ms linear;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.45rem;
		max-height: min(80vh, 720px);
		overflow-y: auto;
		scrollbar-width: none;
	}
	ul::-webkit-scrollbar {
		display: none;
	}
	.track button {
		all: unset;
		pointer-events: auto;
		/* Both a jump target and a scrub handle — the open hand says the rail can
		   be taken hold of, which a plain pointer never would. */
		cursor: grab;
		position: relative;
		display: flex;
		align-items: center;
		/* No gap: the year and label carry their own trailing margin so it
		   collapses with them. Otherwise the rail would sit a stray 0.55rem off
		   the edge whenever the text is hidden. */
		gap: 0;
		padding: 0.18rem 0.6rem;
		color: rgba(255, 255, 255, 0.55);
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		/* Text shadow instead of a backdrop panel: enough separation when
		   full-bleed images pass underneath, without a distracting box. The
		   scrubber is a bonus affordance — it's OK if it isn't always perfectly
		   legible over busy imagery. */
		text-shadow:
			0 1px 3px rgba(0, 0, 0, 0.9),
			0 0 12px rgba(0, 0, 0, 0.7);
		transition: color 200ms ease;
	}
	.track button:hover {
		transition-duration: 0s;
		color: #fff;
	}
	/*
	 * At rest the rail is a column of ticks about 28px wide, and only the
	 * section you're in says its name. Twenty years spelled out on every fold
	 * was a second column of content arguing with the first — and it landed on
	 * top of the full-bleed artwork. Point at the rail and the whole index
	 * unfolds; look away and it folds back up.
	 */
	.year,
	.label {
		max-width: 0;
		margin-right: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		opacity: 0;
		transition:
			max-width 250ms ease,
			margin-right 250ms ease,
			opacity 250ms ease;
	}
	.year {
		font-weight: 700;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.label {
		text-transform: uppercase;
	}
	/* Years appear when the reader engages the rail — pointing at it, tabbing
	   into it, or dragging it — or, for the section they are actually in,
	   always. */
	.year-scrubber:hover .year,
	.year-scrubber:focus-within .year,
	.track.dragging .year,
	.track button.active .year {
		transition-duration: 0s;
		max-width: 4rem;
		margin-right: 0.55rem;
		opacity: 1;
	}
	/* Labels stay rarer still: the current section, or the one under the cursor. */
	.track button:hover .label,
	.track button.active .label {
		transition-duration: 0s;
		max-width: 12rem;
		margin-right: 0.55rem;
		opacity: 1;
	}
	@media (prefers-reduced-motion: reduce) {
		.year,
		.label {
			transition: opacity 200ms ease;
		}
	}
	.dot {
		display: block;
		position: relative;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.25);
		box-shadow:
			inset 0 0 0 2px rgba(0, 0, 0, 0.4),
			0 1px 4px rgba(0, 0, 0, 0.8);
		transition:
			background 200ms ease,
			transform 200ms ease;
	}
	.track button.active .dot {
		background: #00f2c3;
		transform: scale(1.4);
	}
	/* Crossing detent: a small ring bursts out of the dot each time a new
	   section becomes active while scrolling. */
	.dot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		border: 2px solid #00f2c3;
		opacity: 0;
		pointer-events: none;
	}
	.track button.active .dot::after {
		animation: detent 450ms ease-out;
	}
	@keyframes detent {
		from {
			opacity: 0.9;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(2.6);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.track button.active .dot::after {
			animation: none;
		}
	}
	.track button.active {
		color: #fff;
	}
	/* On mobile the rail crowds the section content — section jumping is
	   handled by the bottom nav dropdown there instead. */
	@media (max-width: 768px) {
		.year-scrubber {
			display: none;
		}
	}
</style>
