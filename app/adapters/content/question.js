import Ember from 'ember';

/**
 * Adapter to support the Question CRUD operations in the API 3.0
 *
 * @typedef {Object} QuestionAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v2/questions',

  namespaceV1: '/api/nucleus/v1/questions',

  copierNamespace: '/api/nucleus/v1/copier/questions',

  tagNamespace: '/api/nucleus/v2/lookups',

  lookupV1: '/api/nucleus/v1/lookups',

  /**
   * Posts a new question
   *
   * @param data question data to be sent in the request body
   * @returns {Promise}
   */
  createQuestion: function(data) {
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
   * Reads a question by id
   *
   * @param {string} questionId
   * @returns {Promise}
   */
  readQuestion: function(questionId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${questionId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update a question
   *
   * @param questionId the id of the question to be updated
   * @param data question data to be sent in the request body
   * @returns {Promise}
   */
  updateQuestion: function(questionId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${questionId}`;
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
   * Deletes a question by id
   *
   * @param questionId question id to be sent
   * @returns {Promise}
   */
  deleteQuestion: function(questionId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${questionId}`;
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
   * Copies a question by id
   *
   * @param data question data to be sent in the request body
   * @returns {Promise}
   */
  copyQuestion: function(questionId) {
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${questionId}`;
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

  addQuestion(questionId, subQuestionId) {
    const adapter = this;
    const namespace = this.get('namespaceV1');
    const url = `${namespace}/${questionId}/sub-questions/${subQuestionId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  fetchReadactivity: function(courseId, sourceQuestionId) {
    const adapter = this;
    const namespace = adapter.get('namespaceV1');
    const url = `${namespace}/related-questions`;
    const data = {
      courseId: courseId
    };
    if (sourceQuestionId) {
      data.sourceQuestionId = sourceQuestionId;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reorder assessment resources
   *
   * @param questionId the id of the question to be updated
   * @param data question data to be sent in the request body
   * @returns {Promise}
   */
  reorderQuestions: function(questionId, data) {
    const adapter = this;
    const namespace = this.get('namespaceV1');
    const url = `${namespace}/${questionId}/sub-questions/order`;
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
   * Reads a question by id
   *
   * @param {string} questionId
   * @returns {Promise}
   */
  getTags: function(text, limit, offset) {
    const adapter = this;
    const namespace = adapter.get('tagNamespace');
    const url = `${namespace}/tags?q=${text}&limit=${limit}&offset=${offset}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * get difficulty level
   *
   * @param {string} null
   * @returns {Promise}
   */
  getDifficultyLevel: function() {
    const adapter = this;
    const namespace = adapter.get('lookupV1');
    const url = `${namespace}/difficulty-levels`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
