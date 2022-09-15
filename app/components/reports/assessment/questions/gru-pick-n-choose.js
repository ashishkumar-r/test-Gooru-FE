import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-pick-n-choose'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} showCorrect help to hide/show correct answer to users
   */
  showCorrect: false,

  userAnswers: Ember.computed.alias('userAnswer'),

  baseAnswers: Ember.computed('question', function() {
    return this.get('question.answers');
  }),

  // -----------------------------------------------------------------------
  // Events
  didInsertElement() {
    let component = this;
    if (!component.get('showCorrect')) {
      let baseAnswers = component.get('baseAnswers');
      let userAnswers = component.get('userAnswers');
      baseAnswers.forEach((item, index) => {
        let hasAnswer =
          (userAnswers &&
            userAnswers[index] &&
            userAnswers[index].answerId === 'WWVz') ||
          userAnswers[index].selection === true;
        if (hasAnswer) {
          item.set('userStatus', item.isCorrect ? 'correct' : 'incorrect');
        }
      });
    }
  }
});
