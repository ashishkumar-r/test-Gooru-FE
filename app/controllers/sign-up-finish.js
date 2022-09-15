import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import { COUNTRY_CODES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @property {Ember.Service} Service to do retrieve states, districts
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @property {Controller} Application Controller
   */
  applicationController: Ember.inject.controller('application'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  //--------------------------------------------------------------------------
  // Events

  init() {
    const controller = this;
    const userId = controller.get('session.userId');
    const isEnableNavigatorPrograms = controller.get(
      'isEnableNavigatorPrograms'
    );

    controller
      .get('profileService')
      .readUserProfile(userId)
      .then(function(updatedProfile) {
        controller.set('profile', updatedProfile);

        if (updatedProfile.loginType === 'google' && !updatedProfile.role) {
          controller.initialCountry();
          controller.initialRole();
          controller.defaultRoleGoogleSignUp();
          controller.set('onShowSignup', true);
        } else {
          controller.set('isShowGuardianpullUp', true);
        }
        if (updatedProfile.loginType === 'credential') {
          controller.set('onShowSignup', false);
          controller.set('isShowGuardianpullUp', true);
        }
      });
    if (isEnableNavigatorPrograms) {
      controller
        .get('lookupService')
        .knowMoreAboutUserQuestions()
        .then(knowMore => {
          controller.set(
            'whereInLifeAreYou',
            knowMore.findBy('store_key', 'where_in_life_are_you')
          );
          const gradeObj = knowMore.findBy('store_key', 'grade_level');
          controller.set('gradeLevel', gradeObj);
          if (gradeObj.additionalInfo) {
            const additionalInfo = gradeObj.additionalInfo;
            const filters = {
              subject: additionalInfo.subject_code,
              fw_code: additionalInfo.framework_code
            };
            controller
              .get('taxonomyService')
              .fetchGradesBySubject(filters)
              .then(gradeList => {
                const options = Ember.A();
                gradeList.forEach(item => {
                  options.push({
                    id: item.grade,
                    name: item.grade
                  });
                });
                gradeObj.set('options', options);
              });
          }
        });
    }
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    next: function() {
      var controller = this;
      var userId = controller.get('session.userId');
      var profile = controller.get('profile');
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
      profile.set('id', userId);
      controller.set('otherSchoolDistrict', otherSchoolDistrict);

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

      if (isValid) {
        if (otherSchoolDistrict) {
          profile.set('schoolDistrictId', null);
          profile.set('schoolDistrict', otherSchoolDistrict);
        }
        controller
          .get('profileService')
          .updateMyProfile(profile)
          .then(
            () => {
              let session = controller.get('session');
              controller
                .get('applicationController')
                .loadSessionProfile(profile);
              const isKnowMoreAboutUserQuestions = controller.get(
                'isKnowMoreAboutUserQuestions'
              );
              session.set('userData.isNew', false);
              session.set('userData.role', role);
              session.set('updatedProfile', profile);
              session.set('updatedProfile.isSignUp', true);
              session.set('role', role);
              controller.set('currentRole', role);
              controller
                .get('sessionService')
                .updateUserData(session.get('userData'));
              controller.set('onShowSignup', false);

              if (profile.info && isKnowMoreAboutUserQuestions) {
                controller.send('signUpFinish', role);
              } else {
                controller.set('isShowGuardianpullUp', true);
              }
            },
            () => Ember.Logger.error('Error updating user')
          );
      }
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
            controller
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.IDENTIFY_MY_ACCOUNT);
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

    onThisIsMyId() {
      const controller = this;
      controller.set('enableFewMoreQuestions', true);
      controller.set('isThisIsMyId', true);
    },

    onOpenAcknowledgement() {
      const isEnableNavigatorPrograms = this.get('isEnableNavigatorPrograms');
      let session = this.get('session');
      session.set('userData.isNew', false);
      if (isEnableNavigatorPrograms) {
        this.set('isThisIsMyId', false);
        if (this.get('currentRole') === 'student') {
          this.set('isOpenKnowMoreAcknowledgement', true);
          this.set('enableFewMoreQuestions', true);
        } else {
          this.set('isOpenAcknowledgement', true);
          this.set('enableFewMoreQuestions', false);
          this.set('isShowGuardianpullUp', false);
        }
      } else {
        this.set('isShowGuardianpullUp', false);
        this.set('isOpenAcknowledgement', true);
      }
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.UNIVERSAL_LEARNER_MAYBE_LATER
      );
    },

    onDismissAcknowledgement() {
      const controller = this;
      let session = controller.get('session');
      controller.set('isOpenAcknowledgement', false);
      const isEnableNavigatorPrograms = controller.get(
        'isEnableNavigatorPrograms'
      );
      if (isEnableNavigatorPrograms) {
        if (session.get('updatedProfile.isSignUp')) {
          controller.send('signUpFinish', session.get('userData.role'));
        } else {
          controller.send('signIn');
        }
      } else {
        controller.send('signUpFinish', session.get('userData.role'));
      }
      controller
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.DISMISS_UNIVERSAL_LEARNER_PULLUP);
    },

    onShowSearch() {
      let session = this.get('session');
      session.set('userData.isNew', false);
      this.set('isShowSearch', true);
      this.set('isShowGuardianpullUp', false);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.UNIVERSAL_LEARNER_LINKED_ACCOUNT
      );
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
      const isEnableNavigatorPrograms = controller.get(
        'isEnableNavigatorPrograms'
      );
      if (isEnableNavigatorPrograms) {
        if (controller.get('currentRole') === 'student') {
          controller.set('isShowGuardianpullUp', true);
          controller.set('enableFewMoreQuestions', true);
          controller.set('addLinkConfirmPullUp', true);
        } else {
          if (session.get('updatedProfile.isSignUp')) {
            controller.send('signUpFinish', session.get('userData.role'));
          } else {
            controller.send('signIn');
          }
        }
      } else {
        controller.send('signUpFinish', session.get('userData.role'));
      }
    },

    onClosePullup() {
      this.set('isOpenPersonalizeSetting', false);
    },

    whereInLifeSelect: function() {
      var controller = this;
      controller.set('showWhereInLifeErrorMessage', false);
    },

    gradeLevelSelect: function() {
      var controller = this;
      controller.set('showGradeLevelErrorMessage', false);
    },

    onSubmitContinue() {
      const controller = this;
      let session = controller.get('session');
      let updatedProfile = session.get('updatedProfile')
        ? session.get('updatedProfile')
        : controller.get('profile');
      var showWhereInLifeErrorMessage = false;
      var showGradeLevelErrorMessage = false;
      var isValid = true;

      var whereInLifeAreYou = controller.get('whereInLifeAreYou');
      var gradeLevel = controller.get('gradeLevel');

      if (
        controller.get('enableFewMoreQuestions') ||
        controller.get('currentRole') === 'student'
      ) {
        if (whereInLifeAreYou) {
          var selectedWhereInLifeAreYou = whereInLifeAreYou.options.findBy(
            'id',
            whereInLifeAreYou.default_value
          );
        }
        var selectedGradeLevel = gradeLevel.options.findBy(
          'id',
          gradeLevel.default_value
        );

        let info = {
          where_in_life_are_you: selectedWhereInLifeAreYou
            ? selectedWhereInLifeAreYou.name
            : 'in_school',
          grade_level: selectedGradeLevel ? selectedGradeLevel.name : false
        };

        if (!info.where_in_life_are_you) {
          showWhereInLifeErrorMessage = true;
          isValid = false;
        }
        if (!info.grade_level) {
          showGradeLevelErrorMessage = true;
          isValid = false;
        }

        controller.set(
          'showWhereInLifeErrorMessage',
          showWhereInLifeErrorMessage
        );
        controller.set(
          'showGradeLevelErrorMessage',
          showGradeLevelErrorMessage
        );

        if (isValid) {
          updatedProfile.info = info;
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
                session.set('userData.role', updatedProfile.role);
                session.set('role', updatedProfile.role);
                session.set('updatedProfile', updatedProfile);
                controller
                  .get('sessionService')
                  .updateUserData(session.get('userData'));
                controller.set('enableFewMoreQuestions', false);

                if (
                  controller.get('isThisIsMyId') &&
                  session.get('updatedProfile.isSignUp')
                ) {
                  controller.send('signUpFinish', session.get('userData.role'));
                }

                if (
                  controller.get('addLinkConfirmPullUp') &&
                  session.get('updatedProfile.isSignUp')
                ) {
                  controller.send('signUpFinish', session.get('userData.role'));
                }

                if (
                  !session.get('updatedProfile.isSignUp') &&
                  !controller.get('isOpenKnowMoreAcknowledgement')
                ) {
                  controller.send('signIn');
                }

                if (controller.get('isOpenKnowMoreAcknowledgement')) {
                  controller.set('isOpenAcknowledgement', true);
                }

                controller.set('isShowGuardianpullUp', false);
                controller.set('isShowConfirmPullup', false);
                controller
                  .get('parseEventService')
                  .postParseEvent(PARSE_EVENTS.SUBMIT_GRADE_LEVEL);
              },
              () => Ember.Logger.error('Error updating user')
            );
        }
      }
    },

    universalLearner: function() {
      const userId = this.get('session.userId');
      this.transitionToRoute('profile.universal-learner', userId);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Profile} profile
   */
  profile: null,

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

  knowMoreQuestion: Ember.A([]),

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

  onShowSignup: false,

  enableFewMoreQuestions: false,

  isThisIsMyId: false,

  addLinkConfirmPullUp: false,

  isOpenKnowMoreAcknowledgement: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var profile = Profile.create(Ember.getOwner(this).ownerInjection(), {
      role: null,
      countryId: null,
      stateId: null,
      schoolDistrictId: null,
      schoolDistrict: null,
      use_learning_data: true
    });

    controller.set('profile', profile);
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
  },

  defaultRoleGoogleSignUp() {
    var controller = this;
    var userId = controller.get('session.userId');
    var profile = controller.get('profile');
    var role = controller.get('profile.role');
    profile.set('id', userId);

    if (role) {
      controller
        .get('profileService')
        .updateMyProfile(profile)
        .then(
          () => {
            let session = controller.get('session');
            controller.get('applicationController').loadSessionProfile(profile);
            session.set('userData.isNew', false);
            session.set('userData.role', role);
            session.set('role', role);
            controller
              .get('sessionService')
              .updateUserData(session.get('userData'));
          },
          () => Ember.Logger.error('Error updating user')
        );
    }
  }
});
