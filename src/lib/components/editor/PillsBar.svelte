<script lang="ts">
	import { tick } from 'svelte';
	import { normalizeTag, sanitizeTagInputChar } from '$lib/utils/tags';

	interface Props {
		status: 'draft' | 'published';
		publishedAt: number | null;
		tags: string[];
		/** Pool of previously-used tags shown as autocomplete suggestions. */
		tagSuggestions?: string[];
		onStatusChange?: (s: 'draft' | 'published') => void;
		onPublishedAtChange?: (ts: number | null) => void;
		onTagsChange?: (tags: string[]) => void;
	}

	let {
		status = $bindable('draft'),
		publishedAt = $bindable(null),
		tags = $bindable([]),
		tagSuggestions = [],
		onStatusChange,
		onPublishedAtChange,
		onTagsChange,
	}: Props = $props();

	let tagInput = $state('');
	let tagInputEl: HTMLInputElement | undefined = $state();
	let dateInputEl: HTMLInputElement | undefined = $state();
	let showSuggestions = $state(false);
	let activeSuggestion = $state(0);

	function toggleStatus() {
		const next = status === 'draft' ? 'published' : 'draft';
		status = next;
		if (next === 'published' && publishedAt == null) {
			const now = Date.now();
			publishedAt = now;
			onPublishedAtChange?.(now);
		}
		onStatusChange?.(next);
	}

	function formatDate(ts: number | null): string {
		const d = ts ? new Date(ts) : new Date();
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function toDateInputValue(ts: number | null): string {
		const d = ts ? new Date(ts) : new Date();
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
	}

	function openDatePicker() {
		const el = dateInputEl;
		if (!el) return;
		if (!el.value) el.value = toDateInputValue(publishedAt);
		const withPicker = el as HTMLInputElement & { showPicker?: () => void };
		if (typeof withPicker.showPicker === 'function') withPicker.showPicker();
		else {
			el.focus();
			el.click();
		}
	}

	function onDateChange(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		if (!value) {
			publishedAt = null;
			onPublishedAtChange?.(null);
			return;
		}
		const ts = new Date(value).getTime();
		if (!Number.isFinite(ts)) return;
		publishedAt = ts;
		onPublishedAtChange?.(ts);
	}

	function tagsIncludes(tag: string): boolean {
		const key = tag.toLowerCase();
		return tags.some((t) => t.toLowerCase() === key);
	}

	function commitTag(raw: string): boolean {
		const cleaned = normalizeTag(raw.replace(/^#+/, ''));
		if (!cleaned) return false;
		if (tagsIncludes(cleaned)) return false;
		const next = [...tags, cleaned];
		tags = next;
		onTagsChange?.(next);
		return true;
	}

	function removeTag(tag: string) {
		const next = tags.filter((t) => t !== tag);
		tags = next;
		onTagsChange?.(next);
		tagInputEl?.focus();
	}

	const filteredSuggestions = $derived.by(() => {
		if (!tagSuggestions || tagSuggestions.length === 0) return [];
		const term = tagInput.trim().toLowerCase();
		const usedKeys = new Set(tags.map((t) => t.toLowerCase()));
		const available = tagSuggestions.filter((s) => !usedKeys.has(s.toLowerCase()));
		if (!term) return available;
		const starts: string[] = [];
		const contains: string[] = [];
		for (const s of available) {
			const lower = s.toLowerCase();
			if (lower.startsWith(term)) starts.push(s);
			else if (lower.includes(term)) contains.push(s);
		}
		return [...starts, ...contains];
	});

	$effect(() => {
		// Clamp the highlighted suggestion when the list shrinks.
		if (activeSuggestion >= filteredSuggestions.length) {
			activeSuggestion = Math.max(0, filteredSuggestions.length - 1);
		}
	});

	function onTagInput(e: Event) {
		const el = e.target as HTMLInputElement;
		// Only allow alphanumeric, hyphen, and space as the user types.
		const cleaned = el.value.replace(/[^A-Za-z0-9\- ]/g, '');
		if (cleaned !== el.value) {
			el.value = cleaned;
		}
		tagInput = cleaned;
		activeSuggestion = 0;
		showSuggestions = true;
	}

	function onTagBeforeInput(e: InputEvent) {
		const data = e.data;
		if (!data) return;
		// Strip disallowed characters at the source so they never appear.
		const filtered = sanitizeTagInputChar(data);
		if (filtered !== data) e.preventDefault();
	}

	function onTagKeyDown(e: KeyboardEvent) {
		const value = tagInput;
		if (e.key === 'ArrowDown') {
			if (filteredSuggestions.length === 0) return;
			e.preventDefault();
			showSuggestions = true;
			activeSuggestion = Math.min(activeSuggestion + 1, filteredSuggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			if (filteredSuggestions.length === 0) return;
			e.preventDefault();
			showSuggestions = true;
			activeSuggestion = Math.max(activeSuggestion - 1, 0);
		} else if (e.key === 'Escape') {
			if (showSuggestions) {
				e.preventDefault();
				showSuggestions = false;
			}
		} else if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
			// Tab/Enter/comma commit. If a suggestion is highlighted and the user
			// hasn't typed anything that diverges from it, accept it; otherwise
			// commit whatever they typed.
			const hasSuggestion =
				showSuggestions &&
				filteredSuggestions.length > 0 &&
				activeSuggestion < filteredSuggestions.length;
			const picked = hasSuggestion ? filteredSuggestions[activeSuggestion] : value;
			// Tab without any text and no highlighted suggestion → let Tab move focus.
			if (e.key === 'Tab' && !picked.trim()) return;
			e.preventDefault();
			if (commitTag(picked)) {
				tagInput = '';
				activeSuggestion = 0;
			}
		} else if (e.key === 'Backspace' && value === '' && tags.length > 0) {
			e.preventDefault();
			const next = tags.slice(0, -1);
			tags = next;
			onTagsChange?.(next);
		}
	}

	function onTagFocus() {
		showSuggestions = true;
	}

	function onTagBlur() {
		// Slight delay so a click on a suggestion fires before the list hides.
		setTimeout(() => {
			showSuggestions = false;
		}, 120);
		if (tagInput.trim()) {
			commitTag(tagInput);
			tagInput = '';
		}
	}

	function focusTagInput() {
		tagInputEl?.focus();
	}

	async function pickSuggestion(tag: string) {
		if (commitTag(tag)) {
			tagInput = '';
			activeSuggestion = 0;
		}
		await tick();
		tagInputEl?.focus();
		showSuggestions = true;
	}
</script>

<div class="pills">
	<button
		type="button"
		class="pill status-pill"
		class:published={status === 'published'}
		onclick={toggleStatus}
		title={status === 'draft' ? 'Currently a draft — click to publish' : 'Currently published — click to revert to draft'}>
		{#if status === 'published'}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
				<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
				<path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
				<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
				<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
			</svg>
			Published
		{:else}
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
				<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
				<polyline points="14 2 14 8 20 8" />
				<path d="M10.5 13.5l3 3" />
				<path d="M8.5 18l4.5-4.5 2 2L10.5 20l-2.5.5z" />
			</svg>
			Draft
		{/if}
	</button>

	<button type="button" class="pill date-pill" onclick={openDatePicker} title="Click to change publish date">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12" aria-hidden="true">
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
		{publishedAt ? formatDate(publishedAt) : `Today (${formatDate(null)})`}
		<input
			bind:this={dateInputEl}
			type="date"
			class="date-input"
			tabindex="-1"
			aria-hidden="true"
			value={toDateInputValue(publishedAt)}
			onchange={onDateChange} />
	</button>

	{#each tags as tag (tag)}
		<button
			type="button"
			class="pill tag-pill"
			aria-label="Remove tag {tag}"
			onclick={() => removeTag(tag)}>
			<span class="tag-text">{tag}</span>
			<span class="tag-remove" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="10" height="10">
					<line x1="18" y1="6" x2="6" y2="18" />
					<line x1="6" y1="6" x2="18" y2="18" />
				</svg>
			</span>
		</button>
	{/each}

	<div class="tag-input-wrap" onclick={focusTagInput} role="presentation">
		<input
			bind:this={tagInputEl}
			value={tagInput}
			type="text"
			class="tag-input"
			placeholder="Add tags…"
			autocomplete="off"
			spellcheck="false"
			oninput={onTagInput}
			onbeforeinput={onTagBeforeInput}
			onkeydown={onTagKeyDown}
			onfocus={onTagFocus}
			onblur={onTagBlur} />
		{#if showSuggestions && filteredSuggestions.length > 0}
			<div class="suggestions" role="listbox">
				{#each filteredSuggestions as suggestion, i (suggestion)}
					<button
						type="button"
						class="suggestion"
						class:active={i === activeSuggestion}
						role="option"
						aria-selected={i === activeSuggestion}
						onmouseenter={() => (activeSuggestion = i)}
						onmousedown={(e) => e.preventDefault()}
						onclick={() => pickSuggestion(suggestion)}>
						{suggestion}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.pills {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		max-width: var(--measure);
		margin: 0 auto var(--space-8);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-1) var(--space-3);
		background: var(--color-bg-secondary);
		border: 1px solid transparent;
		border-radius: var(--radius-full);
		color: var(--color-text-secondary);
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
		transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
	}

	.pill:hover {
		border-color: var(--color-border);
	}

	.status-pill svg {
		color: var(--color-text-muted);
		transition: color 120ms ease;
	}

	.status-pill.published {
		background: rgba(0, 180, 160, 0.12);
		color: var(--color-accent);
	}

	.status-pill.published svg {
		color: var(--color-accent);
	}

	.date-pill {
		position: relative;
	}

	.date-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		width: 100%;
		height: 100%;
		border: none;
		padding: 0;
	}

	.tag-pill {
		gap: 4px;
		padding-right: var(--space-2);
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
	}
	.tag-pill:hover {
		background: color-mix(in oklch, var(--color-error) 14%, transparent);
		color: var(--color-error);
		border-color: var(--color-error);
	}
	.tag-pill:hover .tag-remove {
		color: var(--color-error);
	}

	.tag-text { font-size: var(--text-sm); }

	.tag-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		color: var(--color-text-muted);
		transition: color 120ms ease;
	}

	.tag-input-wrap {
		position: relative;
		flex: 1 1 160px;
		min-width: 160px;
		display: flex;
	}

	.tag-input {
		flex: 1;
		min-width: 0;
		border: none;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		color: var(--color-text);
		font-size: var(--text-sm);
		outline: none;
	}
	.tag-input::placeholder {
		color: var(--color-text-muted);
	}
	.tag-input:focus {
		box-shadow: none;
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		z-index: 4;
		min-width: 180px;
		max-width: 280px;
		max-height: 240px;
		overflow-y: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		padding: var(--space-1);
		display: flex;
		flex-direction: column;
	}

	.suggestion {
		display: block;
		width: 100%;
		text-align: left;
		padding: var(--space-2) var(--space-3);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-size: var(--text-sm);
		border-radius: var(--radius-sm);
		cursor: pointer;
	}

	.suggestion:hover,
	.suggestion.active {
		background: var(--color-bg-secondary);
		color: var(--color-accent);
	}
</style>
