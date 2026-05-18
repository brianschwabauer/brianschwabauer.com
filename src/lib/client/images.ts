/**
 * Client-side wrappers for the /api/images endpoints.
 * Shared by MediaLibrary, ImagePicker, and the TipTap drop handler.
 */
import type { ImageRecord } from '$lib/types/images';

export type { ImageRecord, ImageVariantInfo, OklchColor } from '$lib/types/images';

export interface ListResult {
	images: ImageRecord[];
	cursor: string | null;
}

export async function listImages(year?: string, cursor?: string): Promise<ListResult> {
	const params = new URLSearchParams();
	if (year) params.set('year', year);
	if (cursor) params.set('cursor', cursor);
	const qs = params.toString();
	const res = await fetch(`/api/images${qs ? `?${qs}` : ''}`);
	if (!res.ok) throw new Error(`Failed to list images (${res.status})`);
	return res.json();
}

export async function uploadImage(file: File, alt?: string): Promise<ImageRecord> {
	const form = new FormData();
	form.append('file', file);
	if (alt) form.append('alt', alt);
	const res = await fetch('/api/images', { method: 'POST', body: form });
	if (!res.ok) {
		const body = await res.json().catch(() => ({}) as { message?: string });
		throw new Error(body.message || `Upload failed (${res.status})`);
	}
	const { image } = (await res.json()) as { image: ImageRecord };
	return image;
}

export async function updateImageAlt(path: string, alt: string): Promise<ImageRecord> {
	const res = await fetch(`/api/images/${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ alt }),
	});
	if (!res.ok) throw new Error(`Update failed (${res.status})`);
	const { image } = (await res.json()) as { image: ImageRecord };
	return image;
}

export async function deleteImage(path: string): Promise<void> {
	const res = await fetch(`/api/images/${path}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

// ── URL helpers ─────────────────────────────────────────────────────────────

export function thumbnailURL(record: ImageRecord): string {
	const variant = record.variants.find((v) => v.name === 'thumbnail') ?? record.variants[0];
	const name = variant?.name ?? 'default';
	return `/cdn/image/${record.path}/${name}`;
}

export function bgStyle(record: ImageRecord): string {
	if (!record.background_color) return '';
	const { l, c, h } = record.background_color;
	return `background-color: oklch(${l} ${c} ${h});`;
}
