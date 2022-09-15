import Ember from 'ember';
import GruHSTextComponent from './gru-hs-text';

/**
 * Hot Spot Image
 *
 * Component responsible for controlling the logic and appearance of a hot spot
 * image question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments components/player/questions/gru-hs-text.js
 */
export default GruHSTextComponent.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-hs-image'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String} itemType
   */
  itemType: 'hs-image',

  /*
   * @prop {String} instructions - Question instructions
   */
  instructions: Ember.computed(function() {
    var action = this.get('i18n').t(this.get('instructionsActionTextKey'))
      .string;
    return this.get('i18n').t('gru-hs-image.instructions', { action });
  }),

  /*
   * @typedef answers
   * @prop {id} id - answer id
   * @prop {string} content - url string for an image
   */
  answers: Ember.computed.map('question.answers', function(answer) {
    return {
      id: answer.get('id'),
      content: answer.get('text')
    };
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
