#!/bin/bash

set -e # exit on failure

target="$1"

rustup update nightly
rustup target add wasm32-unknown-unknown --toolchain nightly
rustc +nightly --target wasm32-unknown-unknown "$target" --crate-type=cdylib
cargo install --git https://github.com/alexcrichton/wasm-gc
wasm-gc ./add.wasm small-add.wasm
