'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var postcss = require('postcss');
var plugin = require('../');

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

var opts = {
  basePath: 'test/fixture',
  maps: [ 'dummy.yml', 'fonts.yml', 'breakpoints.yml' ]
};

test('value', function (assert) {
  assert.plan(1);

  var input = read('value/input.css');
  var expected = read('value/expected.css');
  var css = postcss(plugin(opts)).process(input).css;

  assert.equal(css, expected);
});

test('block', function (assert) {
  assert.plan(1);

  var input = read('block/input.css');
  var expected = read('block/expected.css');
  var css = postcss(plugin(opts)).process(input).css;

  assert.equal(css, expected);
});

test('atrule', function (assert) {
  assert.plan(1);

  var input = read('atrule/input.css');
  var expected = read('atrule/expected.css');
  var css = postcss(plugin(opts)).process(input).css;

  assert.equal(css, expected);
});
