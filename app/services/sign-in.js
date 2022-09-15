import Ember from 'ember';
import SignInAdapter from 'gooru-web/adapters/sign-in';
import SignInSerializer from 'gooru-web/serializers/sign-in';
/**
 * Service for the performance
 *
 * @typedef {Object} performanceService
 */
export default Ember.Service.extend({
  /**
   * @property {SignInAdapter} signInAdapter
   */
  signInAdapter: null,

  /**
   * @property {SignInSerializer} signInSerializer
   */
  signInSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'signInAdapter',
      SignInAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'signInSerializer',
      SignInSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * fetch user tenant accounts
   *
   * @param user object with the user email
   * @returns {Promise}
   */
  getUserTenantAccounts: function(user) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('signInAdapter')
        .getUserTenantAccounts(user)
        .then(function(responseData) {
          let tenantLists = service
            .get('signInSerializer')
            .normalizegetUserTenantAccounts(responseData);
          resolve(tenantLists);
        }, reject);
    });
  }
});
