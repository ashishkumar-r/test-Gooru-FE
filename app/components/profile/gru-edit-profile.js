import Ember from 'ember';
import { COUNTRY_CODES, DEFAULT_IMAGES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(ConfigurationMixin, TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-edit-profile'],
  // -------------------------------------------------------------------------
  // Dependencies

  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Ember.Service} Service to do retrieve states, districts
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Ember.Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @property {Ember.Service} Media service
   */
  mediaService: Ember.inject.service('api-sdk/media'),

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    cancel: function() {
      this.get('router').transitionTo('profile.about', this.get('profile.id'));
    },

    updateProfile: function() {
      const component = this;
      let profile = this.get('profile');
      let editedProfile = this.get('tempProfile');
      let userName = editedProfile.get('username');
      var role = component.get('tempProfile.role');
      var countrySelected = component.get('countrySelected');
      var stateSelected = component.get('stateSelected');
      var districtSelected = component.get('districtSelected');
      var otherSchoolDistrict = $.trim(component.get('otherSchoolDistrict'));
      var districts = component.get('districts');
      var showStates = component.get('showStates');
      var showRoleErrorMessage = false;
      var showCountryErrorMessage = false;
      var showStateErrorMessage = false;
      var showDistrictErrorMessage = false;
      let usernameError = false;
      var isValid = true;

      component.set('otherSchoolDistrict', otherSchoolDistrict);
      if (!userName && !profile.get('username')) {
        usernameError = component.get('i18n').t('common.errors.add-username')
          .string;
        isValid = false;
      }
      if (!role) {
        showRoleErrorMessage = true;
        isValid = false;
      }
      if (!countrySelected) {
        showCountryErrorMessage = true;
        isValid = false;
      }

      if (!stateSelected && showStates) {
        showStateErrorMessage = true;
        isValid = false;
      }

      if (
        !otherSchoolDistrict &&
        otherSchoolDistrict === '' &&
        stateSelected &&
        !districtSelected &&
        districts &&
        districts.length > 0
      ) {
        showDistrictErrorMessage = true;
        isValid = false;
      }

      component.set('showRoleErrorMessage', showRoleErrorMessage);
      component.set('showCountryErrorMessage', showCountryErrorMessage);
      component.set('showStateErrorMessage', showStateErrorMessage);
      component.set('showDistrictErrorMessage', showDistrictErrorMessage);
      component.set('usernameError', usernameError);
      if (isValid) {
        editedProfile.validate().then(function({ validations }) {
          if (validations.get('isValid')) {
            let imageIdPromise = new Ember.RSVP.resolve(
              editedProfile.get('avatarUrl')
            );
            if (
              editedProfile.get('avatarUrl') &&
              editedProfile.get('avatarUrl') !== profile.get('avatarUrl')
            ) {
              imageIdPromise = component
                .get('mediaService')
                .uploadUserFile(editedProfile.get('avatarUrl'));
            }
            imageIdPromise
              .then(function(imageId) {
                editedProfile.set('avatarUrl', imageId);
                if (otherSchoolDistrict) {
                  editedProfile.set('schoolDistrictId', '');
                  editedProfile.set('schoolDistrict', otherSchoolDistrict);
                }
                if (!showStates) {
                  editedProfile.set('state', null);
                }
                component
                  .get('parseEventService')
                  .postParseEvent(PARSE_EVENTS.SAVE_ABOUT);
                return component.saveProfile(editedProfile);
              })
              .then(
                function() {
                  component
                    .get('profile')
                    .merge(editedProfile, [
                      'username',
                      'firstName',
                      'lastName',
                      'aboutMe',
                      'role',
                      'countryId',
                      'stateId',
                      'state',
                      'schoolDistrictId',
                      'schoolDistrict',
                      'country',
                      'studentId',
                      'avatarUrl'
                    ]);
                  component
                    .get('router')
                    .transitionTo('profile.about', editedProfile.get('id'), {
                      queryParams: {
                        isUpdated: true
                      }
                    });
                },
                function(error) {
                  if (error.username) {
                    component.set(
                      'usernameError',
                      error ? error.username : false
                    );
                  } else {
                    var message = component
                      .get('i18n')
                      .t('common.errors.profile-not-updated').string;
                    component.get('notifications').error(message);
                    Ember.Logger.error(error);
                  }
                }
              );
          }
        });
      } else if (showCountryErrorMessage) {
        $('html, body').animate(
          {
            scrollTop: $('.gru-edit-profile .country .error-messages').offset()
              .top
          },
          1000
        );
      } else {
        $('html, body').animate(
          {
            scrollTop: $('.gru-edit-profile .role .error-messages').offset().top
          },
          1000
        );
      }
    },

    countrySelect: function(id) {
      var component = this;
      var countries = this.get('countries');
      var country = countries.findBy('id', id);
      var countryCode = country.code;
      var countryName = country.name;

      component.set('showCountryErrorMessage', false);
      component.set('countrySelected', id);
      component.set('country', countryName);

      if (countryCode === COUNTRY_CODES.US) {
        component.set('showStates', true);
      } else {
        component.set('showStates', false);
        component.set('districts', null);
        component.set('stateSelected', '');
        component.set('state', '');
        component.set('districtSelected', '');
        component.set('otherSchoolDistrict', '');
      }
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.PROFILE_ABOVE_SELECT_COUNTRY);
    },

    stateSelect: function(id) {
      var component = this;
      var states = component.get('states');
      component.set('showStateErrorMessage', false);
      component.set('showDistrictErrorMessage', false);
      component.set('districts', null);
      component.set('stateSelected', id);
      component.set('state', states.findBy('id', id).name);
      component
        .get('lookupService')
        .readDistricts(id)
        .then(districts => component.set('districts', districts));
    },

    districtSelect: function(id) {
      var component = this;

      component.set('showDistrictErrorMessage', false);
      component.set('districtSelected', id);
      component.set('otherSchoolDistrict', '');
    }
  },

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    this._super(...arguments);
    this.set('tempProfile', this.get('profile').copy());
    if (this.get('tempProfile.avatarUrl') === DEFAULT_IMAGES.USER_PROFILE) {
      this.get('tempProfile').set('avatarUrl', null);
    }
  },

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    const component = this;
    var $username = component.$('#username input');
    $username.on('keydown', function() {
      component.set('usernameError', false);
    });
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * A link to the parent profile property
   * @see controllers/profile.js
   * @property {Class}
   */
  profile: null,

  /**
   * Indicates if the user is seeing his own profile
   * @property {isMyProfile}
   * @see {Class} profile
   * @returns {bool}
   */
  isMyProfile: Ember.computed('profile.id', 'session.userId', function() {
    return this.get('profile.id') === this.get('session.userId');
  }),

  /**
   * Copy of the profile model used for editing.
   * @property {Profile}
   */
  tempProfile: null,

  /**
   * List of countries
   * @property {Countries[]}
   */

  countries: null,

  /**
   * countrySelected
   * @property {String}
   */
  country: Ember.computed.alias('tempProfile.country'),

  /**
   * countrySelected
   * @property {String}
   */
  countrySelected: Ember.computed.alias('tempProfile.countryId'),

  /**
   * stateSelected
   * @property {String}
   */
  state: Ember.computed.alias('tempProfile.state'),

  /**
   * stateSelected
   * @property {String}
   */
  stateSelected: Ember.computed.alias('tempProfile.stateId'),

  /**
   * districtSelected
   * @property {String}
   */
  districtSelected: Ember.computed.alias('tempProfile.schoolDistrictId'),

  /**
   * otherSchoolDistrict
   * @property {String}
   */
  otherSchoolDistrict: Ember.computed.alias('tempProfile.schoolDistrict'),

  /**
   * List of states
   * @property {States[]}
   */

  states: null,

  /**
   * showStates
   * @property {Boolean}
   */
  showStates: Ember.computed.reads('tempProfile.stateId'),

  /**
   * List of districts
   * @property {Districts[]}
   */

  districts: null,

  /**
   * @type {String} teacher, student or other, tells the component which radio is checked.
   */
  currentRole: Ember.computed.alias('tempProfile.role'),

  /**
   * showRoleErrorMessage
   * @property {Boolean}
   */
  showRoleErrorMessage: false,

  /**
   * showCountryErrorMessage
   * @property {Boolean}
   */
  showCountryErrorMessage: false,

  /**
   * showCountryErrorMessage
   * @property {Boolean}
   */
  showDistrictErrorMessage: false,

  /**
   * @type {String} usernameError
   */
  usernameError: false,

  // -------------------------------------------------------------------------
  // Methods

  saveProfile(profile) {
    const component = this;
    return component
      .get('profileService')
      .updateMyProfile(profile)
      .then(function() {
        let session = component.get('session');
        if (!profile.get('avatarUrl')) {
          profile.set(
            'avatarUrl',
            component.get('appRootPath') + DEFAULT_IMAGES.USER_PROFILE
          );
        }
        session.set('userData.avatarUrl', profile.get('avatarUrl'));
        session.set('userData.isNew', false);
        session.set('userData.username', profile.username);
        return component
          .get('sessionService')
          .updateUserData(session.get('userData'));
      });
  }
});
