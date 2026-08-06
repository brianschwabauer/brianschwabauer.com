<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '@delightstack/components/actions';
	import { Form, Input } from '@delightstack/components/form';
	import { Expand } from '@delightstack/components/display';
	import { Callout } from '@delightstack/components/feedback';
	import Seo from '$lib/components/Seo.svelte';
	import { SITE_URL, AUTHOR_NAME } from '$lib/seo';

	const contactJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'@id': `${SITE_URL}/contact#contactpage`,
		url: `${SITE_URL}/contact`,
		name: 'Contact - Brian Schwabauer',
		about: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: AUTHOR_NAME },
		inLanguage: 'en-US',
	};

	// ---- rotating headline -------------------------------------------------
	// The headline cycles every few seconds — gives the page a little life
	// without screaming for attention. Pauses on hover so a curious visitor
	// can read the current one without it sliding out from under them.
	const headlines = [
		'Say hello.',
		'Pitch a wild idea.',
		'Tell me a joke.',
		'Send a postcard.',
	];
	let headlineIdx = $state(0);
	let headlinePaused = $state(false);
	$effect(() => {
		const id = setInterval(() => {
			if (!headlinePaused) headlineIdx = (headlineIdx + 1) % headlines.length;
		}, 3200);
		return () => clearInterval(id);
	});

	// ---- form state --------------------------------------------------------
	// One record, because <Form> validates and submits over a single data
	// object — the fields still bind individually so the vibe meter and the
	// greeting can read them directly.
	let fields = $state({ name: '', email: '', message: '' });
	let formState = $state<'idle' | 'sent'>('idle');
	// Network/server failures only — field-level problems render under their
	// own field via each Input's `parse`.
	let formError = $state('');

	// Sassy meter that reacts to message length — gives writing a little
	// dopamine without being annoying. Tiers are deliberately wide so the
	// label doesn't flicker character-by-character.
	const vibe = $derived.by(() => {
		const len = fields.message.trim().length;
		if (len === 0) return { label: '', tone: 'idle' as const };
		if (len < 20)
			return {
				label: 'Brief and to the point. I like it.',
				tone: 'short' as const,
			};
		if (len < 120) return { label: 'Now we’re talking.', tone: 'good' as const };
		if (len < 500) return { label: 'A proper note. ✍️', tone: 'good' as const };
		if (len < 1500)
			return { label: 'An epic. I’ll bring snacks.', tone: 'long' as const };
		if (len < 4500)
			return {
				label: 'A novella! Cancel my afternoon.',
				tone: 'long' as const,
			};
		return {
			label: 'You’re flirting with the 5,000 char limit.',
			tone: 'warn' as const,
		};
	});

	/**
	 * Field validators. <Form> runs each Input's `parse` on blur and again for
	 * every field on submit, so a thrown message lands under the field it
	 * belongs to instead of in one catch-all banner.
	 */
	function requireText(what: string) {
		return (value: unknown) => {
			const text = typeof value === 'string' ? value.trim() : '';
			if (!text) throw new Error(`${what} isn't optional.`);
			return text;
		};
	}

	function parseEmail(value: unknown) {
		const text = typeof value === 'string' ? value.trim() : '';
		if (!text) throw new Error(`An email isn't optional — it's how I write back.`);
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
			throw new Error('That address is missing something. Check the @ and the domain.');
		}
		return text;
	}

	/** SvelteKit's `error()` responds with `{ message }` — unwrap it so the
	 *  Callout shows the sentence and not the raw JSON. */
	async function readError(res: Response) {
		const txt = await res.text().catch(() => '');
		try {
			const parsed = JSON.parse(txt);
			if (parsed && typeof parsed.message === 'string') return parsed.message;
		} catch {
			// not JSON — fall through to the raw body
		}
		return txt || `Send failed (${res.status})`;
	}

	/**
	 * Runs only once every field validates. <Form> awaits the returned promise,
	 * which is what drives the submit <Button>'s spinner — so failures are
	 * caught here rather than rethrown (an escaping rejection would surface as
	 * an unhandled one, and the message is already shown in the Callout).
	 */
	async function submit() {
		formError = '';
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: fields.name.trim(),
					email: fields.email.trim(),
					message: fields.message.trim(),
				}),
			});
			if (!res.ok) throw new Error(await readError(res));
			formState = 'sent';
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Send failed';
		}
	}

	function resetForm() {
		fields = { name: '', email: '', message: '' };
		formError = '';
		formState = 'idle';
	}

	// First-name greeting on the success screen — feels personal without
	// echoing the whole submitted string back at them.
	const firstName = $derived(fields.name.trim().split(/\s+/)[0] || 'friend');

	// Tiny Easter egg: focus the name field on mount so they can just start
	// typing. Skipped on touch devices where it would yank up the keyboard
	// before they've decided to engage.
	onMount(() => {
		if (matchMedia('(hover: hover)').matches) {
			document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
		}
	});
