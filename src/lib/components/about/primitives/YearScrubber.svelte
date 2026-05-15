<script lang="ts">
	import { onMount } from 'svelte';

	let {
		stops
	}: {
		stops: Array<{ id: string; year: string; label: string }>;
	} = $props();

	let activeId = $state(stops[0]?.id ?? '');
	let scrollPercent = $state(0);

	onMount(() => {
		const sections: HTMLElement[] = stops
			.map((s) => document.getElementById(s.id))
			.filter((el): el is HTMLElement => !!el);

		const update = () => {
			const sh = document.documentElement.scrollHeight - window.innerHeight;
			scrollPercent = sh > 0 ? window.scrollY / sh : 0;
			let current = sections[0]?.id ?? '';
			const probe = window.innerHeight * 0.35;
			for (const s of sections) {
				const top = s.getBoundingClientRect().top;
				if (top - probe <= 0) current = s.id;
			}
			activeId = current;
		};
		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	function jump(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		const top = el.getBoundingClientRect().top + window.scrollY - 80;
		window.scrollTo({ top, behavior: 'smooth' });
	}
</script>

<aside class="year-scrubber" aria-label="Page navigation">
	<div class="rail">
		<div class="fill" style:height="{scrollPercent * 100}%"></div>
	</div>
	<ul>
		{#each stops as stop}
			<li>
				<button
					type="button"
					class:active={activeId === stop.id}
					onclick={() => jump(stop.id)}
				>
					<span class="year">{stop.year}</span>
					<span class="label">{stop.label}</span>
					<span class="dot" aria-hidden="true"></span>
				</button>
			</li>
		{/each}
	</ul>
</aside>

<style>
	.year-scrubber {
		position: fixed;
		top: 50%;
		right: 1.25rem;
		transform: translateY(-50%);
		z-index: 50;
		pointer-events: auto;
		font-family: var(--font-mono);
	}
	.rail {
		position: absolute;
		right: 11px;
		top: 6px;
		bottom: 6px;
		width: 2px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}
	.fill {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		background: linear-gradient(180deg, #00f2c3, #00b4a0 60%, #6c63ff);
		border-radius: 2px;
		transition: height 80ms linear;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.45rem;
		max-height: min(80vh, 720px);
		overflow-y: auto;
		scrollbar-width: none;
	}
	ul::-webkit-scrollbar { display: none; }
	button {
		all: unset;
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.18rem 0.6rem;
		color: rgba(255, 255, 255, 0.55);
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		transition: color 200ms ease;
	}
	button:hover {
		color: #fff;
	}
	.year {
		font-weight: 700;
		min-width: 2.6rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.label {
		max-width: 0;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		opacity: 0;
		text-transform: uppercase;
		transition: max-width 250ms ease, opacity 250ms ease;
	}
	button:hover .label,
	button.active .label {
		max-width: 12rem;
		opacity: 1;
	}
	.dot {
		display: block;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.25);
		box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.4);
		transition: background 200ms ease, transform 200ms ease;
	}
	button.active .dot {
		background: #00f2c3;
		transform: scale(1.4);
	}
	button.active {
		color: #fff;
	}
	@media (max-width: 768px) {
		.year-scrubber { right: 0.5rem; }
		.label { display: none; }
		.year { min-width: 2.4rem; font-size: 0.65rem; }
	}
</style>
