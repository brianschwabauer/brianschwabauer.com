<script lang="ts">
	import { ThemeToggle } from '@delightstack/components/actions';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { hideHeaderLogo } from '$lib/stores/navState';

	let { showThemeToggle = false, invertLogo = false } = $props();

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

	const onRootPage = $derived($page.url.pathname === '/');
	const logoHidden = $derived($hideHeaderLogo);

	function handleLogoClick(e: MouseEvent) {
		if (onRootPage) {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
		// Otherwise, default <a href="/"> navigation runs.
	}
</script>

<header class="header" class:scrolled>
	<div class="header-inner">
		<a
			href="/"
			class="logo"
			class:hidden={logoHidden}
			onclick={handleLogoClick}
			aria-label="Brian Schwabauer — back to top"
			tabindex={logoHidden ? -1 : 0}
		>
			<img src="/logo.svg" alt="Brian Schwabauer" class="logo-img" class:invert={invertLogo} />
		</a>

		<div class="header-actions">
			{#if showThemeToggle}
				<ThemeToggle />
			{/if}
			<a href="/blog" class="blog-link" class:on-dark={invertLogo}>Blog</a>
		</div>
	</div>
</header>

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
		transition: opacity 200ms ease, transform 200ms ease, visibility 0s linear 0s;
	}
	.logo.hidden {
		opacity: 0;
		pointer-events: none;
		transform: translateY(-4px);
		visibility: hidden;
		transition: opacity 200ms ease, transform 200ms ease, visibility 0s linear 200ms;
	}

	.logo-img {
		height: 32px;
		width: auto;
	}

	.logo-img.invert {
		filter: brightness(0) invert(1);
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-left: auto;
	}

	.blog-link {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
		padding: 0.55rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		transition: color var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
	}
	.blog-link:hover {
		color: var(--color-text);
		background: var(--color-surface);
	}
	.blog-link.on-dark {
		color: rgba(255, 255, 255, 0.78);
		border-color: rgba(255, 255, 255, 0.22);
	}
	.blog-link.on-dark:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.08);
		border-color: rgba(0, 242, 195, 0.45);
	}
</style>
