import Ember from 'ember';

/**
 * @function competencyGutToFwTransform
 * Method to return fw info or gut based on params
 */
export function competencyGutToFwTransform(params /*, hash*/) {
  const fwCompetencies = params[0] || [];
  const gutCode = params[1];
  const gutValue = params[2];
  const lookupKeyName = params[3];
  const showDefault = params[4];
  const doTransform = params[5];
  const message = params[6];
  const fwCompetency = fwCompetencies.find(fwCompetency => {
    return fwCompetency[gutCode];
  });
  if (doTransform) {
    return fwCompetency && !showDefault
      ? fwCompetency[gutCode][`${lookupKeyName}`]
      : gutValue;
  } else {
    return fwCompetencies.length && !fwCompetency && !showDefault
      ? message
      : '';
  }
}

export default Ember.Helper.helper(competencyGutToFwTransform);
