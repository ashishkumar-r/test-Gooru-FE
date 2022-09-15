import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

/**
 *
 * Component for building (i.e. adding/removing answers) of a (drag/drop) re-order question
 *
 * @module
 * @augments Ember/Component
 *
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-reorder'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        isCorrect: true,
        type: 'text'
      });
      this.get('answers').pushObject(newChoice);
    },

    // Remove existing answer
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Question answers
   */
  answers: null,

  /**
   * Max number of answers
   */
  maxAnswers: 10,

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor'),

  /**
   * Max number of answers
   * */
  hasReachedAnswersLimit: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  })

  // -------------------------------------------------------------------------
  // Method
});
