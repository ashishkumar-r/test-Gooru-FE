import Ember from 'ember';
/**
 * Studnet Bookmarks Route
 *
 * @module
 * @augments Ember.Route
 */
export default Ember.Route.extend({

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {BookmarkService} Service to retrieve bookmark information
   */
  bookmarkService: Ember.inject.service('api-sdk/bookmark'),

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * @property {Number} number of items to load per page
   */
  PAGE_SIZE: 8,

  // -------------------------------------------------------------------------
  // Methods

  model: function() {
    let route = this;
    const pagination = {
      offset: 0,
      pageSize: this.get('PAGE_SIZE')
    };

    const bookmarksPromise = route
      .get('bookmarkService')
      .fetchBookmarks(pagination, true);

    return Ember.RSVP
      .hash({
        bookmarks: bookmarksPromise,
        pagination
      })
      .then(function(hash) {
        const bookmarks = hash.bookmarks;
        const pagination = hash.pagination;
        return {
          bookmarks,
          pagination
        };
      });
  },

  setupController: function(controller, model) {
    controller.set('bookmarks', model.bookmarks);
    controller.set('CURRENT_ITERATION_SIZE', model.bookmarks.length);
    controller.set('pagination', model.pagination);
    controller.set('toggleState', false);
  }
});
