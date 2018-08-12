import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import plugin from '../src';

const pluginName = require('../package.json').name;
let from;

const read = name =>
  fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');

const expected = read('control/expected.css');
const input = read('control/input.css');

test('control: no options', () =>
  postcss([plugin])
    .process(input, { from })
    .then(result => {
      expect(result.css).toBe(expected);
    }));

test('control: with options', () =>
  postcss([plugin({})])
    .process(input, { from })
    .then(result => {
      expect(result.css).toBe(expected);
    }));

test('control: PostCSS API', async () => {
  const processor = postcss();
  processor.use(plugin);

  const result = await processor.process(input, { from });

  expect(result.css).toBe(expected);

  expect(processor.plugins[0].postcssPlugin).toBe(pluginName);
  expect(processor.plugins[0].postcssVersion).toBeDefined();
});
