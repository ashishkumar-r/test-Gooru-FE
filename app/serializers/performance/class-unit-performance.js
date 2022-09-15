import ClassPerformanceSerializer from './class-performance';

/**
 * Serializer for class-Unit-Performance model
 *
 * @typedef {Object} ClassUnitPerformanceSerializer
 */
export default ClassPerformanceSerializer.extend({
  getModelId: function(payload) {
    return payload.unitId;
  },

  getModelType: function() {
    return 'performance/unit-performance';
  },

  getObjectType: function() {
    return 'unit';
  }
});
