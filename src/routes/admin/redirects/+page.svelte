<script lang="ts">
	import { untrack } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Button, alert } from '@delightstack/components/actions';
	import { Input, Select } from '@delightstack/components/form';
	import type { SelectOption } from '@delightstack/components';
	import type { RedirectEntry, RedirectMap, RedirectStatus } from '$lib/server/redirects';

	const statusOptions: SelectOption[] = [
		{ value: 301, label: '301' },
		{ value: 302, label: '302' },
		{ value: 307, label: '307' },
		{ value: 308, label: '308' },
	];

	let { data } = $props();

	type Row = {
		/** stable per-row id so {#each} keys stay valid across edits */
		id: string;
		from: string;
		to: string;
		status: RedirectStatus;
		note: string;
	};

	let nextId = 1;
	function newId() {
		return `r${nextId++}`;
	}

	function snapshot(rs: Row[]): string {
		return JSON.stringify(
			rs
				.map((r) => ({
					from: r.from.trim().toLowerCase(),
					to: r.to.trim(),
					status: r.status,
					note: r.note.trim(),
				}))
				.sort((a, b) => a.from.localeCompare(b.from)),
		);
	}

	function rowsFromMap(map: RedirectMap): Row[] {
		return Object.entries(map)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([from, entry]) => ({
				id: newId(),
				from,
				to: entry.to,
				status: entry.status ?? 301,
				note: entry.note ?? '',
			}));
	}

	// Seed local editor state from the server-loaded prop *once* — subsequent
	// updates flow through `save()` (which reassigns rows + savedSnapshot from
	// the API response). `untrack` is needed so Svelte 5 doesn't warn about
	// the intentional one-shot capture.
	let rows = $state<Row[]>(untrack(() => rowsFromMap(data.redirects)));
	let saving = $state(false);
	let saveError = $state<string | null>(null);
	let lastSavedAt = $state(untrack(() => data.updatedAt));

	// Dirty tracking compares against the serialized snapshot of the last
	// saved state — survives reorders, in-place edits, additions, deletions.
	let savedSnapshot = $state(untrack(() => snapshot(rows)));
	const isDirty = $derived(snapshot(rows) !== savedSnapshot);

	function addRow() {
		rows = [...rows, { id: newId(), from: '', to: '', status: 301, note: '' }];
	}

	async function removeRow(id: string) {
		const row = rows.find((r) => r.id === id);
		if (row && (row.from.trim() || row.to.trim())) {
			const ok = await alert({
				title: 'Remove this redirect?',
				message: `${row.from || '(empty)'} → ${row.to || '(empty)'} will be removed on save.`,
				continue_text: 'Remove',
				destructive: true,
			});
			if (!ok) return;
		}
		rows = rows.filter((r) => r.id !== id);
	}

	function rowsToMap(rs: Row[]): RedirectMap {
		const out: RedirectMap = {};
		for (const r of rs) {
			const from = r.from.trim();
			const to = r.to.trim();
			if (!from || !to) continue;
			const entry: RedirectEntry = { to, status: r.status };
			if (r.note.trim()) entry.note = r.note.trim();
			out[from] = entry;
		}
		return out;
	}

	async function save() {
		if (saving) return;
		saving = true;
		saveError = null;

		// Soft validation surfaced inline rather than blocking save.
		const incomplete = rows.filter((r) => (r.from.trim() ? !r.to.trim() : false));
		if (incomplete.length > 0) {
			saveError = `Some rows have a "from" but no "to" — they'll be dropped on save.`;
		}

		try {
			const map = rowsToMap(rows);
			const res = await fetch('/api/redirects', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ redirects: map }),
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { message?: string };
				throw new Error(body.message || `Save failed (${res.status})`);
			}
			const file = (await res.json()) as { updatedAt: number; redirects: RedirectMap };
			rows = rowsFromMap(file.redirects);
			savedSnapshot = snapshot(rows);
			lastSavedAt = file.updatedAt;
			await invalidateAll();
		} catch (err) {
			saveError = err instanceof Error ? err.message : 'Save failed';
		} finally {
			saving = false;
		}
	}

	function discardChanges() {
		rows = rowsFromMap(data.redirects);
		savedSnapshot = snapshot(rows);
		saveError = null;
	}

	function formatTime(ms: number): string {
		if (!ms) return 'never';
		return new Date(ms).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	}
</script>

<svelte:head>
	<title>Admin — Redirects</title>
</svelte:head>

