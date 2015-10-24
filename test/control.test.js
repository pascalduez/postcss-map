'use strict';

require('es6-promise').polyfill();
var fs = require('fs');
var path = require('path');
var test = require('tape');
var postcss = require('postcss');
var plugin = require('../');
var pluginName = require('../package.json').name;

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

test('control', function (assert) {
  assert.plan(5);

  var input = read('control/input.css');
  var expected = read('control/expected.css');

  // No opts passed, no maps.
  postcss([plugin]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });

  // PostCSS legacy API.
  postcss([plugin.postcss]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });

  // PostCSS API.
  var processor = postcss();
  processor.use(plugin);
  processor.process(input).then(function (result) {
    assert.equal(result.toString(), expected);
  });

  assert.equal(processor.plugins[0].postcssPlugin, pluginName);
  assert.ok(processor.plugins[0].postcssVersion);
});
