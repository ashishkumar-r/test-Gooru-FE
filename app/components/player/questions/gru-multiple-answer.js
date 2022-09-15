import Ember from 'ember';
import QuestionComponent from './gru-question';

/**
 * Multiple Answer Question
 *
 * Component responsible for controlling the logic and appearance of a multiple
 * answer question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments Ember/Component
 */
export default QuestionComponent.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-multiple-answer'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * When the user changes the answer choice selection
     * @param {string} answerId
     * @param {boolean} onLoad if this was called when loading the component
     */
    selectAnswerChoice: function(answerId) {
      const component = this;
      component.setUserAnswerChoice(answerId);
      component.notify(false);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    const userSelection = this.get('userAnswer') || Ember.A([]);
    this.set('userSelection', userSelection);
    if (this.get('hasUserAnswer')) {
      this.notify(true);
    }
  },
  // -------------------------------------------------------------------------
  // Properties
  /**
   * Convenient structure to render options
   * @property {[]}
   */
  answers: Ember.computed('question.answers', 'userAnswer', function() {
    const component = this;
    let answers = this.get('question.answers');
    let userAnswer = this.get('userAnswer');
    return answers.map(function(answer) {
      var answerId = answer.get('id');
      let userSelectionItem = userAnswer
        ? userAnswer.findBy('id', answerId)
        : null;
      return {
        id: answerId,
        text: answer.get('text'),
        groupValue: userSelectionItem
          ? component.userSelectionItemToChoice(userSelectionItem)
          : null
      };
    });
  }),

  didInsertElement: function() {
    const $fileInput = this.$('input[type="radio"]');
    if ($fileInput) {
      $fileInput.attr('title', 'checkbox');
    }
  },

  // -------------------------------------------------------------------------
  // Observers

  resetUserSelection: Ember.observer('question', function() {
    this.set('userSelection', Ember.A());
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Notifies answer events
   * @param {boolean} onLoad if this was called when loading the component
   */
  notify: function(onLoad) {
    const component = this;
    const questionUtil = component.get('questionUtil');
    let userSelection = component.get('userSelection').toArray();
    const correct = questionUtil.isCorrect(userSelection);

    component.notifyAnswerChanged(userSelection, correct);

    if (component.isAnswerCompleted()) {
      if (onLoad) {
        component.notifyAnswerLoaded(userSelection, correct);
      } else {
        component.notifyAnswerCompleted(userSelection, correct);
      }
    }
  },

  /**
   * Indicates when the answer is completed
   * @return {boolean}
   */
  isAnswerCompleted: function() {
    const component = this,
      userSelection = component.get('userSelection'),
      totalAnswerChoices = component.get('question.answers.length');
    return userSelection.get('length') === totalAnswerChoices;
  },

  /**
   * Sets the user answer choice
   * @param {string} answerChoice containing the user selection yes|120202 or no|20200392
   */
  setUserAnswerChoice: function(answerChoice) {
    let userSelection = this.get('userSelection');
    let userSelectionItem = this.choiceToUserSelectionItem(answerChoice);
    let id = userSelectionItem.id;
    let selection = userSelectionItem.selection;
    let found = userSelection.findBy('id', id);
    if (found) {
      found.selection = selection;
    } else {
      userSelection.addObject(userSelectionItem);
    }
  },

  /**
   * Converts the answer choice string to a  user selection item
   * @param {string} answerChoice  in the format value|id, i.e yes|answer_1
   * @returns {{id: *, selection: boolean}}
   */
  choiceToUserSelectionItem: function(answerChoice) {
    let values = answerChoice.split('|');
    let id = values[1];
    let selection = values[0] === 'yes';
    return {
      id: id,
      selection: selection
    };
  },

  /**
   * Converts user selection item to answer choice
   * @param {{id: *, selection: boolean}} userSelectionItem
   *
   * @return {string} in the format value|id, i.e yes|answer_1
   */
  userSelectionItemToChoice: function(userSelectionItem) {
    const selection = userSelectionItem.selection ? 'yes' : 'no';
    return `${selection}|${userSelectionItem.id}`;
  }
});
