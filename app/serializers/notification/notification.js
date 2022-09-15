import Ember from 'ember';
import NotificationModel from 'gooru-web/models/notification/notification';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

/**
 * Serializer to support the Notification CRUD operations for API 3.0
 *
 * @typedef {Object} NotificationSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Normalize the notifications endpoint response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Notification[]}
   */
  normalizeNotifications: function(payload) {
    var result = [];
    const serializer = this;
    const notifications = payload.notifications;
    if (Ember.isArray(notifications)) {
      result = notifications.map(notification =>
        serializer.normalizeNotification(notification)
      );
    }
    return result;
  },

  /**
   * Normalize a notification
   * @param {*} notificationData
   * @returns {Notification}
   */
  normalizeNotification: function(notificationData) {
    const serializer = this;
    const actors = serializer.normalizeActors(notificationData.actors || []);
    return NotificationModel.create(Ember.getOwner(this).ownerInjection(), {
      id: notificationData.id,
      status: notificationData.status,
      createdAt: notificationData.created_at,
      updatedDate: notificationData.updated_at,
      notificationEvent: notificationData.notification_event,
      template: notificationData.template,
      actors,
      object: {
        objectId: notificationData.object.content_id,
        objectName: notificationData.object.display_string,
        objectType: notificationData.object.content_type
      }
    });
  },

  /**
   *
   * @param ActorsData
   * @returns {Array}
   */
  normalizeActors: function(actorsData) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath

    return actorsData.map(function(actorData) {
      const thumbnailUrl = actorData.thumbnail
        ? basePath + actorData.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;

      return {
        id: actorData.user_id,
        username: actorData.display_name,
        avatarUrl: thumbnailUrl
      };
    });
  }
});
