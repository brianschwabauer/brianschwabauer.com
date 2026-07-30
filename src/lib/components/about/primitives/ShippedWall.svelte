<script module lang="ts">
	/** A single capture. `file` is a bare filename; the wall prefixes the CDN. */
	export type Shot = {
		file: string;
		width: number;
		height: number;
		caption: string;
	};
	export type Column = {
		/** -1 = content travels up the screen, +1 = down. */
		direction: -1 | 1;
		speed: number;
		/**
		 * Drop this column at phone widths. A capture much wider than ~1500px is
		 * illegible in a third of a phone screen, so the column carrying them steps
		 * aside and lets the others read. The grid narrows to whatever is left, so
		 * the wall never wraps — and a dropped column's shots stay in the lightbox,
		 * so nothing becomes unreachable.
		 */
		drop_on_phone?: boolean;
		shots: Shot[];
	};
</script>

<script lang="ts">
	// A full-bleed diagonal set piece of tall screenshots that scrub past as the
	// page scrolls. It is a *visual*, not a section — it carries no heading and
	// no copy, and is dropped in at the end of whatever chapter it belongs to.
	import PinScrub from './PinScrub.svelte';
	import LightboxGallery from './LightboxGallery.svelte';
	import { type GalleryItem } from '@delightstack/components/media';

	const CDN = 'https://cdn.brianschwabauer.com/media/';
	/** Must match the `scale` on `.wall` — the visible slice of a column is the
	    stage height divided by it, and that slice is what travel is measured against. */
	const SCALE = 1.25;

	let {
		key,
		columns,
		accent = '#ffb84d',
	}: {
		/** Stable identifier for the lightbox's `?media=<key>` deep link. */
		key: string;
		/**
		 * Aim for columns of roughly equal total height. A column's travel is the
		 * part of it that doesn't fit on screen, so a short column runs out of travel
		 * and sits nearly still while its neighbours are still moving.
		 */
		columns: Column[];
		/** Hover border and focus ring, so the wall wears its chapter's accent. */
		accent?: string;
	} = $props();

	/** Flat index of each column's first shot, so a click maps to a lightbox slide. */
	const STARTS = $derived(
		columns.map((_, i) =>
			columns.slice(0, i).reduce((sum, col) => sum + col.shots.length, 0),
		),
	);

	const ITEMS: GalleryItem[] = $derived(
		columns.flatMap((col) =>
			col.shots.map((shot) => ({
				type: 'image' as const,
				src: CDN + shot.file,
				width: shot.width,
				height: shot.height,
				caption: shot.caption,
				alt: shot.caption,
			})),
		),
	);

	/** Columns still standing at phone widths — the grid is sized off this. */
	const PHONE_COLUMNS = $derived(columns.filter((col) => !col.drop_on_phone).length);

	let gallery = $state<ReturnType<typeof LightboxGallery>>();
	let stage_el = $state<HTMLElement | null>(null);
	let col_els = $state<(HTMLElement | null)[]>([]);
	let travels = $state<number[]>([]);
	// Both sparse on purpose: an index nothing has written yet reads `undefined`,
	// which is falsy and means "still loading" / "no travel measured" — so neither
	// has to be pre-sized against `columns`.
	let loaded = $state<boolean[]>([]);
	let armed = $state(false);
	let reduced = $state(false);

	// The reduced-motion wall is a different component tree, not a restyle of this
	// one — `PinScrub` keeps a 100svh clipped window even when it stops pinning,
	// which would guillotine a static stack.
	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduced = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	// The columns are moved with `translate`, but lazy-loading is decided from an
	// image's *layout* position — and a column is several thousand pixels tall, so
	// everything below the first screenful would sit unloaded forever and scrub
	// past as black slabs. Arm the whole wall eagerly once it is one and a half
	// screens away; until then the attribute stays `lazy`, so a reader who never
	// reaches this section still pays nothing for it.
	$effect(() => {
		if (!stage_el) return;
		if (typeof IntersectionObserver === 'undefined') {
			armed = true;
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (!entries.some((e) => e.isIntersecting)) return;
				armed = true;
				io.disconnect();
			},
			{ rootMargin: '150% 0px' },
		);
		io.observe(stage_el);
		return () => io.disconnect();
	});

	$effect(() => {
		if (!stage_el || typeof ResizeObserver === 'undefined') return;
		const measure = () => {
			const visible = stage_el!.clientHeight / SCALE;
			travels = columns.map((col, i) => {
				const el = col_els[i];
				// A column hidden at this breakpoint measures 0 and simply sits still.
				if (!el || !el.offsetHeight) return 0;
				return Math.max(0, el.offsetHeight - visible) * col.speed;
			});
		};
		const ro = new ResizeObserver(measure);
		ro.observe(stage_el);
		for (const el of col_els) if (el) ro.observe(el);
		measure();
		return () => ro.disconnect();
	});

	/**
	 * Where a column sits at `progress`. A column's travel is the part of it that
	 * doesn't fit on screen, so sweeping the full range walks every pixel of the
	 * capture past the viewport exactly once. Up-columns open on their top edge
	 * and climb; down-columns open on their bottom edge and fall.
	 */
	function offsetAt(index: number, progress: number) {
		const travel = travels[index] ?? 0;
		return columns[index].direction < 0 ? -travel * progress : -travel * (1 - progress);
	}
