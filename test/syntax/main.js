var rust = require('rustify')

var obj = { ...null }
var wasm = rust`
  #[no_mangle]
  pub fn with_semi() -> i32 { 10 }
`;

console.log
rust`#[no_mangle] pub fn should_not_call_console_log() -> () {}`

instantiate(rust('./extern.rs'))

WebAssembly.instantiate(wasm, {}).then(function (res) {
  var exports = res.instance.exports
  T.equal(exports.with_semi(), 10)
}).catch(T.fail)

function instantiate (bin) {
  WebAssembly.instantiate(bin, {}).then(function (res) {
    var exports = res.instance.exports
    T.equal(exports.multiple(), 20)
  }).catch(T.fail)
}
