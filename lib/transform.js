var StringDecoder = require('string_decoder').StringDecoder
var through = require('through2')
var falafel = require('falafel')

module.exports = transform

function transform (filename, opts) {
  if (!/[js|jsm|jsx]$/.test(filename)) return through()

  var decoder = new StringDecoder('utf8')
  var src = ''

  return through(write, flush)

  function write (chunk, _, cb) {
    src += decoder.write(chunk)
    cb()
  }

  function flush (cb) {
    src += decoder.end()

    var output = falafel(src, function (node) {
      if (node.type !== 'CallExpression') return
      if (!node.arguments.length) return
      if (!node.callee || !node.callee.arguments) return
      if (!node.callee.arguments.length) return

      var requireLiteral = node.callee.arguments[0]
      if (requireLiteral.value !== 'bindings') return

      var val = node.arguments[0].value
      var str = "{bindings: '" + val + "', module_root: __dirname}"
      node.arguments[0].update(str)
    })

    this.push(output.toString())
    cb()
  }
}
