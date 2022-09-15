import Ember from 'ember';

/**
 * @function padStart
 * Method to add given repetition of given string
 */
export function padStart(params /*, hash*/) {
  let originalString = params[0] ? String(params[0]) : '';
  let paddingString = params[1] ? String(params[1]) : '';
  let numberOfRepetition = params[2] || 0;
  return originalString.padStart(numberOfRepetition, paddingString);
}

export default Ember.Helper.helper(padStart);
