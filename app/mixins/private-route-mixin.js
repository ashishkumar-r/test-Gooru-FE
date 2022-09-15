import Ember from 'ember';

/**
 * TODO add this mixin to all the private routes
 * __This mixin is used to make routes accessible even if the session is
 * not authenticated__ It defines a
 * `beforeModel` method that checks if the token is still valid
 */
export default Ember.Mixin.create({
  /**
   * The session service.
   * @property session
   * @readOnly
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Authentication service
   */
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  /**
   * @property {Ember.Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  beforeModel() {
    const mixin = this;
    let currentUrl = window.location.href;
    if (mixin.get('session.isAnonymous')) {
      const queryParams = {
        queryParams: {
          redirectURL: currentUrl
        }
      };
      return mixin.transitionTo('login', queryParams);
    }
    var sessionService = mixin.get('sessionService');
    if (!sessionService.hasTokenExpired()) {
      return Ember.RSVP.resolve(mixin._super(...arguments));
    }
    return mixin
      .get('authenticationService')
      .checkToken(mixin.get('session.token-api3'))
      .then(
        function() {
          let session = mixin.get('session');
          session.set('userData.providedAt', Date.now());
          return sessionService.updateUserData(session.get('userData'));
        },
        function() {
          const queryParams = {
            queryParams: {
              sessionEnds: 'true',
              redirectURL: currentUrl
            }
          };
          return mixin.transitionTo('login', queryParams);
        }
      );
  }
});
