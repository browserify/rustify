var spawn = require('child_process').spawn
var mkdirp = require('mkdirp')
var path = require('path')
var fs = require('fs')
var os = require('os')

var cachedir = path.join(os.homedir(), '.cache', 'rustify')

module.exports = rustify

function rustify (filename, code, outdir, done) {
  mkdirp(outdir, function (err) {
    if (err) return done(err)
    var base = path.basename(filename).replace(path.extname(filename), '')

    spawn('rustc', [
      '-O',
      '--target', 'wasm32-unknown-unknown', filename,
      '--create-type=cdylib',
      '--out-dir', cachedir
    ]).on('error', function (err) {
      done(err)
    }).on('close', function () {
      var src = path.join(cachedir, base + '.wasm')
      var dest = path.join(cachedir, base + '.min.wasm')
      spawn('wasm-gc', [
        src,
        dest
      ]).on('error', function (err) {
        done(err)
      }).on('close', function () {
        fs.readFile(dest, function (err, buf) {
          if (err) return done(err)
          done(null, buf)
        })
      })
    })
  })
}
