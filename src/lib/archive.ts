import type { GalleryItem } from '@delightstack/components/media';

/**
 * Types + helpers for the private /archive page.
 *
 * The archive index itself is NEVER committed to git — it lives as a single
 * JSON blob in Cloudflare KV (key `/archive.json`) and is only read
 * server-side after an auth check, so private project titles/descriptions
 * never appear in the repo or in unauthenticated responses.
 */

export const ARCHIVE_KEY = '/archive.json';
export const ARCHIVE_CDN_BASE = 'https://cdn.brianschwabauer.com/media';

export interface ArchivePhoto {
	/** Media key under media/, e.g. "2014-06-04_what_makes_us_human-bts_....avif" */
	key: string;
	/** Key of a small `-thumb` variant, when one exists. */
	thumb?: string | null;
	/**
	 * Loose .mp4 files are short clips, .mp3 files are audio artefacts
	 * (played through the video renderer), everything else is an image.
	 */
	kind?: 'image' | 'clip' | 'audio';
	caption?: string;
}

export interface ArchiveEntry {
	/** Stable kebab-case id, used for the `?media=` deep link. */
	id: string;
	type: 'film' | 'photos';
	title: string;
	/** YYYY-MM-DD */
	date: string;
	description: string;
	/** Media key of the card thumbnail (poster.jpg for films). */
	thumb: string;
	/** Films only: the HLS dir slug under media/. */
	video?: string;
	/** Photo entries only. */
	photos?: ArchivePhoto[];
	/** Ids of sibling entries for the same project. */
	related?: string[];
	/** public = referenced in committed source; private = archive-only. */
	visibility?: 'public' | 'private';
	metadata_source?: 'homepage' | 'generated';
}

export interface ArchiveIndex {
	updated_at: number;
	entries: ArchiveEntry[];
}

export function archiveMediaUrl(key: string): string {
	return `${ARCHIVE_CDN_BASE}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** Card thumbnail URL — prefers the entry's own thumb key. */
export function archiveThumbUrl(entry: ArchiveEntry): string {
	return archiveMediaUrl(entry.thumb);
}

/** Build the lightbox items for one entry: a single autoplaying film, or the photo set. */
export function archiveGalleryItems(entry: ArchiveEntry): GalleryItem[] {
	if (entry.type === 'film' && entry.video) {
		return [
			{
				type: 'video',
				src: `${ARCHIVE_CDN_BASE}/${entry.video}/master.m3u8`,
				poster: `${ARCHIVE_CDN_BASE}/${entry.video}/poster.jpg`,
				caption: `${entry.title} (${entry.date})`,
				alt: entry.title,
			},
		];
	}
	return (entry.photos ?? []).map((photo) => ({
		// A native <video> element plays audio-only .mp3 sources fine, so
		// 'audio' items ride the video renderer rather than needing a new type.
		type:
			photo.kind === 'clip' || photo.kind === 'audio'
				? ('video' as const)
				: ('image' as const),
		src: archiveMediaUrl(photo.key),
		caption: photo.caption || undefined,
		alt: photo.caption || entry.title,
	}));
}
