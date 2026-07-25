<script lang="ts">
	import { confetti } from '@delightstack/components/feedback';

	const reducedMotion = () =>
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	let card_el = $state<HTMLElement | null>(null);

	// Reaching the end of twenty years earns a continuous celebration: cannons at
	// the card's top corners fire 45° inward — aimed right at the title — for as
	// long as you stay on it. This used to fire at the absolute bottom of the
	// page, back when the Creed was the bottom; it belongs here, at "The End",
	// with the credits still to come.
	$effect(() => {
		if (!card_el || reducedMotion() || typeof IntersectionObserver === 'undefined') {
			return;
		}
		let stops: Array<() => void> | null = null;
		const COLORS = ['#00f2c3', '#a78bfa', '#ffd66e', '#ff8b8b', '#00d6ff'];
		const start = () => {
			if (stops) return;
			// anchor the emitters to the top edge of the card, not the viewport
			const top = card_el!.getBoundingClientRect().top;
			const y = Math.min(1, Math.max(0, top / window.innerHeight));
			const base = {
				colors: COLORS,
				particle_count: 80,
				start_velocity: 75,
				duration: 1000,
				z_index: 200,
			};
			stops = [
				confetti.cannon({ ...base, origin: { x: 0, y }, angle: 45 }),
				confetti.cannon({ ...base, origin: { x: 1, y }, angle: 135 }),
			];
		};
		const stop = () => {
			stops?.forEach((s) => s());
			stops = null;
		};
		const io = new IntersectionObserver(
			([entry]) => {
				// Two thresholds rather than one, so a card parked right on the
				// boundary can't stutter the cannons on and off.
				if (entry.intersectionRatio >= 0.6) start();
				else if (entry.intersectionRatio < 0.4) stop();
			},
			{ threshold: [0.4, 0.6] },
		);
		io.observe(card_el);
		return () => {
			io.disconnect();
			stop();
		};
	});
</script>

<section id="the-end" class="the-end" bind:this={card_el}>
	<p class="title">The End</p>
	<p class="signature">BRIAN SCHWABAUER · 2006 – ∞</p>
</section>

<style>
	.the-end {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: clamp(1.5rem, 4vw, 2.5rem);
		min-height: 100svh;
		background: #000;
		content-visibility: auto;
		contain-intrinsic-size: 1px 100svh;
	}
	.title {
		margin: 0;
		font-family: var(--font-display, 'Playfair Display', serif);
		font-style: italic;
		font-weight: 500;
		font-size: clamp(4rem, 12vw, 9rem);
		line-height: 1;
		/* Loose enough to read as a hand-lettered title card rather than a
		   headline, without a script face to do it for us. */
		letter-spacing: 0.06em;
		color: #f6f2e8;
		text-shadow: 0 0 60px rgba(246, 242, 232, 0.18);
	}
	.signature {
		margin: 0;
		font-family: var(--font-mono);
		font-size: clamp(0.62rem, 1.4vw, 0.75rem);
		letter-spacing: 0.34em;
		text-align: center;
		color: rgba(246, 242, 232, 0.5);
	}
</style>
