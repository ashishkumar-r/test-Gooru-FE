import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
/**
 *
 * Analytics data for a student related to a collection of resources
 * Gathers and passes the necessary information to the controller
 *
 * @module
 * @augments ember/Route
 */
export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Ember.Service} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @type {UnitService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @param {{ assessmentId: string, resourceId: string }} params
   */
  model: function(params) {
    const route = this;
    let classId = params.classId;
    let courseId = params.courseId;
    let contentType = params.type;
    return route
      .get('navigateMapService')
      .getMapLocation(params)
      .then(function(mapLocation) {
        return Ember.RSVP.hash({
          classPromise: classId
            ? route.get('classService').readClassInfo(classId)
            : Ember.RSVP.resolve({}),
          course: route.get('courseService').fetchById(courseId),
          collection:
            contentType === CONTENT_TYPES.EXTERNAL_COLLECTION
              ? route
                .get('collectionService')
                .readExternalCollection(params.collectionId)
              : route
                .get('assessmentService')
                .readExternalAssessment(params.collectionId)
        }).then(function(hash) {
          return Ember.RSVP.hash({
            course: hash.course,
            collection: hash.collection,
            class: hash.classPromise,
            classId: classId,
            score: params.score,
            timespent: params.timespent,
            isIframeMode: params.isIframeMode,
            mapLocation
          });
        });
      });
  },

  setupController(controller, model) {
    this._super(...arguments);
    controller.setProperties({
      course: model.course,
      collection: model.collection,
      class: model.class,
      classId: model.classId,
      score: Number(model.score),
      timespent: Number(model.timespent),
      isIframeMode: model.isIframeMode,
      mapLocation: model.mapLocation
    });
    controller.fetchActivityFeedbackCateory();
    controller.initial();
  }
});
