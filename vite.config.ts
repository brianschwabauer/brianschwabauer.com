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
	// @delightstack/components ships raw .svelte files in its published dist. They're
	// compiled by vite-plugin-svelte on demand, so keep them out of Vite's esbuild
	// dependency pre-bundling — its scanner can't parse Svelte sources.
	optimizeDeps: {
		exclude: [
			'@delightstack/components',
			'@delightstack/components/actions',
			'@delightstack/components/display',
			'@delightstack/components/feedback',
			'@delightstack/components/form',
			'@delightstack/components/media',
			'@delightstack/components/navigation',
		],
	},
	build: {
		rollupOptions: {
			external: [/^cloudflare:/],
		},
	},
	server: {
		port: 5180,
		proxy: {
			'/api/images': { target: IMAGE_WORKER_URL, changeOrigin: true },
			'/cdn/image': { target: IMAGE_WORKER_URL, changeOrigin: true },
		},
	},
});
