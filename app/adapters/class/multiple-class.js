import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  /**
   * @property {string} End-point URI
   */
  namespace: '/api/nucleus/v1/classes',

  /**
   * @function fetchMultipleClassList
   * Adapter layer to fetch multiple class list
   */
  fetchMultipleClassList(classId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}/secondaryclasses`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8'
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function updateMultipleClass
   * Adapter layer to update secondary classes
   */
  updateMultipleClass(classId, requestBody) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${classId}`;
    const options = {
      type: 'PUT',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(requestBody)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
