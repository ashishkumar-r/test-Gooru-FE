import Ember from 'ember';
import Profile from 'gooru-web/models/profile/profile';
import EditProfileValidations from 'gooru-web/validations/edit-profile';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  queryParams: {
    classId: {
      refreshModel: true
    }
  },

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @dependency {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  session: Ember.inject.service('session'),

  /**
   * Current user id
   */
  currentLoginId: Ember.computed.alias('session.userId'),
  // -------------------------------------------------------------------------
  // Methods

  beforeModel: function() {
    // TODO: authenticate session with ember-simple-auth, if not send to log in
  },

  /**
   * Get model for the controller
   */
  model: function(params) {
    let route = this;
    let userId = params.userId;
    if (userId) {
      let isUsername = !/-.*-/.exec(userId);
      let profilePromise = isUsername
        ? route.get('profileService').readUserProfileByUsername(params.userId)
        : route.get('profileService').readUserProfile(params.userId);

      let loggedUserId = route.get('currentLoginId');
      const loginUserProfile =
        loggedUserId !== 'anonymous'
          ? route
            .get('profileService')
            .readUserProfile(route.get('currentLoginId'))
          : null;
      const userPreference = route.get('profileService').getProfilePreference();
      return profilePromise.then(function(profile) {
        var EditProfileValidation = Profile.extend(EditProfileValidations);
        var editProfile = EditProfileValidation.create(
          Ember.getOwner(route).ownerInjection()
        );
        editProfile.merge(profile, profile.modelProperties());
        return Ember.RSVP.hash({
          profile: editProfile,
          loginUserProfile: loginUserProfile,
          userPreference: userPreference
        });
      });
    }
    return Ember.RSVP.hash({
      profile: null,
      loginUserProfile: null,
      userPreference: null
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('profile', model.profile);
    controller.set('steps', model.tourSteps);
    controller.set('userPreference', model.userPreference);
    controller.set('currentLoginUser', model.loginUserProfile);
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Triggered when a class menu item is selected
     * @param {string} item
     */
    selectMenuItem: function(item) {
      const route = this;
      const controller = route.get('controller');
      const currentMenuItem = controller.get('menuItem');
      controller.selectMenuItem(item);

      if (currentMenuItem !== item) {
        if (item === 'content') {
          route.transitionTo(`profile.${item}.courses`);
        } else if (item === 'network') {
          route.transitionTo(`profile.${item}.following`);
        } else {
          route.transitionTo(`profile.${item}`);
        }
      }
    }
  }
});
