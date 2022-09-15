import Ember from 'ember';
import SkylineAdapter from 'gooru-web/adapters/skyline-initial/skyline-initial';
import SkylineSerializer from 'gooru-web/serializers/skyline-initial/skyline-initial';

/**
 * Service for the skyline initial
 *
 * @typedef {Object} skylineInitialService
 */

export default Ember.Service.extend({
  skylineAdapter: null,

  skylineSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'skylineAdapter',
      SkylineAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'skylineSerializer',
      SkylineSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get state of skyline initialization
   * @returns {Promise.<[]>}
   */
  fetchState: function(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('skylineAdapter')
        .fetchState(classId)
        .then(function(response) {
          resolve(
            service.get('skylineSerializer').normalizeFetchState(response)
          );
        }, reject);
    });
  },

  /**
   * calculate skyline
   * @returns {Promise.<[]>}
   */
  calculateSkyline: function(classId, userIds) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('skylineAdapter')
        .calculateSkyline(classId, userIds)
        .then(function() {
          resolve();
        }, reject);
    });
  }
});
