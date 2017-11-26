var rust = require('rustify')

var wasm = rust('./add.rs')

WebAssembly.instantiate(wasm, {}) // eslint-disable-line
  .then(function (res) {
    var addOne = res.instance.exports.add_one
    console.log(addOne(41))
    console.log(addOne(68))
  }).catch(function (e) {
    console.error('Creating WASM module failed', e)
  })
