import Ember from 'ember';

export default Ember.Route.extend({
  queryParams: {
    token: '',
    user_id: ''
  },

  model(params) {
    return {
      token: params.token,
      userId: params.user_id
    };
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.resetProperties();
    controller.set('token', model.token);
    controller.set('userId', model.userId);
  }
});
