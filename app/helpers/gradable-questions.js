import Ember from 'ember';
import { GRADABLE_QUESTION_TYPES } from 'gooru-web/config/question';

/**
 * Return the question config object
 */
export function gradableQuestion(type) {
  let qtype = GRADABLE_QUESTION_TYPES;
  if (qtype.includes(type[0])) {
    return true;
  } else {
    return false;
  }
}

export default Ember.Helper.helper(gradableQuestion);