</script>

<Seo
	title="Contact - Brian Schwabauer"
	description="Send Brian Schwabauer a message — collaboration ideas, opportunities, or just a hello."
	json_ld={contactJsonLd} />

<div class="contact-page">
	<header class="contact-header">
		<h1
			class="title"
			onmouseenter={() => (headlinePaused = true)}
			onmouseleave={() => (headlinePaused = false)}>
			{#each headlines as line, i (line)}
				{#if i === headlineIdx}
					<span class="title-line" aria-live="polite">{line}</span>
				{/if}
			{/each}
		</h1>
		<p class="lede">
			This goes straight to my inbox. No chatbot, no CRM, no “we’ll get back to you”
			auto-reply. Just me, on the other side of a keyboard.
		</p>
	</header>

	{#if formState === 'sent'}
		<div class="card success" role="status">
			<div class="plane-stage" aria-hidden="true">
				<svg class="plane" viewBox="0 0 64 64">
					<path
						d="M2 32 L62 4 L46 60 L34 38 Z"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round" />
					<path d="M34 38 L62 4" fill="none" stroke="currentColor" stroke-width="1.5" />
				</svg>
				<div class="trail">
					<span></span>
					<span></span>
					<span></span>
				</div>
			</div>
			<h2>Message launched.</h2>
			<p>
				Thanks, {firstName}. I'll write back to you in hopefully a timely manner
				(sometimes I can be slow. Feel free to keep bugging me).
			</p>
			<Button outline pill onclick={resetForm}>Send another</Button>
		</div>
	{:else}
		<div class="card">
			<Form data={fields} onsubmit={submit}>
				<div class="field-row">
					<div class="field">
						<Input
							name="name"
							label="Your name"
							label_display="pinned"
							bind:value={fields.name}
							maxlength={100}
							filled
							placeholder="Johnny Appleseed"
							parse={requireText('A name')} />
					</div>
					<div class="field">
						<Input
							name="email"
							type="email"
							label="Email"
							label_display="pinned"
							bind:value={fields.email}
							maxlength={200}
							filled
							placeholder="johnny@example.com"
							parse={parseEmail} />
					</div>
				</div>

				<!-- The vibe meter rides in the Input's own footer (via `description`),
				     opposite the character counter; `data-tone` colours it. -->
				<div class="field message-field" data-tone={vibe.tone}>
					<Input
						name="message"
						type="textarea"
						label="Your message"
						label_display="pinned"
						rows={7}
						bind:value={fields.message}
						maxlength={5000}
						show_counter
						filled
						description={vibe.label}
						placeholder="Tell me about your idea, the dream, or just say hi."
						parse={requireText('A message')} />
				</div>

				<Expand show={!!formError}>
					<Callout error dense>{formError}</Callout>
				</Expand>

				<div class="actions">
					<Button accent full_width size="2" type="submit">
						{#snippet children({ isLoading, isLoadingSuccess })}
							{isLoading ? 'Sending…' : isLoadingSuccess ? 'Sent' : 'Send it'}
							{#if !isLoading && !isLoadingSuccess}
								<svg class="send-arrow" viewBox="0 0 24 24" aria-hidden="true">
									<path
										d="M5 12h14M13 6l6 6-6 6"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round" />
								</svg>
							{/if}
						{/snippet}
					</Button>
				</div>
			</Form>
		</div>
	{/if}
</div>

<style>
	.contact-page {
		max-width: 44rem;
		margin: 0 auto;
		padding: var(--space-8) var(--space-3) var(--space-10);
	}
	@media (min-width: 768px) {
		.contact-page {
			padding: var(--space-8) var(--space-7) var(--space-10);
		}
	}

	/* ---- header ---------------------------------------------------------- */
	.contact-header {
		text-align: center;
		margin-bottom: var(--space-8);
	}

	.title {
		font-size: clamp(2.4rem, 7vw, 4rem);
		font-weight: 900;
		/* line-height 1 + descender-bearing letters (p, j, g, y) clipped the
		   bottoms of "Pitch" and "Just" — the gradient's background-clip:text
		   only paints inside the element's content box, so any glyph reaching
		   below the line box rendered transparent. Open up the line a bit and
		   add a hair of padding-bottom on the inline-block span so descenders
		   stay inside the painted area. */
		line-height: 1.15;
		letter-spacing: -0.03em;
		margin: 0 0 var(--space-3);
		min-height: 1.25em;
		position: relative;
	}
	.title-line {
		display: inline-block;
		padding-bottom: 0.1em;
		background: linear-gradient(95deg, var(--color-text) 0%, var(--color-action) 90%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
		animation: line-in 520ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	@keyframes line-in {
		from {
			opacity: 0;
			transform: translateY(0.4em) rotate(-1.2deg);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: none;
			filter: none;
		}
	}
	.lede {
		font-size: var(--text-lg);
		color: var(--color-text-muted);
		max-width: 32rem;
		margin: 0 auto;
		line-height: var(--leading-relaxed);
		text-wrap: pretty;
	}

	/* ---- card (form + success share the same shell) --------------------- */
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-5);
		box-shadow: var(--shadow-lg);
		:global(> .form) {
			gap: 1.5rem 1rem;
		}
		:global(.form > .expand) {
			margin: -1rem 0;
		}
	}
	@media (min-width: 640px) {
		.card {
			padding: var(--space-7);
		}
	}

	/* ---- fields --------------------------------------------------------- */
	/* <Form> is a flex column with a 1rem gap, so the rows below only own
	   their internal spacing — no margins between them. */
	.field-row {
		display: grid;
		gap: var(--space-3);
	}
	@media (min-width: 560px) {
		.field-row {
			grid-template-columns: 1fr 1fr;
		}
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		position: relative;
		/* delightstack's `filled` Input paints --color-surface — which is also
		   the card behind it. Point it at the page background instead so each
		   field still reads as a well recessed into the card. */
		--color-surface: var(--color-bg);
	}
	/* The vibe meter is the message Input's `description`, so it's styled through
	   the component's own footer slot rather than as an element of ours. */
	.message-field :global(.description) {
		font-family: var(--font-sans);
		font-weight: 600;
		transition: color 200ms ease;
	}
	.message-field[data-tone='short'] :global(.description) {
		color: var(--color-text);
	}
	.message-field[data-tone='good'] :global(.description) {
		color: var(--color-text);
	}
	.message-field[data-tone='long'] :global(.description) {
		color: #d97706; /* amber-600, readable against both themes */
	}
	.message-field[data-tone='warn'] :global(.description) {
		color: var(--color-error);
	}

	/* ---- actions -------------------------------------------------------- */
	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		margin-top: var(--space-2);
	}
	.send-arrow {
		width: 16px;
		height: 16px;
	}

	/* ---- success card --------------------------------------------------- */
	.success {
		text-align: center;
		animation: pop-in 520ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			transform: scale(0.92);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.success h2 {
		font-size: 1.8rem;
		margin: var(--space-3) 0 var(--space-2);
		color: var(--color-action);
	}
	.success p {
		color: var(--color-text-muted);
		margin: 0 auto var(--space-5);
		max-width: 26rem;
		line-height: var(--leading-relaxed);
	}

	.plane-stage {
		position: relative;
		display: block;
		width: 100%;
		height: 90px;
		margin: var(--space-2) 0;
		overflow: hidden;
		color: var(--color-action);
	}
	.plane {
		position: absolute;
		left: 0;
		top: 50%;
		width: 44px;
		height: 44px;
		transform: translate(-60%, -50%);
		animation: plane-fly 1400ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}
	@keyframes plane-fly {
		0% {
			transform: translate(-60%, 30%) rotate(-8deg);
			opacity: 0;
		}
		15% {
			opacity: 1;
		}
		70% {
			transform: translate(calc(50vw - 22px), -60%) rotate(-12deg);
			opacity: 1;
		}
		100% {
			transform: translate(calc(100vw - 22px), -120%) rotate(-18deg);
			opacity: 0;
		}
	}
	.trail {
		position: absolute;
		left: 0;
		top: 50%;
		right: 0;
		height: 2px;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		gap: 6px;
		padding-left: 4px;
	}
	.trail span {
		display: inline-block;
		height: 2px;
		background: color-mix(in srgb, var(--color-action) 40%, transparent);
		border-radius: 999px;
		opacity: 0;
		animation: trail-puff 1400ms ease-out forwards;
	}
	.trail span:nth-child(1) {
		width: 22%;
		animation-delay: 60ms;
	}
	.trail span:nth-child(2) {
		width: 28%;
		animation-delay: 180ms;
	}
	.trail span:nth-child(3) {
		width: 38%;
		animation-delay: 320ms;
	}
	@keyframes trail-puff {
		0% {
			opacity: 0;
			transform: translateX(-12px);
		}
		40% {
			opacity: 0.9;
		}
		100% {
			opacity: 0;
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.title-line,
		.success,
		.plane,
		.trail span {
			animation: none;
		}
	}
</style>
