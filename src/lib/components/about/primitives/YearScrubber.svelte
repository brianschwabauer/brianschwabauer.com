<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { scrollToSection, setSectionHash } from '$lib/sectionNav';

	let {
		stops,
	}: {
		stops: Array<{ id: string; year: string; label: string }>;
	} = $props();

	let activeId = $state(stops[0]?.id ?? '');
	let scrollPercent = $state(0);

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

	onMount(() => {
		const sections: HTMLElement[] = stops
			.map((s) => document.getElementById(s.id))
			.filter((el): el is HTMLElement => !!el);

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

		let ticking = false;
		const update = () => {
			ticking = false;
			const sh = document.documentElement.scrollHeight - window.innerHeight;
			scrollPercent = sh > 0 ? window.scrollY / sh : 0;
			let current = sections[0]?.id ?? '';
			const probe = window.innerHeight * 0.35;
			for (const s of sections) {
				const top = s.getBoundingClientRect().top;
				if (top - probe <= 0) current = s.id;
			}
			if (current !== activeId) {
				activeId = current;
				if (!jumping) queueHash(current);
			}
		};
		// Coalesce scroll events into one measurement per frame.
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);

		// Restore a deep-linked section on load. The browser/SvelteKit will have
		// attempted a native hash scroll already, but content-visibility estimates
		// make that land in the wrong place — re-run the converging jump to fix it.
		const hashId = page.url.hash.replace(/^#/, '');
		if (hashId && sections.some((s) => s.id === hashId)) {
			tick().then(() => requestAnimationFrame(() => jump(hashId)));
		}

		return () => {
			window.clearTimeout(hashTimer);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<aside class="year-scrubber" aria-label="Page navigation">
	<div class="rail">
		<div class="fill" style:transform="scaleY({scrollPercent})"></div>
	</div>
	<ul>
		{#each stops as stop}
			<li>
				<button
					type="button"
					class:active={activeId === stop.id}
					onclick={() => jump(stop.id)}>
					<span class="year">{stop.year}</span>
					<span class="label">{stop.label}</span>
					<span class="dot" aria-hidden="true"></span>
				</button>
			</li>
		{/each}
	</ul>
</aside>

<style>
	.year-scrubber {
		position: fixed;
		top: 50%;
		right: 1.25rem;
		transform: translateY(-50%);
		z-index: 50;
		pointer-events: auto;
		font-family: var(--font-mono);
	}
	.rail {
		position: absolute;
		right: 11px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.fill {
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, #00f2c3, #00b4a0 60%, #6c63ff);
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
	button {
		all: unset;
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.55rem;
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
	button:hover {
		transition-duration: 0s;
		color: #fff;
	}
	.year {
		font-weight: 700;
		min-width: 2.6rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.label {
		max-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		opacity: 0;
		text-transform: uppercase;
		transition:
			max-width 250ms ease,
			opacity 250ms ease;
	}
	button:hover .label,
	button.active .label {
		transition-duration: 0s;
		max-width: 12rem;
		opacity: 1;
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
	button.active .dot {
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
	button.active .dot::after {
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
		button.active .dot::after {
			animation: none;
		}
	}
	button.active {
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
