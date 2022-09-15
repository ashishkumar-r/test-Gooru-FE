import Ember from 'ember';

/**
 * Adapter to support the Activity CRUD operations in the API 3.0
 *
 * @typedef {Object} ActivityAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/oa',

  collectionNamespace: '/api/nucleus/v1/oa',

  /**
   * Posts a new activity
   *
   * @param data activity data to be sent in the request body
   * @returns {Promise}
   */
  createActivity: function(data) {
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
   * Reads an Activity by id
   *
   * @param {string} activityId
   * @returns {Promise}
   */
  readActivity: function(activityId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${activityId}/detail`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Reads an Activity by id
   *
   * @param {string} activityId
   * @returns {Promise}
   */
  readActivityDCA: function(activityId, activityType) {
    const adapter = this;
    let namespace = adapter.get('namespace');
    if (!activityType) {
      namespace = adapter.get('collectionNamespace');
    }
    const url = `${namespace}/${activityId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reads an External Activity by id
   *
   * @param {string} activityId
   * @returns {Promise}
   */
  readExternalActivity: function(activityId) {
    const adapter = this;
    const namespace = adapter.get('externalNamespace');
    const url = `${namespace}/${activityId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update an Activity
   *
   * @param activityId the id of the Activity to be updated
   * @param data Activity data to be sent in the request body
   * @returns {Promise}
   */
  updateActivity: function(activityId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${activityId}`;
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
   * Deletes an activity by id
   *
   * @param activityId activity id to be sent
   * @returns {Promise}
   */
  deleteActivity: function(activityId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${activityId}`;
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

  /**
   * Adds a question to an activity
   *
   * @param {string} activityId
   * @param {string} questionId
   * @returns {Promise}
   */
  createReferences: function(activityId, referencesData) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${activityId}/references`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(referencesData)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Copies an activity by id
   *
   * @param activityId
   * @returns {Promise}
   */
  copyActivity: function(activityId) {
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${activityId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reorder activity resources
   *
   * @param activityId the id of the Activity to be updated
   * @param data Activity data to be sent in the request body
   * @returns {Promise}
   */
  reorderActivity: function(activityId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${activityId}/questions/order`;
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
   * Find  the mastery accrual for the given list of activityIds
   *
   * @param {string} activityIds
   * @returns {Promise}
   */
  activitysMasteryAccrual: function(activityIds) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/mastery-accrual`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({ activityIds })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  },

  /**
   * Get a list of OA subtype
   * @returns {Promise}
   */
  getSubTypes: function() {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/subtypes`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes an reference by id
   *
   * @param reference id to be sent
   * @returns {Promise}
   */
  deleteReference: function(activityId, referenceId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${activityId}/references/${referenceId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  }
});
