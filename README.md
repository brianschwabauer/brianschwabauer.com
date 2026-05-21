# brianschwabauer.com

Personal website and portfolio of Brian Schwabauer — an animated "about me"
homepage, a blog with an AI-assisted admin editor, and full-text + semantic
search. Built on SvelteKit and deployed to Cloudflare Workers.

## Tech stack

- **[SvelteKit 2](https://svelte.dev/docs/kit) + [Svelte 5](https://svelte.dev)** — app framework, deployed via `@sveltejs/adapter-cloudflare`
- **TypeScript**
- **Cloudflare Workers** — hosting and edge runtime
  - **KV** — blog posts, search indexes, rate-limit buckets
  - **R2** — media (images, video, audio) — see [Media hosting](#media-hosting-on-cloudflare-r2)
  - **Workers AI** — text embeddings for semantic search
  - **Email Routing** — delivers contact-form submissions
- **[Auth.js](https://authjs.dev)** (`@auth/sveltekit`) — Google OAuth for the admin area
- **[TipTap](https://tiptap.dev)** — rich-text editor for authoring blog posts
- **[Orama](https://askorama.ai)** — full-text and vector search
- **[Anthropic SDK](https://docs.anthropic.com)** — AI assistance in the blog editor
- **pnpm workspaces** — shared packages come from the `delightstack` submodule

## Repository layout

```
src/                  SvelteKit app (routes, components, server logic)
image-worker/          Separate Cloudflare Worker for image processing
delightstack/          Git submodule — shared @delightstack/* workspace packages
static/                Static assets, _redirects, robots.txt
scripts/encode.sh      HLS video encoding helper
wrangler.toml          Main site worker config
wrangler.images.toml   Image-processing worker config
```

The site is split into **two Cloudflare Workers**: the main site
(`brianschwabauer`) and an image processor (`brianschwabauer-images`). The main
worker forwards `/api/images/*` and `/cdn/image/*` to the image worker through
a service binding. They deploy independently.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 10+
- A Cloudflare account (for KV/R2/AI bindings)
- Docker (only needed to run the image worker's container locally)

### Setup

This repo uses a git submodule for the `delightstack` shared packages, so
clone with `--recurse-submodules` (or initialize it after cloning):

```sh
git clone --recurse-submodules https://github.com/brianschwabauer/brianschwabauer.com.git
cd brianschwabauer.com

# if you already cloned without --recurse-submodules:
git submodule update --init --recursive

pnpm install
```

### Environment variables

Copy the example file and fill in real values:

```sh
cp .dev.vars.example .dev.vars
```

`.dev.vars` is gitignored. The variables it documents:

| Variable | Purpose |
| --- | --- |
| `AUTH_SECRET` | Auth.js session secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials |
| `ANTHROPIC_API_KEY` | AI assistance in the blog editor |
| `ADMIN_EMAILS` | Comma-separated emails allowed into `/admin` |
| `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL` | Contact-form sender / recipient |

In production these are set as Cloudflare secrets, not committed:

```sh
wrangler secret put AUTH_SECRET
# ...repeat for each
```

### Develop

```sh
pnpm dev          # site only, http://localhost:5180
pnpm dev:images   # image-processing worker (requires Docker)
pnpm dev:all      # both, side by side
pnpm check        # type-check
```

## Deployment

The main site deploys to Cloudflare Workers, ideally via **Workers Builds**
connected to this GitHub repo so a push to `main` triggers a build
(`pnpm build`). The build resolves the `delightstack` submodule, so the GitHub
integration must be able to read that (public) repository.

The image worker is deployed separately:

```sh
wrangler deploy --config wrangler.images.toml
```

### Legacy URL redirects

`static/_redirects` 301s the pre-2026 `/blog/YYYY/MM/slug` URLs to the current
`/blog/slug` scheme to preserve inbound links and SEO.

## Media hosting on Cloudflare R2

Media files (images, video, audio) live in the `brianschwabauer` R2 bucket and
are **not** committed to the repo. Sync local media with `rclone`.

### One-time setup (skip if you already have rclone + R2 configured)

1. Create an R2 API token at Cloudflare dashboard → R2 → "Manage R2 API
   Tokens" → Create. You need Object Read & Write scope on the
   `brianschwabauer` bucket. Save the Access Key ID, Secret Access Key, and
   your Account ID (visible in the R2 endpoint URL).

2. Install + configure rclone:

   ```sh
   sudo pacman -S rclone   # arch
   rclone config
   ```

   Walk through:
   - `n` (new remote), name it `r2`
   - Storage: `s3`
   - Provider: `Cloudflare`
   - `env_auth`: `false`, then paste access key + secret
   - region: leave blank (or `auto`)
   - endpoint: `https://<your-account-id>.r2.cloudflarestorage.com`
   - Leave the rest as defaults.

   Verify: `rclone lsd r2:` should list `brianschwabauer`.

### Copy files to the R2 bucket

```sh
rclone copy ./media r2:brianschwabauer/media \
  --progress \
  --transfers 16 \
  --checkers 32
```

### Content-Type gotcha

rclone auto-detects MIME types from file extension via `/etc/mime.types`. On
Arch:

- `.m3u8` → `application/vnd.apple.mpegurl` ✓ (in mime.types)
- `.mp4` → `video/mp4` ✓
- `.jpg` / `.vtt` ✓
- `.m4s` → likely `application/octet-stream` ✗ (often missing from mime.types)

hls.js doesn't care about segment MIME (loads as binary), so this usually works
fine. But Safari's native HLS player can be picky. If Safari has trouble
playing, fix it with a follow-up pass:

```sh
rclone copy ./media r2:brianschwabauer/media \
  --include "*.m4s" \
  --header-upload "Content-Type: video/iso.segment"
```

## License

Source code is MIT licensed. Site content (blog posts, copy, images, video,
design assets) is © 2026 Brian Schwabauer, All Rights Reserved. See
[LICENSE](./LICENSE).
