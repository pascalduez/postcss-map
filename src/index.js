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
      const visitor = new Visitor(opts, maps);

      css.walk(node => {
        switch (node.type) {
          case 'decl':
            return visitor.processDecl(node);

          case 'atrule':
            return visitor.processAtRule(node);
        }
      });
    });
  };
});
