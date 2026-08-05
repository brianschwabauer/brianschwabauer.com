// Encodes a looping AV1 MP4 beside every animated AVIF in media/ (same
// basename, .mp4). The mp4 is what actually plays in browsers that can
// hardware-decode AV1 video — the animated AVIF stays as the fallback for the
// rest, so nothing is deleted or replaced. Skips files whose mp4 already
// exists and is newer than the source. Run after adding new clips (after
// scripts/animated-avifs.mjs, which this reads):
//
//   node scripts/clip-videos.mjs
//
// Animated AVIFs carry TWO video streams — a one-frame cover image first,
// then the animation track — so the LAST video stream is the one encoded;
// picking the default gives a one-frame video.
import { existsSync, statSync, readFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { cpus } from 'node:os';

const run = promisify(execFile);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const media_dir = join(root, 'media');

// Parse the generated manifest as text — importing .ts from .mjs depends on
// the running Node's type-stripping support.
const manifest = readFileSync(
	join(root, 'src/lib/components/about/animated-clips.ts'),
	'utf8',
);
const ANIMATED_CLIPS = [...manifest.matchAll(/"([^"]+\.avif)"/g)].map((m) => m[1]);

// Starfield thumbs (-thumb.avif) animate through the hero's own WebCodecs
// painter and never render as page clips — no mp4 needed.
const clips = [...ANIMATED_CLIPS].filter((n) => !n.endsWith('-thumb.avif'));

const JOBS = Math.max(2, Math.floor(cpus().length / 4));
let done = 0;
let skipped = 0;
let failed = 0;

async function encode(name) {
	const src = join(media_dir, name);
	const out = src.replace(/\.avif$/, '.mp4');
	if (existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs) {
		skipped++;
		return;
	}
	// Which video stream is the animation? The last one. (Probing is cheaper
	// than a failed encode when a future file has only one stream.)
	const probe = await run('ffprobe', [
		'-v',
		'error',
		'-select_streams',
		'v',
		'-show_entries',
		'stream=index',
		'-of',
		'csv=p=0',
		src,
	]);
	const n_streams = probe.stdout.trim().split('\n').filter(Boolean).length;
	await run('ffmpeg', [
		'-hide_banner',
		'-loglevel',
		'error',
		'-y',
		'-i',
		src,
		'-map',
		`0:v:${Math.max(0, n_streams - 1)}`,
		'-an',
		'-c:v',
		'libsvtav1',
		'-preset',
		'5',
		'-crf',
		'34',
		'-pix_fmt',
		'yuv420p',
		'-vf',
		'scale=ceil(iw/2)*2:ceil(ih/2)*2',
		'-movflags',
		'+faststart',
		out,
	]);
	done++;
	if (done % 25 === 0) console.log(`${done} encoded…`);
}

const queue = [...clips];
await Promise.all(
	Array.from({ length: JOBS }, async () => {
		let name;
		while ((name = queue.shift())) {
			try {
				await encode(name);
			} catch (err) {
				failed++;
				console.error(`FAILED ${name}: ${err.stderr?.slice(0, 300) || err.message}`);
			}
		}
	}),
);
console.log(`done: ${done} encoded, ${skipped} up to date, ${failed} failed`);
