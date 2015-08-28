import postcss from 'postcss';
import Parser from './parser';

export default postcss.plugin('postcss-map', opts => {
  return css => {
    const parser = new Parser(opts);

    css.walkDecls(::parser.processDecl);
    css.walkAtRules(::parser.processAtRule);
  };
});
