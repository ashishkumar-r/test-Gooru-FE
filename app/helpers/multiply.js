import Ember from 'ember';

/**
 * @function multiply
 * @param {Array[number]} values
 * Helper method to multiply given list of values
 */
export function multiply(values /*, hash*/) {
  let multiplyValue = 1;
  if (values && values.length) {
    values.map(value => {
      multiplyValue = multiplyValue * value;
    });
  } else {
    multiplyValue = 0;
  }
  return multiplyValue;
}

export default Ember.Helper.helper(multiply);
