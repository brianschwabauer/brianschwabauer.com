<script lang="ts">
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { Input, Select } from '@delightstack/components/form';
	import { Tabs } from '@delightstack/components/navigation';
	import { Button } from '@delightstack/components/actions';
	import { Image } from '@delightstack/components/media';
	import { ripple } from '@delightstack/utilities';
	import { create, insertMultiple, search, type AnyOrama } from '@orama/orama';
	import LightboxGallery from '$lib/components/about/primitives/LightboxGallery.svelte';
	import { archiveGalleryItems, archiveThumbUrl, type ArchiveEntry } from '$lib/archive';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const entries = $derived(data.entries as ArchiveEntry[]);

	// ---------------------------------------------------------------- search
	let query = $state('');
	// 0 = newest, 1 = oldest, 2 = best match (only meaningful with a query)
	let sort_tab = $state(0);
	let year = $state<string | null>('');

	/** id → rank from the last fuzzy search; null when no query is active. */
	let ranked = $state<Map<string, number> | null>(null);

	let db: AnyOrama | null = null;
	async function ensureDb(): Promise<AnyOrama> {
		if (db) return db;
		db = create({
			schema: {
				id: 'string',
				title: 'string',
				description: 'string',
				date: 'string',
				captions: 'string',
			},
		});
		await insertMultiple(
			db,
			entries.map((entry) => ({
				id: entry.id,
				title: entry.title,
				description: entry.description,
				date: entry.date,
				captions: (entry.photos ?? []).map((photo) => photo.caption ?? '').join(' '),
			})),
		);
		return db;
	}

	// Re-rank whenever the query changes. Auto-jump to "Best match" when a
	// query starts and back to "Newest" when it's cleared — the user can still
	// override mid-search and their choice sticks while they keep typing.
	let had_query = false;
	$effect(() => {
		const term = query.trim();
		if (!term) {
			ranked = null;
			if (had_query) sort_tab = 0;
			had_query = false;
			return;
		}
		if (!had_query) sort_tab = 2;
		had_query = true;
		let stale = false;
		(async () => {
			const orama = await ensureDb();
			const results = await search(orama, {
				term,
				properties: ['title', 'description', 'captions', 'date'],
				boost: { title: 3, description: 1.5 },
				tolerance: 1,
				limit: entries.length || 1,
			});
			if (stale) return;
			ranked = new Map(
				results.hits.map((hit, i) => [(hit.document as { id: string }).id, i]),
			);
		})();
		return () => {
			stale = true;
		};
	});

	const years = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const entry of entries) {
			const y = entry.date.slice(0, 4);
			counts.set(y, (counts.get(y) ?? 0) + 1);
		}
		return [...counts.entries()].sort((a, b) => b[0].localeCompare(a[0]));
	});

	const visible = $derived.by(() => {
		let list = entries;
		const y = year;
		if (y) list = list.filter((entry) => entry.date.startsWith(y));
		if (ranked) list = list.filter((entry) => ranked!.has(entry.id));
		const by_rank = (a: ArchiveEntry, b: ArchiveEntry) =>
			(ranked!.get(a.id) ?? 0) - (ranked!.get(b.id) ?? 0);
		const by_date = (a: ArchiveEntry, b: ArchiveEntry) =>
			sort_tab === 1 ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
		return [...list].sort(sort_tab === 2 && ranked ? by_rank : by_date);
	});

	const film_count = $derived(entries.filter((e) => e.type === 'film').length);

	// -------------------------------------------------------------- lightbox
	// One gallery instance, re-keyed per entry. Seeding `selected_id` from the
	// URL lets a shared/refreshed `?media=<id>` link server-render already open
	// (LightboxGallery reads the same param for its slide state). An unknown
	// id simply resolves `selected` to null, so no validation is needed here.
	let selected_id = $state<string | null>(page.url.searchParams.get('media'));
	const selected = $derived(entries.find((e) => e.id === selected_id) ?? null);
	let gallery = $state<LightboxGallery | null>(null);

	async function openEntry(entry: ArchiveEntry, event: MouseEvent) {
		const from = event.currentTarget as HTMLElement;
		if (selected_id !== entry.id) {
			selected_id = entry.id;
			await tick();
		}
		gallery?.open(0, from);
	}

	const date_format = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
	function formatDate(date: string): string {
		const parsed = new Date(`${date}T00:00:00`);
		return Number.isNaN(parsed.getTime()) ? date : date_format.format(parsed);
	}
</script>

