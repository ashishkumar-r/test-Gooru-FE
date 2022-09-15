import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import Env from 'gooru-web/config/environment';
import signUpValidations from 'gooru-web/validations/sign-up';
import { COUNTRY_CODES } from 'gooru-web/config/config';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['userEmail'],

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Service to do retrieve states, districts
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {TenantService} Tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @type {String} teacher, student or other, tells the component which radio is checked.
   */
  currentRole: Ember.computed.alias('profile.role'),

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
   * List of countries
   * @property {Countries[]}
   */

  countries: null,

  /**
   * countrySelected
   * @property {String}
   */
  country: Ember.computed.alias('profile.country'),

  /**
   * country
   * @property {String}
   */
  countrySelected: Ember.computed.alias('profile.countryId'),

  /**
   * state
   * @property {String}
   */
  state: Ember.computed.alias('profile.state'),

  /**
   * stateSelected
   * @property {String}
   */
  stateSelected: Ember.computed.alias('profile.stateId'),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  applicationController: Ember.inject.controller('application'),

  ConfirmProfileMergeService: Ember.inject.service('confirm-profile-merge'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    next: function() {
      const controller = this;
      const emailVerification = controller.get('emailVerification');
      const profile = controller.get('profile');
      var showRoleErrorMessage = false;
      var showCountryErrorMessage = false;
      var showStateErrorMessage = false;
      var isValid = true;
      var stateSelected = controller.get('stateSelected');
      var showStates = controller.get('showStates');
      var role = controller.get('currentRole');
      var country = controller.get('country');
      var state = profile.get('state');

      if (!role) {
        showRoleErrorMessage = true;
        isValid = false;
      }
      if (!country) {
        showCountryErrorMessage = true;
        isValid = false;
      }

      if (!stateSelected && showStates) {
        showStateErrorMessage = true;
        isValid = false;
      }

      controller.set('showRoleErrorMessage', showRoleErrorMessage);
      controller.set('showCountryErrorMessage', showCountryErrorMessage);
      controller.set('showStateErrorMessage', showStateErrorMessage);

      const birthDayDate = controller.validDateSelectPicker();

      if (controller.get('didValidate') === false) {
        var email = Ember.$('.gru-input.email input').val();
        var password = Ember.$('.gru-input.password input').val();
        var rePassword = Ember.$('.gru-input.rePassword input').val();
        var firstName = Ember.$('.gru-input.firstName input').val();
        var lastName = Ember.$('.gru-input.lastName input').val();
        var useLearnData = controller.get('isChecked');
        profile.set('username', email);
        profile.set('password', password);
        profile.set('rePassword', rePassword);
        profile.set('email', email);
        profile.set('firstName', firstName);
        profile.set('lastName', lastName);
        if (controller.get('askConsentFromUser')) {
          profile.set('useLearnData', useLearnData);
        }
      }
      let askConsentFromUser = controller.get('askConsentFromUser');
      profile.validate().then(function({ validations }) {
        if (
          validations.get('isValid') &&
          birthDayDate !== '' &&
          ((askConsentFromUser && useLearnData) || !askConsentFromUser) &&
          isValid
        ) {
          if (!controller.validDateImpl()) {
            controller.set('dateValidated', false);
            return false;
          }
          profile.set('dateOfBirth', birthDayDate);
          controller
            .get('profileService')
            .createProfile(profile)
            .then(
              function(profile) {
                if (emailVerification) {
                  return Ember.RSVP.hash({
                    mailVerify: controller
                      .get('profileService')
                      .sendMailVerify(email, profile['token-api3'])
                  }).then(() => {
                    controller.set('didValidate', true);
                    // Trigger action in parent
                    let session = controller.get('session');
                    session.set('userProfile', profile);
                    session.set('userProfile.role', role);
                    session.set('userProfile.country', country);
                    session.set('userProfile.state', state);
                    session.set(
                      'userProfile.countryId',
                      controller.get('countrySelected')
                    );
                    session.set(
                      'userProfile.stateId',
                      controller.get('stateSelected')
                    );
                    window.localStorage.setItem(
                      'userLoginProfile',
                      JSON.stringify(session.get('userProfile'))
                    );
                    controller.send('signUp');
                  });
                } else {
                  controller
                    .get('sessionService')
                    .signUp(profile)
                    .then(function() {
                      controller.set('didValidate', true);
                      controller.transitionToRoute('login');
                      controller.get('applicationController').loadUserClasses();

                      const userId = controller.get('session.userId');
                      controller
                        .get('profileService')
                        .readUserProfile(userId)
                        .then(function(updatedProfile) {
                          updatedProfile.set('role', role);
                          updatedProfile.set('country', country);
                          updatedProfile.set('state', state);
                          updatedProfile.set(
                            'countryId',
                            controller.get('countrySelected')
                          );
                          updatedProfile.set(
                            'stateId',
                            controller.get('stateSelected')
                          );

                          controller
                            .get('profileService')
                            .updateMyProfile(updatedProfile)
                            .then(
                              () => {
                                let session = controller.get('session');
                                controller
                                  .get('applicationController')
                                  .loadSessionProfile(updatedProfile);
                                session.set('userData.isNew', false);
                                session.set('userData.role', role);
                                session.set('updatedProfile', updatedProfile);
                                session.set('updatedProfile.isSignUp', true);
                                session.set('role', role);
                                controller
                                  .get('sessionService')
                                  .updateUserData(session.get('userData'));
                              },
                              () => Ember.Logger.error('Error updating user')
                            );
                        });
                    });
                }
              },
              function(error) {
                if (error && (error.email || error.username)) {
                  controller.set('emailError', error.email);
                  controller.set('usernameError', error.username);
                  controller.keydownEvents();
                } else {
                  // Unexpected error
                  var message = controller
                    .get('i18n')
                    .t('common.errors.sign-up-error').string;
                  controller.get('notifications').error(message);
                  Ember.Logger.error(error);
                }
              }
            );
        }
        controller.set('dateValidated', true);
      });
    },

    countrySelect: function(id) {
      var controller = this;
      var countries = this.get('countries');
      var country = countries.findBy('id', id);
      var countryCode = country.code;
      var countryName = country.name;
      controller.set('showCountryErrorMessage', false);
      controller.set('countrySelected', id);
      controller.set('country', countryName);

      if (countryCode === COUNTRY_CODES.US) {
        controller.set('showStates', true);
      } else {
        controller.set('showStates', false);
        controller.set('stateSelected', '');
        controller.set('state', '');
      }
    },

    stateSelect: function(id) {
      var controller = this;
      var states = controller.get('states');
      controller.set('showStateErrorMessage', false);
      controller.set('districts', null);
      controller.set('stateSelected', id);
      controller.set('state', states.findBy('id', id).name);
    },

    closeMsg: function() {
      var controller = this;
      $('.selectpicker.years option:selected').text('Year');
      controller.set('birthYearSelected', null);
      controller.set('showChildLayout', false);
    },
    close: function() {
      var controller = this;
      if (controller.validDateImpl()) {
        controller.set('showChildLayout', false);
        controller.send('closeSignUp');
      }
    },

    /**
     * Triggered when the gru-select-date-picker options are selected
     * @param {*} item
     */
    validDate: function() {
      const controller = this;
      const birthDayDate = controller.validDateSelectPicker();

      if (controller.calculateAge(birthDayDate) >= 13) {
        controller.set('showChildLayout', false);
      } else {
        controller.set('showChildLayout', true);
      }
    },
    // Action trigger when click checkbox on personal details
    toggleCheckbox(value) {
      let controller = this;
      controller.set('isChecked', !value);
    },
    // Action trigger when click checkbox on share anonymized data
    toggleAction(value) {
      let controller = this;
      controller.set('isAgree', !value);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {String} Error with email field
   */
  emailError: false,

  /**
   * @type {String} Error with username field
   */
  usernameError: false,

  /**
   * @type {Profile} profile
   */
  profile: null,

  /**
   * @type {String} monthSelected
   */
  monthSelected: null,

  /**
   * @type {String} daySelected
   */
  daySelected: null,

  /**
   * @type {String} yearSelected
   */
  yearSelected: null,

  /**
   * Show child layout or not
   * @property {Boolean}
   */

  showChildLayout: false,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * @param {Boolean } dateValidated - value used to check if birthdate has been validated or not
   */
  dateValidated: false,

  /**
   * terms and conditions url
   * @property {string}
   */
  termsConditionsUrl: Ember.computed(function() {
    return Env.termsConditionsUrl;
  }),

  /**
   * Maintain the state of redirection completed or not
   * @property {Boolean}
   */
  isRedirectionDomainDone: false,
  /**
   * @property {Boolean} isChecked hold toggle checkbox activity
   */
  isChecked: false,

  /**
   * Query param
   * @property {string} userEmail
   */
  userEmail: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var signUpProfile = Profile.extend(signUpValidations);
    let userEmail = controller.get('userEmail');
    var profile = signUpProfile.create(Ember.getOwner(this).ownerInjection(), {
      username: null,
      password: null,
      firstName: null,
      lastName: null,
      email: userEmail ? userEmail : null,
      role: null,
      countryId: null,
      stateId: null,
      use_learning_data: true
    });

    controller.set('profile', profile);
    const url = `${window.location.protocol}//${window.location.host}${Env['google-sign-in'].url}?redirectURL=${window.location.protocol}//${window.location.host}`;
    controller.set('googleSignUpUrl', url);
    controller.set('didValidate', false);
    controller.set('emailError', false);
    controller.set('usernameError', false);
    controller.set('userEmail', null);
    controller.set('dateValidated', false);
    controller.set('birthYearSelected', null);
    controller
      .get('tenantService')
      .getActiveTenantSetting()
      .then(function(tenantSettings) {
        if (
          tenantSettings &&
          tenantSettings.enable_email_verification === 'off'
        ) {
          controller.set('emailVerification', false);
        } else {
          controller.set('emailVerification', true);
        }
      });
    controller.initialCountry();
    controller.initialRole();
  },

  /**
   * validate Date SelectPicker
   * @returns {Boolean}
   */
  validDateSelectPicker: function() {
    var controller = this;
    var yearSelected = $('.selectpicker.years option:selected').val();
    var birthDayDate = '';

    controller.set('yearSelected', yearSelected);

    if (yearSelected) {
      birthDayDate = `${yearSelected}`;
    }

    return birthDayDate;
  },

  /**
   * get month name of monthSelected
   * @param {String} monthSelected
   * @returns {String}
   */
  getMonthName: function(monthSelected) {
    const i18n = this.get('i18n');
    const monthNames = [
      i18n.t('sign-up.dateOfBirth.months.january'),
      i18n.t('sign-up.dateOfBirth.months.february'),
      i18n.t('sign-up.dateOfBirth.months.march'),
      i18n.t('sign-up.dateOfBirth.months.april'),
      i18n.t('sign-up.dateOfBirth.months.may'),
      i18n.t('sign-up.dateOfBirth.months.june'),
      i18n.t('sign-up.dateOfBirth.months.july'),
      i18n.t('sign-up.dateOfBirth.months.august'),
      i18n.t('sign-up.dateOfBirth.months.september'),
      i18n.t('sign-up.dateOfBirth.months.october'),
      i18n.t('sign-up.dateOfBirth.months.november'),
      i18n.t('sign-up.dateOfBirth.months.december')
    ];

    return monthNames.objectAt(parseInt(monthSelected) - 1);
  },

  /**
   * calculate age of user
   * @param {String} dateOfBirth
   * @returns {Number}
   */
  calculateAge: function(dateOfBirth) {
    var today = new Date();
    var age = today.getFullYear() - dateOfBirth;

    return age;
  },

  /**
   * Add keydown events to clear errors on username and email
   */
  keydownEvents: function() {
    const controller = this;
    var $username = Ember.$('.username input');
    var $email = Ember.$('.email input');
    $username.on('keydown', function() {
      controller.set('usernameError', false);
    });
    $email.unbind('keydown');
    $email.on('keydown', function() {
      controller.set('emailError', false);
    });
  },

  validDateImpl: function() {
    const controller = this;
    let dateValidated = false;
    const birthDayDate = controller.validDateSelectPicker();

    if (controller.calculateAge(birthDayDate) >= 13) {
      dateValidated = true;
      controller.set('showChildLayout', false);
    } else {
      dateValidated = false;
      controller.set('showChildLayout', true);
    }
    console.log('dateValidated', dateValidated); //eslint-disable-line
    return dateValidated;
  },

  initialCountry: function() {
    var controller = this;
    var countries = controller.get('countries');
    var country = countries.findBy('code', 'US');
    var countryName = country.name;
    controller.set('showCountryErrorMessage', false);
    controller.set('countrySelected', country.id);
    controller.set('country', countryName);
    controller.set('showStates', true);
  },

  initialRole: function() {
    var controller = this;
    controller.set('currentRole', 'student');
    let session = controller.get('session');
    session.set('userData.role', 'student');
    controller.get('sessionService').updateUserData(session.get('userData'));
  }
});
