import Ember from 'ember';
import ConfirmProfileMergeAdapter from 'gooru-web/adapters/confirm-profile-merge';
import AuthenticationAdapter from 'gooru-web/adapters/authentication/authentication';

export default Ember.Service.extend({
  /**
   * @property {ConfirmProfileMergeAdapter} ConfirmProfileMergeAdapter
   */
  ConfirmProfileMergeAdapter: null,

  authenticationAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'ConfirmProfileMergeAdapter',
      ConfirmProfileMergeAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'authenticationAdapter',
      AuthenticationAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  getApproveMerge: function(token) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('ConfirmProfileMergeAdapter')
        .getApproveMerge(token)
        .then(response => {
          resolve(response), reject;
        });
    });
  },

  getRejectMerge: function(token, userId) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('ConfirmProfileMergeAdapter')
        .getRejectMerge(token, userId)
        .then(response => {
          resolve(response), reject;
        });
    });
  },

  createUlid: function(token) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('ConfirmProfileMergeAdapter')
        .createUlid(token)
        .then(response => {
          resolve(response), reject;
        });
    });
  },

  /**
   * Authenticates as a normal user using access token
   * @param accessToken user access token
   * @returns {Object} the normalized response from the endpoint
   */
  authenticateWithToken: function(accessToken) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('authenticationAdapter')
        .checkToken({
          accessToken
        })
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            resolve(error.status);
          }
        );
    });
  }
});
