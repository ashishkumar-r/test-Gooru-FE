import Ember from 'ember';
import { isNumeric } from 'gooru-web/utils/math';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import Env from 'gooru-web/config/environment';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { appLocales, getNavigatorSwitchKey } from 'gooru-web/utils/utils';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Component.extend(
  TenantSettingsMixin,
  ConfigurationMixin,
  UIHelperMixin,
  {
    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['gru-student-navbar'],

    // -------------------------------------------------------------------------
    // Dependencies

    session: Ember.inject.service('session'),

    i18n: Ember.inject.service(),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    profileService: Ember.inject.service('api-sdk/profile'),
    // -------------------------------------------------------------------------
    // Properties

    /**
     * Controls display of notification list, typical use from header is to hide it as required.
     */
    displayNotificationList: null,

    isDisableNavbar: false,
    // -------------------------------------------------------------------------
    // Actions

    actions: {
      porfileContainer(parentClass, currentClass) {
        if ($(`.${parentClass} .${currentClass}`).hasClass('open')) {
          $(`.${parentClass} .${currentClass}`).removeClass('open');
        } else {
          $(`.${parentClass} .${currentClass}`).addClass('open');
        }
      },
      navigateToSupport(container) {
        let component = this;
        let contentType;
        if (container === 'support') {
          contentType = PARSE_EVENTS.NAVIGATE_SUPPORT_PAGE;
          let supportUrl = component.get('supportSiteUrl');
          window.open(supportUrl, '_blank');
        }
        if (container === 'home') {
          contentType = PARSE_EVENTS.NAVIGATE_HOME_PAGE;
          component.get('router').transitionTo('student-home');
        }
        if (container === 'profile') {
          contentType = PARSE_EVENTS.NAVIGATE_PROFILE;
          component
            .get('router')
            .transitionTo(
              'profile.about',
              this.get('session.userData.gooruUId')
            );
        }
        component.get('parseEventService').postParseEvent(contentType);
      },
      onOpenLearningTools() {
        this.toggleProperty('isShowLearningTool');
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_DASHBOARD_LEARNING_TOOL
        );
        this.passSourceDetailsNoteTool();
      },
      closeLangPullUp() {
        this.set('showLanguage', false);
        $('.nav-menu-item-list .profile-dropdown .dropdown-menu').removeClass(
          'open'
        );
        $('.open-side-menu').removeClass('open');
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
        this.get('router').set('profile', null);
        this.get('parseEventService').postParseEvent(PARSE_EVENTS.LOGOUT);
        setTimeout(() => {
          window.localStorage.removeItem('parse_event_session');
        }, 2000);
        this.get('router').transitionTo('logout');
      },

      openLangPullUp() {
        this.set('showLanguage', true);
        Ember.run.later(function() {
          $('.additional-notification-section .profile-dropdown').addClass(
            'open'
          );
          $('.open-side-menu').addClass('open');
        });
      },
      setLocale(selVal) {
        this.set('showLanguage', false);
        this.getTranslationFile(selVal).then(() => {
          this.setLocale(selVal);
          this.setHTMLLang(selVal);
          this.getLocalStorage().setItem(this.device_language_key, selVal);
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.SELET_LANGUAGE
          );
        });
      },

      /**
       *
       * Triggered when an suggestion icon is clicked
       */
      toogleSuggestionContainer() {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_NAVBAR_SUGGESTION);
        component.toggleProperty('showSuggestionContainer');
      },
      /**
       *
       * Triggered when an menu item is selected
       * @param item
       */
      selectItem: function(item) {
        let component = this;
        let parseValue, context;
        component.set('showSuggestionContainer', false);
        if (component.get('onItemSelected')) {
          component.selectItem(item);
          if (item === 'class-info') {
            Ember.$('.classroom-information').toggle(
              {
                direction: 'left'
              },
              1000
            );
            parseValue = PARSE_EVENTS.NAVBAR_CLASS_INFO;
            context = {
              classId: this.get('class.id'),
              courseId: this.get('courseId'),
              gradeLevel: this.get('class.grade')
            };
          } else {
            component.sendAction('onItemSelected', item);
          }
          // Trigger parse event
          if (item === 'class-activities') {
            parseValue = PARSE_EVENTS.NAVBAR_CLASS_ACTIVITY;
            context = {
              classId: this.get('class.id'),
              courseId: this.get('courseId'),
              gradeLevel: this.get('class.grade')
            };
          }
          if (item === 'dashboard') {
            parseValue = PARSE_EVENTS.NAVBAR_DASHBOARD;
          }
          if (item === 'course-map') {
            parseValue = PARSE_EVENTS.NAVBAR_LEARNING_JOURNEY;
          }
          if (item === 'profile-prof') {
            parseValue = PARSE_EVENTS.NAVBAR_MY_PROFICIENCY;
          }
          this.get('parseEventService').postParseEvent(parseValue, context);
        }
      },

      /**
       * Triggered when a menu item is selected. Set the class icon for the item selected showing in the mobiles dropdown menu.
       */
      toggleHeader: function() {
        this.set('toggleState', !this.get('toggleState'));
        if (this.onCollapseExpandClicked) {
          this.sendAction('onCollapseExpandClicked', this.get('toggleState'));
        }
      },

      /**
       * Action triggered when click brand logo
       */
      onCloseStudyClassPlayer() {
        Ember.$('body')
          .removeClass('fullscreen')
          .removeClass('fullscreen-exit');
        this.handlePlayerNavigation();
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.BACK_CLASS_NAVBAR_TO_HOME
        );
      },

      /**
       * Trigger the event to open student course report
       */
      openCourseReport() {
        this.sendAction('openCourseReport');
      },

      closeNotificationList() {
        this.set('displayNotificationList', false);
      },

      //Action triggered when open student CA report
      onOpenCAReport() {
        this.sendAction('onOpenCAReport');
      }
    },

    // -------------------------------------------------------------------------
    // Events

    /**
     * DidInsertElement ember event
     */
    didInsertElement: function() {
      this._super(...arguments);
      let component = this;
      const { getOwner } = Ember;
      let routerObserver = getOwner(this).lookup('controller:application');
      let currentPath = routerObserver.currentPath;
      const setRouterLoader = currentPath => {
        if (currentPath === 'student.class.profile') {
          component.set('selectedMenuItem', 'profile');
        } else if (currentPath === 'student.class.course-map') {
          component.set('selectedMenuItem', 'course-map');
        } else if (currentPath === 'student.class.class-activities') {
          component.set('selectedMenuItem', 'class-activities');
        } else if (
          currentPath === 'student.class.student-learner-proficiency'
        ) {
          component.set('selectedMenuItem', 'profile-prof');
        } else if (currentPath === 'student.class.dashboard') {
          component.set('selectedMenuItem', 'dashboard');
        }
      };
      routerObserver.addObserver('currentRouteName', function() {
        if (
          component.get('selectedMenuItem') &&
          !component.get('selectedMenuItem').isDestroyed
        ) {
          setRouterLoader(routerObserver.currentPath);
        }
      });
      setRouterLoader(currentPath);

      var item = component.get('selectedMenuItem');
      component.selectItem(item);

      if (component.get('isStudyPlayer')) {
        Ember.$('body').removeClass('fullscreen-exit');
        if (component.get('isFullScreen')) {
          Ember.$('body').addClass('fullscreen');
        }
      } else {
        Ember.$('body').addClass('fullscreen-exit');
      }
      if (EndPointsConfig.getLanguageSettingdropMenu() !== undefined) {
        this.set('showDropMenu', EndPointsConfig.getLanguageSettingdropMenu());
      }
    },
    willDestroyElement() {
      this._super(...arguments);
      this.set('selectedMenuItem', null);
      Ember.$('body')
        .removeClass('fullscreen')
        .removeClass('fullscreen-exit');
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
    setLocale(selVal) {
      this.set('i18n.locale', selVal);
      if (selVal === 'ar') {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.addClass('changeDir');
        rootElement.removeClass('changeDirDefault');
        Env.APP.isRTL = true;
      } else {
        const rootElement = Ember.$(Env.rootElement);
        rootElement.removeClass('changeDir');
        rootElement.addClass('changeDirDefault');
        Env.APP.isRTL = false;
      }
    },
    getLocalStorage: function() {
      return window.localStorage;
    },
    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {String|Function} onItemSelected - event handler for when an menu item is selected
     */
    onItemSelected: null,

    /**
     * @property {String} selectedMenuItem - menu Item selected
     */
    selectedMenuItem: null,

    /**
     * @property {boolean|Function} onCollapseExpandClicked - event handler for when the toggle button is clicked
     */
    onCollapseExpandClicked: null,

    /**
     * @property {boolean} toggleState - indicates the toggle button state, false means open, true means closed
     */
    toggleState: false,

    sourceType: null,

    /**
     * Maintains  the state of class info icon display or not.
     * @type {Boolean}
     */
    hasClassInfo: null,

    /**
     * It has the value of title to be display.
     * @type {String}
     */
    navTitle: null,

    /**
     * Maintains  the state of IL activity  or not.
     * @type {Boolean}
     */
    ILActivity: null,

    /**
     * @property {Boolean}
     */
    isPublicClass: Ember.computed.alias('class.isPublic'),

    showDropMenu: false,

    showLanguage: false,

    /**
     * Computed property to identify it's IL or not.
     * @return {Boolean}
     */
    isILActivity: Ember.computed('sourceType', function() {
      let sourceType = this.get('sourceType');
      let ILActivity = this.get('ILActivity');
      return sourceType === 'ILActivity' || ILActivity;
    }),

    /**
     * @property {Boolean} isCourseMapped
     */
    isCourseMapped: Ember.computed('class', 'isILActivity', function() {
      let component = this;
      let classData = component.get('class');
      let isILActivity = component.get('isILActivity');
      return isILActivity || (classData && classData.get('courseId'));
    }),

    /**
     * @property {Boolean}
     * Computed property  to identify class CM is started or not
     */
    hasCMStarted: Ember.computed('cmPerformanceSummary', function() {
      const scorePercentage = this.get('cmPerformanceSummary.score');
      return scorePercentage !== null && isNumeric(scorePercentage);
    }),

    /**
     * Compute the performance summary data based on performance from IL or class.
     * @return {Object}
     */
    cmPerformanceSummary: Ember.computed(
      'class.performanceSummary',
      'performanceSummary',
      function() {
        return (
          this.get('class.performanceSummary') || this.get('performanceSummary')
        );
      }
    ),

    /**
     * Compute the performance summary data  class CA.
     * @return {Object}
     */
    caPerformanceSummary: Ember.computed(
      'class.performanceSummaryForDCA',
      'performanceSummaryForDCA',
      function() {
        return (
          this.get('class.performanceSummaryForDCA') ||
          this.get('performanceSummaryForDCA')
        );
      }
    ),

    /**
     * Compute the competency completion status.
     * @return {Object}
     */
    competencyCompletionStats: Ember.computed(
      'class.competencyStats',
      'competencyStats',
      function() {
        return this.get('class.competencyStats') || this.get('competencyStats');
      }
    ),

    /**
     * @property {Boolean}
     * Computed property  to identify class CA is started or not
     */
    hasCAStarted: Ember.computed('caPerformanceSummary', function() {
      const scorePercentage = this.get(
        'caPerformanceSummary.scoreInPercentage'
      );
      return scorePercentage !== null && isNumeric(scorePercentage);
    }),

    /**
     * The class is premium or not
     * @property {Boolean}
     */
    isPremiumClass: Ember.computed('class', function() {
      let controller = this;
      const currentClass = controller.get('class');
      let setting = currentClass ? currentClass.get('setting') : null;
      return setting ? setting['course.premium'] : false;
    }),

    isShowImpersonate: Ember.computed(function() {
      let impersonate;
      if (window.frameElement) {
        impersonate = window.parent.impersonate;
      }
      return impersonate;
    }),
    supportSiteUrl: Ember.computed(function() {
      return Env.supportSiteUrl;
    }),
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
    // -------------------------------------------------------------------------
    // Observers

    /**
     * Refreshes the left navigation with the selected menu item
     */
    refreshSelectedMenuItem: function() {
      var item = this.get('selectedMenuItem');
      this.selectItem(item);
    }.observes('selectedMenuItem'),

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Triggered when a menu item is selected. Set the class icon for the item selected showing in the mobiles dropdown menu.
     * @param {string} item
     */
    selectItem: function(selection) {
      if (selection) {
        let item = selection;
        let itemElement = `.${item}`;
        if (item === 'class-info') {
          this.$(itemElement).removeClass('vactive');
          return false;
        } else {
          this.$('.tab').removeClass('vactive');
          this.$(itemElement).addClass('vactive');
        }
      }
      if (selection === 'class-activities' && !this.get('hasCMStarted')) {
        this.$('.course-map').addClass('enable');
      } else {
        this.$('.course-map').removeClass('enable');
      }
    },

    /**
     * Handle Study  player navigation.
     */
    handlePlayerNavigation() {
      let backUrl = this.get('backUrl');
      if (backUrl) {
        window.location.replace(backUrl);
      } else {
        let isStudyPlayer = this.get('isStudyPlayer');
        let classId = this.get('classId');
        let courseId = this.get('courseId');
        let isILActivity = this.get('isILActivity');
        let route = this.get('router');
        if (isStudyPlayer) {
          if (isILActivity) {
            route.transitionTo('student.independent.course-map', courseId);
          } else {
            route.transitionTo('student.class.course-map', classId);
          }
        } else {
          if (isILActivity) {
            route.transitionTo('student-independent-learning');
          } else {
            route.transitionTo('student-home', {
              queryParams: {
                refresh: true
              }
            });
          }
        }
      }
    },
    passSourceDetailsNoteTool() {
      window.sourceDetailsNoteTool = {};
      const classData = this.get('class');
      const sourceDetails = {
        class_id: this.get('classId'),
        course_id: classData.courseId
      };
      if (classData.currentLocation) {
        if (classData.currentLocation.collectionId) {
          sourceDetails.collection_id = classData.currentLocation.collectionId;
        }
        if (classData.currentLocation.lessonId) {
          sourceDetails.lesson_id = classData.currentLocation.lessonId;
        }
        if (classData.currentLocation.unitId) {
          sourceDetails.unit_id = classData.currentLocation.unitId;
        }
      }
      window.sourceDetailsNoteTool = sourceDetails;
    }
  }
);
