import Ember from 'ember';

/**
 * Make a substraction
 */
export function sub(value /*, options*/) {
  const total = value[0];
  const number = value[1];
  return +total - +number;
}

export default Ember.Helper.helper(sub);
