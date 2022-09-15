import Ember from 'ember';

/**
 * Adapter to support the skyline initial API
 *
 * @typedef {Object} SkylineAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/skyline-initial',

  /**
   * Fetch state of skyline initialization
   * @returns {Promise.<[]>}
   */
  fetchState(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/v1/state`;
    const options = {
      type: 'POST',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        classId
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * calculate skyline
   * @returns {Promise.<[]>}
   */
  calculateSkyline(classId, userIds) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/v1/calculate`;
    const options = {
      type: 'POST',
      headers: adapter.defineHeaders(),
      dataType: 'text',
      processData: false,
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        classId,
        users: userIds
      })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
