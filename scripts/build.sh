#!/bin/bash

set -e # exit on failure

target="$1"
name="$(echo "$1" | sed 's/\/.wasm//')"

mkdir -p dist
rustc +nightly \
  --target wasm32-unknown-unknown "$target" \
  --crate-type=cdylib \
  --out-dir dist/
wasm-gc "${name}.wasm" "${name}.min.wasm"
