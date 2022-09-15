import Ember from 'ember';
import SessionMixin from '../mixins/session';
import ModalMixin from '../mixins/modal';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import Env from 'gooru-web/config/environment';
import {
  appLocales,
  getNavigatorSwitchKey,
  isCompatibleVW
} from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { SCREEN_SIZES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 * Application header component
 * @see application.hbs
 *
 *
 * @module
 * @typedef {object} AppHeader
 */
export default Ember.Component.extend(
  SessionMixin,
  ModalMixin,
  ConfigurationMixin,
  UIHelperMixin,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    i18n: Ember.inject.service(),
    //themeChanger: Ember.inject.service(),

    session: Ember.inject.service(),
    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['gru-header', 'navbar-fixed-top'],

    classNameBindings: ['isDisableHeader:disabled'],

    device_language_key: 'deviceLanguage',

    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Service} tenant service
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    learningToolService: Ember.inject.service('api-sdk/learning-tools'),

    /**
     * Controls display of notification list, typical use from header is to hide it as required.
     */
    displayNotificationList: null,

    userStudentType: false,

    locales: Ember.computed('i18n.locale', 'i18n.locales', function() {
      let configLocales = this.get('configuration.LANGUAGE') || appLocales(); //this.get('i18n.locales');
      var arr = Ember.A();
      configLocales.map(function(loc) {
        arr.addObject({
          id: Object.keys(loc)[0],
          text: Object.values(loc)[0],
          isActive: Object.values(loc)[3]
        });
      });

      return arr;
    }),

    isShowNewVersion: Ember.computed(function() {
      let newVersion = this.get(
        'configuration.GRU_FEATURE_FLAG.isShowNewVersion'
      );
      return newVersion !== false;
    }),
    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),

    tagName: 'header',

    showDropMenu: false,

    isShowWhatsNew: false,

    showLanguage: false,

    isDisableHeader: Ember.computed('profile', function() {
      this.get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          if (
            tenantSettings &&
            tenantSettings.ui_element_visibility_settings &&
            tenantSettings.ui_element_visibility_settings
              .enable_navigator_programs
          ) {
            this.set('enableNavigatorPrograms', true);
          }
        });

      const enableNavigatorPrograms =
        this.get('enableNavigatorPrograms') ||
        this.get('isEnableNavigatorPrograms');

      return !!(
        enableNavigatorPrograms &&
        this.get('profile') &&
        this.get('profile.isStudent') &&
        !this.get('profile.info')
      );
    }),

    isTenantUserLogo: Ember.computed(function() {
      const controller = this;
      return this.get('tenantService')
        .getActiveTenantSetting()
        .then(tenantSettings => {
          if (
            tenantSettings &&
            tenantSettings.ui_element_visibility_settings &&
            tenantSettings.ui_element_visibility_settings.logo_url
          ) {
            controller.set(
              'tenantImageUrl',
              tenantSettings.ui_element_visibility_settings.logo_url
            );
          }
          return (
            tenantSettings &&
            tenantSettings.ui_element_visibility_settings &&
            tenantSettings.ui_element_visibility_settings.show_logo &&
            tenantSettings.ui_element_visibility_settings.show_logo === true
          );
        });
    }),

    showLearningTool: Ember.computed(
      'tenantSettings',
      'toolLength',
      function() {
        const controller = this;
        const tenantSetting = controller.get('tenantSettings');
        const toolList = controller.get('toolLength');
        if (
          tenantSetting &&
          tenantSetting.ui_element_visibility_settings &&
          tenantSetting.ui_element_visibility_settings.show_learning_tools &&
          toolList &&
          toolList.length > 0
        ) {
          return true;
        } else {
          return false;
        }
      }
    ),
    // -------------------------------------------------------------------------
    // Actions

    actions: {
      onOpenLearningTools() {
        this.passSourceDetailsNoteTool();
        this.toggleProperty('isShowLearningTool');
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_HEADER_LEARNING_TOOL
        );
      },

      logout: function() {
        window.localStorage.removeItem(
          `user_vid_config_${this.get('session.userId')}`
        );
        window.localStorage.removeItem(
          `user_zoom_vid_config_${this.get('session.userId')}`
        );
        if (window.localStorage.getItem('helpInfo')) {
          window.localStorage.removeItem('helpInfo');
        }
        window.localStorage.removeItem(
          getNavigatorSwitchKey(this.get('session.userId'))
        );
        window.localStorage.removeItem('sourceDetailsNavigator');
        window.localStorage.removeItem('groupByItem');
        this.sendAction('onLogout');
        // Trigger parse event
        this.get('parseEventService').postParseEvent(PARSE_EVENTS.LOGOUT);
        setTimeout(() => {
          window.localStorage.removeItem('parse_event_session');
        }, 2000);
      },

      showLocales() {
        Ember.$('.lang-dropdown').toggle();
      },

      setLocale(selVal) {
        this.set('showLanguage', false);
        this.getTranslationFile(selVal).then(() => {
          this.setLocale(selVal);
          this.setHTMLLang(selVal);
          this.getLocalStorage().setItem(this.device_language_key, selVal);
        });
      },

      navigateToSupport() {
        let component = this;
        let supportUrl = component.get('supportSiteUrl');
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.NAVIGATE_SUPPORT_PAGE);
        window.open(supportUrl, '_blank');
      },

      navigateToMarketSite() {
        let component = this;
        let marketUrl = component.get('marketingSiteUrl');
        window.open(marketUrl, '_self');
      },

      navigateToHome() {
        let component = this;
        let routeName = 'student-home';
        if (component.get('profile.isTeacher')) {
          routeName = 'teacher-home';
        }
        component.get('router').transitionTo(routeName);
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_GOORU_LOGO_NAVIGATE_HOME_PAGE);
      },

      navigateToResearchApp: function() {
        let researcher = EndPointsConfig.getResearcher();
        if (researcher && researcher.redirectURL) {
          let url = `${researcher.redirectURL}/?access_token=${this.get(
            'session.token-api3'
          )}`;
          window.open(url, '_self');
        }
      },
      closeNotificationList() {
        this.set('displayNotificationList', false);
      },
      openPullUp() {
        this.set('displayNotificationList', true);
      },
      openAppUSer(navigateUrl) {
        let url = `${navigateUrl}?access_token=${this.get(
          'session.token-api3'
        )}`;
        window.open(url, '_blank');
      },
      navigation: function(routeName) {
        this.get('router').transitionTo(routeName);
        let parseEvent;
        if (routeName === 'library') {
          parseEvent = PARSE_EVENTS.LIBRARY;
        }
        if (routeName === 'student-home') {
          parseEvent = PARSE_EVENTS.MYSTUDY;
        }
        if (routeName === 'teacher-home') {
          parseEvent = PARSE_EVENTS.CLASSROOM;
        }
        // Trigger parse event
        this.get('parseEventService').postParseEvent(parseEvent);
      },

      switchLearner() {
        this.swithToNavigator();
      },
      porfileContainer(parentClass, currentClass) {
        if ($(`.${parentClass} .${currentClass}`).hasClass('open')) {
          $(`.${parentClass} .${currentClass}`).removeClass('open');
        } else {
          $(`.${parentClass} .${currentClass}`).addClass('open');
        }
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.NAVIGATE_PROFILE
        );
      },

      takeTour() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_TAKE_TOUR
        );
        $('.tour-student-home .gru-tour button').click();
      },

      openLangPullUp() {
        this.set('showLanguage', true);
        Ember.run.later(function() {
          $('.menu-navbar .profile-dropdown').addClass('open');
          $('.open-side-menu').addClass('open');
        });
      },

      closeLangPullUp() {
        this.set('showLanguage', false);
        $('.menu-navbar .profile-dropdown').removeClass('open');
        $('.open-side-menu').removeClass('open');
      },

      updateWhatsNewState() {
        const controller = this;
        controller.get('profileService').updateWhatsNewStatus(Env.appId, true);
        let currntUser = controller.get('session');
        let userId = currntUser.get('userId');
        controller.setVersionStatus(userId, false);
      }
    },

    // -------------------------------------------------------------------------
    // Events

    didInsertElement: function() {
      const controller = this;
      if (
        !controller.get('session.isAnonymous') &&
        controller.get('session.token-api3')
      ) {
        controller.getlearningToolProperties();
      }
      if (EndPointsConfig.getLanguageSettingdropMenu() !== undefined) {
        this.set('showDropMenu', EndPointsConfig.getLanguageSettingdropMenu());
      }
      this.get('profileService')
        .appUser()
        .then(response => {
          controller.set('appUser', response);
        });
      this.set('appId', Env.appId);
      $(window).on('resize', this.handleResize.bind(this));
      Ember.run.later(function() {
        controller.getWhatsNewState();
      }, 3000);

      const { getOwner } = Ember;
      let routerObserver = getOwner(this).lookup('controller:application');
      const setRouterLoader = currentPath => {
        let userId = controller.get('session.userId');
        const enableNavigatorPrograms = controller.get(
          'enableNavigatorPrograms'
        );

        if (currentPath === 'student-home' || currentPath === 'teacher-home') {
          controller
            .get('profileService')
            .readUserProfile(userId)
            .then(function(updatedProfile) {
              if (
                enableNavigatorPrograms &&
                updatedProfile &&
                updatedProfile.role === 'student' &&
                !updatedProfile.info
              ) {
                controller.set('isDisableHeader', true);
              } else {
                controller.set('isDisableHeader', false);
              }
            });
        }
      };

      routerObserver.addObserver('currentRouteName', function() {
        let currentPath = routerObserver.currentPath;
        setRouterLoader(currentPath);
      });
    },

    getWhatsNewState() {
      const controller = this;
      let currntUser = controller.get('session');
      let userId = currntUser.get('userId');
      if (userId && userId !== 'anonymous') {
        let status = controller.getVersionStatus(userId);
        if (status === undefined || status === null) {
          this.get('profileService')
            .getWhatsNewStatus(Env.appId)
            .then(response => {
              if (
                response.length === 0 ||
                (response.userAppState &&
                  response.userAppState.is_whats_new_visited === false)
              ) {
                controller.set('isShowWhatsNew', true);
                controller.setVersionStatus(userId, true);
              } else {
                controller.set('isShowWhatsNew', false);
                controller.setVersionStatus(userId, false);
              }
            });
        } else {
          controller.set('isShowWhatsNew', status);
        }
      }
    },

    didRender() {
      const controller = this;
      let currntUser = controller.get('session');
      if (currntUser.get('role') === 'student') {
        controller.set('userStudentType', true);
      } else {
        controller.set('userStudentType', false);
      }
    },

    /**
     * willDestroyElement event
     */
    willDestroyElement: function() {
      this.set('searchErrorMessage', null);
    },

    getTranslationFile(whichLocalSet) {
      const component = this;
      return component
        .get('profileService')
        .loadScript(whichLocalSet)
        .then(response => {
          component.get('i18n').addTranslations(whichLocalSet, response);
          return Ember.RSVP.resolve(true);
        });
    },

    /**
     * setLocale function
     */
    setLocale(selVal) {
      this.set('i18n.locale', selVal);
      if (selVal === 'ar') {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.addClass('changeDir');
        rootElement.removeClass('changeDirDefault');
        //this.get('themeChanger').set('theme', 'goorurtl');
        Env.APP.isRTL = true;
      } else {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.removeClass('changeDir');
        rootElement.addClass('changeDirDefault');
        //this.get('themeChanger').set('theme', 'goorultr');
        Env.APP.isRTL = false;
      }
      this.get('parseEventService').postParseEvent(PARSE_EVENTS.SELET_LANGUAGE);
    },

    getLocalStorage: function() {
      return window.localStorage;
    },

    /**
     * @function swithToNavigator Help to swtich between student and teacher accounts
     */
    swithToNavigator() {
      let userId = this.get('session.userId');
      let isStudent = !this.get('isSwitchAccount');
      this.set('session.role', isStudent ? 'student' : 'teacher');
      window.localStorage.setItem(getNavigatorSwitchKey(userId), isStudent);
      window.location.href = `${window.location.origin}/${
        isStudent ? 'student-home' : 'teacher-home'
      }`;
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Boolean}
     * Property to store given screen value is compatible
     */
    isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM - 1),

    /**
     * @property {?string} action to send up when a user logs out
     */
    onLogout: null,

    /**
     * @property {?string} action to send up when searching for a term
     */
    onSearch: null,

    /**
     * @property {Array} list of classes related to current user
     */
    classes: null,

    /**
     * @property {Array} list of active classes related to current user
     */
    activeClasses: Ember.computed('classes', function() {
      var classes = this.get('classes');
      return classes
        ? classes.filter(function(theClass) {
          return !theClass.get('isArchived');
        })
        : null;
    }),

    // -------------------------------------------------------------------------
    // Observers

    /**
     * Marketing site url
     * @property {string}
     */
    marketingSiteUrl: Ember.computed(function() {
      return Env.marketingSiteUrl;
    }),

    /**
     * Support site url
     * @property {string}
     */
    supportSiteUrl: Ember.computed(function() {
      return Env.supportSiteUrl;
    }),

    /**
     * @property isTenantUrl
     * Property to check whether accessing gooru's internal tenant
     * Tenant token appended to the URL with query param of 'nonce'
     */
    isTenantUrl: Ember.computed(function() {
      const queryParamsString = window.location.search;
      return queryParamsString.includes('nonce');
    }),

    isAppUserValid: Ember.computed(
      'session.role',
      'isSwitchAccount',
      function() {
        return (
          (this.get('session.role') === 'teacher' ||
            this.get('isSwitchAccount')) &&
          this.get('configuration.GRU_FEATURE_FLAG.isShowAppSwitcher')
        );
      }
    ),

    /**
     * @property {boolean} isSwitchAccount help to identify is switched from teacher account
     */
    isSwitchAccount: Ember.computed('session.role', function() {
      return (
        window.localStorage.getItem(
          getNavigatorSwitchKey(this.get('session.userId'))
        ) === 'true'
      );
    }),

    isShowWhatsNewTab: Ember.observer('session.role', function() {
      this.getWhatsNewState();
    }),

    getToolListProperty: Ember.observer('session.role', function() {
      if (!this.get('session.isAnonymous') && this.get('session.token-api3')) {
        this.getlearningToolProperties();
      }
    }),

    getlearningToolProperties() {
      const controller = this;
      Ember.RSVP.hash({
        tenantSettings: Ember.RSVP.resolve(
          controller.get('tenantService').getActiveTenantSetting()
        ),
        toolLength: Ember.RSVP.resolve(
          controller.get('learningToolService').fetchLearningTool()
        )
      }).then(({ tenantSettings, toolLength }) => {
        controller.set('tenantSettings', tenantSettings);
        controller.set('toolLength', toolLength);
        let currntUser = controller.get('session');
        let userId = currntUser.get('userId');
        controller.setToolLength(userId, controller.get('toolLength'));
      });
    },

    /**
     * @function handleResize
     * Method to handle screen resize events
     */
    handleResize() {
      let curDeviceVW =
        window.innerHeight > window.innerWidth
          ? window.screen.width
          : window.screen.height;
      if (curDeviceVW <= 991) {
        this.set('isMobileView', true);
      } else {
        this.set('isMobileView', false);
      }
    },

    passSourceDetailsNoteTool() {
      window.sourceDetailsNoteTool = {};
    }
  }
);
