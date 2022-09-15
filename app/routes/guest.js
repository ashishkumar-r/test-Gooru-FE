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

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * @requires service:authentication
   */
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  /**
   * @property {TenantService}
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Maintains the state of anonymous session data.
   * @type {Session}
   */
  anonymousSessionData: null,

  // -------------------------------------------------------------------------
  // Methods
  model: function(params) {
    return params;
  },

  beforeModel(transition) {
    let route = this;
    if (!route.get('session.isAnonymous')) {
      route.transitionTo('logout', { queryParams: { isGuestAccount: true } });
    } else {
      let nonce = transition.queryParams.nonce;
      let authenticationService = this.get('authenticationService');
      return authenticationService.authenticateAsAnonymous(nonce).then(data => {
        route.set('anonymousSessionData', data);
        return route
          .get('session')
          .authenticateAsAnonymousWithData(data)
          .then(() => {
            return {}; // Note removed tenant setting json API
          });
      });
    }
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller) {
    // remove old notifications
    this.get('notifications').remove();
    controller.set('anonymousSessionData', this.get('anonymousSessionData'));
    controller.resetProperties();
  }
});
