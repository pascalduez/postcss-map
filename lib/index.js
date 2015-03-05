import fs from 'fs';
import path from 'path';
import list from 'postcss/lib/list';
import balanced from 'balanced-match';
import yaml from 'js-yaml';

export default function (...args) {
  const parser = new Parser(...args);

  return function (css) {
    css.eachDecl(parser#processDecl);
    css.eachAtRule('map', parser#processAtRule);
  };
}

const reMap = /((?:map)\()(.*)(\))/;

class Parser {
  constructor({
    basePath = process.cwd(),
    maps = []
  } = {}) {
    this.basePath = basePath;
    this.maps = {};

    let self = this; // babel/babel#937
    maps.forEach(self#getMap);
  }

  /**
   * Get and replace declaration values map.
   *
   * @param {Object} decl
   */
  processDecl(decl) {
    if (!reMap.test(decl.value)) return;

    let { pre, body, post } = balanced('map(', ')', decl.value);
    let [name, ...props] = list.comma(body);
    let value = this.getValue(name, props);

    decl.value = `${pre}${value}${post}`;
  }

  /**
   * Get and print at-rules map declarations.
   *
   * @param {Object} rule
   */
  processAtRule(rule) {
    if (!rule.name === 'map') return;

    let [name, ...props] = list.space(rule.params);
    let map = this.getValue(name, props);

    for (let k of Object.keys(map)) {
      rule.parent.insertBefore(rule, { prop: k, value: map[k] });
    }

    rule.removeSelf();
  }

  /**
   * Get value from a deep nested object properties.
   *
   * @param {String} name
   * @param {Array} props
   * @return {*}
   */
  getValue(name, props) {
    let value = this.getMap(name);

    props.forEach(prop => {
      value = value[prop];
    });

    return value;
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
    this.maps[name] ?= this.parseFile(base);
    return this.maps[name];
  }
}
