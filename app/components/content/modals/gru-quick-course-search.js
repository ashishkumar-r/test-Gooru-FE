import Ember from 'ember';
import { sortCoursesBySubject } from 'gooru-web/utils/sort-featured-courses';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  classService: Ember.inject.service('api-sdk/class'),

  courseService: Ember.inject.service('api-sdk/course'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-quick-course-search'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    selectCourse: function(id) {
      this.set('selectedCourse', id);
      $('.gru-quick-course-search .selected').removeClass('selected');
      $(`.${id}`).addClass('selected');
    },
    assignCourse: function() {
      const component = this;
      const courseId = component.get('selectedCourse');
      const classId = component.get('model.classId');
      var courseIdPromise = Ember.RSVP.resolve(courseId);
      if (component.get('model').get('areFeatured')) {
        courseIdPromise = component.get('courseService').copyCourse(courseId);
      }
      courseIdPromise
        .then(function(courseIdToAssign) {
          return component
            .get('classService')
            .associateCourseToClass(courseIdToAssign, classId);
        })
        .then(
          function() {
            component.triggerAction({ action: 'closeModal' });
            component
              .get('router')
              .transitionTo('teacher.class.course-map', classId, {
                queryParams: { refresh: true }
              });
          },
          function() {
            const message = component
              .get('i18n')
              .t('common.errors.course-not-associated').string;
            component.get('notifications').error(message);
          }
        );
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @type {?String} specific class
   */
  'component-class': null,
  /**
   * @type {?String} specific class
   */
  areFeatured: Ember.computed.bool('model.areFeatured'),

  /**
   * @type {String} selected Course's ID
   */
  selectedCourse: null,
  /**
    * @type {String} selected Course's ID
    */
  hasSelectedCourse: Ember.computed.notEmpty('selectedCourse'),

  orderedCourses: Ember.computed('model.courses', function() {
    return sortCoursesBySubject(this.get('model.courses'));
  })
});
