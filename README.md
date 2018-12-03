# postcss-custom-property-maps

[![npm version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![License][license-image]][license-url]

Interlope external value maps with css as custom properties. Supports Javascript module, YAML file, or JSON file. Use before [postcss-custom-properties] to insert the map values directly into the css.

## Installation

```
npm install postcss-custom-property-maps --save-dev
```

or

```
yarn add postcss-custom-property-maps --save-dev
```

## Usage

```js
const fs = require('fs');
const postcss = require('postcss');
const map = require('postcss-custom-property-maps');

let input = fs.readFileSync('input.css', 'utf8');

let opts = {
  basePath: 'css',
  maps: ['example.js', 'breakpoints.yml', 'fonts.json'],
};

postcss()
  .use(map(opts))
  .process(input)
  .then(result =>
    fs.writeFileSync('output.css', result.css);
  );
```

## Options

### basePath

type: `String`  
default: `process.cwd`  
Directory to resolve map paths against.

### includeUnused

type: `boolean`  
default: `false`  
If true generate custom properties for _all_ map variables. Otherwise only generate custom properties for used variables.

### maps

type: `Array`  
default: `[]`  
An array representing maps files to load and parse.
Map files can be YAML, JSON, or Javascript.  
You can also pass literal objects directly into the Array.

### defaultMap (short syntax)

type: `string`  
default: `config`

A map to resolve values against if another map is not found. This allows a shorter syntax where you can leave off the map name.

For Example

```js
let opts = {
  defaultMap: 'values'
  maps: ['colors.yml', 'values.yml']
};
```

maps:

```yaml
# colors.yml
main: 'red'
```

```yaml
# values.yml
foo: 'foo value'
```

input:

```css
.short {
  content: map(foo); /* Resolves against 'values.yml' */
  color: map(colors, main); /* Resolves against 'colors.yml' */
}
```

output:

```css
:root {
  --values-foo: 'foo value';
  --colors-main: 'red';
}

.short {
  content: var(--values-foo);
  color: var(--colors-main);
}
```

If you only have a single map all values will automatically resolve against it.

### Example usage

#### declaration values

maps:

```yaml
# colors.yml
red: '#FF0000'
```

```yaml
# example.yml
foo:
  bar:
    baz: 'yeah!'

main-color: map(colors, red)
```

input:

```css
.baz {
  content: map(example, foo, bar, baz);
  color: map(example, main-color);
}
```

output:

```css
:root {
  --colors-red: #ff0000;
  --example-main-color: var(--colors-red);
  --example-foo-bar-baz: yeah!;
}

.baz {
  content: var(--example-foo-bar-baz);
  color: var(--example-main-color);
}
```

#### With `postcss-custom-properties`

```js
const fs = require('fs');
const postcss = require('postcss');
const map = require('postcss-custom-property-maps');
const customProperties = require('postcss-custom-properties');

let input = fs.readFileSync('input.css', 'utf8');

postcss()
  .use(
    map({
      maps: ['example.yml'],
    })
  )
  .use(customProperties())
  .process(input)
  .then(result =>
    fs.writeFileSync('output.css', result.css);
  );
```

maps:

```yaml
# example.yml
foo: yeah!
```

input:

```css
.baz {
  content: map(example, foo);
}
```

output:

```css
.baz {
  content: yeah!;
}
```

#### Javascript module

maps:

```js
// example.js
module.exports = {
  foo: 'yeah!',
};
```

input:

```css
.baz {
  content: map(example, foo);
}
```

output:

```css
:root {
  --example-foo: yeah!;
}

.baz {
  content: var(--example-foo);
}
```

#### At-rule parameters

map:

```yaml
# breakpoints.yml
small: 320px
medium: 321px
large: 800px
```

input:

```css
@media (min-width: map(breakpoints, medium)) {
  .test {
    width: 100%;
  }
}
```

output:

```css
:root {
  --breakpoints-medium: 321px;
}

@media (min-width: var(--breakpoints-medium)) {
  .test {
    width: 100%;
  }
}
```

#### Declaration blocks

map:

```yaml
# fonts.yml
regular:
  font-family: "'Spinnaker Regular', sans-serif"
  font-weight: 'normal'
  font-feature-settings: "'onum', 'kern', 'liga', 'dlig', 'clig'"
  font-kerning: 'normal'
bold:
  font-family: "'Spinnaker Bold', sans-serif"
  font-weight: 'normal'
  font-feature-settings: "'onum', 'kern', 'liga', 'dlig', 'clig'"
  font-kerning: 'normal'
```

input:

```css
.whatever {
  @map fonts regular;
}
```

output:

```css
:root {
  --fonts-regular-font-family: 'Spinnaker Regular', sans-serif;
  --fonts-regular-font-weight: normal;
  --fonts-regular-font-feature-settings: 'onum', 'kern', 'liga', 'dlig', 'clig';
  --fonts-regular-font-kerning: normal;
}

.whatever {
  font-family: var(--fonts-regular-font-family);
  font-weight: var(--fonts-regular-font-weight);
  font-feature-settings: var(--fonts-regular-font-feature-settings);
  font-kerning: var(--fonts-regular-font-kerning);
}
```

#### Literal objects

```js
const fs = require('fs');
const postcss = require('postcss');
const map = require('postcss-custom-property-maps');

let input = fs.readFileSync('input.css', 'utf8');

let opts = {
  basePath: 'css',
  maps: [
    {
      dummy: {
        one: 1,
        two: 2,
      },
    },
    'example.yml',
    'breakpoints.yml',
    'fonts.yml'
  }]
};

postcss()
  .use(map(opts))
  .process(input)
  .then(result => {
    fs.writeFileSync('output.css', result.css);
  });
```

input:

```css
.whatever {
  content: map(dummy, one);
}

.baz {
  content: map(example, foo, bar, baz);
}
```

output:

```css
:root {
  --dummy-one: 1;
  --example-foo-bar-baz: yeah!;
}

.whatever {
  content: var(--dummy-one);
}

.baz {
  content: var(--example-foo-bar-baz);
}
```

#### Literal objects and short syntax

```js
const fs = require('fs');
const postcss = require('postcss');
const map = require('postcss-custom-property-maps');

let input = fs.readFileSync('input.css', 'utf8');

let opts = {
  maps: [
    {
      one: 1,
      two: 2,
    },
  ],
};

postcss()
  .use(map(opts))
  .process(input)
  .then(result => {
    fs.writeFileSync('output.css', result.css);
  });
```

input:

```css
.whatever {
  content: map(one);
}
```

output:

```css
:root {
  --one: 1;
}

.whatever {
  content: var(--one);
}
```

## Context

Used in conjunction with [postcss-plugin-context] you can benefit from contextualized
maps and leverage the short syntax.

```css
@context brandColors {
  h1 {
    color: map(primary);
  }
}
```

## Credits

Thanks to [Pascal Duez](https://github.com/pascalduez) and [Bogdan Chadkin](https://github.com/TrySound) for the inital project [postcss-map](https://github.com/pascalduez/postcss-map).

[postcss-custon-properties]: https://github.com/postcss/postcss-custom-properties
[postcss-plugin-context]: https://github.com/postcss/postcss-plugin-context
[npm-url]: https://www.npmjs.org/package/postcss-custom-property-maps
[npm-image]: http://img.shields.io/npm/v/postcss-custom-property-maps.svg
[travis-url]: https://travis-ci.com/RedHatter/postcss-custom-property-maps?branch=master
[travis-image]: https://travis-ci.com/RedHatter/postcss-custom-property-maps.svg?branch=master
[coveralls-url]: https://coveralls.io/github/RedHatter/postcss-custom-property-maps?branch=master
[coveralls-image]: https://coveralls.io/repos/github/RedHatter/postcss-custom-property-maps/badge.svg?branch=master
[license-image]: http://img.shields.io/npm/l/postcss-custom-property-maps.svg
[license-url]: LICENSE
