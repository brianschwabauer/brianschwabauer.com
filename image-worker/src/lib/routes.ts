/**
 * Image-route handlers used by the image-worker (image-worker/src/index.ts).
 * In dev, vite proxies /api/images/* and /cdn/image/* to this worker; in prod
 * the main worker forwards via service binding.
 *
 * Bind R2 + IMAGE_PROCESSOR from your environment and call these functions.
 */
import type { R2Bucket } from '@cloudflare/workers-types';
import {
	PREFIX,
	DEFAULT_VARIANT,
	THUMBNAIL_VARIANT,
	allocateUniqueSlug,
	currentYear,
	deserializeRecord,
	imageKey,
	recordFromObject,
	serializeRecord,
	slugifyFilename,
	variantKey,
	type ImageRecord,
	type ImageVariantInfo,
} from './r2';

// Typed loosely on purpose — @cloudflare/workers-types' DurableObjectNamespace
// generic requires a branded DO type which the Container base class doesn't
// expose. The runtime call signature is identical regardless of the param type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ImageEnv {
	R2: R2Bucket;
	IMAGE_PROCESSOR: any;
}

// ── List ────────────────────────────────────────────────────────────────────

export interface ListOptions {
	year?: string;
	cursor?: string;
}

export async function listImages(
	env: ImageEnv,
	options: ListOptions = {},
): Promise<{ images: ImageRecord[]; cursor: string | null }> {
	const year = options.year || currentYear();
	const prefix = `${PREFIX}/${year}/`;

	// `include` is supported at runtime since workers-types v4.20240909; cast
	// to allow it in older type defs we currently pin.
	const result = await env.R2.list({
		prefix,
		cursor: options.cursor,
		limit: 1000,
		include: ['customMetadata', 'httpMetadata'],
	} as Parameters<R2Bucket['list']>[0]);

	const images: ImageRecord[] = [];
	for (const obj of result.objects) {
		// Only keep keys ending in `/default` — that's where we stash the full
		// per-image metadata. Other variant keys (thumbnail, etc.) are skipped.
		if (!obj.key.endsWith(`/${DEFAULT_VARIANT}`)) continue;
		const record = recordFromObject(obj);
		if (record) images.push(record);
	}

	// Sort newest first by updated_at
	images.sort((a, b) => b.updated_at.localeCompare(a.updated_at));

	return { images, cursor: result.truncated ? result.cursor ?? null : null };
}

// ── Get ─────────────────────────────────────────────────────────────────────

export async function getImage(env: ImageEnv, path: string): Promise<ImageRecord | null> {
	const safe = sanitizePath(path);
	if (!safe) return null;
	const key = `${safe}/${DEFAULT_VARIANT}`;
	const obj = await env.R2.head(key);
	if (!obj) return null;
	return deserializeRecord(key, obj.customMetadata as Record<string, string> | undefined);
}

// ── Upload ──────────────────────────────────────────────────────────────────

export interface UploadInput {
	file: File;
	alt?: string;
}

export async function uploadImage(env: ImageEnv, input: UploadInput): Promise<ImageRecord> {
	const year = currentYear();
	const baseSlug = slugifyFilename(input.file.name || 'image');
	const slug = await allocateUniqueSlug(env.R2, year, baseSlug);

	// Call the Container DO directly with the file bytes. We bypass
	// @delightstack/images' processImage() helper because it tries to forward
	// the R2Bucket binding through RPC for watermark image fetching, and R2
	// bindings aren't RPC-serializable. We don't use watermarks, so we don't
	// need to pass the bucket — we just write variants ourselves below.
	const stub = env.IMAGE_PROCESSOR.getByName('image-processor');
	const fileBytes = await input.file.arrayBuffer();
	const result = await stub.process(fileBytes, {
		variants: [
			{ name: DEFAULT_VARIANT, max_dimension: 2048, format: 'avif', quality: 50, fit: 'inside' },
			{ name: THUMBNAIL_VARIANT, max_dimension: 640, format: 'avif', quality: 50, fit: 'cover' },
		],
		compress_original: false,
	});

	// Build the record from the container result.
	const now = new Date().toISOString();
	const variants: ImageVariantInfo[] = result.variants
		.filter((v) => v.name !== 'original')
		.map((v) => ({
			name: v.name,
			width: v.width,
			height: v.height,
			mime_type: v.mime_type,
		}));

	const record: ImageRecord = {
		key: imageKey(year, slug),
		path: imageKey(year, slug),
		year,
		slug,
		file_name: input.file.name || null,
		alt_text: input.alt?.trim() || null,
		mime_type: result.metadata.mime_type,
		width: result.metadata.width,
		height: result.metadata.height,
		aspect_ratio: result.metadata.aspect_ratio,
		thumbhash: result.thumbhash || null,
		background_color: result.metadata.background_color
			? {
					l: result.metadata.background_color.l,
					c: result.metadata.background_color.c,
					h: result.metadata.background_color.h,
				}
			: null,
		accent_color: result.metadata.accent_color
			? {
					l: result.metadata.accent_color.l,
					c: result.metadata.accent_color.c,
					h: result.metadata.accent_color.h,
				}
			: null,
		variants,
		created_at: now,
		updated_at: now,
	};

	// Write each variant to R2. The `default` variant carries the full image
	// record as customMetadata so the media library can list everything with a
	// single R2.list() call.
	await Promise.all(
		result.variants
			.filter((v) => v.name !== 'original')
			.map((variant) => {
				const key = variantKey(year, slug, variant.name);
				const isDefault = variant.name === DEFAULT_VARIANT;
				return env.R2.put(key, variant.data, {
					httpMetadata: {
						contentType: variant.mime_type,
						cacheControl: 'public, max-age=31536000, immutable',
					},
					customMetadata: isDefault
						? serializeRecord(record)
						: { width: String(variant.width), height: String(variant.height) },
				});
			}),
	);

	return record;
}

