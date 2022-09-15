import Ember from 'ember';

/**
 * Rounds a float number and fixes the decimals to a specified number of digits.
 * @param n
 * @param decimals by default is 0
 * @returns {Number}
 */
export function roundFloat(n, decimals = 0) {
  const rounded = (Math.round(n * 10) / 10).toFixed(decimals);
  return parseFloat(rounded);
}

/**
 * Determines if a parameter is of type numeric
 * @see http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
 * @param n
 * @returns {bool}
 */
export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Determines if a parameter is of a decimal number
 * @param n
 * @returns {bool}
 */
export function isDecimal(n) {
  return roundFloat(n) === n;
}

/**
 * Sums all values
 * @param {number[]} values
 * @returns {number}
 */
export function sumAll(values) {
  return values.reduce((a, b) => a + b);
}

/**
 * Computes the average value from a set of values
 * @param {number[]} values - array of numbers
 * @returns {number}
 */
export function average(values) {
  var result = null;

  if (typeof values.reduce === 'function' && values.length) {
    let sum = sumAll(values);
    result = sum ? sum / values.length : sum;
  } else {
    Ember.Logger.warn('Unable to compute average on param: ', values);
  }
  return result ? roundFloat(result) : result;
}

/**
 * Method to calculate percentage from given number
 * @param {Number} wholeNumber
 * @param {Number} givenNumber
 * @return {Number} percentage value
 */
export function findPercentage(wholeNumber, givenNumber) {
  let percentage = 0;
  percentage =
    wholeNumber && givenNumber ? (givenNumber / wholeNumber) * 100 : 0;
  return percentage;
}
