import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { roundFloat } from 'gooru-web/utils/math';
import { toLocal } from 'gooru-web/utils/utils';
import LocationModel from 'gooru-web/models/learner/location';
import PerformanceModel from 'gooru-web/models/learner/performance';

/**
 * Serializer to support the Learner CRUD operations for API 3.0
 *
 * @typedef {Object} LearnerSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Normalize the Fetch Locations endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Location[]} an array of learner locations
   */
  normalizeLocations: function(payload) {
    var result = [];
    const serializer = this;
    const locations = payload.usageData;
    if (Ember.isArray(locations)) {
      result = locations.map(location =>
        serializer.normalizeLocation(location)
      );
    }
    return result;
  },

  /**
   * Normalize the one Location from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Location}
   */
  normalizeLocation: function(payload) {
    var serializer = this;
    var date;
    if (payload.lastAccessed) {
      date = toLocal(payload.lastAccessed);
    }
    return LocationModel.create(Ember.getOwner(serializer).ownerInjection(), {
      collectionId: payload.courseId ? null : payload.collectionId,
      courseId: payload.courseId,
      lessonId: payload.lessonId,
      unitId: payload.unitId,
      type: payload.courseId ? CONTENT_TYPES.COURSE : payload.collectionType,
      title: payload.courseId ? payload.courseTitle : payload.collectionTitle,
      lastAccessed: payload.lastAccessed ? date : null,
      status: payload.status,
      currentId: payload.courseId ? payload.collectionId : null,
      currentTitle: payload.courseId ? payload.collectionTitle : null,
      currentType: payload.courseId ? payload.collectionType : null,
      pathType: payload.pathType || null,
      pathId: payload.pathId || 0,
      ctxPathType: payload.ctxPathType || null,
      ctxPathId: payload.ctxPathId || 0
    });
  },

  /**
   * Normalize the Fetch Performances endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Performance[]} an array of learner performances
   */
  normalizePerformances: function(payload) {
    var result = [];
    const serializer = this;
    const performances = payload.usageData;
    if (Ember.isArray(performances)) {
      result = performances.map(performance =>
        serializer.normalizePerformance(performance)
      );
    }
    return result;
  },

  /**
   * Normalize the one performance from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Performance}
   */
  normalizePerformance: function(payload) {
    var serializer = this;
    return PerformanceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        courseId: payload.courseId,
        courseTitle: payload.courseTitle,
        timeSpent: payload.timeSpent,
        completedCount: payload.completedCount,
        scoreInPercentage: roundFloat(payload.scoreInPercentage),
        totalCount: payload.totalCount,
        collectionId: payload.collectionId,
        collectionTitle: payload.collectionTitle,
        attempts: payload.attempts
      }
    );
  },
  /**
   * Normalize the Fetch Performances in Lesson endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Performance[]} an array of learner performances
   */
  normalizePerformancesLesson: function(payload) {
    var result = [];
    const serializer = this;
    const content = payload.content;
    if (Ember.isArray(content)) {
      content.map(function(content) {
        const performances = content.usageData;
        if (Ember.isArray(performances)) {
          result = performances.map(performance =>
            serializer.normalizePerformanceLesson(performance)
          );
        }
      });
    }
    return result;
  },

  /**
   * Normalize the one performance from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Performance}
   */
  normalizePerformanceLesson: function(payload) {
    var serializer = this;
    return PerformanceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        reaction: payload.reaction,
        attemptStatus: payload.attemptStatus,
        timeSpent: payload.timeSpent,
        completedCount: payload.completedCount,
        scoreInPercentage: roundFloat(payload.scoreInPercentage),
        totalCount: payload.totalCount,
        collectionId: payload.collectionId || payload.assessmentId,
        attempts: payload.attempts
      }
    );
  },

  /**
   * Normalize the Fetch Performances in Course endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Performance[]} an array of learner performances
   */
  normalizePerformancesCourse: function(payload) {
    var result = [];
    const serializer = this;
    const content = payload.content;
    if (Ember.isArray(content)) {
      content.map(function(content) {
        const performances = content.usageData;
        if (Ember.isArray(performances)) {
          result = performances.map(performance =>
            serializer.normalizePerformanceCourse(performance)
          );
        }
      });
    }
    return result;
  },

  /**
   * Normalize the Fetch Performances in Unit endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Performance[]} an array of learner performances
   */
  normalizePerformancesUnit: function(payload) {
    var result = [];
    const serializer = this;
    const content = payload.content;
    if (Ember.isArray(content)) {
      content.map(function(content) {
        const performances = content.usageData;
        if (Ember.isArray(performances)) {
          result = performances.map(performance =>
            serializer.normalizePerformanceUnit(performance)
          );
        }
      });
    }
    return result;
  },

  /**
   * Normalize the one performance from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Performance}
   */
  normalizePerformanceCourse: function(payload) {
    var serializer = this;
    return PerformanceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        reaction: payload.reaction,
        attemptStatus: payload.attemptStatus,
        timeSpent: payload.timeSpent,
        completedCount: payload.completedCount,
        scoreInPercentage: roundFloat(payload.scoreInPercentage),
        totalCount: payload.totalCount,
        unitId: payload.unitId,
        attempts: payload.attempts
      }
    );
  },

  /**
   * Normalize the one performance from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Performance}
   */
  normalizePerformanceUnit: function(payload) {
    var serializer = this;
    return PerformanceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        reaction: payload.reaction,
        attemptStatus: payload.attemptStatus,
        timeSpent: payload.timeSpent,
        completedCount: payload.completedCount,
        scoreInPercentage: roundFloat(payload.scoreInPercentage),
        totalCount: payload.totalCount,
        lessonId: payload.lessonId,
        attempts: payload.attempts,
        sourceList: payload.sourceList.map(source =>
          serializer.normalizePerformanceLesson(source)
        )
      }
    );
  },
  /**
   * Normalize the Fetch Location in Course endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Location} current location for course
   */
  normalizeFetchLocationCourse: function(payload) {
    const serializer = this;
    const content = payload.content;
    if (Ember.isArray(content) && content.length) {
      const locationPayload = content[0];
      return serializer.normalizeLocationCourse(locationPayload);
    }
    return '';
  },

  /**
   * Normalize the one location from the endpoint's response
   *
   * @param payload is part of the response in JSON format
   * @returns {Location}
   */
  normalizeLocationCourse: function(payload) {
    const serializer = this;
    return LocationModel.create(Ember.getOwner(serializer).ownerInjection(), {
      courseId: payload.courseId,
      unitId: payload.unitId,
      lessonId: payload.lessonId,
      collectionId: payload.collectionId || payload.assessmentId,
      title: payload.collectionTitle || payload.assessmentTitle,
      pathId: payload.pathId || 0,
      pathType: payload.pathType || null,
      ctxPathId: payload.ctxPathId || 0,
      ctxPathType: payload.ctxPathType || null
    });
  }
});
