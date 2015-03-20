'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var postcss = require('postcss');
var plugin = require('../');

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

test('control', function (assert) {
  assert.plan(3);

  var input = read('control/input.css');
  var expected = read('control/expected.css');
  var css;

  css = postcss(plugin).process(input).css;
  assert.equal(css, expected);

  css = postcss(plugin.postcss).process(input).css;
  assert.equal(css, expected);

  var processor = postcss();
  processor.use(plugin);
  css = processor.process(input).toString();
  assert.equal(css, expected);
});
