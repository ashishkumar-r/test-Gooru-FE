import DS from 'ember-data';

/**
 * Model to represent the Profiles objects with the User information
 *
 * @typedef {Object} Profile
 */
export default DS.Model.extend({
  /**
   * @property {string} profileId
   */
  profileId: DS.attr('string'),

  /**
   * @property {string} aboutMe
   */
  aboutMe: DS.attr('string'),

  /**
   * @property {Object} followersList - List of all the id's of followers that the user has
   */
  followersList: DS.attr(),

  /**
   * @property {Object} followersDetails - Details of all the followers that the user has
   */
  followersDetails: DS.attr(),

  /**
   * @property {Number} followers - Number of followers that the user has
   * TODO: Change this to a computed property that reads the length of followers in followersDetails
   */
  followers: DS.attr('number'),

  /**
   * @property {Object} followingsList - List of all the id's of followings that the user has
   */
  followingsList: DS.attr(),

  /**
   * @property {Object} followingsDetails - Details of all the followings that the user has
   */
  followingsDetails: DS.attr(),

  /**
   * @property {Number} followings - Number of people that the user is following
   * TODO: Change this to a computed property that reads the length of followings in followersDetails
   */
  followings: DS.attr('number'),

  /**
   * @property {User} user
   */
  user: DS.belongsTo('user/user')
});
