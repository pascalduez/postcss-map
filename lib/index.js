import path from 'path';
import { readFile } from 'fs';
import postcss from 'postcss';
import yaml from 'js-yaml';
import Parser from './parser';

export default postcss.plugin('postcss-map', opts => {
  opts = opts || {};
  opts.maps = opts.maps || [];
  opts.basePath = opts.basePath || process.cwd();

  let filtered = [];
  let maps = Object.create(null);
  let paths = opts.maps.filter(map => {
    if (typeof map === 'string' && filtered.indexOf(map) === -1) {
      return true;
    }

    if (typeof map === 'object') {
      Object.assign(maps, map);
    }
  }).map(map => {
    return path.resolve(opts.basePath, map);
  });

  let promises = paths.map(map => {
    return new Promise((resolve, reject) => {
      readFile(map, 'utf-8', (err, data) => {
        if (err) {
          return reject(err);
        }

        try {
          let { name } = path.parse(map);
          maps[name] = yaml.safeLoad(data);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  });

  return css => {
    return Promise.all(promises).then(() => {
      const parser = new Parser(maps);

      css.walk(node => {
        if (node.type === 'decl')
          return parser.processDecl(node);
        if (node.type === 'atrule')
          return parser.processAtRule(node);
      });
    });
  };
});
