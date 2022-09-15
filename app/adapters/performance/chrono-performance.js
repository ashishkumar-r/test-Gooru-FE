import Ember from 'ember';
import ApplicationAdapter from '../application';

/**
 * Adapter to support the Performance API
 *
 * @typedef {Object} PerformanceAdapter
 */
export default ApplicationAdapter.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-insights/v2',

  /**
   * getStudentPerformanceOfAllItemsInClass for student view
   * @returns {Promise.<[]>}
   */
  getStudentPerformanceOfAllItemsInClass(filterData) {
    let {
      classId,
      courseId,
      userId,
      startDate,
      limit,
      offset
    } = filterData.body;
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/items/performance`;
    const options = {
      type: 'GET',
      headers: adapter.get('headers'),
      contentType: 'application/json; charset=utf-8',
      data: {
        userId,
        courseId,
        startDate,
        limit,
        offset
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * getStudentPerformanceOfAllItemsInClass for student view
   * @returns {Promise.<[]>}
   */
  getStudentPerformanceOfIndepedentLearning(filterData) {
    let { courseId, userId, startDate, limit, offset } = filterData.body;
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/learner/course/${courseId}/items/performance`;
    const options = {
      type: 'GET',
      headers: adapter.get('headers'),
      contentType: 'application/json; charset=utf-8',
      data: {
        userId,
        courseId,
        startDate,
        limit,
        offset
      }
    };
    return Ember.$.ajax(url, options);
  }
});
