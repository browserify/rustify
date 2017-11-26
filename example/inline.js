var rust = require('rustify')

var wasm = rust`
  #[no_mangle]
  pub fn add_one(x: i32) -> i32 {
    x + 1
  }
`
WebAssembly.instantiate(wasm, {}) // eslint-disable-line
  .then(function (res) {
    var addOne = res.instance.exports.add_one
    console.log(addOne(41))
    console.log(addOne(68))
  }).catch(function (e) {
    console.error('Creating WASM module failed', e)
  })
