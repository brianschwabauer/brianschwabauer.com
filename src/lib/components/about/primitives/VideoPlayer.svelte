<script lang="ts">
	import { onMount } from 'svelte';
	import { hls as hlsUrl, poster as posterUrl } from '../media';

	let {
		slug,
		title = '',
		ratio = '16 / 9',
		autoplay = false,
		muted = false,
		loop = false,
		preload = 'metadata',
		class: klass = ''
	}: {
		slug: string;
		title?: string;
		ratio?: string;
		autoplay?: boolean;
		muted?: boolean;
		loop?: boolean;
		preload?: 'none' | 'metadata' | 'auto';
		class?: string;
	} = $props();

	const src = $derived(hlsUrl(slug));
	const poster = $derived(posterUrl(slug));

	let videoEl = $state<HTMLVideoElement | null>(null);
	let started = $state(false);
	let player: any = null;

	async function init() {
		if (!videoEl) return;
		const [{ default: videojs }] = await Promise.all([
			import('video.js'),
			// @ts-ignore
			import('video.js/dist/video-js.css')
		]);
		player = videojs(videoEl, {
			controls: true,
			autoplay,
			muted,
			loop,
			preload,
			fluid: true,
			playsinline: true,
			poster,
			sources: [{ src, type: 'application/x-mpegURL' }]
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

	function start() {
		started = true;
		queueMicrotask(init);
	}
</script>

<div class="video-shell {klass}" style:aspect-ratio={ratio}>
	{#if !started}
		<button class="poster-btn" type="button" onclick={start} aria-label={title ? `Play ${title}` : 'Play video'}>
			<img src={poster} alt={title} loading="lazy" decoding="async" />
			<span class="play">
				<svg viewBox="0 0 60 60" aria-hidden="true">
					<circle cx="30" cy="30" r="29" fill="rgba(0,0,0,0.55)" stroke="#fff" stroke-width="2" />
					<polygon points="24,18 24,42 44,30" fill="#fff" />
				</svg>
			</span>
			{#if title}
				<span class="title">{title}</span>
			{/if}
		</button>
	{:else}
		<div class="video-mount">
			<!-- svelte-ignore a11y_media_has_caption -->
			<video bind:this={videoEl} class="video-js vjs-default-skin vjs-big-play-centered" playsinline></video>
		</div>
	{/if}
</div>

<style>
	.video-shell {
		position: relative;
		width: 100%;
		overflow: hidden;
		border-radius: 12px;
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
		transition: transform 600ms ease, opacity 200ms ease;
	}
	.poster-btn:hover img {
		transform: scale(1.03);
		opacity: 1;
	}
	.play {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		transform: translate(-50%, -50%);
		transition: transform 200ms ease;
	}
	.poster-btn:hover .play {
		transform: translate(-50%, -50%) scale(1.08);
	}
	.title {
		position: absolute;
		left: 1rem;
		bottom: 1rem;
		right: 1rem;
		color: #fff;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		text-align: left;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
	}
	.video-mount {
		position: absolute;
		inset: 0;
	}
	.video-mount :global(.video-js) {
		width: 100%;
		height: 100%;
	}
</style>
