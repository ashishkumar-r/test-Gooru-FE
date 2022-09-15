import Ember from 'ember';
import BuilderItem from 'gooru-web/models/content/builder/item';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    editing: {
      refreshModel: true
    },
    classId: {},
    userId: {},
    isLibraryContent: false
  },

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    var course = this.get('courseService').fetchById(params.courseId);
    var isEditing = params.editing;
    const isLibraryContent = params.isLibraryContent;

    return Ember.RSVP.hash({
      course: course,
      isEditing: isEditing === 'true',
      userId: params.userId,
      classId: params.classId,
      isLibraryContent
    });
  },

  setupController(controller, model) {
    var course = model.course;
    const unitId = controller.get('unitId');
    course.children = course.children.map(function(unit) {
      // Wrap every unit inside of a builder item
      return BuilderItem.create({
        data: unit,
        isExpanded: unitId === unit.get('id')
      });
    });

    controller.set('course', course);
    controller.set('userId', model.userId);
    controller.set('classId', model.classId);
    controller.set('isEditing', model.isEditing);
    controller.set('isLibraryContent', model.isLibraryContent);
    //Create a tempCourse copy at once the route load
    controller.set('tempCourse', course.copy());
  },

  deactivate: function() {
    this.get('controller').resetValues();
    this.get('controller').set('isEditing', 'false');
  }
});
