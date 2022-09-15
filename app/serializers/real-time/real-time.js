import AnalyticsSerializer from 'gooru-web/serializers/analytics/analytics';
import UserResourcesResult from 'gooru-web/models/result/user-resources';

export default AnalyticsSerializer.extend({
  serialize: function(snapshot) {
    return snapshot.toJSON();
  },

  normalizeRealTimeEvent: function(payload) {
    const serializer = this;
    return UserResourcesResult.create({
      user: payload.userId,
      isAttemptStarted: !!payload.event.isNewAttempt,
      isAttemptFinished: !!payload.event.isCompleteAttempt,
      resourceResults: serializer.normalizeRealTimeEventContent(payload.event)
    });
  },

  normalizeRealTimeEventContent: function(payload) {
    const serializer = this;
    return payload.resourceType
      ? [serializer.normalizeResourceResult(payload)]
      : [];
  }
});
