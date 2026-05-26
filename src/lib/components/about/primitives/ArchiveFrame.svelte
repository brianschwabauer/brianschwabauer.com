<script lang="ts">
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
	const displayHost = $derived.by(() => {
		if (host) return host;
		try {
			return new URL(src).host;
		} catch {
			return '';
		}
	});
</script>

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
			<span class="archive-pill">ARCHIVED · {title}</span>
		</div>
		<button class="open-btn" type="button" onclick={() => (open = !open)}>
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
				sandbox="allow-scripts allow-same-origin allow-popups allow-forms">
			</iframe>
		{:else}
			<div class="placeholder">
				<div class="placeholder-grid">
					{#each Array(36) as _, i}
						<span style:animation-delay="{(i % 9) * 60}ms"></span>
					{/each}
				</div>
				<button class="ghost-launch" type="button" onclick={() => (open = true)}>
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
	.archive-pill {
		font-size: 0.65rem;
		letter-spacing: 0.18em;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 200, 0, 0.18);
		color: #ffd866;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
