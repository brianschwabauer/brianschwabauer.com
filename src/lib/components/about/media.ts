import type { GalleryItem } from '@delightstack/components/media';
import { MEDIA_DIMENSIONS } from './media-dimensions';

export const MEDIA_BASE = 'https://cdn.brianschwabauer.com/media';

export function media(name: string): string {
	return name.startsWith('http') ? name : `${MEDIA_BASE}/${name}`;
}

export function hls(slug: string): string {
	return `${MEDIA_BASE}/${slug}/master.m3u8`;
}

export function poster(slug: string): string {
	return `${MEDIA_BASE}/${slug}/poster.jpg`;
}

/** Look up the real intrinsic dimensions for a CDN filename or video slug.
 *  Falls back to the bare filename when a full CDN URL is passed. */
function dimsFor(key: string): { width?: number; height?: number } {
	const stripped = key.startsWith(`${MEDIA_BASE}/`)
		? key.slice(MEDIA_BASE.length + 1)
		: key;
	const dims = MEDIA_DIMENSIONS[key] ?? MEDIA_DIMENSIONS[stripped];
	return dims ? { width: dims[0], height: dims[1] } : {};
}

export function imageItem(src: string, alt = '', caption?: string): GalleryItem {
	return {
		type: 'image',
		src: media(src),
		...dimsFor(src),
		alt,
		name: caption,
		caption,
	};
}

/** Build a video GalleryItem. Gallery's built-in Video renderer plays the HLS stream
 *  natively (lazy-loading hls.js where the browser lacks native HLS); the poster doubles
 *  as the thumbnail in the grid. width/height come from the poster so masonry can pack it. */
export function videoItem(slug: string, title = '', caption?: string): GalleryItem {
	return {
		id: slug,
		type: 'video',
		src: hls(slug),
		poster: poster(slug),
		...dimsFor(slug),
		alt: title,
		name: title,
		caption: caption ?? title,
	};
}

export function imageItems(
	items: Array<string | { src: string; caption?: string; alt?: string }>,
): GalleryItem[] {
	return items.map((item) =>
		typeof item === 'string'
			? imageItem(item)
			: imageItem(item.src, item.alt ?? item.caption ?? '', item.caption),
	);
}
