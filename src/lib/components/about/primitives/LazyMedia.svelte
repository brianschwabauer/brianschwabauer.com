<script lang="ts">
	import {
		imgSrcset,
		isAnimatedClip,
		clipVideoUrl,
		av1VideoSupported,
	} from '../media-variants';
	import { governorActive, scheduleGovernorPass } from '../clip-governor';

	let {
		src,
		alt = '',
		caption = '',
		ratio = '',
		fit = 'cover',
		rounded = true,
		shadow = true,
		eager = false,
		video = false,
		class: klass = '',
		style = '',
		onclick = undefined as
			| undefined
			| ((event: MouseEvent & { currentTarget: HTMLButtonElement }) => void),
	}: {
		src: string;
		alt?: string;
		caption?: string;
		ratio?: string;
		fit?: 'cover' | 'contain';
		rounded?: boolean;
		shadow?: boolean;
		eager?: boolean;
		/** Render a play-button overlay over the poster (use for clickable video thumbnails
		 *  that open a Gallery lightbox). */
		video?: boolean;
		class?: string;
		style?: string;
		onclick?: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
	} = $props();

	let loaded = $state(false);
	let retried = false;
	const interactive = $derived(typeof onclick === 'function');

	let frame = $state<HTMLElement | null>(null);
	let image = $state<HTMLImageElement | null>(null);
	let videoEl = $state<HTMLVideoElement | null>(null);

	/*
	 * Animated clips render as a muted looping <video> playing the AV1 mp4
	 * encoded beside the AVIF — same codec, same look, but through the media
	 * pipeline where the hardware decoder lives, instead of the image
	 * pipeline's per-frame software decode. Flipped in an effect because
	 * av1VideoSupported() is false during SSR and hydration must match; a
	 * video error drops back to the animated-AVIF <img> path.
	 */
	let use_video = $state(false);
	$effect(() => {
		use_video = isAnimatedClip(src) && av1VideoSupported();
	});

	/* Large stills carry their -thumb variant as a srcset; `sizes="auto"` lets
	 * the browser pick from the actual layout box (valid on lazy images). */
	const srcset = $derived(use_video ? undefined : imgSrcset(src));

	/*
	 * A failed fetch (flaky mobile network, tab backgrounded mid-download) fires
	 * `error` instead of `load`, which would leave the image at opacity 0 forever.
	 * Retry the fetch once; if it fails again, reveal anyway so the broken/alt
	 * state is at least visible instead of an invisible box.
	 */
	function retryOrReveal() {
		const img = image;
		if (!img) return;
		if (retried) {
			loaded = true;
			return;
		}
		retried = true;
		img.loading = 'eager';
		img.src = '';
		img.src = src;
		watchDecode(img);
	}

	/* `decode()` is a promise, so unlike the load event it cannot be missed by
	 * attaching too late or swallowed by an engine quirk — use it as a second,
	 * positive "pixels are ready" signal. Rejections are ignored: the failure
	 * path is `onerror`'s job, and Safari rejects decode() spuriously under
	 * memory pressure even for images that display fine. */
	function watchDecode(img: HTMLImageElement) {
		img.decode().then(
			() => {
				if (img.naturalWidth > 0) loaded = true;
			},
			() => {},
		);
	}

	/*
	 * The fade waits on `loaded`, so anything that swallows the load event leaves
	 * the image invisible for good. The ways that happens, all covered here:
	 *
	 * 1. A cached image can finish before hydration attaches `onload`, so the
	 *    event never arrives — check `complete` as soon as we have the element,
	 *    and re-check it on every observer callback after that.
	 * 2. A `loading="lazy"` image inside a `content-visibility: auto` subtree
	 *    (which is every frame on this page — SectionShell skips whole sections)
	 *    does not reliably start fetching when it arrives on screen *without a
	 *    scroll*: landing on a `#hash`, a year-scrubber jump, or a lazily-imported
	 *    section mounting already inside the viewport all leave the fetch
	 *    un-triggered. So watch the frame — it keeps its box even while its
	 *    contents are skipped, unlike the `img` inside it — and promote to eager
	 *    the moment it comes near.
	 * 3. Flipping the `loading` attribute alone does not reliably restart a
	 *    deferred fetch in WebKit, so promotion also reassigns `src`, which forces
	 *    it everywhere — and the observer stays alive until `loaded` is actually
	 *    true instead of betting on a single promotion.
	 * 4. The fetch itself can die (flaky mobile network, tab backgrounded
	 *    mid-download) — `onerror` retries once, then reveals the broken state.
	 */
	$effect(() => {
		if (loaded) return;
		const img = image;
		const box = frame;
		if (!img || !box) return;
		if (img.complete && img.naturalWidth > 0) {
			loaded = true;
			return;
		}
		// Broke before hydration attached `onerror` (complete but no pixels) —
		// the error event is already gone, so recover here.
		if (img.complete && img.getAttribute('src')) {
			retryOrReveal();
			return;
		}
		if (img.loading !== 'lazy') {
			watchDecode(img);
			return;
		}
		const promote = () => {
			if (img.loading !== 'lazy') return;
			img.loading = 'eager';
			img.src = src;
			watchDecode(img);
		};
		// Roughly Chrome's own lazy threshold, so this stays lazy loading — it only
		// takes over deciding *when* the fetch starts.
		const NEAR = 600;
		// Already on screen at mount — which is the whole reason this exists, since
		// that is the case the browser misses. Checked synchronously rather than
		// left to the observer: the first observer callback needs a frame, and a
		// section that mounts in view may not get one until the user moves. A zero
		// rect means an ancestor content-visibility subtree is currently skipped
		// and there is no layout to measure — leave that to the observer.
		const rect = box.getBoundingClientRect();
		if (
			rect.width > 0 &&
			rect.height > 0 &&
			rect.bottom > -NEAR &&
			rect.top < window.innerHeight + NEAR
		) {
			promote();
		}
		if (typeof IntersectionObserver === 'undefined') return;
		const obs = new IntersectionObserver(
			(entries) => {
				// Safety net for a missed load event: the image may already be done.
				if (img.complete && img.naturalWidth > 0) {
					loaded = true;
					obs.disconnect();
					return;
				}
				if (!entries.some((entry) => entry.isIntersecting)) return;
				promote();
			},
			{ rootMargin: `${NEAR}px 0px` },
		);
		obs.observe(box);
		return () => obs.disconnect();
	});

	/*
	 * The video branch's loading discipline: nothing is fetched until the
	 * frame comes near the viewport (same 600px horizon as the image path).
	 * Ungoverned (desktop), the clip then loads and plays. Governed (phones,
	 * reduced motion), coming near only *nominates* the clip — the governor
	 * decides which nominees fetch and play, pauses the rest at a held frame,
	 * and tears down the pipeline of anything that stays off screen.
	 */
	$effect(() => {
		const vid = videoEl;
		const box = frame;
		if (!vid || !box || !use_video) return;
		const start = () => {
			vid.muted = true;
			// On governed devices (phones, reduced motion) the governor owns
			// startup: flag the clip as near and let the next ranking pass promote
			// it if it wins a play slot. Starting here instead would open a media
			// pipeline per clip the moment a gallery scrolls within range —
			// fetches, buffers, and Android decoder sessions the cap never
			// reclaimed — which is exactly the GPU pressure the governor exists to
			// prevent.
			if (governorActive()) {
				vid.dataset.clipNear = '';
				scheduleGovernorPass();
				return;
			}
			if (vid.preload !== 'auto') vid.preload = 'auto';
			vid.play().catch(() => {});
		};
		const NEAR = 600;
		const rect = box.getBoundingClientRect();
		if (
			rect.width > 0 &&
			rect.height > 0 &&
			rect.bottom > -NEAR &&
			rect.top < window.innerHeight + NEAR
		) {
			start();
			return;
		}
		if (typeof IntersectionObserver === 'undefined') {
			start();
			return;
		}
		const obs = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				start();
				obs.disconnect();
			},
			{ rootMargin: `${NEAR}px 0px` },
		);
		obs.observe(box);
		return () => obs.disconnect();
	});
