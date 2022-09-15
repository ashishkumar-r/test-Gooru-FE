import Ember from 'ember';
import Env from 'gooru-web/config/environment';
import { isSwitchedLearner } from 'gooru-web/utils/utils';

/**
 * Initialize session service
 */
export function initialize(application) {
  const sessionService = application.lookup('service:session');
  const quizzesConfigurationService = application.lookup(
    'service:quizzes/configuration'
  );

  sessionService.reopen({
    /**
     * @property {string} Session token
     */
    token: Ember.computed.alias('data.authenticated.token'),

    // TODO This property should be removed once API 2.0 is not needed anymore
    /**
     * @property {string} Session Token coming from API 3.0
     */
    'token-api3': Ember.computed.alias('data.authenticated.token-api3'),

    /**
     * @property {string} Session user data
     */
    userData: Ember.computed.alias('data.authenticated.user'),

    /**
     * @property {string} Session user data
     */
    cdnUrls: Ember.computed.alias('data.authenticated.cdnUrls'),

    /**
     * @property {string} Session user id
     */
    userId: Ember.computed('userData', function() {
      return this.get('userData') ? this.get('userData').gooruUId : undefined;
    }),

    /**
     * @property {string} Session user id
     */
    role: Ember.computed('userData', function() {
      let isStudent = isSwitchedLearner(this.get('userId'));
      if (isStudent) {
        return 'student';
      }
      return this.get('userData.role');
    }),

    isGuest: Ember.computed.alias('data.authenticated.isGuest'),

    /**
     * @property {string} Session user id
     */
    enabledVideoConference: Ember.computed.alias(
      'data.authenticated.tenant.settings.enabledVideoConference'
    ),

    /**
     * @property {boolean} Indicates if the session is for an anonymous user
     */
    isAnonymous: Ember.computed('data.authenticated', function() {
      return this.get('data.authenticated').isAnonymous;
    }),

    /**
     * @property {string} session tenant id
     */
    tenantId: Ember.computed.alias('data.authenticated.tenant.tenantId'),

    /**
     * Property used to identify client is gooru or not
     * @return {Boolean}
     */
    isGooruClientId: Ember.computed('tenantId', function() {
      let clientId = Env['API-3.0'].clientId;
      let tenantId = this.get('tenantId');
      return tenantId ? clientId === tenantId : true;
    }),

    isDemoTenant: false,

    /**
     * @property {string} session partner id
     */
    partnerId: Ember.computed.alias('data.authenticated.partnerId'),

    /**
     * @property {Object} tenantSetting hold the tenant settings details
     */
    tenantSetting: Ember.computed.alias('data.authenticated.tenant.settings'),

    /**
     * @property {string} session tenant image url
     */
    tenantLogoUrl: Ember.computed.alias('data.authenticated.tenant.imageUrl'),

    /**
     * @property {string} session tenant name
     */
    tenantName: Ember.computed.alias('data.authenticated.tenant.tenantName'),

    /**
     * @property {string} session tenant short name
     */
    tenantShortName: Ember.computed.alias(
      'data.authenticated.tenant.tenantShortName'
    ),

    isInstructionalCoache: Ember.computed('data.authenticated', function() {
      if (
        this.get('data.authenticated') &&
        this.get('data.authenticated.permissions')
      ) {
        return this.get('data.authenticated.permissions').includes(
          'VIEW_TEACHER_CLASSES'
        );
      }
    }),

    /**
     * This method authenticates using the default authenticator for an anonymous user
     * @returns {*|Ember.RSVP.Promise}
     */
    authenticateAsAnonymous: function(nonce) {
      return this.authenticate('authenticator:auth-api-3', {
        isAnonymous: true,
        nonce: nonce
      });
    },

    /**
     * This method authenticates using the default authenticator for an anonymous user
     * @returns {*|Ember.RSVP.Promise}
     */
    authenticateAsAnonymousWithData: function(data) {
      return this.authenticate('authenticator:auth-api-3', {
        hasUserData: true,
        user: data
      });
    },

    /**
     * Checks for changes at token-api3
     * @observer
     */
    tokenObserver: Ember.observer('token-api3', function() {
      if (quizzesConfigurationService) {
        quizzesConfigurationService.setToken(this.get('token-api3'));
        quizzesConfigurationService.setCdnUrl(this.get('cdnUrls.content'));
      }
    })
  });
}

export default {
  name: 'gooru-session-service',
  after: 'ember-simple-auth',
  initialize: initialize
};
