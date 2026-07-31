/**
 * Client-side wrappers for the /api/videos endpoints, plus slug/name helpers
 * for HLS videos stored under the media/ R2 prefix.
 *
 * Shared by VideoLibrary and the client-side encoder (videoEncode.ts).
 */

/** Where the public CDN serves the media/ R2 prefix from. Matches BlogVideo. */
export const MEDIA_CDN_BASE = 'https://cdn.brianschwabauer.com/media';

export interface VideoRecord {
	/** Folder name under media/, e.g. "2011-03-01_exposure". */
	slug: string;
	/** Human-readable name derived from the slug, e.g. "exposure". */
	name: string;
}

export function videoPosterURL(slug: string): string {
	return `${MEDIA_CDN_BASE}/${encodeURIComponent(slug)}/poster.jpg`;
}

export function videoMasterURL(slug: string): string {
	return `${MEDIA_CDN_BASE}/${encodeURIComponent(slug)}/master.m3u8`;
}

/**
 * "2011-03-01_exposure" → "exposure": drop the leading date the encode
 * pipeline bakes into slugs and read underscores as spaces.
 */
export function humanizeVideoSlug(slug: string): string {
	const name = slug
		.replace(/^\d{4}-\d{2}-\d{2}[_-]*/, '')
		.replace(/_+/g, ' ')
		.trim();
	return name || slug.replace(/_+/g, ' ');
}

/**
 * Mirror of scripts/encode.sh `slugify`: strip the extension, lowercase,
 * collapse " - " runs to "-", spaces to underscores, drop anything outside
 * [a-z0-9_.-] and collapse repeated underscores.
 */
export function slugifyVideoFilename(fileName: string): string {
	const slug = fileName
		.replace(/\.[^.]+$/, '')
		.toLowerCase()
		.replace(/ *- */g, '-')
		.replace(/ /g, '_')
		.replace(/[^a-z0-9_.-]/g, '')
		.replace(/_+/g, '_')
		.replace(/^[_.-]+|[_.-]+$/g, '');
	return slug || 'video';
}

export async function listVideos(): Promise<VideoRecord[]> {
	const res = await fetch('/api/videos');
	if (!res.ok) throw new Error(`Failed to list videos (${res.status})`);
	const { videos } = (await res.json()) as { videos: { slug: string }[] };
	return videos.map(({ slug }) => ({ slug, name: humanizeVideoSlug(slug) }));
}

/** PUT one produced file of an encoded video to R2 via /api/videos. */
export async function uploadVideoFile(
	slug: string,
	path: string,
	data: ArrayBuffer | Blob,
): Promise<void> {
	const res = await fetch(`/api/videos/${encodeURIComponent(slug)}/${path}`, {
		method: 'PUT',
		body: data,
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}) as { message?: string });
		throw new Error(body.message || `Upload of ${path} failed (${res.status})`);
	}
}
