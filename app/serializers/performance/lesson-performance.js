import PerformanceSerializer from './performance';

/**
 * Lesson serializer for LessonPerformance model
 *
 * @typedef {Object} LessonPerformanceSerializer
 */
export default PerformanceSerializer.extend({
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
