import Ember from 'ember';
import { COUNTRY_CODES } from 'gooru-web/config/config';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Service to do retrieve countries
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  isGuestAccount: Ember.computed.alias('session.isGuest'),

  //
  // Actions
  actions: {
    willTransition(transition) {
      let route = this;
      let model = route.controller.get('profile');
      if (model.get('hasDirtyAttributes')) {
        let confirmation = confirm(
          route.get('i18n').t('validations.unsavedChanges').string
        );
        if (confirmation) {
          model.rollbackAttributes();
        } else {
          transition.abort();
        }
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods
  beforeModel: function(transition) {
    const userId = transition.params.profile.userId;
    const myId = this.get('session.userId');
    if (userId !== myId || this.get('isGuestAccount')) {
      transition.abort();
      this.transitionTo('profile.about', userId);
    }
  },

  model: function() {
    const route = this;
    const profile = this.modelFor('profile').profile;
    var profileStateId = profile.stateId;

    return route
      .get('lookupService')
      .readCountries()
      .then(function(countries) {
        var usCountryId = countries.findBy('code', COUNTRY_CODES.US).id;
        var usStates = route.get('lookupService').readStates(usCountryId);
        var usDistricts = null;

        if (profileStateId && profileStateId !== '') {
          usDistricts = route
            .get('lookupService')
            .readDistricts(profileStateId);
        }

        return Ember.RSVP.hash({
          countries: countries,
          states: usStates,
          districts: usDistricts,
          profile: profile
        });
      });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    var profile = model.profile;

    if (profile.get('schoolDistrictId')) {
      profile.set('schoolDistrict', null);
    }
    controller.set('existingUsername', false);
    controller.set('profile', profile);
    controller.set('tempProfile', profile.copy());
    controller.set('countries', model.countries);
    controller.set('states', model.states);
    controller.set('districts', model.districts);
  }
});
