<script lang="ts">
	import { onMount } from "svelte";

	// ---- rotating headline -------------------------------------------------
	// The headline cycles every few seconds — gives the page a little life
	// without screaming for attention. Pauses on hover so a curious visitor
	// can read the current one without it sliding out from under them.
	const headlines = [
		"Say hello.",
		"Pitch a wild idea.",
		"Tell me a joke.",
		"Send a postcard.",
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
	let name = $state("");
	let email = $state("");
	let message = $state("");
	let formState = $state<"idle" | "sending" | "sent" | "error">("idle");
	let formError = $state("");

	// Sassy meter that reacts to message length — gives writing a little
	// dopamine without being annoying. Tiers are deliberately wide so the
	// label doesn't flicker character-by-character.
	const vibe = $derived.by(() => {
		const len = message.trim().length;
		if (len === 0)
			return { label: "Awaiting your words…", tone: "idle" as const };
		if (len < 20)
			return {
				label: "Brief and to the point. I like it.",
				tone: "short" as const,
			};
		if (len < 120)
			return { label: "Now we’re talking.", tone: "good" as const };
		if (len < 500) return { label: "A proper note. ✍️", tone: "good" as const };
		if (len < 1500)
			return { label: "An epic. I’ll bring snacks.", tone: "long" as const };
		if (len < 4500)
			return {
				label: "A novella! Cancel my afternoon.",
				tone: "long" as const,
			};
		return {
			label: "You’re flirting with the 5,000 char limit.",
			tone: "warn" as const,
		};
	});

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (formState === "sending") return;
		if (!name.trim() || !email.trim() || !message.trim()) {
			formError = "Name, email, and message — none of them optional.";
			formState = "error";
			return;
		}
		formState = "sending";
		formError = "";
		try {
			const res = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, message }),
			});
			if (!res.ok) {
				const txt = await res.text().catch(() => "");
				throw new Error(txt || `Send failed (${res.status})`);
			}
			formState = "sent";
		} catch (err) {
			formState = "error";
			formError = err instanceof Error ? err.message : "Send failed";
		}
	}

	function resetForm() {
		name = "";
		email = "";
		message = "";
		formError = "";
		formState = "idle";
	}

	// First-name greeting on the success screen — feels personal without
	// echoing the whole submitted string back at them.
	const firstName = $derived(name.trim().split(/\s+/)[0] || "friend");

	// Tiny Easter egg: focus the name field on mount so they can just start
	// typing. Skipped on touch devices where it would yank up the keyboard
	// before they've decided to engage.
	onMount(() => {
		if (matchMedia("(hover: hover)").matches) {
			document.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
		}
	});
</script>

<svelte:head>
	<title>Contact - Brian Schwabauer</title>
	<meta
		name="description"
		content="Send Brian Schwabauer a message — collaboration ideas, opportunities, or just a hello."
	/>
</svelte:head>

