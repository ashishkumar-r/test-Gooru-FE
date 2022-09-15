import Ember from 'ember';
import ClassPerformanceSummary from 'gooru-web/models/performance/class-performance-summary';

/**
 * Serializer to support the ClassPerformanceSummary CRUD operations
 *
 * @typedef {Object} ClassPerformanceSummary
 */
export default Ember.Object.extend({
  /**
   * Normalize an array of ClassPerformanceSummary
   *
   * @param payload endpoint response format in JSON format
   * @returns {ClassPerformanceSummary[]}
   */
  normalizeAllClassPerformanceSummary: function(payload) {
    const serializer = this;
    if (payload && Ember.isArray(payload.usageData)) {
      return payload.usageData.map(function(classPerformanceSummary) {
        return serializer.normalizeClassPerformanceSummary(
          classPerformanceSummary
        );
      });
    } else {
      return [];
    }
  },

  /**
   * Normalize a goal
   * @param {*} data
   * @return {Goal}
   */
  normalizeClassPerformanceSummary: function(data) {
    return ClassPerformanceSummary.create({
      id: data.classId,
      classId: data.classId,
      timeSpent: data.timeSpent,
      score: data.scoreInPercentage,
      sessionId: data.lastSessionId,
      totalCompleted: data.completedCount,
      totalScore: data.totalScore,
      total:
        data.totalCount ||
        data.completedCount /* using completedCount when no total count found, tmp fix */
    });
  }
});
