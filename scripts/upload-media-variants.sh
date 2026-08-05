#!/usr/bin/env bash
# Upload the generated media variants to R2 — the -thumb.avif stills
# (scripts/media-thumbs.mjs) and the animated clips' AV1 .mp4 twins
# (scripts/clip-videos.mjs). Idempotent: each file is HEAD-checked against the
# public CDN first and uploaded only if it is missing or its size differs.
#
#   ./scripts/upload-media-variants.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MEDIA_DIR="$REPO_ROOT/media"
CDN="https://cdn.brianschwabauer.com/media"
BUCKET="brianschwabauer"

cd "$REPO_ROOT"

upload() {
	local name="$1" type="$2"
	local file="$MEDIA_DIR/$name"
	local size remote_size
	size=$(stat -c%s "$file")
	remote_size=$(curl -sIf "$CDN/$name" | tr -d '\r' | awk 'tolower($1)=="content-length:"{print $2}' || true)
	if [ "$remote_size" = "$size" ]; then
		return 0
	fi
	echo "uploading $name ($size bytes)"
	pnpm exec wrangler r2 object put "$BUCKET/media/$name" --file="$file" --content-type="$type" --remote >/dev/null
}

count=0
for f in "$MEDIA_DIR"/*-thumb.avif; do
	upload "$(basename "$f")" "image/avif"
	count=$((count + 1))
done
for f in "$MEDIA_DIR"/*.mp4; do
	upload "$(basename "$f")" "video/mp4"
	count=$((count + 1))
done
echo "checked $count files"
