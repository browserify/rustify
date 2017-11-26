# rustify
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Rust WebAssembly transform for Browserify

## Usage
```js
var rust = require('rustify')

var wasm = rust`
  #[no_mangle]
  pub fn add_one(x: i32) -> i32 {
    x + 1
  }
`

try {
  var res = await window.WebAssembly.instantiate(wasm, {})
  var addOne = res.instance.exports.add_one
} catch (e) {
  console.error('Creating WASM module failed', e)
}

console.log(addOne(41))
// => 42

console.log(addOne(68))
// => 69
```

## External
```js
var rust = require('rustify')

var wasm = rust('./add-one.rs')

try {
  var res = await window.WebAssembly.instantiate(wasm, {})
  var addOne = res.instance.exports.add_one
} catch (e) {
  console.error('Creating WASM module failed', e)
}

console.log(addOne(41))
// => 42

console.log(addOne(68))
// => 69
```

## Installation
```sh
$ rustup update nightly
$ rustup target add wasm32-unknown-unknown --toolchain nightly
$ rustc +nightly --target wasm32-unknown-unknown "$target" --crate-type=cdylib
$ cargo install --git https://github.com/alexcrichton/wasm-gc
```
```sh
$ npm install rustify
```

## License
[Apache-2.0](./LICENSE)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/rustify.svg?style=flat-square
[3]: https://npmjs.org/package/rustify
[4]: https://img.shields.io/travis/yoshuawuyts/rustify/master.svg?style=flat-square
[5]: https://travis-ci.org/yoshuawuyts/rustify
[6]: https://img.shields.io/codecov/c/github/yoshuawuyts/rustify/master.svg?style=flat-square
[7]: https://codecov.io/github/yoshuawuyts/rustify
[8]: http://img.shields.io/npm/dm/rustify.svg?style=flat-square
[9]: https://npmjs.org/package/rustify
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
