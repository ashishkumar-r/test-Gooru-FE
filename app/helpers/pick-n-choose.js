import Ember from 'ember';

/**
 * Helper used to validate the answer object with user answer
 */
export default Ember.Helper.helper(([baseAnswer, userAnswers]) => {
  let hasAnswer = userAnswers.find(item => item.value === baseAnswer.id);
  if (hasAnswer) {
    return baseAnswer.is_correct === '1' ? 'correct' : 'incorrect';
  }
  return '';
});
