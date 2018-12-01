import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import postcss from 'postcss';
import yaml from 'js-yaml';
import glob from 'tiny-glob';
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

  const filesSet = new Set();
  const maps = Object.create(null);

  return async (css, result) => {
    await Promise.all(
      opts.maps.map(async map => {
        if (typeof map === 'object') {
          Object.assign(maps, map);
          return;
        }

        const files = await glob(map, {
          cwd: opts.basePath || '.',
          filesOnly: true,
          absolute: true,
        });

        if (files.length === 0) {
          result.warn(`Could not find map file '${map}'.`);
        }

        for (const filename of files) {
          if (filesSet.has(filename)) continue;

          filesSet.add(filename);

          let ext = path.extname(filename);
          let name = path.basename(filename, ext);
          if (ext === '.js' || ext === '.mjs') {
            maps[name] = (await import(filename)).default;
          } else {
            let data = await readFile(filename, 'utf-8');
            maps[name] = yaml.safeLoad(data, { filename });
          }
        }
      })
    );

    const variables = listProperties(maps);

    const visitor = new Visitor(opts, maps, Object.keys(variables));

    css.walk(node => {
      switch (node.type) {
        case 'decl':
          return visitor.processDecl(node);

        case 'atrule':
          return visitor.processAtRule(node);
      }
    });

    const used = visitor.getUsedVariables();

    const nodes = Object.entries(variables).reduce((arr, [prop, value]) => {
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

    if (nodes.length === 0) return;

    css.prepend(postcss.rule({ selector: ':root', nodes }));
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
