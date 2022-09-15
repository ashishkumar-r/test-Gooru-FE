import Ember from 'ember';

/**
 * Adapter for Taxonomy endpoints
 *
 * @typedef {Object} TaxonomyAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/taxonomy',
  namespaceV2: '/api/nucleus/v2/taxonomy',
  namespaceV2Classes: '/api/nucleus/v2/classes',

  /**
   * @namespace taxonomyDSNamespace
   * API Endpoint of the DS users for taxonomy
   */
  taxonomyDSNamespace: '/api/ds/users/v2/tx',

  /**
   * Fetches the Taxonomy Subjects for the specific type
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchSubjects: function(category, filter = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/subjects`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        classification_type: category
      }
    };
    options.data = Object.assign(options.data, filter);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Subjects from the DS
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchTaxonomySubjects(category) {
    const adapter = this;
    const namespace = adapter.get('taxonomyDSNamespace');
    const url = `${namespace}/subjects`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        classificationType: category
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Subjects from the DS
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  getTaxonomySubjectsByUserId(userId) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2Classes');
    const url = `${namespace}/subjects`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        userId: userId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Courses
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @returns {Promise}
   */
  fetchCourses: function(frameworkId, subjectId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/frameworks/${frameworkId}/subjects/${subjectId}/courses`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Domains
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @param courseId - the taxonomy course ID
   * @returns {Promise}
   */
  fetchDomains: function(frameworkId, subjectId, courseId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/frameworks/${frameworkId}/subjects/${subjectId}/courses/${courseId}/domains`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Codes
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @param courseId - the taxonomy course ID
   * @param domainId - the taxonomy domain ID
   * @returns {Promise}
   */
  fetchCodes: function(frameworkId, subjectId, courseId, domainId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/frameworks/${frameworkId}/subjects/${subjectId}/courses/${courseId}/domains/${domainId}/codes`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Codes by a provided list of IDs
   *
   * @param codesIds - the list of codes IDs
   * @returns {Promise}
   */
  fetchCodesByIds: function(codesIds) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/codes`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        idList: codesIds.join(',')
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchDomainGradeBoundaryBySubjectId
   */
  fetchDomainGradeBoundaryBySubjectId(gradeId) {
    const adapter = this;
    const namespace = adapter.get('taxonomyDSNamespace');
    const url = `${namespace}/grade/boundary/${gradeId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchGradesBySubject
   */
  fetchGradesBySubject(filters) {
    const adapter = this;
    const namespace = adapter.get('taxonomyDSNamespace');
    const url = `${namespace}/grades`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: filters
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Subjects for the specific type
   *
   * @param filters - The classification type
   * @example GET /api/nucleus/:version/taxonomy/subjects/:subjectId
   * @returns {Promise}
   */
  fetchSubject: function(filters) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/subjects/${filters}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Subjects frameworks for the specified subject
   *
   * @param filters - The classification type
   * @example GET /api/nucleus/:version/taxonomy/frameworks/subjects?subject=K12.SC
   * 'http://staging.gooru.org/api/nucleus/v1/taxonomy/frameworks/subjects?subject=K12.SC'
   * @returns {Promise}
   */
  fetchSubjectFWKs: function(filters) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/frameworks/subjects?subject=${filters}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  fetchCrossWalkFWC: function(frameworkCode, subjectCode) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/crosswalk/frameworks/${frameworkCode}/subjects/${subjectCode}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Return list of  taxonomy subject classification details based  on tenant settings
   */
  fetchCategories: function() {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/classifications`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches results that match with the gut code
   *
   * @param prerequisites the prerequisites to search
   * @returns {Promise.<Array[]>}
   */
  fetchPrerequisites: function(prerequisites) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/competency/prerequisite/${prerequisites}`;
    let options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the crosswalk competency based on the class framework
   *
   * @param framework- The class framework
   * @param competency- competency array
   * @returns {Promise}
   */
  crosswalkCompetency: function(framework, competencies) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/framework/crosswalk/competency/${framework}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        codes: competencies
      })
    };
    // options.data = Object.assign(options.data, filter);
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches the Taxonomy Codes
   *
   * @param frameworkId - the framework ID
   * @param competncyId - the taxonomy ID
   * @returns {Promise}
   */
  fetchCompetencyCodes: function(frameworkId, competencyId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/frameworks/${frameworkId}/competencies/${competencyId}/codes`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
