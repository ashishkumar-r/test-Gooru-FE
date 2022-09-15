import Ember from 'ember';

/**
 * @func findPercentage
 * Method to find percentage from given number
 */
export function findPercentage(params /*, hash*/) {
  let percentage = 0;
  if (Ember.isArray(params)) {
    let wholeNumber = params[0] || 0;
    let givenNumber = params[1] || 0;
    percentage =
      wholeNumber && givenNumber ? (givenNumber / wholeNumber) * 100 : 0;
  }
  return percentage;
}

export default Ember.Helper.helper(findPercentage);
