import AssessmentResult from 'gooru-web/models/result/assessment';
import AnalyticsSerializer from '../analytics/analytics';
import { toLocal } from 'gooru-web/utils/utils';

export default AnalyticsSerializer.extend({
  /**
   * Normalizes the result for student collection performance
   * @param payload
   * @returns {AssessmentResult}
   */
  normalizeStudentCollection: function(payload) {
    const serializer = this;
    const found = payload && payload.content && payload.content.length;

    if (found) {
      let content = payload.content[0];
      let collection = content.collection || content.assessment;
      let resources =
        content.resources || content.questions || content.usageData;
      return AssessmentResult.create({
        sessionId: collection.sessionId,
        score: collection.score,
        resourceId: collection.gooruOId,
        timeSpent: collection.timeSpent || collection.timespent,
        views: collection.views,
        totalAttempts: collection.attempts,
        resourceResults: serializer.normalizeResourceResults(resources),
        startedAt: payload.startTime
          ? toLocal(payload.startTime)
          : toLocal(
            new Date().getTime()
          ) /* TODO this should come from server */,
        submittedAt: collection.eventTime ? toLocal(collection.eventTime) : null
      });
    }
    return false;
  }
});
