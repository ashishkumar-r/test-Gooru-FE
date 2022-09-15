import Ember from 'ember';

/**
 * Add one
 */
export function isImageUrl([value] /*, options*/) {
  let str = value.toString().match(/^http.*\.(jpeg|jpg|gif|png)$/) != null;
  return str;
}

export default Ember.Helper.helper(isImageUrl);
