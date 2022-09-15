import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

/**
 *
 * Component for building an open-ended question
 *
 * @module
 * @augments Ember/Component
 *
 */

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-open-ended'],

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var answers = this.get('answers');
    if (!answers || !answers.length) {
      let answer = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        isCorrect: true,
        type: 'text'
      });
      this.get('answers').pushObject(answer);
    }
  },

  didUpdate() {
    this.$('.text-area-container textarea').trigger('blur');
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Question answer
   */
  answers: null
});
