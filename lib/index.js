import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import list from 'postcss/lib/list';
import rfc from 'reduce-function-call';
import parsePath from 'parse-filepath';
import yaml from 'js-yaml';

const reMap = /((?:map)\()(.*)(\))/;
const defaultMap = 'config';

class MapParser {
  constructor({
    basePath = process.cwd(),
    maps = []
  } = {}) {
    this.basePath = basePath;
    this.maps = {};

    maps.forEach(this.getMap.bind(this));
  }

  /**
   * Parse and replace maps in declarations values.
   * @param {Object} decl
   */
  processDecl(decl) {
    if (!reMap.test(decl.value)) return;

    decl.value = rfc(decl.value, 'map', body => {
      return this.getValue(list.comma(body));
    });
  }

  /**
   * Parse and proccess at-rules.
   * @param {Object} rule
   */
  processAtRule(rule) {
    if (rule.name === 'map')
      return this.replaceAtRuleBlock(rule);
    if (reMap.test(rule.params))
      return this.replaceAtRuleParam(rule);
  }

  /**
   * Get and print at-rules map declarations.
   * @param {Object} rule
   */
  replaceAtRuleBlock(rule) {
    let map = this.getValue(list.space(rule.params));

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
    rule.params = rfc(rule.params, 'map', body => {
      return this.getValue(list.comma(body));
    });
  }

  /**
   * Get value from a deep nested object properties.
   * @param {Array} args
   * @return {*}
   */
  getValue(args) {
    let [name, ...props] = args;
    let shortcutMap = this.useShortcutMap(name);

    if (shortcutMap) {
      name = shortcutMap;
      props = args;
    }

    let value = this.getMap(name);

    props.forEach(prop => {
      value = value[prop];
    });

    return value;
  }

  /**
   * Get map name usable with the short syntax.
   * @param {String} name
   * @return {Boolean|String}
   */
  useShortcutMap(name) {
    if (name in this.maps)
      return false;
    if (defaultMap in this.maps)
      return defaultMap;
    let names = Object.keys(this.maps);
    if (names.length === 1)
      return names[0];
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
    return this.maps[name] || (this.maps[name] = this.parseFile(basename));
  }
}

export default postcss.plugin('postcss-map', opts => {
  const parser = new MapParser(opts);

  return css => {
    css.eachDecl(parser.processDecl.bind(parser));
    css.eachAtRule(parser.processAtRule.bind(parser));
  };
});
