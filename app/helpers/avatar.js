import Ember from 'ember';

/**
 * Add one
 */
export function avatar(value /*, options*/) {
  let str = value[0];
  return str.substring(0, 1);
}

export default Ember.Helper.helper(avatar);
