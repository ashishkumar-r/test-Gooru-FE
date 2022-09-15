import Ember from 'ember';
import LearningJourneyMixin from 'gooru-web/mixins/learning-journey-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(LearningJourneyMixin, UIHelperMixin, {
  // ---------------------------------------------------------
  // Dependencies
  session: Ember.inject.service(),

  /**
   * @requires service:api-sdk/dashboard
   */
  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------
  // Hooks
  model() {
    const route = this;
    const classData = route.modelFor('student.class').class;
    route.setTitle('Dashboard', classData.title);
    const courseId = classData.get('courseId');
    const fwCode = classData.get('preference.framework') || 'GUT';
    const userId = route.get('session.userId');
    const course = route.modelFor('student.class').course;
    let units = route.modelFor('student.class').units;
    const unit0Content = route.modelFor('student.class').unit0Content;
    units = Ember.A([...unit0Content, ...units]);
    let setting = classData.get('setting');
    let isPremiumCourse = setting
      ? setting['course.premium'] && setting['course.premium'] === true
      : false;
    const isMilestoneViewEnabledForTenant = route.isMilestoneViewEnabled(
      classData.preference,
      classData.setting
    );
    const locationQueryParam = {
      courseId
    };
    let destination = null;
    if (isPremiumCourse && isMilestoneViewEnabledForTenant) {
      locationQueryParam.fwCode = fwCode;
      let skylineInitialState = route.modelFor('student.class')
        .skylineInitialState;
      destination = skylineInitialState.get('destination');
    }
    const userLocationPromise = route
      .get('analyticsService')
      .getUserCurrentLocation(classData.get('id'), userId, locationQueryParam);
    return Ember.RSVP.hash({
      userLocation: userLocationPromise,
      classData,
      course,
      units,
      destination,
      userProfileData: route.get('profileService').readUserProfile(userId)
    });
  },
  // ------------------------------------------------------------
  // Setup

  setupController(controller, model) {
    controller.set('currentClass', model.classData);
    controller.set('userLocation', model.userLocation);
    controller.set('course', model.course);
    controller.set('units', model.units);
    controller.set('destination', model.destination);
    controller.set('userProfileData', model.userProfileData);
  },
  resetController(controller) {
    controller.set('isShowStudentProgressReport', false);
  }
});
