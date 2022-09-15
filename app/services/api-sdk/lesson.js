import Ember from 'ember';
import StoreMixin from '../../mixins/store';
import LessonSerializer from 'gooru-web/serializers/content/lesson';
import LessonAdapter from 'gooru-web/adapters/content/lesson';
import { CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * Lesson Service
 *
 * Service responsible for retrieving all data related to the lesson model
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-viewer.js
 *
 * @typedef {Object} LessonService
 * @augments Ember/Service
 */
export default Ember.Service.extend(StoreMixin, {
  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'serializer',
      LessonSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'adapter',
      LessonAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UnitSerializer} serializer
   */
  serializer: null,

  /**
   * @property {UnitAdapter} adapter
   */
  adapter: null,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Create a unit for a course
   * @param {String} courseId - ID of the course the lesson belongs to
   * @param {Content/Unit} unitId - ID of the unit the lesson belongs to
   * @param {Content/Lesson} lesson - Lesson model
   * @returns {Promise|String} returns the lesson model with the newly assigned ID
   */
  createLesson: function(courseId, unitId, lesson) {
    var lessonData = this.get('serializer').serializeCreateLesson(lesson);
    return this.get('adapter')
      .createLesson({
        courseId: courseId,
        unitId: unitId,
        lesson: lessonData
      })
      .then(function(lessonId) {
        lesson.set('id', lessonId);
        return lesson;
      })
      .catch(function(error) {
        return error;
      });
  },

  createLessonPlan: function(courseId, unitId, lessonId, lessonPlan) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      var lessonData = this.get('serializer').serializeCreateLessonPlan(
        lessonPlan
      );
      return this.get('adapter')
        .createLessonPlan({
          courseId: courseId,
          unitId: unitId,
          lessonId: lessonId,
          lessonPlan: lessonData
        })
        .then(function(response) {
          resolve(response), reject;
        });
    });
  },

  /**
   * Update existing lesson
   * @param {String} courseId - ID of the course the lesson belongs to
   * @param {String} unitId - ID of the unit the lesson belongs to
   * @param {Content/Lesson} lesson - Lesson model
   * @returns {Promise|String} returns the lesson model
   */
  updateLesson: function(courseId, unitId, lesson) {
    var lessonData = this.get('serializer').serializeUpdateLesson(lesson);

    return this.get('adapter')
      .updateLesson({
        lessonId: lesson.get('id'),
        unitId: unitId,
        courseId: courseId,
        lesson: lessonData
      })
      .then(function() {
        return lesson;
      })
      .catch(function(error) {
        return error;
      });
  },

  updateLessonPlan: function(courseId, unitId, lessonId, lessonPlan, index) {
    var lessonData = this.get('serializer').serializeUpdateLessonPlan(
      lessonPlan
    );
    return this.get('adapter')
      .updateLessonPlan({
        unitId: unitId,
        courseId: courseId,
        lessonId: lessonId,
        lessonPlan: lessonData,
        index: index
      })
      .then(function() {
        return lessonPlan;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Returns a lesson by id
   * @param {string} courseId - course the lesson belongs to
   * @param {string} unitId - unit the lesson belongs to
   * @param {string} lessonId - lesson ID to search for
   * @returns {Promise|Content/Lesson}
   */
  fetchById: function(courseId, unitId, lessonId) {
    const service = this;
    return service
      .get('adapter')
      .getLessonById({
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId
      })
      .then(function(lessonData) {
        return service.get('serializer').normalizeLesson(lessonData);
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Associates a Collection/Assesment with a lesson
   *
   * @param lessonId the lesson id
   * @param collectionId the collection/assesment id
   * @returns {Promise}
   */
  associateAssessmentOrCollectionToLesson: function(
    courseId,
    unitId,
    lessonId,
    collectionId,
    isCollection,
    oaType = null
  ) {
    const service = this;
    let activityType = isCollection
      ? CONTENT_TYPES.COLLECTION
      : CONTENT_TYPES.ASSESSMENT;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .associateAssessmentOrCollectionToLesson({
          courseId,
          unitId,
          lessonId,
          collectionId,
          type: oaType ? oaType : activityType
        })
        .then(resolve, reject);
    });
  },

  /**
   * Disassociates a Collection/Assesment with a lesson
   *
   * @param lessonId the lesson id
   * @param collectionId the collection/assesment id
   * @returns {Promise}
   */
  disassociateAssessmentOrCollectionToLesson: function(
    courseId,
    unitId,
    lessonId,
    collectionId,
    isCollection
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .disassociateAssessmentOrCollectionToLesson({
          courseId,
          unitId,
          lessonId,
          collectionId,
          type: isCollection
            ? CONTENT_TYPES.COLLECTION
            : CONTENT_TYPES.ASSESSMENT
        })
        .then(resolve, reject);
    });
  },
  /**
   * Delete lesson
   *
   * @param courseId - course the unit belongs to
   * @param unitId The Unit id to delete
   * @param lessonId the lesson id
   * @returns {Ember.RSVP.Promise}
   */
  deleteLesson: function(courseId, unitId, lessonId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .deleteLesson({ courseId, unitId, lessonId })
        .then(resolve, reject);
    });
  },
  deleteLessonPlan: function(courseId, unitId, lessonId, lessonPlanId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .deleteLessonPlan({ courseId, unitId, lessonId, lessonPlanId })
        .then(resolve, reject);
    });
  },

  /**
   * Copies a Lesson by id
   * @param {string} lessonId
   * @returns {Ember.RSVP.Promise}
   */
  copyLesson: function(courseId, unitId, lessonId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .copyLesson({
          courseId,
          unitId,
          lessonId
        })
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder lesson lessons
   *
   * @param courseId the id of the Course
   * @param unitId the id of the Unit to be updated
   * @param lessonId the id of the lesson to be updated
   * @param {string[]} collectionIds
   * @returns {Promise}
   */
  reorderLesson: function(courseId, unitId, lessonId, collectionIds) {
    const service = this;
    let serializedData = service
      .get('serializer')
      .serializeReorderLesson(collectionIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .reorderLesson(courseId, unitId, lessonId, serializedData)
        .then(resolve, reject);
    });
  },

  itemLesson: function(param) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('adapter')
        .itemLesson(param)
        .then(response => {
          resolve(service.get('serializer').serializeItemLesson(response));
        });
    });
  }
});
