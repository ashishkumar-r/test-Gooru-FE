import Ember from 'ember';
import BookmarkSerializer from 'gooru-web/serializers/content/bookmark';
import BookmarkAdapter from 'gooru-web/adapters/content/bookmark';

/**
 * @typedef {Object} BookmarkService
 */
export default Ember.Service.extend({
  /**
   * @property {BookmarkSerializer} bookmarkSerializer
   */
  bookmarkSerializer: null,

  /**
   * @property {BookmarkAdapter} bookmarkAdapter
   */
  bookmarkAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'bookmarkSerializer',
      BookmarkSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'bookmarkAdapter',
      BookmarkAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new bookmark
   *
   * @param bookmarkData object with the bookmark data
   * @returns {Promise}
   */
  createBookmark: function(bookmarkData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedBookmarkData = service
        .get('bookmarkSerializer')
        .serializeCreateBookmark(bookmarkData);
      service
        .get('bookmarkAdapter')
        .createBookmark({
          body: serializedBookmarkData
        })
        .then(
          function(responseData, textStatus, request) {
            let bookmarkId = request.getResponseHeader('location');
            bookmarkData.set('id', bookmarkId);
            resolve(bookmarkData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Bookmarks
   * @param resetPagination indicates if the pagination needs a reset
   * @param pagination - pagination values to list bookmarks
   * @returns {Promise}
   */
  fetchBookmarks: function(pagination, resetPagination = false) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('bookmarkAdapter')
        .fetchBookmarks(pagination, resetPagination)
        .then(
          response =>
            resolve(
              service
                .get('bookmarkSerializer')
                .normalizeFetchBookmarks(response)
            ),
          reject
        );
    });
  },

  /**
   * Deletes a bookmark
   * @param {String} bookmarkId
   * @returns {Promise|boolean} returns true if deleted
   */
  deleteBookmark: function(bookmarkId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('bookmarkAdapter')
        .deleteBookmark(bookmarkId)
        .then(resolve, reject);
    });
  }
});
