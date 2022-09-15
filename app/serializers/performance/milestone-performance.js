import Ember from 'ember';
import DS from 'ember-data';

/**
 * Serializer for Milestone Performance model
 *
 * @typedef {Object} MilestonePerformanceSerializer
 */
export default DS.JSONAPISerializer.extend({
  /**
   * Normalized  performance data for milestones.
   * @return {Array}
   */
  normalizePerformanceDataForMilestones(response) {
    let resultSet = Ember.A();
    if (response.content !== undefined && response.content.length > 0) {
      response = Ember.A(response.content);
      response.forEach(data => {
        let result = Ember.Object.create(data);
        let usageData = result.get('usageData');
        if (usageData && usageData.length > 0) {
          let data = usageData.objectAt(0);
          const completedInPrecentage =
            data.totalCount > 0
              ? Math.round((data.completedCount / data.totalCount) * 100)
              : undefined;
          let milestonePerformance = Ember.Object.create({
            performance: Ember.Object.create({
              timeSpent: data.timeSpent,
              completedCount: data.completedCount,
              scoreInPercentage: data.scoreInPercentage,
              totalCount: data.totalCount,
              completedInPrecentage:
                completedInPrecentage > 100 ? 100 : completedInPrecentage
            }),
            milestoneId: result.get('milestoneId'),
            userUid: result.get('userUid')
          });

          resultSet.pushObject(milestonePerformance);
        }
      });
    }
    return resultSet;
  },

  /**
   * Normalized  performance data for milestone units.
   * @return {Array}
   */
  normalizePerformanceDataForMilestoneUnits(response) {
    let milestoneUnitsPerforamance = Ember.A([]);
    if (response.content !== undefined && response.content.length > 0) {
      let usersUnitsPerformance = response.content;
      usersUnitsPerformance.forEach(userUnitsPerformance => {
        let result = Ember.Object.create(userUnitsPerformance);
        let unitsPerforamanceData = result.get('usageData');
        if (unitsPerforamanceData && unitsPerforamanceData.length > 0) {
          unitsPerforamanceData.map(unitPerforamanceData => {
            const completedInPrecentage =
              unitPerforamanceData.totalCount > 0
                ? Math.round(
                  (unitPerforamanceData.completedCount /
                      unitPerforamanceData.totalCount) *
                      100
                )
                : undefined;
            let milestoneUnitPerformance = Ember.Object.create({
              unitId: unitPerforamanceData.unitId,
              performance: Ember.Object.create({
                timeSpent: unitPerforamanceData.timeSpent,
                completedCount: unitPerforamanceData.completedCount,
                scoreInPercentage: unitPerforamanceData.scoreInPercentage,
                totalCount: unitPerforamanceData.totalCount,
                completedInPrecentage:
                  completedInPrecentage > 100 ? 100 : completedInPrecentage
              }),
              milestoneId: result.get('milestoneId'),
              userUid: result.get('userUid')
            });
            milestoneUnitsPerforamance.pushObject(milestoneUnitPerformance);
          });
        }
      });
    }
    return milestoneUnitsPerforamance;
  },

  /**
   * Normalized  lesson performance data for milestone.
   * @return {Array}
   */

  normalizeLessonsPerformanceDataForMilestone(responsePayload) {
    let normalizedLessonsPerformance = Ember.A([]);
    if (
      responsePayload.content !== undefined &&
      responsePayload.content.length
    ) {
      let usersLessonsPerformance = responsePayload.content;
      usersLessonsPerformance.map(userLessonsPerformance => {
        if (
          userLessonsPerformance.usageData &&
          userLessonsPerformance.usageData.length
        ) {
          let lessonsPerforamanceData = userLessonsPerformance.usageData;
          lessonsPerforamanceData.map(lessonPerformanceData => {
            let normalizedLessonPerformanceData = Ember.Object.create({
              lessonId: lessonPerformanceData.lessonId,
              performance: Ember.Object.create({
                scoreInPercentage: lessonPerformanceData.scoreInPercentage,
                timeSpent: lessonPerformanceData.timeSpent,
                completedCount: lessonPerformanceData.completedCount,
                totalCount: lessonPerformanceData.totalCount,
                attempts: lessonPerformanceData.attempts
              }),
              userUid: userLessonsPerformance.userUid
            });
            normalizedLessonsPerformance.pushObject(
              normalizedLessonPerformanceData
            );
          });
        }
      });
    }
    return normalizedLessonsPerformance;
  }
});
