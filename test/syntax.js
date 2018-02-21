var test = require('tape')
var path = require('path')
var vm = require('vm')
var browserify = require('browserify')
var rustify = require('../')

test('syntax', function (t) {
  t.plan(3)
  browserify(path.join(__dirname, 'syntax/main.js'))
    .transform(rustify)
    .bundle(function (err, src) {
      t.ifError(err)
      vm.runInNewContext(src, { T: t })
    })
})
