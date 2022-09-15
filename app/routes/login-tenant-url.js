import Ember from 'ember';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * The session service.
   * @property session
   * @readOnly
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Methods
  model: function(params) {
    return params;
  },

  beforeModel() {
    let route = this;
    if (!route.get('session.isAnonymous')) {
      return route.transitionTo('index');
    }
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller) {
    controller.resetProperties();
  }
});
