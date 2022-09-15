import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'rubric', 'gru-fixed-footer'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Click button action
     */
    clickAction: function(action) {
      action();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {[]} actions List of action buttons to show in the footer
   */
  footerActions: []
});
