import postcss from 'postcss';
import { MapParser } from './parser';

export default postcss.plugin('postcss-map', opts => {
  const parser = new MapParser(opts);

  return css => {
    css.eachDecl(::parser.processDecl);
    css.eachAtRule(::parser.processAtRule);
  };
});
