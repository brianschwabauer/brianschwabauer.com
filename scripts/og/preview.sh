#!/usr/bin/env bash
# Render one OpenGraph card straight from the local image worker and open it.
#
# This is the loop for design work on the card. It talks to /api/og directly,
# so it needs no blog post, no KV entry, and no main site — just `pnpm dev`
# (or `pnpm dev:images`) running.
#
# Crucially it sends a fresh `version` every run. Cards are cached in R2 under
# that stamp, so hitting /cdn/og/blog/<slug>.png after editing the design
# serves you the OLD card until CARD_VERSION changes; this always renders.
#
#   ./scripts/og/preview.sh
#   ./scripts/og/preview.sh --title "A Much Longer Headline That Wraps"
#   ./scripts/og/preview.sh --cover blog/2026/some-image
#   ./scripts/og/preview.sh --list          # show cover keys available locally
#
# Edit image-worker/src/lib/og.ts, save, re-run — wrangler reloads the worker
# on its own.
set -euo pipefail

WORKER="${IMAGE_WORKER_URL:-http://127.0.0.1:6180}"
title="Fly Closer to the Sun"
date_label="NOVEMBER 2025"
cover=""
out="${TMPDIR:-/tmp}/og-preview.png"

while [ $# -gt 0 ]; do
	case "$1" in
		--title) title="$2"; shift 2 ;;
		--date) date_label="$2"; shift 2 ;;
		# Image path WITHOUT the /default suffix, e.g. blog/2026/sunset.
		--cover) cover="$2"; shift 2 ;;
		--out) out="$2"; shift 2 ;;
		--list)
			echo "Cover keys in the local image worker:"
			curl -fsS "$WORKER/api/images" \
				| grep -o '"path":"[^"]*"' | cut -d'"' -f4 | sort -u
			exit 0 ;;
		-h|--help) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
		*) echo "unknown option: $1" >&2; exit 1 ;;
	esac
done

if ! curl -fsS -o /dev/null "$WORKER/api/images" 2>/dev/null; then
	echo "Image worker is not answering on $WORKER — start it with 'pnpm dev'." >&2
	exit 1
fi

# jq isn't a dependency of this repo, so the body is assembled by hand. Only
# the two free-text fields need escaping, and only for backslash and quote.
escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

cover_json="null"
[ -n "$cover" ] && cover_json="\"$(escape "$cover")/default\""

body=$(printf '{"slug":"preview","version":"preview-%s","title":"%s","date_label":"%s","cover_key":%s}' \
	"$(date +%s%N)" "$(escape "$title")" "$(escape "$date_label")" "$cover_json")

curl -fsS -X POST "$WORKER/api/og" \
	-H 'Content-Type: application/json' \
	-d "$body" \
	-o "$out"

echo "wrote $out"

# Detached, or the viewer holds the terminal until you close the window.
# OG_NO_OPEN=1 skips it entirely (useful when scripting a batch of renders).
if [ -z "${OG_NO_OPEN:-}" ] && command -v xdg-open >/dev/null; then
	(setsid xdg-open "$out" >/dev/null 2>&1 &) || true
fi
