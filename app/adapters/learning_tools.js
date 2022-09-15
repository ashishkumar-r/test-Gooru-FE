import Ember from 'ember';

/**
 * Adapter to support the learning tools CRUD operations in the API 3.0
 *
 * @typedef {Object} LearningToolsAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/learning-registry/v1',
  /**
   * Fetch learning tool information
   * @returns {Promise.<[]>}
   */
  getLearningToolInformation(toolId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/learning-tools/${toolId}`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8'
    };
    return Ember.$.ajax(url, options);
  },

  fetchLearningTool() {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/learning-tools`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8'
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
