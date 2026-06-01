import type { GalleryItem } from '@delightstack/components/media';

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

export function vttThumbs(slug: string): string {
	return `${MEDIA_BASE}/${slug}/thumbs/thumbs.vtt`;
}

export function imageItem(src: string, alt = '', caption?: string): GalleryItem {
	return {
		type: 'image',
		src: media(src),
		alt,
		name: caption,
		caption,
	};
}

/** Build a custom-type GalleryItem for an HLS video — Gallery renders it via the `custom`
 *  snippet, which the consuming page wires up to the project's video.js-based VideoPlayer.
 *  The slug is stored on `id` (and as `src` so Carousel has a stable key) and re-read inside
 *  the snippet to construct the player. */
export function videoItem(slug: string, title = '', caption?: string): GalleryItem {
	return {
		id: slug,
		type: 'custom',
		src: slug,
		poster: poster(slug),
		alt: title,
		name: title,
		caption: caption ?? title,
		disable_zoom: true,
		disable_swipe: true,
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
