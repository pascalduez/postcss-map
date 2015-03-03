'use strict';

module.exports = require('./dist');

module.exports.postcss = function (css) {
  return module.exports()(css);
};
