import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'questions', 'answers', 'gru-multiple-answer'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Add new answer choice
     */
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        isCorrect: false,
        type: 'text'
      });
      this.get('answers').pushObject(newChoice);
    },
    /**
     * Remove existing answer
     */
    removeChoice: function(answer) {
      this.get('answers').removeObject(answer);
    },
    /**
     * Select answer correctness
     */
    setCorrect: function(answer, value) {
      Ember.set(answer, 'isCorrect', value);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Hot Spot Text Answers
   */
  answers: null,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor')
});
