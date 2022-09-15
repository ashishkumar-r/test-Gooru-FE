import Ember from 'ember';
import QuestionResult from 'gooru-web/models/result/question';

export default Ember.Component.extend({
  // ------------------------------------------------------------------
  // Attributes
  classNames: ['gru-comprehension'],

  // -------------------------------------------------------------------
  // Properties

  questionDetails: null,

  // isInputDisabled: false,

  subQuestionList: Ember.computed('baseQuestion', function() {
    let subQuestion = this.get('baseQuestion.subQuestions') || Ember.A();
    return subQuestion.map(item => {
      item.setProperties({
        playerQuestion: item.toPlayerResource(),
        questionResult: QuestionResult.create({})
      });
      return item;
    });
  })

  // -------------------------------------------------------------------
  // Events

  // ------------------------------------------------------------------
  // Actions

  // ------------------------------------------------------------------
  // Methods
});
