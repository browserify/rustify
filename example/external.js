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
