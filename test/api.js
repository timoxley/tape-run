var test = require('tape');
var run = require('..');
var fs = require('fs');
var browserify = require('browserify');

var test = require('tape');
var fs = require('fs');
var exec = require('child_process').exec;

var tape = __dirname + '/../node_modules/.bin/tape'
var tapeRun = __dirname + '/../bin/run.js'

var passTest = __dirname + '/fixtures/one.js'
var failTest = __dirname + '/fixtures/fail.js'

test('passing tests', function(t) {
  t.plan(2)
  exec(tape + ' ' + passTest, function(err, expected) {
    t.ifError(err, 'tape test executed correctly')

    var out = ''

    browserify(passTest)
    .bundle()
    .pipe(run({browser: 'chrome'}))
    .on('results', function (results) {
      t.ok(results.ok)
    })
    .on('data', function (d) { out += d; })
    .on('end', function () {
      t.equal(
        out.trim(),
        expected.trim()
      )
    });
  })
})

test('failing tests', function(t) {
  t.plan(2)
  exec(tape + ' ' + failTest, function(err, expected) {
    t.ok(err, 'tape test should fail')
    expected = expected.trim()

    var out = ''

    browserify(failTest)
    .bundle()
    .pipe(run({browser: 'chrome'}))
    .on('results', function (results) {
      t.notOk(results.ok)
    })
    .on('data', function (d) { out += d; })
    .on('end', function () {
      t.equal(
        removeDynamicContent(out),
        removeDynamicContent(expected)
      )
    });
  })
})

function removeDynamicContent(text) {
  return text.split('\n')
  .filter(function(line) {
    return line.trim().indexOf('at: ') !== 0
  })
  .join('\n').trim()
}
