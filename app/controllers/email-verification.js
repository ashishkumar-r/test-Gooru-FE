import Ember from 'ember';
import Email from 'gooru-web/models/email-verification';
export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),
  /**
   * Maintains the session object.
   */
  session: Ember.inject.service('session'),
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // Properties
  /**
   * Token for Resend mail
   * @property {String}
   */
  accessToken: Ember.computed.alias('session.token-api3'),
  /**
   * Token from the update email verify flow
   * @property {String}
   */
  token: '',
  /**
   * @type {User} user
   */
  user: null,
  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,
  /**
   * @param {Boolean } isVerified - value used to check if email-verify updated or not
   */
  isVerified: false,
  /**
   * @param {Boolean } invalidMail - value used to check if email-address is valid or not
   */
  invalidMail: false,
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Resend mail triggered
     */
    resendMail: function() {
      const controller = this;
      const token = controller.get('accessToken');
      const user = controller.get('user');
      user.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          return Ember.RSVP.hash({
            mailVerify: controller
              .get('profileService')
              .sendMailVerify(user.get('email'), token)
          })
            .then(() => {
              controller.transitionToRoute('sign-up-register');
            })
            .catch(function(isValid) {
              if (isValid) {
                controller.set('invalidMail', true);
                setTimeout(() => controller.set('invalidMail', false), 5000);
              }
            });
        }
        controller.set('didValidate', 'true');
      });
    },
    /**
     * Redirected to Signin
     */
    userLogin: function() {
      this.transitionToRoute('login');
    }
  },
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Update email verification
   */
  updateEmailVerification(token) {
    const controller = this;
    const isLogin = controller.get('not_verified');
    const user = Email.create(Ember.getOwner(this).ownerInjection(), {
      email: null
    });
    if (isLogin) {
      controller.set('isAccess', false);
      controller.set('user', user);
    } else {
      controller
        .get('profileService')
        .updateMailVerify(token)
        .then(function() {
          controller.set('isVerified', true);
        })
        .catch(function() {
          controller.set('isAccess', true);
          controller.set('user', user);
        });
    }
  }
});
