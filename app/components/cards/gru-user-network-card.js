import Ember from 'ember';
/**
 * User Network card
 *
 * Component responsible of showing the user network information in cards, so that most useful information is summarized there.
 * @module
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'gru-user-network-card'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    unFollow: function() {
      var component = this;
      var user = component.get('user');
      component.set('isFollowing', false);
      component.sendAction('onUnFollowUser', user);
    },

    setFollow: function() {
      var component = this;
      var user = component.get('user');
      component.set('isFollowing', true);
      component.sendAction('onFollowUser', user);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {User} user
   */
  user: null,

  /**
   * @property {Number} counter of user followers
   */
  countFollowers: Ember.computed.alias('user.followers'),
  /**
   * @property {Array} list of followings
   */
  myFollowings: null,

  /**
   * @property {Boolean} check if the session user follow the user in the card
   */
  isFollowing: Ember.computed('user', function() {
    let user = this.get('user');
    return this.get('myFollowings').findBy('id', user.id);
  }),
  /**
   * @property {Boolean} check if the session user is the same user in the card
   */
  isMyProfile: Ember.computed('user', function() {
    let user = this.get('user');
    return user.id === this.get('session.userId');
  }),

  /**
   * @property {Boolean}
   * Check is an user is anonymous or not
   */
  isAnonymous: Ember.computed('user', function() {
    return this.get('session.userId') === 'anonymous';
  })
});
