import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-roster-header'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Open student roster
     */
    openRoster: function() {
      this.sendAction('onOpenRoster');
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Text to show as current response
   * @property {String} currentResponse
   */
  currentResponse: '',

  /**
   * Text to show as submitted at
   * @property {String} submittedAt
   */
  submittedAt: '',

  /**
   * Text to show as time spent
   * @property {String} currentResponse
   */
  timeSpent: ''
});
