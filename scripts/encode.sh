#!/usr/bin/env bash
# Encode all .mp4/.mov in CWD to HLS (fMP4) for web streaming.
# Output: ./out/<slug>/master.m3u8 + variants + thumbnails sprite/VTT + poster.

set -uo pipefail

OUT_DIR="${OUT_DIR:-out}"
THUMB_COLS=10
THUMB_WIDTH=160
SEGMENT_SECONDS=6
PRESET="${PRESET:-slow}"

slugify() {
  local n="$1"
  n="${n%.*}"
  n="${n,,}"
  n=$(printf '%s' "$n" | sed -E 's/ *- */-/g')
  n=$(printf '%s' "$n" | tr ' ' '_')
  n=$(printf '%s' "$n" | sed -E 's/[^a-z0-9_.-]//g')
  n=$(printf '%s' "$n" | sed -E 's/_+/_/g')
  printf '%s' "$n"
}

bitrate_for_height() {
  local h=$1
  if   [ "$h" -ge 1080 ]; then echo "21 4500 9000"
  elif [ "$h" -ge 720 ];  then echo "21 2800 5600"
  elif [ "$h" -ge 480 ];  then echo "22 1400 2800"
  elif [ "$h" -ge 360 ];  then echo "23 900 1800"
  else                         echo "23 600 1200"
  fi
}

target_dims() {
  local sw=$1 sh=$2 th=$3
  local tw=$(( (sw * th / sh + 1) / 2 * 2 ))
  th=$(( (th + 1) / 2 * 2 ))
  echo "$tw $th"
}

vtt_time() {
  local t=$1
  printf '%02d:%02d:%02d.000' $(( t / 3600 )) $(( (t % 3600) / 60 )) $(( t % 60 ))
}

encode_one() {
  local src="$1"
  local base; base=$(basename "$src")
  local slug; slug=$(slugify "$base")
  local dst="$OUT_DIR/$slug"

  if [ -f "$dst/master.m3u8" ]; then
    echo "[skip ] $base"
    return 0
  fi

  echo "[start] $base"
  rm -rf "$dst"
  mkdir -p "$dst"

  local probe sw sh sar dur
  probe=$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height,sample_aspect_ratio \
    -of csv=p=0 "$src")
  sw=$(echo "$probe" | cut -d, -f1)
  sh=$(echo "$probe" | cut -d, -f2)
  sar=$(echo "$probe" | cut -d, -f3)
  dur=$(ffprobe -v error -show_entries format=duration \
    -of default=noprint_wrappers=1:nokey=1 "$src" | cut -d. -f1)
  if [ -z "$sw" ] || [ -z "$sh" ] || [ -z "$dur" ]; then
    echo "  [error] could not probe video"
    return 1
  fi

  # Compute display width using sample aspect ratio. Anamorphic sources
  # (DV NTSC, etc.) have non-square pixels; we need to bake the source DAR
  # into our pixel-grid dimensions and emit square-pixel output.
  local sar_n=1 sar_d=1
  if [ -n "$sar" ] && [ "$sar" != "N/A" ] && [ "$sar" != "0:1" ] && [ "$sar" != "1:1" ]; then
    sar_n=${sar%:*}
    sar_d=${sar#*:}
    if [ -z "$sar_n" ] || [ -z "$sar_d" ] || [ "$sar_d" = "0" ]; then
      sar_n=1; sar_d=1
    fi
  fi
  local disp_w=$(( (sw * sar_n + sar_d / 2) / sar_d ))

  # Detect presence of an audio stream — some logo animations have none.
  local has_audio=0
  if ffprobe -v error -select_streams a:0 -show_entries stream=codec_name \
       -of csv=p=0 "$src" 2>/dev/null | grep -q .; then
    has_audio=1
  fi

  # Source video bitrate in kbps (so we can cap output at source).
  # Prefer the video stream's bit_rate; fall back to format bit_rate minus
  # an estimated 128k for audio.
  local src_vbr src_kbps=0
  src_vbr=$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=bit_rate \
    -of default=noprint_wrappers=1:nokey=1 "$src" | head -1)
  if [ -z "$src_vbr" ] || [ "$src_vbr" = "N/A" ]; then
    local fmt_br
    fmt_br=$(ffprobe -v error -show_entries format=bit_rate \
      -of default=noprint_wrappers=1:nokey=1 "$src")
    if [ -n "$fmt_br" ] && [ "$fmt_br" != "N/A" ]; then
      if [ "$fmt_br" -gt 200000 ]; then
        src_vbr=$(( fmt_br - 128000 ))
      else
        src_vbr=$fmt_br
      fi
    fi
  fi
  if [ -n "$src_vbr" ] && [ "$src_vbr" != "N/A" ] && [ "$src_vbr" -gt 0 ] 2>/dev/null; then
    src_kbps=$(( src_vbr / 1000 ))
  fi

  local orig_h=$sh
  if [ "$orig_h" -gt 1080 ]; then orig_h=1080; fi

  local renditions=()
  if [ "$orig_h" -ge 720 ]; then
    renditions=("$orig_h" 480)
  else
    renditions=("$orig_h")
  fi

  local idx=0
  local -a master=()
  for rh in "${renditions[@]}"; do
    local vdir="$dst/v$idx"
    mkdir -p "$vdir"

    read -r tw th <<< "$(target_dims "$disp_w" "$sh" "$rh")"
    read -r crf maxk bufk <<< "$(bitrate_for_height "$rh")"

    # Never re-encode above source bitrate — output can't add information,
    # and CRF would happily spend bits preserving noise from low-quality sources.
    if [ "$src_kbps" -gt 0 ] && [ "$maxk" -gt "$src_kbps" ]; then
      echo "  [v$idx ] capping maxrate ${maxk}k → ${src_kbps}k (source bitrate)"
      maxk=$src_kbps
      bufk=$(( src_kbps * 2 ))
    fi

    echo "  [v$idx ] ${tw}x${th}  crf=${crf}  maxrate=${maxk}k"

    local audio_args codecs audio_bw
    if [ "$has_audio" -eq 1 ]; then
      audio_args=(-c:a aac -b:a 128k -ac 2 -ar 48000)
      codecs="avc1.640028,mp4a.40.2"
      audio_bw=128000
    else
      audio_args=(-an)
      codecs="avc1.640028"
      audio_bw=0
    fi

    ffmpeg -y -nostdin -hide_banner -loglevel error -stats \
      -i "$src" \
      -vf "scale=${tw}:${th},setsar=1" \
      -c:v libx264 -preset "$PRESET" -profile:v high -level 4.0 \
      -pix_fmt yuv420p \
      -crf "$crf" -maxrate "${maxk}k" -bufsize "${bufk}k" \
      -force_key_frames "expr:gte(t,n_forced*${SEGMENT_SECONDS})" \
      -sc_threshold 0 \
      "${audio_args[@]}" \
      -f hls \
      -hls_time "$SEGMENT_SECONDS" \
      -hls_playlist_type vod \
      -hls_segment_type fmp4 \
      -hls_fmp4_init_filename "init.mp4" \
      -hls_segment_filename "$vdir/seg%04d.m4s" \
      "$vdir/playlist.m3u8" || return 1

    local total_bw=$(( maxk * 1000 + audio_bw ))
    master+=("#EXT-X-STREAM-INF:BANDWIDTH=${total_bw},RESOLUTION=${tw}x${th},CODECS=\"${codecs}\"")
    master+=("v$idx/playlist.m3u8")
    idx=$(( idx + 1 ))
  done

  {
    echo "#EXTM3U"
    echo "#EXT-X-VERSION:6"
    echo "#EXT-X-INDEPENDENT-SEGMENTS"
    for line in "${master[@]}"; do echo "$line"; done
  } > "$dst/master.m3u8"

  if [ "$dur" -ge 4 ]; then
    local pt=$(( dur / 10 ))
    ffmpeg -y -nostdin -hide_banner -loglevel error \
      -ss "$pt" -i "$src" -frames:v 1 -q:v 3 \
      "$dst/poster.jpg" 2>/dev/null || echo "  [warn ] poster failed"
    generate_thumbs "$src" "$dst" "$disp_w" "$sh" "$dur"
  fi

  echo "[done ] $base"
}

