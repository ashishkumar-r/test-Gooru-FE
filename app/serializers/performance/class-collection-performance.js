import ClassPerformanceSerializer from './class-performance';

/**
 * classCollectionPerformance serializer
 *
 * @typedef {Object} classCollectionPerformanceSerializer
 */
export default ClassPerformanceSerializer.extend({
  isCollection: function(payload) {
    return !!payload.collectionId;
  },

  getModelId: function(payload) {
    return this.isCollection(payload)
      ? payload.collectionId
      : payload.assessmentId;
  },

  getModelType: function() {
    return 'performance/collection-performance';
  },

  getObjectType: function(payload) {
    return this.isCollection(payload) ? 'collection' : 'assessment';
  }
});
