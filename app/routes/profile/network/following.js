import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods

  model: function() {
    const profile = this.modelFor('profile').profile;
    this.setTitle('Following', null, true);
    var myFollowings;
    let loggedUserId = this.get('session.userId');
    if (profile.get('id') !== loggedUserId && loggedUserId !== 'anonymous') {
      myFollowings = this.get('profileService').readFollowing(
        this.get('session.userId')
      );
    }
    //followings
    var followings = this.get('profileService').readFollowing(
      profile.get('id')
    );
    return Ember.RSVP.hash({
      followings: followings,
      myFollowings: myFollowings
    });
  },

  setupController: function(controller, model) {
    controller.set('followings', model.followings);
    if (model.myFollowings) {
      controller.set('myFollowings', model.myFollowings);
    } else {
      controller.set('myFollowings', model.followings);
    }
  }
});
