import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  getStudentPerformanceOfAllItemsInClass(data) {
    return data;
  },

  /**
   * Filter convertions to be consumend by the adapter
   */
  serializedFilterData(data) {
    let { classId, courseId, userId, startDate, limit, offset } = data;
    classId = classId ? classId : null;
    courseId = courseId ? courseId : null;
    userId = userId ? userId : this.get('session.userId');
    startDate = startDate ? startDate : new Date().toISOString().slice(0, 10);
    limit = limit ? limit : 10;
    offset = offset ? offset : 0;

    return {
      classId: classId,
      courseId: courseId,
      userId: userId,
      startDate: startDate,
      limit: limit,
      offset: offset
    };

    //return data;
  },

  /**
   * @param {JSON Object } responseData, response data returned by service (snake_case)
   * @returns{JSON Object} data normalized, converted to the form used by application(non snake_case )
   */
  normalizeUsageData(payload) {
    const serializer = this;
    const timeData = Ember.Object.create({
      activities: Ember.A()
    });
    if (payload.content && payload.content.length > 0) {
      if (Ember.isArray(payload.content[0].usageData)) {
        timeData.set('activityStartDate', payload.content[0].startDate);
        let activityData = payload.content[0].usageData.map(function(
          timelineData
        ) {
          return serializer.normalizeChronoPerformanceSummary(timelineData);
        });
        timeData.set('activities', activityData);
      }
    }
    return timeData;
  },

  /**
   * Normalize a ChronoPerformanceSummary
   * @param {*} data
   * @return {ChronoPerformanceSummary}
   */
  normalizeChronoPerformanceSummary: function(data) {
    return Ember.Object.create({
      id: data.collectionId || data.collection_id,
      collectionId: data.collectionId || data.collection_id,
      timeSpent: data.timeSpent,
      attempts: data.attempts,
      views: data.views,
      score: data.scoreInPercentage,
      pathId: data.pathId,
      ctxPathId: data.ctxPathId,
      sessionId: data.sessionId,
      status: data.status,
      collectionType: data.collectionType,
      pathType: data.pathType,
      ctxPathType: data.ctxPathType,
      lastAccessedDate: data.lastAccessed,
      classId: data.classId,
      unitId: data.unitId,
      lessonId: data.lessonId,
      courseId: data.courseId,
      contentSource: data.contentSource
    });
  },

  normalizeFetch: data => {
    return data;
  },

  updateAction: data => {
    return data;
  }
});
