#!/bin/bash

set -e # exit on failure

target="$1"
name="$(basename "$1" | sed 's/\.rs//')"

mkdir -p dist
rustc +nightly \
  -O \
  --target wasm32-unknown-unknown "$target" \
  --crate-type=cdylib \
  --out-dir dist/

wasm-gc "./dist/${name}.wasm" "./dist/${name}.min.wasm"
