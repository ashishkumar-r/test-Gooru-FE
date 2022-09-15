import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    token: {
      refreshModel: true
    },
    not_verified: {
      refreshModel: true
    }
  },

  model(params) {
    return {
      token: params.token,
      not_verified: params.not_verified
    };
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.updateEmailVerification(model.token);
    controller.set('token', model.token);
    controller.set('not_verified', model.not_verified);
  },
  /**
   * Reset queryParam values
   */
  resetController(controller) {
    controller.set('token', undefined);
    controller.set('not_verified', undefined);
  }
});
