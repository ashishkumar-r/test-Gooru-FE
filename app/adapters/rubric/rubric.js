import Ember from 'ember';

/**
 * Adapter to support the rubric CRUD operations in the API 3.0
 *
 * @typedef {Object} RubricAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus/v2/rubrics',

  gradingNamespaceForDCA: '/api/nucleus-insights/v2/dca/rubrics',

  profileNamespace: '/api/nucleus/v2/profiles',

  copierNamespace: '/api/nucleus/v2/copier',

  questionsNamespace: '/api/nucleus/v2/questions',

  gradingNamespace: '/api/nucleus-insights/v2/rubrics',

  /**
   * Posts a new rubric
   *
   * @param params - data to send in the request
   * @returns {Ember.Promise|String} ID of the newly created rubric
   */
  createRubric: function(params) {
    const namespace = this.get('namespace');
    const url = `${namespace}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$
        .ajax(url, options)
        .then(function(responseData, textStatus, request) {
          var rubricId = request.getResponseHeader('location');
          resolve(rubricId);
        }, reject);
    });
  },

  /**
   * Updates a rubric
   *
   * @param params - data to send in the request
   * @returns {Ember.Promise|Boolean} true when updated
   */
  updateRubric: function(params, rubricId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/${rubricId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function() {
        resolve(true);
      }, reject);
    });
  },

  /**
   * Updates rubric score
   *
   * @param params - data to send in the request
   * @param questionId - question ID
   * @returns {Ember.Promise|Boolean} true when updated
   */
  updateScore: function(params, questionId) {
    const namespace = this.get('questionsNamespace');
    const url = `${namespace}/${questionId}/score`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(params)
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function() {
        resolve(true);
      }, reject);
    });
  },

  /**
   * Deletes a rubric
   *
   * @param params - data to send in the request
   * @returns {Ember.Promise|boolean} true when deleted
   */
  deleteRubric: function(rubricId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/${rubricId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders()
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function() {
        resolve(true);
      }, reject);
    });
  },

  /**
   * Gets the rubric information
   *
   * @param {string} rubricId
   * @returns {Promise|Object}
   */
  getRubric: function(rubricId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/${rubricId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * Gets the user rubrics information
   * @param {string} userId
   * @returns {Promise|Object}
   */
  getUserRubrics: function(userId) {
    const profileNamespace = this.get('profileNamespace');
    const url = `${profileNamespace}/${userId}/rubrics`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * Copies a rubric
   *
   * @param {string} rubricId to be copied
   * @returns {Ember.Promise|String} ID of the copied rubric
   */
  copyRubric: function(rubricId) {
    const copierNamespace = this.get('copierNamespace');
    const url = `${copierNamespace}/rubrics/${rubricId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({}) //empty body is required
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$
        .ajax(url, options)
        .then(function(responseData, textStatus, request) {
          var rubricId = request.getResponseHeader('location');
          resolve(rubricId);
        }, reject);
    });
  },

  /**
   * Associates a rubric with a question
   *
   * @param {string} rubricId
   * @param {string} questionId
   * @returns {Ember.Promise|boolean} true when successful
   */
  associateRubricToQuestion: function(rubricId, questionId) {
    const questionsNamespace = this.get('questionsNamespace');
    const url = `${questionsNamespace}/${questionId}/rubrics/${rubricId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify({}) //empty body is required
    };

    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function() {
        resolve(true);
      }, reject);
    });
  },

  /**
   * Gets Questions pending grading
   *
   * @param {string} classId
   * @param {string} courseId
   * @returns {Promise/Object}
   */
  getQuestionsToGrade: function(classId, courseId) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespace');
    const url = `${namespace}/questions`;

    var data = {
      classId,
      courseId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets Questions pending grading for DCA
   *
   * @param {string} classId
   * @returns {Promise/Object}
   */
  getQuestionsToGradeForDCA: function(classId) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespaceForDCA');
    const url = `${namespace}/questions`;

    var data = {
      classId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the list of Students for a to be graded Question
   *
   * @param {string} questionId
   * @param {string} classId
   * @param {string} courseId
   * @param {string} collectionId
   * @returns {Promise/Object}
   */
  getStudentsForQuestion: function(
    questionId,
    classId,
    courseId,
    collectionId
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespace');
    const url = `${namespace}/questions/${questionId}/students`;

    var data = {
      collectionId,
      classId,
      courseId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets the list of DCA Students for a to be graded Question
   *
   * @param {string} questionId
   * @param {string} classId
   * @param {string} collectionId
   * @returns {Promise/Object}
   */
  getDCAStudentsForQuestion: function(
    questionId,
    classId,
    collectionId,
    activityDate
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespaceForDCA');
    const url = `${namespace}/questions/${questionId}/students`;

    var data = {
      collectionId,
      classId,
      activityDate
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets Answer for Rubric Grading
   *
   * @param {string} studentId
   * @param {string} classId
   * @param {string} courseId
   * @param {string} collectionId
   * @param {string} questionId
   * @param {string} unitId
   * @param {string} lessonId
   * @returns {Promise/Object}
   */
  getAnswerToGrade: function(
    studentId,
    classId,
    courseId,
    collectionId,
    questionId,
    unitId,
    lessonId
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespace');
    const url = `${namespace}/questions/${questionId}/students/${studentId}/answers`;

    var data = {
      classId,
      courseId,
      collectionId,
      unitId,
      lessonId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets Answer for Rubric Grading of DCA
   *
   * @param {string} studentId
   * @param {string} classId
   * @param {string} courseId
   * @param {string} collectionId
   * @param {string} questionId
   * @param {string} activityDate
   * @returns {Promise/Object}
   */
  getAnswerToGradeForDCA: function(
    studentId,
    classId,
    collectionId,
    questionId,
    activityDate
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespaceForDCA');
    const url = `${namespace}/questions/${questionId}/students/${studentId}/answers`;

    var data = {
      classId,
      collectionId,
      activityDate
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Posts a student rubric grade
   *
   * @param data - rubric grade data to be sent in the request body
   * @returns {Promise}
   */
  setStudentRubricGrades: function(data) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespace');
    const url = `${namespace}/grades`;
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
   * Gets report of Rubric Grading for a Question
   *
   * @param {string} studentId
   * @param {string} classId
   * @param {string} courseId
   * @param {string} collectionId
   * @param {string} questionId
   * @param {string} sessionId
   * @returns {Promise/Object}
   */
  getRubricQuestionSummary: function(
    studentId,
    classId,
    courseId,
    collectionId,
    questionId,
    sessionId
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespace');
    const url = `${namespace}/class/${classId}/course/${courseId}/collection/${collectionId}/question/${questionId}/summary`;

    var data = {
      studentId,
      sessionId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Gets DCA report of Rubric Grading for a Question
   *
   * @param {string} studentId
   * @param {string} classId
   * @param {string} collectionId
   * @param {string} questionId
   * @param {string} sessionId
   * @returns {Promise/Object}
   */
  getRubricQuestionSummaryForDCA: function(
    studentId,
    classId,
    collectionId,
    questionId,
    sessionId
  ) {
    const adapter = this;
    const namespace = adapter.get('gradingNamespaceForDCA');
    const url = `${namespace}/class/${classId}/collection/${collectionId}/question/${questionId}/summary`;

    var data = {
      studentId,
      sessionId
    };

    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getOaItemsToGrade
   * Method to get list of items grade
   * @param {Object} requestParam
   * @return {Promise}
   */
  getOaItemsToGrade(requestParam) {
    const adapter = this;
    const url = `${adapter.get('gradingNamespace')}/items`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data: requestParam,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getOaItemsToGrade
   * Method to get list of items grade
   * @param {UUID} itemId
   * @param {Object} requestParam
   * @return {Promise}
   */
  getOaGradingStudents(itemId, requestParam) {
    const adapter = this;
    const url = `${adapter.get('gradingNamespace')}/items/${itemId}/students`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      data: requestParam,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
