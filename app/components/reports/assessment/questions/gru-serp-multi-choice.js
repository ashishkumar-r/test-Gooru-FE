import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-serp-multi-choice'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} showCorrect help to hide/show correct answer to users
   */
  showCorrect: false
});
