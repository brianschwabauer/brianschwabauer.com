<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { hideHeaderLogo } from '$lib/stores/navState';

	type Stop = { id: string; year: string; label: string };

	let stops = $state<Stop[]>([]);
	let activeIndex = $state(0);
	let visible = $state(false);
	let open = $state(false);
	let focusedIndex = $state(0);

	let buttonEl: HTMLButtonElement | undefined = $state();
	let listEl: HTMLUListElement | undefined = $state();

	const collectStops = () => {
		const els = Array.from(
			document.querySelectorAll<HTMLElement>('[data-section]')
		);
		stops = els
			.map((el) => ({
				id: el.id,
				year: el.dataset.sectionYear ?? '',
				label: el.dataset.sectionLabel ?? el.id
			}))
			.filter((s) => s.id);
	};

	const updateScrollState = () => {
		const heroEl =
			document.getElementById('hero') ||
			document.querySelector<HTMLElement>('[data-section]');
		if (!heroEl) return;
		const heroBottom = heroEl.getBoundingClientRect().bottom;
		const passed = heroBottom <= 80;
		visible = passed;
		hideHeaderLogo.set(passed);

		const probe = window.innerHeight * 0.35;
		let current = 0;
		for (let i = 0; i < stops.length; i++) {
			const el = document.getElementById(stops[i].id);
			if (!el) continue;
			const top = el.getBoundingClientRect().top;
			if (top - probe <= 0) current = i;
		}
		activeIndex = current;
	};

	onMount(() => {
		collectStops();
		updateScrollState();

		const onScroll = () => updateScrollState();
		const onResize = () => updateScrollState();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			hideHeaderLogo.set(false);
		};
	});

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const jumpTo = (id: string) => {
		const el = document.getElementById(id);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 72;
		window.scrollTo({ top, behavior: 'smooth' });
		open = false;
		buttonEl?.focus();
	};

	const openMenu = async () => {
		open = true;
		focusedIndex = activeIndex;
		await tick();
		focusItem(focusedIndex);
	};

	const closeMenu = () => {
		open = false;
		buttonEl?.focus();
	};

	const toggleMenu = () => {
		if (open) closeMenu();
		else openMenu();
	};

	const focusItem = (i: number) => {
		const items = listEl?.querySelectorAll<HTMLButtonElement>('[data-stop-item]');
		if (!items || items.length === 0) return;
		const clamped = Math.max(0, Math.min(items.length - 1, i));
		focusedIndex = clamped;
		items[clamped]?.focus();
	};

	const onButtonKeydown = (e: KeyboardEvent) => {
		if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openMenu();
		}
	};

	const onListKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			closeMenu();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			focusItem(focusedIndex + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			focusItem(focusedIndex - 1);
		} else if (e.key === 'Home') {
			e.preventDefault();
			focusItem(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			focusItem(stops.length - 1);
		} else if (e.key === 'Tab') {
			closeMenu();
		}
	};

	const onBackdropClick = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('.dropdown-root')) return;
		closeMenu();
	};

	$effect(() => {
		if (!open) return;
		document.addEventListener('mousedown', onBackdropClick);
		return () => document.removeEventListener('mousedown', onBackdropClick);
	});

	const active = $derived(stops[activeIndex]);
</script>

