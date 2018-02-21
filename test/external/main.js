var rust = require('rustify')

var wasm = rust('./module.rs')

WebAssembly.instantiate(wasm, {})
  .then(function (res) {
    var module = res.instance.exports
    T.equal(module.fib(7), 13)
  }).catch(T.fail)
