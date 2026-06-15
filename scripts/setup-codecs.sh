#!/usr/bin/env bash
# setup-codecs.sh
# Copies browser-compatible WASM binaries from the squoosh reference source
# into the local codecs/ directory for use by the library.
#
# Usage:
#   ./scripts/setup-codecs.sh [path-to-squoosh-repo]
#
# If no path is given, defaults to ref/squoosh-dev in the project root.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SQUOOSH_DIR="${1:-$PROJECT_ROOT/ref/squoosh-dev}"
CODECS_SRC="$SQUOOSH_DIR/codecs"
CODECS_DEST="$PROJECT_ROOT/codecs"

if [ ! -d "$CODECS_SRC" ]; then
  echo "Error: Squoosh codecs directory not found at $CODECS_SRC"
  echo "Usage: $0 [path-to-squoosh-repo]"
  exit 1
fi

echo "Copying browser WASM codecs from: $CODECS_SRC"
echo "Destination: $CODECS_DEST"
echo ""

# Clean previous output
rm -rf "$CODECS_DEST"

# ─── Emscripten codecs (C/C++) ───────────────────────────────────────────
# These have browser .js + .wasm files (exclude *_node_* variants)

copy_emscripten_codec() {
  local name="$1"
  shift
  local subdirs=("$@")

  for subdir in "${subdirs[@]}"; do
    local src="$CODECS_SRC/$name/$subdir"
    local dest="$CODECS_DEST/$name/$subdir"

    if [ ! -d "$src" ]; then
      echo "  SKIP $name/$subdir (not found)"
      continue
    fi

    mkdir -p "$dest"

    # Copy browser JS + WASM + type defs (exclude node variants)
    find "$src" -maxdepth 1 \( -name "*.js" -o -name "*.wasm" -o -name "*.d.ts" \) \
      ! -name "*_node_*" \
      -exec cp {} "$dest/" \;

    echo "  OK   $name/$subdir"
  done
}

echo "── Emscripten codecs ──"
copy_emscripten_codec "mozjpeg" "enc"
copy_emscripten_codec "webp" "enc" "dec"
copy_emscripten_codec "avif" "enc" "dec"
copy_emscripten_codec "jxl" "enc" "dec"
copy_emscripten_codec "wp2" "enc" "dec"
copy_emscripten_codec "qoi" "enc" "dec"
copy_emscripten_codec "imagequant" "."

# For imagequant, the files are directly in the codec dir (not in enc/dec)
# Fix: copy from root
if [ -d "$CODECS_DEST/imagequant/." ]; then
  # Move files from imagequant/. to imagequant/
  mv "$CODECS_DEST/imagequant/./"* "$CODECS_DEST/imagequant/" 2>/dev/null || true
  rmdir "$CODECS_DEST/imagequant/." 2>/dev/null || true
fi

# ─── wasm-bindgen codecs (Rust) ──────────────────────────────────────────
# These have pkg/ directories with .js + _bg.wasm + .d.ts files

copy_wasm_bindgen_codec() {
  local name="$1"
  local pkg_dir="${2:-pkg}"
  local src="$CODECS_SRC/$name/$pkg_dir"
  local dest="$CODECS_DEST/$name/$pkg_dir"

  if [ ! -d "$src" ]; then
    echo "  SKIP $name/$pkg_dir (not found)"
    return
  fi

  mkdir -p "$dest"
  cp "$src"/*.js "$dest/" 2>/dev/null || true
  cp "$src"/*.wasm "$dest/" 2>/dev/null || true
  cp "$src"/*.d.ts "$dest/" 2>/dev/null || true

  echo "  OK   $name/$pkg_dir"
}

echo ""
echo "── wasm-bindgen codecs ──"
copy_wasm_bindgen_codec "resize"
copy_wasm_bindgen_codec "png"
copy_wasm_bindgen_codec "oxipng"
copy_wasm_bindgen_codec "oxipng" "pkg-parallel"
copy_wasm_bindgen_codec "hqx"

# ─── Raw WASM codecs ─────────────────────────────────────────────────────
echo ""
echo "── Raw WASM codecs ──"
if [ -f "$CODECS_SRC/rotate/rotate.wasm" ]; then
  mkdir -p "$CODECS_DEST/rotate"
  cp "$CODECS_SRC/rotate/rotate.wasm" "$CODECS_DEST/rotate/"
  echo "  OK   rotate"
fi

echo ""
echo "Done! Codecs copied to $CODECS_DEST"

# Print summary
echo ""
echo "── Summary ──"
find "$CODECS_DEST" -name "*.wasm" | while read -r f; do
  size=$(du -h "$f" | cut -f1)
  relpath="${f#$CODECS_DEST/}"
  echo "  $size  $relpath"
done
