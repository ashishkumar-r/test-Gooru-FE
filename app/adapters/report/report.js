import Ember from 'ember';

/**
 * Adapter to support the class report APIs
 *
 * @typedef {Object} ReportAdapter
 */
export default Ember.Object.extend({
  namespace: '/api/ds/users/v2/',

  classNamespace: '/api/ds/users/v2/class/',

  namespaceNucleus: '/api/nucleus-insights/v2/',

  selNamespace: '/api/ds/users/v2/selreports/',

  evidenceNamespace: '/api/v1/evidence',

  session: Ember.inject.service('session'),

  /**
   * @function fetchStudentsWeeklySummaryReport
   * Method to fetch students weekly summary report
   */
  fetchStudentsWeeklySummaryReport(classId, data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}class/${classId}/student/summary/weekly`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchStudentsSummaryReport
   * Method to fetch students summary report
   */
  fetchStudentsSummaryReport(classId, data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}class/${classId}/student/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchStudentTimespentReport
   * Method to fetch students timespent report
   */
  fetchStudentTimespentReport(data) {
    const adapter = this;
    const namespace = adapter.get('classNamespace');
    const url = `${namespace}user/timespent`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchStudentCompetencyReport
   * Method to fetch students timespent report
   */
  fetchStudentCompetencyReport(data) {
    const adapter = this;
    const namespace = adapter.get('classNamespace');
    const url = `${namespace}user/competency/report`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchStudentsTimespentSummaryreport
   * Method to fetch students timespent report
   */
  fetchStudentsTimespentSummaryreport(data) {
    const adapter = this;
    const namespace = adapter.get('classNamespace');
    const url = `${namespace}timespent`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchDiagnosticSummaryData help to fetch diagnostic summary data for the domain
   * @param {Object} params has userId, classId, contentSoruce, domainCode
   */
  fetchDiagnosticSummaryData(params) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const endpoint = `${namespace}content/portfolio/diagnostic/assessment/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(endpoint, options);
  },

  /**
   * @function fetchMinProficiencySummary
   * @param {classId, courseId} params
   * @returns
   */
  fetchMinProficiencySummary(params) {
    const adapter = this;
    const namespace = adapter.get('namespaceNucleus');
    const endpoint = `${namespace}class/${params.classId}/course/${params.courseId}/activities/proficiency/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(endpoint, options);
  },

  /**
   * @function fetchStudentSelReport
   * Method to fetch students sel report
   */
  fetchStudentSelReport(classId) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchLessonSummaryReport
   * Method to fetch lesson summary report
   */
  fetchLessonSummaryReport(classId, lessonId, params) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/lesson/${lessonId}/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchActivitySummaryReport
   * Method to fetch activity summary report
   */
  fetchActivitySummaryReport(classId, lessonId, activityType, params) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/lesson/${lessonId}/activity/${activityType}/summary`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchQuizSummaryReport
   * Method to fetch quiz summary report
   */
  fetchQuizSummaryReport(classId, lessonId, activityType, params) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/lesson/${lessonId}/activity/${activityType}/answerstats`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchFeelingSummaryReport
   * Method to fetch feeling summary report
   */
  fetchFeelingSummaryReport(classId, lessonId, activityType, params) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/lesson/${lessonId}/activity/${activityType}/answerstats`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchRechargeSummaryReport
   * Method to fetch recharge summary report
   */
  fetchRechargeSummaryReport(classId, lessonId, activityType, params) {
    const adapter = this;
    const namespace = adapter.get('selNamespace');
    const url = `${namespace}class/${classId}/lesson/${lessonId}/activity/${activityType}/details`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function fetchActivityEvidenceReport
   * Method to fetch activity evidence report
   */
  fetchActivityEvidenceReport(classId, oaId) {
    const adapter = this;
    const namespace = adapter.get('evidenceNamespace');
    const url = `${namespace}/class/${classId}/oa/${oaId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Creates the headers required by API 3.0
   * @returns {{Authorization: string}}
   */
  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
