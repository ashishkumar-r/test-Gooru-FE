import ClassPerformanceSerializer from './class-performance';

/**
 * Lesson serializer for classLessonPerformance model
 *
 * @typedef {Object} classLessonPerformanceSerializer
 */
export default ClassPerformanceSerializer.extend({
  getModelId: function(payload) {
    return payload.lessonId;
  },

  getModelType: function() {
    return 'performance/lesson-performance';
  },

  getObjectType: function() {
    return 'lesson';
  }
});
