import Ember from 'ember';

/**
 * Adapter to support the Assessment CRUD operations in the API 3.0
 *
 * @typedef {Object} ExternalAssessmentAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  externalNamespace: '/api/nucleus/v1/assessments-external',

  /**
   * Reads an External Assessment by id
   *
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readExternalAssessment: function(assessmentId) {
    const adapter = this;
    const namespace = adapter.get('externalNamespace');
    const url = `${namespace}/${assessmentId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update an Assessment
   *
   * @param assessmentId the id of the Assessment to be updated
   * @param data Assessment data to be sent in the request body
   * @returns {Promise}
   */
  updateExternalAssessment: function(assessmentId, data) {
    const adapter = this;
    const namespace = this.get('externalNamespace');
    const url = `${namespace}/${assessmentId}`;
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
   * Deletes an assessment by id
   *
   * @param assessmentId assessment id to be sent
   * @returns {Promise}
   */
  deleteExternalAssessment: function(assessmentId) {
    const adapter = this;
    const namespace = this.get('externalNamespace');
    const url = `${namespace}/${assessmentId}`;
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
   * Creates a new external collection
   *
   * @param data collection data to be sent in the request body
   * @returns {Promise}
   */
  createExternalAssessment(assessmentData) {
    const adapter = this;
    const url = this.get('externalNamespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(assessmentData)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
