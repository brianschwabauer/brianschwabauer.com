/**
 * Upload one file of a client-encoded HLS video into R2 at media/{path}.
 *
 * The admin encodes videos in the browser (src/lib/client/videoEncode.ts) and
 * PUTs each produced file here — playlists, init segments, media segments,
 * poster and thumbnail sprite/VTT. Paths are strictly validated against the
 * media layout produced by the encoder (and scripts/encode.sh) so this can't
 * be used to write arbitrary keys into the bucket.
 */
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_.-]*$/;
// Files allowed inside a media/{slug}/ folder, relative to the slug.
const FILE_PATTERN =
	/^(master\.m3u8|poster\.jpg|thumbs\/(sprite\.jpg|thumbs\.vtt)|(v\d+|audio)\/(playlist\.m3u8|init\.mp4|seg\d+\.m4s))$/;

const CONTENT_TYPES: Record<string, string> = {
	m3u8: 'application/vnd.apple.mpegurl',
	mp4: 'video/mp4',
	m4s: 'video/iso.segment',
	jpg: 'image/jpeg',
	vtt: 'text/vtt',
};

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const PUT: RequestHandler = async ({ request, params, platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	const bucket = platform?.env?.R2;
	if (!bucket) throw error(500, 'R2 not available');

	const raw = params.path ?? '';
	const slash = raw.indexOf('/');
	const slug = slash === -1 ? '' : raw.slice(0, slash);
	const file = slash === -1 ? '' : raw.slice(slash + 1);
	if (!SLUG_PATTERN.test(slug) || !FILE_PATTERN.test(file)) {
		throw error(400, `Invalid media path: ${raw}`);
	}

	const ext = file.slice(file.lastIndexOf('.') + 1);
	const body = await request.arrayBuffer();
	await bucket.put(`media/${slug}/${file}`, body, {
		httpMetadata: {
			contentType: CONTENT_TYPES[ext],
			// Segments/init files are immutable once written; playlists, poster
			// and thumbs could conceivably be regenerated, so cache them less
			// aggressively.
			cacheControl:
				ext === 'm4s' || ext === 'mp4'
					? 'public, max-age=31536000, immutable'
					: 'public, max-age=3600',
		},
	});
	return json({ ok: true, key: `media/${slug}/${file}` });
};
