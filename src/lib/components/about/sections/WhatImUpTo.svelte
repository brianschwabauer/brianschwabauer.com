<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';

	const currentYear = new Date().getFullYear();
</script>

<SectionShell
	id="what-im-up-to"
	year={String(currentYear)}
	label="What I'm up to"
	theme="snt"
>
	<div class="bg" aria-hidden="true"></div>
	<div class="container">
		<Reveal>
			<div class="eyebrow">
				<span class="dot"></span>
				<span>Currently · {currentYear}</span>
			</div>
		</Reveal>

		<div class="grid">
			<div class="copy">
				<Reveal variant="up" delay={60}>
					<h2 class="title">
						What I'm <span class="grad">up to</span>
					</h2>
				</Reveal>

				<Reveal variant="up" delay={140}>
					<div class="lockup">
						<div class="snt-mark" aria-hidden="true">
							<span>S&amp;T</span>
						</div>
						<div>
							<div class="brand">Show&amp;Tour</div>
							<div class="tagline">The best way to deliver real estate media.</div>
						</div>
					</div>
				</Reveal>

				<Reveal variant="up" delay={220}>
					<p class="lede">
						I'm full-time building <a href="https://showandtour.com" target="_blank" rel="noopener">Show&amp;Tour</a> with my friend
						<a href="https://joshmais.com" target="_blank" rel="noopener">Josh</a>: a project-delivery platform for
						real estate photographers. Beautiful property websites, branded delivery pages, smart invoicing —
						the whole workflow built around how photographers actually work. Thousands of users and counting.
					</p>
				</Reveal>

				<Reveal variant="up" delay={300}>
					<div class="ctas">
						<a class="cta-primary" href="https://showandtour.com" target="_blank" rel="noopener">
							Visit showandtour.com
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
						<a class="cta-ghost" href="#showandtour">
							The longer story
							<svg viewBox="0 0 24 24" aria-hidden="true">
								<path d="M12 4v16M6 14l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</a>
					</div>
				</Reveal>
			</div>

			<Reveal variant="left" delay={200}>
				<div class="shot">
					<LazyMedia
						src="2026-01-01_show_and_tour-dashboard_screenshot-dark_mode_project_page.avif"
						alt="Show&Tour project detail page"
						ratio="16 / 10"
						rounded={false}
					/>
					<div class="shot-glow" aria-hidden="true"></div>
				</div>
			</Reveal>
		</div>
	</div>
</SectionShell>

<style>
	:global([data-theme='snt']) {
		background:
			radial-gradient(circle at 12% 18%, rgba(0, 242, 195, 0.12), transparent 50%),
			radial-gradient(circle at 88% 78%, rgba(108, 99, 255, 0.10), transparent 50%),
			linear-gradient(180deg, #050a0c, #08161a 60%, #050a10);
		color: #e8faf6;
	}
	.bg {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgba(0, 242, 195, 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 242, 195, 0.05) 1px, transparent 1px);
		background-size: 60px 60px;
		mask-image: radial-gradient(ellipse at center, #000 25%, transparent 75%);
		pointer-events: none;
	}
	.container {
		max-width: 78rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.95rem;
		background: rgba(0, 242, 195, 0.08);
		border: 1px solid rgba(0, 242, 195, 0.25);
		border-radius: 999px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #00f2c3;
		margin-bottom: 1.4rem;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #00f2c3;
		box-shadow: 0 0 12px #00f2c3;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.55; transform: scale(1.3); }
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 3rem;
		align-items: center;
	}
	@media (min-width: 960px) {
		.grid {
			grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
			gap: clamp(2.5rem, 5vw, 4.5rem);
		}
	}

	.title {
		font-size: clamp(2.8rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1.6rem;
	}
	.grad {
		background: linear-gradient(135deg, #00f2c3, #6c63ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.lockup {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.4rem;
	}
	.snt-mark {
		display: grid;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 16px;
		background: linear-gradient(135deg, #00f2c3, #00d6ff);
		box-shadow:
			0 14px 36px rgba(0, 242, 195, 0.4),
			inset 0 -3px 0 rgba(0, 0, 0, 0.2);
		flex-shrink: 0;
	}
	.snt-mark span {
		color: #052028;
		font-size: 1.3rem;
		font-weight: 900;
		letter-spacing: -0.04em;
	}
	.brand {
		font-size: 1.5rem;
		font-weight: 800;
		line-height: 1;
		margin-bottom: 0.25rem;
	}
	.tagline {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		letter-spacing: 0.04em;
		color: #00f2c3;
	}

	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 36rem;
		color: rgba(255, 255, 255, 0.82);
		margin: 0 0 1.6rem;
	}
	.lede a {
		color: #00f2c3;
		text-decoration: underline;
		text-decoration-color: rgba(0, 242, 195, 0.4);
		text-underline-offset: 4px;
	}
	.lede a:hover { color: #fff; }

	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
	.cta-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.85rem 1.35rem;
		background: linear-gradient(135deg, #00f2c3, #00d6ff);
		color: #052028;
		font-weight: 800;
		border-radius: 999px;
		text-decoration: none;
		transition: transform 200ms ease, box-shadow 200ms ease;
		box-shadow: 0 10px 30px rgba(0, 242, 195, 0.3);
	}
	.cta-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 14px 40px rgba(0, 242, 195, 0.45);
	}
	.cta-primary svg { width: 16px; height: 16px; }

	.cta-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.85rem 1.35rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.18);
		color: #fff;
		border-radius: 999px;
		text-decoration: none;
		font-weight: 600;
		transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
	}
	.cta-ghost:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(0, 242, 195, 0.45);
		transform: translateY(-2px);
	}
	.cta-ghost svg { width: 16px; height: 16px; }

	.shot {
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		border: 1px solid rgba(0, 242, 195, 0.18);
		box-shadow:
			0 40px 90px rgba(0, 0, 0, 0.55),
			0 6px 20px rgba(0, 242, 195, 0.15);
	}
	.shot-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at top center, rgba(0, 242, 195, 0.18), transparent 60%);
		pointer-events: none;
	}
</style>
