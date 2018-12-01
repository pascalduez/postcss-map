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
  const promises = opts.maps.map(async map => {
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
      throw new Error(`Could not find map file '${map}'.`);
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
  });

  return async css => {
    await Promise.all(promises);

    const visitor = new Visitor(opts, maps);

    css.walk(node => {
      switch (node.type) {
        case 'decl':
          return visitor.processDecl(node);

        case 'atrule':
          return visitor.processAtRule(node);
      }
    });

    const nodes = visitor.getDeclarations(opts.includeUnused);
    if (nodes.length === 0) return;

    css.prepend(postcss.rule({ selector: ':root', nodes }));
  };
});
