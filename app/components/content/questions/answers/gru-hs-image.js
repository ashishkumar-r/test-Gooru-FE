import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-hs-image'],
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        isCorrect: false,
        type: 'text'
      });
      this.get('answers').pushObject(newChoice);
    },
    //Remove existing answer
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
    },
    //Select correct answer
    setCorrect: function(answer) {
      Ember.set(answer, 'isCorrect', true);
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * Hotspot Image Question Answers
   * */

  answers: null,
  /**
   *  Hotspot Image  max answers
   * */
  maxAnswers: 10,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @type {Ember.A}
   */
  hasLimitAnswers: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  })
});
