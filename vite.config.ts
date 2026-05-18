import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// In development, /api/images/* and /cdn/image/* are proxied to a separate
// wrangler dev instance (see wrangler.images.toml + `pnpm dev:images`) that
// can run the @delightstack/images Cloudflare Container locally. In
// production both routes are served by the same image-worker, reached via
// the IMAGE_PROCESSOR service binding from the main worker.
const IMAGE_WORKER_URL = process.env.IMAGE_WORKER_URL || 'http://localhost:8788';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: [/^cloudflare:/]
		}
	},
	server: {
		port: 5180,
		fs: {
			allow: ['delightstack']
		},
		proxy: {
			'/api/images': { target: IMAGE_WORKER_URL, changeOrigin: true },
			'/cdn/image': { target: IMAGE_WORKER_URL, changeOrigin: true }
		}
	}
});
