import Ember from 'ember';
import CurrentLocationModel from 'gooru-web/models/analytics/current-location';

/**
 * CurrentLocation's Serializer
 *
 * @typedef {Object} CurrentLocationSerializer
 */
export default Ember.Object.extend({
  /**
   * Normalize the response from CurrentLocation for all classes
   * @param payload is the endpoint response in JSON format
   * @returns {CurrentLocation[]}
   */
  normalizeForGetUserClassesLocation: function(payload) {
    let serializer = this;
    if (Ember.isArray(payload.usageData) && payload.usageData.length > 0) {
      return payload.usageData.map(function(locationPayload) {
        return serializer.normalizeCurrentLocation(locationPayload);
      });
    }
    return [];
  },

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param payload is the endpoint response in JSON format
   * @returns {CurrentLocation} a current location model object
   */
  normalizeForGetUserCurrentLocation: function(payload) {
    let currentLocation = null;
    if (Ember.isArray(payload.content) && payload.content.length > 0) {
      const locationPayload = payload.content[0];
      return this.normalizeCurrentLocation(locationPayload);
    }
    return currentLocation;
  },

  /**
   * Normalize the response from CurrentLocation endpoint
   * @param locationPayload is the endpoint response in JSON format
   * @returns {CurrentLocation} a current location model object
   */
  normalizeCurrentLocation: function(locationPayload) {
    let currentLocation = null;
    currentLocation = CurrentLocationModel.create({
      classId: locationPayload.classId,
      courseId: locationPayload.courseId,
      unitId: locationPayload.unitId,
      lessonId: locationPayload.lessonId,
      collectionId: locationPayload.collectionId
        ? locationPayload.collectionId
        : locationPayload.assessmentId,
      collectionType: locationPayload.collectionType
        ? locationPayload.collectionType
        : locationPayload.collectionId
          ? 'collection'
          : 'assessment',
      status: locationPayload.status,
      pathId: locationPayload.pathId || 0,
      pathType: locationPayload.pathType || null,
      ctxPathId: locationPayload.ctxPathId || 0,
      ctxPathType: locationPayload.ctxPathType || null,
      scoreInPercentage: locationPayload.scoreInPercentage || null,
      collectionTitle:
        locationPayload.collectionTitle || locationPayload.assessmentTitle,
      milestoneId: locationPayload.milestoneId || null
    });
    return currentLocation;
  }
});
