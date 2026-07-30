<script lang="ts">
	import { untrack } from 'svelte';

	const {
		/** The word the board rests on. It re-flips every time the board scrolls into view. */
		word = '',
		/** Silly words the board cycles through on each click, before wrapping back to `word` */
		eggWords = [] as string[],
		/** The number of flaps — words shorter than this are centered between blank flaps */
		minLength = 7,
		/** The total duration in ms that each letter flap should take to animate */
		duration = 300,
		/** The number of ms between each letter flap animation */
		stagger = undefined as number | undefined,
		/** The number of ms each letter waits before it starts flipping, relative to the one before it */
		letterDelay = 70,
		/** The list of letters to rotate through in the split flap animation */
		alphabet = [
			'',
			'@',
			'#',
			'+',
			'=',
			'?',
			':',
			')',
			...Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i)),
			...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
			' ',
		],
		/** Max number of flap element pairs per letter. Lower = fewer DOM nodes = better performance.
		 * Only 2–3 are ever visible at once. */
		maxFlaps = 6,
		/** The class to apply to the root element */
		class: className = '',
	} = $props();

	const DURATION = $derived(duration);
	const STAGGER = $derived(stagger ?? Math.floor(duration * 0.2));
	const SPRING_DURATION = 1000;
	const SPRING_EASING = `linear(0,0.009,0.035 2.1%,0.141,0.281 6.7%,0.723 12.9%,0.938 16.7%,1.017,1.077,1.121,1.149 24.3%,1.159,1.163,1.161,1.154 29.9%,1.129 32.8%,1.051 39.6%,1.017 43.1%,0.991,0.977 51%,0.974 53.8%,0.975 57.1%,0.997 69.8%,1.003 76.9%,1.004 83.8%,1)`;

	let container = $state<HTMLElement | undefined>(undefined);
	/** Nothing animates off screen — the whole point is that you watch it land */
	let visible = $state(false);
	/** 0 is the real word; anything higher is an easter egg */
	let clicks = $state(0);
	const current = $derived(clicks === 0 ? word : (eggWords[clicks - 1] ?? word));
	const letters = $derived.by(() => {
		const split = current.toUpperCase().split('').slice(0, minLength);
		// Center short words so they don't sit off to one side of a wide board
		const pad = minLength - split.length;
		const left = Math.floor(pad / 2);
		return [
			...Array.from({ length: left }, () => ''),
			...split,
			...Array.from({ length: pad - left }, () => ''),
		];
	});
	const reduced =
		typeof matchMedia === 'undefined'
			? false
			: matchMedia('(prefers-reduced-motion: reduce)').matches;

	function animateElement(
		element: HTMLElement,
		keyframes: Keyframe[],
		options?: KeyframeAnimationOptions,
	) {
		const animation = element.animate(keyframes, {
			easing: 'linear',
			fill: 'forwards',
			...options,
		});
		animation.finished
			.then((animation) => {
				try {
					const { transform, opacity, filter } = keyframes[keyframes.length - 1];
					if (transform) element.style.transform = transform as string;
					if (opacity) element.style.opacity = opacity as string;
					if (filter) element.style.filter = filter as string;
					animation.cancel();
				} catch (error) {
					// ignore
				}
				return animation;
			})
			.catch(() => undefined);
		return animation;
	}

	const lettersState = new Map<
		/** The index within the "letters" array that this state applies to */
		number,
		{
			/** The index in the alphabet of the currently displayed letter */
			alphabetIndex: number;
			/** The index of the flap element that is currently active */
			flapIndex: number;
			/** Identifies the latest animation loop, so an older loop can bail out mid-flight */
			runId: number;
			/** The flap animations for this letter. This is used to cancel previous animations */
			flapAnimations: WeakMap<HTMLElement, Animation>;
		}
	>();

	function getState(letterIndex: number) {
		let state = lettersState.get(letterIndex);
		if (!state) {
			state = {
				alphabetIndex: 0, // Start from the beginning of the alphabet (a blank flap)
				flapIndex: 0,
				runId: 0,
				flapAnimations: new WeakMap<HTMLElement, Animation>(),
			};
			lettersState.set(letterIndex, state);
		}
		return state;
	}

	async function animateLetterToTarget(letterIndex: number, delay: number) {
		if (!container || !container.children[letterIndex]) return;
		const letterEl = container.children[letterIndex];
		const state = getState(letterIndex);
		// Claim the letter — any loop still running for it will see the new id and stop.
		const runId = ++state.runId;

		if (delay) await new Promise((r) => setTimeout(r, delay));

		// Loop until the target letter is reached for this position
		while (state.runId === runId) {
			const currentDisplayedLetter = alphabet[state.alphabetIndex] || '';
			const targetLetter = letters[letterIndex];

			// If the currently displayed letter matches the target, stop animating this letter
			if (currentDisplayedLetter === targetLetter) break;

			const nextAlphabetIndex = (state.alphabetIndex + 1) % alphabet.length;
			const staticFlapIndex = (state.flapIndex - 1 + maxFlaps) % maxFlaps;
			const motionFlapIndex = (state.flapIndex + maxFlaps) % maxFlaps;
			const allFlapsEls = Array.from(letterEl.children) as HTMLElement[];
			const motionTopFlapEl = allFlapsEls[motionFlapIndex * 2];
			const staticTopFlapEl = allFlapsEls[staticFlapIndex * 2];
			const bottomFlapEl = allFlapsEls[motionFlapIndex * 2 + 1];
			if (!motionTopFlapEl || !staticTopFlapEl || !bottomFlapEl) break; // Safety break if DOM elements are missing

			// Cancel any ongoing animations on the flaps involved in the current step
			try {
				state.flapAnimations.get(motionTopFlapEl)?.cancel();
				state.flapAnimations.get(staticTopFlapEl)?.cancel();
				state.flapAnimations.get(bottomFlapEl)?.cancel();
			} catch (error) {
				// Ignore errors from cancelling animations that might not exist or be active
			}

			// Set z-index for visual stacking during the flip
			allFlapsEls.forEach((el, i) => {
				if (i % 2 === 0) {
					// Top flap
					const flapIndex = Math.floor(i / 2);
					el.style.zIndex = `${(flapIndex - staticFlapIndex + maxFlaps) % maxFlaps}`;
				} else {
					// Bottom flap
					const flapIndex = Math.floor(i / 2) + 1;
					el.style.zIndex = `${(motionFlapIndex - flapIndex + maxFlaps) % maxFlaps}`;
				}
			});

			// Set initial states for the flaps before animation
			staticTopFlapEl.style.opacity = '1';
			staticTopFlapEl.style.transform = 'rotate3d(1, 0, 0, 0deg)';
			staticTopFlapEl.style.filter = 'brightness(1)';
			bottomFlapEl.style.opacity = `0`;
			bottomFlapEl.style.transform = `rotate3d(1, 0, 0, 90deg)`;

			// Set the CSS variables for the letters on the flaps for the current flip
			staticTopFlapEl.style.setProperty('--letter', `'${alphabet[nextAlphabetIndex]}'`);
			motionTopFlapEl.style.setProperty('--letter', `'${currentDisplayedLetter}'`);
			bottomFlapEl.style.setProperty('--letter', `'${alphabet[nextAlphabetIndex]}'`);

			const topFlapAnimation = animateElement(
				motionTopFlapEl,
				[
					{
						transform: 'rotate3d(1, 0, 0, 0deg)',
						opacity: 1,
						offset: 0,
						filter: 'brightness(1)',
					},
					{
						transform: 'rotate3d(1, 0, 0, -90deg)',
						opacity: 1,
						offset: 0.99,
						filter: 'brightness(.5)',
					},
					{
						transform: 'rotate3d(1, 0, 0, -90deg)',
						filter: 'brightness(1)',
						opacity: 0,
						offset: 1,
					},
				],
				{ duration: DURATION },
			);
			const bottomFlapAnimation = animateElement(
				bottomFlapEl,
				[
					{ transform: 'rotate3d(1, 0, 0, 90deg)', opacity: 1 },
					{ transform: 'rotate3d(1, 0, 0, 0deg)', opacity: 1 },
				],
				{
					duration: SPRING_DURATION,
					delay: DURATION,
					easing: SPRING_EASING,
				},
			);

			// Store references to current animations for potential cancellation
			state.flapAnimations.set(motionTopFlapEl, topFlapAnimation);
			state.flapAnimations.set(bottomFlapEl, bottomFlapAnimation);

			// Update the state for the next iteration of the loop (if needed)
			state.alphabetIndex = nextAlphabetIndex;
			state.flapIndex = staticFlapIndex;

			// Wait for the staggering delay before initiating the next flap animation
			await new Promise((r) => setTimeout(r, STAGGER));
		}
	}

	/** Paints the target letters with no flipping at all, for reduced-motion visitors */
	function showLettersInstantly() {
		if (!container) return;
		letters.forEach((letter, i) => {
			const letterEl = container?.children[i];
			if (!letterEl) return;
			const state = getState(i);
			state.runId++;
			state.alphabetIndex = Math.max(alphabet.indexOf(letter), 0);
			const flaps = Array.from(letterEl.children) as HTMLElement[];
			flaps.forEach((el, j) => {
				el.style.opacity = j < 2 ? '1' : '0';
				el.style.transform = 'rotate3d(1, 0, 0, 0deg)';
				if (j < 2) el.style.setProperty('--letter', `'${letter}'`);
			});
		});
	}

	/** Wipes the board back to blank flaps so the next run flips up from nothing */
	function clearBoard() {
		if (!container) return;
		Array.from(container.children).forEach((letterEl, i) => {
			const state = getState(i);
			state.runId++; // any loop still running for this letter stops on its next tick
			state.alphabetIndex = 0;
			state.flapIndex = 0;
			Array.from(letterEl.children).forEach((el) => {
				const flap = el as HTMLElement;
				state.flapAnimations.get(flap)?.cancel();
				flap.style.opacity = '0';
				flap.style.transform = 'rotate3d(1, 0, 0, 0deg)';
			});
		});
	}

	$effect(() => {
		if (!container) return;
		if (typeof IntersectionObserver === 'undefined') {
			visible = true;
			return;
		}
		const observer = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					visible = entry.isIntersecting;
					// Leaving the viewport puts the easter egg away, so the board is
					// always showing the real word when you come back to it.
					if (!entry.isIntersecting) clicks = 0;
				}),
			{ threshold: 0.2 },
		);
		observer.observe(container);
		return () => observer.disconnect();
	});

	/** Tracks visibility across runs so re-entering the viewport replays the whole
	 * animation, while a click mid-view just retargets from wherever the flaps are. */
	let was_visible = false;
	$effect(() => {
		const showing = visible;
		letters;
		untrack(() => {
			if (!container || !showing) {
				was_visible = showing;
				return;
			}
			const entering = !was_visible;
			was_visible = true;
			if (reduced) return showLettersInstantly();
			if (entering) clearBoard();
			let position = 0;
			letters.forEach((letter, i) => {
				// Skip letters already displaying the target — avoids spinning up
				// an async animation loop that would immediately break on the first check.
				const state = lettersState.get(i);
				if (state && alphabet[state.alphabetIndex] === letter) return;
				animateLetterToTarget(i, position++ * letterDelay);
			});
		});
	});
