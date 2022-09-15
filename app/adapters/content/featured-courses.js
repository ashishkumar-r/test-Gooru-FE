import Ember from 'ember';

/**
 * Adapter to support the Featured Courses CRUD operations in the API 3.0
 *
 * @typedef {Object} FeaturedCoursesAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/courses',

  classNamespace: '/api/nucleus/v1/classes/public/course',

  /**
   * @namespace taxonomyDSNamespace
   * API Endpoint of the DS users for taxonomy
   */
  taxonomyDSNamespace: '/api/ds/users/v2/tx',

  /**
   * Get independent course list
   *
   * @returns {Promise|Object}
   */

  getIndependentCourseList(params) {
    const namespace = this.get('namespace');
    const url = `${namespace}/independent/list`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: params
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * @param courseId course id to be sent
   * @param gradeLowerBound grade lower bound to be sent
   * @function joinPublicClassbyGrade Method to join public class by grade
   * @returns {Promise} class id return into response header location
   */
  joinPublicClassbyGrade(courseId, gradeLowerBound, autoJoin = true) {
    const adapter = this;
    const namespace = this.get('classNamespace');
    const url = `${namespace}/${courseId}/members`;
    const options = {
      type: 'PUT',
      contentType: 'application/json',
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        grade_lower_bound: gradeLowerBound,
        auto_join: autoJoin
      })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
