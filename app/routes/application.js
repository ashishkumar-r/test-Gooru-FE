import Ember from 'ember';
import GruTheme from '../utils/gru-theme';
import Env from '../config/environment';
import PublicRouteMixin from 'gooru-web/mixins/public-route-mixin';
import GooruLegacyUrl from 'gooru-web/utils/gooru-legacy-url';
import Error from 'gooru-web/models/error';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import AccessibilitySettingsMixin from 'gooru-web/mixins/accessibility-settings-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

/**
 * @typedef {object} ApplicationRoute
 */
export default Ember.Route.extend(
  PublicRouteMixin,
  ConfigurationMixin,
  AccessibilitySettingsMixin,
  UIHelperMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    i18n: Ember.inject.service(),

    //i18nLoader: Ember.inject.service('i18n-loader'),

    /**
     * @type {ClassService} Service to retrieve user information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * Authentication (api-sdk/session) service.
     * @property authService
     * @readOnly
     */
    authService: Ember.inject.service('api-sdk/session'),

    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @type {SessionService} Service to retrieve session information
     */
    session: Ember.inject.service(),

    /**
     * @requires service:notifications
     */
    notifications: Ember.inject.service(),

    /**
     * @requires service:api-sdk/log
     */
    errorService: Ember.inject.service('api-sdk/error'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    /**
     * @property {TenantService}
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    // -------------------------------------------------------------------------
    // Methods

    setupGlobalErrorHandling: Ember.on('init', function() {
      const route = this;

      // Ultimately all server and javascript errors will be caught by this handler
      Ember.onerror = function(error) {
        if (error.status && error.status !== 401 && error.status !== 403) {
          const errorMessage = route.get('i18n').t('common.unexpectedError')
            .string;
          route.get('notifications').error(errorMessage);
        }
        if (error.status !== 401 && error.status !== 403) {
          route.trackAppError(error);
        }
        const isTesting = Env.environment === 'test';
        if (isTesting) {
          throw error; //throws the error so tests fail
        }
      };

      Ember.$(document).ajaxError(function(event, jqXHR, settings) {
        if (
          jqXHR.status !== 401 &&
          !route.isGetCollectionWithRefreshRequest(settings)
        ) {
          if (jqXHR.readyState === 0 && jqXHR.status === 0) {
            const networkErrorMessage = route
              .get('i18n')
              .t('common.networkError');
            route.get('notifications').warning(networkErrorMessage);
          } else {
            route.trackEndPointError(event, jqXHR, settings);
          }
        }
      });
    }),

    beforeModel: function(transition) {
      const route = this;
      route.addRemoveEventFocus();
      // Below logic is used to clear the left over state of study player,
      // in order to avoid the conflict.

      let navigateMapService = route.get('navigateMapService');
      const tenantService = route.get('tenantService');

      //Removed stored mastered competencies to avoid conflict in proficiency chart rendering
      navigateMapService
        .getLocalStorage()
        .removeItem(navigateMapService.getMasteredCompetenciesKey());

      let accessToken = transition.queryParams.access_token;
      if (Env.embedded) {
        return this.beforeModelEmbeddedApplication();
      }
      if (accessToken) {
        // this is for google sign in
        tenantService.removeStoredTenantSetting();
        return this.get('sessionService').signInWithToken(accessToken);
      }
      this.setAccessibilitySettingsFromLocal();
    },

    model: function(params) {
      const route = this;
      const currentSession = route.get('session.data.authenticated');
      const themeId = params.themeId || Env.themes.default;
      const lang = params.lang;

      let myClasses = null;
      var profilePromise = null;

      if (!currentSession.isAnonymous) {
        profilePromise = route
          .get('profileService')
          .readUserProfile(route.get('session.userId'));
        myClasses = profilePromise.then(function(userProfile) {
          return route.get('classService').findMyClasses(userProfile);
        });
      }
      route.controllerFor('application').loadTranslationLabels(lang);
      route.setupTheme(themeId);
      return Ember.RSVP.hash({
        currentSession: currentSession,
        myClasses: myClasses,
        profile: profilePromise
      });
    },

    afterModel: function() {
      const route = this;
      if (Env.embedded) {
        return route.afterModelEmbeddedApplication();
      } else {
        return route.handleLegacyUrlIfNecessary();
      }
    },

    setupController: function(controller, model) {
      if (EndPointsConfig.getUserAlertMessage() !== null) {
        controller.set('userAlert', EndPointsConfig.getUserAlertMessage());
      }
      this.alertWhenStudyIsInProgress();
      controller.initalizeExternalTools();
      controller.initializeCastAndCatchAPI();
      controller.set('showLibrary', true);

      if (model.myClasses) {
        controller.set('myClasses', model.myClasses);
      }

      if (model.profile) {
        controller.set('profile', model.profile);
        controller.set(
          'profile.isStudent',
          controller.get('session.role') === 'student'
        );
        controller.set(
          'profile.isTeacher',
          controller.get('session.role') === 'teacher'
        );
        controller.setLibraryVisibility();
      }
      let pathname = window.location.pathname;
      let query = window.location.search;
      if (
        this.get('session.isAnonymous') &&
        query.indexOf('access_token') < 0 &&
        pathname !== '/logout'
      ) {
        this.handleRedirectionBasedOnDomain(controller);
      } else {
        controller.set('isRedirectionDomainDone', true);
      }
    },

    getLocalStorage: function() {
      return window.localStorage;
    },

    /**
     * Setups the application theme
     * @param {GruTheme} theme
     */
    setupTheme: function(themeId) {
      const route = this;
      themeId = route.get('configuration.themeId')
        ? route.get('configuration.themeId')
        : themeId;
      if (themeId) {
        const theme = GruTheme.create({
          id: themeId
        });
        route.setupThemeStyles(theme);
      }
    },

    /**
     * Sets the theme styles if available
     * @param {GruTheme} theme
     */
    setupThemeStyles: function(theme) {
      //setting theme id at html tag
      Ember.$(Env.rootElement).addClass(`${theme.get('id')}-theme`);
      //adding theme styles to head tag
      const appRootPath = this.get('configuration.appRootPath');
      const cssUrl = theme.get('cssUrl');
      const themeCssUrl = `${appRootPath}${cssUrl}`;
      if (themeCssUrl) {
        Ember.$('head').append(
          `<link id="theme-style-link" rel="stylesheet" type="text/css" href="${themeCssUrl}">`
        );
      }
    },

    /**
     * Handles a url when necessary
     */
    handleLegacyUrlIfNecessary: function() {
      const route = this;
      const legacyUrl = GooruLegacyUrl.create({
        url: route.get('router.url')
      });

      if (legacyUrl.get('isLegacyUrl')) {
        //checking for a legacy legacyUrl
        const routeParams = legacyUrl.get('routeParams');
        if (routeParams) {
          route.transitionTo.apply(route, routeParams);
        }
      }
    },

    /**
     * Tracks end point errors
     * @param event
     * @param jqXHR
     * @param settings
     */
    trackEndPointError: function(event, jqXHR, settings) {
      const route = this;

      // do not track errors at the user-error api, this to prevent a loop
      const isUserError =
        settings.url.indexOf('api/nucleus-utils/v1/user-error') >= 0;
      const isTenantError = settings.url.indexOf('tenant.json') >= 0;
      if (isUserError || isTenantError) {
        return;
      }

      const targetElement =
        event.currentTarget && event.currentTarget.activeElement
          ? event.currentTarget.activeElement
          : false;
      const model = Error.create({
        type: 'url',
        timestamp: new Date().getTime(),
        userId: route.get('session.isAnonymous')
          ? 'anonymous'
          : route.get('session.userId'),
        details: {
          route: route.get('router.url'),
          userAgent: navigator.userAgent,
          'element-selector': targetElement ? targetElement.className : null,
          endpoint: {
            url: settings.url,
            response: jqXHR.responseText,
            status: jqXHR.status,
            headers: settings.headers,
            responseHeaders: jqXHR.getAllResponseHeaders(),
            method: settings.type,
            data: settings.data
          }
        },
        description: 'Endpoint error'
      });
      route.get('errorService').createError(model);
    },

    /**
     * Tracks application/js errors
     * @param error
     */
    trackAppError: function(error) {
      const route = this;

      // do not track errors at the user-error api, this to prevent a loop
      if (
        error.responseText &&
        error.responseText.indexOf('api/nucleus-utils/v1/user-error') >= 0
      ) {
        return;
      }

      const model = Error.create({
        type: 'page',
        timestamp: new Date().getTime(),
        userId: route.get('session.isAnonymous')
          ? 'anonymous'
          : route.get('session.userId'),
        details: {
          route: route.get('router.url'),
          userAgent: navigator.userAgent,
          stack: error.stack
        },
        description: JSON.stringify(error)
      });

      const isTesting = Env.environment === 'test';
      if (!isTesting) {
        Ember.Logger.error(error.stack);
        route.get('errorService').createError(model);
      }
    },

    deactivate: function() {
      Ember.$(document).off('ajaxError');
    },

    /**
     * Handle the logic for the embedded application
     * @returns {Promise.<TResult>}
     */
    beforeModelEmbeddedApplication: function() {
      const route = this;
      const token = Env.APP.awProps.token;
      const configurationService = route.get('configurationService');

      //load embedded properties
      Env.APP.awProps.embedded = true;
      configurationService.merge(Env.APP.awProps);

      const authService = route.get('authService');
      const authPromise = token
        ? authService.signInWithToken(token)
        : authService.get('session').authenticateAsAnonymous();

      return authPromise;
    },

    /**
     * Handle the embedded application transition
     * @returns {Promise.<TResult>}
     */
    afterModelEmbeddedApplication: function() {
      const route = this;
      const transition = route.get('configuration.transition');
      const routeName = 'sign-in';
      if (transition) {
        route.transitionTo.apply(route, transition);
      } else {
        route.transitionTo(routeName);
      }
    },

    isGetCollectionWithRefreshRequest: function(settings) {
      let pattern = /\/quizzes\/api\/v1\/collections\/(.*)&refresh=true/;
      return settings.type === 'GET' && settings.url.match(pattern);
    },

    /**
     * Verfiy the domain have any directions before model get execute.
     */
    handleRedirectionBasedOnDomain: function(controller) {
      const endpoint = this.get('redirectEndpoint') || window.location.href;
      const domainURL = new URL(endpoint);
      let domain = domainURL.hostname;
      let redirectURL = endpoint;
      this.get('authenticationService')
        .domainBasedRedirection(domain, redirectURL)
        .then(function(data) {
          if (data && data.statusCode === 303) {
            window.location.href = data.redirectUrl;
          } else {
            controller.set('isRedirectionDomainDone', true);
          }
        });
    },

    alertWhenStudyIsInProgress() {
      window.onbeforeunload = function() {
        const iframePlayerContainer = document.getElementById('iframe-player');
        if (
          (iframePlayerContainer &&
            iframePlayerContainer.contentWindow.lastPlayedResource) ||
          window.lastPlayedResource
        ) {
          return '';
        } else {
          window.onbeforeunload = null;
        }
      };
    },

    addRemoveEventFocus() {
      document.addEventListener('mousedown', () => {
        document.body.classList.add('remove-focus');
      });
      document.addEventListener('keydown', () => {
        document.body.classList.remove('remove-focus');
      });
    },

    // -------------------------------------------------------------------------
    // Actions - only transition actions should be placed at the route
    actions: {
      /**
       * Action triggered when submitting the login form
       * @see application.hbs
       * @see gru-header.hbs
       */
      signIn: function() {
        let queryParams;
        if (typeof URLSearchParams == 'function') {
          queryParams = new URLSearchParams(window.location.search);
        }
        const route = this;
        if (queryParams && queryParams.has('redirectURL')) {
          window.location.replace(queryParams.get('redirectURL'));
        } else {
          route.actions.updateUserClasses.call(this).then(
            // Required to get list of classes after login
            function() {
              route.transitionTo('index');
            }
          );
        }
      },

      /**
       * Action triggered when login out
       */
      logout: function() {
        this.get('controller').set('profile', null);
        this.transitionTo('logout');
      },

      onCloseAlert: function() {
        const route = this;
        route.get('controller').set('userAlert', null);
      },

      /**
       * Gets a refreshed list of user classes
       * @see create.js
       * @see join.js
       */
      updateUserClasses: function() {
        const route = this;
        return route.get('controller').loadUserClasses();
      }
    }
  }
);
