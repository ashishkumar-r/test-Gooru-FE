import Ember from 'ember';

/**
 * Adapter to support the Course CRUD operations in the API 3.0
 *
 * @typedef {Object} CourseAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/courses',

  copierNamespace: '/api/nucleus/v1/copier/courses',

  publisherNamespace: '/api/learning-registry/v1/publishers',

  readActivityNamespace: '/api/nucleus-insights/v2/report',

  /**
   * Posts a new course
   *
   * @param data - course data to be sent in the request body
   * @returns {Promise|String} ID of the newly created course
   */
  createCourse: function(data) {
    const url = this.get('namespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(data.body)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(
        function(responseData, textStatus, request) {
          var courseId = request.getResponseHeader('location');
          resolve(courseId);
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Update existing course
   *
   * @param data - course data to be sent in the request body
   * @returns {Promise|String} ID of the newly created course
   */
  updateCourse: function(data) {
    const courseId = data.courseId;
    const url = `${this.get('namespace')}/${courseId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(data.course)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(
        function() {
          resolve('');
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Get course data for the corresponding course ID
   *
   * @param courseId - course ID to search for
   * @returns {Promise|Object}
   */
  getCourseById: function(courseId) {
    const url = `${this.get('namespace')}/${courseId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(
        function(responseData) {
          resolve(responseData);
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Gets the course structure by collection type
   *
   * @param {string} courseId
   * @param {string} collectionType assessment|collection
   * @returns {Promise|Object}
   */
  getCourseStructure: function(courseId, collectionType) {
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/${collectionType}s`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a course by id
   *
   * @param courseId course id to be sent
   * @returns {Promise}
   */
  deleteCourse: function(courseId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}`;
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
   * Copies a course by id
   *
   * @param data course data to be sent in the request body
   * @returns {Promise}
   */
  copyCourse: function(courseId) {
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${courseId}`;
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

  /**
   * Reorder course units
   *
   * @param courseId the id of the Course to be updated
   * @param data Course data to be sent in the request body
   * @returns {Promise}
   */
  reorderCourse: function(courseId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/order`;
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
   * Fetch course Card level data for by multiple course ids
   *
   * @param {string[]} courseIds
   * @returns {Promise}
   */
  getCourseCards: function(courseIds) {
    const namespace = this.get('namespace');
    const url = `${namespace}/list`;
    const data = {
      ids: Ember.isArray(courseIds) ? courseIds : null
    };
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: JSON.stringify(data)
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * Update co-teacher for course
   * @param courseId
   * @param collaboratorIds the teacher ids
   * @returns {Promise}
   */
  updateCollaborators(courseId, collaboratorIds) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/collaborators`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        collaborator: collaboratorIds
      })
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Returns the milestones for the course.
   * @param {string} courseId
   * @param {string} fwCode
   * @returns {Promise.<Milestones>}
   */
  getCourseMilestones(courseId, fwCode, class_id, user_id) {
    const namespace = this.get('namespace');
    const url = `${namespace}/ms/${courseId}/fw/${fwCode}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: {
        class_id,
        user_id
      }
    };

    return Ember.$.ajax(url, options);
  },

  /**
   * Returns the lessons for the course milestone.
   * @param {string} courseId
   * @param {string} milestoneId
   * @returns {Promise.<Lessons>}
   */
  getCourseMilestoneLessons(courseId, milestoneId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/ms/${courseId}/milestones/${milestoneId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };

    return Ember.$.ajax(url, options);
  },

  getPublisherList(Pubisherlimit) {
    const publisher = this.get('publisherNamespace');
    const offset = Pubisherlimit.offset;
    const limit = Pubisherlimit.limit;
    const url = `${publisher}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: {
        offset,
        limit,
        status: 'published',
        query: ''
      }
    };
    return Ember.$.ajax(url, options);
  },

  getReadActivity(requestParams) {
    const namespace = this.get('readActivityNamespace');
    const url = `${namespace}/first-second-read-wpm/flags`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: requestParams
    };
    return Ember.$.ajax(url, options);
  },
  NotLinkedActivity(requestParams) {
    const namespace = this.get('readActivityNamespace');
    const url = `${namespace}/wpm/flags`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: requestParams
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
