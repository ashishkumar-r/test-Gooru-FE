import Ember from 'ember';

/**
 * @function localeTranslation
 * @param {Array} params
 * @return {String}
 * Method to show translated string if available otherwise default string will be visibile to users
 */
export function localeTranslation(params /*, hash*/) {
  let localeTranslationString = params[0] || null;
  let defaultString = params[1] || '';
  return localeTranslationString && localeTranslationString.string
    ? localeTranslationString.string
    : defaultString;
}

export default Ember.Helper.helper(localeTranslation);
