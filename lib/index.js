import postcss from 'postcss';
import Parser from './parser';

export default postcss.plugin('postcss-map', opts => {
  const parser = new Parser(opts);

  return css => {
    css.walkDecls(::parser.processDecl);
    css.walkAtRules(::parser.processAtRule);
  };
});
