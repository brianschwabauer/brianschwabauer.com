<script lang="ts">
	// MiniDV camcorder viewfinder chrome — corner brackets, REC dot, timecode.
	// Wrap era-2006 footage so it reads as "through the camera".
	import type { Snippet } from 'svelte';

	let {
		children,
		timecode = '00:00:01:14',
		class: klass = '',
	}: {
		children: Snippet;
		timecode?: string;
		class?: string;
	} = $props();
</script>

<div class="viewfinder {klass}">
	{@render children()}
	<div class="chrome" aria-hidden="true">
		<span class="corner tl"></span>
		<span class="corner tr"></span>
		<span class="corner bl"></span>
		<span class="corner br"></span>
		<span class="rec">
			<span class="rec-dot"></span>
			REC
		</span>
		<span class="battery">
			<span class="battery-body"><span class="battery-fill"></span></span>
		</span>
		<span class="tc">SP {timecode}</span>
		<span class="mode">AUTO</span>
	</div>
</div>

<style>
	.viewfinder {
		position: relative;
	}
	.chrome {
		position: absolute;
		inset: 0;
		pointer-events: none;
		font-family: var(--font-mono);
		font-size: clamp(0.6rem, 1.4vw, 0.72rem);
		letter-spacing: 0.14em;
		color: rgba(255, 255, 255, 0.9);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
	}
	.corner {
		position: absolute;
		width: clamp(14px, 3vw, 22px);
		height: clamp(14px, 3vw, 22px);
		border: 2px solid rgba(255, 255, 255, 0.75);
	}
	.corner.tl {
		top: 6%;
		left: 4%;
		border-right: 0;
		border-bottom: 0;
	}
	.corner.tr {
		top: 6%;
		right: 4%;
		border-left: 0;
		border-bottom: 0;
	}
	.corner.bl {
		bottom: 6%;
		left: 4%;
		border-right: 0;
		border-top: 0;
	}
	.corner.br {
		bottom: 6%;
		right: 4%;
		border-left: 0;
		border-top: 0;
	}
	.rec {
		position: absolute;
		top: calc(6% + 4px);
		left: calc(4% + clamp(20px, 4vw, 30px));
		display: inline-flex;
		align-items: center;
		gap: 0.35em;
	}
	.rec-dot {
		width: 0.6em;
		height: 0.6em;
		border-radius: 50%;
		background: #ff3b30;
		box-shadow: 0 0 6px rgba(255, 59, 48, 0.9);
		animation: rec-blink 1.2s steps(1) infinite;
	}
	@keyframes rec-blink {
		50% {
			opacity: 0.15;
		}
	}
	.battery {
		position: absolute;
		top: calc(6% + 4px);
		right: calc(4% + clamp(20px, 4vw, 30px));
	}
	.battery-body {
		display: block;
		width: 1.6em;
		height: 0.8em;
		border: 1.5px solid rgba(255, 255, 255, 0.75);
		border-radius: 2px;
		padding: 1.5px;
	}
	.battery-fill {
		display: block;
		width: 60%;
		height: 100%;
		background: rgba(255, 255, 255, 0.75);
	}
	.tc {
		position: absolute;
		bottom: calc(6% + 4px);
		left: calc(4% + clamp(20px, 4vw, 30px));
		font-variant-numeric: tabular-nums;
	}
	.mode {
		position: absolute;
		bottom: calc(6% + 4px);
		right: calc(4% + clamp(20px, 4vw, 30px));
	}
	@media (prefers-reduced-motion: reduce) {
		.rec-dot {
			animation: none;
		}
	}
</style>
