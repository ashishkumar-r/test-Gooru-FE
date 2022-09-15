import Ember from 'ember';
import NotificationSerializer from 'gooru-web/serializers/notification/notification';
import NotificationAdapter from 'gooru-web/adapters/notification/notification';

/**
 * @typedef {Object} ClassService
 */
export default Ember.Service.extend({
  notificationSerializer: null,

  notificationAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'notificationSerializer',
      NotificationSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'notificationAdapter',
      NotificationAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Fetch notifications
   *
   * @param pagination
   * @param resetPagination indicates if the pagination needs a reset
   * @returns {Promise}
   */
  fetchNotifications: function(pagination, resetPagination = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('notificationAdapter')
        .fetchNotifications(pagination, resetPagination)
        .then(function(response) {
          resolve(
            service
              .get('notificationSerializer')
              .normalizeNotifications(response)
          );
        }, reject);
    });
  }
});
