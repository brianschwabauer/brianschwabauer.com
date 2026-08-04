#!/usr/bin/env bash
# Upload the archive index to Cloudflare KV.
#
#   ./upload.sh          upload to production KV
#   ./upload.sh --local  seed the local dev store (.wrangler/state) so
#                        `pnpm dev` sees the index too
#
# The index file itself (archive-index.json, kept next to this script) is
# gitignored on purpose: it lists every private project with titles and
# descriptions, and this repo's history is public. KV is the only home for
# that data — see src/lib/archive.ts.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

INDEX_FILE="$SCRIPT_DIR/archive-index.json"
KV_NAMESPACE_ID="0b2ff2ae425c43259c71f137972d3691" # matches wrangler.toml [[kv_namespaces]]
KV_KEY="/archive.json"

if [ ! -f "$INDEX_FILE" ]; then
	echo "error: $INDEX_FILE not found" >&2
	exit 1
fi

# Refuse to upload malformed JSON.
node -e "JSON.parse(require('fs').readFileSync('$INDEX_FILE', 'utf8'))"

# Run wrangler from the repo root so every path (wrangler.toml, the persist
# dir) resolves the same way it does for `pnpm dev` / deploys.
cd "$REPO_ROOT"

if [ "${1:-}" = "--local" ]; then
	# The SvelteKit adapter's platformProxy ({ persist: true }) reads local KV
	# from .wrangler/state/v3 — point wrangler at the same store.
	pnpm exec wrangler kv key put "$KV_KEY" \
		--namespace-id "$KV_NAMESPACE_ID" \
		--path "$INDEX_FILE" \
		--local --persist-to "$REPO_ROOT/.wrangler/state"
	echo "Seeded LOCAL dev KV ($KV_KEY) — restart 'pnpm dev' if it was running"
else
	pnpm exec wrangler kv key put "$KV_KEY" \
		--namespace-id "$KV_NAMESPACE_ID" \
		--path "$INDEX_FILE" \
		--remote
	echo "Uploaded $INDEX_FILE to production KV key $KV_KEY"
fi
