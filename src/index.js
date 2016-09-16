import path from 'path';
import { readFile } from 'fs';
import postcss from 'postcss';
import yaml from 'js-yaml';
import Visitor from './visitor';

export default postcss.plugin('postcss-map', opts => {
  opts = Object.assign({
    maps: [],
    basePath: process.cwd(),
    defaultMap: 'config',
  }, opts);

  let filtered = [];
  let maps = Object.create(null);
  let paths = opts.maps.filter(map => {
    if (typeof map === 'string' && filtered.indexOf(map) === -1) {
      filtered.push(map);
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
        resolve(data);
      });
    })
    .then(function (data) {
      let name = path.basename(map, path.extname(map));
      maps[name] = yaml.safeLoad(data, {
        filename: map,
      });
    });
  });

  return css => {
    return Promise.all(promises).then(() => {
      const visitor = new Visitor(opts, maps);

      css.walk(node => {
        if (node.type === 'decl') {
          return visitor.processDecl(node);
        }
        if (node.type === 'atrule') {
          return visitor.processAtRule(node);
        }
      });
    });
  };
});
