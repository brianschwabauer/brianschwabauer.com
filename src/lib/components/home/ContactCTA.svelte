<script lang="ts">
	import { Button } from '@delightstack/components/actions';
	import ContactModal from './ContactModal.svelte';

	let modalOpen = $state(false);
</script>

<section class="contact-cta">
	<div class="contact-cta-inner scroll-scale">
		<h2 class="cta-title">Want to work together?</h2>
		<p class="cta-description">
			I'm always interested in hearing about new projects and opportunities.
		</p>
		<Button onclick={() => (modalOpen = true)} size="2" outline>
			Don't push this button
		</Button>
	</div>
</section>

<ContactModal bind:open={modalOpen} />

<style>
	.contact-cta {
		padding: var(--space-24) 0;
	}

	.contact-cta-inner {
		max-width: var(--container-md);
		margin: 0 auto;
		padding: var(--space-12);
		text-align: center;
		background: linear-gradient(135deg, var(--color-accent), var(--color-accent-hover));
		border-radius: var(--radius-xl);
		color: white;
	}

	@media (min-width: 768px) {
		.contact-cta-inner {
			padding: var(--space-16);
		}
	}

	.cta-title {
		font-size: var(--text-3xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
		color: white;
	}

	@media (min-width: 768px) {
		.cta-title {
			font-size: var(--text-4xl);
		}
	}

	.cta-description {
		font-size: var(--text-lg);
		opacity: 0.9;
		margin-bottom: var(--space-8);
		max-width: 400px;
		margin-left: auto;
		margin-right: auto;
	}

	/* Override button styles for this context */
	.contact-cta-inner :global(.btn.secondary) {
		background: white;
		color: var(--color-accent);
		border-color: white;
	}

	.contact-cta-inner :global(.btn.secondary:hover) {
		background: rgba(255, 255, 255, 0.9);
		transform: translateY(-2px);
	}
</style>
