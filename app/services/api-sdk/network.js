import Ember from 'ember';
import NetworkSerializer from 'gooru-web/serializers/network/network';
import NetworkAdapter from 'gooru-web/adapters/network/network';

/**
 * Service to support the Profile CRUD operations
 *
 * @typedef {Object} ProfileService
 */
export default Ember.Service.extend({
  session: Ember.inject.service(),

  networkSerializer: null,

  networkAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'networkSerializer',
      NetworkSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'networkAdapter',
      NetworkAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets the current user Profile information
   *
   * @returns {Promise}
   */
  readMyNetwork: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service.get('networkAdapter').readMyNetwork().then(
        function(response) {
          resolve(
            service.get('networkSerializer').normalizeReadNetwork(response)
          );
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Gets user network information of a given user id
   *
   * @returns {Promise}
   */
  readUserNetwork: function(userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service.get('networkAdapter').readUserNetwork(userId).then(
        function(response) {
          resolve(
            service.get('networkSerializer').normalizeReadNetwork(response)
          );
        },
        function(error) {
          reject(error);
        }
      );
    });
  }
});
