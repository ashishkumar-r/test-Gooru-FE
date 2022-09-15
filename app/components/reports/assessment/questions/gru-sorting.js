import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-sorting'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} showCorrect help to hide/show correct answer to users
   */
  showCorrect: false,

  baseAnswers: Ember.computed('question', function() {
    return this.get('question.answers');
  }),

  userAnswers: Ember.computed('answerObj', function() {
    return this.get('answerObj')
      ? this.get('answerObj').map(item => {
        let textItem = JSON.parse(item.text)[0] || null;
        return {
          text: textItem ? textItem.answer_text : '',
          type: textItem ? textItem.answer_type : '',
          sequence: textItem ? textItem.sequence : ''
        };
      })
      : [];
  }),

  answerDetails: Ember.computed('question', function() {
    return this.get(this.get('showCorrect') ? 'baseAnswers' : 'userAnswers');
  })
});
