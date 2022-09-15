import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:api-sdk/competency
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   *  @type {tenantService} Service to retrieve tenant information
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  queryParams: {
    landingPage: null,
    activeMinProfReport: null,
    selectedUserId: null
  },
  // ---------------------------------------------------------------
  // Method

  /**
   * Get model for the controller
   */
  model: function() {
    const route = this;
    const currentClass = route.modelFor('teacher.class').class;
    route.setTitle('Learner Locator', currentClass.title);
    const tenantPromise = route.get('tenantService').getActiveTenantSetting();
    const userPreference = route.get('profileService').getProfilePreference();
    return Ember.RSVP.hash({
      tenantSettings: tenantPromise,
      userPreference: userPreference
    }).then(function(hash) {
      return {
        tenantSettings: hash.tenantSettings,
        userPreference: hash.userPreference
      };
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.get('classController').selectMenuItem('students');
    controller.set('classController.isShowExpandedNav', true);
    controller.set('tenantSettings', model.tenantSettings);
    controller.set('userPreference', model.userPreference);
    controller.changeLanguage();
    controller.loadStudentsProficiencyData();
    controller.init();
  },

  resetController(controller) {
    controller.resetProperties();
  }
});
