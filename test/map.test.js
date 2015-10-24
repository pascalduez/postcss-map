'use strict';

require('es6-promise').polyfill();
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
  maps: [
    'dummy.yml',
    'fonts.yml',
    'breakpoints.yml',
    'assets.yml',
    'config.yml',
  ],
};

test('value', function (assert) {
  assert.plan(1);

  var input = read('value/input.css');
  var expected = read('value/expected.css');
  postcss([plugin(opts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });

});

test('block', function (assert) {
  assert.plan(1);

  var input = read('block/input.css');
  var expected = read('block/expected.css');
  postcss([plugin(opts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });
});

test('atrule', function (assert) {
  assert.plan(1);

  var input = read('atrule/input.css');
  var expected = read('atrule/expected.css');
  postcss([plugin(opts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });
});

test('object', function (assert) {
  assert.plan(1);

  var localOpts = {
    maps: [
      {
        config: {
          foo: 'foo value',
          bar: 'bar value',
        },
      },
    ],
  };

  var input = read('object/input.css');
  var expected = read('object/expected.css');
  postcss([plugin(localOpts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });
});

test('object:short', function (assert) {
  assert.plan(1);

  var localOpts = {
    maps: [{
      foo: 'foo value',
      bar: 'bar value',
    }],
  };

  var input = read('object-short/input.css');
  var expected = read('object-short/expected.css');
  postcss([plugin(localOpts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });
});

test('shortcut', function (assert) {
  assert.plan(2);

  var input = read('shortcut/input.css');
  var expected = read('shortcut/expected.css');

  // With `config`
  postcss([plugin(opts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });

  // With only one map.
  var mockOpts = opts;
  mockOpts.maps = ['dummy.yml'];
  postcss([plugin(mockOpts)]).process(input).then(function (result) {
    assert.equal(result.css, expected);
  });
});

test('errors', function (assert) {
  assert.plan(1);

  var input = read('atrule/input.css');
  opts.maps.push('fail.yml');

  postcss([plugin(opts)]).process(input).catch(function (err) {
    assert.equal(err.name, 'YAMLException');
  });
});
