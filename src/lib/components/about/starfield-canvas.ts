// Canvas painter for the hero starfield.
//
// WHY A CANVAS AT ALL. As DOM, every tile is its own composited layer: an
// image with a border-radius mask, a glow shadow and a 3D transform under
// perspective. The scroll-driven zoom changes every tile's on-screen scale at
// once, and the browser answers by re-rasterising up to 24 masked, shadowed
// layers mid-scroll — which is exactly the frame budget a low-end GPU does
// not have, and why the jank only shows when the scroll "zooms" the field.
// Painted into one canvas, a frame is 24 pre-baked sprites blitted with a
// transform and an alpha: no layers, no style recalc, no raster invalidation,
// no preserve-3d sorting. The DOM field stays in the markup for SSR first
// paint, reduced motion, the boom blast, and as the fallback this module's
// failure path returns to.
//
// WHAT IS BAKED VS. WHAT IS LIVE. Rounded corners, the teal glow and the drop
// shadow are baked into each sprite ONCE (they are the expensive-at-raster
// parts); position, scale, rotation and opacity are applied per frame (they
// are the free-at-composite parts). The bake uses a nominal tile width, so a
// tile's corner radius and glow thickness are within ±25% of the DOM's
// per-tile values — invisible on a moving 130px tile. The brightness ramp is
// live as a black overlay scaled by depth (universal, cheap); the saturation
// ramp is dropped — it only ever ran inside the fade-in window, under an
// opacity climbing out of 0, where it had nothing to show itself on.
// (ctx.filter would reproduce both exactly, but it is not supported in
// WebKit and is a per-draw cost everywhere else.)

/** the sprite cache key — a recycled image can return with a different tile
 *  ratio, so the ratio is part of the identity */
export function spriteKey(src: string, ar: number): string {
	return `${src}|${ar}`;
}

/** what the Hero's warp loop hands over, one per visible tile per frame */
export type TileFrame = {
	/** the tile's image and box ratio — together they name the sprite */
	src: string;
	ar: number;
	/** warp depth — only used by the caller to depth-sort before draw() */
	u: number;
	/** screen-space centre, CSS px */
	sx: number;
	sy: number;
	/** on-screen tile width, CSS px (perspective factor already applied) */
	w: number;
	/** in-plane rotation, radians */
	rot: number;
	/** 0–1, the tile's fade (× any intro ramp) */
	alpha: number;
	/** 0–0.3, the depth dimming (1 − brightness, floored at 0) */
	dim: number;
};

type Sprite = {
	canvas: HTMLCanvasElement;
	/** tile box size in sprite px (excludes the shadow margin) */
	bw: number;
	bh: number;
	/** shadow margin in sprite px on every side */
	m: number;
	/** corner radius in sprite px */
	radius: number;
	/** LRU stamp — draw() refreshes it, evict() reads it */
	used: number;
};

/** tile box width every sprite is baked at */
const SPRITE_W = 512;
/** the star.w the baked shadows are nominal for (w ranges 1.1–1.9) */
const NOMINAL_W = 1.5;
/** sprite cache cap — 24 on screen + parked/recycled stragglers */
const MAX_SPRITES = 48;

export class StarfieldPainter {
	private ctx: CanvasRenderingContext2D | null;
	private sprites = new Map<string, Sprite>();
	private pending = new Set<string>();
	private dpr = 1;
	private stamp = 0;
	/** bake glow into new sprites — Hero clears it under low-fx */
	glow = true;
	/** any fetch/decode failure latches this; Hero checks it before trusting us */
	failed = false;
	/** called on a failure AFTER activation, so Hero can fall back mid-flight */
	onFailure: (() => void) | undefined;

	constructor(
		private canvas: HTMLCanvasElement,
		private mediaBase: string,
	) {
		this.ctx = canvas.getContext('2d');
		if (!this.ctx) this.failed = true;
	}

	resize(cssW: number, cssH: number, dpr: number) {
		this.dpr = Math.min(dpr, 2); // >2× is invisible and quadruples fill cost
		const w = Math.max(1, Math.round(cssW * this.dpr));
		const h = Math.max(1, Math.round(cssH * this.dpr));
		if (this.canvas.width !== w) this.canvas.width = w;
		if (this.canvas.height !== h) this.canvas.height = h;
	}

	/** is this tile drawable right now? */
	has(src: string, ar: number): boolean {
		return this.sprites.has(spriteKey(src, ar));
	}

