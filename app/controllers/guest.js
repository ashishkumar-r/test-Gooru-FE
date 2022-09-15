import Ember from 'ember';
import { ROLES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Controller.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['sessionEnds', 'nonce'],

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

  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    authenticate: function(role, redirection = null) {
      const controller = this;
      let userAccount;
      controller.set('session.isDemoTenant', true);
      if (role === ROLES.TEACHER) {
        userAccount = atob(controller.get('teacherAccount'));
      } else {
        userAccount = atob(controller.get('studentAccount'));
      }
      let userInfo = userAccount.split(':');
      let credentials = Ember.Object.create({
        username: userInfo[0],
        password: userInfo[1]
      });
      const errorMessage = controller
        .get('i18n')
        .t('common.errors.sign-in-credentials-not-valid').string;

      // TODO needs to be revisited, this is a quick fix
      controller
        .get('sessionService')
        .authorize()
        .then(function() {
          controller
            .get('sessionService')
            .signInWithUser(credentials, true)
            .then(
              function() {
                if (redirection) {
                  window.location.href = window.location.origin + redirection;
                } else {
                  controller.send('signIn');
                }
              },
              function() {
                controller.get('notifications').warning(errorMessage);
                let anonymousSessionData = controller.get(
                  'anonymousSessionData'
                );
                // Authenticate as anonymous if it fails to mantain session
                controller
                  .get('session')
                  .authenticateAsAnonymousWithData(anonymousSessionData);
              }
            );
        });
    },

    adminLogin() {
      window.open(this.get('adminRootPath'));
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    controller.set('didValidate', false);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {StudentUser} user
   */
  studentAccount: Ember.computed.alias('configuration.GUEST_STUDENT_ACCOUNT'),

  /**
   * @type {TeacherUser} user
   */
  teacherAccount: Ember.computed.alias('configuration.GUEST_TEACHER_ACCOUNT'),

  /**
   * Query param
   * @property {Boolean} sessionEnds
   */
  sessionEnds: false,

  /**
   * Maintains the state of anonymous session data.
   * @type {Session}
   */
  anonymousSessionData: null,

  isGuestDemoTenant: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.isGuestDemoTenant'
  )
});
