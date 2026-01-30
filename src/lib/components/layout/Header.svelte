<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte';
	import FullScreenMenu from './FullScreenMenu.svelte';

	let { showThemeToggle = false, invertLogo = false } = $props();

	let menuOpen = $state(false);
	let scrolled = $state(false);

	if (typeof window !== 'undefined') {
		$effect(() => {
			const handleScroll = () => {
				scrolled = window.scrollY > 50;
			};
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		});
	}

	const navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' }
	];
</script>

<header class="header" class:scrolled>
	<div class="header-inner">
		<a href="/" class="logo">
			<img src="/logo.svg" alt="Brian Schwabauer" class="logo-img" class:invert={invertLogo} />
		</a>

		<nav class="nav-desktop">
			{#each navLinks as link}
				<a href={link.href} class="nav-link">{link.label}</a>
			{/each}
		</nav>

		<div class="header-actions">
			{#if showThemeToggle}
				<ThemeToggle />
			{/if}
			<button
				class="menu-toggle"
				onclick={() => (menuOpen = !menuOpen)}
				aria-label="Toggle menu"
				aria-expanded={menuOpen}
			>
				<span class="menu-icon" class:open={menuOpen}>
					<span></span>
					<span></span>
					<span></span>
				</span>
			</button>
		</div>
	</div>
</header>

<FullScreenMenu bind:open={menuOpen} links={navLinks} />

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-sticky);
		padding: var(--space-4) 0;
		transition: background-color var(--transition-normal), backdrop-filter var(--transition-normal);
	}

	.header.scrolled {
		background-color: color-mix(in srgb, var(--color-bg) 70%, transparent);
		backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border);
	}

	.header-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: var(--container-xl);
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	@media (min-width: 768px) {
		.header-inner {
			padding: 0 var(--space-8);
		}
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-weight: 700;
		font-size: var(--text-xl);
		color: var(--color-text);
		text-decoration: none;
	}

	.logo-img {
		height: 32px;
		width: auto;
	}

	.logo-img.invert {
		filter: brightness(0) invert(1);
	}

	.nav-desktop {
		display: none;
		gap: var(--space-8);
		margin-left: auto;
		margin-right: var(--space-6);
	}

	@media (min-width: 768px) {
		.nav-desktop {
			display: flex;
		}
	}

	.nav-link {
		color: var(--color-text-secondary);
		font-weight: 500;
		transition: color var(--transition-fast);
	}

	.nav-link:hover {
		color: var(--color-text);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.menu-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--color-surface);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	@media (min-width: 768px) {
		.menu-toggle {
			display: none;
		}
	}

	.menu-icon {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 20px;
	}

	.menu-icon span {
		display: block;
		height: 2px;
		background: var(--color-text);
		border-radius: 1px;
		transition: transform var(--transition-fast), opacity var(--transition-fast);
	}

	.menu-icon.open span:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.menu-icon.open span:nth-child(2) {
		opacity: 0;
	}

	.menu-icon.open span:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}
</style>
