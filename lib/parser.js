import { list } from 'postcss';
import rfc from 'reduce-function-call';

const reMap = /((?:map)\()(.*)(\))/;

export default class Parser {
  constructor(opts = {}, maps = {}) {
    this.opts = opts;
    this.maps = maps;
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

    rule.remove();
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

    return props.reduce((acc, prop) => (acc[prop]), this.maps[name]);
  }

  /**
   * Get map name usable with the short syntax.
   * @param {String} name
   * @return {Boolean|String}
   */
  useShortcutMap(name) {
    if (name in this.maps)
      return false;
    if (this.opts.defaultMap in this.maps)
      return this.opts.defaultMap;
    let names = Object.keys(this.maps);
    if (names.length === 1)
      return names[0];
  }
}
