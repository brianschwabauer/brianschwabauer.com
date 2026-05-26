<script lang="ts">
	let {
		trigger = 0,
		origin = { x: 0.5, y: 0.45 },
	}: {
		trigger?: number;
		origin?: { x: number; y: number };
	} = $props();

	let canvas = $state<HTMLCanvasElement | null>(null);
	let flashing = $state(false);
	let lastTrigger = 0;

	type Particle = {
		x: number;
		y: number;
		vx: number;
		vy: number;
		size: number;
		rot: number;
		vRot: number;
		sprite: HTMLCanvasElement;
		shape: 'spark' | 'chunk' | 'smoke';
		life: number;
		maxLife: number;
		gravity: number;
		drag: number;
	};

	let particles: Particle[] = [];
	let raf = 0;
	let lastTime = 0;
	let running = false;
	let ringLife = 0;
	let ringX = 0;
	let ringY = 0;

	// pre-rendered sprite atlases — built once, drawn many times.
	// blur/shadow is BAKED INTO the bitmap rather than applied per-frame.
	let sparkSprites: HTMLCanvasElement[] = [];
	let chunkSprites: HTMLCanvasElement[] = [];
	let smokeSprite: HTMLCanvasElement | null = null;

	function makeCanvas(w: number, h: number): HTMLCanvasElement {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		return c;
	}

	function buildSparkSprite(color: string): HTMLCanvasElement {
		const size = 24;
		const c = makeCanvas(size, size);
		const ctx = c.getContext('2d')!;
		// bright core
		const core = ctx.createRadialGradient(
			size / 2,
			size / 2,
			0,
			size / 2,
			size / 2,
			size / 4,
		);
		core.addColorStop(0, '#ffffff');
		core.addColorStop(1, color);
		ctx.fillStyle = core;
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
		ctx.fill();
		// halo (additive so overlapping particles brighten)
		ctx.globalCompositeOperation = 'lighter';
		const halo = ctx.createRadialGradient(
			size / 2,
			size / 2,
			0,
			size / 2,
			size / 2,
			size / 2,
		);
		halo.addColorStop(0, color);
		halo.addColorStop(0.4, color);
		halo.addColorStop(1, 'rgba(0,0,0,0)');
		ctx.fillStyle = halo;
		ctx.fillRect(0, 0, size, size);
		return c;
	}

	function buildChunkSprite(color: string): HTMLCanvasElement {
		const w = 16;
		const h = 12;
		const c = makeCanvas(w, h);
		const ctx = c.getContext('2d')!;
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, w, h);
		// top highlight
		ctx.fillStyle = 'rgba(255,255,255,0.22)';
		ctx.fillRect(0, 0, w, 3);
		// bottom shade
		ctx.fillStyle = 'rgba(0,0,0,0.28)';
		ctx.fillRect(0, h - 3, w, 3);
		return c;
	}

	function buildSmokeSprite(): HTMLCanvasElement {
		const size = 96;
		const c = makeCanvas(size, size);
		const ctx = c.getContext('2d')!;
		// soft radial gradient (replaces filter:blur per frame)
		const g = ctx.createRadialGradient(
			size / 2,
			size / 2,
			0,
			size / 2,
			size / 2,
			size / 2,
		);
		g.addColorStop(0, 'rgba(140,140,150,0.55)');
		g.addColorStop(0.45, 'rgba(110,110,120,0.32)');
		g.addColorStop(0.85, 'rgba(80,80,90,0.08)');
		g.addColorStop(1, 'rgba(80,80,90,0)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, size, size);
		return c;
	}

	function ensureSprites() {
		if (sparkSprites.length === 0) {
			const sparkColors = [
				'#fff8c0',
				'#ffd934',
				'#ff9d40',
				'#00f2c3',
				'#a8a0ff',
				'#ffffff',
			];
			sparkSprites = sparkColors.map((col) => buildSparkSprite(col));
		}
		if (chunkSprites.length === 0) {
			const chunkColors = [
				'#222632',
				'#3a4357',
				'#0c1018',
				'#1a2230',
				'#00f2c3',
				'#6c63ff',
				'#ffd934',
			];
			chunkSprites = chunkColors.map((col) => buildChunkSprite(col));
		}
		if (!smokeSprite) {
			smokeSprite = buildSmokeSprite();
		}
	}

	function rand(min: number, max: number) {
		return min + Math.random() * (max - min);
	}

	function fitCanvas() {
		if (!canvas) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
		const rect = canvas.getBoundingClientRect();
		canvas.width = Math.floor(rect.width * dpr);
		canvas.height = Math.floor(rect.height * dpr);
		const ctx = canvas.getContext('2d');
		if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}

	function spawnBurst() {
		if (!canvas) return;
		ensureSprites();

		const rect = canvas.getBoundingClientRect();
		const cx = rect.width * origin.x;
		const cy = rect.height * origin.y;

		particles = [];
		ringLife = 0;
		ringX = cx;
		ringY = cy;

		// SPARKS — ~80 (was 160). Smaller, no per-frame shadow.
		for (let i = 0; i < 80; i++) {
			const angle = rand(0, Math.PI * 2);
			const speed = rand(280, 760);
			particles.push({
				x: cx,
				y: cy,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - rand(20, 120),
				size: rand(6, 14),
				rot: 0,
				vRot: 0,
				sprite: sparkSprites[(Math.random() * sparkSprites.length) | 0],
				shape: 'spark',
				life: 0,
				maxLife: rand(0.7, 1.3),
				gravity: rand(380, 620),
				drag: 0.93,
			});
		}

		// CHUNKS — ~50 (was 75)
		for (let i = 0; i < 50; i++) {
			const angle = rand(-Math.PI, 0);
			const speed = rand(160, 460);
			particles.push({
				x: cx + rand(-30, 30),
				y: cy + rand(-20, 20),
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed - rand(80, 220),
				size: rand(0.55, 1.4),
				rot: rand(0, Math.PI * 2),
				vRot: rand(-12, 12),
				sprite: chunkSprites[(Math.random() * chunkSprites.length) | 0],
				shape: 'chunk',
				life: 0,
				maxLife: rand(1.3, 2.2),
				gravity: rand(520, 760),
				drag: 0.985,
			});
		}

		// SMOKE — ~24 (was 50). Drawn from a pre-rendered sprite (no blur per frame).
		for (let i = 0; i < 24; i++) {
			const angle = rand(0, Math.PI * 2);
			const speed = rand(40, 140);
			particles.push({
				x: cx + rand(-24, 24),
				y: cy + rand(-24, 24),
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed * 0.4 - rand(20, 90),
				size: rand(0.9, 1.7),
				rot: rand(0, Math.PI * 2),
				vRot: rand(-0.8, 0.8),
				sprite: smokeSprite!,
				shape: 'smoke',
				life: 0,
				maxLife: rand(1.8, 2.8),
				gravity: -20,
				drag: 0.985,
			});
		}

		flashing = true;
		setTimeout(() => (flashing = false), 220);

		if (!running) {
			lastTime = performance.now();
			running = true;
			raf = requestAnimationFrame(loop);
		}
	}

	function loop(now: number) {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const dt = Math.min(0.05, (now - lastTime) / 1000);
		lastTime = now;

		const rect = canvas.getBoundingClientRect();
		ctx.clearRect(0, 0, rect.width, rect.height);

		// shockwave ring (single, drawn first under everything else)
		ringLife += dt;
		if (ringLife < 0.72) {
			const t = ringLife / 0.72;
			const r = 10 + t * 280;
			ctx.save();
			ctx.globalAlpha = (1 - t) * 0.85;
			ctx.lineWidth = 12 * (1 - t) + 1;
			ctx.strokeStyle = 'rgba(255,236,150,1)';
			ctx.beginPath();
			ctx.arc(ringX, ringY, r, 0, Math.PI * 2);
			ctx.stroke();
			ctx.globalAlpha = (1 - t) * 0.35;
			ctx.lineWidth = 28 * (1 - t) + 1;
			ctx.strokeStyle = 'rgba(255,180,80,0.5)';
			ctx.beginPath();
			ctx.arc(ringX, ringY, r * 0.96, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		// draw smoke first (behind), then chunks, then sparks (additive)
		let alive = 0;

		// pass 1: smoke
		for (const p of particles) {
			if (p.shape !== 'smoke') continue;
			p.life += dt;
			if (p.life >= p.maxLife) continue;
			alive++;
			p.vx *= p.drag;
			p.vy = p.vy * p.drag + p.gravity * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.rot += p.vRot * dt;
			const t = p.life / p.maxLife;
			const fade = 1 - t;
			const scl = p.size * (1 + t * 1.6);
			ctx.save();
			ctx.globalAlpha = fade * 0.7;
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			const s = 96 * scl;
			ctx.drawImage(p.sprite, -s / 2, -s / 2, s, s);
			ctx.restore();
		}

		// pass 2: chunks
		for (const p of particles) {
			if (p.shape !== 'chunk') continue;
			if (p.life >= p.maxLife) continue;
			p.life += dt;
			if (p.life >= p.maxLife) continue;
			alive++;
			p.vx *= p.drag;
			p.vy = p.vy * p.drag + p.gravity * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.rot += p.vRot * dt;
			const t = p.life / p.maxLife;
			ctx.save();
			ctx.globalAlpha = 1 - t;
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.scale(p.size, p.size);
			ctx.drawImage(p.sprite, -8, -6);
			ctx.restore();
		}

		// pass 3: sparks (additive blending makes them feel hot without shadowBlur)
		ctx.save();
		ctx.globalCompositeOperation = 'lighter';
		for (const p of particles) {
			if (p.shape !== 'spark') continue;
			if (p.life >= p.maxLife) continue;
			p.life += dt;
			if (p.life >= p.maxLife) continue;
			alive++;
			p.vx *= p.drag;
			p.vy = p.vy * p.drag + p.gravity * dt;
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			const t = p.life / p.maxLife;
			const fade = 1 - t;
			const s = p.size * (0.4 + fade * 0.8);
			ctx.globalAlpha = Math.min(1, fade * 1.4);
			ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
		}
		ctx.restore();

		if (alive > 0 || ringLife < 0.72) {
			raf = requestAnimationFrame(loop);
		} else {
			running = false;
			ctx.clearRect(0, 0, rect.width, rect.height);
		}
	}

	$effect(() => {
		if (trigger > lastTrigger) {
			lastTrigger = trigger;
			fitCanvas();
			spawnBurst();
		}
	});

	$effect(() => {
		if (!canvas) return;
		fitCanvas();
		const onResize = () => fitCanvas();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
		};
	});
</script>

<div class="layer" aria-hidden="true">
	<canvas bind:this={canvas}></canvas>
	<div class="flash" class:on={flashing}></div>
</div>

<style>
	.layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 8;
		overflow: hidden;
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.flash {
		position: absolute;
		inset: 0;
		background: radial-gradient(
			ellipse at var(--ox, 50%) var(--oy, 45%),
			rgba(255, 250, 220, 1) 0%,
			rgba(255, 200, 120, 0.85) 20%,
			rgba(255, 80, 30, 0.5) 40%,
			transparent 70%
		);
		opacity: 0;
		mix-blend-mode: screen;
		transition: opacity 220ms ease-out;
	}
	.flash.on {
		opacity: 1;
		transition: opacity 60ms ease-in;
	}
</style>
