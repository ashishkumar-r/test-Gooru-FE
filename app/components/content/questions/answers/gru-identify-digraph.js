import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-identify-digraph'],

  didInsertElement() {
    var ansLength = this.get('answers').length;
    if (ansLength === 0) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        isCorrect: true,
        correctAnswer: []
      });
      this.get('answers').pushObject(newChoice);
    }
  },
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        isCorrect: true,
        correctAnswer: []
      });
      this.get('answers').pushObject(newChoice);
    },
    //Remove existing answer
    removeChoice: function(answer) {
      if (this.get('references')) {
        this.get('references').map(firstResult => {
          if (
            firstResult.answer_text &&
            answer.text &&
            firstResult.answer_text.trim() === answer.text.trim()
          ) {
            this.get('references').removeObject(firstResult);
          } else if (
            !firstResult.answer_text &&
            firstResult.answer_text !== answer.text
          ) {
            this.get('references').removeObject(firstResult);
          } else if (!firstResult.answer_text) {
            this.get('references').removeObject(firstResult);
          }
        });
      }
      this.get('answers').removeObject(answer);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: null,
  /**
   * Multiple Choice max answers
   * */
  maxAnswers: 10,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor'),

  /**
   * @type {Ember.A}
   */
  hasLimitAnswers: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  })
});