generate_thumbs() {
  local src="$1" dst="$2" sw="$3" sh="$4" dur="$5"

  local interval=$(( dur / 200 ))
  if [ "$interval" -lt 2 ]; then interval=2; fi
  if [ "$interval" -gt 10 ]; then interval=10; fi

  local total=$(( (dur + interval - 1) / interval ))
  local cols=$THUMB_COLS
  local rows=$(( (total + cols - 1) / cols ))

  local tw=$THUMB_WIDTH
  local th=$(( (sh * tw / sw + 1) / 2 * 2 ))

  mkdir -p "$dst/thumbs"

  ffmpeg -y -nostdin -hide_banner -loglevel error \
    -i "$src" \
    -vf "fps=1/${interval},scale=${tw}:${th},setsar=1,tile=${cols}x${rows}" \
    -frames:v 1 -q:v 4 \
    "$dst/thumbs/sprite.jpg" || return 1

  local vtt="$dst/thumbs/thumbs.vtt"
  {
    echo "WEBVTT"
    echo
    local i=0
    while [ "$i" -lt "$total" ]; do
      local start=$(( i * interval ))
      local end=$(( start + interval ))
      [ "$end" -gt "$dur" ] && end=$dur
      local col=$(( i % cols ))
      local row=$(( i / cols ))
      local x=$(( col * tw ))
      local y=$(( row * th ))
      printf '%s --> %s\nsprite.jpg#xywh=%d,%d,%d,%d\n\n' \
        "$(vtt_time $start)" "$(vtt_time $end)" "$x" "$y" "$tw" "$th"
      i=$(( i + 1 ))
    done
  } > "$vtt"

  echo "  [thumb] ${total} frames @ ${interval}s  sprite=${tw}x${th}px tile=${cols}x${rows}"
}

main() {
  shopt -s nullglob nocaseglob
  local files=( *.mp4 *.mov )
  shopt -u nocaseglob
  if [ ${#files[@]} -eq 0 ]; then
    echo "no .mp4/.mov files in $(pwd)" >&2
    exit 1
  fi

  mkdir -p "$OUT_DIR"
  echo "encoding ${#files[@]} videos → $OUT_DIR/  (preset=$PRESET)"

  local failed=()
  for f in "${files[@]}"; do
    if ! ( encode_one "$f" ); then
      echo "[FAIL ] $f" >&2
      failed+=("$f")
    fi
  done

  echo
  if [ ${#failed[@]} -gt 0 ]; then
    echo "completed with ${#failed[@]} failures:" >&2
    for f in "${failed[@]}"; do echo "  - $f" >&2; done
    exit 1
  fi
  echo "all done."
}

main "$@"
