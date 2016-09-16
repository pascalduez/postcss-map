import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import plugin from '../src';

const read = name =>
  fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');

let opts = {
  basePath: 'test/fixture',
  maps: [
    'dummy.yml',
    'fonts.yml',
    'breakpoints.yml',
    'assets.yml',
    'config.yml',
  ],
};

test('value', async () => {
  const input = read('value/input.css');
  const expected = read('value/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('block', async () => {
  const input = read('block/input.css');
  const expected = read('block/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('atrule', async () => {
  const input = read('atrule/input.css');
  const expected = read('atrule/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('object', async () => {
  const input = read('object/input.css');
  const expected = read('object/expected.css');
  const localOpts = {
    maps: [{
      config: {
        foo: 'foo value',
        bar: 'bar value',
      },
    }],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('object:custom', async () => {
  const input = read('object-custom/input.css');
  const expected = read('object-custom/expected.css');
  const localOpts = {
    defaultMap: 'custom',
    maps: [{
      custom: {
        foo: 'custom foo value',
        bar: 'custom bar value',
      },
      config: {
        foo: 'config foo value',
        bar: 'config bar value',
      },
    }],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('object:short', async () => {
  const input = read('object-short/input.css');
  const expected = read('object-short/expected.css');
  const localOpts = {
    maps: [{
      foo: 'foo value',
      bar: 'bar value',
    }],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('shortcut', async () => {
  const input = read('shortcut/input.css');
  const expected = read('shortcut/expected.css');
  const localOpts = {
    ...opts,
    maps: ['dummy.yml'],
  };
  let result;

  // With `config`
  result = await postcss()
    .use(plugin(opts))
    .process(input);

  expect(result.css).toBe(expected);

  // With only one map.
  result = await postcss()
    .use(plugin(localOpts))
    .process(input);

  expect(result.css).toBe(expected);
});

test('errors:path', async () => {
  const input = read('atrule/input.css');
  const localOpts = {
    ...opts,
    maps: [...opts.maps, 'blow.yml'],
  };

  try {
    await postcss()
      .use(plugin(localOpts))
      .process(input);
  } catch (ex) {
    expect(ex.code).toBe('ENOENT');
    expect(ex.toString()).toMatch(/blow.yml/);
  }
});

test('errors:yaml', async () => {
  const input = read('atrule/input.css');
  const localOpts = {
    ...opts,
    maps: [...opts.maps, 'fail.yml'],
  };

  try {
    await postcss()
      .use(plugin(localOpts))
      .process(input);
  } catch (ex) {
    expect(ex.name).toBe('YAMLException');
    expect(ex.toString()).toMatch(/fail.yml/);
  }
});