</script>

<div class="shipped-wall" style:--wall-accent={accent}>
	{#if reduced}
		<div class="container">
			<div class="static-wall">
				{#each columns as col, c}
					{#each col.shots as shot, s}
						<button
							type="button"
							class="print"
							onclick={(e) => gallery?.open(STARTS[c] + s, e.currentTarget)}>
							<img
								src={CDN + shot.file}
								alt={shot.caption}
								width={shot.width}
								height={shot.height}
								loading="lazy"
								decoding="async" />
						</button>
					{/each}
				{/each}
			</div>
		</div>
	{:else}
		<PinScrub height="var(--wall-span)">
			{#snippet children({ progress })}
				<div
					bind:this={stage_el}
					class="stage"
					class:pinned={progress > 0 && progress < 1}>
					<div
						class="wall"
						style:--wall-columns={columns.length}
						style:--wall-columns-phone={PHONE_COLUMNS}>
						{#each columns as col, c}
							<div
								bind:this={col_els[c]}
								class="column"
								class:drop-phone={col.drop_on_phone}
								style:translate="0 {offsetAt(c, progress)}px">
								{#each col.shots as shot, s}
									{@const index = STARTS[c] + s}
									<button
										type="button"
										class="print"
										class:loading={!loaded[index]}
										onclick={(e) => gallery?.open(index, e.currentTarget)}>
										<img
											src={CDN + shot.file}
											alt={shot.caption}
											width={shot.width}
											height={shot.height}
											loading={armed ? 'eager' : 'lazy'}
											decoding="async"
											onload={() => (loaded[index] = true)}
											{@attach (node) => {
												// A cached capture can already be complete before this
												// handler is attached, and then `load` never fires —
												// without the check the print stays at opacity 0 for good.
												if (node.complete && node.naturalWidth) loaded[index] = true;
											}} />
									</button>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/snippet}
		</PinScrub>
	{/if}

	<LightboxGallery bind:this={gallery} {key} items={ITEMS} />
</div>

<style>
	.shipped-wall {
		position: relative;
		width: 100%;
		/* Read by PinScrub's inline height and by the rotation below, so the whole
		   set piece reshapes at one breakpoint. */
		--wall-span: 250vh;
		--wall-rotate: -12deg;
	}
	@media (max-width: 720px) {
		.shipped-wall {
			--wall-span: 200vh;
			--wall-rotate: -8deg;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
	}

	.stage {
		position: relative;
		width: 100%;
		height: 100svh;
		overflow: clip;
		/* Dissolve the captures at the edges instead of guillotining them. */
		mask-image: linear-gradient(180deg, transparent, #000 8%, #000 92%, transparent);
	}
	.wall {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(var(--wall-columns), 1fr);
		align-items: start;
		gap: clamp(12px, 2vw, 24px);
		rotate: var(--wall-rotate);
		/* Overscale so the rotated corners never expose the background. */
		scale: 1.25;
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: clamp(12px, 2vw, 24px);
		min-width: 0;
	}
	.stage.pinned .column {
		will-change: translate;
	}
	@media (max-width: 720px) {
		/* Narrow the grid to match, so losing a column doesn't leave a gap or wrap
		   the survivors onto a second row. */
		.wall {
			grid-template-columns: repeat(var(--wall-columns-phone), 1fr);
		}
		.column.drop-phone {
			display: none;
		}
	}

	.print {
		display: block;
		width: 100%;
		padding: 0;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		overflow: hidden;
		background: #101319;
		cursor: pointer;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
		transition:
			border-color 250ms ease,
			box-shadow 250ms ease;
	}
	.print:hover {
		transition-duration: 0s;
		border-color: rgba(255, 255, 255, 0.35);
		box-shadow:
			0 30px 80px rgba(0, 0, 0, 0.6),
			0 0 0 2px oklch(from var(--wall-accent) l c h / 0.35);
	}
	.print:focus-visible {
		outline: 2px solid var(--wall-accent);
		outline-offset: 3px;
	}
	.print img {
		display: block;
		width: 100%;
		height: auto;
		transition: opacity 500ms ease;
	}
	/* Captures this tall decode late — the 7655px one especially. Hold each place
	   with a shimmer rather than a black slab. */
	.print.loading {
		background: linear-gradient(180deg, #141821, #1d2430, #141821);
		background-size: 100% 200%;
		animation: shimmer 2.4s ease-in-out infinite;
	}
	.print.loading img {
		opacity: 0;
	}
	@media (prefers-reduced-motion: reduce) {
		.print.loading {
			animation: none;
		}
	}
	@keyframes shimmer {
		0%,
		100% {
			background-position: 0 0%;
		}
		50% {
			background-position: 0 100%;
		}
	}

	.static-wall {
		columns: 2;
		column-gap: clamp(12px, 2vw, 24px);
	}
	.static-wall .print {
		break-inside: avoid;
		margin-bottom: clamp(12px, 2vw, 24px);
	}
	@media (max-width: 560px) {
		.static-wall {
			columns: 1;
		}
	}
</style>
