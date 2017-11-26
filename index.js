module.exports = rustify

function rustify (src, filename, options, done) {
  // browserify transform
  if (typeof src === 'string' && !/\n/.test(src) && filename && filename._flags) {
    var args = Array.prototype.slice.apply(arguments)
    return require('./lib/transform.js').apply(this, args)
  }
}
