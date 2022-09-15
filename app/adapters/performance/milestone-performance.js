import Ember from 'ember';

/**
 * Adapter to support the  Milestone Performance API
 *
 * @typedef {Object} MilestonePerformanceAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-insights/v2',

  /**
   * @function getPerformanceForMilestones
   * Get Performance Data for course milestones
   */
  getPerformanceForMilestones(
    classId,
    courseId,
    collectionType,
    userUid,
    fwCode
  ) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/course/${courseId}/milestone/performance`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        collectionType,
        userUid,
        fwCode
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getLessonsPerformanceByMilestoneId
   * Get Lessons Performance Data by  milestone Id
   */
  getLessonsPerformanceByMilestoneId(
    classId,
    courseId,
    milestoneId,
    collectionType,
    userUid,
    fwCode
  ) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/course/${courseId}/milestone/${milestoneId}/performance`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        collectionType,
        userUid,
        fwCode
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * @function getPerformanceForMilestones
   * Get Performance Data for course milestones
   */
  getPerformanceForMilestoneUnits(
    classId,
    courseId,
    collectionType,
    userUid,
    fwCode
  ) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/course/${courseId}/prestudy/milestone/performance`;
    const options = {
      type: 'GET',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: {
        collectionType,
        userUid,
        fwCode
      }
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
