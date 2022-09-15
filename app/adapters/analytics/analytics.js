import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-insights/v2',

  dsUsersNamespace: '/api/ds/users/v3',

  dsUsersNamespacev2: '/api/ds/users/v2',

  queryRecord: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const courseId = query.courseId;
    const unitId = query.unitId;
    const lessonId = query.lessonId;
    const collectionId = query.collectionId;
    const collectionType = query.collectionType;
    const url = `${namespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/${collectionType}/${collectionId}/performance`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  queryRecordForDCA: function(query) {
    const namespace = this.get('namespace');
    let includedateParam = '';
    let includestartDateParam = '';
    let includeendDateParam = '';
    let includepathIdParam = '';
    let includeClassId = '';
    let includesessionIdParam = `sessionId=${query.sessionId}`;
    if (query.classId) {
      includeClassId = `classId=${query.classId}`;
    }
    if (query.date) {
      includedateParam = `date=${query.date}`;
    }
    if (query.startDate) {
      includestartDateParam = `startDate=${query.startDate}`;
    }
    if (query.endDate) {
      includeendDateParam = `endDate=${query.endDate}`;
    }
    if (query.pathId) {
      includepathIdParam = `pathId=${query.pathId}`;
    }
    const collectionId = query.collectionId;
    const userId = query.userId;
    const collectionType = query.collectionType;
    const url = `${namespace}/dca/${collectionType}/${collectionId}/user/${userId}?${includesessionIdParam}&${includeClassId}&${includedateParam}&${includestartDateParam}&${includeendDateParam}&${includepathIdParam}`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get DCA class performance summary
   * @param {UUID} classId
   * @returns {Promise}
   */
  getDCASummaryPerformance: function(classId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/dca/class/${classId}/performance`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get DCA class summary report
   * @param {UUID} classId
   * @returns {Promise}
   */
  getDCAYearlySummary: function(classId, userId) {
    const namespace = this.get('namespace');
    const url = `${namespace}/dca/class/${classId}/summary`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: {
        userId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Update score of questions in an Assessment/Collection
   * @param {string} RawData of questions score update for assessment or collection.
   * @returns {Promise}
   */
  updateQuestionScore: function(data) {
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: this.defineHeaders(),
      data: JSON.stringify(data)
    };
    const namespace = this.get('namespace');
    const url = `${namespace}/score`;
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getAtcPerformanceSummary
   * Method to fetch performance summary of a class for ATC view
   */
  getAtcPerformanceSummary(classId, courseId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/atc/pvc`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: {
        classId,
        courseId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getAtcPerformanceSummaryPremiumClass
   * Method to fetch performance summary of a premium class for ATC view
   */
  getAtcPerformanceSummaryPremiumClass(classId, subjectCode, filters) {
    const adapter = this;
    const namespace = this.get('dsUsersNamespace');
    const url = `${namespace}/nc/atc/pvc`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: {
        classId,
        subjectCode
      }
    };
    if (filters) {
      options.data = Object.assign(options.data, filters);
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getInitialSkyline
   * Method to fetch initial skyline for ATC view
   */
  getInitialSkyline(classId, subjectCode, filters, fwCode) {
    const adapter = this;
    const namespace = this.get('dsUsersNamespace');
    const url = `${namespace}/nc/atc/initial/baseline`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: {
        classId,
        subjectCode,
        fwCode
      }
    };
    if (filters) {
      options.data = Object.assign(options.data, filters);
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * @function studentSelfReporting
   * Method to update external assessment score
   */
  studentSelfReporting(dataParams) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/self-report`;
    const options = {
      type: 'POST',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(dataParams)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * This Method used to fetch DCA collection/assesssment performance details for the specfic date.
   * @param  {ClassId} classId        Unique Id of the class
   * @param  {CollectionId} collectionId   Unique Id of the collection.
   * @param  {CollectionType} collectionType Type of the collection, it should be collection/assessment.
   * @param  {SessionId} sessionId          sessionId of the activity
   * @param  {UserId} userId
   */
  getDCAPerformanceBySessionId(
    userId,
    classId,
    collectionId,
    collectionType,
    sessionId
  ) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/dca/class/${classId}/${collectionType}/${collectionId}/session/${sessionId}/performance`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: {
        userId
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * This Method used to fetch DCA collection/assesssment performance details for the specfic date.
   * @param  {ClassId} classId        Unique Id of the class
   * @param  {CollectionId} collectionId   Unique Id of the collection.
   * @param  {CollectionType} collectionType Type of the collection, it should be collection/assessment.
   * @param  {String} date           Date format should YYYY-MM-DD
   */
  getDCAPerformance(classId, collectionId, collectionType, date, endDate) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/dca/class/${classId}/${collectionType}/${collectionId}/performance`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: {
        date,
        startDate: date,
        endDate: endDate
      }
    };
    return Ember.$.ajax(url, options);
  },

  queryLikertRecord: function(query) {
    const namespace = this.get('namespace');
    const classId = query.classId;
    const courseId = query.courseId;
    const unitId = query.unitId;
    const lessonId = query.lessonId;
    const collectionId = query.collectionId;
    const collectionType = query.collectionType;
    const selectedQuestionId = query.selectedQuestionId;
    const url = `${namespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/${collectionType}/${collectionId}/question/${selectedQuestionId}/performance`;
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: {}
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Get grade competency count based on grade
   * @param {Object} params has subject and fw_code properties
   */
  getGradeCompetencyCount(params) {
    const adapter = this;
    const namespace = this.get('dsUsersNamespacev2');
    const url = `${namespace}/tx/grade/competency/count`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      data: params
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
