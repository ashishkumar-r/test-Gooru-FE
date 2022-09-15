import Ember from 'ember';

/**
 * @param value {Number}
 * @returns {Boolean} - True if value is even, false if value is odd
 */
export function isEven([value, numberCount = 2]) {
  return value % numberCount === 0;
}

export default Ember.Helper.helper(isEven);
