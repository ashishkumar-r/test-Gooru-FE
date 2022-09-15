import Ember from 'ember';
import { EXCLUDE_SCORE_QUESTION_TYPES } from 'gooru-web/config/question';

/**
 * Add one
 */
export function showScore([item, fieldName]) {
  return EXCLUDE_SCORE_QUESTION_TYPES.indexOf(item.get(fieldName)) === -1;
}

export default Ember.Helper.helper(showScore);
