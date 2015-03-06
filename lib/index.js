import fs from 'fs';
import path from 'path';
import list from 'postcss/lib/list';
import balanced from 'balanced-match';
import parsePath from 'parse-filepath';
import yaml from 'js-yaml';

const reMap = /((?:map)\()(.*)(\))/;

export default function (...args) {
  const parser = new Parser(...args);

  return function (css) {
    css.eachDecl(parser#processDecl);
    css.eachAtRule(parser#processAtRule);
  };
}

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
   * Parse and replace maps in declarations values.
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
   * Parse and proccess at-rules.
   * @param {Object} rule
   */
  processAtRule(rule) {
    if (rule.name === 'map') return this.replaceAtRuleBlock(rule);
    if (reMap.test(rule.params)) return this.replaceAtRuleParam(rule);
    else return;
  }

  /**
   * Get and print at-rules map declarations.
   * @param {Object} rule
   */
  replaceAtRuleBlock(rule) {
    let [name, ...props] = list.space(rule.params);
    let map = this.getValue(name, props);

    Object.keys(map).forEach(prop => {
      rule.parent.insertBefore(rule, { prop, value: map[prop] });
    });

    rule.removeSelf();
  }

  /**
   * Parse and replace maps in at-rules parameters.
   * @param {Object} rule
   */
  replaceAtRuleParam(rule) {
    let { pre, body, post } = balanced('map(', ')', rule.params);
    let [name, ...props] = list.comma(body);
    let value = this.getValue(name, props);

    rule.params = `${pre}${value}${post}`;
  }

  /**
   * Get value from a deep nested object properties.
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
    let { name, basename } = parsePath(map);
    this.maps[name] ?= this.parseFile(basename);
    return this.maps[name];
  }
}
