import Ember from 'ember';
import { getQuestionConfig } from 'gooru-web/config/question';

/**
 * Return the question config object
 */
export function questionConfig(value /*, options*/) {
  const questionType = value[0];
  const propertyPath = value.length > 1 ? value[1] : undefined;
  return getQuestionConfig(questionType, propertyPath);
}

export default Ember.Helper.helper(questionConfig);
