import Ember from 'ember';

/**
 * Grade Items component
 *
 * Component responsible to show questions pending grading in the teacher class performance tab
 * This component can be reused across the entire application and can be styled as needed,
 * functionality should remain the same
 *
 * @module
 * @augments Ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-grade-items'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Trigger to open free response question grade pull
     * @param  {Object} itemToGrade
     */
    openReportGrade(itemToGrade) {
      this.sendAction('openReportGrade', itemToGrade);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * The Items needs to grade
   * @property {GradeItem[]} items
   */
  gradeableItems: Ember.A(),

  /**
   * Maintains the state of question items to grade pull up
   * @type {Boolean}
   */
  showFRQuestionGrade: false

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
