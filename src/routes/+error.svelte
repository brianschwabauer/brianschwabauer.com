<script lang="ts">
	import { hydratable, onMount } from 'svelte';
	import { page } from '$app/state';
	import { Button } from '@delightstack/components/actions';
	import { create, load, search, type AnyOrama, type Results } from '@orama/orama';
	import SearchModal from '$lib/components/search/SearchModal.svelte';
	import { entryLabel, indexSchema, type SearchEntry } from '$lib/search';
	import { bgStyle, thumbnailURL } from '$lib/client/images';
	import { formatPostDate, isoPostDate } from '$lib/utils/date';

	type Mode = 'loading' | 'close' | 'latest' | 'none';

	let suggestions = $state<SearchEntry[]>([]);
	let mode = $state<Mode>('loading');
	let searchOpen = $state(false);

	const randomNumber = hydratable('random', () => Math.random());
	const pathname = $derived(page.url.pathname);
	const status = $derived(page.status);
	const isMissing = $derived(status === 404);
	/**
	 * Pull a search query out of the missing path. e.g.
	 * `/blog/some-old_post.html` → "some old post".
	 */
	const queryFromPath = $derived(
		pathname
			.replace(/^\/+|\/+$/g, '')
			.replace(/\.[a-z0-9]{2,5}$/i, '')
			.replace(/[\/\-_]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim(),
	);

	// Threshold above which we promote results from "Latest" to "Did you mean".
	// Looser than the auto-redirect threshold in fuzzyRedirect.ts on purpose —
	// even tenuous matches are worth surfacing once the user is already on the
	// 404 page (they can ignore them).
	const SUGGEST_MIN_SCORE = 0.8;

	// Pool of silly "lost / confused / fails" reaction images in static/.
	// Filenames are 404-not-found-01.avif … 404-not-found-{LOST_IMAGE_COUNT}.avif.
	// Bump this when adding more. Reading `pathname` makes the image re-roll
	// on client-side navigation between two missing URLs — otherwise the
	// component would stay mounted and keep the first roll.
	const LOST_IMAGE_COUNT = 15;
	const lostImage = $derived.by(() => {
		void pathname;
		const idx = Math.floor(randomNumber * LOST_IMAGE_COUNT) + 1;
		return `/404-not-found-${String(idx).padStart(2, '0')}.avif`;
	});

	onMount(async () => {
		if (!isMissing) {
			mode = 'none';
			return;
		}
		try {
			const res = await fetch('/index.json');
			if (!res.ok) throw new Error(`index ${res.status}`);
			const raw = await res.json();
			const db = create({ schema: indexSchema }) as AnyOrama;
			load(db, raw);

			const q = queryFromPath;
			if (q) {
				const r = (await search(db, {
					term: q,
					properties: ['title', 'summary', 'body', 'tags'],
					limit: 4,
					tolerance: 1,
				})) as Results<SearchEntry>;
				const close = r.hits.filter((h) => h.score >= SUGGEST_MIN_SCORE);
				if (close.length > 0) {
					suggestions = close.map((h) => h.document);
					mode = 'close';
					return;
				}
			}

			// sortBy on the persisted index may not be enabled — fall back to
			// pulling a wider set and sorting client-side. Same pattern as
			// SearchModal.refreshSuggestions.
			let latestDocs: SearchEntry[] = [];
			try {
				const r = (await search(db, {
					term: '',
					where: { type: 'blog' },
					sortBy: { property: 'date', order: 'DESC' },
					limit: 5,
				} as Parameters<typeof search>[1])) as Results<SearchEntry>;
				latestDocs = r.hits.map((h) => h.document);
			} catch {
				const r = (await search(db, {
					term: '',
					limit: 200,
				})) as Results<SearchEntry>;
				latestDocs = r.hits
					.map((h) => h.document)
					.filter((d) => d.type === 'blog')
					.sort((a, b) => b.date - a.date)
					.slice(0, 5);
			}
			suggestions = latestDocs;
			mode = 'latest';
		} catch (err) {
			console.error('404 suggestions failed:', err);
			mode = 'none';
		}
	});

	function openSearch() {
		searchOpen = true;
	}

	function onSearchSubmit(e: SubmitEvent) {
		e.preventDefault();
		openSearch();
	}
</script>

<svelte:head>
	<title>
		{isMissing ? 'Page not found' : 'Something went wrong'} — Brian Schwabauer
	</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="error-page" class:has-image={isMissing}>
	{#if isMissing}
		<img
			class="lost-image"
			src={lostImage}
			alt=""
			width="400"
			height="400"
			loading="eager"
			decoding="async" />
	{/if}
	<div class="error-content">
		<header class="error-head">
			<p class="error-code">{status}</p>
			<h1 class="error-title">
				{isMissing ? `This page doesn't exist` : 'Something went wrong'}
			</h1>
			<p class="error-detail">
				{#if isMissing}
					We couldn't find <code>{pathname}</code>
					. It may have moved, been renamed, or never existed.
				{:else}
					{page.error?.message ?? 'An unexpected error occurred.'}
				{/if}
			</p>
		</header>

		{#if isMissing}
			<form class="search-input" onsubmit={onSearchSubmit}>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" />
				</svg>
				<button
					type="button"
					class="search-input-button"
					onclick={openSearch}
					aria-label="Open search">
					{#if queryFromPath}
						<span class="seeded">{queryFromPath}</span>
					{:else}
						<span class="placeholder">Search posts, films, projects…</span>
					{/if}
				</button>
				<kbd>⌘K</kbd>
			</form>

			<section class="suggestions">
				<h2 class="section-label">
					{#if mode === 'loading'}
						Finding suggestions…
					{:else if mode === 'close'}
						Did you mean…
					{:else if mode === 'latest'}
						Or browse the latest from the blog
					{:else}
						Nothing to suggest — head home
					{/if}
				</h2>

				{#if suggestions.length > 0}
					<ul class="suggestion-list">
						{#each suggestions as hit (hit.id)}
							<li>
								<a href={hit.url} class="suggestion">
									{#if hit.featuredImage}
										<div class="suggestion-thumb" style={bgStyle(hit.featuredImage)}>
											<img src={thumbnailURL(hit.featuredImage)} alt="" loading="lazy" />
										</div>
									{:else if hit.imageUrl}
										<div class="suggestion-thumb">
											<img src={hit.imageUrl} alt="" loading="lazy" />
										</div>
									{:else}
										<div class="suggestion-thumb placeholder"></div>
									{/if}
									<div class="suggestion-body">
										<div class="suggestion-meta">
											<span class="suggestion-label">{entryLabel(hit)}</span>
											{#if hit.type === 'blog' && hit.date}
												<time datetime={isoPostDate(hit.date)}>
													{formatPostDate(hit.date)}
												</time>
											{/if}
										</div>
										<h3 class="suggestion-title">{hit.title}</h3>
										{#if hit.summary}
											<p class="suggestion-summary">{hit.summary}</p>
										{/if}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}

		<div class="actions">
			<Button href="/">Go home</Button>
			<Button href="/blog" transparent>Browse the blog</Button>
		</div>
	</div>
</div>

<SearchModal bind:open={searchOpen} initialQuery={queryFromPath} />

<style>
	.error-page {
		max-width: var(--measure);
		margin: 0 auto;
		padding: var(--space-8) var(--space-4) var(--space-24);
	}

	/* Two-column layout when there's a 404 image to surface. Content keeps its
	   prose width on the left; the meme floats to the right so it doesn't push
	   real content below the fold. Drops back to a single column on narrow
	   viewports (image first, content below). */
	.error-page.has-image {
		max-width: 1200px;
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		grid-template-areas: 'content image';
		gap: var(--space-6) var(--space-10);
		align-items: start;
	}

	.error-content {
		grid-area: content;
		min-width: 0;
	}

	.lost-image {
		display: block;
		grid-area: image;
		width: clamp(220px, 32vw, 500px);
		height: auto;
		object-fit: contain;
		border-radius: var(--radius-md);
		/* Nudge the image down so it visually aligns with the title rather
		   than the tiny eyebrow status code above it. */
		margin-top: var(--space-10);
	}

	@media (max-width: 720px) {
		.error-page.has-image {
			display: block;
		}
		.lost-image {
			width: clamp(160px, 50vw, 240px);
			margin: 0 0 var(--space-6);
		}
	}

	.error-head {
		margin-bottom: var(--space-8);
	}

	.error-code {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.78rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0 0 var(--space-2);
	}

	.error-title {
		font-family: var(--font-display, 'Playfair Display', serif);
		font-size: clamp(2rem, 6vw, 3.25rem);
		font-weight: 700;
		line-height: 1.05;
		margin: 0 0 var(--space-4);
		letter-spacing: -0.01em;
	}

	.error-detail {
		color: var(--color-text-secondary);
		font-size: var(--text-base);
		line-height: 1.6;
		max-width: 60ch;
	}

	.error-detail code {
		font-family: var(--font-mono, ui-monospace, monospace);
		background: var(--color-bg-secondary);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-size: 0.9em;
		word-break: break-all;
	}

	.search-input {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		margin-bottom: var(--space-8);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.search-input:hover,
	.search-input:focus-within {
		transition-duration: 0s;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 4px var(--color-accent-light);
	}

	.search-input svg {
		width: 18px;
		height: 18px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.search-input-button {
		flex: 1;
		background: transparent;
		border: 0;
		padding: var(--space-2) 0;
		font: inherit;
		font-size: var(--text-base);
		color: var(--color-text);
		text-align: left;
		cursor: text;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-input-button .placeholder {
		color: var(--color-text-muted);
	}

	.search-input-button .seeded {
		color: var(--color-text);
	}

	.search-input kbd {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.7rem;
		padding: 2px 6px;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.section-label {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.68rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0 0 var(--space-4);
	}

	.suggestion-list {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--space-8);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.suggestion {
		display: flex;
		gap: var(--space-4);
		align-items: stretch;
		padding: var(--space-3);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		text-decoration: none;
		color: inherit;
		transition:
			border-color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.suggestion:hover {
		transition-duration: 0s;
		border-color: var(--color-accent);
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
	}

	.suggestion-thumb {
		width: 80px;
		min-width: 80px;
		height: 80px;
		border-radius: var(--radius-md);
		background-size: cover;
		background-position: center;
		overflow: hidden;
		flex-shrink: 0;
	}

	.suggestion-thumb.placeholder {
		background: var(--color-bg-secondary);
	}

	.suggestion-thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.suggestion-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.suggestion-meta {
		display: flex;
		gap: var(--space-3);
		align-items: baseline;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.suggestion-label {
		color: var(--color-accent);
	}

	.suggestion-title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
	}

	.suggestion-summary {
		color: var(--color-text-secondary);
		font-size: 0.92rem;
		line-height: 1.45;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.actions {
		display: flex;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	@media (max-width: 540px) {
		.suggestion {
			gap: var(--space-3);
		}
		.suggestion-thumb {
			width: 64px;
			min-width: 64px;
			height: 64px;
		}
	}
</style>
