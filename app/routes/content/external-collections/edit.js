import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import LearningUpgradeMixin from 'gooru-web/mixins/learning-upgrade-mixin';

export default Ember.Route.extend(PrivateRouteMixin, LearningUpgradeMixin, {
  queryParams: {
    editing: {
      refreshModel: true
    },
    editingContent: {
      refreshModel: true
    },
    isLibraryContent: false,
    isPreviewReferrer: false
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Session} current session
   */
  session: Ember.inject.service('session'),

  externalCollectionService: Ember.inject.service(
    'api-sdk/external-collection'
  ),

  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:api-sdk/question
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @requires service:century-skill/century-skill
   */
  centurySkillService: Ember.inject.service('century-skill'),

  isPreviewReferrer: false,

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    this.set('isPreviewReferrer', params.isPreviewReferrer);

    return route
      .get('externalCollectionService')
      .readExternalCollection(params.collectionId)
      .then(function(collection) {
        const courseId = collection.get('courseId');
        const learningToolId = collection.get('learningToolId');
        const isEditing = params.editing;
        const isLibraryContent = params.isLibraryContent;
        var editingContent =
          params.editingContent && params.editingContent !== 'null'
            ? params.editingContent
            : undefined;
        var course = null;
        let toolDetails = null;

        const isLUContent = !!learningToolId;

        params.editingContent = editingContent;

        if (courseId) {
          course = route.get('courseService').fetchById(courseId);
        }

        if (learningToolId) {
          toolDetails = route
            .get('learningToolService')
            .getLearningToolInformation(learningToolId);
        }

        let resourcePromiseList = collection
          .get('children')
          .map(resource =>
            resource.get('format') === 'question'
              ? route.get('questionService').readQuestion(resource.get('id'))
              : resource
          );

        return Ember.RSVP.hash({
          resources: Ember.RSVP.all(resourcePromiseList),
          collection: collection,
          course: course,
          isEditing: isEditing === 'true',
          editingContent: params.editingContent,
          isLibraryContent: isLibraryContent,
          isPreviewReferrer: params.isPreviewReferrer,
          isLUContent: isLUContent,
          toolDetails: toolDetails
        });
      });
  },

  setupController(controller, model) {
    const route = this;
    const isLUContent = model.isLUContent;
    const toolDetails = model.toolDetails;
    model.collection.set('children', model.resources);
    controller.set('collection', model.collection);
    controller.set('course', model.course);
    controller.set('isEditing', model.isEditing);
    controller.set('editingContent', model.editingContent);
    controller.set('isLibraryContent', model.isLibraryContent);
    controller.set('isPreviewReferrer', model.isPreviewReferrer);
    controller.set('isLUContent', isLUContent);
    controller.set('toolDetails', toolDetails);
    route
      .get('centurySkillService')
      .findCenturySkills()
      .then(function(centurySkillsArray) {
        controller.set('centurySkills', centurySkillsArray.toArray());
      });
    controller.set('tempCollection', model.collection.copy());
    if (isLUContent) {
      route.GenerateLUContentURL(model.collection, toolDetails);
    }
  },

  resetController(controller) {
    controller.set('isPreviewReferrer', undefined);
    this.get('controller').set('isEditing', 'false');
  }
});
