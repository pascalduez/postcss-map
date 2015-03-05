'use strict';

var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var plugin = require('../');

function read(name) {
  var p = path.join(__dirname, 'fixture', name);
  return fs.readFileSync(p, 'utf8');
}

var opts = {
  basePath: 'test/fixture',
  maps: [ 'fonts.yml', 'breakpoints.yml' ]
};

var input = read('input.css');

var css = postcss(plugin(opts)).process(input).css;

console.log(css);
