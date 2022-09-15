import Ember from 'ember';
import { DEFAULT_SEARCH_PAGE_SIZE } from 'gooru-web/config/config';

/**
 * Adapter to support the Bookmark CRUD operations in the API 3.0
 *
 * @typedef {Object} BookmarkAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v2/bookmarks',

  /**
   * Posts a new bookmark
   *
   * @param data bookmark data to be sent in the request body
   * @returns {Promise}
   */
  createBookmark: function(data) {
    const adapter = this;
    const url = this.get('namespace');
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Fetches bookmarks
   * @param resetPagination indicates if the pagination needs a reset
   * @param pagination - pagination values to list bookmarks
   * @returns {Promise}
   */
  fetchBookmarks: function(pagination = {}, resetPagination = false) {
    const adapter = this;
    const url = adapter.get('namespace');
    const offset =
      !pagination.offset || resetPagination ? 0 : pagination.offset;
    const pageSize = pagination.pageSize || DEFAULT_SEARCH_PAGE_SIZE;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: {
        offset,
        limit: pageSize
      }
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Deletes a bookmark by id
   *
   * @param bookmarkId bookmark id to be sent
   * @returns {Promise}
   */
  deleteBookmark: function(bookmarkId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/${bookmarkId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.defineHeaders(),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
