import Ember from 'ember';
import QuestionComponent from './gru-question';

/**
 * SERP - Sorting
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

  classNames: ['gru-sorting'],

  // --------------------------------------------------------------------------
  // Properties

  answers: Ember.computed('question.answers', function() {
    return this.get('question.answers');
  }),

  // -------------------------------------------------------------------------
  // Actions
  actions: {},

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this.initialize();
  },

  // -----------------------------------------------------------------------
  // Methods

  initialize() {
    let component = this;
    component.$(function() {
      component
        .$('.list-item-blk li, .column-soft-blk li, .column-hard-blk li')
        .draggable({
          helper: 'clone',
          revert: 'invalid'
        });

      component.$('.column-hard-blk, .column-soft-blk').droppable({
        tolerance: 'intersect',
        drop: function(event, ui) {
          $(this).append($(ui.draggable));
        }
      });
    });
  }
});