</script>

{#snippet media()}
	{#if use_video}
		<video
			bind:this={videoEl}
			src={clipVideoUrl(src)}
			data-clip
			muted
			loop
			playsinline
			preload="none"
			aria-label={alt || undefined}
			class:loaded
			style:object-fit={fit}
			onloadeddata={() => (loaded = true)}
			onerror={() => (use_video = false)}>
		</video>
	{:else}
		<img
			bind:this={image}
			{src}
			{srcset}
			sizes={srcset && !eager ? 'auto' : undefined}
			{alt}
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			class:loaded
			style:object-fit={fit}
			onload={() => (loaded = true)}
			onerror={retryOrReveal} />
	{/if}
{/snippet}

{#if interactive}
	<button
		bind:this={frame}
		type="button"
		class="lazy-media lazy-media-button {klass}"
		class:rounded
		class:shadow
		style:aspect-ratio={ratio || undefined}
		{style}
		aria-label={alt || 'Open image'}
		onclick={(e) => onclick?.(e)}>
		{@render media()}
		{#if video}
			<span class="play" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
			</span>
		{/if}
		{#if caption}
			<span class="caption">{caption}</span>
		{/if}
	</button>
{:else}
	<figure
		bind:this={frame}
		class="lazy-media {klass}"
		class:rounded
		class:shadow
		style:aspect-ratio={ratio || undefined}
		{style}>
		{@render media()}
		{#if caption}
			<figcaption>{caption}</figcaption>
		{/if}
	</figure>
{/if}

<style>
	.lazy-media {
		position: relative;
		display: block;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.04);
		margin: 0;
		content-visibility: auto;
		contain-intrinsic-size: 600px 400px;
	}
	/* Remember the real rendered size after first paint so sections above the
	   scroll target stop shifting height once they've been seen (see
	   SectionShell for the cross-browser guard rationale). */
	@supports (contain-intrinsic-size: auto 1px) {
		.lazy-media {
			contain-intrinsic-size: auto 600px auto 400px;
		}
	}
	.lazy-media-button {
		appearance: none;
		border: 0;
		padding: 0;
		width: 100%;
		color: inherit;
		font: inherit;
		cursor: pointer;
		transition:
			translate 200ms ease,
			scale 200ms ease;
	}
	/* Press depress: instant on the way down (duration 0 while pressed), the
	   base transition animates the release. */
	.lazy-media-button:active {
		transition-duration: 0s;
		translate: 0 1px;
		scale: 0.995;
	}
	.lazy-media-button:hover :is(img, video) {
		transition-duration: 0s;
		transform: scale(1.02);
	}
	.lazy-media-button :is(img, video) {
		transition: transform 250ms ease;
	}
	.lazy-media-button:focus-visible {
		outline: 2px solid #00d6ff;
		outline-offset: 2px;
	}
	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
		width: clamp(44px, 9%, 72px);
		aspect-ratio: 1;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		backdrop-filter: blur(4px);
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
		transition:
			transform 200ms ease,
			background 200ms ease;
		pointer-events: none;
	}
	.play svg {
		width: 45%;
		height: 45%;
		margin-left: 6%;
	}
	.lazy-media-button:hover .play {
		transition-duration: 0s;
		transform: translate(-50%, -50%) scale(1.08);
		background: rgba(0, 0, 0, 0.7);
	}
	.lazy-media.rounded {
		border-radius: 12px;
	}
	.lazy-media.shadow {
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.35),
			0 2px 6px rgba(0, 0, 0, 0.25);
	}
	img,
	video {
		display: block;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 500ms ease;
	}
	img.loaded,
	video.loaded {
		opacity: 1;
	}
	figcaption,
	.lazy-media .caption {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0.75rem 1rem;
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.75), transparent);
		color: #fff;
		font-size: 0.85rem;
		font-family: var(--font-mono);
		letter-spacing: 0.02em;
	}
</style>
