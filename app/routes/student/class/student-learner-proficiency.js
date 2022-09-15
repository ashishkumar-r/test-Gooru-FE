import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  queryParams: {
    userId: {
      refreshModel: true
    },
    classId: {
      refreshModel: true
    },
    courseId: {
      refreshModel: true
    },
    role: {
      refreshModel: true
    },
    isDashboard: null
  },
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * Competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  model: function(params) {
    let route = this;
    route._super(...arguments);
    let studentId = params.userId;
    const classId = params.classId;
    const courseId = params.courseId;
    if (classId) {
      const currentClass = route.modelFor('student.class').class;
      route.setTitle('Learner Proficiency', currentClass.title);
      const isTeacher = params.role === 'teacher';
      return Ember.RSVP.hash({
        profilePromise: route.get('profileService').readUserProfile(studentId),
        classPromise: route.get('classService').readClassInfo(classId),
        coursePromise:
          courseId && courseId !== 'null'
            ? route.get('courseService').fetchById(courseId)
            : null,
        taxonomyCategories: route.get('taxonomyService').getCategories(),
        userPreference: route.get('profileService').getProfilePreference()
      }).then(function(hash) {
        const studentProfile = hash.profilePromise;
        const taxonomyCategories = hash.taxonomyCategories;
        const aClass = hash.classPromise;
        const course = hash.coursePromise;
        const userPreference = hash.userPreference;
        return Ember.Object.create({
          profile: studentProfile,
          categories: taxonomyCategories,
          class: aClass,
          course: course,
          userPreference: userPreference,
          isTeacher: isTeacher,
          isDashboard: params.isDashboard
        });
      });
    }
  },

  setupController(controller, model) {
    if (model) {
      controller.set('studentProfile', model.get('profile'));
      controller.set('class', model.get('class'));
      controller.set('isTeacher', model.get('isTeacher'));
      controller.set('course', model.get('course'));
      controller.set('taxonomyCategories', model.get('categories'));
      controller.set(
        'userStandardPreference',
        model.get('userPreference.standard_preference')
      );
      controller.set('isDashboard', model.isDashboard);
      controller.get('studentClassController').selectMenuItem('profile-prof');
      controller.changeLanguage();
      controller.loadData();
    }
  },

  resetController(controller) {
    controller.set('class', null);
    controller.set('showDomainInfo', false);
    controller.set('showCompetencyInfo', false);
    controller.set('selectedCompetency', null);
    controller.set('showGutCompetency', false);
    controller.set('isDashboard', null);
  }
});
