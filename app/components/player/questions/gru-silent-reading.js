import QuestionComponent from './gru-question';
import Ember from 'ember';

/**
 * Fill in the blank
 *
 * Component responsible for controlling the logic and appearance of a fill in the blank
 * question inside of the {@link player/gru-question-viewer.js}
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
  classNames: ['gru-silent-reading'],

  // -------------------------------------------------------------------------
  // Properties
  questions: Ember.computed(function() {
    return this.get('baseQuestion.answers');
  })

  // -------------------------------------------------------------------------
  // Actions
});
