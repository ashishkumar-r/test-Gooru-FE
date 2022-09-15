import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';

/**
 * Student independent learning route
 *
 * @module
 * @augments Ember.Route
 */
export default Ember.Route.extend(
  PrivateRouteMixin,
  ConfigurationMixin,
  visibilitySettings,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {FeaturedCourseService} Service to retrieve Featured Courses Service information
     */
    featuredCourseService: Ember.inject.service('api-sdk/featured-courses'),

    // -------------------------------------------------------------------------
    // Actions

    // -------------------------------------------------------------------------
    // Methods

    beforeModel(transition) {
      const route = this;
      if (!route.get('session.isAnonymous')) {
        const queryParams = transition.queryParams;
        if (queryParams && queryParams.courseId) {
          const independentCoursesPromise = route
            .get('featuredCourseService')
            .getIndependentCourseList({ filterOutJoinedCourses: false });
          return independentCoursesPromise.then(function(independentCourses) {
            let currentCourse = independentCourses.findBy(
              'id',
              queryParams.courseId
            );
            route.set('course', currentCourse);
            let gradeCurrent = currentCourse.get('settings.gradeCurrent');
            return route
              .get('featuredCourseService')
              .joinPublicClassbyGrade(
                currentCourse.get('id'),
                gradeCurrent,
                false
              )
              .then(joinClass => {
                if (joinClass.get('classId')) {
                  route
                    .get('router')
                    .transitionTo(
                      'student.class.proficiency',
                      joinClass.get('classId'),
                      {
                        queryParams: {
                          defaultGradeLevel: currentCourse.get(
                            'defaultGradeLevel'
                          )
                        }
                      }
                    );
                }
              });
          });
        }
      }
    },

    model: function(params) {
      const route = this;
      return Ember.RSVP.hash({
        tenantSetting: route.getTenantSetting()
      }).then(function(hash) {
        return Ember.RSVP.hash({
          courseId: params.courseId,
          tenantSetting: hash.tenantSetting
        });
      });
    },

    setupController: function(controller, model) {
      controller.set('course', this.get('course'));
      controller.set('subject', this.get('course.subject'));
      controller.set('tenantSetting', model.tenantSetting);
      controller.initial();
    }
  }
);
