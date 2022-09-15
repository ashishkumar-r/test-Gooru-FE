import Ember from 'ember';
import { QUESTION_CONFIG } from 'gooru-web/config/question';

export default Ember.Component.extend({
  // ------------------------------------------------------------
  // Attributes
  classNames: ['gru-comprehension-new-question'],

  // ---------------------------------------------------------------
  // Properties

  /**
   * @property{Array{}} questionTypes
   */
  questionTypes: Ember.computed(function() {
    let question = [];
    Object.keys(QUESTION_CONFIG).forEach(item => {
      if (!QUESTION_CONFIG[item].serpType) {
        question.push(item);
      }
    });
    return question;
  })

  // --------------------------------------------------------------------
  // Events

  // ------------------------------------------------------------------
  // Actions

  // ------------------------------------------------------------------
  // Methods
});
