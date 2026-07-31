/**
 * Client-side HLS encoding with MediaBunny — the browser equivalent of
 * scripts/encode.sh, so videos can be published from the admin UI without a
 * command line.
 *
 * Produces the same media/{slug}/ layout the script does:
 *   master.m3u8                    master playlist (all renditions)
 *   v0/playlist.m3u8               top rendition (source height, capped 1080p)
 *   v0/init.mp4  v0/seg0000.m4s…   fMP4 init + 6s segments
 *   v1/…                           480p rendition (only when source ≥ 720p)
 *   audio/…                        AAC audio playlist (EXT-X-MEDIA rendition)
 *   poster.jpg                     frame at 10% of the duration
 *   thumbs/sprite.jpg + thumbs.vtt scrub-preview sprite sheet
 *
 * Every produced file is handed to the caller's `upload` callback as soon as
 * it is finalized, so uploads overlap encoding and nothing large accumulates
 * in memory (each segment is only a few seconds of video).
 */
import {
	ALL_FORMATS,
	BlobSource,
	BufferTarget,
	CanvasSink,
	CmafOutputFormat,
	Conversion,
	HlsOutputFormat,
	Input,
	Output,
	PathedTarget,
} from 'mediabunny';
import type { InputVideoTrack } from 'mediabunny';

const SEGMENT_SECONDS = 6;
const THUMB_COLS = 10;
const THUMB_WIDTH = 160;

export interface VideoEncodeProgress {
	phase: 'preparing' | 'stills' | 'encoding' | 'finishing';
	/** Encoding progress, 0..1. */
	progress: number;
	filesUploaded: number;
	filesStarted: number;
}

export interface EncodeVideoOptions {
	/** Called with each produced file, path relative to the media/{slug}/ folder. */
	upload: (path: string, data: ArrayBuffer | Blob) => Promise<void>;
	onProgress?: (p: VideoEncodeProgress) => void;
}

export interface EncodeVideoResult {
	duration: number;
	/** Rendition heights actually encoded, top first. */
	heights: number[];
	filesUploaded: number;
}

/** Mirrors encode.sh bitrate_for_height (maxrate column), in bits/second. */
function bitrateForHeight(h: number): number {
	if (h >= 1080) return 4_500_000;
	if (h >= 720) return 2_800_000;
	if (h >= 480) return 1_400_000;
	if (h >= 360) return 900_000;
	return 600_000;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const even = (v: number) => Math.round(v / 2) * 2;

function vttTime(t: number): string {
	const s = Math.floor(t);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}.000`;
}

async function canvasToJpeg(
	canvas: HTMLCanvasElement | OffscreenCanvas,
	quality: number,
): Promise<Blob> {
	if (typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
		return canvas.convertToBlob({ type: 'image/jpeg', quality });
	}
	return new Promise((resolve, reject) => {
		(canvas as HTMLCanvasElement).toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode JPEG'))),
			'image/jpeg',
			quality,
		);
	});
}

export async function encodeVideoToHls(
	file: Blob,
	options: EncodeVideoOptions,
): Promise<EncodeVideoResult> {
	if (typeof VideoEncoder === 'undefined') {
		throw new Error('This browser does not support video encoding (WebCodecs).');
	}

	// ── upload plumbing ──────────────────────────────────────────────────────
	// Files are queued the moment they're finalized; failures are recorded (not
	// thrown from the queue) so the encode loop can cancel cleanly and rethrow.
	const pending: Promise<void>[] = [];
	let filesStarted = 0;
	let filesUploaded = 0;
	let uploadError: Error | null = null;
	let phase: VideoEncodeProgress['phase'] = 'preparing';
	let progress = 0;

	const emit = () =>
		options.onProgress?.({ phase, progress, filesUploaded, filesStarted });

	function queueUpload(path: string, data: ArrayBuffer | Blob) {
		filesStarted++;
		emit();
		pending.push(
			options.upload(path, data).then(
				() => {
					filesUploaded++;
					emit();
				},
				(err) => {
					uploadError ??= err instanceof Error ? err : new Error(String(err));
				},
			),
		);
	}

	const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
	try {
		// ── probe ──────────────────────────────────────────────────────────────
		emit();
		const videoTrack = await input.getPrimaryVideoTrack();
		if (!videoTrack) throw new Error('No video track found in this file.');
		const audioTrack = await input.getPrimaryAudioTrack();
		const duration = await input.computeDuration();
		const srcW = videoTrack.displayWidth;
		const srcH = videoTrack.displayHeight;

		// Source bitrate cap — like encode.sh, never encode above the source's
		// bitrate: the output can't add information, only preserve noise.
		let srcBitrate = Infinity;
		try {
			const stats = await videoTrack.computePacketStats(200);
			if (stats.averageBitrate > 0) srcBitrate = stats.averageBitrate;
		} catch {
			// stats are an optimization; encode with the table bitrates
		}

		const topHeight = even(Math.min(srcH, 1080));
		const heights = topHeight >= 720 ? [topHeight, 480] : [topHeight];

		// ── poster + scrub thumbnails (before the heavy encode) ───────────────
		if (duration >= 4) {
			phase = 'stills';
			emit();
			await generateStills(videoTrack, srcW, srcH, duration, queueUpload);
		}

		// ── HLS encode ─────────────────────────────────────────────────────────
		phase = 'encoding';
		emit();

		// Map mediabunny's playlist numbering onto the encode.sh folder layout:
		// video rendition playlists → v0/, v1/…; the audio playlist → audio/.
		// Memoized per playlist index so every path callback agrees.
		const playlistDirs = new Map<number, string>();
		let videoPlaylistCount = 0;
		const dirFor = (info: { n: number; tracks: { type: string }[] }) => {
			let dir = playlistDirs.get(info.n);
			if (dir === undefined) {
				const hasVideo = info.tracks.some((t) => t.type === 'video');
				dir = hasVideo ? `v${videoPlaylistCount++}` : 'audio';
				playlistDirs.set(info.n, dir);
			}
			return dir;
		};

		const output = new Output({
			format: new HlsOutputFormat({
				segmentFormat: new CmafOutputFormat(),
				targetDuration: SEGMENT_SECONDS,
				getPlaylistPath: (info) => `${dirFor(info)}/playlist.m3u8`,
				// Init/segment paths are relative to their playlist's folder.
				getInitPath: () => 'init.mp4',
				getSegmentPath: (info) => `seg${String(info.n - 1).padStart(4, '0')}.m4s`,
			}),
			target: new PathedTarget(
				'master.m3u8',
				({ path }) =>
					new BufferTarget({ onFinalize: (buffer) => queueUpload(path, buffer) }),
			),
		});

		const conversion = await Conversion.init({
			input,
			output,
			video: heights.map((h) => ({
				codec: 'avc' as const,
				height: h,
				bitrate: Math.round(Math.min(bitrateForHeight(h), srcBitrate)),
				// Key frame every segment length so segment cuts land on schedule
				// (also forces a transcode, which we want — HLS needs aligned GOPs).
				keyFrameInterval: SEGMENT_SECONDS,
			})),
			audio: audioTrack
				? {
						codec: 'aac' as const,
						bitrate: 128_000,
						numberOfChannels: 2,
						sampleRate: 48_000,
					}
				: { discard: true },
			showWarnings: false,
		});

		if (
			!conversion.isValid ||
			conversion.discardedTracks.some((d) => d.track === videoTrack)
		) {
			const reasons = conversion.discardedTracks.map((d) => d.reason).join(', ');
			throw new Error(
				`This video can't be encoded in the browser${reasons ? ` (${reasons})` : ''}.`,
			);
		}

		conversion.onProgress = (p) => {
			progress = p;
			emit();
			// An upload already failed — stop burning CPU on a doomed encode.
			if (uploadError) void conversion.cancel();
		};
		try {
			await conversion.execute();
		} catch (err) {
			if (uploadError) throw uploadError;
			throw err;
		}

		phase = 'finishing';
		emit();
		await Promise.all(pending);
		if (uploadError) throw uploadError;

		return { duration, heights, filesUploaded };
	} finally {
		input.dispose();
	}
}

