import Ember from 'ember';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Methods

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller) {
    controller.resetProperties();
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the Forgot Password Confirmation page is closed
     */
    close: function() {
      this.transitionTo('sign-in');
    }
  }
});
