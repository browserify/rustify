var rust = require('rustify')

var wasm = rust`
  #[no_mangle]
  pub fn add_one(x: i32) -> i32 {
    x + 1
  }
`

WebAssembly.instantiate(wasm, {}).then(function (res) {
  var addOne = res.instance.exports.add_one
  T.equal(addOne(41), 42)
  T.equal(addOne(68), 69)
}).catch(T.fail)