<div class="contact-page">
	<header class="contact-header">
		<h1
			class="title"
			onmouseenter={() => (headlinePaused = true)}
			onmouseleave={() => (headlinePaused = false)}
		>
			{#each headlines as line, i (line)}
				{#if i === headlineIdx}
					<span class="title-line" aria-live="polite">{line}</span>
				{/if}
			{/each}
		</h1>
		<p class="lede">
			This goes straight to my inbox. No chatbot, no CRM, no “we’ll get back to
			you” auto-reply. Just me, on the other side of a keyboard.
		</p>
	</header>

	{#if formState === "sent"}
		<div class="card success" role="status">
			<div class="plane-stage" aria-hidden="true">
				<svg class="plane" viewBox="0 0 64 64">
					<path
						d="M2 32 L62 4 L46 60 L34 38 Z"
						fill="currentColor"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linejoin="round"
					/>
					<path
						d="M34 38 L62 4"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
					/>
				</svg>
				<div class="trail">
					<span></span><span></span><span></span>
				</div>
			</div>
			<h2>Message launched.</h2>
			<p>
				Thanks, {firstName}. I'll write back to you in hopefully a timely manner
				(sometimes I can be slow. Feel free to keep bugging me).
			</p>
			<button type="button" class="ghost-btn" onclick={resetForm}
				>Send another</button
			>
		</div>
	{:else}
		<form class="card form" onsubmit={submit} novalidate>
			<div class="field-row">
				<label class="field">
					<span class="field-label">Your name</span>
					<input
						type="text"
						name="name"
						bind:value={name}
						required
						maxlength="100"
						autocomplete="name"
						placeholder="Johnny Appleseed"
						disabled={formState === "sending"}
					/>
				</label>
				<label class="field">
					<span class="field-label">Email</span>
					<input
						type="email"
						name="email"
						bind:value={email}
						required
						maxlength="200"
						autocomplete="email"
						placeholder="johnny@example.com"
						disabled={formState === "sending"}
					/>
				</label>
			</div>

			<label class="field message-field">
				<span class="field-label">
					Your message
					<span class="vibe" data-tone={vibe.tone}>{vibe.label}</span>
				</span>
				<textarea
					bind:value={message}
					required
					maxlength="5000"
					rows="7"
					placeholder="Tell me about your idea, the dream, or just say hi."
					disabled={formState === "sending"}
				></textarea>
				<span class="char-count" class:near={message.length > 4500}>
					{message.length} / 5000
				</span>
			</label>

			{#if formError}
				<div class="form-error" role="alert">{formError}</div>
			{/if}

			<div class="actions">
				<button
					class="send-btn"
					type="submit"
					disabled={formState === "sending"}
				>
					{#if formState === "sending"}
						<span class="spinner" aria-hidden="true"></span>
						Sending…
					{:else}
						Send it
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path
								d="M5 12h14M13 6l6 6-6 6"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					{/if}
				</button>
				<p class="fine-print">
					No tracking, no list, no spam. Promise written in actual code:
					<a
						href="https://github.com/brianschwabauer"
						target="_blank"
						rel="noopener"
					>
						read the source</a
					>.
				</p>
			</div>
		</form>
	{/if}
</div>

<style>
	.contact-page {
		max-width: 44rem;
		margin: 0 auto;
		padding: var(--space-12) var(--space-4) var(--space-24);
	}
	@media (min-width: 768px) {
		.contact-page {
			padding: var(--space-16) var(--space-8) var(--space-24);
		}
	}

	/* ---- header ---------------------------------------------------------- */
	.contact-header {
		text-align: center;
		margin-bottom: var(--space-10);
	}

	.title {
		font-size: clamp(2.4rem, 7vw, 4rem);
		font-weight: 900;
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 var(--space-4);
		min-height: 1.1em;
		position: relative;
	}
	.title-line {
		display: inline-block;
		background: linear-gradient(
			95deg,
			var(--color-text) 0%,
			var(--color-accent) 90%
		);
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
		color: var(--color-text-secondary);
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
		padding: var(--space-6);
		box-shadow: var(--shadow-lg);
	}
	@media (min-width: 640px) {
		.card {
			padding: var(--space-8);
		}
	}

	/* ---- fields --------------------------------------------------------- */
	.field-row {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-4);
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
	}
	.field-label {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		font-family: var(--font-mono);
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}
	.field input,
	.field textarea {
		font: inherit;
		font-size: 1rem;
		color: var(--color-text);
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: 0.8rem 0.95rem;
		width: 100%;
		transition:
			border-color 180ms ease,
			background-color 180ms ease,
			box-shadow 180ms ease;
	}
	.field textarea {
		resize: vertical;
		min-height: 9rem;
		line-height: 1.55;
	}
	.field input::placeholder,
	.field textarea::placeholder {
		color: var(--color-text-muted);
	}
	.field input:focus,
	.field textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		background: var(--color-surface);
		box-shadow: 0 0 0 4px var(--color-accent-light);
	}
	.field input:disabled,
	.field textarea:disabled {
		opacity: 0.65;
		cursor: progress;
	}

	.message-field {
		margin-bottom: var(--space-4);
	}
	.char-count {
		position: absolute;
		right: 0.7rem;
		bottom: 0.55rem;
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--color-text-muted);
		background: color-mix(in srgb, var(--color-bg) 88%, transparent);
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		pointer-events: none;
		font-variant-numeric: tabular-nums;
	}
	.char-count.near {
		color: var(--color-warning);
	}

	.vibe {
		font-family: var(--font-sans);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0;
		text-transform: none;
		color: var(--color-text-muted);
		transition: color 200ms ease;
	}
	.vibe[data-tone="short"] {
		color: var(--color-accent);
	}
	.vibe[data-tone="good"] {
		color: var(--color-success);
	}
	.vibe[data-tone="long"] {
		color: #d97706; /* amber-600, readable against both themes */
	}
	.vibe[data-tone="warn"] {
		color: var(--color-error);
	}

	/* ---- actions -------------------------------------------------------- */
	.actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		margin-top: var(--space-2);
	}
	.send-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.55rem;
		padding: 0.95rem 1.8rem;
		background: linear-gradient(
			135deg,
			var(--color-accent) 0%,
			color-mix(in srgb, var(--color-accent) 65%, #00d6ff) 100%
		);
		color: #fff;
		border: none;
		border-radius: var(--radius-full);
		font-family: var(--font-sans);
		font-weight: 800;
		font-size: 1.05rem;
		letter-spacing: 0.01em;
		cursor: pointer;
		box-shadow: 0 10px 30px
			color-mix(in srgb, var(--color-accent) 35%, transparent);
		transition:
			transform 200ms ease,
			box-shadow 200ms ease,
			opacity 200ms ease;
	}
	.send-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 14px 36px
			color-mix(in srgb, var(--color-accent) 45%, transparent);
	}
	.send-btn:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}
	.send-btn:disabled {
		opacity: 0.7;
		cursor: progress;
	}
	.send-btn svg {
		width: 18px;
		height: 18px;
	}
	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid rgba(255, 255, 255, 0.45);
		border-top-color: #fff;
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.fine-print {
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-align: center;
		margin: 0;
		max-width: 28rem;
		text-wrap: balance;
	}
	.fine-print a {
		color: var(--color-accent);
		text-decoration: none;
		border-bottom: 1px dotted
			color-mix(in srgb, var(--color-accent) 50%, transparent);
	}
	.fine-print a:hover {
		border-bottom-color: var(--color-accent);
	}

	.form-error {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error) 30%, transparent);
		border-radius: var(--radius-md);
		padding: 0.7rem 0.95rem;
		font-size: 0.9rem;
		margin-bottom: var(--space-4);
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
		margin: var(--space-4) 0 var(--space-2);
		color: var(--color-accent);
	}
	.success p {
		color: var(--color-text-secondary);
		margin: 0 auto var(--space-6);
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
		color: var(--color-accent);
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
		background: color-mix(in srgb, var(--color-accent) 40%, transparent);
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

	.ghost-btn {
		font: inherit;
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-text);
		background: transparent;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		padding: 0.6rem 1.2rem;
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast);
	}
	.ghost-btn:hover {
		background: var(--color-accent-light);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.title-line,
		.success,
		.plane,
		.trail span {
			animation: none;
		}
		.send-btn:hover:not(:disabled) {
			transform: none;
		}
	}
</style>
