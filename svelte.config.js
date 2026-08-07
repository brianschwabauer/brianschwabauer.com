import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		experimental: {
			async: true,
		},
	},
	kit: {
		// The about page pulls in ~45 per-component CSS chunks, most under a few
		// KB — as external <link>s they render-block behind dozens of extra
		// round-trips. Inlining everything under 6KB collapses that to a handful
		// of requests (only the big shared sheets stay external and cacheable)
		// at the cost of ~100KB raw (~15KB gzipped) added to the HTML.
		inlineStyleThreshold: 6144,
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: ['<all>'],
			},
			platformProxy: {
				configPath: 'wrangler.jsonc',
				persist: true,
			},
		}),
	},
};

export default config;
