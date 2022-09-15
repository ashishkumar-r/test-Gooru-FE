import Ember from 'ember';

/**
 * Add one
 */
export function plusOne(value /*, options*/) {
  return +value + 1;
}

export default Ember.Helper.helper(plusOne);
