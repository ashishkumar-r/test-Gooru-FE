import Ember from 'ember';
import ApplicationAdapter from '../application';

/**
 * Adapter CourseCompetencyCompletion
 *
 * @typedef {Object} CourseCompetencyCompletionAdapter
 */
export default ApplicationAdapter.extend({
  /**
   * @property {String} End-point URI
   */
  namespace: '/api/nucleus-insights/v3',

  /**
   * Built the REST API Adapter to fetch the Course competency completion data
   * @param  {String} studentId   Logged in student id
   * @param  {String} courseIds Course unique id's
   * @return {Promise} Promise object which carries the Course competency completion ajax
   */

  findCourseCompetencyCompletionByCourseIds: function(studentId, courseIds) {
    const namespace = this.get('namespace');
    const url = `${namespace}/courses/competency-completion?userId=${studentId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({
        courseIds: courseIds
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
