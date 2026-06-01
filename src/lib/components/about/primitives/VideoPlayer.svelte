<script lang="ts">
	import { onMount } from 'svelte';
	import { hls as hlsUrl, poster as posterUrl, vttThumbs } from '../media';

	let {
		slug,
		title = '',
		ratio = '16 / 9',
		muted = false,
		loop = false,
		preload = 'metadata',
		class: klass = '',
		onclick = undefined as
			| undefined
			| ((event: MouseEvent & { currentTarget: HTMLButtonElement }) => void),
	}: {
		slug: string;
		title?: string;
		ratio?: string;
		muted?: boolean;
		loop?: boolean;
		preload?: 'none' | 'metadata' | 'auto';
		class?: string;
		/** When provided, clicking the poster fires this instead of starting inline playback —
		 *  used to defer playback to a Gallery lightbox. The event's `currentTarget` is the
		 *  poster button, useful for spotlight/shared-element transitions. */
		onclick?: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => void;
	} = $props();

	const src = $derived(hlsUrl(slug));
	const poster = $derived(posterUrl(slug));
	const thumbs = $derived(vttThumbs(slug));

	let videoEl = $state<HTMLVideoElement | null>(null);
	let started = $state(false);
	let player: any = null;

	async function init() {
		if (!videoEl) return;
		const [{ default: videojs }, vttMod] = await Promise.all([
			import('video.js'),
			// @ts-ignore — registers via side-effect on its own videojs copy
			import('videojs-vtt-thumbnails'),
			// @ts-ignore
			import('video.js/dist/video-js.css'),
			// @ts-ignore
			import('videojs-vtt-thumbnails/dist/videojs-vtt-thumbnails.css'),
		]);

		// Re-register the plugin on OUR videojs instance — Vite can end up with
		// a separate copy of video.js loaded inside the plugin's CJS bundle.
		const vttPlugin = (vttMod as any).default ?? vttMod;
		if (vttPlugin && !(videojs as any).getPlugin?.('vttThumbnails')) {
			(videojs as any).registerPlugin('vttThumbnails', vttPlugin);
		}

		player = videojs(videoEl, {
			controls: true,
			autoplay: 'any',
			muted,
			loop,
			preload,
			fluid: false,
			fill: true,
			responsive: true,
			playsinline: true,
			poster,
			crossOrigin: 'anonymous',
			html5: {
				vhs: { overrideNative: true, withCredentials: false },
				nativeAudioTracks: false,
				nativeVideoTracks: false,
			},
			controlBar: {
				pictureInPictureToggle: true,
				volumePanel: { inline: false },
			},
			sources: [{ src, type: 'application/x-mpegURL' }],
		});

		player.ready(() => {
			try {
				(player as any).vttThumbnails({ src: thumbs });
			} catch {
				/* plugin failed to register — fail silently */
			}
			const p = player.play?.();
			if (p && typeof p.catch === 'function') {
				p.catch(() => {
					/* autoplay blocked — user can press the player's own play button */
				});
			}
		});
	}

	onMount(() => {
		return () => {
			if (player) {
				try {
					player.dispose();
				} catch {
					/* ignore */
				}
				player = null;
			}
		};
	});

	function start(event: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (onclick) {
			onclick(event);
			return;
		}
		started = true;
		queueMicrotask(init);
	}
</script>

