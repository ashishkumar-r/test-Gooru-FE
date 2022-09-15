import Ember from 'ember';

/**
 * Adapter to support the availability of username and email
 *
 * @typedef {Object} AvailabilityAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v2/profiles/search',

  /**
   * Gets the profile information of a given user id
   *
   * @param userId the unique profile user id
   * @returns {Promise}
   */
  verifyUsername: function(username) {
    const adapter = this;
    return adapter.verifyValue(username, { username: username });
  },

  verifyEmail: function(email) {
    const adapter = this;
    return adapter.verifyValue(email, { email: email });
  },

  verifyValue: function(value, data = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: data
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
