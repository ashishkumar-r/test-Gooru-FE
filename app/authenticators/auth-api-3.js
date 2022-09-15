import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

/**
 * The Ember Simple Auth authenticator for API 3.0
 *
 * @typedef {Object} AuthApi30
 */
export default BaseAuthenticator.extend({
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  restore: function(data) {
    return Ember.RSVP.resolve(data);
  },

  authenticate: function(options) {
    let promise;
    if (options.isAnonymous) {
      return this.get('authenticationService').authenticateAsAnonymous(
        options.nonce
      );
    } else if (options.hasAccessToken) {
      promise = this.get('authenticationService').authenticateWithToken(
        options.accessToken
      );
    } else if (options.hasUserData) {
      promise = new Ember.RSVP.Promise(function(resolve) {
        resolve(options.user);
      });
    } else {
      promise = this.get('authenticationService').authenticateWithCredentials(
        options.username,
        options.password
      );
    }
    return promise.then(response => {
      let localStorage = window.localStorage;
      let itemId = `${response.user.gooruUId}_logins`;
      let localStorageItem = localStorage.getItem(itemId);
      if (!localStorageItem) {
        localStorage.setItem(itemId, 1);
      } else {
        localStorage.setItem(itemId, +localStorageItem + 1);
      }
      return response;
    });
  }
});
