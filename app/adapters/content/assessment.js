import Ember from 'ember';

/**
 * Adapter to support the Assessment CRUD operations in the API 3.0
 *
 * @typedef {Object} AssessmentAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/assessments',

  collectionNamespace: '/api/nucleus/v1/collections',

  copierNamespace: '/api/nucleus/v1/copier',

  externalNamespace: '/api/nucleus/v1/assessments-external',

  updateNamespace: '/api/nucleus/v1',

  /**
   * Posts a new assessment
   *
   * @param data assessment data to be sent in the request body
   * @returns {Promise}
   */
  createAssessment: function(data) {
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
   * Reads an Assessment by id
   *
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readAssessment: function(assessmentId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${assessmentId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * Reads an Assessment by id
   *
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readAssessmentDCA: function(assessmentId, assessmentType) {
    const adapter = this;
    let namespace = adapter.get('namespace');
    if (!assessmentType) {
      namespace = adapter.get('collectionNamespace');
    }
    const url = `${namespace}/${assessmentId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

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
  updateAssessment: function(assessmentId, data, type = 'assessments') {
    const adapter = this;
    const namespace = this.get('updateNamespace');
    const url = `${namespace}/${type}/${assessmentId}`;
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
  deleteAssessment: function(assessmentId) {
    const adapter = this;
    const namespace = this.get('namespace');
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
   * Adds a question to an assessment
   *
   * @param {string} assessmentId
   * @param {string} questionId
   * @returns {Promise}
   */
  addQuestion: function(assessmentId, questionId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${assessmentId}/questions`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        id: questionId
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Copies an assessment by id
   *
   * @param assessmentId
   * @returns {Promise}
   */
  copyAssessment: function(assessmentId, type = 'assessments') {
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${type}/${assessmentId}`;
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
   * Reorder assessment resources
   *
   * @param assessmentId the id of the Assessment to be updated
   * @param data Assessment data to be sent in the request body
   * @returns {Promise}
   */
  reorderAssessment: function(assessmentId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${assessmentId}/questions/order`;
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
   * Find  the mastery accrual for the given list of assessmentIds
   *
   * @param {string} assessmentIds
   * @returns {Promise}
   */
  assessmentsMasteryAccrual: function(assessmentIds) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/mastery-accrual`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({ assessmentIds })
    };
    return Ember.$.ajax(url, options);
  },
  diagnosticAssessment: function(data, assessmentId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${assessmentId}/diagnostic/setting`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