<div class="video-shell {klass}" style:aspect-ratio={ratio}>
	{#if !started}
		<button
			class="poster-btn"
			type="button"
			onclick={start}
			aria-label={title ? `Play ${title}` : 'Play video'}>
			<img src={poster} alt={title} loading="lazy" decoding="async" />
			<span class="play">
				<svg viewBox="0 0 80 80" aria-hidden="true">
					<defs>
						<radialGradient id="pl-grad" cx="50%" cy="50%" r="60%">
							<stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
							<stop offset="100%" stop-color="rgba(0,0,0,0.55)" />
						</radialGradient>
					</defs>
					<circle
						cx="40"
						cy="40"
						r="38"
						fill="url(#pl-grad)"
						stroke="rgba(255,255,255,0.95)"
						stroke-width="1.5" />
					<polygon points="33,26 33,54 58,40" fill="#fff" />
				</svg>
			</span>
			{#if title}
				<span class="title">{title}</span>
			{/if}
		</button>
	{:else}
		<div class="video-mount">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video
				bind:this={videoEl}
				class="video-js vjs-bs vjs-big-play-centered vjs-show-big-play-button-on-pause"
				playsinline
				crossorigin="anonymous">
			</video>
		</div>
	{/if}
</div>

<style>
	.video-shell {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 14px;
		background: #000;
		box-shadow:
			0 14px 50px rgba(0, 0, 0, 0.55),
			0 2px 10px rgba(0, 0, 0, 0.35);
	}
	.poster-btn {
		position: absolute;
		inset: 0;
		display: block;
		padding: 0;
		border: 0;
		background: #000;
		cursor: pointer;
		overflow: hidden;
	}
	.poster-btn img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0.92;
		transition:
			transform 600ms ease,
			opacity 200ms ease;
	}
	.poster-btn:hover img {
		transition-duration: 0s;
		transform: scale(1.03);
		opacity: 1;
	}
	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		width: clamp(56px, 8vw, 88px);
		height: clamp(56px, 8vw, 88px);
		transform: translate(-50%, -50%);
		transition:
			transform 200ms ease,
			filter 200ms ease;
		filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.6));
	}
	.poster-btn:hover .play {
		transition-duration: 0s;
		transform: translate(-50%, -50%) scale(1.08);
		filter: drop-shadow(0 14px 32px rgba(0, 0, 0, 0.7));
	}
	.title {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		right: 1rem;
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		letter-spacing: 0.02em;
		text-align: left;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
	}
	.video-mount {
		position: absolute;
		inset: 0;
	}
	.video-mount :global(.video-js) {
		width: 100% !important;
		height: 100% !important;
		font-family: var(--font-sans, system-ui), sans-serif;
	}
	.video-mount :global(.video-js video) {
		width: 100% !important;
		height: 100% !important;
		object-fit: contain;
		background: #000;
	}

	/* ============================================================
	   Custom "bs" (Brian Schwabauer) skin — modernised default skin
	   ============================================================ */

	/* Control bar — sits at the very bottom of the player container,
	   glassy gradient backdrop, more breathing room. */
	.video-mount :global(.video-js.vjs-bs .vjs-control-bar) {
		height: 56px;
		padding: 14px 12px 4px;
		background: linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.82) 0%,
			rgba(0, 0, 0, 0.55) 55%,
			transparent 100%
		);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* Buttons — keep the default icon font; just tune the box size */
	.video-mount :global(.video-js.vjs-bs .vjs-button) {
		width: 38px;
		height: 38px;
		min-width: 38px;
		cursor: pointer;
		transition:
			transform 150ms ease,
			background 150ms ease;
		border-radius: 8px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-button:hover) {
		transition-duration: 0s;
		background: rgba(255, 255, 255, 0.08);
	}
	.video-mount :global(.video-js.vjs-bs .vjs-button:hover .vjs-icon-placeholder::before) {
		transition-duration: 0s;
		color: #fff;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-button > .vjs-icon-placeholder::before) {
		font-size: 22px;
		line-height: 38px;
		color: rgba(255, 255, 255, 0.92);
	}

	/* Progress bar — bigger hit area, gradient fill, glowy on hover */
	.video-mount :global(.video-js.vjs-bs .vjs-progress-control) {
		flex: 1 1 auto;
		min-width: 60px;
		height: 38px;
		padding: 0 8px;
		display: flex;
		align-items: center;
		cursor: pointer;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-progress-holder) {
		height: 4px;
		margin: 0;
		background: rgba(255, 255, 255, 0.18);
		border-radius: 3px;
		transition: height 120ms ease;
	}
	.video-mount
		:global(.video-js.vjs-bs .vjs-progress-control:hover .vjs-progress-holder) {
		transition-duration: 0s;
		height: 8px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-play-progress) {
		background: linear-gradient(90deg, #00f2c3, #6c63ff) !important;
		border-radius: 3px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-play-progress::before) {
		display: none;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-load-progress),
	.video-mount :global(.video-js.vjs-bs .vjs-load-progress div) {
		background: rgba(255, 255, 255, 0.3);
		border-radius: 3px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-progress-holder .vjs-time-tooltip),
	.video-mount :global(.video-js.vjs-bs .vjs-mouse-display .vjs-time-tooltip) {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-size: 11px;
		font-weight: 600;
		padding: 4px 7px;
		border-radius: 4px;
		background: rgba(0, 0, 0, 0.85);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.12);
	}

	/* Time text */
	.video-mount :global(.video-js.vjs-bs .vjs-time-control) {
		font-family: var(--font-mono, ui-monospace, monospace);
		font-variant-numeric: tabular-nums;
		font-size: 12px;
		line-height: 38px;
		padding: 0 6px;
		color: rgba(255, 255, 255, 0.92);
		min-width: auto;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-current-time),
	.video-mount :global(.video-js.vjs-bs .vjs-duration),
	.video-mount :global(.video-js.vjs-bs .vjs-time-divider) {
		display: block;
	}

	/* Volume — vertical popout */
	.video-mount :global(.video-js.vjs-bs .vjs-volume-panel .vjs-volume-bar) {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-volume-level) {
		background: #00f2c3;
		border-radius: 3px;
	}
	.video-mount :global(.video-js.vjs-bs .vjs-volume-level::before) {
		color: #00f2c3;
	}

	/* Big "play" overlay shown while paused */
	.video-mount :global(.video-js.vjs-bs .vjs-big-play-button) {
		width: 88px;
		height: 88px;
		line-height: 88px;
		border-radius: 50%;
		border: 1.5px solid rgba(255, 255, 255, 0.85);
		background: rgba(0, 0, 0, 0.45);
		backdrop-filter: blur(8px);
		margin-left: -44px;
		margin-top: -44px;
		transition:
			transform 200ms ease,
			background 200ms ease,
			border-color 200ms ease;
	}
	.video-mount
		:global(.video-js.vjs-bs .vjs-big-play-button .vjs-icon-placeholder::before) {
		font-size: 36px;
		line-height: 88px;
	}
	.video-mount :global(.video-js.vjs-bs:hover .vjs-big-play-button) {
		transition-duration: 0s;
		background: rgba(0, 242, 195, 0.18);
		border-color: #00f2c3;
		transform: scale(1.05);
	}

	/* VTT thumbnails — re-style the popout */
	.video-mount :global(.vjs-vtt-thumbnail-display) {
		border: 2px solid rgba(255, 255, 255, 0.9);
		border-radius: 6px;
		box-shadow:
			0 16px 40px rgba(0, 0, 0, 0.6),
			0 4px 12px rgba(0, 0, 0, 0.4);
		overflow: hidden;
		bottom: 56px !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.poster-btn img,
		.play {
			transition: none;
		}
	}
</style>
