import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  profileController: Ember.inject.controller('profile'),

  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    unFollowUser: function(user) {
      var controller = this;
      var userId = user.id;
      var countFollowings = controller.get('countFollowings');

      controller
        .get('profileService')
        .unfollowUserProfile(userId)
        .then(function() {
          if (
            controller.get('profileController.profile.id') ===
            controller.get('session.userId')
          ) {
            controller.get('followings').removeObject(user);
            controller.set('countFollowings', countFollowings - 1);
            controller.set('isFollowing', false);
          }
          user.set('followers', user.get('followers') - 1);
          user.set('isFollowing', false);
        });
    },
    followUser: function(user) {
      var controller = this;
      var userId = user.id;
      var countFollowings = controller.get('countFollowings');

      controller
        .get('profileService')
        .followUserProfile(userId)
        .then(function() {
          if (
            controller.get('profileController.profile.id') ===
            controller.get('session.userId')
          ) {
            controller.set('countFollowings', countFollowings + 1);
          }
          user.set('followers', user.get('followers') + 1);
          user.set('isFollowing', true);
        });
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {User[]} followings
   */
  followings: null,

  /**
   * @property {boolean} isMyProfile
   */
  isMyProfile: Ember.computed.alias('profileController.isMyProfile'),

  /**
   * @property {Number} counter of profile followings
   */
  countFollowings: Ember.computed.alias('profileController.profile.followings'),

  /**
   * @property {boolean} isFollowing
   */
  isFollowing: Ember.computed.alias('profileController.profile.isFollowing')
});
