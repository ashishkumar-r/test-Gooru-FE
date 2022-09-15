import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  queryParams: {
    studentId: {
      refreshModel: true
    },
    tab: {
      refreshModel: true
    }
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
    const studentId = params.studentId;
    const secondaryClassId =
      route.modelFor('teacher.class').class.get('secondaryClassId') || null;
    const currentClass = secondaryClassId
      ? route.modelFor('teacher.class.students-proficiency').class
      : route.modelFor('teacher.class').class;
    route.setTitle('Learner Proficiency', currentClass.title);
    const course = secondaryClassId
      ? route.modelFor('teacher.class.students-proficiency').course
      : route.modelFor('teacher.class').course;
    return Ember.RSVP.hash({
      profilePromise: route.get('profileService').readUserProfile(studentId),
      taxonomyCategories: route.get('taxonomyService').getCategories(),
      userPreference: route.get('profileService').getProfilePreference()
    }).then(function(hash) {
      const studentProfile = hash.profilePromise;
      const taxonomyCategories = hash.taxonomyCategories;
      const userPreference = hash.userPreference;
      return Ember.Object.create({
        profile: studentProfile,
        categories: taxonomyCategories,
        userPreference: userPreference,
        class: currentClass,
        course: course
      });
    });
  },

  setupController(controller, model) {
    controller.get('classController').selectMenuItem('students');
    controller.set('studentProfile', model.get('profile'));
    controller.set('class', model.get('class'));
    controller.set('course', model.get('course'));
    controller.set('taxonomyCategories', model.get('categories'));
    controller.set(
      'userStandardPreference',
      model.get('userPreference.standard_preference')
    );
    controller.loadData();
  },
  resetController(controller) {
    controller.set('showGutCompetency', false);
    controller.set('showDomainInfo', false);
    controller.set('showCompetencyInfo', false);
    controller.set('tab', null);
    controller.set('proficiencyChartData', Ember.A([]));
    controller.set('skylinePoints', Ember.A([]));
    controller.set('selectedDomain', null);
    controller.set('selectedTopic', null);
    controller.set('selectedCompetency', null);
  }
});
