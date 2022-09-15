import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    editing: {
      refreshModel: true
    },
    editingContent: {
      refreshModel: true
    },
    editingSubContent: {
      refreshModel: true
    },
    isLibraryContent: false,
    isPreviewReferrer: false,
    hasCollaborator: false
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Session} current session
   */
  session: Ember.inject.service('session'),

  collectionService: Ember.inject.service('api-sdk/collection'),

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
      .get('collectionService')
      .readCollection(params.collectionId)
      .then(function(collection) {
        const courseId = collection.get('courseId');
        const isEditing = params.editing;
        const isLibraryContent = params.isLibraryContent;
        var editingContent =
          params.editingContent && params.editingContent !== 'null'
            ? params.editingContent
            : undefined;
        var editingSubContent =
          params.editingSubContent && params.editingSubContent !== 'null'
            ? params.editingSubContent
            : undefined;
        var course = null;

        params.editingContent = editingContent;

        params.editingSubContent = editingSubContent;

        if (courseId) {
          course = route.get('courseService').fetchById(courseId);
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
          editingSubContent: params.editingSubContent,
          isLibraryContent: isLibraryContent,
          isPreviewReferrer: params.isPreviewReferrer
        });
      });
  },

  setupController(controller, model) {
    const route = this;
    model.collection.set('children', model.resources);
    controller.set('collection', model.collection);
    controller.set('course', model.course);
    controller.set('isEditing', model.isEditing);
    controller.set('editingContent', model.editingContent);
    controller.set('isLibraryContent', model.isLibraryContent);
    controller.set('isPreviewReferrer', model.isPreviewReferrer);
    controller.set('editingSubContent', model.editingSubContent);
    route
      .get('centurySkillService')
      .findCenturySkills()
      .then(function(centurySkillsArray) {
        controller.set('centurySkills', centurySkillsArray.toArray());
      });
    controller.set('tempCollection', model.collection.copy());
  },

  resetController(controller) {
    controller.set('isPreviewReferrer', undefined);
    this.get('controller').set('isEditing', 'false');
  }
});
