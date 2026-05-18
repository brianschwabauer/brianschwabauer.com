/**
 * R2-only image storage for the blog.
 *
 * Key layout:   blog/{year}/{slug}/{variant}
 * Variants:     default (2048px AVIF), thumbnail (640px AVIF)
 *
 * The `default` variant's R2 customMetadata holds the entire image record so
 * the media library can list everything with a single R2.list() call. We keep
 * customMetadata small (well under R2's ~2KB limit) by storing variant info as
 * a compact JSON array and OKLCH colors as space-separated triples.
 */
import type { R2Bucket, R2Object, R2ObjectBody } from '@cloudflare/workers-types';
// Types are shared with the main app via a relative import (no $lib alias here —
// this worker is built with its own wrangler config, not SvelteKit).
import type { ImageRecord, ImageVariantInfo, OklchColor } from '../../../src/lib/types/images';

export type { ImageRecord, ImageVariantInfo, OklchColor };

export const PREFIX = 'blog';
export const DEFAULT_VARIANT = 'default';
export const THUMBNAIL_VARIANT = 'thumbnail';
export const ALL_VARIANTS = [DEFAULT_VARIANT, THUMBNAIL_VARIANT] as const;

// ── slug / key helpers ──────────────────────────────────────────────────────

export function slugifyFilename(input: string): string {
	const noExt = input.replace(/\.[^.]+$/, '');
	const slug = noExt
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
	return slug || 'image';
}

export function currentYear(): string {
	return String(new Date().getUTCFullYear());
}

export function imageKey(year: string, slug: string): string {
	return `${PREFIX}/${year}/${slug}`;
}

export function variantKey(year: string, slug: string, variant: string): string {
	return `${imageKey(year, slug)}/${variant}`;
}

/**
 * Allocate a unique slug for the given year by probing R2 for collisions.
 * Tries `slug`, `slug-2`, `slug-3`, ... up to a small ceiling.
 */
export async function allocateUniqueSlug(
	bucket: R2Bucket,
	year: string,
	baseSlug: string,
): Promise<string> {
	for (let i = 0; i < 100; i++) {
		const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
		const head = await bucket.head(variantKey(year, candidate, DEFAULT_VARIANT));
		if (!head) return candidate;
	}
	// Extremely unlikely fallback
	return `${baseSlug}-${Date.now()}`;
}

// ── customMetadata serialization ────────────────────────────────────────────
// R2 customMetadata values must be strings; we keep them short.

function colorToString(c: OklchColor | null | undefined): string | undefined {
	if (!c) return undefined;
	return `${c.l.toFixed(4)} ${c.c.toFixed(4)} ${c.h.toFixed(2)}`;
}

function stringToColor(s: string | undefined): OklchColor | null {
	if (!s) return null;
	const [l, c, h] = s.split(' ').map(Number);
	if (!Number.isFinite(l) || !Number.isFinite(c) || !Number.isFinite(h)) return null;
	return { l, c, h };
}

export interface SerializedRecord {
	customMetadata: Record<string, string>;
}

export function serializeRecord(
	record: Omit<ImageRecord, 'key' | 'path' | 'year' | 'slug'>,
): Record<string, string> {
	const meta: Record<string, string> = {
		file_name: record.file_name ?? '',
		alt_text: record.alt_text ?? '',
		caption: record.caption ?? '',
		mime_type: record.mime_type,
		width: String(record.width),
		height: String(record.height),
		aspect_ratio: record.aspect_ratio.toFixed(6),
		thumbhash: record.thumbhash ?? '',
		variants: JSON.stringify(record.variants),
		created_at: record.created_at,
		updated_at: record.updated_at,
	};
	const bg = colorToString(record.background_color);
	if (bg) meta.background_color = bg;
	const accent = colorToString(record.accent_color);
	if (accent) meta.accent_color = accent;
	return meta;
}

export function deserializeRecord(
	key: string,
	customMetadata: Record<string, string> | undefined,
): ImageRecord | null {
	if (!customMetadata) return null;
	// key is like "blog/2026/sunset/default" — strip the variant suffix
	const parts = key.split('/');
	if (parts.length < 4 || parts[0] !== PREFIX) return null;
	const variant = parts[parts.length - 1];
	if (variant !== DEFAULT_VARIANT) return null;
	const slug = parts[parts.length - 2];
	const year = parts[parts.length - 3];

	let variants: ImageVariantInfo[] = [];
	try {
		const parsed = JSON.parse(customMetadata.variants ?? '[]');
		if (Array.isArray(parsed)) variants = parsed;
	} catch {
		// ignore
	}

	const width = Number(customMetadata.width);
	const height = Number(customMetadata.height);
	const aspect_ratio = Number(customMetadata.aspect_ratio);

	if (!Number.isFinite(width) || !Number.isFinite(height)) return null;

	return {
		key: `${PREFIX}/${year}/${slug}`,
		path: `${PREFIX}/${year}/${slug}`,
		year,
		slug,
		file_name: customMetadata.file_name || null,
		alt_text: customMetadata.alt_text || null,
		caption: customMetadata.caption || null,
		mime_type: customMetadata.mime_type || 'image/avif',
		width,
		height,
		aspect_ratio: Number.isFinite(aspect_ratio) ? aspect_ratio : width / height,
		thumbhash: customMetadata.thumbhash || null,
		background_color: stringToColor(customMetadata.background_color),
		accent_color: stringToColor(customMetadata.accent_color),
		variants,
		created_at: customMetadata.created_at || new Date().toISOString(),
		updated_at: customMetadata.updated_at || new Date().toISOString(),
	};
}

export function recordFromObject(obj: R2Object | R2ObjectBody): ImageRecord | null {
	return deserializeRecord(obj.key, obj.customMetadata as Record<string, string> | undefined);
}

// ── URL helpers ─────────────────────────────────────────────────────────────

/**
 * Build the public CDN URL for a given image variant, including embedded
 * metadata as query params (alt, dimensions, thumbhash, background color).
 * The CDN endpoint ignores query params when serving — they're carried purely
 * so the saved blog HTML doesn't need a DB/R2 lookup at render time.
 */
export function imageURL(record: ImageRecord, variant = DEFAULT_VARIANT): string {
	const params = new URLSearchParams();
	if (record.alt_text) params.set('alt', record.alt_text);
	params.set('w', String(record.width));
	params.set('h', String(record.height));
	if (record.thumbhash) params.set('hash', record.thumbhash);
	if (record.background_color) {
		const { l, c, h } = record.background_color;
		params.set('bg', `${l.toFixed(3)}_${c.toFixed(3)}_${h.toFixed(1)}`);
	}
	if (record.file_name) params.set('name', record.file_name);
	const qs = params.toString();
	return `/cdn/image/${record.path}/${variant}${qs ? `?${qs}` : ''}`;
}

export function srcsetFor(record: ImageRecord): string {
	return record.variants
		.slice()
		.sort((a, b) => a.width - b.width)
		.map((v) => `/cdn/image/${record.path}/${v.name} ${v.width}w`)
		.join(', ');
}
