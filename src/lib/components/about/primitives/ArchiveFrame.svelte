<script lang="ts">
	import { Modal, Portal } from '@delightstack/components';
	import { ripple } from '@delightstack/utilities';

	let {
		src,
		title,
		ratio = '16 / 10',
		label = 'See it in action',
		closeLabel = 'Hide site',
		host = '',
	}: {
		src: string;
		title: string;
		ratio?: string;
		label?: string;
		closeLabel?: string;
		host?: string;
	} = $props();

	let open = $state(false);
	let modal_open = $state(false);
	/* One flag pair for both frames — inline and modal load the same src, so
	   one loading tells us the other would too. A refused iframe (mixed
	   content, X-Frame-Options) fails with no event at all, so a deadline is
	   the only way to notice; `loaded` still wins if the site limps in late. */
	let loaded = $state(false);
	let failed = $state(false);
	const displayHost = $derived.by(() => {
		if (host) return host;
		try {
			return new URL(src).host;
		} catch {
			return '';
		}
	});

	// On a phone the inline stage is a few centimetres tall — an archived
	// site squeezed into it is unreadable and unscrollable. Activating it
	// there opens the site in a fullscreen modal instead.
	function activate() {
		if (window.matchMedia('(max-width: 768px)').matches) modal_open = true;
		else open = true;
		setTimeout(() => {
			if (!loaded) failed = true;
		}, 10_000);
	}
</script>

<!-- Covers the (blank) frame once the deadline passes, and gets out of the way
     again on the off chance the site still arrives. -->
{#snippet loadFailed()}
	{#if failed && !loaded}
		<div class="load-failed" role="alert">
			<p>The archived site didn't load.</p>
			<a href={src} target="_blank" rel="noopener noreferrer">
				Open it in a new tab
				<svg viewBox="0 0 24 24" aria-hidden="true" width="15" height="15">
					<path
						d="M7 17L17 7M9 7h8v8"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round" />
				</svg>
			</a>
		</div>
	{/if}
{/snippet}

<div class="archive-frame">
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
			<span class="url">{displayHost}</span>
			<!-- The page's own title, the way a browser shows it on the tab —
			     context for what loads, not a status badge. -->
			<span class="page-title">{title}</span>
		</div>
		<button
			class="open-btn"
			type="button"
			onclick={() => (open ? (open = false) : activate())}>
			{open ? closeLabel : label}
		</button>
	</div>
	<div class="stage" style:aspect-ratio={ratio} class:open>
		{#if open}
			<iframe
				{src}
				title="{title} (archived)"
				loading="lazy"
				referrerpolicy="no-referrer"
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
				onload={() => (loaded = true)}>
			</iframe>
			{@render loadFailed()}
		{:else}
			<div class="placeholder">
				<div class="placeholder-grid">
					{#each Array(36) as _, i}
						<span style:animation-delay="{(i % 9) * 60}ms"></span>
					{/each}
				</div>
				<button class="ghost-launch" type="button" onclick={activate}>
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

<!-- Portaled to <body>: rendered in place, the fixed-position modal is
     captured by the section's transformed/isolated ancestors (Reveal's
     transform makes `fixed` behave like `absolute`, and the page root's
     `isolation: isolate` puts it under the fixed nav bar). -->
<Portal>
	<Modal
		bind:open={modal_open}
		disable_close_icon
		width="100vw"
		height="100dvh"
		max_width="100vw"
		max_height="100dvh"
		class="archive-modal">
		<div class="modal-stage">
			<iframe
				{src}
				title="{title} (archived)"
				referrerpolicy="no-referrer"
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
				onload={() => (loaded = true)}>
			</iframe>
			{@render loadFailed()}
			<button
				class="modal-close"
				type="button"
				aria-label="Close archived site"
				onclick={() => (modal_open = false)}
				{@attach ripple()}>
				<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
					<path
						d="M6 6l12 12M18 6L6 18"
						fill="none"
						stroke="currentColor"
						stroke-width="2.2"
						stroke-linecap="round" />
				</svg>
			</button>
		</div>
	</Modal>
</Portal>

<style>
	.archive-frame {
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
		flex-shrink: 0;
	}
	.page-title {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* A hairline between the address and the title, so the two read as separate
	   pieces of chrome rather than one long string. */
	.page-title::before {
		content: '';
		display: inline-block;
		width: 1px;
		height: 0.85em;
		margin-right: 0.55rem;
		translate: 0 0.12em;
		background: rgba(255, 255, 255, 0.18);
	}
	.open-btn {
		font: inherit;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 999px;
		padding: 0.35rem 0.85rem;
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
	iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		background: #fff;
	}
	/* Sits over the frame the browser left blank; solid, because the "content"
	   underneath is nothing. */
	.load-failed {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1rem;
		padding: 1.5rem;
		text-align: center;
		background: #101116;
		color: rgba(255, 255, 255, 0.75);
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}
	.load-failed p {
		margin: 0;
	}
	.load-failed a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.92);
		color: #111;
		text-decoration: none;
		font-weight: 600;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
		transition:
			transform 200ms ease,
			background 200ms ease;
	}
	.load-failed a:hover {
		transition-duration: 0s;
		transform: translateY(-2px);
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

	/* ---- fullscreen mobile modal ---- */
	/* The Modal's panel keeps its dialog padding and rounded corners by
	   default — strip both so the iframe truly owns the whole screen. */
	:global(.modal.archive-modal .body) {
		padding: 0;
		border-radius: 0;
		/* The iframe scrolls itself — the panel must not reserve a gutter or
		   scroll on its own. */
		overflow: hidden;
		scrollbar-gutter: auto;
	}
	.modal-stage {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.modal-stage iframe {
		display: block;
		width: 100%;
		height: 100%;
		border: 0;
		background: #fff;
	}
	.modal-close {
		position: absolute;
		top: calc(0.75rem + env(safe-area-inset-top));
		right: 0.75rem;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 50%;
		background: rgba(8, 10, 18, 0.72);
		color: #fff;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		cursor: pointer;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
		transition:
			background 200ms ease,
			transform 200ms ease;
	}
	.modal-close:hover {
		transition-duration: 0s;
		background: rgba(20, 24, 36, 0.9);
	}
	.modal-close:active {
		transform: scale(0.92);
	}
</style>
