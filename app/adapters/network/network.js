import Ember from 'ember';

/**
 * Adapter to support the Network (followers and following) CRUD operations in the API 3.0
 *
 * @typedef {Object} NetworkAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/profiles',

  /**
   * Gets my network information
   *
   * @returns {Promise}
   */
  readMyNetwork: function() {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const myUserId = this.get('session.userId');
    const url = `${namespace}/${myUserId}/network`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: { details: 'followers' }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets network information for a given user id
   *
   * @returns {Promise}
   */
  readUserNetwork: function(userId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${userId}/network`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: { details: '' }
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
