import Ember from 'ember';

/**
 * Independent Learning Bookmarks controller
 *
 * Controller responsible of the logic for the Student independent bookmarks
 */

export default Ember.Controller.extend({

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Session service
   */
  session: Ember.inject.service('session'),

  /**
   * @type {BookmarkService} Service to retrieve bookmark information
   */
  bookmarkService: Ember.inject.service('api-sdk/bookmark'),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * show more bookmark results
     */
    showMoreResults: function() {
      this.showMoreResults();
    },

    /**
     * Remove a bookmark from a list of bookmarks
     */
    removeBookmark: function(bookmark) {
      this.get('bookmarks').removeObject(bookmark);
    },
    /**
     * Triggered when the expand/collapse arrows are selected.
     */
    togglePanel: function() {
      this.set('isExpanded', !this.get('isExpanded'));
    }
  },

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * @property {Number} number of items to load per page
   */
  PAGE_SIZE: 8,
  /**
   * @property {Number} number of ]items loaded in this iteration
   */
  CURRENT_ITERATION_SIZE: 0,
  /**
   * @property {Number} number of items to show in a section
   */
  ROW_SIZE: 4,
  /**
   * @property {Number} number of offset to get items
   */
  OFFSET: 0,
  /*
   * @property {Array[]} - bookmarks
   */
  bookmarks: null,

  /**
   * @property {*}
   */
  pagination: null,

  isExpanded: false,

  isShowMoreVisible: true,

  /**
   * show more bookmark results
   */
  showMoreResults: function() {
    const controller = this;
    const pagination = this.get('pagination');

    pagination.offset = pagination.offset + pagination.pageSize;
    pagination.pageSize = this.get('PAGE_SIZE');
    this.set('pagination', pagination);
    controller
      .get('bookmarkService')
      .fetchBookmarks(pagination, false)
      .then(function(bookmarkResults) {
        controller.set('CURRENT_ITERATION_SIZE', bookmarkResults.length);
        controller.get('bookmarks').pushObjects(bookmarkResults);
      });
  },

  currentIterationObserver: Ember.observer('CURRENT_ITERATION_SIZE', function() {
    this.set('isShowMoreVisible', this.get('CURRENT_ITERATION_SIZE') >= this.get('PAGE_SIZE'));
  }),

  showMoreToggle: Ember.computed('bookmarks', function() {
    return (
      this.get('bookmarks.length') >= this.get('ROW_SIZE')
    );
  })
});
