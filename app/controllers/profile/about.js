import Ember from 'ember';
import changePasswordValidations from 'gooru-web/validations/change-password';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  parentController: Ember.inject.controller('profile'),

  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  cprofile: function() {
    let Profile = Ember.Object.extend({
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      }),
      extendedProfile = Profile.extend(changePasswordValidations);
    var profile = extendedProfile.create(
      Ember.getOwner(this).ownerInjection(),
      {
        oldPassword: null,
        newPassword: null,
        confirmPassword: null
      }
    );

    return profile;
  }.property(),
  // -------------------------------------------------------------------------
  // Properties
  showChangePassFlag: false,

  didValidate: false,

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  /**
   * A link to the parent profile controller
   * @see controllers/profile.js
   * @property {Class}
   */
  profile: Ember.computed.reads('parentController.profile'),

  isShowImpersonate: Ember.computed(function() {
    let impersonate;
    if (window.frameElement) {
      impersonate = window.parent.impersonate;
    }
    return impersonate;
  }),

  /**
   * A link to the computed property isMyProfile in profile controller
   * @see controllers/profile.js
   * @property {isMyProfile}
   */
  isMyProfile: Ember.computed.reads('parentController.isMyProfile'),

  isGuest: Ember.computed.alias('session.isGuest'),

  isUserDeletionRequest: Ember.computed('profile', function() {
    return !!this.get('profile.deletionTriggerDate');
  }),

  isShowError: false,

  isErrorMsg: null,

  actions: {
    showChangePass: function(show) {
      this.resetController();
      if (show) {
        this.set('showChangePassFlag', true);
      } else {
        this.set('showChangePassFlag', false);
      }
    },

    onClosePullUp: function() {
      const component = this;
      component.resetController();
      const profile = component.get('cprofile');
      Ember.$('.gru-input.oldPassword input').val('');
      Ember.$('.gru-input.newPassword input').val('');
      Ember.$('.gru-input.confirmPassword input').val('');
      profile.set('oldPassword', null);
      profile.set('newPassword', null);
      profile.set('confirmPassword', null);
      component.set('showChangePassFlag', false);
      component.set('isShowError', false);
      component.set('isErrorMsg', null);
    },

    onTyping() {
      this.set('isShowError', false);
      this.set('isErrorMsg', null);
    },

    changePassword: function() {
      const component = this;
      const profile = component.get('cprofile');
      if (component.get('didValidate') === false) {
        var password = Ember.$('.gru-input.oldPassword input').val(),
          newPassword = Ember.$('.gru-input.newPassword input').val(),
          confirmPassword = Ember.$('.gru-input.confirmPassword input').val();

        profile.set('oldPassword', password);
        profile.set('newPassword', newPassword);
        profile.set('confirmPassword', confirmPassword);
      }

      profile.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          component.set('isShowError', false);
          component
            .get('profileService')
            .changePassword(
              profile.get('oldPassword'),
              profile.get('newPassword')
            )
            .then(
              function() {
                component.set('didValidate', true);
                var successMessage = component
                  .get('i18n')
                  .t('change-password.change-success').string;
                component.get('notifications').success(successMessage);
                component.set('showChangePassFlag', false);
                Ember.$('.gru-input.oldPassword input').val('');
                Ember.$('.gru-input.newPassword input').val('');
                Ember.$('.gru-input.confirmPassword input').val('');
                profile.set('oldPassword', null);
                profile.set('newPassword', null);
                profile.set('confirmPassword', null);
              },
              function(error) {
                component.set('isShowError', true);
                component.set('isErrorMsg', error.message);
                Ember.Logger.error(error);
              }
            );
        }
      });
    },

    onDelete: function() {
      this.set('showDelateConformationPopup', true);
    },

    onCancel: function() {
      this.set('showDelateConformationPopup', false);
    },

    onConfirm: function() {
      const component = this;
      component
        .get('profileService')
        .deleteUserProfile()
        .then(function() {
          component
            .get('profileService')
            .readUserProfile(component.get('profile.id'))
            .then(function(updatedProfile) {
              component.set('showDelateConformationPopup', false);
              component.set('profile', updatedProfile);
            });
        });
    }
  },

  resetController: function() {
    const component = this;
    const profile = component.get('cprofile');
    profile.set('oldPassword', null);
    profile.set('newPassword', null);
    profile.set('confirmPassword', null);
    component.set('cprofile', profile);
    component.set('didValidate', false);
  },

  /**
   * Method to use get data privacy settings
   */
  getDataPrivacySettings() {
    this.get('tenantService')
      .getActiveTenantSetting()
      .then(data => {
        this.set(
          'isPrivacyDataSettingsEnable',
          data.enable_learners_data_visibilty_pref === 'on'
        );
      });
  }
});
