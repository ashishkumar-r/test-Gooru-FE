import Ember from 'ember';

/**
 * Network model with the information about followers and following
 *
 * @typedef {Object} NetworkModel
 */
export default Ember.Object.extend({
  /**
   * @property {Array} followers - The list of followers
   */
  followers: [],

  /**
   * @property {Array} followings - The list of followings
   */
  followings: [],

  /**
   * @property {number} followerCount - The number of followers
   */
  followerCount: Ember.computed('followers', function() {
    return Ember.isArray(this.get('followers'))
      ? this.get('followers').length
      : 0;
  }),

  /**
   * @property {number} followingCount - The number of followings
   */
  followingCount: Ember.computed('followings', function() {
    return Ember.isArray(this.get('followings'))
      ? this.get('followings').length
      : 0;
  }),

  /**
   * @property {Array} details - The details of the followers/followings based on the details flag passed to the endpoint
   */
  details: []
});
