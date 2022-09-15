import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    collectionId: {},
    isCollection: {},
    isPreviewReferrer: {},
    editingContent: {
      refreshModel: true
    },
    editing: {
      refreshModel: true
    },
    isLibraryContent: false,
    primaryLanguage: {
      refreshModel: true
    }
  },
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/question
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('collectionId', undefined);
      controller.set('isCollection', undefined);
      controller.set('isPreviewReferrer', undefined);
    }
    this.get('controller').set('isEditing', 'false');
  },

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    const questionId = params.questionId;
    const collectionId = params.collectionId;
    const isCollection = params.isCollection === 'true';
    const isPreviewReferrer = params.isPreviewReferrer === 'false';
    const isEditing = params.editing;
    const isLibraryContent = params.isLibraryContent;
    const editingContent = params.editingContent;

    var question = null;
    var collection = null;

    if (questionId) {
      question = route.get('questionService').readQuestion(questionId);
    }

    if (collectionId) {
      if (isCollection) {
        collection = route
          .get('collectionService')
          .readCollection(collectionId);
      } else {
        collection = route
          .get('assessmentService')
          .readAssessment(collectionId);
      }
    }

    let difficultyLevel = route.get('questionService').getDifficultyLevel();

    return Ember.RSVP.hash({
      question: question,
      collection: collection,
      isCollection: isCollection,
      isPreviewReferrer: isPreviewReferrer,
      isEditing: isEditing === 'true',
      isLibraryContent,
      editingContent,
      difficultyLevel: difficultyLevel,
      primaryLanguage: params.primaryLanguage
    });
  },

  setupController(controller, model) {
    controller.set('question', model.question);
    controller.set('collection', model.collection);
    controller.set('isCollection', model.isCollection);
    controller.set('isPreviewReferrer', model.isPreviewReferrer);
    controller.set('isEditing', model.isEditing);
    controller.set('isLibraryContent', model.isLibraryContent);
    controller.set('editingContent', model.editingContent);
    controller.set('difficultyLevel', model.difficultyLevel);
    controller.set('primaryLanguage', model.primaryLanguage);
  }
});
