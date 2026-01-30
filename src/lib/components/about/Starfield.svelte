<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
		const numStars = 200;

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			initStars();
		}

		function initStars() {
			stars.length = 0;
			for (let i = 0; i < numStars; i++) {
				stars.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					size: Math.random() * 2 + 0.5,
					speed: Math.random() * 0.5 + 0.1,
					opacity: Math.random() * 0.5 + 0.3
				});
			}
		}

		function animate() {
			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (const star of stars) {
				// Twinkle effect
				const twinkle = Math.sin(Date.now() * 0.001 * star.speed) * 0.3 + 0.7;

				ctx.beginPath();
				ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
				ctx.fill();

				// Slow drift
				star.y += star.speed * 0.1;
				if (star.y > canvas.height) {
					star.y = 0;
					star.x = Math.random() * canvas.width;
				}
			}

			requestAnimationFrame(animate);
		}

		resize();
		animate();

		window.addEventListener('resize', resize);

		return () => {
			window.removeEventListener('resize', resize);
		};
	});
</script>

<canvas bind:this={canvas} class="starfield"></canvas>

<style>
	.starfield {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}
</style>
