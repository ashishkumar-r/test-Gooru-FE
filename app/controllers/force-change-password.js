import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import ChangePasswordValidations from 'gooru-web/validations/force-change-password';

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

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    changePassword: function() {
      const controller = this;
      const profile = controller.get('profile');
      if (controller.get('didValidate') === false) {
        var password = Ember.$('.gru-input.password input').val();
        var confirmPassword = Ember.$('.gru-input.chPassword input').val();
        profile.set('password', password);
        profile.set('chPassword', confirmPassword);
      }

      profile.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          controller
            .get('profileService')
            .forceChangePassword(profile.password)
            .then(
              function() {
                controller.set('didValidate', true);
                var successMessage = controller
                  .get('i18n')
                  .t('change-password.change-success').string;
                controller.get('notifications').success(successMessage);
                const role = controller.get('session.role');
                Ember.run.later(() => {
                  if (role === 'teacher') {
                    controller.transitionToRoute('teacher-home');
                  } else {
                    controller.transitionToRoute('student-home');
                  }
                }, 3000);
              },
              function(error) {
                controller.get('notifications').error(error.message);
                Ember.Logger.error(error);
              }
            );
          profile.set('password', null);
          profile.set('chPassword', null);
          Ember.$('.gru-input.password input').val('');
          Ember.$('.gru-input.chPassword input').val('');
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
    var changePasswordProfile = Profile.extend(ChangePasswordValidations);
    var profile = changePasswordProfile.create(
      Ember.getOwner(this).ownerInjection(),
      {
        password: null,
        chPassword: null
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
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false
});
