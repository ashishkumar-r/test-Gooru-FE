import Ember from 'ember';
import PerformanceAdapter from 'gooru-web/adapters/performance/performance';
import PerformanceSerializer from 'gooru-web/serializers/performance';
/**
 * Service for the performance
 *
 * @typedef {Object} performanceService
 */
export default Ember.Service.extend({
  performanceAdapter: null,

  performanceSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'performanceAdapter',
      PerformanceAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'performanceSerializer',
      PerformanceSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get performance of user performance units
   * @returns {Promise.<[]>}
   */
  getUserPerformanceUnits: function(userId, courseId, classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceUnits(userId, courseId, classId)
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceUnits(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user performance lessons
   * @returns {Promise.<[]>}
   */
  getUserPerformanceLessons: function(userId, courseId, unitId, classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceLessons(userId, courseId, unitId, classId)
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceLessons(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user performance collections
   * @returns {Promise.<[]>}
   */
  getUserPerformanceCollections: function(
    userId,
    courseId,
    unitId,
    lessonId,
    classId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceCollections(
          userId,
          courseId,
          unitId,
          lessonId,
          classId
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceCollections(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user  resource in assessments
   * @returns {Promise.<[]>}
   */
  getUserPerformanceResourceInAssessment: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    sessionId,
    classId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceResourceInAssessment(
          userId,
          courseId,
          unitId,
          lessonId,
          collectionId,
          sessionId,
          classId
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceResourceInAssessment(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user  resource in collection
   * @returns {Promise.<[]>}
   */
  getUserPerformanceResourceInCollection: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    sessionId,
    classId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceResourceInCollection(
          userId,
          courseId,
          unitId,
          lessonId,
          collectionId,
          sessionId,
          classId
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceResourceInCollection(response)
          );
        }, reject);
    });
  },

  /**
   * Get active user competency summary report
   * @returns {Promise.<[]>}
   */
  getUserCompetencySummary: function(userId, competencyCode) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('learnersAdapter')
        .getUserCompetencySummary(userId, competencyCode)
        .then(function(response) {
          resolve(
            service
              .get('learnersSerializer')
              .normalizeUserCompetencySummary(response)
          );
        }, reject);
    });
  }
});
