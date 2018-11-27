import test from 'ava';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import plugin from '../dist';

const read = name =>
  fs.readFileSync(path.join(__dirname, 'fixture', name), 'utf8');

let from;
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

test('value', async t => {
  const input = read('value/input.css');
  const expected = read('value/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('block', async t => {
  const input = read('block/input.css');
  const expected = read('block/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('atrule', async t => {
  const input = read('atrule/input.css');
  const expected = read('atrule/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('object', async t => {
  const input = read('object/input.css');
  const expected = read('object/expected.css');
  const localOpts = {
    maps: [
      {
        config: {
          foo: 'foo value',
          bar: 'bar value',
        },
      },
    ],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('object:custom', async t => {
  const input = read('object-custom/input.css');
  const expected = read('object-custom/expected.css');
  const localOpts = {
    defaultMap: 'custom',
    maps: [
      {
        custom: {
          foo: 'custom foo value',
          bar: 'custom bar value',
        },
        config: {
          foo: 'config foo value',
          bar: 'config bar value',
        },
      },
    ],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('object:short', async t => {
  const input = read('object-short/input.css');
  const expected = read('object-short/expected.css');
  const localOpts = {
    maps: [
      {
        foo: 'foo value',
        bar: 'bar value',
      },
    ],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('shortcut', async t => {
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
    .process(input, { from });

  t.is(result.css, expected);

  // With only one map.
  result = await postcss()
    .use(plugin(localOpts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('errors:path', async t => {
  const input = read('atrule/input.css');
  const localOpts = {
    ...opts,
    maps: [...opts.maps, 'blow.yml'],
  };

  try {
    await postcss()
      .use(plugin(localOpts))
      .process(input, { from });
  } catch (ex) {
    t.is(ex.code, 'ENOENT');
    t.regex(ex.toString(), /blow.yml/);
  }
});

test('errors:yaml', async t => {
  const input = read('atrule/input.css');
  const localOpts = {
    ...opts,
    maps: [...opts.maps, 'fail.yml'],
  };

  try {
    await postcss()
      .use(plugin(localOpts))
      .process(input, { from });
  } catch (ex) {
    t.is(ex.name, 'YAMLException');
    t.regex(ex.toString(), /fail.yml/);
  }
});
