/**
 * List HLS videos stored in the R2 bucket under the media/ prefix.
 *
 * Videos live at media/{slug}/ — one folder per video containing master.m3u8,
 * v{n}/ rendition playlists + segments, poster.jpg and thumbs/ (see
 * scripts/encode.sh and src/lib/client/videoEncode.ts). A delimited list of
 * media/ gives one prefix per video, so listing is a single R2 call per page
 * regardless of how many segment files each video has.
 */
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const PREFIX = 'media/';

function isAdmin(locals: App.Locals): boolean {
	return (locals.session?.user as { role?: string } | undefined)?.role === 'admin';
}

export const GET: RequestHandler = async ({ platform, locals }) => {
	if (!isAdmin(locals)) throw error(403, 'Unauthorized');
	const bucket = platform?.env?.R2;
	if (!bucket) throw error(500, 'R2 not available');

	const slugs: string[] = [];
	let cursor: string | undefined;
	do {
		const page = await bucket.list({ prefix: PREFIX, delimiter: '/', cursor });
		for (const prefix of page.delimitedPrefixes) {
			const slug = prefix.slice(PREFIX.length).replace(/\/$/, '');
			if (slug) slugs.push(slug);
		}
		cursor = page.truncated ? page.cursor : undefined;
	} while (cursor);

	// Slugs lead with an ISO date (e.g. 2015-04-22_legacy), so a reverse
	// lexicographic sort is newest-first.
	slugs.sort((a, b) => b.localeCompare(a));
	return json({ videos: slugs.map((slug) => ({ slug })) });
};
