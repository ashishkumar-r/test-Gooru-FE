import PerformanceSerializer from './performance';

/**
 * Serializer for Unit-Performance model
 *
 * @typedef {Object} UnitPerformanceSerializer
 */
export default PerformanceSerializer.extend({
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
