<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { create, load, search, type AnyOrama, type Results } from '@orama/orama';
	import { categoryLabel, indexSchema, type SearchEntry } from '$lib/search';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	type Hit = SearchEntry & { score?: number };

	let query = $state('');
	let db = $state<AnyOrama | null>(null);
	let indexLoading = $state(false);
	let indexError = $state<string | null>(null);
	let suggestions = $state<Hit[]>([]);
	let keywordResults = $state<Hit[]>([]);
	let vectorResults = $state<Hit[] | null>(null);
	let vectorLoading = $state(false);
	let vectorError = $state<string | null>(null);
	let activeIndex = $state(0);
	let inputEl: HTMLInputElement | null = $state(null);
	let listEl: HTMLDivElement | null = $state(null);

	const visibleResults = $derived(
		vectorResults !== null
			? vectorResults
			: query.trim()
				? keywordResults
				: suggestions
	);

	const showFullResultsButton = $derived(
		Boolean(query.trim()) && vectorResults === null && !vectorLoading
	);

	async function loadIndex() {
		if (db || indexLoading) return;
		indexLoading = true;
		indexError = null;
		try {
			const res = await fetch('/index.json');
			if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
			const raw = await res.json();
			const next = create({ schema: indexSchema });
			load(next, raw);
			db = next as AnyOrama;
			await refreshSuggestions();
		} catch (err) {
			console.error('Search index load failed:', err);
			indexError = 'Search index unavailable.';
		} finally {
			indexLoading = false;
		}
	}

	async function refreshSuggestions() {
		if (!db) return;
		try {
			const r = (await search(db, {
				term: '',
				where: { type: 'blog' },
				sortBy: { property: 'date', order: 'DESC' },
				limit: 5
			})) as Results<SearchEntry>;
			suggestions = r.hits.map((h) => ({ ...h.document, score: h.score }));
		} catch (err) {
			// sortBy may need explicit config; fall back to manual sort
			console.warn('sortBy fallback:', err);
			const r = (await search(db, { term: '', limit: 200 })) as Results<SearchEntry>;
			suggestions = r.hits
				.map((h) => ({ ...h.document, score: h.score }))
				.filter((h) => h.type === 'blog')
				.sort((a, b) => b.date - a.date)
				.slice(0, 5);
		}
	}

	async function runKeywordSearch(q: string) {
		if (!db) {
			keywordResults = [];
			return;
		}
		const term = q.trim();
		if (!term) {
			keywordResults = [];
			return;
		}
		try {
			const r = (await search(db, {
				term,
				properties: ['title', 'summary', 'body', 'category', 'tags'],
				limit: 20,
				tolerance: 1
			})) as Results<SearchEntry>;
			keywordResults = r.hits.map((h) => ({ ...h.document, score: h.score }));
		} catch (err) {
			console.error('Keyword search failed:', err);
			keywordResults = [];
		}
	}

	async function runVectorSearch() {
		const q = query.trim();
		if (!q) return;
		vectorLoading = true;
		vectorError = null;
		try {
			const res = await fetch(`/api/search/vector?q=${encodeURIComponent(q)}&limit=20`);
			if (!res.ok) throw new Error(`Vector search failed: ${res.status}`);
			const data = (await res.json()) as {
				results: { id: string; score: number; doc: SearchEntry }[];
			};
			vectorResults = data.results.map((r) => ({ ...r.doc, score: r.score }));
		} catch (err) {
			console.error('Vector search failed:', err);
			vectorError = 'Full-content search unavailable.';
			vectorResults = [];
		} finally {
			vectorLoading = false;
		}
	}

	function close() {
		open = false;
	}

	function scrollToId(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 64;
		window.scrollTo({ top, behavior: 'smooth' });
	}

	async function navigate(hit: Hit) {
		close();
		if (hit.type === 'home') {
			const hashIndex = hit.url.indexOf('#');
			const id = hashIndex >= 0 ? hit.url.slice(hashIndex + 1) : '';
			if ($page.url.pathname !== '/') {
				await goto('/' + (id ? `#${id}` : ''));
				await tick();
				requestAnimationFrame(() => scrollToId(id));
			} else {
				scrollToId(id);
			}
		} else {
			goto(hit.url);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (visibleResults.length === 0) return;
			activeIndex = Math.min(activeIndex + 1, visibleResults.length - 1);
			scrollActiveIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (visibleResults.length === 0) return;
			activeIndex = Math.max(activeIndex - 1, 0);
			scrollActiveIntoView();
		} else if (e.key === 'Enter') {
			const hit = visibleResults[activeIndex];
			if (hit) {
				e.preventDefault();
				navigate(hit);
			}
		}
	}

	function scrollActiveIntoView() {
		if (!listEl) return;
		const el = listEl.querySelector<HTMLElement>(`[data-result-index="${activeIndex}"]`);
		el?.scrollIntoView({ block: 'nearest' });
	}

	function formatDate(date: number) {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	$effect(() => {
		if (open) {
			loadIndex();
			tick().then(() => inputEl?.focus());
			if (typeof document !== 'undefined') {
				document.body.style.overflow = 'hidden';
			}
		} else {
			query = '';
			keywordResults = [];
			vectorResults = null;
			vectorError = null;
			activeIndex = 0;
			if (typeof document !== 'undefined') {
				document.body.style.overflow = '';
			}
		}
	});

	$effect(() => {
		// re-run keyword search whenever query changes
		const q = query;
		vectorResults = null;
		vectorError = null;
		activeIndex = 0;
		runKeywordSearch(q);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div class="modal" role="dialog" aria-modal="true" aria-label="Search">
			<div class="search-bar">
				<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3.5-3.5" />
				</svg>
				<input
					bind:this={inputEl}
					bind:value={query}
					type="search"
					placeholder="Search posts, films, projects…"
					autocomplete="off"
					spellcheck="false"
					aria-label="Search"
				/>
				<button class="close-btn" type="button" onclick={close} aria-label="Close search">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<line x1="18" y1="6" x2="6" y2="18" />
						<line x1="6" y1="6" x2="18" y2="18" />
					</svg>
				</button>
			</div>

			<div class="results" bind:this={listEl}>
				{#if indexLoading && visibleResults.length === 0}
					<div class="state">Loading…</div>
				{:else if indexError}
					<div class="state error">{indexError}</div>
				{:else if visibleResults.length === 0 && query.trim()}
					<div class="state">
						No quick matches. Try
						<button class="inline-link" type="button" onclick={runVectorSearch}>
							searching post contents
						</button>.
					</div>
				{:else}
					{#if vectorResults !== null}
						<div class="section-label">Full-content results</div>
					{:else if query.trim()}
						<div class="section-label">Quick matches</div>
					{:else}
						<div class="section-label">Latest posts</div>
					{/if}

					{#each visibleResults as hit, i (hit.id)}
						<button
							type="button"
							class="result"
							class:active={i === activeIndex}
							data-result-index={i}
							onmouseenter={() => (activeIndex = i)}
							onclick={() => navigate(hit)}
						>
							<div class="result-head">
								<span class="result-category">{categoryLabel(hit)}</span>
								{#if hit.date && hit.type === 'blog'}
									<time class="result-date">{formatDate(hit.date)}</time>
								{/if}
							</div>
							<div class="result-title">{hit.title}</div>
							{#if hit.summary}
								<div class="result-summary">{hit.summary}</div>
							{/if}
							{#if hit.tags && hit.tags.length > 0}
								<div class="result-tags">
									{#each hit.tags.slice(0, 4) as tag}
										<span class="tag">{tag}</span>
									{/each}
								</div>
							{/if}
						</button>
					{/each}
				{/if}

				{#if vectorError}
					<div class="state error">{vectorError}</div>
				{/if}
			</div>

			<div class="footer">
				{#if vectorLoading}
					<span class="footer-status">Searching post contents…</span>
				{:else if showFullResultsButton}
					<button class="full-btn" type="button" onclick={runVectorSearch}>
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M4 19V5a2 2 0 0 1 2-2h11l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
							<path d="M8 10h8M8 14h5" />
						</svg>
						Search post contents
					</button>
				{:else if vectorResults !== null}
					<button class="full-btn ghost" type="button" onclick={() => (vectorResults = null)}>
						Back to quick matches
					</button>
				{/if}
				<span class="hint">
					<kbd>↑</kbd><kbd>↓</kbd> navigate
					<kbd>↵</kbd> open
					<kbd>esc</kbd> close
				</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 8vh var(--space-4) var(--space-4);
		background: rgba(6, 6, 10, 0.55);
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
		z-index: var(--z-modal-backdrop);
		animation: fade-in 180ms ease;
	}

	.modal {
		width: 100%;
		max-width: 720px;
		max-height: min(80vh, 720px);
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		color: var(--color-text);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.55);
		overflow: hidden;
		animation: scale-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.search-bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--color-border);
	}

	.search-icon {
		width: 22px;
		height: 22px;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.search-bar input {
		flex: 1;
		border: 0;
		background: transparent;
		font-size: var(--text-lg);
		padding: var(--space-2) 0;
	}

	.search-bar input:focus {
		outline: none;
		box-shadow: none;
		border: 0;
	}

	.search-bar input::-webkit-search-cancel-button {
		appearance: none;
	}

	.close-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: var(--radius-md);
		color: var(--color-text-muted);
		transition: color var(--transition-fast), background-color var(--transition-fast);
	}

	.close-btn:hover {
		color: var(--color-text);
		background: var(--color-bg-secondary);
	}

	.close-btn svg {
		width: 18px;
		height: 18px;
	}

	.results {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-2) var(--space-3) var(--space-3);
	}

	.section-label {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		padding: var(--space-3) var(--space-3) var(--space-2);
	}

	.state {
		padding: var(--space-6) var(--space-4);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
	}

	.state.error {
		color: var(--color-error);
	}

	.inline-link {
		color: var(--color-accent);
		font: inherit;
		text-decoration: underline;
		padding: 0;
		background: transparent;
	}

	.result {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-md);
		color: inherit;
		background: transparent;
		transition: background-color var(--transition-fast);
	}

	.result:hover,
	.result.active {
		background: var(--color-bg-secondary);
	}

	.result-head {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-1);
		font-size: 0.7rem;
		font-family: var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	.result-category {
		color: var(--color-accent);
		font-weight: 600;
	}

	.result-date {
		color: var(--color-text-muted);
	}

	.result-title {
		font-size: var(--text-base);
		font-weight: 600;
		line-height: 1.3;
		margin-bottom: var(--space-1);
	}

	.result-summary {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
		line-height: 1.45;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.result-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}

	.tag {
		font-size: 0.68rem;
		padding: 2px var(--space-2);
		border-radius: var(--radius-full);
		background: var(--color-bg-secondary);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		letter-spacing: 0.06em;
	}

	.footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
	}

	.full-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-size: var(--text-sm);
		font-weight: 500;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		color: var(--color-text);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		transition: background-color var(--transition-fast), border-color var(--transition-fast);
	}

	.full-btn:hover {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.full-btn.ghost {
		background: transparent;
	}

	.full-btn svg {
		width: 14px;
		height: 14px;
	}

	.footer-status {
		font-size: var(--text-sm);
		color: var(--color-text-secondary);
	}

	.hint {
		display: none;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		gap: var(--space-1);
	}

	@media (min-width: 640px) {
		.hint {
			display: inline-flex;
			align-items: center;
			gap: var(--space-2);
		}
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--color-text-secondary);
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: translateY(-12px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
</style>
