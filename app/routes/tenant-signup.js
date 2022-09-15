import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { COUNTRY_CODES } from 'gooru-web/config/config';

export default Ember.Route.extend(ConfigurationMixin, {
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
   * @requires service:authentication
   */
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  /**
   * @property {Service} tenant
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Verfiy the domain have any directions before model get execute.
   */
  beforeModel: function(transition) {
    let nonce = transition.queryParams.nonce;
    if (!this.get('session.isAnonymous')) {
      this.transitionTo('index');
    } else {
      let route = this;
      return route
        .get('session')
        .authenticateAsAnonymous(nonce)
        .then(() => {
          return {}; // Note removed tenant setting json API
        });
    }
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
          states: usStates,
          tenantSettings: route.get('tenantService').getActiveTenantSetting()
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
    this.handleRedirectionBasedOnDomain(controller);
    controller.set(
      'askConsentFromUser',
      this.setAskConsentFromUser(model.tenantSettings)
    );
  },

  /**
   * Verfiy the domain have any directions before model get execute.
   */
  handleRedirectionBasedOnDomain: function(controller) {
    const endpoint = this.get('redirectEndpoint') || window.location.href;
    const domainURL = new URL(endpoint);
    let domain = domainURL.hostname;
    this.get('authenticationService')
      .domainBasedRedirection(domain)
      .then(function(data) {
        if (data && data.statusCode === 303) {
          window.location.href = data.redirectUrl;
        } else {
          controller.set('isRedirectionDomainDone', true);
        }
      });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when submitting the sign up form
     * @see application.hbs
     * @see gru-header.hbs
     */
    signUp: function() {
      this.transitionTo('sign-up-register');
    },

    /**
     * Action triggered when close sign up form from childLayout
     */
    closeSignUp: function() {
      this.transitionTo('index');
    },

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
  },

  /**
   * Decide  to show the consent based on the tenant settings
   */
  setAskConsentFromUser(tenantSettings) {
    return tenantSettings && tenantSettings.ask_consent_from_user === 'on';
  }
});
