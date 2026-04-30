# Brian Schwabauer Personal Website

## Media Hosting on Cloudflare R2

To setup media hosting on Cloudflare R2, follow the instructions below. You only need to do the one-time setup once. After that, you can just use the rclone copy command to sync your media files to the R2 bucket whenever you have new content to upload.

### One-time setup (skip if you already have rclone + R2 configured)

1. Create an R2 API token at Cloudflare dashboard → R2 → "Manage R2 API Tokens" → Create. You need Object Read & Write scope on the
   brianschwabauer bucket. Save the Access Key ID, Secret Access Key, and your Account ID (visible in the R2 endpoint URL).

2. Install + configure rclone:
   sudo pacman -S rclone # arch
   rclone config
   Walk through:

- n (new remote), name it r2
- Storage: s3
- Provider: Cloudflare
- env_auth: false, then paste access key + secret
- region: leave blank (or auto)
- endpoint: https://<your-account-id>.r2.cloudflarestorage.com
- Leave the rest defaults.

Verify: rclone lsd r2: should list brianschwabauer.

### Copy files to cloudflare r2 bucket

rclone copy ./media r2:brianschwabauer/media \
 --progress \
 --transfers 16 \
 --checkers 32

### Content-Type gotcha

rclone auto-detects MIME types from file extension via /etc/mime.types. On Arch:

- .m3u8 → application/vnd.apple.mpegurl ✓ (in mime.types)
- .mp4 → video/mp4 ✓
- .jpg / .vtt ✓
- .m4s → likely application/octet-stream ✗ (often missing from mime.types)

hls.js doesn't care about segment MIME (loads as binary), so this usually works fine. But Safari's native HLS player can be picky. If Safari has trouble playing, fix it with a follow-up pass:

rclone copy ./media r2:brianschwabauer/media \
 --include "\*.m4s" \
 --header-upload "Content-Type: video/iso.segment"
