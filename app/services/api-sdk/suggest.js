import Ember from 'ember';
import SuggestAdapter from 'gooru-web/adapters/suggest/suggest';
import SuggestSerializer from 'gooru-web/serializers/suggest/suggest';
import SuggestContext from 'gooru-web/models/suggest/suggest-context';
import { CONTENT_TYPES } from 'gooru-web/config/config';
/**
 * Service to support the suggest functionality
 *
 * Country, State, District
 *
 * @typedef {Object} SuggestService
 */
export default Ember.Service.extend({
  suggestSerializer: null,

  suggestAdapter: null,

  /**
   * @property {CollectionService}
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {CollectionService}
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {OfflineActivityService}
   */
  /**
   * @requires service:api-sdk/offline-activity
   */
  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),
  /**
   * @property {PerformanceService}
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  init: function() {
    this._super(...arguments);
    this.set(
      'suggestAdapter',
      SuggestAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'suggestSerializer',
      SuggestSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets resource suggestions for an specific collection/assessment in a course
   * @param {string} userId
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   * @param {string} collectionId
   * @param {number} score
   * @param {number} timeSpent
   * @returns {Promise.<Resource[]>}
   */
  suggestResourcesForCollectionInCourse: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    score = undefined,
    timeSpent = undefined
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const context = SuggestContext.create({
        collectionId: collectionId,
        userId: userId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId,
        score: score,
        timeSpent: timeSpent
      });
      service
        .get('suggestAdapter')
        .suggestResourcesForCollection(context)
        .then(function(response) {
          resolve(
            service.get('suggestSerializer').normalizeSuggestResources(response)
          );
        }, reject);
    });
  },

  /**
   * Gets resource suggestions for an specific collection/assessment
   * @param {string} userId
   * @param {string} collectionId
   * @param {number} score
   * @param {number} timeSpent
   * @returns {Promise.<Resource[]>}
   */
  suggestResourcesForCollection: function(
    userId,
    collectionId,
    score = undefined,
    timeSpent = undefined
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const context = SuggestContext.create({
        collectionId: collectionId,
        userId: userId,
        score: score,
        timeSpent: timeSpent
      });
      service
        .get('suggestAdapter')
        .suggestResourcesForCollection(context)
        .then(function(response) {
          resolve(
            service.get('suggestSerializer').normalizeSuggestResources(response)
          );
        }, reject);
    });
  },

  /**
   * Gets resource suggestions for an specific resource in a course
   * @param {string} userId
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   * @param {string} collectionId
   * @param {string} resourceId
   * @returns {Promise.<Resource[]>}
   */
  suggestResourcesForResourceInCourse: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    resourceId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const context = SuggestContext.create({
        containerId: collectionId,
        userId: userId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId
      });
      service
        .get('suggestAdapter')
        .suggestResourcesForResource(resourceId, context)
        .then(function(response) {
          resolve(
            service.get('suggestSerializer').normalizeSuggestResources(response)
          );
        }, reject);
    });
  },

  /**
   * Gets resource suggestions for an specific resource
   * @param {string} userId
   * @param {string} resourceId
   * @returns {Promise.<Resource[]>}
   */
  suggestResourcesForResource: function(userId, resourceId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const context = SuggestContext.create({
        userId: userId
      });
      service
        .get('suggestAdapter')
        .suggestResourcesForResource(resourceId, context)
        .then(function(response) {
          resolve(
            service.get('suggestSerializer').normalizeSuggestResources(response)
          );
        }, reject);
    });
  },

  /**
   * Add Suggestion to student
   * @param {SuggestContext} context
   * @returns {Promise}
   */
  suggestContent(context) {
    const service = this;
    return service.get('suggestAdapter').suggestContent(context);
  },

  /**
   * Fetch suggestions for CA
   * @param {classId} classId
   * @param {SuggestContext} context
   * @returns {Promise}
   */
  fetchSuggestionsByCAId(classId, context) {
    const service = this;
    const userId = context.userId;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('suggestAdapter')
        .fetchSuggestionForCA(classId, context)
        .then(function(response) {
          const normalizedContent = service
            .get('suggestSerializer')
            .normalizeCASuggestionContents(response.suggestions.objectAt(0));
          const suggestions = normalizedContent.get('suggestions');
          const collectionPathIds = [];
          const assessmentPathIds = [];
          const lookupKey = 'id';
          const assessmentSuggestions = suggestions.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.ASSESSMENT
          );
          const collectionSuggestions = suggestions.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.COLLECTION
          );
          collectionSuggestions.map(suggestion => {
            const suggestedToContext = suggestion.get('suggestedToContext');
            if (suggestedToContext) {
              suggestedToContext
                .filter(context => context.get('id') > 0)
                .map(context => {
                  collectionPathIds.push(context.get('id'));
                });
            }
          });
          assessmentSuggestions.map(suggestion => {
            const suggestedToContext = suggestion.get('suggestedToContext');
            if (suggestedToContext) {
              suggestedToContext
                .filter(context => context.get('id') > 0)
                .map(context => {
                  assessmentPathIds.push(context.get('id'));
                });
            }
          });
          if (collectionPathIds.length) {
            service.fetchStudentPerformance(
              'dca',
              classId,
              userId,
              collectionPathIds,
              CONTENT_TYPES.COLLECTION,
              suggestions,
              lookupKey
            );
          }
          if (assessmentPathIds.length) {
            service.fetchStudentPerformance(
              'dca',
              classId,
              userId,
              assessmentPathIds,
              CONTENT_TYPES.ASSESSMENT,
              suggestions,
              lookupKey
            );
          }
          resolve(normalizedContent);
        }, reject);
    });
  },

  /**
   * Fetch suggestions for CA
   * @param {source} source
   * @param {classId} classId
   * @param {userId} userId
   * @param {collectionIds} collectionIds
   * @param {collectionType} collectionType
   * @param {suggestions} suggestions
   * @returns {Promise}
   */
  fetchStudentPerformance(
    source,
    classId,
    userId,
    pathIds,
    collectionType,
    suggestions,
    lookupKey
  ) {
    const service = this;
    service
      .get('performanceService')
      .fecthSuggestionPerformance({
        source: source,
        classId,
        userId,
        pathIds: pathIds,
        collectionType: collectionType
      })
      .then(result => {
        suggestions.map(suggestion => {
          const suggestedToContext = suggestion.get('suggestedToContext');
          if (suggestedToContext) {
            suggestedToContext.map(context => {
              const performance = result.findBy('pathId', context[lookupKey]);
              if (performance) {
                if (!userId) {
                  context.set('performance', performance);
                } else {
                  suggestion.set('performance', performance);
                }
              }
            });
          } else {
            const performance = result.findBy('pathId', suggestion[lookupKey]);
            if (performance) {
              suggestion.set('performance', performance);
            }
          }
        });
      });
  },

  /**
   * Add class-activity suggestions
   * @param {SuggestContext} context
   * @returns {Promise}
   */
  getSuggestionCountForCA(classId, context) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('suggestAdapter')
        .fetchSuggestionForCA(classId, context)
        .then(function(response) {
          let suggestions = service
            .get('suggestSerializer')
            .normalizeSuggestionCount(response);
          resolve(suggestions);
        }, reject);
    });
  },

  /**
   * Add class-activity suggestions
   * @param {SuggestContext} context
   * @returns {Promise}
   */
  fetchAcrossClassSuggestionsByCode(userId, code, params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('suggestAdapter')
        .fetchAcrossClassSuggestionsByCode(userId, code, params)
        .then(function(response) {
          let normalizedContent = service
            .get('suggestSerializer')
            .normalizeProficiencySuggestionContents(response);
          let collectionPromise = [];
          normalizedContent.suggestions.forEach(suggestion => {
            let collectionService = null;
            if (suggestion.suggestedContentType === CONTENT_TYPES.ASSESSMENT) {
              collectionService = service
                .get('assessmentService')
                .readAssessment(suggestion.suggestedContentId);
            } else if (
              suggestion.suggestedContentType === CONTENT_TYPES.COLLECTION
            ) {
              collectionService = service
                .get('collectionService')
                .readCollection(suggestion.suggestedContentId);
            } else {
              collectionService = service
                .get('offlineActivityService')
                .readActivity(suggestion.suggestedContentId);
            }
            collectionPromise.push(collectionService);
          });
          Ember.RSVP.Promise.all(collectionPromise).then(function(data) {
            data.forEach((collection, index) => {
              let suggestionContent = normalizedContent.suggestions.objectAt(
                index
              );
              suggestionContent.set('collection', collection);
            });
            resolve(normalizedContent);
          });
        }, reject);
    });
  },

  /**
   * Add class-activity suggestions
   * @param {SuggestContext} context
   * @returns {Promise}
   */
  fetchInClassSuggestionsByCode(userId, code, params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('suggestAdapter')
        .fetchInClassSuggestionsByCode(userId, code, params)
        .then(function(response) {
          resolve(response);
        }, reject);
    });
  },

  /**
   * fetch In-Class suggestions for student
   * @param {string} source
   * @returns {Promise}
   */
  fetchInClassSuggestionsForStudent(userId, classId, params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('suggestAdapter')
        .fetchInClassSuggestionsForStudent(userId, classId, params)
        .then(function(response) {
          let suggestions = service
            .get('suggestSerializer')
            .normalizeSuggestionContainer(response);
          const caContents = suggestions.filterBy(
            'suggestionArea',
            'class-activity'
          );
          const courseMapContents = suggestions.filterBy(
            'suggestionArea',
            'course-map'
          );
          const proficiencyContents = suggestions.filterBy(
            'suggestionArea',
            'proficiency'
          );
          const caCollections = caContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.COLLECTION
          );
          const caAssessments = caContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.ASSESSMENT
          );
          const caCollectionPathIds = caCollections
            .filter(caContent => caContent.get('id') > 0)
            .map(caContent => {
              return caContent.get('id');
            });
          const caAssessmentPathIds = caAssessments
            .filter(caContent => caContent.get('id') > 0)
            .map(caContent => {
              return caContent.get('id');
            });
          if (caCollectionPathIds.length) {
            service.fetchStudentPerformance(
              'dca',
              classId,
              userId,
              caCollectionPathIds,
              CONTENT_TYPES.COLLECTION,
              suggestions,
              'id'
            );
          }
          if (caAssessmentPathIds.length) {
            service.fetchStudentPerformance(
              'dca',
              classId,
              userId,
              caAssessmentPathIds,
              CONTENT_TYPES.ASSESSMENT,
              suggestions,
              'id'
            );
          }
          const proficiencyCollections = proficiencyContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.COLLECTION
          );
          const proficiencyAssessments = proficiencyContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.ASSESSMENT
          );
          const proficiencyCollectionPathIds = proficiencyCollections
            .filter(proficiencyContent => proficiencyContent.get('id') > 0)
            .map(proficiencyContent => {
              return proficiencyContent.get('id');
            });
          const proficiencyAssessmentPathIds = proficiencyAssessments
            .filter(proficiencyContent => proficiencyContent.get('id') > 0)
            .map(proficiencyContent => {
              return proficiencyContent.get('id');
            });
          if (proficiencyCollectionPathIds.length) {
            service.fetchStudentPerformance(
              'proficiency',
              classId,
              userId,
              proficiencyCollectionPathIds,
              CONTENT_TYPES.COLLECTION,
              suggestions,
              'id'
            );
          }
          if (proficiencyAssessmentPathIds.length) {
            service.fetchStudentPerformance(
              'proficiency',
              classId,
              userId,
              proficiencyAssessmentPathIds,
              CONTENT_TYPES.ASSESSMENT,
              suggestions,
              'id'
            );
          }
          let courseMapCollections = courseMapContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.COLLECTION
          );
          let courseMapAssessments = courseMapContents.filterBy(
            'suggestedContentType',
            CONTENT_TYPES.ASSESSMENT
          );
          if (params.suggestionOrigin === 'system') {
            courseMapCollections = courseMapCollections.filterBy(
              'accepted',
              true
            );
            courseMapAssessments = courseMapAssessments.filterBy(
              'accepted',
              true
            );
          }
          const courseMapCollectionPathIds = courseMapCollections
            .filter(courseMapContent => courseMapContent.get('pathId') > 0)
            .map(courseMapContent => {
              return courseMapContent.get('pathId');
            });
          const courseMapAssessmentPathIds = courseMapAssessments
            .filter(courseMapContent => courseMapContent.get('pathId') > 0)
            .map(courseMapContent => {
              return courseMapContent.get('pathId');
            });
          if (courseMapCollectionPathIds.length) {
            service.fetchStudentPerformance(
              'coursemap',
              classId,
              userId,
              courseMapCollectionPathIds,
              CONTENT_TYPES.COLLECTION,
              suggestions,
              'pathId'
            );
          }
          if (courseMapAssessmentPathIds.length) {
            service.fetchStudentPerformance(
              'coursemap',
              classId,
              userId,
              courseMapAssessmentPathIds,
              CONTENT_TYPES.ASSESSMENT,
              suggestions,
              'pathId'
            );
          }
          resolve(suggestions);
        }, reject);
    });
  }
});
