'use strict';

require('es6-promise').polyfill();
var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var plugin = require('../');

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

var opts = {
  basePath: 'test/fixture',
  maps: [
    {
      config: {
        foo: 'foo value',
        bar: 'bar value',
      },
    },
    'dummy.yml',
    'fonts.yml',
    'breakpoints.yml',
    'assets.yml',
  ],
};

['object', 'value', 'block', 'atrule'].forEach(function (test) {
  var input = read(test + '/input.css');
  postcss(plugin(opts)).process(input).then(function (result) {
    console.log(result.css);
  });
});
