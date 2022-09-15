import Ember from 'ember';

/**
 * Bookmark model
 *
 * @typedef {Object} Bookmark
 */
export default Ember.Object.extend({
  /**
   * @property {String} id - The bookmark id
   */
  id: null,

  /**
   * @property {String} title
   */
  title: null,

  /**
   * @property {String} content id
   */
  contentId: null,

  /**
   * @property {String} content type
   */
  contentType: null
});
