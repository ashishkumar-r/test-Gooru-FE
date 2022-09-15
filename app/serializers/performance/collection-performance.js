import PerformanceSerializer from './performance';

/**
 * CollectionPerformance serializer
 *
 * @typedef {Object} CollectionPerformanceSerializer
 */
export default PerformanceSerializer.extend({
  isCollection: function(payload) {
    return !!payload.collectionId;
  },

  isResource: function(payload) {
    return !!payload.resourceId;
  },

  getModelId: function(payload) {
    return this.isCollection(payload)
      ? payload.collectionId
      : this.isResource(payload) ? payload.resourceId : payload.assessmentId;
  },

  getModelType: function() {
    return 'performance/collection-performance';
  },

  getObjectType: function(payload) {
    return this.isCollection(payload)
      ? 'collection'
      : this.isResource(payload) ? 'resource' : 'assessment';
  }
});
