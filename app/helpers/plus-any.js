import Ember from 'ember';

/**
 * @function plusAny
 * Method to return addition of passed arguments
 */
export function plusAny([value, num]) {
  return value + num;
}

export default Ember.Helper.helper(plusAny);
