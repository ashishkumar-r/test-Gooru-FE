import Ember from 'ember';
/**
 * Adapter to support the Offline activity Analytics operations
 *
 * @typedef {Object} OfflineActivityAnalyticsAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-insights/v2',

  /**
   * Fetch the list of OA that the teacher needs to grade for a given class
   * @param {string} classId
   * @param {string} userId
   * @returns {Object}
   */
  getOAToGrade(classId, userId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/rubrics/items`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        classId,
        userId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get the student submissions
   * @param {string} classId
   * @param {string} activityId Either CA Content ID or OA ID based on request type
   * @param {string} studentId
   * @param {Object} dataParam Dataparam is required only at the CM
   * @returns {Object}
   * If it's CA dataParam is not required otherwise dataParam is mandatory
   */
  getSubmissionsToGrade(classId, activityId, studentId, dataParam) {
    const adapter = this;
    const namespace = this.get('namespace');
    let url = `${namespace}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: dataParam
    };
    if (!dataParam) {
      url += '/dca';
    }
    url += `/class/${classId}/oa/${activityId}/student/${studentId}/submissions`;
    return Ember.$.ajax(url, options);
  },

  /**
   * Get the list of Students to-be graded for a given Offline Activity
   * @param {string} classId
   * @param {string} activityId
   * @returns {Object}
   */
  getStudentListToGrade(classId, activityId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/rubrics/items/${activityId}/students`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        classId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Submit student submission by teacher | student
   * @param {Object} Grade
   * @returns {Promise}
   */
  submitOAGrade(data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/rubrics/grades/collections`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getOaCompletedStudents
   * @param {UUID} classId
   * @param {UUID} oaId
   * @param {UUID} itemId CA content ID
   * @param {Object} dataParam is required at the CM request
   * Method to get list of students who have marked an OA as completed
   * If itemId is there, we should treat it as CA request otherwise CM
   */
  getOaCompletedStudents(classId, oaId, itemId, dataParam) {
    const adapter = this;
    const namespace = this.get('namespace');
    let url = `${namespace}`;
    const caCompletedListUrl = `/dca/class/${classId}/oa/${oaId}/item/${itemId}/students`;
    const cmCompletedListUrl = `/class/${classId}/oa/${oaId}/students`;
    url = url + (itemId ? caCompletedListUrl : cmCompletedListUrl);
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    if (dataParam) {
      options.data = dataParam;
    }
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