/** Poster frame + scrub-thumbnail sprite/VTT, mirroring encode.sh generate_thumbs. */
async function generateStills(
	videoTrack: InputVideoTrack,
	srcW: number,
	srcH: number,
	duration: number,
	queueUpload: (path: string, data: Blob) => void,
): Promise<void> {
	// Poster: full-size frame at 10% in.
	const posterSink = new CanvasSink(videoTrack);
	const poster = await posterSink.getCanvas(duration / 10);
	if (poster) queueUpload('poster.jpg', await canvasToJpeg(poster.canvas, 0.85));

	// Sprite sheet: ~200 thumbs max, one every 2–10s, 10 per row, 160px wide.
	// Whole seconds like encode.sh, so the last cue never ends up zero-length.
	const durS = Math.floor(duration);
	const interval = clamp(Math.floor(durS / 200), 2, 10);
	const total = Math.max(1, Math.ceil(durS / interval));
	const rows = Math.ceil(total / THUMB_COLS);
	const tw = THUMB_WIDTH;
	const th = even((srcH * tw) / srcW);

	const sink = new CanvasSink(videoTrack, { width: tw, height: th, fit: 'fill' });
	const sprite = document.createElement('canvas');
	sprite.width = THUMB_COLS * tw;
	sprite.height = rows * th;
	const ctx = sprite.getContext('2d');
	if (!ctx) throw new Error('Could not create canvas context for thumbnails');
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, sprite.width, sprite.height);

	const timestamps = Array.from({ length: total }, (_, i) => i * interval);
	let i = 0;
	for await (const wrapped of sink.canvasesAtTimestamps(timestamps)) {
		if (wrapped) {
			ctx.drawImage(
				wrapped.canvas,
				(i % THUMB_COLS) * tw,
				Math.floor(i / THUMB_COLS) * th,
				tw,
				th,
			);
		}
		i++;
	}
	queueUpload('thumbs/sprite.jpg', await canvasToJpeg(sprite, 0.75));

	const lines = ['WEBVTT', ''];
	for (let n = 0; n < total; n++) {
		const start = n * interval;
		const end = Math.min(start + interval, durS);
		const x = (n % THUMB_COLS) * tw;
		const y = Math.floor(n / THUMB_COLS) * th;
		lines.push(
			`${vttTime(start)} --> ${vttTime(end)}`,
			`sprite.jpg#xywh=${x},${y},${tw},${th}`,
			'',
		);
	}
	queueUpload('thumbs/thumbs.vtt', new Blob([lines.join('\n')], { type: 'text/vtt' }));
}
