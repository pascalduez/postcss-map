'use strict';

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
  var css = postcss(plugin(opts)).process(input).css;
  console.log(css);
});
