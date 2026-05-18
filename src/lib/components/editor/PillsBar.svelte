<script lang="ts">
	interface Props {
		status: 'draft' | 'published';
		publishedAt: number | null;
		tags: string[];
		onStatusChange?: (s: 'draft' | 'published') => void;
		onPublishedAtChange?: (ts: number | null) => void;
		onTagsChange?: (tags: string[]) => void;
	}

	let {
		status = $bindable('draft'),
		publishedAt = $bindable(null),
		tags = $bindable([]),
		onStatusChange,
		onPublishedAtChange,
		onTagsChange,
	}: Props = $props();

	let tagInput = $state('');
	let tagInputEl: HTMLInputElement | undefined = $state();
	let dateInputEl: HTMLInputElement | undefined = $state();

	function toggleStatus() {
		const next = status === 'draft' ? 'published' : 'draft';
		status = next;
		// Default publishedAt to today when first publishing.
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
		// Make sure the input shows today by default if unset.
		if (!el.value) el.value = toDateInputValue(publishedAt);
		// Native showPicker; fallback to focus+click for older browsers.
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

	function commitTag(raw: string) {
		const cleaned = raw.trim().replace(/^#+/, '').toLowerCase();
		if (!cleaned) return;
		if (tags.includes(cleaned)) return;
		const next = [...tags, cleaned];
		tags = next;
		onTagsChange?.(next);
	}

	function removeTag(tag: string) {
		const next = tags.filter((t) => t !== tag);
		tags = next;
		onTagsChange?.(next);
		// Refocus the input so the user can keep typing/deleting.
		tagInputEl?.focus();
	}

	function onTagKeyDown(e: KeyboardEvent) {
		const value = tagInput;
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			commitTag(value);
			tagInput = '';
		} else if (e.key === ' ' && value.trim().length > 0) {
			e.preventDefault();
			commitTag(value);
			tagInput = '';
		} else if (e.key === 'Backspace' && value === '' && tags.length > 0) {
			e.preventDefault();
			const next = tags.slice(0, -1);
			tags = next;
			onTagsChange?.(next);
		}
	}

	function onTagBlur() {
		if (tagInput.trim()) {
			commitTag(tagInput);
			tagInput = '';
		}
	}

	function focusTagInput() {
		tagInputEl?.focus();
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
			<!-- Rocket — signals it's gone live. -->
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
				<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
				<path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
				<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
				<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
			</svg>
			Published
		{:else}
			<!-- Pencil over a page — signals work-in-progress. -->
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
			bind:value={tagInput}
			type="text"
			class="tag-input"
			placeholder="Add tags…"
			autocomplete="off"
			spellcheck="false"
			onkeydown={onTagKeyDown}
			onblur={onTagBlur} />
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
	/* Whole pill is the click target; on hover make the destructive intent
	   clear by turning the chip and × red. */
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
		flex: 1 1 120px;
		min-width: 120px;
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
</style>
