/**
 * Media variant selection for the about page, driven by the two generated
 * manifests:
 *
 * - `MEDIA_THUMBS` (scripts/media-thumbs.mjs) — large stills that have a
 *   single `-thumb.avif` variant beside them. Exposed as srcset strings so
 *   phones decode ~1024px instead of 2048px (¼ the memory — the thing that
 *   was OOMing the renderer on fast scrolls).
 * - `ANIMATED_CLIPS` (scripts/animated-avifs.mjs) — animated AVIFs, each of
 *   which also has an AV1 `.mp4` beside it (scripts/clip-videos.mjs). Where
 *   the browser can play AV1 video, clips render as muted looping <video> and
 *   ride the HARDWARE decoder; everywhere else the animated AVIF <img> stays,
 *   exactly as before. Same codec, same bytes — only the decode path changes.
 */
import { ANIMATED_CLIPS } from './animated-clips';
import { MEDIA_THUMBS } from './media-thumbs';
import type { GalleryItem } from '@delightstack/components/media';

function fileName(src: string): string {
	return decodeURIComponent(src.split('/').pop() ?? '').split('?')[0];
}

export function isAnimatedClip(src: string): boolean {
	return ANIMATED_CLIPS.has(fileName(src));
}

/** The AV1 mp4 that lives beside every animated clip. */
export function clipVideoUrl(src: string): string {
	return src.replace(/\.avif$/, '.mp4');
}

/**
 * "<thumb> 1024w, <full> 2048w" when the still has a thumb, otherwise the src
 * unchanged. The string form is accepted directly by the delightstack Gallery
 * `src` field as well as by `<img srcset>`.
 */
export function responsiveSrc(src: string): string {
	const widths = MEDIA_THUMBS.get(fileName(src));
	if (!widths) return src;
	const [full_w, thumb_w] = widths;
	return `${src.replace(/\.avif$/, '-thumb.avif')} ${thumb_w}w, ${src} ${full_w}w`;
}

/** srcset attribute for a plain <img>, or undefined when there is no thumb. */
export function imgSrcset(src: string): string | undefined {
	return MEDIA_THUMBS.has(fileName(src)) ? responsiveSrc(src) : undefined;
}

let av1: boolean | undefined;
/**
 * Can this browser play AV1 video? True in Chromium and Firefox everywhere;
 * Safari only says yes on devices with an AV1 hardware decoder (iPhone 15
 * Pro+, M3+). False during SSR — callers gate the swap behind an effect so
 * server and hydration markup agree.
 */
export function av1VideoSupported(): boolean {
	if (typeof document === 'undefined') return false;
	av1 ??=
		document.createElement('video').canPlayType('video/mp4; codecs="av01.0.05M.08"') !==
		'';
	return av1;
}

/**
 * Upgrade a gallery's items: stills pick up their thumb srcset (always safe),
 * and — when `clips_to_video` — animated clips become `custom` slides playing
 * the mp4, with the animated AVIF kept as the grid-tile poster so thumbnails
 * look exactly as they always did.
 */
export function upgradeGalleryItems(
	items: GalleryItem[],
	clips_to_video: boolean,
): GalleryItem[] {
	return items.map((item) => {
		if (!item || typeof item !== 'object' || !item.src) return item;
		if ((item.type ?? 'image') !== 'image') return item;
		if (isAnimatedClip(item.src)) {
			if (!clips_to_video) return item;
			return {
				...item,
				type: 'custom' as const,
				src: clipVideoUrl(item.src),
				poster: item.src,
			};
		}
		const upgraded = responsiveSrc(item.src);
		return upgraded === item.src ? item : { ...item, src: upgraded };
	});
}
