import Ember from 'ember';

/**
 * Adapter to support the Collection CRUD operations in the API 3.0
 *
 * @typedef {Object} ExternalCollectionAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  externalNamespace: '/api/nucleus/v1/collections-external',

  /**
   * Creates a new external collection
   *
   * @param data collection data to be sent in the request body
   * @returns {Promise}
   */
  createExternalCollection(collectionData) {
    const adapter = this;
    const url = this.get('externalNamespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(collectionData)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reads an External Collection by id
   *
   * @param {string} collectionId
   * @returns {Promise}
   */
  readExternalCollection: function(collectionId) {
    const adapter = this;
    const namespace = adapter.get('externalNamespace');
    const url = `${namespace}/${collectionId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update a Collection
   *
   * @param collectionId the id of the Collection to be updated
   * @param data Collection data to be sent in the request body
   * @returns {Promise}
   */
  updateExternalCollection: function(collectionId, data) {
    const adapter = this;
    const namespace = this.get('externalNamespace');
    const url = `${namespace}/${collectionId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a collection by id
   *
   * @param collectionId collection id to be sent
   * @returns {Promise}
   */
  deleteExternalCollection: function(collectionId) {
    const adapter = this;
    const namespace = this.get('externalNamespace');
    const url = `${namespace}/${collectionId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
