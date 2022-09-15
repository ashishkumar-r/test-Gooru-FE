import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import Activity from 'gooru-web/models/content/activity';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  queryParams: {
    editing: {},
    editingContent: {
      refreshModel: true
    },
    isIndependentOA: {
      refreshModel: true
    },
    isLibraryContent: false,
    isPreviewReferrer: false
  },
  //ToDo: Store implementation
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:/offline-activity//offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),
  /**
   * @requires service:session/session
   */
  session: Ember.inject.service('session'),
  /**
   * @requires service:course/course
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:century-skill/century-skill
   */
  centurySkillService: Ember.inject.service('century-skill'),

  // -------------------------------------------------------------------------
  // Props
  /**
   * holds the activity
   */
  activityCollection: null,

  /**
   * The in memory edit copy of activity
   */
  tempCollection: null,

  // -------------------------------------------------------------------------
  // Events

  model: function(params) {
    //In new Mode : This wont be called as model itself is passed which contains unit, course, and lesson
    //In edit mode: activityId value is passed as parameter
    //lessonId 'new' refers to an independent OA
    if (params.lessonId && params.lessonId !== 'new') {
      params.activityId = params.lessonId;
      const route = this;
      route.setTitle('Library Search', null);
      return route
        .get('activityService')
        .readActivity(params.activityId)
        .then(function(activity) {
          const courseId = activity.get('courseId');
          const isEditing = params.editing;
          const editingContent = params.editingContent
            ? params.editingContent
            : null;
          var course = null;
          const isLibraryContent = params.isLibraryContent;
          if (courseId) {
            course = route.get('courseService').fetchById(courseId);
          }

          return Ember.RSVP.hash({
            activity: activity,
            course: course,
            isEditing: !!isEditing,
            editingContent: editingContent,
            isLibraryContent
          });
        });
    } else {
      return {
        isIndependentOA: params.isIndependentOA
      };
    }
  },

  setupController(controller, model) {
    const route = this;
    let activityCollection;
    if (!model.activity) {
      //Changes for new flow
      controller.set('isNewActivity', true);

      activityCollection = Activity.create(
        Ember.getOwner(this).ownerInjection(),
        {
          title: null
        }
      );
      activityCollection.formatList = [
        Ember.Object.create({
          code: 'oa.project.poster',
          display_name: 'dummy'
        })
      ];
      controller.set('tempCollection', activityCollection.copy());
    } else {
      controller.set('isNewActivity', false);

      activityCollection = model.activity;
      controller.set('tempCollection', model.activity.copy());
    }
    if (!model.course && this.modelFor('content.courses.edit')) {
      model.course =
        this.modelFor('content.courses.edit') &&
        this.modelFor('content.courses.edit').course;
    }
    controller.set('activityCollection', activityCollection);
    controller.set('course', model.course);
    controller.set('isEditing', model.isEditing);
    controller.set('editingContent', model.editingContent);
    controller.set('isAssessment', true);

    this.set('isEditing', model.isEditing);
    controller.set('isEditing', model.isEditing);
    controller.set('tempCollection', activityCollection.copy());
    if (model.isIndependentOA || model.isLibraryContent) {
      controller.set('allowBackToCourse', false);
    }
    route
      .get('centurySkillService')
      .findCenturySkills()
      .then(function(centurySkillsArray) {
        controller.set('centurySkills', centurySkillsArray.toArray());
      });

    route
      .get('activityService')
      .getSubTypes()
      .then(function(formatList) {
        activityCollection.set('formatList', formatList);
        controller.set('formatList', formatList);
      });

    controller.set('model', model);
  }
});
