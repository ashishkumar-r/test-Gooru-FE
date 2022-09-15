import Ember from 'ember';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: {
    redirectURL: {},
    isConfirmProfile: {}
  },

  /**
   * The session service.
   * @property session
   * @readOnly
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:authentication
   */
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  // -------------------------------------------------------------------------
  // Methods
  model: function(params) {
    return params;
  },

  beforeModel(transition) {
    let route = this;
    if (!route.get('session.isAnonymous')) {
      return route.transitionTo('index');
    } else {
      let nonce = transition.queryParams.nonce;
      let authenticationService = this.get('authenticationService');
      return authenticationService.authenticateAsAnonymous(nonce).then(data => {
        route.set('anonymousSessionData', data);
        return route
          .get('session')
          .authenticateAsAnonymousWithData(data)
          .then(() => {
            let applicationController = route.controllerFor('application');
            return Ember.RSVP.all([
              applicationController.loadTranslationLabels()
            ]);
          });
      });
    }
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    if (model.isConfirmProfile) {
      controller.set('redirectURL', window.atob(model.redirectURL));
    }
    controller.resetProperties();
  }
});