// ── Update (alt text) ───────────────────────────────────────────────────────

export async function updateImage(
	env: ImageEnv,
	path: string,
	patch: { alt?: string | null },
): Promise<ImageRecord | null> {
	const safe = sanitizePath(path);
	if (!safe) return null;
	const key = `${safe}/${DEFAULT_VARIANT}`;
	const obj = await env.R2.get(key);
	if (!obj) return null;

	const existing = deserializeRecord(key, obj.customMetadata as Record<string, string> | undefined);
	if (!existing) return null;

	const updated: ImageRecord = {
		...existing,
		alt_text: patch.alt === undefined ? existing.alt_text : (patch.alt?.trim() || null),
		updated_at: new Date().toISOString(),
	};

	await env.R2.put(key, obj.body, {
		httpMetadata: {
			contentType: updated.mime_type,
			cacheControl: 'public, max-age=31536000, immutable',
		},
		customMetadata: serializeRecord(updated),
	});

	return updated;
}

// ── Delete ──────────────────────────────────────────────────────────────────

export async function deleteImage(env: ImageEnv, path: string): Promise<boolean> {
	const safe = sanitizePath(path);
	if (!safe) return false;
	// Delete every variant under this prefix
	const list = await env.R2.list({ prefix: `${safe}/` });
	if (list.objects.length === 0) return false;
	await Promise.all(list.objects.map((obj) => env.R2.delete(obj.key)));
	return true;
}

// ── CDN serve ───────────────────────────────────────────────────────────────

const NOT_FOUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f0f0f0"/><text x="200" y="158" text-anchor="middle" fill="#999" font-family="system-ui,sans-serif" font-size="16">Image not found</text></svg>`;

export async function serveImage(env: ImageEnv, request: Request, path: string): Promise<Response> {
	const safe = sanitizePath(path, { allowVariant: true });
	if (!safe) return notFoundResponse();

	const ifNoneMatch = request.headers.get('If-None-Match');
	if (ifNoneMatch) {
		const head = await env.R2.head(safe);
		if (head && ifNoneMatch === head.httpEtag) {
			return new Response(null, { status: 304 });
		}
	}

	const obj = await env.R2.get(safe);
	if (!obj) return notFoundResponse();

	const headers = new Headers();
	headers.set('Content-Type', obj.httpMetadata?.contentType ?? 'application/octet-stream');
	headers.set(
		'Cache-Control',
		obj.httpMetadata?.cacheControl ?? 'public, max-age=31536000, immutable',
	);
	headers.set('ETag', obj.httpEtag);
	headers.set('X-Content-Type-Options', 'nosniff');
	if (obj.size !== undefined) headers.set('Content-Length', String(obj.size));
	if (obj.customMetadata?.width) headers.set('X-Image-Width', obj.customMetadata.width);
	if (obj.customMetadata?.height) headers.set('X-Image-Height', obj.customMetadata.height);

	return new Response(obj.body as unknown as BodyInit, { status: 200, headers });
}

function notFoundResponse(): Response {
	return new Response(NOT_FOUND_SVG, {
		status: 404,
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'no-cache',
			'X-Content-Type-Options': 'nosniff',
		},
	});
}

// ── Path validation ─────────────────────────────────────────────────────────

/**
 * Validate that a caller-supplied path is well-formed and rooted under the
 * blog prefix. Returns the canonical path on success, null on rejection.
 *
 * `allowVariant: true` accepts paths that include the trailing variant segment
 * (used by the CDN). Without it, only the image directory key is allowed.
 */
function sanitizePath(raw: string, { allowVariant = false } = {}): string | null {
	const trimmed = raw.replace(/^\/+|\/+$/g, '');
	if (!trimmed || trimmed.includes('..') || trimmed.includes('//')) return null;
	const parts = trimmed.split('/');
	// Expected: [prefix, year, slug] or [prefix, year, slug, variant]
	if (parts[0] !== PREFIX) return null;
	if (!/^\d{4}$/.test(parts[1] ?? '')) return null;
	if (!parts[2] || !/^[a-z0-9][a-z0-9-]*$/.test(parts[2])) return null;
	if (allowVariant) {
		if (parts.length === 3) return `${trimmed}/${DEFAULT_VARIANT}`;
		if (parts.length === 4 && /^[a-z0-9-]+$/.test(parts[3])) return trimmed;
		return null;
	}
	return parts.length === 3 ? trimmed : null;
}
