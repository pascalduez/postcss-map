import test from 'ava';
import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import plugin from '../src';

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
    'javascript.js',
    'javascript-es6.mjs',
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

test('glob', async t => {
  const input = read('glob/input.css');
  const expected = read('glob/expected.css');

  const result = await postcss()
    .use(
      plugin({
        basePath: 'test/fixture',
        maps: ['{dummy,assets}.yml'],
      })
    )
    .process(input, { from });

  t.is(result.css, expected);
});

test('javascript', async t => {
  const input = read('javascript/input.css');
  const expected = read('javascript/expected.css');

  const result = await postcss()
    .use(plugin(opts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('javascript:es6', async t => {
  const input = read('javascript-es6/input.css');
  const expected = read('javascript-es6/expected.css');

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

  // With only one map.
  let result = await postcss()
    .use(
      plugin({
        ...opts,
        maps: ['dummy.yml'],
      })
    )
    .process(input, { from });

  t.is(result.css, expected);
});

test('shortcut:default', async t => {
  const input = read('shortcut-default/input.css');
  const expected = read('shortcut-default/expected.css');

  // With `config`
  let result = await postcss()
    .use(plugin(opts))
    .process(input, { from });

  t.is(result.css, expected);
});

test('includeUnused', async t => {
  const input = read('include-unused/input.css');
  const expected = read('include-unused/expected.css');

  const result = await postcss()
    .use(
      plugin({
        ...opts,
        includeUnused: true,
        maps: ['dummy.yml', 'breakpoints.yml'],
      })
    )
    .process(input, { from });

  t.is(result.css, expected);
});

test('warn:path', async t => {
  const input = read('atrule/input.css');
  const localOpts = {
    ...opts,
    maps: [...opts.maps, 'blow.yml'],
  };

  const result = await postcss()
    .use(plugin(localOpts))
    .process(input, { from });
  t.is(result.messages[0].text, "Could not find map file 'blow.yml'.");
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
    t.fail('Should have thrown');
  } catch (ex) {
    t.is(ex.name, 'YAMLException');
    t.regex(ex.toString(), /fail.yml/);
  }
});

test('errors:block', async t => {
  const input = read('block/input.css');
  try {
    await postcss()
      .use(plugin({}))
      .process(input, { from });
    t.fail('Should have thrown');
  } catch (err) {
    t.is(err.reason, "Could not find map block 'fonts.code.Regular'.");
  }
});

test('errors:value', async t => {
  const input = read('value/input.css');
  try {
    await postcss()
      .use(plugin({}))
      .process(input, { from });
    t.fail('Should have thrown');
  } catch (err) {
    t.is(err.reason, "Could not find map value 'dummy.foo'.");
  }
});
