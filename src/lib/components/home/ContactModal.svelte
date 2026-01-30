<script lang="ts">
	import Modal from '$lib/components/shared/Modal.svelte';
	import Button from '$lib/components/shared/Button.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable() }: Props = $props();

	let name = $state('');
	let email = $state('');
	let message = $state('');
	let submitting = $state(false);
	let submitted = $state(false);
	let error = $state('');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message })
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to send message');
			}

			submitted = true;
			name = '';
			email = '';
			message = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Something went wrong';
		} finally {
			submitting = false;
		}
	}

	function handleClose() {
		// Reset form state when closing
		setTimeout(() => {
			submitted = false;
			error = '';
		}, 300);
	}
</script>

<Modal bind:open title={submitted ? "Thanks!" : "Let's Chat"} onClose={handleClose}>
	{#if submitted}
		<div class="success">
			<div class="success-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</div>
			<p>Your message has been sent! I'll get back to you as soon as I can.</p>
			<Button onclick={() => (open = false)}>Close</Button>
		</div>
	{:else}
		<form onsubmit={handleSubmit}>
			<p class="form-intro">
				Told you not to push that button! But since you're here, feel free to reach out.
			</p>

			{#if error}
				<div class="error">{error}</div>
			{/if}

			<div class="form-field">
				<label for="name">Name</label>
				<input type="text" id="name" bind:value={name} required placeholder="Your name" />
			</div>

			<div class="form-field">
				<label for="email">Email</label>
				<input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
			</div>

			<div class="form-field">
				<label for="message">Message</label>
				<textarea
					id="message"
					bind:value={message}
					required
					rows="4"
					placeholder="What's on your mind?"
				></textarea>
			</div>

			<div class="form-actions">
				<Button type="submit" loading={submitting}>Send Message</Button>
			</div>
		</form>
	{/if}
</Modal>

<style>
	.success {
		text-align: center;
		padding: var(--space-4) 0;
	}

	.success-icon {
		width: 64px;
		height: 64px;
		margin: 0 auto var(--space-4);
		background: var(--color-accent-light);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-icon svg {
		width: 32px;
		height: 32px;
		color: var(--color-accent);
	}

	.success p {
		margin-bottom: var(--space-6);
		color: var(--color-text-secondary);
	}

	.form-intro {
		color: var(--color-text-secondary);
		margin-bottom: var(--space-6);
	}

	.error {
		padding: var(--space-3) var(--space-4);
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		margin-bottom: var(--space-4);
		font-size: var(--text-sm);
	}

	.form-field {
		margin-bottom: var(--space-4);
	}

	.form-field label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 500;
		margin-bottom: var(--space-2);
		color: var(--color-text);
	}

	.form-field input,
	.form-field textarea {
		width: 100%;
	}

	.form-field textarea {
		resize: vertical;
		min-height: 100px;
	}

	.form-actions {
		margin-top: var(--space-6);
	}
</style>