</script>

{#snippet flaps()}
	{#each new Array(minLength) as _, i (i)}
		<div class="letters">
			{#each new Array(maxFlaps) as _, j (j)}
				<div class="part top"></div>
				<div class="part bottom"></div>
			{/each}
		</div>
	{/each}
{/snippet}

{#if eggWords.length}
	<button
		type="button"
		onclick={() => (clicks = (clicks + 1) % (eggWords.length + 1))}
		aria-label="{current} — flip the board"
		class={['flip-text', className].filter(Boolean).join(' ')}
		bind:this={container}>
		{@render flaps()}
	</button>
{:else}
	<div class={['flip-text', className].filter(Boolean).join(' ')} bind:this={container}>
		{@render flaps()}
	</div>
{/if}

<style>
	/* Everything is sized off font-size — one flap is 1.5em wide, and the whole
	   board (7 flaps + gaps + frame) comes to 11.34em. */
	.flip-text {
		position: relative;
		display: flex;
		font-size: var(--flip-size, 1em);
		line-height: 1em;
		font-family: var(--font-mono);
		font-optical-sizing: auto;
		font-weight: 500;
		font-style: normal;
		gap: max(2px, 0.1em);
		justify-content: center;
		z-index: 1;
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		-webkit-tap-highlight-color: transparent;
		transition: translate 250ms cubic-bezier(0.25, 1, 0.5, 1);

		&::before {
			content: '';
			position: absolute;
			inset: -0.12em;
			box-shadow: inset 1px 1px 0.08em 1px black;
			border-radius: 0.08em;
			background-color: #282828;
		}
	}
	button.flip-text {
		cursor: pointer;
		touch-action: manipulation;

		&:hover {
			transition-duration: 0s;
			translate: 0 -0.03em;

			.part::after {
				opacity: 1;
			}
		}
		/* The board is far too wide to scale uniformly — shave a fixed amount off
		   the width instead so the edges don't travel. */
		&:active {
			translate: 0 0.02em;
			scale: calc(1 - 8px / 100cqi) 0.99;
		}
		&:focus-visible {
			outline: 2px solid #ffffff;
			outline-offset: 0.2em;
		}
	}
	.letters {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		perspective: 200px;
		user-select: none;
		color: #dddddd;
		position: relative;
		background-color: transparent;
		--gap: max(2px, 0.045em);
		box-shadow:
			1px 1px 1px 0px rgba(0, 0, 0, 0.8),
			2px 2px 4px 0px rgba(0, 0, 0, 0.25);
		border-radius: 0.05em;
		contain: content;
		font-size: 1em;
		font-weight: 500;

		/* The seam across the middle of the flap */
		&::after {
			content: '';
			position: absolute;
			top: calc(50% - var(--gap) / 2);
			left: -0.12em;
			right: -0.12em;
			height: var(--gap);
			background-color: #222222;
			z-index: 100;
		}
	}
	.part {
		position: relative;
		grid-column: 1 / 1;
		grid-row: 1 / 1;
		font-size: 2em;
		width: 0.75em;
		height: 1em;
		padding: 0 0 0.05em;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #333333;
		backface-visibility: hidden;
		transform-origin: center center;
		will-change: transform, opacity;
		border-radius: 2px;
		opacity: 0;

		&::before {
			content: var(--letter, ' ');
		}
		/* Lights the whole board up on hover — clipped to the flap by its clip-path */
		&::after {
			content: '';
			position: absolute;
			inset: 0;
			background-color: rgb(255 255 255 / 0.1);
			opacity: 0;
			pointer-events: none;
			transition: opacity 300ms ease;
		}
		&.top {
			--clip: calc(50% - var(--gap) / 2);
			clip-path: polygon(0 0, 100% 0, 100% var(--clip), 0 var(--clip));
			background-image: linear-gradient(170deg, #414141 0%, #303030 50%);
		}
		&.bottom {
			--clip: calc(50% + var(--gap) / 2);
			clip-path: polygon(0 var(--clip), 100% var(--clip), 100% 100%, 0 100%);
			background-image: linear-gradient(170deg, #383838 50%, #272727 100%);
		}
	}
</style>
