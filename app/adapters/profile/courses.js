import Ember from 'ember';
import { DEFAULT_PAGE_SIZE } from 'gooru-web/config/config';

/**
 * Adapter to get the list of courses created by a Profile
 *
 * @typedef {Object} ProfileCourseAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/profiles',

  /**
   * Get the list of Courses of a specified profile and filter by subject
   *
   * @param profileId the Profile Id owner of the courses
   * @param subject this is an option parameter to filter the courses
   * @returns {Promise}
   */
  getCourses: function(profileId, subject, params = {}, filter = {}) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/${profileId}/courses`;

    const page = params.page || 0;
    const pageSize = params.pageSize || DEFAULT_PAGE_SIZE;
    const offset = page * pageSize;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        limit: pageSize,
        offset: offset
      }
    };

    if (subject) {
      options.data.subject = subject;
    }
    options.data = Object.assign(options.data, filter);
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
