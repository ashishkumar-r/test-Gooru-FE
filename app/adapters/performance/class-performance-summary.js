import Ember from 'ember';

/**
 * Adapter to support the goal CRUD operations in the API 3.0
 *
 * @typedef {Object} GoalAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus-insights/v2',

  /**
   * Gets student class performance by student and class ids
   *
   * @param {string} studentId
   * @param {string[]} classIds
   * @returns {Promise}
   */
  findClassPerformanceSummaryByStudentAndClassIds: function(
    studentId,
    classCourseIds
  ) {
    const namespace = this.get('namespace');
    const url = `${namespace}/classes/performance?userId=${studentId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({
        classes: classCourseIds
      })
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * Gets class performance by class ids
   *
   * @param {string[]} classIds
   * @returns {Promise}
   */
  findClassPerformanceSummaryByClassIds: function(classCourseIds) {
    const namespace = this.get('namespace');
    const url = `${namespace}/classes/performance`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({
        classes: classCourseIds
      })
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
