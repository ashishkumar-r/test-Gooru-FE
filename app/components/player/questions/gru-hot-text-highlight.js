import QuestionComponent from './gru-question';
import Ember from 'ember';

/**
 * Hot Text Highlight
 *
 * Component responsible for controlling the logic and appearance of a hot
 * text question inside of the {@link player/gru-question-viewer.js}
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
  classNames: ['gru-hot-text-highlight'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Select or unselect an item
     * @param {{index: number, text: string, selected: boolean}} item
     */
    markItem: function(item) {
      const component = this;
      if (!component.get('readOnly')) {
        item.set('selected', !item.get('selected'));
        component.notifyEvents(component.getSelectedItems(), false);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events
  /**
   * Generate items from question answer choices
   */
  initItems: function() {
    const component = this;
    component.generateItems();
    if (component.get('hasUserAnswer')) {
      component.notifyEvents(component.getSelectedItems(), true);
    }
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {{index: number, text: string}} items
   */
  items: null,
  // -------------------------------------------------------------------------
  // Observers
  /**
   * Refresh items when the question changes
   */

  refreshItems: Ember.observer('question.id', function() {
    this.generateItems();
  }),
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Notifies events based on selected items
   * @param {{index: number, text: string, selected: boolean}} selectedItems
   * @param {boolean} onLoad if this was called when loading the component
   */
  notifyEvents: function(selectedItems, onLoad) {
    const component = this;
    const questionUtil = component.get('questionUtil');
    const userAnswer = selectedItems.map(function(item) {
      return { index: item.get('index'), text: item.get('text') };
    });

    const correct = questionUtil.isCorrect(userAnswer);
    component.notifyAnswerChanged(userAnswer, correct);
    if (selectedItems.get('length')) {
      if (onLoad) {
        component.notifyAnswerLoaded(userAnswer, correct);
      } else {
        component.notifyAnswerCompleted(userAnswer, correct);
      }
    } else {
      component.notifyAnswerCleared(userAnswer);
    }
  },

  /**
   * Generate phrase items from the first question answer text
   * It handle word and sentence variants, and it sets the 'items' component property accordingly
   */
  generateItems: function() {
    const component = this;
    const util = component.get('questionUtil');
    let items = util.getItems();

    if (component.get('hasUserAnswer')) {
      let userAnswer = component.get('userAnswer');
      items.forEach(function(item) {
        let selected = userAnswer.findBy('index', item.get('index'));
        item.set('selected', selected !== undefined);
      });
    }
    component.set('items', items);
  },

  /**
   * Returns those items selected by the user
   * @returns {{index: number, text: string, selected: boolean}[]} selected items
   */
  getSelectedItems: function() {
    return this.get('items').filterBy('selected', true);
  }
});
