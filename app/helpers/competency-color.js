import Ember from 'ember';


/**
 * @function competencyColor
 * Method to get competency color based on status value
 */
export function competencyColor(params/*, hash*/) {
  let competencyStatus = params[0];
  let defaultColor = '#e7e8e9';
  let colorByStatus = {
    '0': '#e7e8e9',
    '1': '#1aa9eb',
    '2': '#006eb5',
    '3': '#006eb5',
    '4': '#006eb5',
    '5': '#006eb5'
  };
  let competencyColor = competencyStatus ? colorByStatus[`${competencyStatus}`] : defaultColor;
  return competencyColor;
}

export default Ember.Helper.helper(competencyColor);
