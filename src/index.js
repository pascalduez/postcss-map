import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import postcss from 'postcss';
import yaml from 'js-yaml';
import Visitor from './visitor';

const readFile = promisify(fs.readFile);

export default postcss.plugin('postcss-map', opts => {
  opts = {
    maps: [],
    basePath: process.cwd(),
    defaultMap: 'config',
    inlcudeUnused: false,
    ...opts,
  };

  let filtered = [];
  let maps = Object.create(null);
  let paths = opts.maps
    .filter(map => {
      if (typeof map === 'string' && !filtered.includes(map)) {
        filtered.push(map);
        return true;
      }
      if (typeof map === 'object') {
        Object.assign(maps, map);
      }
    })
    .map(map => {
      return path.resolve(opts.basePath, map);
    });

  let promises = paths.map(async map => {
    let name = path.basename(map, path.extname(map));
    let data = await readFile(map, 'utf-8');
    maps[name] = yaml.safeLoad(data, {
      filename: map,
    });
  });

  return css => {
    return Promise.all(promises).then(() => {
      const variables = Object.entries(listProperties(maps));
      if (variables.length === 0) return;

      const visitor = new Visitor(opts, maps);

      css.walk(node => {
        switch (node.type) {
          case 'decl':
            return visitor.processDecl(node);

          case 'atrule':
            return visitor.processAtRule(node);
        }
      });

      const used = visitor.getUsedVariables();
      const nodes = variables.reduce((arr, [prop, value]) => {
        if (!opts.includeUnused && !used.has(prop)) return arr;

        arr.push(
          postcss.decl({
            prop: '--' + prop,
            value,
            raws: { before: '\n  ', after: '\n' },
          })
        );
        return arr;
      }, []);

      css.prepend(postcss.rule({ selector: ':root', nodes }));
    });
  };
});

function listProperties(obj) {
  let properties = Object.create(null);

  for (let [key, subobj] of Object.entries(obj)) {
    if (subobj instanceof Object) {
      for (let [piece, value] of Object.entries(listProperties(subobj))) {
        properties[`${key}-${piece}`] = value;
      }
    } else {
      properties[key] = subobj;
    }
  }

  return properties;
}