<svelte:head>
	<title>Archive - Brian Schwabauer</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main>
	<header>
		<h1>Archive</h1>
		<p class="stats">
			{entries.length} entries · {film_count} films · private — visible only to you
		</p>
	</header>

	{#if entries.length === 0}
		<section class="empty">
			<h2>No index yet</h2>
			<p>
				The archive index hasn't been uploaded to KV (
				<code>/archive.json</code>
				). Upload it with the script in
				<code>scripts/archive/</code>
				, then refresh.
			</p>
		</section>
	{:else}
		<div class="toolbar">
			<div class="search">
				<Input type="search" label="Search projects" bind:value={query} />
			</div>
			<div class="year">
				<Select
					label="Year"
					bind:value={year}
					clearable
					options={years.map(([y, count]) => ({
						value: y,
						label: `${y} (${count})`,
					}))} />
			</div>
			<Tabs
				boxed
				bind:tab={sort_tab}
				tabs={[
					{ label: 'Newest' },
					{ label: 'Oldest' },
					{ label: 'Best match', disabled: !query.trim() },
				]} />
		</div>

		{#if visible.length === 0}
			<section class="empty">
				<h2>Nothing matches</h2>
				<p>
					No entries match{query.trim() ? ` “${query.trim()}”` : ''}{year
						? ` in ${year}`
						: ''}.
				</p>
				<Button
					onclick={() => {
						query = '';
						year = '';
					}}>
					Clear search
				</Button>
			</section>
		{:else}
			<ul class="grid">
				{#each visible as entry (entry.id)}
					<li>
						<button
							class="card"
							{@attach ripple()}
							onclick={(event) => openEntry(entry, event)}>
							<span class="thumb">
								<Image
									src={archiveThumbUrl(entry)}
									alt={entry.title}
									aspect_ratio="16/10"
									fit="cover"
									lazy
									skeleton />
								<span class="badge" class:film={entry.type === 'film'}>
									{entry.type === 'film' ? 'Film' : `${entry.photos?.length ?? 0} photos`}
								</span>
							</span>
							<span class="meta">
								<span class="title">{entry.title}</span>
								<time datetime={entry.date}>{formatDate(entry.date)}</time>
								<span class="description">{entry.description}</span>
							</span>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>

{#if selected}
	{#key selected.id}
		<LightboxGallery
			bind:this={gallery}
			key={selected.id}
			items={archiveGalleryItems(selected)}
			autoplay_video={selected.type === 'film'} />
	{/key}
{/if}

<style>
	main {
		max-width: 72rem;
		margin: 0 auto;
		padding: 6rem 1.5rem 4rem;
		min-height: 100dvh;
	}

	header {
		margin-bottom: 2rem;

		h1 {
			font-size: 2.5rem;
			margin: 0 0 0.25rem;
		}

		.stats {
			margin: 0;
			color: oklch(from currentColor l c h / 0.6);
			font-size: 0.9rem;
		}
	}

	.toolbar {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
		margin-bottom: 1.75rem;

		.search {
			flex: 1 1 16rem;
		}
	}

	.year {
		flex: 0 0 10rem;
	}

	.grid {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 1.25rem;
	}

	.card {
		all: unset;
		box-sizing: border-box;
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		border-radius: var(--radius-lg, 0.75rem);
		overflow: hidden;
		background: light-dark(white, oklch(0.22 0 0));
		border: 1px solid light-dark(oklch(0.92 0 0), oklch(0.3 0 0));
		cursor: pointer;
		transition:
			translate 250ms cubic-bezier(0.25, 1, 0.5, 1),
			box-shadow 250ms cubic-bezier(0.25, 1, 0.5, 1);

		&:hover {
			transition-duration: 0s; /* instant on hover-in; default transition animates on hover-out */
			translate: 0 -4px;
			box-shadow: light-dark(
				0 12px 28px oklch(0 0 0 / 0.12),
				0 12px 28px oklch(0 0 0 / 0.5)
			);
		}

		&:active {
			translate: 0 1px;
			scale: 0.985;
		}

		&:focus-visible {
			outline: 2px solid var(--color-primary, oklch(0.62 0.19 264));
			outline-offset: 2px;
		}
	}

	.thumb {
		position: relative;
		display: block;
		background: light-dark(oklch(0.94 0 0), oklch(0.18 0 0));

		.badge {
			position: absolute;
			/* Above the Image component's layers (main img is z-index 1, fallback 2). */
			z-index: 2;
			top: 0.5rem;
			left: 0.5rem;
			padding: 0.15rem 0.5rem;
			border-radius: 999px;
			font-size: 0.72rem;
			font-weight: 600;
			letter-spacing: 0.02em;
			color: white;
			background: oklch(0.3 0.02 264 / 0.75);
			backdrop-filter: blur(6px);

			&.film {
				background: oklch(0.55 0.2 27 / 0.85);
			}
		}
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.75rem 0.9rem 0.9rem;

		.title {
			font-weight: 650;
			line-height: 1.25;
		}

		time {
			font-size: 0.78rem;
			color: oklch(from currentColor l c h / 0.55);
		}

		.description {
			font-size: 0.85rem;
			line-height: 1.4;
			color: oklch(from currentColor l c h / 0.75);
			display: -webkit-box;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}
	}

	.empty {
		text-align: center;
		padding: 4rem 1rem;
		display: grid;
		gap: 0.75rem;
		justify-items: center;

		h2 {
			margin: 0;
		}

		p {
			margin: 0;
			color: oklch(from currentColor l c h / 0.7);
			max-width: 34rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.card {
			transition: box-shadow 250ms;

			&:hover {
				transition-duration: 0s;
				translate: none;
			}
		}
	}
</style>
