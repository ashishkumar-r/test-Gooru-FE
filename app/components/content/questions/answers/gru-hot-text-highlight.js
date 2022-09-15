import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { QUESTION_CONFIG, QUESTION_TYPES } from 'gooru-web/config/question';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'questions', 'answers', 'gru-hot-text-highlight'],

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.setupAnswer();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    changeType: function(type) {
      const component = this;
      component.set('answers.firstObject.highlightType', type);
      Ember.run(function() {
        var $textarea = component.$().find('.gru-textarea textarea');
        $textarea.focus().val(`${$textarea.val()} `).trigger('blur'); // Forces the validation of the textarea
      });
    }
  },

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
   * Indicates if the answer is for word selections
   */
  isHotTextHighlightWord: Ember.computed(
    'answers.firstObject.highlightType',
    function() {
      return this.get('answers.firstObject.highlightType') === 'word';
    }
  ),

  /**
   * Indicates if the answer is for sentence selections
   */
  isHotTextHighlightSentence: Ember.computed(
    'answers.firstObject.highlightType',
    function() {
      return this.get('answers.firstObject.highlightType') === 'sentence';
    }
  ),

  // -------------------------------------------------------------------------
  // Methods
  setupAnswer() {
    var component = this;
    if (component.get('editMode')) {
      let answers = component.get('answers');
      if (answers.length === 0) {
        answers.pushObject(
          Answer.create(Ember.getOwner(component).ownerInjection(), {
            isCorrect: true,
            type: 'text',
            text: '',
            highlightType:
              QUESTION_CONFIG[QUESTION_TYPES.hotTextHighlight].defaultType
          })
        );
      }
    }
  }
});
