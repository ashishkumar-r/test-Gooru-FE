import Ember from 'ember';
import Env from '../config/environment';
import PublicRouteMixin from 'gooru-web/mixins/public-route-mixin';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * @typedef {object} Index Route
 */
export default Ember.Route.extend(PublicRouteMixin, ConfigurationMixin, {
  session: Ember.inject.service(),

  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  tenantService: Ember.inject.service('api-sdk/tenant'),
  queryParams: {
    access_token: {}
  },

  /**
   * property used to store redirect url
   */
  redirectUrl: null,

  beforeModel(transition) {
    const route = this;
    route.set('redirectUrl', transition.queryParams.redirect_url);
    return this._super(...arguments).then(function() {
      let anonymous = route.get('session.isAnonymous');
      let isProd = Env.environment === 'production';
      let url = route.get('router.url');
      const configuration = route.get('configuration');
      let hasQueryParams = !!Object.keys(transition.queryParams).length;
      let redirectCheck =
        configuration.REDIRECT_CHECK !== undefined
          ? configuration.REDIRECT_CHECK
          : Env.APP.REDIRECT_CHECK;

      let googleSignIn = url.indexOf('access_token') > 0; //if it has the access_token parameter

      if (
        anonymous &&
        ((!googleSignIn && isProd) || (redirectCheck && !hasQueryParams))
      ) {
        transition.abort();
        let islogouturl = window.localStorage.getItem('logouturl');
        const landingUrl =
          islogouturl || configuration.marketingSiteUrl || Env.marketingSiteUrl; //this is not an ember route, see nginx.conf

        Ember.Logger.debug('Navigator landing page:', landingUrl);
        window.location = landingUrl;
        if (islogouturl) {
          window.localStorage.removeItem('logouturl');
        }
      }
    });
  },

  afterModel() {
    const route = this;
    const anonymous = route.get('session.isAnonymous');
    const userId = route.get('session.userId');
    const updatedProfile = route.get('session.updatedProfile');

    route
      .get('tenantService')
      .getActiveTenantSetting()
      .then(function(tenantSettings) {
        if (
          tenantSettings &&
          tenantSettings.know_more_about_user_questions &&
          tenantSettings.know_more_about_user_questions.length
        ) {
          route.set('showKnowMoreAboutUser', true);
        }
        if (
          tenantSettings &&
          tenantSettings.ui_element_visibility_settings &&
          tenantSettings.ui_element_visibility_settings
            .enable_navigator_programs
        ) {
          route.set('enableNavigatorPrograms', true);
        }
      });

    if (!anonymous) {
      if (route.get('session.userData.isNew')) {
        route.transitionTo('sign-up-finish');
      } else {
        return route
          .get('profileService')
          .readUserProfile(userId)
          .then(function(userProfile) {
            const isStudent = userProfile.get('isStudent');
            const isTeacher = userProfile.get('isTeacher');
            const redirectUrl = route.get('redirectUrl');
            if (redirectUrl) {
              window.location.href = redirectUrl;
            } else if (isStudent) {
              if (
                !route.get('enableNavigatorPrograms') ||
                userProfile.info ||
                (updatedProfile && updatedProfile.info)
              ) {
                route.transitionTo('student-home');
              } else {
                route.transitionTo('sign-up-finish');
              }
            } else {
              if (isTeacher) {
                route.transitionTo('teacher-home');
              } else {
                route.transitionTo('library-search', {
                  queryParams: {
                    profileId: userId,
                    type: 'my-content'
                  }
                });
              }
            }
          });
      }
    }
  }
});
