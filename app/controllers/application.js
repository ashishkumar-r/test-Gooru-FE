import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import ModalMixin from 'gooru-web/mixins/modal';
import Env from '../config/environment';
import {
  SERP_TOOL_PATH,
  CAST_AND_CATCH_SCRIPT_PATH,
  CAST_EVENTS
} from 'gooru-web/config/config';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import noteToolMixin from '../mixins/note-tool-mixin';
export default Ember.Controller.extend(
  ConfigurationMixin,
  ModalMixin,
  UIHelperMixin,
  noteToolMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:session
     */
    session: Ember.inject.service('session'),

    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @property {TenantService}
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @property {HelpService}
     */
    helpService: Ember.inject.service('api-sdk/help'),

    i18n: Ember.inject.service(),

    // -------------------------------------------------------------------------
    // Attributes

    queryParams: ['themeId', 'lang'],

    /**
     * @property {string} application theme
     */
    themeId: null,

    /**
     * @property {string} application locale
     */
    lang: null,

    /**
     * @property {Tenant} tenant
     */
    tenant: null,

    /**
     * Maintain the state of redirection completed or not
     * @property {Boolean}
     */
    isRedirectionDomainDone: false,

    device_language_key: 'deviceLanguage',

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Action triggered after a user has signed in
       * @see sign-in.hbs
       */
      signIn: function() {
        return true;
      },

      /**
       * Action triggered when logging out
       */
      logout: function() {
        return true;
      },

      /**
       * Action triggered closed help pull up
       */
      closeHelpPullUp() {
        const controller = this;
        $('.helpPullUp').css('display', 'none');
        $('.gruPullUp').css('right', '');
        $('body').removeClass('gruHelpPullup');
        controller.set('isShowHelpPullUp', false);
        let dataModel = controller.get('helpInfoDescription');
        if (dataModel) {
          dataModel = '';
        }
        controller.set('helpInfoDescription', dataModel);
      },
      /**
       * Action triggered clossing note
       */
      onCloseNote() {
        $('#note-tool-div').hide();
      }
    },
    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {GruTheme} application theme
     */
    theme: null,

    /**
     * @property {ClassesModel} list of user classes
     */
    myClasses: null,

    /**
     * @property {Profile}
     */
    profile: null,

    /**
     * @property {Boolean} isShowHelpPullUp
     */
    isShowHelpPullUp: false,

    castEventService: Ember.inject.service('api-sdk/cast-event/cast-event'),

    // -------------------------------------------------------------------------
    // Methods

    loadUserClasses: function() {
      const controller = this;
      const profile = controller.get('profile');
      let profilePromise = profile
        ? Ember.RSVP.resolve(profile)
        : controller
          .get('profileService')
          .readUserProfile(controller.get('session.userId'));
      return profilePromise.then(function(userProfile) {
        controller.set('profile', userProfile);
        controller.setLibraryVisibility();
        controller.setAskConsentFromUser();
        return controller
          .get('classService')
          .findMyClasses(userProfile)
          .then(function(classes) {
            controller.set('myClasses', classes);
            let useLearnData = userProfile.get('use_learning_data');
            if (
              controller.get('askConsentFromUser') &&
              (useLearnData === null || useLearnData === undefined)
            ) {
              let model = {
                onUpdateProfile: function(isAgree) {
                  userProfile.set('use_learning_data', isAgree);
                  return new Ember.RSVP.Promise((resolve, reject) => {
                    controller
                      .get('profileService')
                      .updateMyProfile(userProfile)
                      .then(() => {
                        resolve();
                      }, reject);
                  });
                }
              };
              controller.actions.showModal.call(
                controller,
                'modals.gru-user-consent-modal',
                model
              );
            }
            return classes;
          });
      });
    },
    /**
     * Reload Session Profile Data
     */
    loadSessionProfile: function(profile) {
      const controller = this;
      const sessionId = controller.get('session.userId');
      let profilePromise = profile
        ? Ember.RSVP.resolve(profile)
        : controller.get('profileService').readUserProfile(sessionId);

      return profilePromise.then(function(userProfile) {
        controller.set('profile', userProfile);
        controller.set(
          'profile.isStudent',
          controller.get('session.role') === 'student'
        );
        controller.set(
          'profile.isTeacher',
          controller.get('session.role') === 'teacher'
        );
      });
    },

    /**
     * Setups the tenant information
     * @returns {Promise.<Tenant>}
     */
    setupTenant: function() {
      const controller = this;
      const tenantService = controller.get('tenantService');
      return tenantService
        .findTenantFromCurrentSession()
        .then(function(tenant) {
          controller.set('tenant', tenant);
          return tenant;
        });
    },

    loadTranslationLabels: function(lang) {
      const controller = this;
      const defaultLanguage = EndPointsConfig.getLanguageSettingdefaultLang();
      let whichLocalSet = controller
        .getLocalStorage()
        .getItem(controller.get('device_language_key'));
      controller
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSetting => {
          const tenantDefaultLanguage =
            tenantSetting &&
            tenantSetting.translation_setting &&
            tenantSetting.translation_setting.language
              ? tenantSetting.translation_setting.language
              : null;
          const applicationName =
            tenantSetting &&
            tenantSetting.ui_element_visibility_settings &&
            tenantSetting.ui_element_visibility_settings.application_name
              ? tenantSetting.ui_element_visibility_settings.application_name
              : null;
          if (applicationName) {
            document.title = applicationName;
          }
          //Prefer param over local set language, use case: coming from welcome page with language selection should set that language
          whichLocalSet = lang || tenantDefaultLanguage || whichLocalSet;
          this.setHTMLLang(whichLocalSet);

          controller
            .get('profileService')
            .loadScript(whichLocalSet)
            .then(response => {
              const defaultLang =
                whichLocalSet &&
                whichLocalSet !== 'null' &&
                whichLocalSet !== null
                  ? whichLocalSet
                  : defaultLanguage;
              controller.get('i18n').addTranslations(defaultLang, response);
              controller.setupDefaultLanguage(defaultLang);
              controller
                .getLocalStorage()
                .setItem(controller.get('device_language_key'), defaultLang);
            });
        });
    },

    /**
     * Setups the application default language
     * @param {lang}  // default language to use
     */
    setupDefaultLanguage: function(lang) {
      if (lang !== undefined) {
        this.set('i18n.locale', lang);
        if (lang === 'ar') {
          const rootElement = Ember.$(Env.rootElement);
          rootElement.addClass('changeDir');
          rootElement.removeClass('changeDirDefault');
        } else {
          const rootElement = Ember.$(Env.rootElement);
          rootElement.removeClass('changeDir');
          rootElement.addClass('changeDirDefault');
        }
      }
    },

    setLibraryVisibility() {
      const controller = this;
      const profile = controller.get('profile');
      controller
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          let showLibrary = true;
          if (
            profile &&
            profile.get('isStudent') &&
            tenantSettings &&
            tenantSettings.library_visibility
          ) {
            showLibrary =
              tenantSettings.library_visibility.hide_student_library_view !==
              true;
          }
          controller.set('showLibrary', showLibrary);
        });
    },

    /**
     * Decide  to show the consent based on the tenant settings
     */
    setAskConsentFromUser() {
      const controller = this;
      controller
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          controller.set(
            'askConsentFromUser',
            tenantSettings && tenantSettings.ask_consent_from_user === 'on'
          );
        });
    },

    /**
     * @function initalizeExternalTools
     * Method to initialize external tools to support the app
     */
    initalizeExternalTools() {
      const controller = this;
      // Initialize tool scripts
      if (!controller.get('session.data.authenticated.isAnonymous')) {
        controller
          .get('tenantService')
          .getActiveTenantSetting()
          .then(tenantSetting => {
            if (tenantSetting && tenantSetting.enable_serp_questions === 'on') {
              const tools = [SERP_TOOL_PATH];
              controller.toolScriptInitializer(tools);
            }
          });
      }
    },
    showhelpPullUp(helpInfo, helpInfoDescription) {
      const controller = this;
      controller.set('isShowHelpPullUp', true);
      controller.set('helpInfo', helpInfo);
      controller.set('helpInfoDescription', helpInfoDescription);
      if (helpInfoDescription) {
        const strings = ['docs.google.com', '.pdf'];
        const hasDocuments = strings.some(term =>
          helpInfoDescription.description.includes(term)
        );
        controller.set('hasDocument', hasDocuments);
      }
    },

    /**
     * @function toolScriptInitializer
     * @param {Array} libs
     * Method to initialize tool script/style
     */
    toolScriptInitializer(libs) {
      const controller = this;
      const version = new Date().getTime();
      libs.forEach(lib => {
        controller.injectScript(lib.JS, version);
        controller.injectStyle(lib.CSS, version);
      });
    },

    /**
     * @function injectScript
     * @param {String} toolScriptPath
     * @param {Number} version
     * @return {Object} scriptElement
     * Method to inject script into dom
     */
    injectScript(toolScriptPath, version) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `${window.location.origin + toolScriptPath}?v=${version}`;
      document.getElementsByTagName('head')[0].appendChild(script);
      return script;
    },

    /**
     * @function injectStyle
     * @param {String} toolStylePath
     * @param {Number} version
     * Method to inject style into dom
     */
    injectStyle(toolStylePath, version) {
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.type = 'text/css';
      style.media = 'screen';
      style.href = `${window.location.origin + toolStylePath}?v=${version}`;
      document.getElementsByTagName('head')[0].appendChild(style);
    },

    /**
     * @function initializeCastAndCatchAPI
     * Method to initialize cast and catch API
     */
    initializeCastAndCatchAPI() {
      const controller = this;
      // Initialize cast and catch event scripts
      controller
        .get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          if (
            tenantSettings &&
            tenantSettings.enable_cast_and_catch_api &&
            tenantSettings.enable_cast_and_catch_api === 'on'
          ) {
            const version = new Date().getTime();
            const script = controller.injectScript(
              CAST_AND_CATCH_SCRIPT_PATH,
              version
            );
            script.addEventListener('load', function() {
              if (window.triggerRelaunchCastEvent) {
                let data = {};
                controller
                  .get('castEventService')
                  .castEvent(CAST_EVENTS.LOGIN, data);
                window.triggerRelaunchCastEvent = false;
              }
              const siteTargetOrigin =
                tenantSettings.cast_and_catch_api_target_origin;
              if (siteTargetOrigin) {
                window.castAPI = window.eventCaster
                  .castAPI()
                  .init(siteTargetOrigin);
              }
            });
          }
        });
    }
  }
);
