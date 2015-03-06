# postcss-map

> [PostCSS] plugin enabling configuration maps.


## Installation

```
npm install postcss-map --save-dev
```


## Usage

```js
var fs = require('fs');
var postcss = require('postcss');
var map = require('postcss-map');

var css = fs.readFileSync('input.css', 'utf8');

var output = postcss()
  .use(map())
  .process(css)
  .css;
```

### Example usage from declaration values

map:
```yaml
# example.yml
foo:
  bar:
    baz: 'yeah!'
```

input:

```css
.baz {
  content: map(example, foo, bar, baz);
}
```

output:

```css
.baz {
  content: 'yeah!';
}
```

### Example usage from at-rules parameters

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
@media (min-width: 321px) {
  .test {
    width: 100%;
  }
}
```


### Example from declaration blocks

map:
```yaml
# fonts.yml
regular:
  font-family: "'Spinnaker Regular', sans-serif"
  font-weight: "normal"
  font-feature-settings: "'onum', 'kern', 'liga', 'dlig', 'clig'"
  font-kerning: "normal"
bold:
  font-family: "'Spinnaker Bold', sans-serif"
  font-weight: "normal"
  font-feature-settings: "'onum', 'kern', 'liga', 'dlig', 'clig'"
  font-kerning: "normal"
```

input:

```css
.whatever {
  @map fonts regular;
}
```

output:

```css
.whatever {
  font-family: 'Spinnaker Bold', sans-serif;
  font-weight: normal;
  font-feature-settings: 'onum', 'kern', 'liga', 'dlig', 'clig';
  font-kerning: normal;
}
```


## Options

### basePath
type: `String`  
default: `process.cwd`  
Base path to retrieve maps from.

### maps
type: `Array`  
default: `[]`  
An array representing maps files to load and parse.


## Credits

* [Pascal Duez](https://twitter.com/pascalduez)


## Licence

postcss-map is [unlicensed](http://unlicense.org/).



[PostCSS]: https://github.com/postcss/postcss
