<script lang="ts">
	let {
		src,
		reverseSrc,
		progress,
		ariaLabel,
		class: klass = '',
	}: {
		src: string;
		reverseSrc: string;
		progress: number;
		ariaLabel?: string;
		class?: string;
	} = $props();

	let fwdVideo = $state<HTMLVideoElement | null>(null);
	let revVideo = $state<HTMLVideoElement | null>(null);
	let wrapEl = $state<HTMLElement | null>(null);
	let duration = $state(0);
	let activeIsReverse = $state(false);
	// Don't download two full videos during initial page load — wait until the
	// pin section is within ~1.5 viewports, then upgrade preload and warm the
	// decoders.
	let near = $state(false);

	// Fallback: scroll progress arriving means the pin is on screen, whether or
	// not the IntersectionObserver has managed to report yet.
	$effect(() => {
		if (!near && progress > 0.001) near = true;
	});

	$effect(() => {
		if (!wrapEl || near) return;
		if (typeof IntersectionObserver === 'undefined') {
			near = true;
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					near = true;
					io.disconnect();
				}
			},
			{ rootMargin: '150% 0px' },
		);
		io.observe(wrapEl);
		return () => io.disconnect();
	});

	// Two stacked video elements, one playing the original (camera→robot)
	// and one playing a pre-encoded reversed copy (robot→camera). We chase
	// the active one forward — sequential decode = cheap — and swap to the
	// other when the user reverses scroll direction so the rewind is also
	// driven by forward playback rather than expensive backward seeks.
	let scheduled = false;
	let standbyInSync = true;
	let pendingSwap: { cancel: () => void } | null = null;
	let prevProgress = 0;
	let progressInitialized = false;
	let scrollDir = 0; // 1 = forward, -1 = backward, 0 = unknown / idle
	const RESPONSE_S = 0.12;
	const MAX_RATE = 8;
	const EPS_FWD = 1 / 30;
	const REVERSE_SWITCH_DELTA = 0.05;
	const SWAP_TIMEOUT_MS = 250;
	const SWAP_EPS = 0.05;

	function getActive() {
		return activeIsReverse ? revVideo : fwdVideo;
	}
	function getStandby() {
		return activeIsReverse ? fwdVideo : revVideo;
	}

	function refreshDuration() {
		const v = fwdVideo;
		if (!v) return;
		const d = v.duration;
		if (Number.isFinite(d) && d > 0 && d !== duration) duration = d;
	}

	function schedule() {
		if (scheduled) return;
		scheduled = true;
		requestAnimationFrame(tick);
	}

	function syncStandby() {
		if (standbyInSync || duration <= 0) return;
		const active = getActive();
		const standby = getStandby();
		if (!active || !standby) return;
		const visualFwd = activeIsReverse
			? duration - active.currentTime
			: active.currentTime;
		const desired = activeIsReverse ? visualFwd : duration - visualFwd;
		const clamped = Math.max(0, Math.min(duration - 0.001, desired));
		if (Math.abs(standby.currentTime - clamped) > 0.05) {
			try {
				standby.currentTime = clamped;
			} catch {
				/* ignore */
			}
		}
		standbyInSync = true;
	}

	function beginSwap(standby: HTMLVideoElement, desired: number) {
		// Cancel any in-flight swap before starting a new one.
		if (pendingSwap) pendingSwap.cancel();
		const onSeeked = () => finish();
		const timer = window.setTimeout(() => finish(), SWAP_TIMEOUT_MS);
		const cleanup = () => {
			window.clearTimeout(timer);
			standby.removeEventListener('seeked', onSeeked);
			pendingSwap = null;
		};
		function finish() {
			cleanup();
			activeIsReverse = !activeIsReverse;
			standbyInSync = false;
			schedule();
		}
		pendingSwap = { cancel: cleanup };
		standby.addEventListener('seeked', onSeeked);
		try {
			standby.currentTime = desired;
		} catch {
			finish();
		}
	}

	function tick() {
		scheduled = false;
		const v = getActive();
		if (!v || duration <= 0) return;

		// While a swap is in flight, don't issue any further commands — the
		// seeked callback (or the timeout) will re-enter tick() once the new
		// active is actually at the right frame.
		if (pendingSwap) return;

		// Pin section scrolled fully off the top → reset both videos to
		// their "frame 0 = camera" position so the next forward pass is fresh.
		if (progress <= 0.001) {
			if (fwdVideo && !fwdVideo.paused) fwdVideo.pause();
			if (revVideo && !revVideo.paused) revVideo.pause();
			if (fwdVideo && fwdVideo.currentTime > 0.05) {
				try {
					fwdVideo.currentTime = 0;
				} catch {
					/* ignore */
				}
			}
			if (revVideo && Math.abs(revVideo.currentTime - duration) > 0.05) {
				try {
					revVideo.currentTime = duration - 0.001;
				} catch {
					/* ignore */
				}
			}
			if (activeIsReverse) activeIsReverse = false;
			standbyInSync = true;
			return;
		}

		const targetRaw = activeIsReverse ? (1 - progress) * duration : progress * duration;
		const target = Math.max(0, Math.min(duration - 0.001, targetRaw));
		const delta = target - v.currentTime;

		if (delta >= EPS_FWD) {
			standbyInSync = false;
			const rate = Math.min(MAX_RATE, Math.max(1, delta / RESPONSE_S));
			v.playbackRate = rate;
			if (v.paused) {
				const p = v.play();
				if (p && typeof p.catch === 'function') p.catch(() => {});
			}
			schedule();
		} else if (
			delta < -REVERSE_SWITCH_DELTA &&
			(activeIsReverse ? scrollDir > 0 : scrollDir < 0)
		) {
			// User actually reversed scroll direction (not just chase overshoot).
			// Swap active/standby so the rewind can also be driven by forward
			// playback. Before flipping which video is visible, make sure the
			// standby is at the right frame, otherwise the swap shows a stale
			// frame for the seek's duration (the "flash" near the top).
			v.pause();
			const standby = getStandby();
			if (!standby) {
				schedule();
				return;
			}
			const visualFwd = activeIsReverse ? duration - v.currentTime : v.currentTime;
			const newStandbyTime = activeIsReverse ? visualFwd : duration - visualFwd;
			const clamped = Math.max(0, Math.min(duration - 0.001, newStandbyTime));
			if (Math.abs(standby.currentTime - clamped) < SWAP_EPS) {
				activeIsReverse = !activeIsReverse;
				standbyInSync = false;
				schedule();
			} else {
				beginSwap(standby, clamped);
			}
		} else {
			// Close enough — pause and sync standby once so a future
			// direction switch is seamless.
			if (!v.paused) v.pause();
			syncStandby();
		}
	}

	$effect(() => {
		if (progressInitialized) {
			const dp = progress - prevProgress;
			if (Math.abs(dp) > 0.001) scrollDir = dp > 0 ? 1 : -1;
		} else {
			progressInitialized = true;
		}
		prevProgress = progress;
		schedule();
	});

	$effect(() => {
		const fv = fwdVideo;
		const rv = revVideo;
		if (!fv || !rv || !near) return;
		// The preload attribute flips to "auto" with `near`; nudge the fetch in
		// case the browser ignored the attribute change.
		if (fv.readyState === 0) fv.load();
		if (rv.readyState === 0) rv.load();
		refreshDuration();
		const onMeta = () => {
			refreshDuration();
			schedule();
		};
		const kick = (v: HTMLVideoElement, toEnd: boolean) => {
			if (toEnd && Number.isFinite(v.duration) && v.duration > 0) {
				try {
					v.currentTime = v.duration - 0.001;
				} catch {
					/* ignore */
				}
			}
			const p = v.play();
			if (p && typeof p.then === 'function') {
				p.then(() => v.pause()).catch(() => v.pause());
			} else {
				v.pause();
			}
		};
		const kickFwd = () => kick(fv, false);
		const kickRev = () => kick(rv, true);
		fv.addEventListener('loadedmetadata', onMeta);
		fv.addEventListener('durationchange', onMeta);
		fv.addEventListener('canplay', onMeta);
		if (fv.readyState >= 2) kickFwd();
		else fv.addEventListener('loadeddata', kickFwd, { once: true });
		if (rv.readyState >= 2) kickRev();
		else rv.addEventListener('loadeddata', kickRev, { once: true });
		return () => {
			fv.removeEventListener('loadedmetadata', onMeta);
			fv.removeEventListener('durationchange', onMeta);
			fv.removeEventListener('canplay', onMeta);
			fv.removeEventListener('loadeddata', kickFwd);
			rv.removeEventListener('loadeddata', kickRev);
			if (pendingSwap) pendingSwap.cancel();
		};
	});
</script>

<div class="scrub-wrap {klass}" bind:this={wrapEl}>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={fwdVideo}
		{src}
		muted
		playsinline
		preload={near ? 'auto' : 'metadata'}
		disablepictureinpicture
		disableremoteplayback
		aria-label={ariaLabel}
		class="layer"
		class:active={!activeIsReverse}>
	</video>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={revVideo}
		src={reverseSrc}
		muted
		playsinline
		preload={near ? 'auto' : 'metadata'}
		disablepictureinpicture
		disableremoteplayback
		aria-hidden="true"
		class="layer"
		class:active={activeIsReverse}>
	</video>
</div>

<style>
	.scrub-wrap {
		position: relative;
	}
	.layer {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
		opacity: 0;
	}
	.layer.active {
		opacity: 1;
	}
</style>
