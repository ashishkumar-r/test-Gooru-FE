import Ember from 'ember';
import User from 'gooru-web/models/sign-in/sign-in';
import Env from 'gooru-web/config/environment';
import {
  GOORU_SHORT_NAME,
  EMAIL_VALIDATION,
  CAST_EVENTS
} from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Controller.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['sessionEnds', 'redirectURL', 'nonce', 'userEmail'],

  /**
   * @property {Service} Session
   */
  session: Ember.inject.service(),

  /**
   * @property {Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} TenantService service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),
  appplicationController: Ember.inject.controller('application'),

  castEventService: Ember.inject.service('api-sdk/cast-event/cast-event'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} LookupService service
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  /**
   * @property {Controller} Application Controller
   */
  applicationController: Ember.inject.controller('application'),

  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    let component = this;
    let tenantService = this.get('tenantService');
    tenantService.removeStoredTenantSetting();
    tenantService.getActiveTenantSetting().then(function(tenantSettings) {
      component.set('tenantSetting', tenantSettings);
      if (
        tenantSettings &&
        tenantSettings.ui_element_visibility_settings &&
        tenantSettings.ui_element_visibility_settings
          .show_classlink_sso_button &&
        tenantSettings.ui_element_visibility_settings
          .show_classlink_sso_button === true
      ) {
        component.set('showClassLinkLogin', true);
      }
      if (
        tenantSettings &&
        tenantSettings.ui_element_visibility_settings &&
        tenantSettings.ui_element_visibility_settings.enable_navigator_programs
      ) {
        component.set('enableNavigatorPrograms', true);
      }

      if (
        tenantSettings &&
        tenantSettings.know_more_about_user_questions &&
        tenantSettings.know_more_about_user_questions.length
      ) {
        component.set('showKnowMoreAboutUser', true);
      }
      if (
        tenantSettings &&
        tenantSettings.enable_email_verification === 'off'
      ) {
        component.set('emailVerification', false);
      } else {
        component.set('emailVerification', true);
      }
    });
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    authenticate: function() {
      const controller = this;
      const user = controller.get('user');
      let enableNavigatorPrograms = controller.get('enableNavigatorPrograms');
      let showKnowMoreAboutUser = controller.get('showKnowMoreAboutUser');
      const emailVerification = controller.get('emailVerification');
      const errorMessage = controller
        .get('i18n')
        .t('common.errors.sign-in-credentials-not-valid').string;

      controller.get('notifications').clear();
      controller.get('notifications').setOptions({
        positionClass: 'toast-top-full-width sign-in'
      });

      if (emailVerification) {
        let userProfile = JSON.parse(
          window.localStorage.getItem('userLoginProfile')
        );

        if (userProfile) {
          controller
            .get('sessionService')
            .signUp(userProfile)
            .then(function() {
              const userId = controller.get('session.userId');

              if (userId) {
                controller
                  .get('profileService')
                  .readUserProfile(userId)
                  .then(function(updatedProfile) {
                    if (!updatedProfile.role) {
                      updatedProfile.set('role', userProfile.role);
                      updatedProfile.set('country', userProfile.country);
                      updatedProfile.set('state', userProfile.state);
                      updatedProfile.set('countryId', userProfile.countryId);
                      updatedProfile.set('stateId', userProfile.stateId);

                      controller
                        .get('profileService')
                        .updateMyProfile(updatedProfile)
                        .then(
                          () => {
                            let session = controller.get('session');
                            controller
                              .get('applicationController')
                              .loadSessionProfile(updatedProfile);
                            session.set('userData.isNew', true);
                            session.set('userData.role', userProfile.role);
                            session.set('updatedProfile', updatedProfile);
                            session.set('role', userProfile.role);

                            controller
                              .get('sessionService')
                              .updateUserData(session.get('userData'));
                          },
                          () => Ember.Logger.error('Error updating user')
                        );
                    }
                  });
              }
            });
        }
      }
      // TODO needs to be revisited, this is a quick fix
      controller
        .get('sessionService')
        .authorize()
        .then(function() {
          if (controller.get('didValidate') === false) {
            var username = Ember.$('.gru-input.username input').val();
            var password = Ember.$('.gru-input.password input').val();
            user.set('username', username);
            user.set('password', password);
          }
          user.validate().then(function({ validations }) {
            if (validations.get('isValid')) {
              controller
                .get('sessionService')
                .signInWithUser(user, true)
                .then(
                  function() {
                    controller
                      .get('appplicationController')
                      .initalizeExternalTools();
                    controller.set('didValidate', true);
                    const userId = controller.get('session.userId');
                    controller
                      .get('profileService')
                      .readUserProfile(userId)
                      .then(function(updatedProfile) {
                        controller.set('currentRole', updatedProfile.role);
                        controller.set(
                          'session.updatedProfile',
                          updatedProfile
                        );

                        if (
                          !enableNavigatorPrograms ||
                          updatedProfile.role === 'teacher' ||
                          (updatedProfile.info && showKnowMoreAboutUser)
                        ) {
                          controller.send('signIn');
                        } else {
                          if (
                            enableNavigatorPrograms &&
                            updatedProfile.role === 'student'
                          ) {
                            controller.send('signUpFinish');
                          } else {
                            controller.send('signIn');
                          }
                        }
                      });
                    let data = {};
                    controller
                      .get('castEventService')
                      .castEvent(CAST_EVENTS.LOGIN, data);

                    // Trigger parse event
                    controller
                      .get('parseEventService')
                      .postParseEvent(PARSE_EVENTS.LOGIN);
                  },
                  function(error) {
                    let anonymousSessionData = controller.get(
                      'anonymousSessionData'
                    );

                    // Authenticate as anonymous if it fails to mantain session
                    controller
                      .get('session')
                      .authenticateAsAnonymousWithData(anonymousSessionData);
                    const message = error.responseJSON.message;
                    //If your mail was not verified Throwing a 403 error and email not verified message

                    if (message === EMAIL_VALIDATION.EMAIL) {
                      const queryParam = {
                        queryParams: {
                          not_verified: true
                        }
                      };
                      controller.transitionToRoute(
                        'email-verification',
                        queryParam
                      );
                    } else {
                      controller.get('notifications').warning(errorMessage);
                    }
                  }
                );
            }
          });
        });
    },

    /**
     * Action triggered when click on back arrow
     */
    goBack: function() {
      window.history.back();
    },
    /**
     * Action triggered when click on sign in with classlink button
     */
    tenantLogin() {
      let tenantUrl = this.get('configuration.OAUTH_LOGIN_LANUCH_URL');
      let tenantShortName = this.get(
        'anonymousSessionData.tenant.tenantShortName'
      );
      window.location.href = `${tenantUrl}/${tenantShortName}`;
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    let userEmail = controller.get('userEmail');
    if (controller.get('nonce')) {
      let email = window.localStorage.getItem('userEmail');
      if (email) {
        userEmail = window.atob(email);
      }
    }
    var user = User.create(Ember.getOwner(this).ownerInjection(), {
      username: userEmail ? userEmail : null,
      password: null
    });
    controller.set('user', user);
    const homeURL = `${window.location.protocol}//${window.location.host}`;
    let redirectURL = controller.get('redirectURL') || homeURL;
    const url = `${homeURL}${Env['google-sign-in'].url}?redirectURL=${redirectURL}`;
    controller.set('googleSignInUrl', url);
    controller.set('didValidate', false);
    controller.set('userEmail', null);
    const gg4lUrl = `${homeURL}${Env['passport-login-url'].url}`;
    controller.set('gg4lLoginUrl', gg4lUrl);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {User} user
   */
  user: null,

  tenantSetting: null,

  tenantLogo: Ember.computed('tenantSetting', function() {
    const tenantSettings = this.get('tenantSetting');
    return (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.logo_url
    );
  }),

  isShowTenantLogo: Ember.computed('tenantSetting', function() {
    const tenantSettings = this.get('tenantSetting');
    return (
      tenantSettings &&
      tenantSettings.ui_element_visibility_settings &&
      tenantSettings.ui_element_visibility_settings.show_logo === true
    );
  }),

  target: null,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * Query param
   * @property {Boolean} sessionEnds
   */
  sessionEnds: false,

  redirectURL: null,

  userEmail: null,

  /**
   * Maintain the state of redirection completed or not
   * @property {Boolean}
   */
  isRedirectionDomainDone: false,

  /**
   * Computed property to identify gooru or tenant login.
   */
  isGooruLogin: Ember.computed.alias('session.isGooruClientId'),

  /**
   * Logged in tenant logo URL
   */
  tenantLogoUrl: Ember.computed('anonymousSessionData', function() {
    return this.get('isShowTenantLogo')
      ? this.get('tenantLogo')
      : this.get('anonymousSessionData.tenant.imageUrl');
  }),

  isShowGg4lButton: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.isShowGg4lButton'
  ),

  /**
   * Maintains the state of anonymous session data.
   * @type {Session}
   */
  anonymousSessionData: null,

  /**
   * Computed property to maintain the tenant name
   */

  tenantName: Ember.computed('isGooruLogin', function() {
    return this.get('isGooruLogin')
      ? GOORU_SHORT_NAME
      : this.get('anonymousSessionData.tenant.tenantShortName');
  }),

  showClassLinkLogin: false
});
