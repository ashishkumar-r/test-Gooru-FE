import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-words-per-minute'],

  didInsertElement() {
    this.get('answers').forEach(answer => {
      answer.set('isReadingType', true);
    });
    var ansLength = this.get('answers').length;
    if (ansLength === 0) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        isCorrect: true,
        isReadingType: true
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
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    },
    //Remove existing answer
    removeChoice: function(answer) {
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
