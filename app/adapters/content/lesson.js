import Ember from 'ember';

/**
 * Adapter to support the Lesson CRUD operations in the API 3.0
 *
 * @typedef {Object} LessonAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus/v1/courses',

  copierNamespace: '/api/nucleus/v1/copier/courses',

  itemNamespace: '/api/ds/users/v2/content/portfolio',

  /**
   * Posts a new lesson
   *
   * @param params - data to send in the request
   * @returns {Ember.Promise|String} ID of the newly created lesson
   */
  createLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params.lesson)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(
        function(responseData, textStatus, request) {
          var lessonId = request.getResponseHeader('location');
          resolve(lessonId);
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  createLessonPlan: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/lesson-plans`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params.lessonPlan)
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(response) {
        resolve(response);
      }, reject);
    });
  },

  /**
   * Updates an existing lesson
   *
   * @param params - data to send in the request
   * @returns {Ember.Promise|String}
   */
  updateLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params.lesson)
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

  updateLessonPlan: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const indexId = params.index;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/lesson-plans/${indexId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params.lessonPlan)
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(response) {
        resolve(response);
      }, reject);
    });
  },

  /**
   * Get lesson data for the corresponding lesson ID
   *
   * @param params - data to send in the request
   * @returns {Promise|Object}
   */
  getLessonById: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
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
   * Associates a collection/assesment with a lesson
   *
   * @param params - data to send in the request
   * @returns {Promise}
   */
  associateAssessmentOrCollectionToLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const collectionId = params.collectionId;
    const type = params.type;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/collections`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({
        type,
        collection_id: collectionId
      })
    };
    return Ember.$.ajax(url, options);
  },

  disassociateAssessmentOrCollectionToLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const collectionId = params.collectionId;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/collections/${collectionId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a lesson by id
   *
   * @param params - data to send in the request
   * @returns {Promise}
   */
  deleteLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
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

  deleteLessonPlan: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const lessonPlanId = params.lessonPlanId;
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/lesson-plans/${lessonPlanId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Copies a lesson by id
   *
   * @param params - data to send in the request
   * @returns {Promise}
   */
  copyLesson: function(params) {
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;
    const adapter = this;
    const namespace = this.get('copierNamespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({
        target_course_id: courseId,
        target_unit_id: unitId
      })
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Reorder lesson collections
   *
   * @param courseId the id of the course
   * @param unitId the id of the unit to be updated
   * @param lessonId the id of the lesson to be updated
   * @param data
   * @returns {Promise}
   */
  reorderLesson: function(courseId, unitId, lessonId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${courseId}/units/${unitId}/lessons/${lessonId}/order`;
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

  itemLesson: function(param) {
    const adapter = this;
    const itemNamespace = this.get('itemNamespace');
    const url = `${itemNamespace}/items/exists`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(param)
    };

    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
