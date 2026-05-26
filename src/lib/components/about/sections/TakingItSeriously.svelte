<script lang="ts">
	import SectionShell from '../primitives/SectionShell.svelte';
	import YearMark from '../primitives/YearMark.svelte';
	import Reveal from '../primitives/Reveal.svelte';
	import LazyMedia from '../primitives/LazyMedia.svelte';
	import Expandable from '../primitives/Expandable.svelte';
</script>

<SectionShell id="taking-it-seriously" year="2009" label="First Websites" theme="flash">
	<div class="raster" aria-hidden="true"></div>

	<div class="container">
		<Reveal>
			<YearMark year="2009" subtitle="A Real Production Company" color="#ff66cc" />
		</Reveal>

		<div class="grid">
			<Reveal>
				<div class="eyebrow">FROM FILM KID → WEB KID</div>
				<h2 class="title">
					Real companies <br />
					have
					<span class="grad">websites.</span>
				</h2>
				<p class="lede">
					We wanted Hunky Spunky Productions to feel like a real production company. We
					made t-shirts. We made hats. And of course — every real company has a website.
					So I went and bought our first domain name. I didn't really know what a domain
					name was. But I knew we needed one.
				</p>
				<p class="lede">
					I fired up Apple's <strong>iWeb</strong>
					, which let me drag boxes onto a page and call it a website. It was perfect for someone
					who had no idea what HTML was. Pretty soon I outgrew it and moved to
					<strong>Adobe Dreamweaver</strong>
					. That meant I was actually writing code. Mostly badly. But I had crossed a line —
					I could make pixels do what I wanted, and the pixels could now do things on click.
				</p>
				<p class="lede">
					Soon I was writing Flash. A custom Flash header for the homepage with faces that
					made funny expressions when you hovered them. Animated transitions between
					pages. Embedded films. A blog. Anything that felt "interactive" I tried to ram
					in.
				</p>
			</Reveal>

			<Reveal variant="right" delay={100}>
				<div class="browser-stack">
					<div class="browser b3">
						<div class="chrome">
							<div class="lights">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="url">www.hunkyspunky.com / 2009</div>
						</div>
						<LazyMedia
							src="2009-01-01_hunky_spunky_productions-website_design-home_page.jpg"
							alt="HSP 2009 site"
							ratio="4 / 3" />
					</div>
					<div class="browser b2">
						<div class="chrome">
							<div class="lights">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="url">www.hunkyspunky.com / 2010</div>
						</div>
						<LazyMedia
							src="2010-01-01_hunky_spunky_productions-website_design-home_page.avif"
							alt="HSP 2010 site"
							ratio="4 / 3" />
					</div>
					<div class="browser b1">
						<div class="chrome">
							<div class="lights">
								<span></span>
								<span></span>
								<span></span>
							</div>
							<div class="url">www.hunkyspunky.com / 2008</div>
						</div>
						<LazyMedia
							src="2008-01-01_hunky_spunky_productions-website_design-home_page.jpg"
							alt="HSP 2008 site"
							ratio="4 / 3" />
					</div>
				</div>
			</Reveal>
		</div>

		<div class="calamity-launch">
			<Reveal variant="up">
				<h3 class="sub">A site for every film, eventually</h3>
				<p>
					When we released <strong>Calamity</strong>
					(a stop-motion lego film I'll get to in a later section), I built it its own little
					Flash website. It even had a Facebook "app" that embedded the same Flash player inside
					Facebook. Players could move a lego character around and watch its walk cycle animate.
					There were no objectives. No scoring. No win condition. That wasn't the point.
				</p>
				<p class="aside">
					The point was: <em>
						I could write code, and the code could make things appear on a screen.
					</em>
					I was hooked. I have not really stopped since.
				</p>
			</Reveal>

			<Reveal variant="up" delay={120}>
				<div class="flash-mock">
					<div class="flash-frame">
						<LazyMedia
							src="2009-12-25_calamity-flash_website_screen_recording-main_menu.avif"
							alt="Calamity Flash website screen recording"
							ratio="4 / 3" />
					</div>
					<div class="flash-tag">FLASH · 2009</div>
				</div>
			</Reveal>
		</div>

		<Reveal>
			<Expandable label="The Flash-era stack, for the people who remember">
				<div class="prose">
					<p>
						Looking back: iWeb → Dreamweaver → Flash + ActionScript. The blog was a
						hand-rolled mess. The video player was a custom embed. The "CMS" was me, in
						Dreamweaver, on my home PC, FTP-ing pages up to shared hosting. There were no
						frameworks. No git. No package manager. I knew none of those words.
					</p>
					<p>
						But the loop felt the same as it does now: write something, refresh the
						browser, see it on the screen. That feedback loop is the whole reason I do
						this.
					</p>
				</div>
			</Expandable>
		</Reveal>
	</div>
</SectionShell>

<style>
	:global([data-theme='flash']) {
		background:
			radial-gradient(ellipse at 80% 20%, rgba(255, 102, 204, 0.08), transparent 50%),
			radial-gradient(ellipse at 10% 80%, rgba(0, 255, 200, 0.06), transparent 60%),
			linear-gradient(180deg, #0c0716, #14091a 50%, #07081a);
		color: #ffe2f4;
	}
	.raster {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			0deg,
			transparent 0 3px,
			rgba(255, 102, 204, 0.06) 3px 4px
		);
		pointer-events: none;
		opacity: 0.5;
	}
	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 0 clamp(1rem, 3vw, 2rem);
		position: relative;
		z-index: 1;
	}
	.grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
	}
	@media (max-width: 768px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.eyebrow {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.32em;
		color: #ff66cc;
		margin-bottom: 1rem;
	}
	.title {
		font-size: clamp(2.4rem, 7vw, 5rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 1rem;
	}
	.grad {
		background: linear-gradient(90deg, #ff66cc, #ffb84d, #00ffc8);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.lede {
		font-size: clamp(1.05rem, 1.5vw, 1.2rem);
		line-height: 1.6;
		max-width: 38rem;
		margin: 0 0 1rem;
	}
	.lede strong {
		color: #ffb84d;
	}

	.browser-stack {
		position: relative;
		aspect-ratio: 4 / 3;
		max-width: 540px;
		margin: 0 auto;
	}
	.browser {
		position: absolute;
		inset: 0;
		background: #fff;
		border-radius: 10px;
		overflow: hidden;
		box-shadow:
			0 24px 60px rgba(0, 0, 0, 0.55),
			0 4px 14px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.12);
		transition: transform 350ms ease;
	}
	.browser.b1 {
		transform: rotate(-8deg) translate(-7%, 6%);
		z-index: 1;
	}
	.browser.b2 {
		transform: rotate(2deg) translate(2%, -3%);
		z-index: 2;
	}
	.browser.b3 {
		transform: rotate(-2deg);
		z-index: 3;
	}
	.browser-stack:hover .b1 {
		transform: rotate(-12deg) translate(-14%, 10%);
	}
	.browser-stack:hover .b2 {
		transform: rotate(4deg) translate(6%, -7%);
	}
	.browser-stack:hover .b3 {
		transform: rotate(0deg) translate(2%, -2%);
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		background: linear-gradient(180deg, #ddd, #bbb);
		border-bottom: 1px solid rgba(0, 0, 0, 0.2);
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: #222;
	}
	.lights {
		display: flex;
		gap: 4px;
	}
	.lights span {
		width: 9px;
		height: 9px;
		border-radius: 50%;
	}
	.lights span:nth-child(1) {
		background: #ff5f57;
	}
	.lights span:nth-child(2) {
		background: #febc2e;
	}
	.lights span:nth-child(3) {
		background: #28c840;
	}
	.url {
		flex: 1;
		background: rgba(255, 255, 255, 0.6);
		padding: 0.15rem 0.5rem;
		border-radius: 4px;
		font-size: 0.6rem;
	}

	.calamity-launch {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(1.5rem, 4vw, 3rem);
		align-items: center;
		margin: 5rem 0;
	}
	@media (max-width: 768px) {
		.calamity-launch {
			grid-template-columns: 1fr;
		}
	}
	.sub {
		font-size: clamp(1.6rem, 3vw, 2.4rem);
		font-weight: 800;
		margin: 0 0 0.6rem;
	}
	.aside {
		padding: 1rem 1.2rem;
		background: rgba(255, 102, 204, 0.08);
		border-left: 3px solid #ff66cc;
		border-radius: 0 8px 8px 0;
	}
	.aside em {
		font-style: italic;
		color: #ffb84d;
	}

	.flash-mock {
		position: relative;
	}
	.flash-frame {
		background: #000;
		padding: 8px;
		border-radius: 6px;
		box-shadow:
			0 24px 60px rgba(255, 102, 204, 0.18),
			0 4px 14px rgba(0, 0, 0, 0.4);
		border: 1px solid #ff66cc;
	}
	.flash-tag {
		position: absolute;
		bottom: -22px;
		right: 1rem;
		background: #ff66cc;
		color: #1b0214;
		font-family: var(--font-mono);
		font-weight: 800;
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		padding: 0.25rem 0.8rem;
		border-radius: 999px;
	}

	.prose p {
		line-height: 1.65;
		margin-bottom: 1rem;
	}
</style>
