import Ember from 'ember';

/**
 * @function competencyLoTransform
 * Method to return lo info or gut based on params
 */
export function competencyLoTransform(params /*, hash*/ ) {
  const fwCompetencies = params[0] || [];
  const gutCode = params[1];
  const lookupKeyName = params[2];
  const showGutCompetency = params[3];
  const delimiterText = params[4];
  const fwCompetency = fwCompetencies.find(fwCompetency => {
    return fwCompetency[gutCode];
  });
  if (!showGutCompetency && fwCompetency && fwCompetency[gutCode] &&
    fwCompetency[gutCode][`${lookupKeyName}`]) {
    return `${delimiterText} ${fwCompetency[gutCode][`${lookupKeyName}`]}`;
  }
  return '';
}

export default Ember.Helper.helper(competencyLoTransform);