{#if visible}
	<div class="bar" aria-hidden={!visible}>
		<button
			type="button"
			class="up"
			onclick={scrollToTop}
			aria-label="Scroll to top of page"
		>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M12 19V5M6 11l6-6 6 6"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>

		<div class="dropdown-root">
			<button
				type="button"
				class="trigger"
				bind:this={buttonEl}
				onclick={toggleMenu}
				onkeydown={onButtonKeydown}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label="Jump to section"
			>
				{#if active}
					<span class="year">{active.year || '—'}</span>
					<span class="sep">·</span>
					<span class="label">{active.label}</span>
				{:else}
					<span class="label">Sections</span>
				{/if}
				<svg class="caret" class:open viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M6 9l6 6 6-6"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			{#if open}
				<ul
					bind:this={listEl}
					class="menu"
					role="listbox"
					tabindex="-1"
					aria-label="Page sections"
					onkeydown={onListKeydown}
				>
					{#each stops as stop, i (stop.id)}
						<li role="presentation">
							<button
								type="button"
								role="option"
								aria-selected={i === activeIndex}
								class:active={i === activeIndex}
								data-stop-item
								onclick={() => jumpTo(stop.id)}
							>
								<span class="opt-year">{stop.year || '—'}</span>
								<span class="opt-label">{stop.label}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
{/if}

<style>
	.bar {
		position: fixed;
		top: 12px;
		left: 0;
		right: 0;
		z-index: 250; /* above header (--z-sticky: 200) */
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 var(--space-4);
		max-width: var(--container-xl);
		margin: 0 auto;
		pointer-events: none;
	}
	@media (min-width: 768px) {
		.bar { padding: 0 var(--space-8); }
	}

	.up,
	.trigger {
		pointer-events: auto;
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		color: #fff;
		background: rgba(8, 10, 18, 0.72);
		border: 1px solid rgba(255, 255, 255, 0.18);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border-radius: 999px;
		cursor: pointer;
		transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
	}
	.up:hover,
	.trigger:hover {
		background: rgba(20, 24, 36, 0.9);
		border-color: rgba(0, 242, 195, 0.45);
	}
	.up:focus-visible,
	.trigger:focus-visible {
		outline: 2px solid #00f2c3;
		outline-offset: 2px;
	}

	.up {
		width: 44px;
		height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
	}
	.up svg { width: 18px; height: 18px; }
	.up:hover { transform: translateY(-2px); }

	.trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 44px;
		padding: 0 0.95rem 0 0.95rem;
		max-width: min(60vw, 22rem);
	}
	.trigger .year {
		font-weight: 800;
		color: #00f2c3;
		font-variant-numeric: tabular-nums;
		letter-spacing: 0.02em;
	}
	.trigger .sep { color: rgba(255, 255, 255, 0.4); }
	.trigger .label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.72rem;
	}
	.trigger .caret {
		width: 14px;
		height: 14px;
		opacity: 0.7;
		transition: transform 180ms ease;
		flex-shrink: 0;
	}
	.trigger .caret.open { transform: rotate(180deg); }

	.menu {
		pointer-events: auto;
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		min-width: 22rem;
		max-width: min(92vw, 28rem);
		max-height: min(70vh, 32rem);
		overflow-y: auto;
		margin: 0;
		padding: 0.4rem;
		list-style: none;
		background: rgba(8, 10, 18, 0.96);
		border: 1px solid rgba(255, 255, 255, 0.16);
		border-radius: 14px;
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		animation: menu-in 160ms ease-out;
	}
	@keyframes menu-in {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.dropdown-root {
		position: relative;
		pointer-events: auto;
	}

	.menu button {
		display: grid;
		grid-template-columns: 4.2rem 1fr;
		align-items: center;
		gap: 0.85rem;
		width: 100%;
		padding: 0.55rem 0.75rem;
		background: transparent;
		border: 0;
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.78);
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.82rem;
		letter-spacing: 0.03em;
		text-align: left;
		cursor: pointer;
		transition: background 140ms ease, color 140ms ease;
	}
	.menu button:hover,
	.menu button:focus-visible {
		background: rgba(0, 242, 195, 0.1);
		color: #fff;
		outline: none;
	}
	.menu button.active {
		background: rgba(0, 242, 195, 0.15);
		color: #fff;
	}
	.menu .opt-year {
		font-weight: 800;
		color: #00f2c3;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.menu .opt-label {
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 600;
		font-size: 0.74rem;
	}

	@media (max-width: 520px) {
		.trigger {
			padding: 0 0.75rem;
			max-width: calc(100vw - 90px);
		}
		.trigger .label { font-size: 0.68rem; }
		.menu {
			min-width: calc(100vw - 1.5rem);
			max-width: calc(100vw - 1.5rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar, .menu { animation: none; }
		.trigger .caret { transition: none; }
	}
</style>
