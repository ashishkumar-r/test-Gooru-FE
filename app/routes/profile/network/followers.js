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
    this.setTitle('Followers', null, true);
    var myFollowings = Ember.A([]);
    let loggedUserId = this.get('session.userId');
    if (profile.get('id') !== loggedUserId && loggedUserId !== 'anonymous') {
      myFollowings = this.get('profileService').readFollowing(
        this.get('session.userId')
      );
    }

    //followers
    var followers = this.get('profileService').readFollowers(profile.get('id'));

    return Ember.RSVP.hash({
      followers: followers,
      myFollowings: myFollowings
    });
  },

  setupController: function(controller, model) {
    controller.set('followers', model.followers);
    controller.set('myFollowings', model.myFollowings);
  }
});
