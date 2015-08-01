var fs = require('fs');
var path = require('path');
var postcss = require('postcss');
var plugin = require('../');

function read(name) {
  return fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');
}

var opts = {
  basePath: 'test/fixture',
  maps: ['dummy.yml', 'fonts.yml', 'breakpoints.yml', 'assets.yml'],
};

['value', 'block', 'atrule'].forEach(function (test) {
  var input = read(test + '/input.css');
  var css = postcss(plugin(opts)).process(input).css;
  console.log(css);
});
