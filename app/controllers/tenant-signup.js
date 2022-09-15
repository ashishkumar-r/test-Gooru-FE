import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import Env from 'gooru-web/config/environment';
import signUpValidations from 'gooru-web/validations/sign-up';
import { COUNTRY_CODES } from 'gooru-web/config/config';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['userEmail', 'r'],

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

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
   * @property {Ember.Service} Service to do retrieve states, districts
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  applicationController: Ember.inject.controller('application'),

  confirmProfileMergeService: Ember.inject.service('confirm-profile-merge'),

  //--------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    next: function() {
      const controller = this;
      const emailVerification = controller.get('emailVerification');
      const profile = controller.get('profile');

      const birthDayDate = controller.validDateSelectPicker();

      if (controller.get('didValidate') === false) {
        var email = Ember.$('.gru-input.email input').val();
        var password = Ember.$('.gru-input.password input').val();
        var rePassword = Ember.$('.gru-input.rePassword input').val();
        var firstName = Ember.$('.gru-input.firstName input').val();
        var lastName = Ember.$('.gru-input.lastName input').val();
        var useLearnData = controller.get('isChecked');
        var role = controller.get('profile.role');
        var countrySelected = controller.get('countrySelected');
        var stateSelected = controller.get('stateSelected');
        var districtSelected = controller.get('districtSelected');
        var otherSchoolDistrict = $.trim(controller.get('otherSchoolDistrict'));
        var districts = controller.get('districts');
        var showStates = controller.get('showStates');
        var showRoleErrorMessage = false;
        var showCountryErrorMessage = false;
        var showStateErrorMessage = false;
        var showDistrictErrorMessage = false;
        var isValid = true;
        controller.set('otherSchoolDistrict', otherSchoolDistrict);
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
        otherSchoolDistrict === '' &&
        stateSelected &&
        !districtSelected &&
        districts &&
        districts.length > 0
      ) {
        showDistrictErrorMessage = true;
        isValid = false;
      }

      controller.set('showRoleErrorMessage', showRoleErrorMessage);
      controller.set('showCountryErrorMessage', showCountryErrorMessage);
      controller.set('showStateErrorMessage', showStateErrorMessage);
      controller.set('showDistrictErrorMessage', showDistrictErrorMessage);

      let askConsentFromUser = controller.get('askConsentFromUser');
      profile.validate().then(function({ validations }) {
        if (
          validations.get('isValid') &&
          isValid &&
          birthDayDate !== '' &&
          ((askConsentFromUser && useLearnData) || !askConsentFromUser)
        ) {
          if (!controller.validDateImpl()) {
            controller.set('dateValidated', false);
            return false;
          }
          if (otherSchoolDistrict) {
            profile.set('schoolDistrictId', null);
            profile.set('schoolDistrict', otherSchoolDistrict);
          }
          profile.set('dateOfBirth', birthDayDate);
          let updateProfile = profile;

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
                    controller.send('signUp');
                  });
                } else {
                  controller
                    .get('sessionService')
                    .signUp(profile)
                    .then(function() {
                      let session = controller.get('session');
                      var userId = session.get('userId');
                      updateProfile.set('id', userId);
                      session.set('userData.isNew', false);
                      session.set('userData.role', role);
                      controller
                        .get('profileService')
                        .updateMyProfile(updateProfile);
                      controller
                        .get('applicationController')
                        .loadSessionProfile(profile);
                      controller
                        .get('sessionService')
                        .updateUserData(session.get('userData'));
                      controller.set('onHideSignup', true);
                      controller.set('isShowGuardianpullUp', true);
                      controller.set('didValidate', true);
                      controller.get('applicationController').loadUserClasses();
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
    },

    onChangeRole: function() {
      this.set('showRoleErrorMessage', false);
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
        controller.set('districts', null);
        controller.set('stateSelected', '');
        controller.set('state', '');
        controller.set('districtSelected', '');
        controller.set('otherSchoolDistrict', '');
      }
    },

    stateSelect: function(id) {
      var controller = this;
      var states = controller.get('states');
      controller.set('showStateErrorMessage', false);
      controller.set('showDistrictErrorMessage', false);
      controller.set('districts', null);
      controller.set('stateSelected', id);
      controller.set('state', states.findBy('id', id).name);
      controller
        .get('lookupService')
        .readDistricts(id)
        .then(districts => controller.set('districts', districts));
    },

    districtSelect: function(id) {
      var controller = this;

      controller.set('showDistrictErrorMessage', false);
      controller.set('districtSelected', id);
      controller.set('otherSchoolDistrict', null);
    },

    onStudentProfiles() {
      const controller = this;
      let text = this.get('userEnteredValue');
      if (text) {
        controller.set('isLoading', true);
        controller
          .get('profileService')
          .readUsersProfileByUsername(text)
          .then(studentDetail => {
            controller.set('isShowSearchResults', true);
            controller.set('isShowSearch', false);
            controller.set('isLoading', false);
            const userId = controller.get('session.userId');
            let studentDetails = studentDetail.filter(
              profile =>
                profile.id !== userId &&
                profile.get('universalProfileStatus') === null
            );
            controller.set('searchResults', studentDetails);
          });
      }
    },

    onSearch(e) {
      const controller = this;
      controller.set('userEnteredValue', e.target.value);
      let keyCode =
        typeof event.which === 'number' ? event.which : event.keyCode;
      if (keyCode === 13) {
        controller.send('onStudentProfiles');
      }
    },

    onClearSearch() {
      const controller = this;
      controller.set('userEnteredValue', '');
      controller.set('searchResults', Ember.A());
    },

    onShowGuardianpullUp() {
      this.set('isShowGuardianpullUp', true);
    },

    onOpenAcknowledgement() {
      this.set('isShowGuardianpullUp', false);
      this.set('isOpenAcknowledgement', true);
    },

    onDismissAcknowledgement() {
      const controller = this;
      let session = controller.get('session');
      controller.set('isOpenAcknowledgement', false);
      controller.send('signUpFinish', session.get('userData.role'));
    },

    onShowSearch() {
      this.set('isShowSearch', true);
      this.set('isShowGuardianpullUp', false);
    },

    onCloseSearch() {
      this.send('onClearSearch');
      this.set('isShowSearch', false);
      this.set('isShowGuardianpullUp', true);
    },

    onCloseSearchResult() {
      this.set('isShowSearch', true);
      this.set('isShowSearchResults', false);
      this.send('onClearSearch');
    },

    onClickUserProfile(searchResult) {
      const controller = this;
      searchResult.set('isChecked', true);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      controller.set('isSelected', selectedUser && selectedUser.length);
    },

    onClickRemoveUserProfile(searchResult) {
      const controller = this;
      searchResult.set('isChecked', false);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      controller.set('isSelected', selectedUser && selectedUser.length);
    },

    onMergeUserProfile() {
      const controller = this;
      controller.set('isShowSearchResults', false);
      controller.set('isShowSearch', false);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      let user_ids = selectedUser;
      const warningMessage = controller.get('i18n').t('merged-warning-msg')
        .string;
      controller
        .get('profileService')
        .mergeUserProfile(user_ids)
        .then(() => {
          controller.set('isShowConfirmPullup', true);
        })
        .catch(function(error) {
          if (error.status === 409) {
            controller.get('notifications').warning(warningMessage);
          }
        });
    },

    closeConfirmPullup() {
      const controller = this;
      let session = this.get('session');
      controller.set('isShowConfirmPullup', false);
      controller.send('onClearSearch');
      controller.send('signUpFinish', session.get('userData.role'));
    },

    onClosePullup() {
      this.set('isOpenPersonalizeSetting', false);
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

  /**
   * Query param
   * @property {string} role
   */
  r: null,

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
   * districtSelected
   * @property {String}
   */
  districtSelected: Ember.computed.alias('profile.schoolDistrictId'),

  /**
   * otherSchoolDistrict
   * @property {String}
   */
  otherSchoolDistrict: null,

  /**
   * List of states
   * @property {States[]}
   */

  states: null,

  /**
   * showStates
   * @property {Boolean}
   */

  showStates: false,

  /**
   * List of districts
   * @property {Districts[]}
   */

  districts: null,

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
   * showCountryErrorMessage
   * @property {Boolean}
   */
  showDistrictErrorMessage: false,

  isShowGuardianpullUp: false,

  isOpenAcknowledgement: false,

  isShowSearch: false,

  userEnteredValue: '',

  searchResults: null,

  isShowSearchResults: false,

  isShowConfirmPullup: false,

  isOpenPersonalizeSetting: false,

  isSelected: false,

  onHideSignup: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var signUpProfile = Profile.extend(signUpValidations);
    let userEmail = controller.get('userEmail');
    let role = controller.get('r');
    var profile = signUpProfile.create(Ember.getOwner(this).ownerInjection(), {
      username: null,
      password: null,
      firstName: null,
      lastName: null,
      email: userEmail ? userEmail : null,
      role: role ? (role === 's' ? 'student' : 'teacher') : null,
      countryId: null,
      stateId: null,
      schoolDistrictId: null,
      schoolDistrict: null,
      use_learning_data: true
    });

    controller.set('profile', profile);
    const url = `${window.location.protocol}//${window.location.host}${Env['google-sign-in'].url}?redirectURL=${window.location.protocol}//${window.location.host}`;
    controller.set('googleSignUpUrl', url);
    controller.set('didValidate', false);
    controller.set('emailError', false);
    controller.set('usernameError', false);
    controller.set('userEmail', null);
    controller.set('isDisableRole', role);
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
  }
});
