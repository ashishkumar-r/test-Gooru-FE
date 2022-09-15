import Ember from 'ember';

/**
 * Minus one
 */
export function minusAny([value, count]) {
  return value - count;
}

export default Ember.Helper.helper(minusAny);
