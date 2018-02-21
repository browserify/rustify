var test = require('tape')
var path = require('path')
var vm = require('vm')
var browserify = require('browserify')
var rustify = require('../')

test('external', function (t) {
  t.plan(2)
  browserify(path.join(__dirname, 'external/main.js'))
    .transform(rustify)
    .bundle(function (err, src) {
      t.ifError(err)
      vm.runInNewContext(src, { T: t })
    })
})
