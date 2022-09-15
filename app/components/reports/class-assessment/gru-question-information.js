import Ember from 'ember';
/**
 * Questions information component
 *
 * Component responsible for display the question performance information
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-question-information'],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @prop { Question} question - Question to display
   */
  question: null,

  /**
   * @prop { String[]} hints - Question hints
   */
  hints: Ember.computed('question.hints', function() {
    return this.get('question.hints');
  }),

  /**
   * @prop { String[]} explanation - Question explanation
   */
  explanation: Ember.computed('question.explanation', function() {
    return this.get('question.explanation');
  }),
  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: null
});
