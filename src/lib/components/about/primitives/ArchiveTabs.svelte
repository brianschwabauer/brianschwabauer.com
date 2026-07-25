<script lang="ts">
	type Tab = { title: string; src: string; host?: string; ratio?: string };

	let {
		tabs,
		label = 'Open sites',
		closeLabel = 'Hide sites',
	}: {
		tabs: Tab[];
		label?: string;
		closeLabel?: string;
	} = $props();

	const uid = $props.id();

	let active = $state(0);
	let open = $state(false);
	/* Tabs whose iframe has been mounted at least once. Mounted frames are never
	   torn down while the stage is open — switching back is instant and the
	   archived site keeps whatever scroll position you left it at. */
	let visited = $state<number[]>([]);
	let loaded = $state<number[]>([]);
	let tab_els: HTMLButtonElement[] = [];

	const current = $derived(tabs[active] ?? tabs[0]);
	const hosts = $derived(
		tabs.map((tab) => {
			if (tab.host) return tab.host;
			try {
				return new URL(tab.src).host;
			} catch {
				return '';
			}
		}),
	);

	function visit(index: number) {
		if (!visited.includes(index)) visited.push(index);
	}

	function show(index: number) {
		active = index;
		if (open) visit(index);
	}

	function toggle() {
		open = !open;
		if (open) visit(active);
	}

	function onkeydown(event: KeyboardEvent) {
		const last = tabs.length - 1;
		let next: number;
		if (event.key === 'ArrowRight') next = active === last ? 0 : active + 1;
		else if (event.key === 'ArrowLeft') next = active === 0 ? last : active - 1;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = last;
		else return;
		event.preventDefault();
		show(next);
		tab_els[next]?.focus();
	}
</script>

