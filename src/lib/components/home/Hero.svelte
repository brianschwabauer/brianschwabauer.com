<script lang="ts">
	import { Button } from '@delightstack/components/actions';
</script>

<section class="hero">
	<div class="hero-content">
		<div class="hero-text">
			<div class="hi">
				👋 Hi, I'm Brian
			</div>
			<h1 class="hero-title">
				Delivering <span class="accent">Delight</span>
			</h1>
			<p class="hero-subtitle">
				 For as long as I have lived, I have loved to create. I've built startups, developed apps, and produced videos. I live to create. I work to delight.
			</p>
			<div class="hero-cta">
				<Button href="/contact" size="2" accent>Contact Me</Button>
				<Button href="/about" outline size="2">About Me</Button>
			</div>
		</div>
		<div class="hero-image">
			<div class="image-decoration">
				<div class="decoration-circle decoration-circle-1"></div>
				<div class="decoration-circle decoration-circle-2"></div>
				<div class="decoration-circle decoration-circle-3"></div>
				<div class="decoration-dots"></div>
			</div>
			<div class="profile-image-wrapper">
				<img src="/profile_picture2.webp" alt="Brian Schwabauer" class="profile-image profile-image-mobile" />
				<img src="/profile_picture.webp" alt="Brian Schwabauer" class="profile-image profile-image-desktop" />
				<div class="foreground-shape foreground-shape-1"></div>
				<div class="foreground-shape foreground-shape-2"></div>
				<div class="foreground-shape foreground-shape-3"></div>
				<div class="foreground-shape foreground-shape-4"></div>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: var(--space-8) 0 var(--space-16);
		max-width: var(--container-xl);
		margin: 0 auto;
		padding-left: var(--space-4);
		padding-right: var(--space-4);
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.hero {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		align-items: center;
		text-align: center;
	}

	@media (min-width: 768px) {
		.hero-content {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: start;
			text-align: left;
			gap: var(--space-12);
		}
	}
	@media (min-width: 1024px) {
		.hero-content {
			gap: var(--space-16);
		}
	}

	.hero-text {
		position: relative;
		z-index: 3;
		padding-top: var(--space-8);
	}
	
	.hi {
		font-size: 1.25rem;
		margin-bottom: .5rem;
	}

	.hero-title {
		font-family: 'Nunito Sans', sans-serif;
		font-size: var(--text-4xl);
		font-weight: 900;
		line-height: 1.1;
		margin-bottom: var(--space-4);
	}

	@media (min-width: 768px) {
		.hero-title {
			/* font-size: var(--text-6xl); */
			font-size: 6rem;
			line-height: .9;
			margin-bottom: var(--space-6);
		}
	}

	.accent {
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}

	.hero-subtitle {
		font-size: var(--text-lg);
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
		margin-bottom: var(--space-6);
		max-width: 400px;
	}

	@media (min-width: 768px) {
		.hero-subtitle {
			font-size: var(--text-xl);
			margin-bottom: var(--space-8);
			max-width: 500px;
		}
	}

	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		justify-content: center;
	}

	@media (min-width: 768px) {
		.hero-cta {
			gap: var(--space-4);
			justify-content: flex-start;
		}
	}

	.hero-image {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: flex-end;
		order: -1;
	}
	
	@media (min-width: 768px) {
		.hero-image {
			min-height: 560px;
			order: 0;
			margin-right: min(0px, calc((200px - 15vw) * -1));
		}
	}

	.profile-image-wrapper {
		position: relative;
		flex-shrink: 0;
		z-index: 2;
	}
	
	.profile-image {
		display: block;
		height: auto;
		width: auto;
		filter: saturate(0%);
		transition: filter 0.5s ease;
		&:hover {
			filter: saturate(100%);
		}
	}

	.profile-image-mobile {
		height: 260px;
		width: auto;
	}

	.profile-image-desktop {
		display: none;
		height: 540px;
		width: auto;
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L100,0 L100,92 C95,94 90,91 85,93 C80,95 75,90 70,92 C65,95 60,91 55,93 C50,90 45,94 40,91 C35,93 30,90 25,92 C20,95 15,91 10,93 C5,90 2,94 0,92 Z' fill='white'/%3E%3C/svg%3E");
		mask-size: 100% 100%;
		mask-repeat: no-repeat;
		-webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L100,0 L100,92 C95,94 90,91 85,93 C80,95 75,90 70,92 C65,95 60,91 55,93 C50,90 45,94 40,91 C35,93 30,90 25,92 C20,95 15,91 10,93 C5,90 2,94 0,92 Z' fill='white'/%3E%3C/svg%3E");
		-webkit-mask-size: 100% 100%;
		-webkit-mask-repeat: no-repeat;
	}

	@media (min-width: 768px) {
		.profile-image-mobile {
			display: none;
		}

		.profile-image-desktop {
			display: block;
		}
	}

	.image-decoration {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.decoration-circle {
		position: absolute;
		border-radius: 50%;
	}

	.decoration-circle-1 {
		width: 200px;
		height: 200px;
		right: 50%;
		bottom: 0;
		transform: translateX(50%);
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		opacity: 0.12;
		animation: float-slow 8s ease-in-out infinite;
	}

	.decoration-circle-2 {
		width: 80px;
		height: 80px;
		left: 10%;
		top: 10px;
		border: 2px solid var(--color-accent);
		opacity: 0.25;
		animation: float-medium 6s ease-in-out infinite;
	}

	.decoration-circle-3 {
		width: 50px;
		height: 50px;
		right: 15%;
		top: 30px;
		background: var(--color-accent);
		opacity: 0.15;
		animation: float-fast 5s ease-in-out infinite;
	}

	.decoration-dots {
		display: none;
	}

	@keyframes float-slow {
		0%, 100% { transform: translateX(50%) translateY(0); }
		50% { transform: translateX(50%) translateY(-12px); }
	}

	@keyframes float-medium {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-8px) translateX(5px); }
	}

	@keyframes float-fast {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-6px) translateX(-4px); }
	}

	@keyframes float-subtle {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-5px); }
	}

	@keyframes float-diagonal {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-7px) translateX(4px); }
	}

	@media (min-width: 768px) {
		.decoration-circle-1 {
			width: 480px;
			height: 480px;
			right: -60px;
			bottom: -20px;
			animation: float-slow-desktop 8s ease-in-out infinite;
		}

		.decoration-circle-2 {
			width: 240px;
			height: 240px;
			left: -40px;
			top: 20px;
			border-width: 3px;
		}

		.decoration-circle-3 {
			width: 120px;
			height: 120px;
			right: 40px;
			top: -20px;
		}

		.decoration-dots {
			display: block;
			position: absolute;
			left: -20px;
			bottom: 100px;
			width: 140px;
			height: 140px;
			background-image: radial-gradient(var(--color-accent) 2px, transparent 2px);
			background-size: 16px 16px;
			opacity: 0.4;
			animation: float-subtle 7s ease-in-out infinite;
		}

		@keyframes float-slow-desktop {
			0%, 100% { transform: translateY(0); }
			50% { transform: translateY(-15px); }
		}
	}

	/* Foreground elements - on top of profile image */
	.foreground-shape {
		position: absolute;
		border-radius: 50%;
		z-index: 3;
		pointer-events: none;
	}

	.foreground-shape-1 {
		width: 65px;
		height: 65px;
		left: -10px;
		bottom: -15px;
		background: var(--color-accent);
		animation: float-fg-1 7s ease-in-out infinite;
	}

	.foreground-shape-2 {
		width: 40px;
		height: 40px;
		left: 20%;
		bottom: 10px;
		background: var(--color-bg-secondary);
		animation: float-fg-2 5s ease-in-out infinite;
	}

	.foreground-shape-3 {
		width: 55px;
		height: 55px;
		right: -10px;
		bottom: -8px;
		background: var(--color-bg);
		border: 3px solid var(--color-accent);
		animation: float-fg-3 6s ease-in-out infinite;
	}

	.foreground-shape-4 {
		width: 30px;
		height: 30px;
		right: 20%;
		bottom: 15px;
		background: var(--color-accent);
		animation: float-fg-4 4.5s ease-in-out infinite;
	}

	@keyframes float-fg-1 {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-6px) translateX(3px); }
	}

	@keyframes float-fg-2 {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-4px) translateX(-3px); }
	}

	@keyframes float-fg-3 {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-5px) translateX(-2px); }
	}

	@keyframes float-fg-4 {
		0%, 100% { transform: translateY(0) translateX(0); }
		50% { transform: translateY(-3px) translateX(2px); }
	}

	@media (min-width: 768px) {
		.foreground-shape-1 {
			width: 110px;
			height: 110px;
			left: -25px;
			bottom: -25px;
		}

		.foreground-shape-2 {
			width: 70px;
			height: 70px;
			left: 15%;
			bottom: 20px;
		}

		.foreground-shape-3 {
			width: 90px;
			height: 90px;
			right: -20px;
			bottom: -15px;
			border-width: 4px;
		}

		.foreground-shape-4 {
			width: 50px;
			height: 50px;
			right: 20%;
			bottom: 30px;
		}
	}
</style>
