import Ember from 'ember';
import LearnerSerializer from 'gooru-web/serializers/learner/learner';
import LearnerAdapter from 'gooru-web/adapters/learner/learner';
import StudentCollectionPerformanceSerializer from 'gooru-web/serializers/performance/student-collection-performance';
import UserSessionSerializer from 'gooru-web/serializers/user-session';
import PerformanceService from 'gooru-web/services/api-sdk/performance';

/**
 * @typedef {Object} LearnerService
 */
export default Ember.Service.extend({
  /**
   * @property {LearnerSerializer} learnerSerializer
   */
  learnerSerializer: null,

  /**
   * @property {LearnerAdapter} learnerAdapter
   */
  learnerAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'learnerSerializer',
      LearnerSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'learnerAdapter',
      LearnerAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'studentCollectionPerformanceSerializer',
      StudentCollectionPerformanceSerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'userSessionSerializer',
      UserSessionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'performanceService',
      PerformanceService.create(Ember.getOwner(this).ownerInjection())
    );
  },
  /**
   * Fetches the learner locations
   *
   * @param userId - user to fetch the learner locations
   * @param contentType - one of course, collection or assessment
   * @param offset - for paginated listing of learner locations
   * @param limit - for paginated listing of learner locations
   * @returns {Promise}
   */
  fetchLocations: function(userId, contentType, offset = 0, limit = 20) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchLocations(userId, contentType, offset, limit)
        .then(
          response =>
            resolve(
              service.get('learnerSerializer').normalizeLocations(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the learner performance
   *
   * @param userId - user to fetch the learner performance
   * @param contentType - one of course, collection or assessment
   * @param offset - for paginated listing of learner performance
   * @param limit - for paginated listing of learner performance
   * @returns {Promise}
   */
  fetchPerformance: function(userId, contentType, offset = 0, limit = 20) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchPerformance(userId, contentType, offset, limit)
        .then(
          response =>
            resolve(
              service.get('learnerSerializer').normalizePerformances(response)
            ),
          reject
        );
    });
  },
  /**
   * Fetches the learner performance in lesson
   *
   * @param courseId - course to fetch the learner performance
   * @param unitId - unit to fetch the learner performance
   * @param lessonId - lesson to fetch the learner performance
   * @param collectionType
   * @returns {Promise}
   */
  fetchPerformanceLesson: function(courseId, unitId, lessonId, collectionType) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchPerformanceLesson(courseId, unitId, lessonId, collectionType)
        .then(
          response =>
            resolve(
              service
                .get('learnerSerializer')
                .normalizePerformancesLesson(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the learner performance in course
   *
   * @param courseId - course to fetch the learner performance
   * @param collectionType
   */
  fetchPerformanceCourse: function(courseId, collectionType) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchPerformanceCourse(courseId, collectionType)
        .then(
          response =>
            resolve(
              service
                .get('learnerSerializer')
                .normalizePerformancesCourse(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the learner performance in unit
   *
   * @param courseId - course to fetch the learner performance
   * @param unitId - unit to fetch the learner performance
   * @param collectionType
   */
  fetchPerformanceUnit: function(courseId, unitId, collectionType) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchPerformanceUnit(courseId, unitId, collectionType)
        .then(
          response =>
            resolve(
              service
                .get('learnerSerializer')
                .normalizePerformancesUnit(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the learner performance for specific courses
   *
   * @param userId - user to fetch the learner performance
   * @param courseIds - list of ids to fetch performance
   * @returns {Promise}
   */
  fetchCoursesPerformance: function(userId, courseIds) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchCoursesPerformance(userId, courseIds)
        .then(
          response =>
            resolve(
              service.get('learnerSerializer').normalizePerformances(response)
            ),
          reject
        );
    });
  },
  /**
   * Fetches the learner location in course
   *
   * @param courseId - course to fetch the learner location
   * @param userId - user to fetch the learner location
   * @returns {Promise}
   */
  fetchLocationCourse: function(courseId, userId) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchLocationCourse(courseId, userId)
        .then(
          response =>
            resolve(
              service
                .get('learnerSerializer')
                .normalizeFetchLocationCourse(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the performance summary data of each resource/question in Collection/Assessment.
   * @param context
   * @returns {Promise.<AssessmentResult>}
   */
  fetchCollectionPerformance: function(context) {
    const service = this;

    const params = {
      collectionType: context.collectionType,
      contentId: context.collectionId,
      userId: context.userId,
      sessionId: context.sessionId
    };
    if (context.courseId) {
      params.courseId = context.courseId;
      params.unitId = context.unitId;
      params.lessonId = context.lessonId;
    }

    return new Ember.RSVP.Promise(function(resolve) {
      return service
        .get('learnerAdapter')
        .fetchCollectionPerformance(params)
        .then(
          function(payload) {
            const assessmentResult = service
              .get('studentCollectionPerformanceSerializer')
              .normalizeStudentCollection(payload);
            resolve(assessmentResult);
          },
          function() {
            resolve();
          }
        );
    });
  },

  /**
   * Gets all the session that were completed.
   * @param context
   * @returns {Promise.<Object>}
   */
  fetchLearnerSessions: function(context) {
    const service = this;
    const params = {
      collectionType: context.collectionType,
      contentId: context.collectionId,
      userId: context.userId,
      openSession: false
    };

    if (context.sessionId) {
      params.sessionId = context.sessionId;
    }

    if (context.courseId) {
      params.courseId = context.courseId;
      params.unitId = context.unitId;
      params.lessonId = context.lessonId;
    }

    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('learnerAdapter')
        .fetchLearnerSessions(params)
        .then(
          response =>
            resolve(
              service
                .get('userSessionSerializer')
                .serializeSessionAssessments(response)
            ),
          reject
        );
    });
  }
});
