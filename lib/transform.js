var StringDecoder = require('string_decoder').StringDecoder
var through = require('through2')
var falafel = require('falafel')
var path = require('path')

module.exports = transform

function transform (filename, opts) {
  if (/\.json$/i.test(filename)) return through()

  var decoder = new StringDecoder('utf8')
  var src = ''

  return through(write, flush)

  function write (chunk, _, cb) {
    src += decoder.write(chunk)
    cb()
  }

  function flush (cb) {
    src += decoder.end()
    var self = this
    var nodes = []
    var moduleName

    // Optimization: don't create an AST if we're not using rustify.
    if (src.indexOf('rustify') === -1) {
      self.push(src)
      self.push(null)
      return
    }

    try {
      // We need to acquire the module name first, before we can proceed to
      // parse all the things.
      var tmpAst = falafel(src, { ecmaVersion: 8 }, identifyModuleName)
      ast = falafel(tmpAst.toString(), { ecmaVersion: 8 }, extractNodes)
    } catch (err) {
      return self.emit('error', err)
    }

    // transform all detected nodes and
    // close stream when done
    mapLimit(nodes, Infinity, iterate, function (err) {
      if (err) return self.emit('error', err)
      self.push(ast.toString())
      self.push(null)
    })

    function iterate () {
    }

    function extractNodes () {
    }

    function identifyModuleName (node) {
      if (mname) return
      if (node.type === 'CallExpression' &&
      node.callee && node.callee.name === 'require' &&
      node.arguments.length === 1 &&
      node.arguments[0].value === 'rustify') {
        node.update('0')
        moduleName = node.parent.id.name
      }
    }

    function extractTemplateNodes (node) {
      if (node.type !== 'TemplateLiteral') return
      if (!node.parent || !node.parent.tag) return
      if (node.parent.tag.name !== mname) return

      var css = [ node.quasis.map(cooked) ]
        .concat(node.expressions.map(expr)).join('').trim()

      return {
        code: code,
        filename: filename,
        node: node.parent
      }
    }

    function extractImportNodes (node) {
      if (node.type !== 'CallExpression') return
      if (!node.callee || node.callee.type !== 'Identifier') return
      if (node.callee.name !== mname) return
      try {
        var resolvePath = path.resolve(path.dirname(filename), node.arguments[0].value)
      } catch (err) {
        return self.emit('error', err)
      }

      self.emit('file', resolvePath)

      return {
        filename: resolvePath,
        args: node.arguments[1],
        node: node
      }
    }
  }
}
