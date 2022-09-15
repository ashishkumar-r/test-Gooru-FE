import Ember from 'ember';
import { getQuestionTypeConfig } from 'gooru-web/config/question';

/**
 * Return the question config object
 */
export function questionTypeConfig(value) {
  const questionType = value[0];
  const propertyPath = value.length > 1 ? value[1] : undefined;
  return getQuestionTypeConfig(questionType, propertyPath);
}

export default Ember.Helper.helper(questionTypeConfig);
