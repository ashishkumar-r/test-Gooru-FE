import Ember from 'ember';
import { DEFAULT_NOTIFICATION_PAGE_SIZE } from 'gooru-web/config/config';

/**
 * Adapter to support the Notification CRUD operations in the API 3.0
 *
 * @typedef {Object} LessonAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus/v2/notifications',

  /**
   * Fetches notifications
   * @param resetPagination indicates if the pagination needs a reset
   * @param pagination - pagination values to list bookmarks
   * @returns {Promise}
   */
  fetchNotifications: function(pagination = {}, resetPagination = false) {
    const adapter = this;
    const url = this.get('namespace');
    const offset =
      !pagination.offset || resetPagination ? 0 : pagination.offset;
    const pageSize = pagination.pageSize || DEFAULT_NOTIFICATION_PAGE_SIZE;
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

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
