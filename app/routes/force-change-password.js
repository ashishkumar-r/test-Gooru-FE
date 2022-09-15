import Ember from 'ember';

export default Ember.Route.extend({
  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller) {
    controller.resetProperties();
  }
});
