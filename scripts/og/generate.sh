#!/usr/bin/env bash
# Regenerate static/og-default.png — the site-wide OpenGraph share card.
#
# The card is a build-time artifact, not a runtime one: it never changes per
# page, so generating it here and committing the PNG beats paying for an
# edge render on every crawl. Blog posts with a cover image use that instead
# (see src/lib/components/Seo.svelte); this is the fallback for everything else.
#
# Fonts: the brand faces are self-hosted as .woff2 in static/fonts/, and
# FreeType reads WOFF2 directly (>= 2.10.2, built with brotli — Arch's is).
# So rather than converting anything, we just point a throwaway fontconfig
# at static/fonts/ and let rsvg-convert resolve the real families. This is
# why the SVG names fonts like "Nunito Sans 12pt ExtraLight 12pt" — that is
# the family name fontconfig reports for the variable font, not a typo.
#
# Requires: librsvg (rsvg-convert). Run from anywhere.
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/../.." && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

cat > "$work_dir/fonts.conf" <<EOF
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>$repo_root/static/fonts</dir>
  <dir>/usr/share/fonts</dir>
  <cachedir>$work_dir/cache</cachedir>
</fontconfig>
EOF

FONTCONFIG_FILE="$work_dir/fonts.conf" rsvg-convert \
	-w 1200 -h 630 \
	"$script_dir/og-default.svg" \
	-o "$repo_root/static/og-default.png"

echo "wrote static/og-default.png"
