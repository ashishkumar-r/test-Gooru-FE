import Ember from 'ember';
import ApplicationAdapter from 'gooru-web/adapters/application';

/**
 * Adapter CollectionPerformanceSummary
 *
 * @typedef {Object} CollectionPerformanceSummaryAdapter
 */
export default ApplicationAdapter.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus-insights/v2',

  /**
   * Searches student collection performance by course, class, unit, lesson and type
   * Criteria values are not required except for courseId
   *
   * @param {string} studentId
   * @param {{ courseId: number, unitId: string, lessonId: string, collectionType: string }} criteria
   * @returns {Promise}
   */
  searchStudentCollectionPerformanceSummary: function(studentId, criteria) {
    let adapter = this;
    const collectionType = criteria.collectionType || 'assessment';
    const url = `${adapter.get(
      'namespace'
    )}/study/${collectionType}/performance`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.get('headers'),
      data: {
        courseId: criteria.courseId,
        classId: criteria.classId,
        lessonId: criteria.lessonId,
        unitId: criteria.unitId,
        userId: studentId
      }
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  findMyPerformance: function(
    userId,
    courseId,
    lessonId,
    unitId,
    collectionType = 'assessment'
  ) {
    let adapter = this;
    const url = `${adapter.get(
      'namespace'
    )}/learner/course/${collectionType}s/performance`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.get('headers'),
      data: {
        courseId,
        lessonId,
        unitId,
        userId
      }
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * Finds collection performance summary for the ids provided
   * @param {string} userId user id
   * @param {string[]} collectionIds
   * @param {string} collectionType collection|assessment
   * @param {string} classId optional class id filter
   * @param {string} timePeriod optional time period filter
   * @returns {Ember.RSVP.Promise}
   */
  findCollectionPerformanceSummaryByIds: function(
    userId,
    collectionIds,
    collectionType,
    classId = undefined,
    timePeriod = undefined
  ) {
    let adapter = this;
    const url = `${adapter.get('namespace')}/${collectionType}/performance`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: adapter.get('headers'),
      data: JSON.stringify({
        userId: userId,
        classId: classId,
        timePeriod: timePeriod,
        collectionIds: collectionIds
      })
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * @function getCollectionsPerformanceByLessonId
   * Get Collection Performance Data by  lesson Id
   */
  getCollectionsPerformanceByLessonId(
    classId,
    courseId,
    unitId,
    lessonId,
    collectionType,
    userUid
  ) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}/performance`;
    const options = {
      type: 'GET',
      headers: adapter.get('headers'),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        collectionType,
        userUid
      }
    };
    return Ember.$.ajax(url, options);
  }
});
