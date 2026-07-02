<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		label = 'Read the rest',
		closeLabel = 'Show less',
		collapsedHeight = '11rem',
		class: klass = '',
	}: {
		children: Snippet;
		label?: string;
		closeLabel?: string;
		/** Visible preview height while collapsed (any CSS length). */
		collapsedHeight?: string;
		class?: string;
	} = $props();

	const uid = $props.id();
	let open = $state(false);
	let inner = $state<HTMLElement | null>(null);
	let innerHeight = $state(0);
	let collapseEl = $state<HTMLElement | null>(null);
	// Skip the max-height animation until the user first interacts, so the
	// initial render (and content growing from lazy images) never animates.
	let interacted = $state(false);

	// Track the content's real height so the open state's max-height is always
	// exact (images/lightboxes inside keep loading after mount).
	$effect(() => {
		if (!inner || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				innerHeight = Math.ceil(
					entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height,
				);
			}
		});
		ro.observe(inner);
		return () => ro.disconnect();
	});

	function toggle() {
		interacted = true;
		open = !open;
		// Collapsing from deep inside long content would leave the viewport
		// stranded below the section — bring the collapse back into view.
		if (!open && collapseEl) {
			const top = collapseEl.getBoundingClientRect().top;
			if (top < 0) collapseEl.scrollIntoView({ block: 'nearest' });
		}
	}
</script>

<div class="gradient-collapse {klass}" class:open class:interacted bind:this={collapseEl}>
	<div
		id="gradient-collapse-{uid}"
		class="clip"
		style:max-height={open ? `${innerHeight}px` : collapsedHeight}>
		<div class="inner" bind:this={inner}>
			{@render children()}
		</div>
	</div>
	{#if !open}
		<!-- The whole faded zone is the control: clicking anywhere on the
		     fade reveals the rest. Lives outside the masked element so the
		     pill itself doesn't fade out with the content. -->
		<button
			class="veil"
			type="button"
			aria-expanded="false"
			aria-controls="gradient-collapse-{uid}"
			onclick={toggle}>
			<span class="pill">
				<span>{label}</span>
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<path
						d="M6 9l6 6 6-6"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round" />
				</svg>
			</span>
		</button>
	{/if}
	{#if open}
		<button
			class="less"
			type="button"
			aria-expanded="true"
			aria-controls="gradient-collapse-{uid}"
			onclick={toggle}>
			<span>{closeLabel}</span>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path
					d="M6 15l6-6 6 6"
					fill="none"
					stroke="currentColor"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round" />
			</svg>
		</button>
	{/if}
</div>

<style>
	@property --gc-fade {
		syntax: '<percentage>';
		inherits: false;
		initial-value: 42%;
	}
	.gradient-collapse {
		display: block;
		position: relative;
	}
	.clip {
		position: relative;
		overflow: clip;
		/* Fade the clipped content into whatever the section background is —
		   masking (rather than a painted gradient) works across every theme. */
		mask-image: linear-gradient(
			180deg,
			#000 var(--gc-fade),
			transparent calc(var(--gc-fade) + 58%)
		);
		-webkit-mask-image: linear-gradient(
			180deg,
			#000 var(--gc-fade),
			transparent calc(var(--gc-fade) + 58%)
		);
	}
	.interacted .clip {
		transition:
			max-height 500ms cubic-bezier(0.16, 1, 0.3, 1),
			--gc-fade 500ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.open .clip {
		--gc-fade: 100%;
	}
	.veil {
		appearance: none;
		border: 0;
		background: transparent;
		position: absolute;
		inset: auto 0 0 0;
		height: min(75%, 9rem);
		width: 100%;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		padding: 0 0 0.25rem;
		cursor: pointer;
		font: inherit;
		color: inherit;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 1.1rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		transition:
			background 200ms ease,
			transform 200ms ease;
	}
	.veil:hover .pill {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.14);
		transform: translateY(-2px);
	}
	.veil:focus-visible {
		outline: none;
	}
	.veil:focus-visible .pill {
		outline: 2px solid currentColor;
		outline-offset: 3px;
	}
	.pill svg,
	.less svg {
		width: 16px;
		height: 16px;
	}
	.less {
		appearance: none;
		display: flex;
		width: max-content;
		align-items: center;
		gap: 0.5rem;
		/* Centered like the closed-state pill, so the control doesn't jump to
		   the left edge when the state flips. */
		margin: 1rem auto 0;
		padding: 0.5rem 1rem;
		font: inherit;
		font-weight: 600;
		letter-spacing: 0.02em;
		border-radius: 999px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: inherit;
		opacity: 0.75;
		cursor: pointer;
		transition:
			opacity 200ms ease,
			background 200ms ease;
	}
	.less:hover {
		transition-duration: 0s;
		opacity: 1;
		background: rgba(255, 255, 255, 0.08);
	}
	@media (prefers-reduced-motion: reduce) {
		.interacted .clip {
			transition: none;
		}
	}
</style>
