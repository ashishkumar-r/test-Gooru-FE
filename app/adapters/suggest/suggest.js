import Ember from 'ember';
import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  session: Ember.inject.service('session'),
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooru-search/rest/suggest/v2',

  namespaceV3: '/gooru-search/rest/v3/suggest',

  namespaceST: '/api/stracker/v2',

  suggestResources: function(term, params = {}) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/resource`;

    const page = params.page || 0;
    const pageSize = params.pageSize || 3;
    const contentGOid = params.GOid || '';
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        searchTerm: term,
        event: 'collection-edit',
        contentGooruOid: contentGOid,
        'flt.publishStatus': 'published',
        start: page + 1,
        pageSize: pageSize
      }
    };
    return Ember.$.ajax(url, options);
  },

  //TODO this has to be changed according to the documentation -is not using now-
  /**
   * Gets resource suggestion for an specific resource in a context
   * @param {String} resourceId
   * @param {SuggestContext} context
   * @param {number} limit
   * @returns {*}
   */
  suggestResourcesForResource: function(resourceId, context, limit = 10) {
    const adapter = this;
    const namespace = this.get('namespaceV3');
    const url = `${namespace}/resource?limit=${limit}`;

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: {
        contextType: 'resource-study-suggest',
        resourceId: resourceId,
        userId: context.get('userId'),
        containerId: context.get('containerId')
          ? context.get('containerId')
          : undefined,
        courseId: context.get('courseId') ? context.get('courseId') : undefined,
        unitId: context.get('unitId') ? context.get('unitId') : undefined,
        lessonId: context.get('lessonId') ? context.get('lessonId') : undefined
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets resource suggestion for an specific collection/assessment in a context
   * @param {SuggestContext} context
   * @param {number} limit
   * @returns {*}
   */
  suggestResourcesForCollection: function(context, limit = 3) {
    const adapter = this;
    const namespace = this.get('namespaceV3');
    const url = `${namespace}/resource?limit=${limit}`;

    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        context: {
          context_type: 'collection-study',
          context_area: 'study-player',
          collection_id: context.get('collectionId'),
          user_id: context.get('userId'),
          course_id: context.get('courseId')
            ? context.get('courseId')
            : undefined,
          unit_id: context.get('unitId') ? context.get('unitId') : undefined,
          lesson_id: context.get('lessonId')
            ? context.get('lessonId')
            : undefined
        },
        metrics: {
          score: context.get('score') >= 0 ? context.get('score') : undefined,
          timespent:
            context.get('timeSpent') >= 0 ? context.get('timeSpent') : undefined
        }
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Add class-activity suggestions
   * @param {SuggestContext} context
   * @returns {*}
   */
  suggestContent(context) {
    const adapter = this;
    const namespace = adapter.get('namespaceST');
    const url = `${namespace}/track`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(context)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Add class-activity suggestions
   * @param {SuggestContext} context
   * @returns {*}
   */
  fetchSuggestionForCA(classId, context) {
    const adapter = this;
    const namespace = adapter.get('namespaceST');
    const url = `${namespace}/ca/class/${classId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(context)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Add class-activity suggestions
   */
  fetchAcrossClassSuggestionsByCode(userId, code, params) {
    const adapter = this;
    const namespace = adapter.get('namespaceST');
    const url = `${namespace}/user/${userId}/code/${code}/codetype/competency`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch In-class suggestionsnfor student
   */
  fetchInClassSuggestionsForStudent(userId, classId, params) {
    const adapter = this;
    const namespace = adapter.get('namespaceST');
    const url = `${namespace}/user/${userId}/class/${classId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Add class-activity suggestions
   */
  fetchInClassSuggestionsByCode(userId, code, params) {
    const adapter = this;
    const namespace = adapter.get('namespaceST');
    const url = `${namespace}/user/${userId}/code/${code}/codetype/competency`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