<div class="archive-tabs">
	<div class="tab-strip" role="tablist" aria-label="Archived sites">
		{#each tabs as tab, i (tab.src)}
			<button
				bind:this={tab_els[i]}
				type="button"
				role="tab"
				id="{uid}-tab-{i}"
				aria-selected={i === active}
				aria-controls={open ? `${uid}-panel-${i}` : undefined}
				tabindex={i === active ? 0 : -1}
				class="tab"
				class:active={i === active}
				style:--i={i}
				onclick={() => show(i)}
				{onkeydown}>
				{#if visited.includes(i) && !loaded.includes(i)}
					<span class="spinner" aria-hidden="true"></span>
				{:else}
					<span class="favicon" aria-hidden="true">{tab.title.trim().charAt(0)}</span>
				{/if}
				<span class="tab-title">{tab.title}</span>
			</button>
		{/each}
	</div>

	<div class="chrome">
		<div class="lights">
			<span class="r"></span>
			<span class="y"></span>
			<span class="g"></span>
		</div>
		<div class="addr">
			<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
				<rect
					x="5"
					y="11"
					width="14"
					height="9"
					rx="1.5"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5" />
				<path
					d="M8 11V8a4 4 0 1 1 8 0v3"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5" />
			</svg>
			<span class="url">{hosts[active]}</span>
			<span class="archive-pill">ARCHIVED · {current.title}</span>
		</div>
		<button class="open-btn" type="button" onclick={toggle}>
			{open ? closeLabel : label}
		</button>
	</div>

	<div class="stage" style:aspect-ratio={current.ratio ?? '16 / 10'}>
		{#if open}
			{#each tabs as tab, i (tab.src)}
				{#if visited.includes(i)}
					<div
						class="layer"
						class:hidden={i !== active}
						role="tabpanel"
						id="{uid}-panel-{i}"
						aria-labelledby="{uid}-tab-{i}">
						<iframe
							src={tab.src}
							title="{tab.title} (archived)"
							loading="lazy"
							referrerpolicy="no-referrer"
							sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
							onload={() => {
								if (!loaded.includes(i)) loaded.push(i);
							}}>
						</iframe>
					</div>
				{/if}
			{/each}
		{:else}
			<div class="placeholder">
				<div class="placeholder-grid">
					{#each Array(36) as _, i}
						<span style:animation-delay="{(i % 9) * 60}ms"></span>
					{/each}
				</div>
				<button class="ghost-launch" type="button" onclick={toggle}>
					<svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
						<path
							d="M5 12h14M13 6l6 6-6 6"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round" />
					</svg>
					Load archived site
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.archive-tabs {
		width: 100%;
		max-width: 100%;
		background: #1b1c22;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.55),
			0 4px 14px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.08);
	}

	.tab-strip {
		display: flex;
		gap: 1px;
		padding: 0.35rem 0.4rem 0;
		background: #101116;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.tab-strip::-webkit-scrollbar {
		display: none;
	}
	.tab {
		flex: 0 1 auto;
		min-width: 0;
		max-width: 16rem;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.45rem 0.7rem;
		border: 0;
		border-radius: 7px 7px 0 0;
		background: #1a1b22;
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		cursor: pointer;
		opacity: 0.55;
		transition:
			opacity 200ms ease,
			background 200ms ease;
	}
	.tab:not(.active):hover {
		transition-duration: 0s;
		opacity: 0.8;
	}
	.tab.active {
		/* Matches the top of the chrome gradient below, so the two merge. */
		background: #2a2c34;
		opacity: 1;
	}
	.tab:focus-visible {
		outline: 2px solid #ffd866;
		outline-offset: -2px;
	}
	.tab-title {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.favicon {
		flex-shrink: 0;
		width: 14px;
		height: 14px;
		display: grid;
		place-items: center;
		border-radius: 4px;
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		background: oklch(0.72 0.15 calc(45 + var(--i) * 47));
		color: oklch(0.2 0.05 calc(45 + var(--i) * 47));
	}
	.spinner {
		flex-shrink: 0;
		width: 12px;
		height: 12px;
		margin: 1px;
		border-radius: 50%;
		border: 2px solid rgba(255, 255, 255, 0.25);
		border-top-color: #fff;
		animation: spin 700ms linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: pulse 1.2s ease-in-out infinite;
		}
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem 0.85rem;
		background: linear-gradient(180deg, #2a2c34, #1f2027);
		border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		color: rgba(255, 255, 255, 0.7);
		font-family: var(--font-mono);
		font-size: 0.75rem;
	}
	.lights {
		display: flex;
		gap: 0.35rem;
	}
	.lights span {
		display: block;
		width: 11px;
		height: 11px;
		border-radius: 50%;
		box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.4);
	}
	.lights .r {
		background: #ff5f57;
	}
	.lights .y {
		background: #febc2e;
	}
	.lights .g {
		background: #28c840;
	}
	.addr {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.7rem;
		background: rgba(0, 0, 0, 0.35);
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		color: rgba(255, 255, 255, 0.7);
		overflow: hidden;
	}
	.url {
		font-weight: 500;
		color: #fff;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.archive-pill {
		font-size: 0.65rem;
		letter-spacing: 0.18em;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 200, 0, 0.18);
		color: #ffd866;
		white-space: nowrap;
		flex-shrink: 0;
	}
	/* Narrow: the tab strip already names the active site, so the pill is just
	   squeezing the host out of the address bar. */
	@media (max-width: 640px) {
		.archive-pill {
			display: none;
		}
	}
	.open-btn {
		font: inherit;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		padding: 0.35rem 0.85rem;
		white-space: nowrap;
		transition: background 200ms ease;
	}
	.open-btn:hover {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.16);
	}

	.stage {
		position: relative;
		width: 100%;
		background: #0a0a0a;
	}
	.layer {
		position: absolute;
		inset: 0;
	}
	/* Not `display: none` — that can reset an embedded document's state on some
	   engines. Hidden layers stay laid out, so switching back is instant. */
	.layer.hidden {
		visibility: hidden;
	}
	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		background: #fff;
	}
	.placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.placeholder-grid {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		grid-template-rows: repeat(4, 1fr);
		gap: 1px;
		padding: 8px;
		opacity: 0.25;
	}
	.placeholder-grid span {
		background: linear-gradient(135deg, #6c63ff, #00b4a0);
		border-radius: 6px;
		animation: shimmer 2.6s ease-in-out infinite;
	}
	@keyframes shimmer {
		0%,
		100% {
			opacity: 0.18;
			transform: scale(0.96);
		}
		50% {
			opacity: 0.55;
			transform: scale(1);
		}
	}
	.ghost-launch {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		background: rgba(255, 255, 255, 0.92);
		color: #111;
		border: 0;
		padding: 0.75rem 1.4rem;
		border-radius: 999px;
		cursor: pointer;
		font: inherit;
		font-weight: 600;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		transition:
			transform 200ms ease,
			background 200ms ease;
	}
	.ghost-launch:hover {
		transition-duration: 0s;
		transform: translateY(-2px);
		background: #fff;
	}
</style>
