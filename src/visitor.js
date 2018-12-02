import { list } from 'postcss';
import rfc from 'reduce-function-call';
import postcss from 'postcss';

const reMap = /map\(.*\)/;

export default class Visitor {
  constructor(opts = {}, maps = {}) {
    this.opts = opts;
    this.maps = maps;
    this.variables = this.listProperties(maps);
    this.declarations = Object.create(null);
  }

  /**
   * Parse and replace maps in declarations values.
   * @param {Object} decl
   */
  processDecl(decl) {
    if (!reMap.test(decl.value)) return;

    decl.value = rfc(decl.value, 'map', body =>
      this.getValue(list.comma(body), decl)
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
    let properties = normalized.reduce((map, prop) => {
      if (!(prop in map)) {
        throw rule.error(`Could not find map block '${normalized.join('.')}'.`);
      }

      return map[prop];
    }, this.maps);

    Object.keys(properties).forEach(prop =>
      rule.parent.insertBefore(rule, {
        prop,
        value: this.getValue([...normalized, prop]),
        source: rule.source,
      })
    );

    rule.remove();
  }

  /**
   * Parse and replace maps in at-rules parameters.
   * @param {Object} rule
   */
  replaceAtRuleParam(rule) {
    rule.params = rfc(rule.params, 'map', body =>
      this.getValue(list.comma(body), rule)
    );
  }

  /**
   * Get value from a deep nested object properties.
   * @param {Array} args
   * @return {*}
   */
  getValue(args, node) {
    let normalized = this.normalize(args);
    let variable = normalized.join('-');

    if (!(variable in this.variables)) {
      throw node.error(`Could not find map value '${normalized.join('.')}'.`);
    }

    this.createDeclaration(variable);

    return `var(--${variable})`;
  }

  createDeclaration(variable) {
    if (!(variable in this.declarations)) {
      let decl = postcss.decl({
        prop: '--' + variable,
        value: this.variables[variable].toString(),
        raws: { before: '\n  ', after: '\n' },
      });
      this.processDecl(decl);
      this.declarations[variable] = decl;
    }
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

    return args;
  }

  listProperties(obj) {
    let properties = Object.create(null);

    for (let [key, subobj] of Object.entries(obj)) {
      if (subobj instanceof Object) {
        for (let [piece, value] of Object.entries(
          this.listProperties(subobj)
        )) {
          properties[`${key}-${piece}`] = value;
        }
      } else {
        properties[key] = subobj;
      }
    }

    return properties;
  }

  getDeclarations(includeUnused) {
    if (includeUnused) {
      Object.keys(this.variables).forEach(variable =>
        this.createDeclaration(variable)
      );
    }

    return Object.values(this.declarations);
  }
}
