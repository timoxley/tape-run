var test = require('tape');
var fs = require('fs');
var exec = require('child_process').exec;

var browserify = __dirname + '/../node_modules/.bin/browserify'
var tape = __dirname + '/../node_modules/.bin/tape'
var tapeRun = __dirname + '/../bin/run.js'

var passTest = __dirname + '/fixtures/one.js'
var failTest = __dirname + '/fixtures/fail.js'

test('passing tests', function(t) {
  exec(tape + ' ' + passTest, function(err, expected) {
    t.ifError(err, 'tape test executed correctly')
    expected = expected.trim()
    exec(browserify + ' ' + passTest + ' | ' + tapeRun + ' --browser chrome', function(err, stdout, stderr) {
      stdout = stdout.trim()
      t.ifError(err, 'tape-run test executed correctly')
      t.equal(
        stdout,
        expected
      )
      t.end()
    })
  })
})

test('failing tests', function(t) {
  exec(tape + ' ' + failTest, function(err, expected) {
    t.ok(err, 'tape test should fail')
    expected = expected.trim()
    exec(browserify + ' ' + failTest + ' | ' + tapeRun + ' --browser chrome', function(err, stdout, stderr) {
      stdout = stdout.trim()
      t.ok(err, 'tape-run test should fail')
      t.equal(
        removeDynamicContent(expected),
        removeDynamicContent(stdout)
      )
      t.end()
    })
  })
})

function removeDynamicContent(text) {
  return text.split('\n')
  .filter(function(line) {
    return line.trim().indexOf('at: ') !== 0
  })
  .join('\n').trim()
}
