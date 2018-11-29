import { list } from 'postcss';
import rfc from 'reduce-function-call';

const reMap = /map\(.*\)/;

export default class Visitor {
  constructor(opts = {}, maps = {}) {
    this.opts = opts;
    this.maps = maps;
    this.usedVariables = new Set();
  }

  /**
   * Parse and replace maps in declarations values.
   * @param {Object} decl
   */
  processDecl(decl) {
    if (!reMap.test(decl.value)) return;

    decl.value = rfc(decl.value, 'map', body =>
      this.getValue(list.comma(body))
    );
  }

  /**
   * Parse and proccess at-rules.
   * @param {Object} rule
   */
  processAtRule(rule) {
    if (rule.name === 'map') return this.replaceAtRuleBlock(rule);
    if (reMap.test(rule.params)) return this.replaceAtRuleParam(rule);
  }

  /**
   * Get and print at-rules map declarations.
   * @param {Object} rule
   */
  replaceAtRuleBlock(rule) {
    let normalized = this.normalize(list.space(rule.params));
    let properties = normalized.reduce((map, prop) => map[prop], this.maps);
    Object.keys(properties).forEach(prop => {
      let variable = `${normalized.join('-')}-${prop}`;
      this.usedVariables.add(variable);
      rule.parent.insertBefore(rule, {
        prop,
        value: `var(--${variable})`,
      });
    });

    rule.remove();
  }

  /**
   * Parse and replace maps in at-rules parameters.
   * @param {Object} rule
   */
  replaceAtRuleParam(rule) {
    rule.params = rfc(rule.params, 'map', body =>
      this.getValue(list.comma(body))
    );
  }

  /**
   * Get value from a deep nested object properties.
   * @param {Array} args
   * @return {*}
   */
  getValue(args) {
    let normalized = this.normalize(args);
    let variable = normalized.join('-');
    this.usedVariables.add(variable);
    return `var(--${variable})`;
  }

  /**
   * Normalize map path taking into account short syntax.
   * @param {Array} args
   * @return {Array}
   */
  normalize(args) {
    if (args[0] in this.maps) return args;
    if (this.opts.defaultMap in this.maps) {
      return [this.opts.defaultMap, ...args];
    }

    let names = Object.keys(this.maps);
    if (names.length === 1) return [names[0], ...args];
  }

  /**
   * Returns a `Set` of all variables used by the processed css.
   * @return {Set}
   */
  getUsedVariables() {
    return this.usedVariables;
  }
}
