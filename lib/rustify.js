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

    var stdout = ''
    var stderr = ''

    var rustc = spawn('rustc', [
      '+nightly',
      '-O',
      '--target', 'wasm32-unknown-unknown', filename,
      '--crate-type=cdylib',
      '--out-dir', cachedir
    ])

    rustc.stdout.on('data', (data) => (stdout += data))
    rustc.stderr.on('data', (data) => (stdout += data))
    rustc.on('error', (err) => done(err))
    rustc.on('close', function (code) {
      if (code !== 0) return done(new Error(`process rustc exited with with code ${code}, stdout: ${stdout}, stderr: ${stderr}`))
      var src = path.join(cachedir, base + '.wasm')
      var dest = path.join(cachedir, base + '.min.wasm')

      var wasmGc = spawn('wasm-gc', [ src, dest ])
      wasmGc.stdout.on('data', (data) => (stdout += data))
      wasmGc.stderr.on('data', (data) => (stdout += data))
      wasmGc.on('error', (err) => done(err))
      wasmGc.on('close', function (code) {
        if (code !== 0) return done(new Error(`process wasm-gc exited with with code ${code}, stdout: ${stdout}, stderr: ${stderr}`))
        fs.readFile(dest, function (err, buf) {
          if (err) return done(err)
          done(null, buf)
        })
      })
    })
  })
}
