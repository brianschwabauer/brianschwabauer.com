<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import PinScrub from '../primitives/PinScrub.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LightboxGallery from '../primitives/LightboxGallery.svelte';
	import { type GalleryItem } from '@delightstack/components/media';

	const CDN = 'https://cdn.brianschwabauer.com/media/';
	/** Must match the `scale` on `.wall` — the visible slice of a column is the
	    stage height divided by it, and that slice is what travel is measured against. */
	const SCALE = 1.25;

	type Shot = { file: string; width: number; height: number; caption: string };
	type Column = {
		/** -1 = content travels up the screen, +1 = down. */
		direction: -1 | 1;
		speed: number;
		shots: Shot[];
	};

	const COLUMNS: Column[] = [
		{
			direction: -1,
			speed: 1,
			shots: [
				{
					file: '2016-01-01_engagement_grower_marketing_website-full_home_page.avif',
					width: 1907,
					height: 7655,
					caption: 'Engagement Grower · the whole marketing site',
				},
			],
		},
		{
			direction: 1,
			speed: 1,
			shots: [
				{
					file: '2015-08-13_blue_tape_estate_sales-website_redesign_mockup-home_page.avif',
					width: 874,
					height: 2048,
					caption: 'Blue Tape Estate Sales · home page',
				},
				{
					file: '2015-08-13_blue_tape_estate_sales-website_redesign_mockup-services_page.avif',
					width: 562,
					height: 2048,
					caption: 'Blue Tape Estate Sales · services page',
				},
				{
					file: '2015-08-13_blue_tape_estate_sales-website_redesign_mockup-sales_page.avif',
					width: 562,
					height: 2048,
					caption: 'Blue Tape Estate Sales · sales page',
				},
				{
					file: '2015-08-13_blue_tape_estate_sales-website_redesign_mockup-contact_page.avif',
					width: 562,
					height: 2048,
					caption: 'Blue Tape Estate Sales · contact page',
				},
			],
		},
		{
			direction: -1,
			speed: 0.75,
			shots: [
				{
					file: '2018-01-01_bassless_ideas_website_design_v2.avif',
					width: 599,
					height: 2048,
					caption: 'Bassless Ideas · site design, v2',
				},
				{
					file: '2018-01-01_bassless_ideas_website_design_v1.avif',
					width: 933,
					height: 2048,
					caption: 'Bassless Ideas · site design, v1',
				},
				{
					file: '2018-01-01_tapkeep_v4-dashboard_phone_mockup-tasks_page-create_task–details.png',
					width: 1080,
					height: 2352,
					caption: 'TapKeep · create-task details',
				},
				{
					file: '2017-01-01_tapnotion_app_screenshot_home_page.avif',
					width: 375,
					height: 812,
					caption: 'TapNotion · home',
				},
				{
					file: '2017-01-01_tapnotion_app_screenshot_game-item-multiple_choice.avif',
					width: 375,
					height: 812,
					caption: 'TapNotion · multiple choice',
				},
				{
					file: '2017-01-01_tapnotion_app_screenshot_game_over-win.avif',
					width: 375,
					height: 812,
					caption: 'TapNotion · game over',
				},
			],
		},
	];

	/** Flat index of each column's first shot, so a click maps to a lightbox slide. */
	const STARTS = COLUMNS.map((_, i) =>
		COLUMNS.slice(0, i).reduce((sum, col) => sum + col.shots.length, 0),
	);

	const ITEMS: GalleryItem[] = COLUMNS.flatMap((col) =>
		col.shots.map((shot) => ({
			type: 'image' as const,
			src: CDN + shot.file,
			width: shot.width,
			height: shot.height,
			caption: shot.caption,
			alt: shot.caption,
		})),
	);

	let gallery = $state<ReturnType<typeof LightboxGallery>>();
	let stage_el = $state<HTMLElement | null>(null);
	let col_els = $state<(HTMLElement | null)[]>([]);
	let travels = $state<number[]>(COLUMNS.map(() => 0));
	let loaded = $state<boolean[]>(ITEMS.map(() => false));
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
			travels = COLUMNS.map((col, i) => {
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
		return COLUMNS[index].direction < 0 ? -travel * progress : -travel * (1 - progress);
	}
</script>

<SectionShell
	id="shipped-wall"
	year="2015–18"
	label="The Shipped Wall"
	theme="wall"
	class="wall-shell">
	<div class="container">
		<Reveal>
			<div class="intro">
				<div class="head">
					<div class="eyebrow">2015–18</div>
					<h2 class="title">The wall of shipped screens</h2>
				</div>
				<p class="standfirst">
					Between client work and product experiments, a lot of pixels shipped. These are
					full-height captures — no scaling down, no cropping. Click any of them to
					inspect.
				</p>
			</div>
		</Reveal>
	</div>

	{#if reduced}
		<div class="container">
			<div class="static-wall">
				{#each COLUMNS as col, c}
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
					<div class="wall">
						{#each COLUMNS as col, c}
							<div
								bind:this={col_els[c]}
								class="column col-{c}"
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

	<LightboxGallery bind:this={gallery} key="shipped-wall" items={ITEMS} />
</SectionShell>

<style>
	:global([data-theme='wall']) {
		background:
			radial-gradient(ellipse at 20% 0%, rgba(0, 214, 255, 0.07), transparent 55%),
			linear-gradient(180deg, #06050a, #0b0d14 55%, #06050a);
		color: #e8f2f6;
		/* Read by PinScrub's inline height and by the rotation below, so the whole
		   set piece reshapes at one breakpoint. */
		--wall-span: 250vh;
		--wall-rotate: -12deg;
	}
	@media (max-width: 720px) {
		:global([data-theme='wall']) {
			--wall-span: 200vh;
			--wall-rotate: -8deg;
		}
	}
	/* This section is one long pinned scrub — the 1200px default estimate is off by
	   an order of magnitude, which throws off hash jumps until it has rendered once. */
	:global(.section-shell.wall-shell) {
		contain-intrinsic-size: 1px 2600px;
	}
	@supports (contain-intrinsic-size: auto 1px) {
		:global(.section-shell.wall-shell) {
			contain-intrinsic-size: auto 1px auto 2600px;
		}
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #00d6ff;
		margin-bottom: 1rem;
	}
	.title {
		font-size: clamp(2.2rem, 5.5vw, 4rem);
		font-weight: 900;
		line-height: 1.02;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.standfirst {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 44rem;
		margin: 0;
		color: rgba(232, 242, 246, 0.85);
	}
	/* Title left, standfirst right, sitting on the same baseline. On a wide
	   monitor the old stacked intro left the entire right half of the fold empty
	   while the text ran to a 44rem measure on the left. */
	.intro {
		display: grid;
		gap: 1rem clamp(2rem, 5vw, 4.5rem);
		margin-bottom: clamp(2.5rem, 6vw, 4rem);
	}
	@media (min-width: 900px) {
		.intro {
			grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
			align-items: end;
		}
		.standfirst {
			padding-bottom: 0.5rem;
		}
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
		grid-template-columns: repeat(3, 1fr);
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
		.wall {
			grid-template-columns: repeat(2, 1fr);
		}
		/* A 1907px-wide capture is illegible at phone widths — drop it and let the
		   two narrower columns carry the wall. */
		.col-0 {
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
			0 0 0 2px rgba(0, 214, 255, 0.35);
	}
	.print:focus-visible {
		outline: 2px solid #00d6ff;
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
