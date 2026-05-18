/**
 * Shared image record types — usable from both client and server code.
 * (Server-only logic lives in $lib/server/images.ts.)
 */

export interface OklchColor {
	l: number;
	c: number;
	h: number;
}

export interface ImageVariantInfo {
	name: string;
	width: number;
	height: number;
	mime_type: string;
}

export interface ImageRecord {
	/** Full R2 key prefix without the variant suffix, e.g. "blog/2026/sunset" */
	key: string;
	/** Path used in URLs (same as `key`, kept for clarity at call sites) */
	path: string;
	/** Year folder, e.g. "2026" */
	year: string;
	/** Filename slug (no extension), e.g. "sunset" */
	slug: string;
	file_name: string | null;
	alt_text: string | null;
	mime_type: string;
	width: number;
	height: number;
	aspect_ratio: number;
	thumbhash: string | null;
	background_color: OklchColor | null;
	accent_color: OklchColor | null;
	variants: ImageVariantInfo[];
	created_at: string;
	updated_at: string;
}
