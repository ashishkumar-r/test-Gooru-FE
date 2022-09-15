import Ember from 'ember';

/**
 * Adapter to support the Resource CRUD operations in the API 3.0
 *
 * @typedef {Object} ResourceAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/resources',

  copierNamespace: '/api/nucleus/v1/copier/resources',

  fbCheckerNamespace: '/api/nucleus-utils/v1/fb-checker',
  /**
   * Posts a new resource
   *
   * @param data resource data to be sent in the request body
   * @returns {Promise}
   */
  createResource: function(data) {
    const adapter = this;
    const url = this.get('namespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Posts a new resource
   *
   * @param data fb checker data to be sent in the request body
   * @returns {Promise}
   */
  createFbChecker: function(data) {
    const adapter = this;
    const url = this.get('fbCheckerNamespace');
    const body = {};
    if (data) {
      body.url = data;
    }
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reads a resource by id
   *
   * @param {string} resourceId
   * @returns {Promise}
   */
  readResource: function(resourceId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${resourceId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /*
   * Updates a resource by id
   *
   * @param {string} resourceId
   * @param data resource data to be sent in the request body
   * @returns {Promise}
   */
  updateResource: function(resourceId, data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${resourceId}`;
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
   * Copies a resource by id
   *
   * @param data resource data to be sent in the request body
   * @returns {Promise}
   */
  copyResource: function(resourceId, title) {
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${resourceId}`;
    const body = {};
    if (title) {
      body.title = title;
    }
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a resource by id
   *
   * @param resourceId resource id to be sent
   * @returns {Promise}
   */
  deleteResource: function(resourceId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${resourceId}`;
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
