import AnalyticsSerializer from 'gooru-web/serializers/analytics/analytics';
import EventsSerializer from 'gooru-web/serializers/events/events';
import RealTimeSerializer from 'gooru-web/serializers/real-time/real-time';
import StudentCollectionPerformanceSerializer from 'gooru-web/serializers/performance/student-collection-performance';
import UserSessionSerializer from 'gooru-web/serializers/user-session';

export default {
  name: 'serializers',
  after: 'gooru-configuration',
  initialize: function(application) {
    application.register('serializer:analytics', AnalyticsSerializer, {
      singleton: false
    });
    application.register('serializer:events', EventsSerializer, {
      singleton: false
    });
    application.register('serializer:real-time', RealTimeSerializer, {
      singleton: false
    });
    application.register(
      'serializer:student-collection-performance',
      StudentCollectionPerformanceSerializer,
      { singleton: false }
    );
    application.register('serializer:user-session', UserSessionSerializer, {
      singleton: false
    });

    application.inject(
      'service:api-sdk/analytics',
      'analyticsSerializer',
      'serializer:analytics'
    );
    application.inject(
      'service:api-sdk/performance',
      'studentCollectionPerformanceSerializer',
      'serializer:student-collection-performance'
    );
    application.inject(
      'service:api-sdk/real-time',
      'realTimeSerializer',
      'serializer:real-time'
    );
    application.inject(
      'service:api-sdk/events',
      'eventsSerializer',
      'serializer:events'
    );
    application.inject(
      'service:api-sdk/user-session',
      'userSessionSerializer',
      'serializer:user-session'
    );
    application.inject(
      'controller:reports/collection',
      'realTimeSerializer',
      'serializer:real-time'
    );
  }
};
