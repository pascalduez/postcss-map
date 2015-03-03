import fs from 'fs';
import path from 'path';
import balanced from 'balanced-match';
import yaml from 'js-yaml';

export default function map(...args) {
  const parser = new Parser(...args);

  return function (css) {
    css.eachDecl(parser#processDecl);
  };
}

const reProperty = /((?:var)\()(--.*)(\))/;

class Parser {
  constructor({
    basePath = process.cwd(),
    maps = []
  } = {}) {
    this.basePath = basePath;
    this.maps = {};

    let self = this;
    maps.forEach(self#getMap);
  }

  processDecl(decl) {
    if (!reProperty.test(decl.value)) return;

    let { pre, body, post } = balanced('var(', ')', decl.value);
    let [, map, ...props] = body.split('--');

    decl.value = this.getProp(map, props);
  }

  /**
   * Get value from a deep nested object properties.
   *
   * @param {String} map
   * @param {Array} props
   * @return {*}
   */
  getProp(map, props) {
    let map = this.getMap(map);

    props.forEach(prop => {
      map = map[prop];
    });

    return map;
  }

  /**
   * Load YAML or JSON from given file.
   *
   * @param {String} file
   * @return {Object}
   */
  parseFile(file) {
    try {
      let filePath = path.resolve(this.basePath, file);
      return yaml.safeLoad(fs.readFileSync(filePath, 'utf-8'));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Get a cached map or parse it.
   *
   * @param {String} map
   * @return {Object}
   */
  getMap(map) {
    let { name, base } = path.parse(map);
    return this.maps[name] ?= this.parseFile(base);
  }
}