	/**
	 * Fetch + decode + bake, idempotent per src. The fetch is `cors` because a
	 * canvas fed a non-CORS image is tainted and unusable; the CDN allows the
	 * site origin. Any failure latches `failed` — the Hero never activates on
	 * a partial field, and deactivates if already live.
	 *
	 * THE RETRY IS THE LOAD-BEARING PART. The DOM field's plain <img> tiles
	 * usually reach the HTTP cache first, and a no-Origin request stores the
	 * response WITHOUT its CORS headers — so this fetch, hitting that entry,
	 * fails even though the CDN allows us, and one such failure used to
	 * disable the canvas for the whole session. `reload` bypasses the
	 * poisoned entry, goes to the network with an Origin, and overwrites the
	 * entry with a CORS-clean copy — healing the cache for next time too.
	 */
	request(src: string, ar: number) {
		const key = spriteKey(src, ar);
		if (this.failed || this.sprites.has(key) || this.pending.has(key)) return;
		this.pending.add(key);
		const load = (cache: RequestCache) =>
			fetch(this.mediaBase + src, { mode: 'cors', cache }).then((res) => {
				if (!res.ok) throw new Error(`${res.status}`);
				return res.blob();
			});
		load('default')
			.catch(() => load('reload'))
			.then((blob) => createImageBitmap(blob))
			.then((bmp) => {
				this.pending.delete(key);
				if (this.failed) return;
				this.bake(key, ar, bmp);
				bmp.close();
			})
			.catch(() => {
				this.pending.delete(key);
				this.failed = true;
				this.onFailure?.();
			});
	}

	private bake(key: string, ar: number, bmp: ImageBitmap) {
		const bw = SPRITE_W;
		const bh = Math.round(SPRITE_W / ar);
		// everything the DOM sized off --star-unit is sized off the nominal
		// unit here: unit = tileWidth / star.w
		const unit = bw / NOMINAL_W;
		const glowBlur = unit * 0.258;
		const dropBlur = unit * 0.242;
		const dropY = unit * 0.076;
		const radius = unit * 0.053;
		const m = Math.ceil(Math.max(glowBlur, dropBlur + dropY) * 1.5);

		const c = document.createElement('canvas');
		c.width = bw + 2 * m;
		c.height = bh + 2 * m;
		const ctx = c.getContext('2d');
		if (!ctx) return;

		const box = (x = m, y = m) => {
			ctx.beginPath();
			if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, bw, bh, radius);
			else ctx.rect(x, y, bw, bh);
		};
		// shadows via the offset trick — the shape is drawn far off-canvas and
		// only its shadow lands in frame, so no fill fringes the image edge
		const OFF = 10000;
		const shadow = (color: string, blur: number, dy: number) => {
			ctx.save();
			ctx.shadowColor = color;
			ctx.shadowBlur = blur;
			ctx.shadowOffsetX = OFF;
			ctx.shadowOffsetY = dy;
			box(m - OFF, m);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.restore();
		};
		shadow('rgba(0, 0, 0, 0.5)', dropBlur, dropY);
		if (this.glow) shadow('rgba(0, 244, 195, 0.22)', glowBlur, 0);

		// the image, object-fit: cover into the rounded box
		ctx.save();
		box();
		ctx.clip();
		const scale = Math.max(bw / bmp.width, bh / bmp.height);
		const sw = bw / scale;
		const sh = bh / scale;
		ctx.drawImage(bmp, (bmp.width - sw) / 2, (bmp.height - sh) / 2, sw, sh, m, m, bw, bh);
		ctx.restore();

		this.sprites.set(key, { canvas: c, bw, bh, m, radius, used: this.stamp });
		if (this.sprites.size > MAX_SPRITES) this.evict();
	}

	private evict() {
		let oldest: string | null = null;
		let oldestUsed = Infinity;
		for (const [key, s] of this.sprites) {
			if (s.used < oldestUsed) {
				oldestUsed = s.used;
				oldest = key;
			}
		}
		if (oldest) this.sprites.delete(oldest);
	}

	/** one frame — `frames` already depth-sorted far→near by the caller */
	draw(frames: TileFrame[]) {
		const ctx = this.ctx;
		if (!ctx) return;
		this.stamp++;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		for (const f of frames) {
			const s = this.sprites.get(spriteKey(f.src, f.ar));
			if (!s || f.alpha <= 0) continue;
			s.used = this.stamp;
			const k = f.w / s.bw; // sprite px → CSS px at this tile's screen size
			ctx.setTransform(this.dpr, 0, 0, this.dpr, f.sx * this.dpr, f.sy * this.dpr);
			ctx.rotate(f.rot);
			ctx.globalAlpha = f.alpha;
			ctx.drawImage(
				s.canvas,
				-(s.bw / 2 + s.m) * k,
				-(s.bh / 2 + s.m) * k,
				(s.bw + 2 * s.m) * k,
				(s.bh + 2 * s.m) * k,
			);
			if (f.dim > 0.02) {
				// the depth dimming: a black wash over the tile box only (the
				// glow margin stays undimmed — at these depths it is faint
				// anyway), weighted by the tile's own alpha so a fading tile
				// cannot cast a dark rectangle onto whatever is behind it
				ctx.globalAlpha = f.alpha * f.dim;
				ctx.fillStyle = '#000';
				ctx.beginPath();
				if (typeof ctx.roundRect === 'function') {
					ctx.roundRect(
						(-s.bw / 2) * k,
						(-s.bh / 2) * k,
						s.bw * k,
						s.bh * k,
						s.radius * k,
					);
				} else {
					ctx.rect((-s.bw / 2) * k, (-s.bh / 2) * k, s.bw * k, s.bh * k);
				}
				ctx.fill();
			}
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.globalAlpha = 1;
	}

	clear() {
		const ctx = this.ctx;
		if (!ctx) return;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	dispose() {
		this.sprites.clear();
		this.pending.clear();
		this.onFailure = undefined;
	}
}
