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
