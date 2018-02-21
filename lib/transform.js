var StringDecoder = require('string_decoder').StringDecoder
var mapLimit = require('map-limit')
var through = require('through2')
var acorn = require('acorn-node')
var falafel = require('falafel')
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var os = require('os')

var outdir = path.join(process.cwd(), 'dist/')
var cachedir = path.join(os.homedir(), '.cache', 'rustify')

var rustify = require('./rustify')

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
      var ast = falafel(src, { parser: acorn }, identifyModuleName)
      ast = falafel(ast.toString(), { parser: acorn }, extractNodes)
    } catch (err) {
      return self.emit('error', err)
    }

    // transform all detected nodes and
    // close stream when done
    mapLimit(nodes, 1, iterate, function (err) {
      if (err) return self.emit('error', err)
      self.push(ast.toString())
      self.push(null)
    })

    function iterate (val, done) {
      if (/\.rs$/.test(val.filename)) {
        handleCode(val)
      } else {
        val.filename = path.join(cachedir, 'file.rs')
        mkdirp(cachedir, function (err) {
          if (err) return done(err)
          fs.writeFile(val.filename, val.code, function (err) {
            if (err) return done(err)
            handleCode(val)
          })
        })
      }

      function handleCode (val) {
        rustify(val.filename, val.code, outdir, function (err, buf) {
          if (err) return done(err)
          var center = []
          buf.forEach((c) => center.push(c))
          var str = `new Uint8Array(${JSON.stringify(center)})`

          val.node.update(str)
          done()
        })
      }
    }

    function extractNodes (node) {
      var res = extractTemplateNodes(node)
      if (res) nodes.push(res)

      res = extractImportNodes(node)
      if (res) nodes.push(res)
    }

    function identifyModuleName (node) {
      if (moduleName) return
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
      if (node.parent.tag.name !== moduleName) return

      var code = [ node.quasis.map(cooked) ]
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
      if (node.callee.name !== moduleName) return
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

function cooked (node) { return node.value.cooked }
function expr (ex) { return { _expr: ex.source() } }
