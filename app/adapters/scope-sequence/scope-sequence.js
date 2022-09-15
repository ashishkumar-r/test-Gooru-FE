import Ember from 'ember';

/**
 * Adapter to support scope and sequence listing
 *
 * @typedef {Object} ScopeAndSequence
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1',

  namespacev2: '/api/nucleus/v2',

  namespaceTaxonomy: '/api/nucleus/v1/taxonomy/frameworks',

  namespaceStatus: '/api/ds/users/v2/ca',

  /**
   * Fetch all scope and sequences
   *
   * @param {Object} params
   * @returns {Promise}
   */
  fetchScopeAndSequence(params) {
    const adapter = this;
    const url = `${adapter.get('namespace')}/scope-sequences`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch all scope and sequences
   *
   * @param {Object} params
   * @returns {Promise}
   */
  fetchModulesByScopeId(pathParams, params = {}) {
    const adapter = this;
    const url = `${adapter.get('namespace')}/scope-sequences/${
      pathParams.ssId
    }/modules`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of topics details for a given module Id
   * @param {Number} moduleId
   * @param {Object} params
   * @returns {Promise}
   */
  fetchTopicsByModule(pathParams, params = {}) {
    const adapter = this;
    const url = `${adapter.get('namespace')}/scope-sequences/${
      pathParams.ssId
    }/modules/${pathParams.moduleId}/topics`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of topics details for a given module Id
   * @param {Number} moduleId
   * @param {Object} params
   * @returns {Promise}
   */
  fetchCompeteciesByTopics(pathParams, params = {}) {
    const adapter = this;
    const url = `${adapter.get('namespace')}/scope-sequences/${
      pathParams.ssId
    }/topics/${pathParams.topicId}/competencies`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of content source that are assigned to the subject
   * @param {Object} params
   * @returns {Promise}
   */
  fetchContentSources(params = {}) {
    const adapter = this;
    const url = `${adapter.get(
      'namespace'
    )}/libraries/class-activities/content-sources`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch domains by grade
   * @param {Object} pathParams
   * @returns {Promise}
   */
  fetchDomainsByGrade(pathParams) {
    const adapter = this;
    const url = `${adapter.get('namespaceTaxonomy')}/${
      pathParams.fwId
    }/subjects/${pathParams.subjectId}/grades/${pathParams.gradeId}/domains`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of topics by domain id
   * @param {Object} pathParams
   * @returns {Promise}
   */
  fetchTopicsByDomain(pathParams) {
    const adapter = this;
    const url = `${adapter.get('namespaceTaxonomy')}/${
      pathParams.fwId
    }/subjects/${pathParams.subjectId}/domains/${pathParams.domainId}/topics`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of competencies by domain topics
   * @param {Object} pathParams
   * @returns {Promise}
   */
  fetchCompetenciesByDomainTopic(pathParams) {
    const adapter = this;
    const url = `${adapter.get('namespaceTaxonomy')}/${
      pathParams.fwId
    }/subjects/${pathParams.subjectId}/domains/${pathParams.domainId}/topics/${
      pathParams.topicId
    }/competencies`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetch list of competencies by grade
   * @param {Object} pathParams
   * @returns {Promise}
   */
  fetchCompetenciesByGrade(pathParams) {
    const adapter = this;
    const url = `${adapter.get('namespaceTaxonomy')}/${
      pathParams.fwId
    }/subjects/${pathParams.subjectId}/grades/${
      pathParams.gradeId
    }/competencies`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  fetchActivityStatus(params) {
    const adapter = this;
    const url = `${adapter.get(
      'namespaceStatus'
    )}/domain/topic/competency/report?classId=${params}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Help to hold the header for the adapter
   * @returns {Object}
   */
  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
