import Ember from 'ember';
import AuthenticationSerializer from 'gooru-web/serializers/authentication/authentication';
import AuthenticationAdapter from 'gooru-web/adapters/authentication/authentication';
import ProfileAdapter from 'gooru-web/adapters/profile/profile';

/**
 * Service for the Authentication (Login) with API 3.0
 *
 * @typedef {Object} AuthenticationService
 */
export default Ember.Service.extend({
  authenticationSerializer: null,

  authenticationAdapter: null,

  profileAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'authenticationSerializer',
      AuthenticationSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'authenticationAdapter',
      AuthenticationAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'profileAdapter',
      ProfileAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Authenticates as an anonymous account
   *
   * @returns {Object} the a normalized response from the endpoint
   */
  authenticateAsAnonymous: function(nonce) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .postAuthentication({
          isAnonymous: true,
          nonce: nonce
        })
        .then(
          function(response) {
            resolve(
              service
                .get('authenticationSerializer')
                .normalizeResponse(response, true)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Authenticates as a normal user using the credentials
   * @param username account username
   * @param password account password
   * @returns {Object} the normalized response from the endpoint
   */
  authenticateWithCredentials: function(username, password) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .postAuthentication({
          isAnonymous: false,
          username: username,
          password: password
        })
        .then(function(response) {
          resolve(
            service
              .get('authenticationSerializer')
              .normalizeResponse(response, false)
          );
        }, reject);
    });
  },

  /**
   * Authenticates as a normal user using access token
   * @param accessToken user access token
   * @returns {Object} the normalized response from the endpoint
   */
  authenticateWithToken: function(accessToken) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .postAuthenticationWithToken({
          accessToken
        })
        .then(function(response) {
          resolve(
            service
              .get('authenticationSerializer')
              .normalizeResponse(response, false, accessToken)
          );
        }, reject);
    });
  },

  /**
   * Checks if a token is valid
   * @param accessToken user access token
   */
  checkToken: function(accessToken) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .checkToken({
          accessToken
        })
        .then(resolve, reject);
    });
  },

  /**
   * Invalidates current token
   */
  signOut: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .signOut()
        .then(resolve, reject);
    });
  },

  /**
   * Find the domain name have any directions for authentication.
   * @param logged in bowser session domain name.
   */
  domainBasedRedirection: function(domain, redirectURL = null) {
    const service = this;
    let data = { domain: domain };
    if (redirectURL) {
      data.context_url = redirectURL;
    }
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('authenticationAdapter')
        .domainBasedRedirection(data)
        .then(function(response) {
          resolve(
            service
              .get('authenticationSerializer')
              .normalizeDomainRedirectResponse(response)
          );
        }, reject);
    });
  }
});
