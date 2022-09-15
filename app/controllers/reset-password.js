import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import ResetPasswordValidations from 'gooru-web/validations/reset-password';
import Env from 'gooru-web/config/environment';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

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
    resetPassword: function() {
      const controller = this;
      const profile = controller.get('profile');
      const token = controller.get('token');

      if (controller.get('didValidate') === false) {
        var password = Ember.$('.gru-input.password input').val();
        var confirmPassword = Ember.$('.gru-input.rePassword input').val();
        profile.set('password', password);
        profile.set('rePassword', confirmPassword);
      }

      profile.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          controller
            .get('profileService')
            .resetPassword(profile.get('password'), token)
            .then(
              function() {
                controller.set('didValidate', true);
                controller.transitionToRoute('sign-in');
              },
              function(error) {
                var errorMessage = controller
                  .get('i18n')
                  .t('common.errors.reset-password-error').string;
                controller.get('notifications').error(errorMessage);
                Ember.Logger.error(error);
              }
            );
        }
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var resetPasswordProfile = Profile.extend(ResetPasswordValidations);
    var profile = resetPasswordProfile.create(
      Ember.getOwner(this).ownerInjection(),
      {
        password: null,
        rePassword: null
      }
    );

    controller.set('profile', profile);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Profile} profile
   */
  profile: null,

  /**
   * Token from the forgot password flow
   * @property {String}
   */
  token: null,

  /**
   * User id from the forgot password flow
   * @property {String}
   */
  userId: null,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * Marketing site url
   * @property {string}
   */
  marketingSiteUrl: Ember.computed(function() {
    return Env.marketingSiteUrl;
  })
});
