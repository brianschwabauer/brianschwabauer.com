/**
 * Image-processing worker. Handles upload, listing, deletion, and CDN serving
 * for blog images. The actual @delightstack/images Container DO lives here
 * (see wrangler.images.toml). The main brianschwabauer worker calls into this
 * one via the IMAGE_PROCESSOR service binding (in prod) or via vite's HTTP
 * proxy on :8787 (in dev).
 *
 * Auth: in dev this worker is only reachable from localhost. In prod the main
 * worker checks `locals.session.role === 'admin'` before forwarding, so this
 * worker can trust its caller for admin endpoints.
 */
import {
	deleteImage,
	getImage,
	listImages,
	serveImage,
	updateImage,
	uploadImage,
	type ImageEnv,
} from './lib/routes';

// The Container DO is re-exported under its original name so wrangler's
// [[durable_objects.bindings]] resolves it. The upstream class now calls
// startAndWaitForPorts() itself, so we don't need a local wrapper anymore.
//
// Note the `/worker` subpath import: the package keeps this DO class out of
// its main barrel because the class imports `cloudflare:workers`, which
// otherwise breaks any non-worker bundler that tries to load the package.
export { ImageProcessorContainer } from '@delightstack/images/worker';

export default {
	async fetch(request: Request, env: ImageEnv): Promise<Response> {
		const url = new URL(request.url);
		const { pathname } = url;

		try {
			// ── CDN serving ──────────────────────────────────────────────
			if (pathname.startsWith('/cdn/image/')) {
				if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });
				const path = pathname.slice('/cdn/image/'.length);
				return serveImage(env, request, path);
			}

			// ── List + upload ────────────────────────────────────────────
			if (pathname === '/api/images' || pathname === '/api/images/') {
				if (request.method === 'GET') {
					const year = url.searchParams.get('year') ?? undefined;
					const cursor = url.searchParams.get('cursor') ?? undefined;
					const result = await listImages(env, { year, cursor });
					return jsonResponse(result);
				}
				if (request.method === 'POST') {
					const form = await request.formData();
					const file = form.get('file');
					const alt = (form.get('alt') as string | null) ?? undefined;
					if (!(file instanceof File) || file.size === 0) {
						return jsonResponse({ message: 'No file provided' }, 400);
					}
					const record = await uploadImage(env, { file, alt });
					return jsonResponse({ image: record });
				}
				return new Response('Method Not Allowed', { status: 405 });
			}

			// ── Per-image ────────────────────────────────────────────────
			if (pathname.startsWith('/api/images/')) {
				const path = pathname.slice('/api/images/'.length);
				if (request.method === 'GET') {
					const record = await getImage(env, path);
					if (!record) return jsonResponse({ message: 'Not found' }, 404);
					return jsonResponse({ image: record });
				}
				if (request.method === 'PATCH') {
					const body = (await request.json().catch(() => ({}))) as { alt?: string | null };
					const updated = await updateImage(env, path, { alt: body.alt });
					if (!updated) return jsonResponse({ message: 'Not found' }, 404);
					return jsonResponse({ image: updated });
				}
				if (request.method === 'DELETE') {
					const ok = await deleteImage(env, path);
					if (!ok) return jsonResponse({ message: 'Not found' }, 404);
					return jsonResponse({ ok: true });
				}
				return new Response('Method Not Allowed', { status: 405 });
			}

			return new Response('Not Found', { status: 404 });
		} catch (err) {
			console.error('image-worker error:', err);
			const message = err instanceof Error ? err.message : 'Internal error';
			return jsonResponse({ message }, 500);
		}
	},
};

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}
