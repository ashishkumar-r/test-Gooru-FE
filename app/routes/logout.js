import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import Env from 'gooru-web/config/environment';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

export default Ember.Route.extend(PrivateRouteMixin, {
  /**
   * @property {Service} session
   */
  session: Ember.inject.service(),

  /**
   * @property {TenantService}
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  tenantRedirectURL: 'sign-in',

  queryParams: {
    isGuestAccount: {},
    redirectURL: {},
    isConfirmProfile: {}
  },

  actions: {
    navigateLogout() {
      window.location.replace(this.tenantRedirectURL);
    }
  },

  /**
   * Authentication (api-sdk/authentication) service.
   * @property {AuthenticationService} authService
   * @readOnly
   */
  authenticationService: Ember.inject.service('api-sdk/authentication'),

  defaultMarketingSiteUrl: Ember.computed(function() {
    return `${window.location.protocol}//${window.location.host}${Env.marketingSiteUrl}`;
  }),

  beforeModel: function(transition) {
    this._super(...arguments);
    const router = this;
    const userId = router.get('session.userId');
    router
      .get('authenticationService')
      .signOut()
      .then(resp => {
        const isProd = Env.environment === 'production';
        let redirectUrl = null;
        redirectUrl = EndPointsConfig.getMarketingsiteURL();
        window.localStorage.removeItem(`${userId}_search_filter`);
        router.get('tenantService').removeStoredTenantSetting();
        if (transition.queryParams.isGuestAccount === 'true') {
          router.get('session').invalidate();
          window.location.replace('guest');
        } else {
          if (resp && resp.default === false) {
            $('.logout-container').css('display', 'flex');
            $('.navbar-default').css('display', 'none');
            this.tenantRedirectURL = resp.login_url;
            var timer = window.localStorage.getItem('notificationtimer');
            if (timer) {
              clearInterval(timer);
              window.localStorage.removeItem('logouturl');
            }
            window.localStorage.setItem('logouturl', this.tenantRedirectURL);
          } else {
            if (transition.queryParams.isConfirmProfile) {
              const url = window.btoa(transition.queryParams.redirectURL);
              let login = `login?redirectURL=${url}&isConfirmProfile=true`;
              window.location.replace(login);
            } else if (isProd && redirectUrl) {
              router.get('session').invalidate();
              window.location.replace(redirectUrl);
            } else {
              router.get('session').invalidate();
              window.location.replace('login');
            }
          }
        }
      });
  }
});
