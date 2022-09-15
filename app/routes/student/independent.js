import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { ROLES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    refresh: {
      refreshModel: true
    }
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @type {LearnerService} Service to retrieve learner information
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Triggered when a class menu item is selected
     * @param {string} item
     */
    selectMenuItem: function(item) {
      const route = this;
      const controller = route.get('controller');
      const currentItem = controller.get('menuItem');

      if (item !== currentItem) {
        controller.selectMenuItem(item);
        var queryParams = {
          queryParams: {
            filterBy: 'assessment'
          }
        };

        if (item === 'performance') {
          route.transitionTo('student.independent.performance', queryParams);
        } else if (item === 'course-map') {
          route.transitionTo('student.independent.course-map');
        } else if (item === 'study-player') {
          let userLocation = controller.get('userlocation');
          let courseId, unitId, lessonId, collectionId;
          courseId = controller.get('course').id;

          let suggestionPromise = null;
          if (userLocation) {
            unitId = userLocation.get('unitId');
            lessonId = userLocation.get('lessonId');
            collectionId = userLocation.get('collectionId');
            suggestionPromise = Ember.RSVP.resolve(Ember.Object.create({}));
          } else {
            suggestionPromise = route
              .get('navigateMapService')
              .continueCourse(courseId);
          }

          let queryParams = {
            classId: null,
            unitId,
            lessonId,
            collectionId,
            role: ROLES.STUDENT,
            source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY,
            type: 'collection'
          };

          suggestionPromise.then(() =>
            route.transitionTo('study-player', courseId, { queryParams })
          );
        } else if (item === 'close') {
          route.transitionTo('student-independent-learning.learning-base');
        }
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get model for the controller
   */
  model: function(params) {
    const route = this;
    const courseId = params.courseId;
    const userId = this.get('session.userId');
    let coursePromise = route.get('courseService').fetchById(courseId);
    let performancePromise = route
      .get('learnerService')
      .fetchCoursesPerformance(userId, [courseId]);

    return Ember.RSVP.hash({
      course: coursePromise,
      performance: performancePromise
    }).then(function(hash) {
      const course = hash.course;
      const performance = hash.performance;
      let userLocation = route
        .get('learnerService')
        .fetchLocationCourse(course.get('id'), userId);
      return Ember.RSVP.hash({
        course,
        performance,
        userLocation
      });
    });
  },
  /**
   * Run after model is set
   */
  afterModel: function(user, transition) {
    if (transition.targetName === `${this.routeName}.index`) {
      this.transitionTo('student.independent.course-map');
    }
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('performance', model.performance[0]);
    controller.set('course', model.course);
    controller.set('units', model.course.get('children') || []);
    controller.set('userlocation', model.userLocation);
  }
});
