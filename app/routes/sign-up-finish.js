import Ember from 'ember';
import { COUNTRY_CODES } from 'gooru-web/config/config';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Ember.Service} Service to do retrieve countries
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @property {TenantService}
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Methods

  beforeModel: function() {
    if (this.get('session.isAnonymous')) {
      this.transitionTo('index');
    }
    this.knowMore();
  },

  model: function() {
    const route = this;
    return route
      .get('lookupService')
      .readCountries()
      .then(function(countries) {
        var usCountry = countries.findBy('code', COUNTRY_CODES.US);
        var usStates = route.get('lookupService').readStates(usCountry.id);
        return Ember.RSVP.hash({
          countries: countries,
          states: usStates
        });
      });
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('countries', model.countries);
    controller.set('states', model.states);
    controller.resetProperties();
  },

  knowMore() {
    const route = this;
    const userId = route.get('session.userId');

    route
      .get('profileService')
      .readUserProfile(userId)
      .then(function(updatedProfile) {
        if (updatedProfile.info) {
          route.set('userInfo', updatedProfile.info);
        }
      });

    route
      .get('tenantService')
      .getActiveTenantSetting()
      .then(tenantSetting => {
        const tenantKnowMore =
          tenantSetting &&
          tenantSetting.know_more_about_user_questions &&
          tenantSetting.know_more_about_user_questions.length;
        route.set('tenantKnowMore', tenantKnowMore);
      });

    if (route.get('userInfo') && route.get('tenantKnowMore')) {
      route.transitionTo('index');
    }
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when submitting the sign up finish form
     */
    signUpFinish: function(role) {
      if (role === 'teacher') {
        this.transitionTo('content.classes.create');
      } else if (role === 'student') {
        this.transitionTo('student-home');
      } else {
        this.transitionTo('index');
      }
    }
  }
});
