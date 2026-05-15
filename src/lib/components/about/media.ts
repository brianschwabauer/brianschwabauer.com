export const MEDIA_BASE = 'https://cdn.brianschwabauer.com/media';

export function media(name: string): string {
	return `${MEDIA_BASE}/${name}`;
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