<div class="page-header">
	<div class="page-title-group">
		<Button size="0" href="/admin" icon transparent aria-label="Back to admin">
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true">
				<line x1="19" y1="12" x2="5" y2="12" />
				<polyline points="12 19 5 12 12 5" />
			</svg>
		</Button>
		<div>
			<h1>Redirects</h1>
			<p class="subtitle">
				Map legacy URLs to current pages. Stored in KV at <code>/redirects.json</code>
				, looked up only on 404s.
			</p>
		</div>
	</div>
	<div class="page-actions">
		<span class="last-saved">Last saved {formatTime(lastSavedAt)}</span>
		{#if isDirty}
			<Button onclick={discardChanges} transparent disabled={saving}>Discard</Button>
		{/if}
		<Button onclick={save} disabled={saving || !isDirty}>
			{saving ? 'Saving…' : isDirty ? 'Save changes' : 'No changes'}
		</Button>
	</div>
</div>

{#if saveError}
	<div class="alert" role="alert">{saveError}</div>
{/if}

{#if rows.length === 0}
	<div class="empty">
		<p>No redirects yet.</p>
		<Button onclick={addRow}>Add the first redirect</Button>
	</div>
{:else}
	<div class="table">
		<div class="table-head">
			<span class="col-from">From</span>
			<span class="col-to">To</span>
			<span class="col-status">Status</span>
			<span class="col-note">Note</span>
			<span class="col-actions" aria-hidden="true"></span>
		</div>
		{#each rows as row (row.id)}
			<div class="table-row">
				<div class="col-from">
					<Input size="0" dense bind:value={row.from} placeholder="/old/path" />
				</div>
				<div class="col-to">
					<Input size="0" dense bind:value={row.to} placeholder="/new/path" />
				</div>
				<div class="col-status">
					<Select
						size="0"
						dense
						value={row.status}
						options={statusOptions}
						onchange={(d) => (row.status = d.value as RedirectStatus)} />
				</div>
				<div class="col-note">
					<Input size="0" dense bind:value={row.note} placeholder="Optional note" />
				</div>
				<div class="col-actions">
					<Button
						icon
						transparent
						size="0"
						onclick={() => removeRow(row.id)}
						aria-label="Remove redirect">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true">
							<polyline points="3 6 5 6 21 6" />
							<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
							<path d="M10 11v6" />
							<path d="M14 11v6" />
						</svg>
					</Button>
				</div>
			</div>
		{/each}
	</div>

	<div class="add-row">
		<Button onclick={addRow} transparent>+ Add redirect</Button>
	</div>
{/if}

<style>
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
		margin-bottom: var(--space-5);
		flex-wrap: wrap;
	}

	.page-title-group {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
	}

	h1 {
		margin: 0 0 4px;
		font-size: var(--text-2xl);
	}

	.subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--text-sm);
		max-width: 60ch;
	}

	.subtitle code {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.85em;
		padding: 1px 5px;
		background: var(--color-bg-muted);
		border-radius: var(--radius-sm);
	}

	.page-actions {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.last-saved {
		font-size: var(--text-xs);
		color: var(--color-text-muted);
	}

	.alert {
		padding: var(--space-2) var(--space-3);
		margin-bottom: var(--space-3);
		background: rgba(220, 60, 60, 0.08);
		border: 1px solid rgba(220, 60, 60, 0.35);
		color: #d33;
		border-radius: var(--radius-md);
		font-size: var(--text-sm);
	}

	.empty {
		text-align: center;
		padding: var(--space-9) var(--space-3);
		background: var(--color-surface);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-lg);
	}

	.empty p {
		margin-bottom: var(--space-3);
		color: var(--color-text-muted);
	}

	.table {
		display: flex;
		flex-direction: column;
		gap: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-2);
	}

	.table-head {
		display: grid;
		grid-template-columns: 1.4fr 1.4fr 80px 1.2fr 36px;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-2);
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.65rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.table-row {
		display: grid;
		grid-template-columns: 1.4fr 1.4fr 80px 1.2fr 36px;
		gap: var(--space-2);
		align-items: center;
	}

	/* Grid cells wrap the delightstack controls; let them shrink inside the fr
	   tracks, and centre the icon-only remove button in its narrow cell. */
	.table-row > div {
		min-width: 0;
	}
	.col-actions {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.add-row {
		margin-top: var(--space-2);
	}

	@media (max-width: 720px) {
		.table-head {
			display: none;
		}
		.table-row {
			grid-template-columns: 1fr 1fr 80px 36px;
			grid-template-areas:
				'from from from remove'
				'to to to to'
				'status note note note';
			gap: var(--space-2);
			padding: var(--space-2);
			background: var(--color-bg);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-sm);
		}
		.table-row .col-from {
			grid-area: from;
		}
		.table-row .col-to {
			grid-area: to;
		}
		.table-row .col-status {
			grid-area: status;
		}
		.table-row .col-note {
			grid-area: note;
		}
		.table-row .col-actions {
			grid-area: remove;
		}
	}
</style>
