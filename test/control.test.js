import test from 'ava';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import plugin from '../dist';

const pluginName = require('../package.json').name;
let from;

const read = name =>
  fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');

const expected = read('control/expected.css');
const input = read('control/input.css');

test('control: no options', t =>
  postcss([plugin])
    .process(input, { from })
    .then(result => {
      t.is(result.css, expected);
    }));

test('control: with options', t =>
  postcss([plugin({})])
    .process(input, { from })
    .then(result => {
      t.is(result.css, expected);
    }));

test('control: PostCSS API', async t => {
  const processor = postcss();
  processor.use(plugin);

  const result = await processor.process(input, { from });

  t.is(result.css, expected);

  t.is(processor.plugins[0].postcssPlugin, pluginName);
  t.truthy(processor.plugins[0].postcssVersion);
});
