import Ember from 'ember';

/**
 * Render math equestion from string
 */
export function katexMath([equation] /*, options*/) {
  return katex.renderToString(equation);
}

export default Ember.Helper.helper(katexMath);
